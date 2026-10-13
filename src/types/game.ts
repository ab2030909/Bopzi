import { ThemeId } from './theme';
import { ClientQuestion, Question } from './quiz';

export type GameState =
  | 'lobby'
  | 'question_active'
  | 'answer_reveal'
  | 'leaderboard'
  | 'finished'
  | 'cancelled';

export interface Participant {
  id: string;
  game_session_id: string;
  nickname: string;
  avatar: string; // e.g. 'blip' | 'pixel-bot' | 'astro-sprout' | 'aegis' | 'spark' | 'star'
  score: number;
  streak: number;
  last_question_correct?: boolean;
  last_points_awarded?: number;
  has_answered?: boolean;
  joined_at: string;
  last_seen_at: string;
}

export interface GameAnswer {
  id: string;
  game_session_id: string;
  participant_id: string;
  question_id: string;
  selected_option_id: string;
  accepted_at: string;
  is_correct: boolean;
  points_awarded: number;
}

export interface LeaderboardEntry {
  participant_id: string;
  nickname: string;
  avatar: string;
  score: number;
  rank: number;
  streak: number;
  points_gained: number;
  is_correct: boolean;
}

export interface AnswerDistribution {
  option_id: string;
  count: number;
  percentage: number;
  is_correct: boolean;
}

export interface GameSession {
  id: string;
  quiz_id: string;
  quiz_title: string;
  host_id: string | null;
  game_pin: string;
  state: GameState;
  current_question_index: number;
  total_questions: number;
  theme_id: ThemeId;
  question_started_at: string | null;
  question_deadline: string | null;
  time_remaining_seconds?: number;
  created_at: string;
  expires_at: string;
}

// Client View Models
export interface HostGameView {
  session: GameSession;
  participants: Participant[];
  currentQuestion?: Question; // Host sees full question including answers & correctness
  distribution?: AnswerDistribution[];
  leaderboard?: LeaderboardEntry[];
  totalAnswersCount: number;
}

export interface PlayerGameView {
  session: {
    id: string;
    game_pin: string;
    state: GameState;
    current_question_index: number;
    total_questions: number;
    theme_id: ThemeId;
    quiz_title: string;
    quiz_description?: string;
    quiz_cover_image?: string;
    question_deadline: string | null;
  };
  me: Participant;
  currentQuestion?: ClientQuestion; // No correct answer flags during active question!
  hasAnswered: boolean;
  selectedOptionId?: string;
  lastAnswerResult?: {
    is_correct: boolean;
    points_awarded: number;
    correct_option_id: string;
    rank: number;
    total_score: number;
  };
  leaderboard?: LeaderboardEntry[];
  podium?: LeaderboardEntry[];
}
