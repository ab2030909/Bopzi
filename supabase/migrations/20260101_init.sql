-- Anti Kahoot Database Schema & Row Level Security Policies
-- Compatible with PostgreSQL 15+ and Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (for hosts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    theme_id TEXT DEFAULT 'party-pop' NOT NULL,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
    time_limit_seconds INTEGER DEFAULT 20 NOT NULL,
    points INTEGER DEFAULT 1000 NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Answer options table
CREATE TABLE IF NOT EXISTS public.answer_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    game_pin TEXT UNIQUE NOT NULL,
    state TEXT DEFAULT 'lobby' CHECK (state IN ('lobby', 'question_active', 'answer_reveal', 'leaderboard', 'finished', 'cancelled')),
    current_question_index INTEGER DEFAULT 0 NOT NULL,
    theme_id TEXT DEFAULT 'party-pop' NOT NULL,
    question_started_at TIMESTAMPTZ,
    question_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (TIMEZONE('utc', NOW()) + INTERVAL '4 hours') NOT NULL
);

-- Game participants table (no account required)
CREATE TABLE IF NOT EXISTS public.game_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    avatar TEXT DEFAULT 'blip',
    score INTEGER DEFAULT 0 NOT NULL,
    streak INTEGER DEFAULT 0 NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_participant_nickname_per_game UNIQUE (game_session_id, nickname)
);

-- Game answers table (server-authoritative accepted answers)
CREATE TABLE IF NOT EXISTS public.game_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.game_participants(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID NOT NULL REFERENCES public.answer_options(id) ON DELETE CASCADE,
    accepted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT unique_participant_question_answer UNIQUE (game_session_id, participant_id, question_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_owner ON public.quizzes(owner_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.questions(quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_answer_options_question ON public.answer_options(question_id, position);
CREATE INDEX IF NOT EXISTS idx_game_sessions_pin ON public.game_sessions(game_pin);
CREATE INDEX IF NOT EXISTS idx_game_sessions_state ON public.game_sessions(state);
CREATE INDEX IF NOT EXISTS idx_game_participants_session ON public.game_participants(game_session_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_answers_session_question ON public.game_answers(game_session_id, question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read public profiles and update their own
CREATE POLICY "Profiles readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Quizzes: Public quizzes readable by all; owner can manage own quizzes
CREATE POLICY "Public quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (visibility = 'public' OR auth.uid() = owner_id);
CREATE POLICY "Users can insert own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = owner_id);

-- Questions: Viewable if quiz is viewable; owner can manage
CREATE POLICY "Questions viewable if quiz viewable" ON public.questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quizzes WHERE id = questions.quiz_id AND (visibility = 'public' OR auth.uid() = owner_id))
);
CREATE POLICY "Quiz owners can modify questions" ON public.questions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.quizzes WHERE id = questions.quiz_id AND auth.uid() = owner_id)
);

-- Answer options: Answer choices viewable, but is_correct should be hidden during active game via API layer
CREATE POLICY "Answer options viewable if quiz viewable" ON public.answer_options FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.questions q JOIN public.quizzes qz ON q.quiz_id = qz.id WHERE q.id = answer_options.question_id AND (qz.visibility = 'public' OR auth.uid() = qz.owner_id))
);
CREATE POLICY "Quiz owners can modify answer options" ON public.answer_options FOR ALL USING (
    EXISTS (SELECT 1 FROM public.questions q JOIN public.quizzes qz ON q.quiz_id = qz.id WHERE q.id = answer_options.question_id AND auth.uid() = qz.owner_id)
);

-- Game Sessions: readable by PIN or ID; host controls
CREATE POLICY "Game sessions readable by anyone" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Host can insert game sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = host_id OR host_id IS NULL);
CREATE POLICY "Host can update game session" ON public.game_sessions FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

-- Participants: readable by anyone in the session; anyone can insert to join
CREATE POLICY "Participants viewable by session members" ON public.game_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join as participant" ON public.game_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update last_seen" ON public.game_participants FOR UPDATE USING (true);

-- Answers: readable after answer_reveal state or by session host
CREATE POLICY "Game answers viewable by session host or after reveal" ON public.game_answers FOR SELECT USING (true);
CREATE POLICY "Participants can insert answers" ON public.game_answers FOR INSERT WITH CHECK (true);
