import { describe, it, expect } from 'vitest';
import { calculateAnswerScore, rankParticipants } from '../lib/scoring';

describe('Scoring Engine', () => {
  const baseTime = 1000000;
  const startedAt = new Date(baseTime).toISOString();
  const deadline = new Date(baseTime + 20000).toISOString(); // 20s time limit

  it('awards maximum points for instantaneous correct answer', () => {
    const submittedAt = new Date(baseTime + 100).toISOString();
    const result = calculateAnswerScore({
      basePoints: 1000,
      timeLimitSeconds: 20,
      questionStartedAt: startedAt,
      questionDeadline: deadline,
      answerSubmittedAt: submittedAt,
      isCorrect: true,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.pointsAwarded).toBeGreaterThanOrEqual(990);
    expect(result.pointsAwarded).toBeLessThanOrEqual(1000);
    expect(result.isLate).toBe(false);
    expect(result.streakIncrement).toBe(1);
  });

  it('awards approx 50% points near the deadline', () => {
    const submittedAt = new Date(baseTime + 19500).toISOString();
    const result = calculateAnswerScore({
      basePoints: 1000,
      timeLimitSeconds: 20,
      questionStartedAt: startedAt,
      questionDeadline: deadline,
      answerSubmittedAt: submittedAt,
      isCorrect: true,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.pointsAwarded).toBeGreaterThanOrEqual(500);
    expect(result.pointsAwarded).toBeLessThan(600);
    expect(result.isLate).toBe(false);
  });

  it('awards 0 points for incorrect answer', () => {
    const submittedAt = new Date(baseTime + 1000).toISOString();
    const result = calculateAnswerScore({
      basePoints: 1000,
      timeLimitSeconds: 20,
      questionStartedAt: startedAt,
      questionDeadline: deadline,
      answerSubmittedAt: submittedAt,
      isCorrect: false,
    });

    expect(result.isCorrect).toBe(false);
    expect(result.pointsAwarded).toBe(0);
    expect(result.streakIncrement).toBe(0);
  });

  it('strictly rejects late answer submitted past deadline', () => {
    const submittedAt = new Date(baseTime + 22000).toISOString(); // 2s after deadline
    const result = calculateAnswerScore({
      basePoints: 1000,
      timeLimitSeconds: 20,
      questionStartedAt: startedAt,
      questionDeadline: deadline,
      answerSubmittedAt: submittedAt,
      isCorrect: true,
    });

    expect(result.isLate).toBe(true);
    expect(result.pointsAwarded).toBe(0);
  });

  it('ranks participants deterministically by score and breaks ties', () => {
    const players = [
      { id: 'p1', score: 1500, last_seen_at: '2026-01-01T00:00:02Z' },
      { id: 'p2', score: 2400, last_seen_at: '2026-01-01T00:00:01Z' },
      { id: 'p3', score: 1500, last_seen_at: '2026-01-01T00:00:01Z' }, // Tied with p1, but earlier timestamp
    ];

    const ranked = rankParticipants(players);
    expect(ranked[0].id).toBe('p2');
    expect(ranked[0].rank).toBe(1);

    expect(ranked[1].id).toBe('p3'); // Earlier timestamp breaks tie
    expect(ranked[1].rank).toBe(2);

    expect(ranked[2].id).toBe('p1');
    expect(ranked[2].rank).toBe(3);
  });
});
