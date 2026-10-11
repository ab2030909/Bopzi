import { describe, it, expect } from 'vitest';
import { gameManager } from '../lib/game-manager';

describe('Game Manager and State Machine', () => {
  it('creates game session with unique 6-digit pin and lobby state', () => {
    const session = gameManager.createGame('quiz-party-pop-01');
    expect(session.game_pin).toHaveLength(6);
    expect(session.state).toBe('lobby');
    expect(session.total_questions).toBeGreaterThan(0);
  });

  it('allows players to join lobby and rejects duplicate nicknames', () => {
    const session = gameManager.createGame('quiz-party-pop-01');
    const p1 = gameManager.joinPlayer(session.game_pin, 'Alice', 'blip');
    expect(p1.nickname).toBe('Alice');

    // Duplicate nickname should throw
    expect(() => {
      gameManager.joinPlayer(session.game_pin, 'alice', 'blip');
    }).toThrow(/already taken/i);
  });

  it('rejects joining when game is already started', () => {
    const session = gameManager.createGame('quiz-party-pop-01');
    gameManager.joinPlayer(session.game_pin, 'Alice', 'blip');
    gameManager.startGame(session.game_pin);

    expect(() => {
      gameManager.joinPlayer(session.game_pin, 'Bob', 'blip');
    }).toThrow(/already started/i);
  });

  it('hides correct answer flags from player view during active question (Anti-Cheat)', () => {
    const session = gameManager.createGame('quiz-party-pop-01');
    const p1 = gameManager.joinPlayer(session.game_pin, 'Alice', 'blip');
    gameManager.startGame(session.game_pin);

    const playerView = gameManager.getPlayerView(session.game_pin, p1.id);
    expect(playerView).toBeDefined();
    expect(playerView?.session.state).toBe('question_active');
    expect(playerView?.currentQuestion).toBeDefined();

    // Verify none of the answer options have 'is_correct' exposed to player
    playerView?.currentQuestion?.answer_options.forEach((opt: any) => {
      expect(opt.is_correct).toBeUndefined();
    });
  });

  it('accepts answers and prevents duplicate submissions', () => {
    const session = gameManager.createGame('quiz-party-pop-01');
    const p1 = gameManager.joinPlayer(session.game_pin, 'Alice', 'blip');
    gameManager.startGame(session.game_pin);

    const hostView = gameManager.getHostView(session.game_pin);
    const q = hostView?.currentQuestion!;
    const correctOpt = q.answer_options.find(o => o.is_correct)!;

    // First submission
    const res1 = gameManager.submitAnswer(session.game_pin, p1.id, q.id, correctOpt.id);
    expect(res1.isAccepted).toBe(true);

    // Second submission on same question must be rejected
    const res2 = gameManager.submitAnswer(session.game_pin, p1.id, q.id, correctOpt.id);
    expect(res2.isAccepted).toBe(false);
    expect(res2.message).toMatch(/already submitted/i);
  });

  it('advances through states and finishes game', () => {
    const session = gameManager.createGame('quiz-party-pop-01');
    const p1 = gameManager.joinPlayer(session.game_pin, 'Alice', 'blip');
    gameManager.startGame(session.game_pin);

    const s1 = gameManager.revealAnswer(session.game_pin);
    expect(s1.state).toBe('answer_reveal');

    const s2 = gameManager.showLeaderboard(session.game_pin);
    expect(s2.state).toBe('leaderboard');

    const s3 = gameManager.finishGame(session.game_pin);
    expect(s3.state).toBe('finished');
  });
});
