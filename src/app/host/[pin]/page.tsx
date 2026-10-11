'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { HostGameView, LeaderboardEntry } from '@/types/game';
import { THEMES, ThemeId } from '@/types/theme';
import { Mascot } from '@/components/mascot/Mascot';
import { sounds } from '@/lib/audio';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Users,
  Play,
  ArrowRight,
  Maximize2,
  Minimize2,
  Trophy,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

function HostLiveGameContent() {
  const params = useParams();
  const pin = params?.pin as string;
  const router = useRouter();
  const { setThemeId, isMuted, setIsMuted } = useTheme();

  const [view, setView] = useState<HostGameView | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const prevPlayerCountRef = useRef(0);
  const prevQuestionIdxRef = useRef(-1);
  const timerIntervalRef = useRef<any>(null);

  // Fetch host view data
  const fetchHostView = async () => {
    try {
      const res = await fetch(`/api/game/${pin}/view?role=host`);
      const data = await res.json();
      if (data.success && data.view) {
        setView(data.view);
        setThemeId(data.view.session.theme_id);

        // Sound trigger on new player join
        const count = data.view.participants?.length || 0;
        if (count > prevPlayerCountRef.current) {
          sounds.playPlayerJoined();
          prevPlayerCountRef.current = count;
        }

        // Sound trigger on question advance
        if (
          data.view.session.state === 'question_active' &&
          data.view.session.current_question_index !== prevQuestionIdxRef.current
        ) {
          sounds.playQuestionStart();
          prevQuestionIdxRef.current = data.view.session.current_question_index;
        }

        // Confetti trigger on victory
        if (data.view.session.state === 'finished') {
          sounds.playVictory();
          sounds.playConfetti();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (e) {
      console.error('Failed to poll host view', e);
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code once PIN is known
  useEffect(() => {
    if (!pin) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const joinUrl = `${origin}/join?pin=${pin}`;

    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 256,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [pin]);

  // Real-time SSE connection + interval sync
  useEffect(() => {
    if (!pin) return;
    fetchHostView();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/game/${pin}/stream`);
      eventSource.onmessage = () => {
        fetchHostView();
      };
      eventSource.onerror = () => {
        // SSE disconnected, fallback to polling
        if (eventSource) eventSource.close();
      };
    } catch (e) {
      console.log('SSE not supported or failed, using polling fallback');
    }

    const interval = setInterval(fetchHostView, 2000);
    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [pin]);

  // Synchronized Countdown Timer during question_active
  useEffect(() => {
    if (view?.session.state === 'question_active' && view.session.question_deadline) {
      const deadline = new Date(view.session.question_deadline).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.ceil((deadline - now) / 1000));
        setTimeLeft(diffSeconds);

        if (diffSeconds <= 5 && diffSeconds > 0) {
          sounds.playCountdownTick();
        } else if (diffSeconds === 0) {
          // Auto reveal when timer hits 0
          handleHostAction('reveal');
        }
      };

      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 500);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [view?.session.state, view?.session.question_deadline]);

  // Host Action dispatcher
  const handleHostAction = async (action: string, payload: any = {}) => {
    try {
      const res = await fetch(`/api/game/${pin}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        fetchHostView();
      }
    } catch (err) {
      console.error(`Host action ${action} failed:`, err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (loading || !view) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mr-3" />
        <span className="text-xl font-bold">Connecting to Live Game Room {pin}...</span>
      </div>
    );
  }

  const { session, participants, currentQuestion, distribution, leaderboard, totalAnswersCount } = view;
  const currentTheme = THEMES[session.theme_id] || THEMES['party-pop'];

  const answerShapes = [
    { shape: '▲', color: currentTheme.colors.answerRed },
    { shape: '◆', color: currentTheme.colors.answerBlue },
    { shape: '●', color: currentTheme.colors.answerYellow },
    { shape: '■', color: currentTheme.colors.answerGreen },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* HOST TOP BAR: PIN, Status, Controls */}
      <header
        className="flex items-center justify-between p-4 rounded-2xl border mb-6 backdrop-blur-md shadow-lg"
        style={{
          backgroundColor: `${currentTheme.colors.surface}dd`,
          borderColor: currentTheme.colors.border,
        }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase text-slate-300">PIN:</span>
            <span
              className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white px-3 py-0.5 rounded-xl border-2"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderColor: currentTheme.colors.primary,
              }}
            >
              {session.game_pin}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{participants.length} Players</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              sounds.setMuted(nextMuted);
            }}
            className="p-2.5 rounded-xl border hover:scale-105 transition-all text-slate-200"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: currentTheme.colors.border }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl border hover:scale-105 transition-all text-slate-200"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: currentTheme.colors.border }}
            title="Toggle Projector Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* STATE 1: LOBBY */}
      {session.state === 'lobby' && (
        <div className="flex-1 flex flex-col justify-between space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center flex-1">
            {/* Left: Huge QR Code and Join Instructions */}
            <div
              className="md:col-span-5 p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col items-center text-center backdrop-blur-xl"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.border,
              }}
            >
              <span
                className="text-xs font-black uppercase px-3 py-1 rounded-full text-white mb-4"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                Scan or Enter PIN
              </span>

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-2xl shadow-2xl mb-4">
                  <img src={qrDataUrl} alt="Join Game QR Code" className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg" />
                </div>
              )}

              <div className="text-sm font-bold text-slate-300">
                Join at <span className="text-white underline font-extrabold">{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/join</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white mt-1">
                {session.game_pin}
              </div>
            </div>

            {/* Right: Participant Roster & Mascot */}
            <div
              className="md:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col justify-between h-full backdrop-blur-xl"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    <h2 className="text-xl font-black text-white">
                      Waiting for Players ({participants.length})
                    </h2>
                  </div>
                  <Mascot themeId={session.theme_id} state="excited" size="sm" />
                </div>

                {participants.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <p className="text-lg font-bold">No players have joined yet!</p>
                    <p className="text-xs mt-1">Share the PIN or QR code to let people in.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto p-1">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm animate-pop group"
                        style={{
                          backgroundColor: `${currentTheme.colors.surfaceHover}`,
                          borderColor: currentTheme.colors.border,
                        }}
                      >
                        <span className="font-extrabold text-sm text-white">{p.nickname}</span>
                        <button
                          onClick={() => handleHostAction('kick', { participantId: p.id })}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-0.5 rounded transition-all"
                          title="Kick player"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Game Action */}
              <div className="pt-6 border-t mt-6" style={{ borderColor: `${currentTheme.colors.border}66` }}>
                <button
                  onClick={() => handleHostAction('start')}
                  disabled={participants.length === 0}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>START GAME NOW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE QUESTION */}
      {session.state === 'question_active' && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between space-y-6">
          {/* Question Banner & Timer */}
          <div
            className="p-6 sm:p-8 rounded-3xl border shadow-2xl text-center relative backdrop-blur-xl"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-black uppercase px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                Question {session.current_question_index + 1} of {session.total_questions}
              </span>

              {/* Synchronized Circular Timer */}
              <div
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-lg font-black border ${
                  timeLeft <= 5 ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse' : 'bg-black/30 text-white'
                }`}
                style={{ borderColor: timeLeft <= 5 ? '#f43f5e' : currentTheme.colors.border }}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              {currentQuestion.question_text}
            </h2>

            {/* Answer submission count */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>
                {totalAnswersCount} / {participants.length} Answers Submitted
              </span>
            </div>
          </div>

          {/* 4 Answer Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {currentQuestion.answer_options.map((opt, idx) => {
              const shapeInfo = answerShapes[idx] || answerShapes[0];
              return (
                <div
                  key={opt.id}
                  className="p-5 sm:p-6 rounded-2xl flex items-center gap-4 text-white font-extrabold text-lg sm:text-xl shadow-xl transition-all"
                  style={{ backgroundColor: shapeInfo.color }}
                >
                  <span className="text-2xl sm:text-3xl font-black drop-shadow select-none">
                    {shapeInfo.shape}
                  </span>
                  <span className="leading-snug">{opt.answer_text}</span>
                </div>
              );
            })}
          </div>

          {/* Host Reveal Skip Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleHostAction('reveal')}
              className="px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Reveal Correct Answer
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: ANSWER REVEAL */}
      {session.state === 'answer_reveal' && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div
            className="p-6 rounded-3xl border shadow-2xl backdrop-blur-xl text-center"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="text-xs font-bold uppercase text-slate-400 mb-2">
              Question {session.current_question_index + 1} Result
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Distribution Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {currentQuestion.answer_options.map((opt, idx) => {
              const shapeInfo = answerShapes[idx] || answerShapes[0];
              const dist = distribution?.find((d) => d.option_id === opt.id);
              const count = dist?.count || 0;
              const isCorrect = opt.is_correct;

              return (
                <div
                  key={opt.id}
                  className={`p-5 rounded-2xl flex flex-col justify-between shadow-xl border-4 transition-all relative overflow-hidden ${
                    isCorrect ? 'border-white scale-[1.02] ring-4 ring-emerald-400/50' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: shapeInfo.color }}
                >
                  <div className="flex items-center justify-between text-white font-extrabold text-lg sm:text-xl relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black">{shapeInfo.shape}</span>
                      <span>{opt.answer_text}</span>
                    </div>
                    {isCorrect && (
                      <span className="bg-white text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    )}
                  </div>

                  <div className="mt-4 relative z-10 flex items-center justify-between text-white font-black text-sm">
                    <span>{count} Answers</span>
                    <span>{dist?.percentage || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleHostAction('leaderboard')}
              className="px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <span>Show Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: LEADERBOARD */}
      {session.state === 'leaderboard' && leaderboard && (
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase text-white mb-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard Standings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Top Contenders</h2>
          </div>

          <div className="max-w-3xl mx-auto w-full space-y-3 flex-1 overflow-y-auto">
            {leaderboard.slice(0, 5).map((entry, idx) => (
              <div
                key={entry.participant_id}
                className="p-4 sm:p-5 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-pop"
                style={{
                  backgroundColor: idx === 0 ? `${currentTheme.colors.primary}33` : currentTheme.colors.cardBg,
                  borderColor: idx === 0 ? currentTheme.colors.primary : currentTheme.colors.border,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white ${
                      idx === 0 ? 'bg-amber-500 shadow-md scale-105' : 'bg-slate-700'
                    }`}
                  >
                    #{entry.rank}
                  </div>
                  <div>
                    <div className="font-extrabold text-lg text-white flex items-center gap-2">
                      <span>{entry.nickname}</span>
                      {entry.streak >= 2 && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold">
                          🔥 {entry.streak} Streak
                        </span>
                      )}
                    </div>
                    {entry.points_gained > 0 && (
                      <div className="text-xs font-bold text-emerald-400">
                        +{entry.points_gained} pts this round
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-2xl font-black font-mono text-white">
                  {entry.score}
                </div>
              </div>
            ))}
          </div>

          {/* Advance Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleHostAction('next_question')}
              className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <span>{session.current_question_index + 1 >= session.total_questions ? 'Final Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 5: GRAND VICTORY PODIUM */}
      {session.state === 'finished' && leaderboard && (
        <div className="flex-1 flex flex-col items-center justify-between text-center space-y-8 my-auto">
          <div>
            <span
              className="text-xs font-black uppercase px-4 py-1.5 rounded-full text-white shadow-lg"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              🎉 Tournament Complete
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-3">
              Victory Podium
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Honoring the sharpest and fastest minds in the arena!
            </p>
          </div>

          {/* 3-Pedestal Podium */}
          <div className="flex items-end justify-center gap-4 sm:gap-6 w-full max-w-2xl pt-6">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="flex-1 flex flex-col items-center animate-pop">
                <div className="text-xs font-bold text-slate-300 mb-1">
                  {leaderboard[1].nickname}
                </div>
                <div className="text-sm font-black text-slate-400 font-mono mb-2">
                  {leaderboard[1].score} pts
                </div>
                <div className="w-full h-36 sm:h-44 bg-slate-600/60 rounded-t-2xl border-t-4 border-slate-400 flex items-center justify-center font-black text-3xl text-slate-300 shadow-xl">
                  2
                </div>
              </div>
            )}

            {/* 1st Place (Champion) */}
            {leaderboard[0] && (
              <div className="flex-1 flex flex-col items-center animate-celebrate">
                <div className="mb-2">
                  <Mascot themeId={session.theme_id} state="celebrating" size="sm" />
                </div>
                <div className="text-base sm:text-lg font-black text-amber-300 mb-1">
                  👑 {leaderboard[0].nickname}
                </div>
                <div className="text-base font-black text-amber-400 font-mono mb-2">
                  {leaderboard[0].score} pts
                </div>
                <div className="w-full h-48 sm:h-60 bg-amber-500/80 rounded-t-2xl border-t-4 border-amber-300 flex items-center justify-center font-black text-5xl text-white shadow-2xl">
                  1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="flex-1 flex flex-col items-center animate-pop">
                <div className="text-xs font-bold text-slate-300 mb-1">
                  {leaderboard[2].nickname}
                </div>
                <div className="text-sm font-black text-amber-600 font-mono mb-2">
                  {leaderboard[2].score} pts
                </div>
                <div className="w-full h-28 sm:h-32 bg-amber-800/60 rounded-t-2xl border-t-4 border-amber-600 flex items-center justify-center font-black text-3xl text-amber-200 shadow-xl">
                  3
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl font-bold text-sm text-slate-200 border border-white/20 hover:bg-white/10 transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleHostAction('start')}
              className="px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HostLiveGamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-white font-bold">
          Loading Arena...
        </div>
      }
    >
      <HostLiveGameContent />
    </Suspense>
  );
}
