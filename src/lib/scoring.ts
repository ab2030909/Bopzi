/**
 * Server-authoritative scoring engine for Anti Kahoot.
 * Deterministic, tamper-proof calculations.
 */

export interface ScoreCalculationInput {
  basePoints: number;
  timeLimitSeconds: number;
  questionStartedAt: string; // ISO string
  questionDeadline: string; // ISO string
  answerSubmittedAt: string; // ISO string
  isCorrect: boolean;
}

export interface ScoreCalculationResult {
  isCorrect: boolean;
  pointsAwarded: number;
  isLate: boolean;
  timeTakenSeconds: number;
  streakIncrement: number;
}

/**
 * Calculates score deterministically based on correctness, deadline, and speed.
 */
export function calculateAnswerScore(input: ScoreCalculationInput): ScoreCalculationResult {
  const {
    basePoints,
    timeLimitSeconds,
    questionStartedAt,
    questionDeadline,
    answerSubmittedAt,
    isCorrect,
  } = input;

  const startMs = new Date(questionStartedAt).getTime();
  const deadlineMs = new Date(questionDeadline).getTime();
  const submittedMs = new Date(answerSubmittedAt).getTime();

  // Allow a tiny 250ms network grace tolerance for latency jitter, but hard cutoff thereafter
  const isLate = submittedMs > deadlineMs + 250;

  if (!isCorrect || isLate) {
    return {
      isCorrect: false,
      pointsAwarded: 0,
      isLate,
      timeTakenSeconds: Math.max(0, (submittedMs - startMs) / 1000),
      streakIncrement: 0,
    };
  }

  // Calculate speed factor
  const totalDurationMs = Math.max(1000, deadlineMs - startMs);
  const remainingMs = Math.max(0, deadlineMs - submittedMs);
  const speedRatio = Math.min(1, Math.max(0, remainingMs / totalDurationMs));

  // Speed bonus formula: 50% base floor + 50% speed multiplier
  // Instant answer gets 100% of base points, last-second answer gets ~50%
  const calculatedPoints = Math.round(basePoints * (0.5 + 0.5 * speedRatio));

  return {
    isCorrect: true,
    pointsAwarded: Math.max(100, Math.min(basePoints, calculatedPoints)),
    isLate: false,
    timeTakenSeconds: Math.max(0, (submittedMs - startMs) / 1000),
    streakIncrement: 1,
  };
}

/**
 * Deterministic leaderboard sorting with tie-breaker
 */
export function rankParticipants<T extends { score: number; last_seen_at?: string; id: string }>(
  participants: T[]
): (T & { rank: number })[] {
  const sorted = [...participants].sort((a, b) => {
    // 1. Highest score first
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // 2. Tie breaker: earlier last_seen_at / joined or stable ID comparison
    const timeA = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
    const timeB = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });

  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}
