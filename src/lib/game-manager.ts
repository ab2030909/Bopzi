import { GameSession, GameState, Participant, GameAnswer, HostGameView, PlayerGameView, LeaderboardEntry, AnswerDistribution } from '@/types/game';
import { Quiz, Question, ClientQuestion } from '@/types/quiz';
import { SEED_QUIZZES } from './seed-data';
import { calculateAnswerScore, rankParticipants } from './scoring';

// In-memory runtime cache for ultra-fast, zero-latency real-time multiplayer
interface ActiveGame {
  session: GameSession;
  quiz: Quiz;
  participants: Map<string, Participant>; // participantId -> Participant
  answers: Map<string, GameAnswer[]>; // questionId -> answers[]
  subscribers: Set<(data: any) => void>; // SSE / WebSocket listener callbacks
}

class GameManager {
  private games = new Map<string, ActiveGame>(); // gamePin -> ActiveGame
  private quizzes = new Map<string, Quiz>();

  constructor() {
    // Initialize quizzes from seed data
    SEED_QUIZZES.forEach(q => this.quizzes.set(q.id, q));
  }

  // Quiz Management
  public getQuizzes(ownerId?: string | null): Quiz[] {
    const list = Array.from(this.quizzes.values());
    if (!ownerId) return list;
    return list.filter(q => q.owner_id === ownerId || q.visibility === 'public');
  }

  public getQuiz(quizId: string): Quiz | undefined {
    return this.quizzes.get(quizId);
  }

  public saveQuiz(quiz: Quiz): Quiz {
    this.quizzes.set(quiz.id, {
      ...quiz,
      updated_at: new Date().toISOString(),
    });
    return this.quizzes.get(quiz.id)!;
  }

  public deleteQuiz(quizId: string): boolean {
    return this.quizzes.delete(quizId);
  }

  // Generate a random 6-digit game PIN
  private generatePin(): string {
    let pin = '';
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.games.has(pin));
    return pin;
  }

  // Create a new live game session
  public createGame(quizId: string, hostId?: string | null): GameSession {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) {
      throw new Error(`Quiz ${quizId} not found`);
    }

    const pin = this.generatePin();
    const sessionId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const session: GameSession = {
      id: sessionId,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      host_id: hostId || 'host-local',
      game_pin: pin,
      state: 'lobby',
      current_question_index: 0,
      total_questions: quiz.questions.length,
      theme_id: quiz.theme_id,
      question_started_at: null,
      question_deadline: null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    };

    const activeGame: ActiveGame = {
      session,
      quiz,
      participants: new Map(),
      answers: new Map(),
      subscribers: new Set(),
    };

    this.games.set(pin, activeGame);
    return session;
  }

  public getGameByPin(pin: string): ActiveGame | undefined {
    return this.games.get(pin);
  }

  public getGameById(gameId: string): ActiveGame | undefined {
    for (const game of this.games.values()) {
      if (game.session.id === gameId) return game;
    }
    return undefined;
  }

  // Subscribe to real-time events for a game room
  public subscribe(pin: string, callback: (data: any) => void): () => void {
    const game = this.games.get(pin);
    if (!game) return () => {};

    game.subscribers.add(callback);
    return () => {
      game.subscribers.delete(callback);
    };
  }

  // Broadcast state change to all connected clients
  private broadcast(pin: string, eventType: string = 'state_change') {
    const game = this.games.get(pin);
    if (!game) return;

    const payload = {
      type: eventType,
      state: game.session.state,
      pin,
      timestamp: Date.now(),
    };

    game.subscribers.forEach(cb => {
      try {
        cb(payload);
      } catch (e) {
        console.error('Error broadcasting to client:', e);
      }
    });
  }

  // Player joins room
  public joinPlayer(pin: string, nickname: string, avatar: string = 'blip'): Participant {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game session not found or expired.');

    if (game.session.state !== 'lobby') {
      throw new Error('Game has already started. Cannot join in-progress room.');
    }

    const cleanNickname = nickname.trim().slice(0, 20);
    if (!cleanNickname) throw new Error('Nickname cannot be empty.');

    // Check duplicate nickname
    for (const p of game.participants.values()) {
      if (p.nickname.toLowerCase() === cleanNickname.toLowerCase()) {
        throw new Error('Nickname is already taken in this room. Please pick another.');
      }
    }

    const participantId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const participant: Participant = {
      id: participantId,
      game_session_id: game.session.id,
      nickname: cleanNickname,
      avatar,
      score: 0,
      streak: 0,
      joined_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    };

    game.participants.set(participantId, participant);
    this.broadcast(pin, 'player_joined');
    return participant;
  }

  // Kick participant
  public kickPlayer(pin: string, participantId: string): boolean {
    const game = this.games.get(pin);
    if (!game) return false;

    const removed = game.participants.delete(participantId);
    if (removed) {
      this.broadcast(pin, 'player_kicked');
    }
    return removed;
  }

  // Start game (Lobby -> Question 1)
  public startGame(pin: string): GameSession {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game not found.');

    if (game.session.state !== 'lobby') {
      throw new Error(`Cannot start game from state "${game.session.state}". Must be in lobby.`);
    }

    return this.startQuestion(pin, 0);
  }

  // Start specific question index
  public startQuestion(pin: string, questionIndex: number): GameSession {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game not found.');

    const question = game.quiz.questions[questionIndex];
    if (!question) {
      // Reached end of questions -> finish game
      return this.finishGame(pin);
    }

    const now = new Date();
    const durationMs = question.time_limit_seconds * 1000;
    const deadline = new Date(now.getTime() + durationMs);

    game.session.state = 'question_active';
    game.session.current_question_index = questionIndex;
    game.session.question_started_at = now.toISOString();
    game.session.question_deadline = deadline.toISOString();

    // Reset answer flags for all participants
    game.participants.forEach(p => {
      p.has_answered = false;
      delete p.last_points_awarded;
      delete p.last_question_correct;
    });

    this.broadcast(pin, 'question_started');
    return game.session;
  }

  // Submit answer
  public submitAnswer(
    pin: string,
    participantId: string,
    questionId: string,
    selectedOptionId: string
  ): { isAccepted: boolean; message: string } {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game session not found.');

    if (game.session.state !== 'question_active') {
      return { isAccepted: false, message: 'Question is not currently active.' };
    }

    const currentQuestion = game.quiz.questions[game.session.current_question_index];
    if (!currentQuestion || currentQuestion.id !== questionId) {
      return { isAccepted: false, message: 'Question mismatch.' };
    }

    const participant = game.participants.get(participantId);
    if (!participant) {
      return { isAccepted: false, message: 'Participant not recognized.' };
    }

    // Check duplicate submission
    let answersForQ = game.answers.get(questionId);
    if (!answersForQ) {
      answersForQ = [];
      game.answers.set(questionId, answersForQ);
    }

    const alreadyAnswered = answersForQ.some(a => a.participant_id === participantId);
    if (alreadyAnswered) {
      return { isAccepted: false, message: 'Answer already submitted for this question.' };
    }

    // Verify option exists
    const option = currentQuestion.answer_options.find(o => o.id === selectedOptionId);
    if (!option) {
      return { isAccepted: false, message: 'Invalid option selected.' };
    }

    const submittedAt = new Date().toISOString();
    const isOptionCorrect = option.is_correct;

    // Server-authoritative score calculation
    const scoreResult = calculateAnswerScore({
      basePoints: currentQuestion.points,
      timeLimitSeconds: currentQuestion.time_limit_seconds,
      questionStartedAt: game.session.question_started_at!,
      questionDeadline: game.session.question_deadline!,
      answerSubmittedAt: submittedAt,
      isCorrect: isOptionCorrect,
    });

    // Record answer
    const answer: GameAnswer = {
      id: `ans-${Date.now()}-${participantId}`,
      game_session_id: game.session.id,
      participant_id: participantId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      accepted_at: submittedAt,
      is_correct: scoreResult.isCorrect,
      points_awarded: scoreResult.pointsAwarded,
    };

    answersForQ.push(answer);

    // Update participant
    participant.score += scoreResult.pointsAwarded;
    participant.has_answered = true;
    participant.last_question_correct = scoreResult.isCorrect;
    participant.last_points_awarded = scoreResult.pointsAwarded;
    if (scoreResult.isCorrect) {
      participant.streak = (participant.streak || 0) + 1;
    } else {
      participant.streak = 0;
    }
    participant.last_seen_at = submittedAt;

    this.broadcast(pin, 'answer_submitted');

    // If all participants have answered, we can auto-reveal or notify
    const totalAnswered = answersForQ.length;
    if (totalAnswered >= game.participants.size && game.participants.size > 0) {
      this.broadcast(pin, 'all_answers_in');
    }

    return { isAccepted: true, message: 'Answer accepted.' };
  }

  // Host reveals answer
  public revealAnswer(pin: string): GameSession {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game not found.');

    if (game.session.state !== 'question_active') {
      throw new Error(`Cannot reveal answer from state "${game.session.state}".`);
    }

    game.session.state = 'answer_reveal';
    this.broadcast(pin, 'answer_revealed');
    return game.session;
  }

  // Host shows leaderboard
  public showLeaderboard(pin: string): GameSession {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game not found.');

    if (game.session.state !== 'answer_reveal' && game.session.state !== 'question_active') {
      throw new Error(`Cannot show leaderboard from state "${game.session.state}".`);
    }

    game.session.state = 'leaderboard';
    this.broadcast(pin, 'leaderboard_shown');
    return game.session;
  }

  // Next question
  public nextQuestion(pin: string): GameSession {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game not found.');

    const nextIndex = game.session.current_question_index + 1;
    if (nextIndex >= game.quiz.questions.length) {
      return this.finishGame(pin);
    }

    return this.startQuestion(pin, nextIndex);
  }

  // Finish game
  public finishGame(pin: string): GameSession {
    const game = this.games.get(pin);
    if (!game) throw new Error('Game not found.');

    game.session.state = 'finished';
    this.broadcast(pin, 'game_finished');
    return game.session;
  }

  // Build Host Game View
  public getHostView(pin: string): HostGameView | undefined {
    const game = this.games.get(pin);
    if (!game) return undefined;

    const currentQuestion = game.quiz.questions[game.session.current_question_index];
    const answersForQ = currentQuestion ? game.answers.get(currentQuestion.id) || [] : [];

    // Calculate answer distribution
    let distribution: AnswerDistribution[] | undefined;
    if (currentQuestion) {
      const totalAnswers = Math.max(1, answersForQ.length);
      distribution = currentQuestion.answer_options.map(opt => {
        const count = answersForQ.filter(a => a.selected_option_id === opt.id).length;
        return {
          option_id: opt.id,
          count,
          percentage: answersForQ.length === 0 ? 0 : Math.round((count / totalAnswers) * 100),
          is_correct: opt.is_correct,
        };
      });
    }

    // Leaderboard
    const ranked = rankParticipants(Array.from(game.participants.values()));
    const leaderboard: LeaderboardEntry[] = ranked.map(p => ({
      participant_id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      rank: p.rank,
      streak: p.streak,
      points_gained: p.last_points_awarded || 0,
      is_correct: !!p.last_question_correct,
    }));

    return {
      session: { ...game.session },
      participants: Array.from(game.participants.values()),
      currentQuestion,
      distribution,
      leaderboard,
      totalAnswersCount: answersForQ.length,
    };
  }

  // Build Player Game View (ANTI-CHEAT PROTECTED)
  public getPlayerView(pin: string, participantId: string): PlayerGameView | undefined {
    const game = this.games.get(pin);
    if (!game) return undefined;

    const me = game.participants.get(participantId);
    if (!me) return undefined;

    const currentQuestion = game.quiz.questions[game.session.current_question_index];
    const answersForQ = currentQuestion ? game.answers.get(currentQuestion.id) || [] : [];
    const myAnswer = answersForQ.find(a => a.participant_id === participantId);

    // ANTI-CHEAT: Hide correctness from player options during question_active
    let clientQuestion: ClientQuestion | undefined;
    if (currentQuestion) {
      clientQuestion = {
        id: currentQuestion.id,
        position: currentQuestion.position,
        question_text: currentQuestion.question_text,
        question_type: currentQuestion.question_type,
        time_limit_seconds: currentQuestion.time_limit_seconds,
        points: currentQuestion.points,
        image_url: currentQuestion.image_url,
        answer_options: currentQuestion.answer_options.map(opt => ({
          id: opt.id,
          position: opt.position,
          answer_text: opt.answer_text,
          // Notice: opt.is_correct is NEVER passed to the client!
        })),
      };
    }

    // Leaderboard / Podium
    const ranked = rankParticipants(Array.from(game.participants.values()));
    const myRank = ranked.find(p => p.id === participantId)?.rank || 1;

    let lastAnswerResult = undefined;
    if (game.session.state === 'answer_reveal' || game.session.state === 'leaderboard' || game.session.state === 'finished') {
      if (currentQuestion) {
        const correctOpt = currentQuestion.answer_options.find(o => o.is_correct);
        lastAnswerResult = {
          is_correct: !!myAnswer?.is_correct,
          points_awarded: myAnswer?.points_awarded || 0,
          correct_option_id: correctOpt?.id || '',
          rank: myRank,
          total_score: me.score,
        };
      }
    }

    const leaderboard: LeaderboardEntry[] = ranked.slice(0, 10).map(p => ({
      participant_id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      rank: p.rank,
      streak: p.streak,
      points_gained: p.last_points_awarded || 0,
      is_correct: !!p.last_question_correct,
    }));

    const podium = game.session.state === 'finished' ? ranked.slice(0, 3).map(p => ({
      participant_id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      rank: p.rank,
      streak: p.streak,
      points_gained: p.last_points_awarded || 0,
      is_correct: !!p.last_question_correct,
    })) : undefined;

    return {
      session: {
        id: game.session.id,
        game_pin: game.session.game_pin,
        state: game.session.state,
        current_question_index: game.session.current_question_index,
        total_questions: game.session.total_questions,
        theme_id: game.session.theme_id,
        question_deadline: game.session.question_deadline,
      },
      me,
      currentQuestion: clientQuestion,
      hasAnswered: !!myAnswer,
      selectedOptionId: myAnswer?.selected_option_id,
      lastAnswerResult,
      leaderboard,
      podium,
    };
  }
}

// Global Singleton Instance across hot-reloads
const globalForGame = globalThis as unknown as { gameManager?: GameManager };
export const gameManager = globalForGame.gameManager ?? new GameManager();
if (process.env.NODE_ENV !== 'production') globalForGame.gameManager = gameManager;
