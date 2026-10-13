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
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
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

  const isNeon = session.theme_id === 'neon-arcade';
  const isCosmic = session.theme_id === 'cosmic-quest';
  const isChampion = session.theme_id === 'champion-mode';
  const isPartyPop = session.theme_id === 'party-pop' || (!session.theme_id && !isCosmic && !isNeon && !isChampion);

  return (
    <div className={`relative min-h-screen w-full flex-1 flex flex-col transition-colors duration-500 overflow-hidden ${isNeon
        ? 'bg-[#030712] text-white'
        : isCosmic
          ? 'bg-[#050C1A] text-white'
          : isChampion
            ? 'bg-[#FDFBF7] text-[#0F172A]'
            : isPartyPop
              ? 'bg-[#FCFBFF] text-[#0F172A]'
              : ''
      }`}>
      {/* Dynamic Background Image for Neon Arcade */}
      {isNeon && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/neon_arcade_bg.png')" }}
        />
      )}

      {/* Dynamic Background Image for Cosmic Quest */}
      {isCosmic && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/cosmic_quest_bg.png')" }}
        />
      )}

      {/* Dynamic Background Image for Champion Mode */}
      {isChampion && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/champion_mode_bg.png')" }}
        />
      )}

      {/* Dynamic Background Image for Party Pop */}
      {isPartyPop && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/bopzi_pastel_bg.png')" }}
        />
      )}

      {/* Corner Mascots for Party Pop Host Projector Screen */}
      {isPartyPop && (
        <>
          <div className="hidden lg:block absolute -left-4 sm:-left-2 xl:left-2 top-20 sm:top-24 w-28 sm:w-36 xl:w-40 h-auto z-20 pointer-events-none select-none">
            <img
              src="/images/dashboard_mascot_skater.png"
              alt="Bopzi Skater Mascot"
              className="w-full h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(124,58,237,0.22)] animate-float-slow -rotate-6"
            />
          </div>
          <div className="hidden lg:block absolute -right-6 sm:-right-3 xl:right-1 top-16 sm:top-20 w-36 sm:w-44 xl:w-52 h-auto z-20 pointer-events-none select-none">
            <img
              src="/images/dashboard_mascot_cheer.png"
              alt="Bopzi Cheerleader Mascot"
              className="w-full h-auto object-contain filter drop-shadow-[0_14px_28px_rgba(236,72,153,0.25)] animate-float-slow rotate-6"
            />
          </div>
        </>
      )}


      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* HOST TOP BAR: PIN, Status, Controls */}
        <header
          className={`flex items-center justify-between p-4 rounded-3xl border mb-6 backdrop-blur-md shadow-lg transition-all ${isNeon
              ? 'bg-[#060B1E]/85 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
              : isCosmic
                ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                : isChampion
                ? 'bg-white/85 border-2 border-amber-300 shadow-[0_10px_30px_rgba(245,158,11,0.12)]'
                : isPartyPop
                  ? 'bg-white/95 border-purple-100 shadow-[0_10px_30px_rgba(124,58,237,0.06)]'
                  : ''
            }`}
          style={
            !isNeon && !isCosmic && !isChampion && !isPartyPop
              ? {
                backgroundColor: `${currentTheme.colors.surface}dd`,
                borderColor: currentTheme.colors.border,
              }
              : undefined
          }
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-black uppercase ${isNeon
                  ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                  : isCosmic
                    ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : isChampion
                    ? 'text-amber-700'
                    : isPartyPop
                      ? 'text-[#7C3AED]'
                      : 'text-slate-300'
                }`}>
                PIN:
              </span>
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-widest px-3.5 py-0.5 rounded-2xl border-2 transition-all ${isNeon
                    ? 'text-cyan-300 bg-[#030712]/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                    : isCosmic
                      ? 'text-amber-300 bg-[#040C1A]/90 border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : isChampion
                      ? 'text-amber-800 bg-amber-50/90 border-amber-300 shadow-sm'
                      : isPartyPop
                        ? 'text-[#7C3AED] bg-purple-50/90 border-purple-200 shadow-sm'
                        : 'text-white'
                  }`}
                style={
                  !isNeon && !isCosmic && !isChampion && !isPartyPop
                    ? {
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderColor: currentTheme.colors.primary,
                    }
                    : undefined
                }
              >
                {session.game_pin}
              </span>
            </div>
            <div className={`hidden sm:flex items-center space-x-2 text-xs font-bold ${isChampion ? 'text-amber-800' : isPartyPop ? 'text-slate-600' : 'text-slate-300'
              }`}>
              <Users className="w-4 h-4 text-emerald-500" />
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
              className={`p-2.5 rounded-xl border hover:scale-105 transition-all ${isNeon
                  ? 'bg-slate-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : isCosmic
                    ? 'bg-[#040C1A] text-amber-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:border-amber-400'
                    : isChampion
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : isPartyPop
                      ? 'bg-purple-50 text-[#7C3AED] border-purple-200 hover:bg-purple-100'
                      : 'text-slate-200'
                }`}
              style={!isNeon && !isCosmic && !isChampion && !isPartyPop ? { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: currentTheme.colors.border } : undefined}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className={`p-2.5 rounded-xl border hover:scale-105 transition-all ${isNeon
                  ? 'bg-slate-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : isCosmic
                    ? 'bg-[#040C1A] text-amber-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:border-amber-400'
                    : isChampion
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : isPartyPop
                      ? 'bg-purple-50 text-[#7C3AED] border-purple-200 hover:bg-purple-100'
                      : 'text-slate-200'
                }`}
              style={!isNeon && !isCosmic && !isChampion && !isPartyPop ? { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: currentTheme.colors.border } : undefined}
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
                className={`md:col-span-5 p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col items-center text-center backdrop-blur-xl transition-all ${isNeon
                    ? 'bg-[#060B1E]/60 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
                    : isCosmic
                      ? 'bg-[#071326]/60 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
                      : isChampion
                      ? 'bg-white/85 border-2 border-amber-300 shadow-[0_15px_40px_rgba(245,158,11,0.12)]'
                      : isPartyPop
                        ? 'bg-white/75 border-purple-100 shadow-[0_15px_40px_rgba(124,58,237,0.08)]'
                        : ''
                  }`}
                style={
                  !isNeon && !isCosmic && !isChampion && !isPartyPop
                    ? {
                      backgroundColor: 'rgba(13, 19, 41, 0.6)',
                      borderColor: currentTheme.colors.border,
                    }
                    : undefined
                }
              >
                <span
                  className={`text-xs font-black uppercase px-4 py-1.5 rounded-full mb-4 transition-all ${isNeon
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.7)] border border-pink-300'
                      : isCosmic
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.7)] border border-amber-300'
                        : isChampion
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md border border-amber-200'
                        : isPartyPop
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md'
                          : 'text-white'
                    }`}
                  style={!isNeon && !isCosmic && !isChampion && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
                >
                  Scan or Enter PIN
                </span>

                {qrDataUrl && (
                  <div className={`p-3 rounded-2xl mb-4 transition-all ${isNeon
                      ? 'bg-white/95 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                      : isCosmic
                        ? 'bg-white/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                        : isChampion
                        ? 'bg-white border-2 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'bg-white shadow-xl border border-slate-100'
                    }`}>
                    <img src={qrDataUrl} alt="Join Game QR Code" className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg" />
                  </div>
                )}

                <div className={`text-sm font-bold ${isNeon ? 'text-slate-300' : isCosmic ? 'text-slate-300' : isChampion ? 'text-slate-700' : isPartyPop ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                  Join at <span className={`underline font-extrabold ${isNeon
                      ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : isCosmic
                        ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                        : isChampion
                        ? 'text-amber-700'
                        : isPartyPop
                          ? 'text-[#7C3AED]'
                          : 'text-white'
                    }`}>{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/join</span>
                </div>
                <div className={`text-3xl sm:text-4xl font-black font-mono tracking-widest mt-1 ${isNeon
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : isCosmic
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]'
                      : isChampion
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 drop-shadow-sm'
                      : isPartyPop
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]'
                        : 'text-white'
                  }`}>
                  {session.game_pin}
                </div>
              </div>

              {/* Right: Participant Roster */}
              <div
                className={`md:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col justify-between h-full backdrop-blur-xl transition-all ${isNeon
                    ? 'bg-[#060B1E]/60 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
                    : isCosmic
                      ? 'bg-[#071326]/60 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
                      : isChampion
                      ? 'bg-white/85 border-2 border-amber-300 shadow-[0_15px_40px_rgba(245,158,11,0.12)]'
                      : isPartyPop
                        ? 'bg-white/75 border-purple-100 shadow-[0_15px_40px_rgba(124,58,237,0.08)]'
                        : ''
                  }`}
                style={
                  !isNeon && !isCosmic && !isChampion && !isPartyPop
                    ? {
                      backgroundColor: 'rgba(13, 19, 41, 0.6)',
                      borderColor: currentTheme.colors.border,
                    }
                    : undefined
                }
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" style={{ color: isNeon ? '#06B6D4' : isCosmic ? '#38BDF8' : isPartyPop ? '#7C3AED' : currentTheme.colors.primary }} />
                      <h2 className={`text-xl font-black ${isNeon
                          ? 'text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                          : isCosmic
                            ? 'text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                            : isPartyPop
                              ? 'text-[#0F172A]'
                              : 'text-white'
                        }`}>
                        Waiting for Players ({participants.length})
                      </h2>
                    </div>
                  </div>

                  {participants.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <p className={`text-lg font-bold ${isNeon ? 'text-slate-300' : isCosmic ? 'text-slate-300' : isPartyPop ? 'text-slate-700' : ''
                        }`}>No players have joined yet!</p>
                      <p className={`text-xs mt-1 ${isPartyPop ? 'text-slate-500' : 'text-slate-400'}`}>Share the PIN or QR code to let people in.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto p-1">
                      {participants.map((p) => (
                        <div
                          key={p.id}
                          className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 shadow-sm animate-pop group transition-all ${isNeon
                              ? 'bg-[#030712]/90 border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-200'
                              : isCosmic
                                ? 'bg-[#040C1A]/90 border-2 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-200'
                                : isPartyPop
                                  ? 'bg-purple-50/90 border-purple-200 text-[#7C3AED] hover:border-purple-300 shadow-xs'
                                  : 'text-white'
                            }`}
                          style={
                            !isNeon && !isCosmic && !isPartyPop
                              ? {
                                backgroundColor: `${currentTheme.colors.surfaceHover}`,
                                borderColor: currentTheme.colors.border,
                              }
                              : undefined
                          }
                        >
                          <span className="font-extrabold text-sm">{p.nickname}</span>
                          <button
                            onClick={() => handleHostAction('kick', { participantId: p.id })}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 p-0.5 rounded transition-all"
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
                <div className="pt-6 border-t mt-6" style={{ borderColor: isNeon || isCosmic ? 'rgba(6,182,212,0.3)' : isPartyPop ? '#F1F5F9' : `${currentTheme.colors.border}66` }}>
                  <button
                    onClick={() => handleHostAction('start')}
                    disabled={participants.length === 0}
                    className={`w-full py-4 rounded-2xl font-black text-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${isNeon
                        ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-2 border-cyan-300 shadow-[0_0_35px_rgba(236,72,153,0.7)] hover:shadow-[0_0_45px_rgba(6,182,212,0.9)]'
                        : isCosmic
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-2 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:shadow-[0_0_45px_rgba(245,158,11,0.9)]'
                          : isPartyPop
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] shadow-[0_12px_28px_rgba(124,58,237,0.35)]'
                            : 'shadow-2xl'
                      }`}
                    style={!isNeon && !isCosmic && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
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
              className={`p-6 sm:p-8 rounded-3xl border shadow-2xl text-center relative backdrop-blur-xl transition-all ${isNeon
                  ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
                  : isCosmic
                    ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
                    : isPartyPop
                      ? 'bg-white/95 border-purple-100 shadow-[0_15px_40px_rgba(124,58,237,0.08)]'
                      : ''
                }`}
              style={
                !isNeon && !isCosmic && !isPartyPop
                  ? {
                    backgroundColor: currentTheme.colors.cardBg,
                    borderColor: currentTheme.colors.border,
                  }
                  : undefined
              }
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-black uppercase px-4 py-1.5 rounded-full text-white transition-all ${isNeon
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.7)] border border-pink-300'
                      : isCosmic
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-amber-300'
                        : isPartyPop
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] shadow-sm'
                          : ''
                    }`}
                  style={!isNeon && !isCosmic && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
                >
                  Question {session.current_question_index + 1} of {session.total_questions}
                </span>

                {/* Synchronized Circular Timer */}
                <div
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-lg font-black border transition-all ${timeLeft <= 5
                      ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                      : isNeon
                        ? 'bg-[#030712] border-cyan-400/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : isCosmic
                          ? 'bg-[#040C1A] border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                          : isPartyPop
                            ? 'bg-purple-50 text-[#7C3AED] border-purple-200'
                            : 'bg-black/30 text-white'
                    }`}
                  style={!isNeon && !isCosmic && !isPartyPop && timeLeft > 5 ? { borderColor: currentTheme.colors.border } : undefined}
                >
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 ${isNeon
                  ? 'text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : isCosmic
                    ? 'text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : isPartyPop
                      ? 'text-[#0F172A]'
                      : 'text-white'
                }`}>
                {currentQuestion.question_text}
              </h2>

              {/* Answer submission count */}
              <div className={`flex items-center justify-center gap-2 text-xs font-bold ${isPartyPop ? 'text-slate-500' : 'text-slate-300'
                }`}>
                <Users className="w-4 h-4 text-emerald-500" />
                <span>
                  {totalAnswersCount} / {participants.length} Answers Submitted
                </span>
              </div>
            </div>

            {/* 4 Answer Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {currentQuestion.answer_options.map((opt, idx) => {
                const shapeInfo = answerShapes[idx] || answerShapes[0];
                const neonStyles = [
                  {
                    card: 'bg-[#18070D] border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5),inset_0_0_12px_rgba(244,63,94,0.2)] text-rose-300',
                    shape: 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]',
                  },
                  {
                    card: 'bg-[#070F22] border-2 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5),inset_0_0_12px_rgba(59,130,246,0.2)] text-blue-300',
                    shape: 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]',
                  },
                  {
                    card: 'bg-[#1C1304] border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.5),inset_0_0_12px_rgba(245,158,11,0.2)] text-amber-300',
                    shape: 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]',
                  },
                  {
                    card: 'bg-[#041B12] border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5),inset_0_0_12px_rgba(16,185,129,0.2)] text-emerald-300',
                    shape: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]',
                  },
                ];
                const cosmicStyles = [
                  {
                    card: 'bg-gradient-to-r from-[#59101C] to-[#2B080E] border-2 border-rose-500/90 shadow-[0_0_25px_rgba(244,63,94,0.4),inset_0_0_12px_rgba(244,63,94,0.15)] text-rose-300',
                    shape: 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#0C355E] to-[#061B30] border-2 border-cyan-400/90 shadow-[0_0_25px_rgba(6,182,212,0.4),inset_0_0_12px_rgba(6,182,212,0.15)] text-cyan-300',
                    shape: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#5E3808] to-[#2E1B04] border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.4),inset_0_0_12px_rgba(245,158,11,0.15)] text-amber-300',
                    shape: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#0B4527] to-[#052314] border-2 border-emerald-400/90 shadow-[0_0_25px_rgba(16,185,129,0.4),inset_0_0_12px_rgba(16,185,129,0.15)] text-emerald-300',
                    shape: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]',
                  },
                ];
                const championStyles = [
                  {
                    card: 'bg-gradient-to-r from-[#FF0055] via-[#FF2A6D] to-[#E11D48] text-white shadow-[0_0_25px_rgba(255,0,85,0.6)] border-2 border-[#FFA6C9]',
                    shape: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#00D2FF] via-[#0099FF] to-[#0284C7] text-white shadow-[0_0_25px_rgba(0,210,255,0.6)] border-2 border-[#BAE6FD]',
                    shape: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#FFE600] via-[#FBBF24] to-[#F59E0B] text-slate-950 font-black shadow-[0_0_28px_rgba(255,230,0,0.8),inset_0_0_12px_rgba(255,255,255,0.6)] border-2 border-[#FEF08A]',
                    shape: 'text-slate-950 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#00FF87] via-[#10B981] to-[#059669] text-slate-950 font-black shadow-[0_0_25px_rgba(0,255,135,0.6)] border-2 border-[#A7F3D0]',
                    shape: 'text-slate-950 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]',
                  },
                ];
                const optionStyle = isNeon ? neonStyles[idx] || neonStyles[0] : isCosmic ? cosmicStyles[idx] || cosmicStyles[0] : isChampion ? championStyles[idx] || championStyles[0] : null;

                return (
                  <div
                    key={opt.id}
                    className={`p-5 sm:p-6 rounded-2xl flex items-center gap-4 font-extrabold text-lg sm:text-xl transition-all ${optionStyle
                        ? `${optionStyle.card}`
                        : 'text-white shadow-xl'
                      }`}
                    style={!optionStyle ? { backgroundColor: shapeInfo.color } : undefined}
                  >
                    <span className={`text-2xl sm:text-3xl font-black select-none ${optionStyle ? optionStyle.shape : 'drop-shadow'
                      }`}>
                      {shapeInfo.shape}
                    </span>
                    <span className={`leading-snug ${optionStyle ? 'text-white font-bold' : ''}`}>
                      {opt.answer_text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Host Reveal Skip Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleHostAction('reveal')}
                className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 ${isNeon
                    ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-2 border-cyan-300 shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)]'
                    : isCosmic
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)]'
                      : 'shadow-xl'
                  }`}
                style={!isNeon && !isCosmic ? { backgroundColor: currentTheme.colors.primary } : undefined}
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
              className={`p-6 rounded-3xl border shadow-2xl backdrop-blur-xl text-center transition-all ${isNeon
                  ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
                  : isCosmic
                    ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
                    : isPartyPop
                      ? 'bg-white/95 border-purple-100 shadow-[0_15px_40px_rgba(124,58,237,0.08)]'
                      : ''
                }`}
              style={
                !isNeon && !isCosmic && !isPartyPop
                  ? {
                    backgroundColor: currentTheme.colors.cardBg,
                    borderColor: currentTheme.colors.border,
                  }
                  : undefined
              }
            >
              <div className={`text-xs font-bold uppercase mb-2 ${isNeon
                  ? 'text-cyan-300'
                  : isCosmic
                    ? 'text-amber-300'
                    : isPartyPop
                      ? 'text-[#7C3AED]'
                      : 'text-slate-400'
                }`}>
                Question {session.current_question_index + 1} Result
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black ${isNeon
                  ? 'text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : isCosmic
                    ? 'text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : isPartyPop
                      ? 'text-[#0F172A]'
                      : 'text-white'
                }`}>
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

                const neonStyles = [
                  {
                    card: 'bg-[#18070D] border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5),inset_0_0_12px_rgba(244,63,94,0.2)] text-rose-300',
                    shape: 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]',
                  },
                  {
                    card: 'bg-[#070F22] border-2 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5),inset_0_0_12px_rgba(59,130,246,0.2)] text-blue-300',
                    shape: 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]',
                  },
                  {
                    card: 'bg-[#1C1304] border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.5),inset_0_0_12px_rgba(245,158,11,0.2)] text-amber-300',
                    shape: 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]',
                  },
                  {
                    card: 'bg-[#041B12] border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5),inset_0_0_12px_rgba(16,185,129,0.2)] text-emerald-300',
                    shape: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]',
                  },
                ];
                const neonOptionStyle = neonStyles[idx] || neonStyles[0];

                return (
                  <div
                    key={opt.id}
                    className={`p-5 rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden ${isNeon
                        ? `${neonOptionStyle.card} ${isCorrect
                          ? 'ring-4 ring-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.8)] scale-[1.02]'
                          : 'opacity-70'
                        }`
                        : `shadow-xl border-4 ${isCorrect ? 'border-white scale-[1.02] ring-4 ring-emerald-400/50' : 'border-transparent opacity-80'
                        }`
                      }`}
                    style={!isNeon ? { backgroundColor: shapeInfo.color } : undefined}
                  >
                    <div className="flex items-center justify-between text-white font-extrabold text-lg sm:text-xl relative z-10">
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-black ${isNeon ? neonOptionStyle.shape : ''}`}>
                          {shapeInfo.shape}
                        </span>
                        <span className={isNeon ? 'text-white' : ''}>{opt.answer_text}</span>
                      </div>
                      {isCorrect && (
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow ${isNeon
                            ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.9)]'
                            : 'bg-white text-emerald-700'
                          }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                    </div>

                    <div className="mt-4 relative z-10 flex items-center justify-between text-white font-black text-sm">
                      <span className={isNeon ? 'text-slate-300' : ''}>{count} Answers</span>
                      <span className={isNeon ? 'text-cyan-300' : ''}>{dist?.percentage || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleHostAction('leaderboard')}
                className={`px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${isNeon
                    ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-2 border-cyan-300 shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)]'
                    : isCosmic
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)]'
                      : 'shadow-xl'
                  }`}
                style={!isNeon && !isCosmic ? { backgroundColor: currentTheme.colors.primary } : undefined}
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
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase text-white mb-2 ${isNeon
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.7)] border border-pink-300'
                  : isCosmic
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.7)] border border-amber-300'
                    : isPartyPop
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] shadow-md'
                      : ''
                }`}
                style={!isNeon && !isCosmic && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard Standings</span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-black ${isNeon
                  ? 'text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : isCosmic
                    ? 'text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : isPartyPop
                      ? 'text-[#0F172A]'
                      : 'text-white'
                }`}>Top Contenders</h2>
            </div>

            <div className="max-w-3xl mx-auto w-full space-y-3 flex-1 overflow-y-auto">
              {leaderboard.slice(0, 5).map((entry, idx) => (
                <div
                  key={entry.participant_id}
                  className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-pop ${isNeon
                      ? idx === 0
                        ? 'bg-[#060B1E]/95 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                        : 'bg-[#060B1E]/85 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : isCosmic
                        ? idx === 0
                          ? 'bg-[#071326]/95 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                          : 'bg-[#071326]/85 border-2 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : isPartyPop
                          ? idx === 0
                            ? 'bg-purple-50/95 border-2 border-purple-300 shadow-[0_10px_25px_rgba(124,58,237,0.12)]'
                            : 'bg-white/95 border-slate-200/80 shadow-sm'
                          : ''
                    }`}
                  style={
                    !isNeon && !isCosmic && !isPartyPop
                      ? {
                        backgroundColor: idx === 0 ? `${currentTheme.colors.primary}33` : currentTheme.colors.cardBg,
                        borderColor: idx === 0 ? currentTheme.colors.primary : currentTheme.colors.border,
                      }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white ${idx === 0
                          ? isNeon || isCosmic
                            ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.9)] scale-105'
                            : 'bg-amber-500 shadow-md scale-105'
                          : isNeon || isCosmic
                            ? 'bg-[#030712] border border-cyan-500/60 text-cyan-300'
                            : isPartyPop
                              ? 'bg-[#7C3AED] shadow-sm'
                              : 'bg-slate-700'
                        }`}
                    >
                      #{entry.rank}
                    </div>
                    <div>
                      <div className={`font-extrabold text-lg flex items-center gap-2 ${isPartyPop ? 'text-[#0F172A]' : 'text-white'
                        }`}>
                        <span>{entry.nickname}</span>
                        {entry.streak >= 2 && (
                          <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isNeon
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                              : isCosmic
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-amber-500/20 text-amber-500'
                            }`}>
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

                  <div className={`text-2xl font-black font-mono ${isNeon
                      ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : isCosmic
                        ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                        : isPartyPop
                          ? 'text-[#7C3AED]'
                          : 'text-white'
                    }`}>
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>

            {/* Advance Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleHostAction('next_question')}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${isNeon
                    ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-2 border-cyan-300 shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)]'
                    : isCosmic
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)]'
                      : isPartyPop
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] shadow-[0_12px_24px_rgba(124,58,237,0.3)]'
                        : 'shadow-xl'
                  }`}
                style={!isNeon && !isCosmic && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
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
                className={`text-xs font-black uppercase px-4 py-1.5 rounded-full text-white shadow-lg ${isCosmic
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.7)] border border-amber-300'
                    : isPartyPop
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899]'
                      : ''
                  }`}
                style={!isPartyPop && !isCosmic ? { backgroundColor: currentTheme.colors.primary } : undefined}
              >
                🎉 Tournament Complete
              </span>
              <h1 className={`text-4xl sm:text-6xl font-black mt-3 ${isCosmic ? 'text-white drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]' : isPartyPop ? 'text-[#0F172A]' : 'text-white'
                }`}>
                Victory Podium
              </h1>
              <p className={`text-sm mt-1 ${isPartyPop ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
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
