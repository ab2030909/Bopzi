'use client';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Play a synthesized tone or chord
  private playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio context may be restricted by browser policy
    }
  }

  // 1. Lobby player joined (friendly ascending chime)
  public playPlayerJoined() {
    this.playTone(523.25, 'sine', 0.15, 0); // C5
    this.playTone(659.25, 'sine', 0.2, 0.08); // E5
  }

  // 2. Countdown tick
  public playCountdownTick() {
    this.playTone(800, 'square', 0.05, 0);
  }

  // 3. Question start fanfare
  public playQuestionStart() {
    this.playTone(440, 'triangle', 0.2, 0); // A4
    this.playTone(554.37, 'triangle', 0.2, 0.1); // C#5
    this.playTone(659.25, 'triangle', 0.35, 0.2); // E5
    this.playTone(880, 'sine', 0.5, 0.3); // A5
  }

  // 4. Answer submitted (satisfying click/pop)
  public playAnswerSubmitted() {
    this.playTone(400, 'triangle', 0.08, 0);
    this.playTone(600, 'sine', 0.12, 0.04);
  }

  // 5. Correct answer chime (bright triumphant arpeggio)
  public playCorrect() {
    this.playTone(523.25, 'sine', 0.2, 0); // C5
    this.playTone(659.25, 'sine', 0.2, 0.08); // E5
    this.playTone(783.99, 'sine', 0.25, 0.16); // G5
    this.playTone(1046.5, 'sine', 0.45, 0.24); // C6
  }

  // 6. Incorrect answer (gentle low thud)
  public playIncorrect() {
    this.playTone(220, 'sawtooth', 0.2, 0);
    this.playTone(180, 'sawtooth', 0.3, 0.15);
  }

  // 7. Leaderboard fanfare
  public playLeaderboard() {
    this.playTone(392.0, 'sine', 0.18, 0); // G4
    this.playTone(523.25, 'sine', 0.18, 0.12); // C5
    this.playTone(659.25, 'sine', 0.22, 0.24); // E5
    this.playTone(783.99, 'sine', 0.4, 0.36); // G5
  }

  // 8. Final countdown alert (urgent double pip)
  public playFinalAlert() {
    this.playTone(987.77, 'square', 0.08, 0); // B5
    this.playTone(1174.66, 'square', 0.12, 0.1); // D6
  }

  // 9. Grand victory triumph (Podium)
  public playVictory() {
    const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      this.playTone(f, 'sine', 0.25 + (idx === notes.length - 1 ? 0.5 : 0), idx * 0.12);
    });
  }

  // 10. Confetti burst sound
  public playConfetti() {
    this.playTone(300, 'square', 0.05, 0);
    this.playTone(700, 'triangle', 0.1, 0.03);
    this.playTone(1200, 'sine', 0.18, 0.06);
  }

  // 11. Spin the Wheel peg tick (crisp wooden/plastic peg click)
  public playWheelTick(freqRatio: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 880 * freqRatio;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.035);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 12. Wheel Winner Fanfare
  public playWheelWinner() {
    this.playTone(523.25, 'triangle', 0.18, 0); // C5
    this.playTone(659.25, 'triangle', 0.18, 0.1); // E5
    this.playTone(783.99, 'triangle', 0.22, 0.2); // G5
    this.playTone(1046.5, 'sine', 0.5, 0.3); // C6
    this.playTone(1318.51, 'sine', 0.7, 0.45); // E6
  }
}

export const sounds = new SoundEngine();
