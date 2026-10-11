'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { THEMES, ThemeId } from '@/types/theme';
import { Mascot } from '@/components/mascot/Mascot';
import { SEED_QUIZZES } from '@/lib/seed-data';
import { sounds } from '@/lib/audio';
import {
  Sparkles,
  Gamepad2,
  Users,
  ShieldCheck,
  Zap,
  Trophy,
  ArrowRight,
  Play,
  QrCode,
  Music,
  CheckCircle2,
  Flame,
  Bomb,
  Layers,
  Volume2,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { theme, themeId, setThemeId } = useTheme();
  const [pinInput, setPinInput] = useState('');
  const [isLaunching, setIsLaunching] = useState<string | null>(null);
  const [activeInteractiveOption, setActiveInteractiveOption] = useState<number | null>(null);

  const handleJoinByPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) return;
    sounds.playAnswerSubmitted();
    router.push(`/join?pin=${cleanPin}`);
  };

  const handleQuickLaunch = async (quizId: string) => {
    try {
      setIsLaunching(quizId);
      sounds.playQuestionStart();
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        router.push(`/host/${data.session.game_pin}`);
      } else {
        alert(data.error || 'Failed to launch game');
        setIsLaunching(null);
      }
    } catch (err) {
      alert('Network error launching game');
      setIsLaunching(null);
    }
  };

  const handleSoundboardClick = (idx: number, type: 'red' | 'blue' | 'yellow' | 'green') => {
    setActiveInteractiveOption(idx);
    if (type === 'green') {
      sounds.playCorrect();
    } else if (type === 'red') {
      sounds.playIncorrect();
    } else {
      sounds.playAnswerSubmitted();
    }
    setTimeout(() => setActiveInteractiveOption(null), 600);
  };

  return (
    <div className="flex-1 flex flex-col selection:bg-[#FF007F] selection:text-white">
      {/* =========================================================================
          HERO SECTION: GEN-Z STREETWEAR / GRAFFITI AESTHETIC
      ========================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Graffiti Street Badges Row */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#10B981] text-black border-2 border-black shadow-brutal-sm -rotate-1">
            <span>⚡ 100% FREE FOREVER</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#FF007F] text-white border-2 border-black shadow-brutal-sm rotate-2">
            <span>NO BS • NO PAYWALLS</span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#7C3AED] text-white border-2 border-black shadow-brutal-sm -rotate-1">
            <span>100+ SIMULTANEOUS PLAYERS</span>
          </div>
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#FACC15] text-black border-2 border-black shadow-brutal-sm rotate-1">
            <span>★ ZERO LOGIN FOR PLAYERS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Bold Typography & PIN Launcher */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.04] text-[#121212] uppercase">
              The Live Quiz Arena That{' '}
              <span className="relative inline-block text-white px-2 py-0.5 bg-[#121212] rounded-lg -rotate-1 shadow-brutal-purple mx-1">
                <span className="bg-gradient-to-r from-[#10B981] via-[#FACC15] to-[#FF007F] bg-clip-text text-transparent">
                  Doesn&apos;t Suck.
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-700 font-semibold leading-relaxed max-w-2xl">
              Tired of 10-player paywalls, corporate snooze-fests, and clunky apps? Anti Kahoot is
              the open-source, high-energy live quiz platform. QR joining, speed bonuses, synth audio,
              and full graffiti street flair.
            </p>

            {/* Tactile Brutalist PIN Box */}
            <div className="w-full max-w-lg p-5 rounded-3xl bg-white border-3 border-black shadow-brutal-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-[#121212] flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-[#7C3AED]" />
                  <span>JUMP STRAIGHT INTO A GAME</span>
                </span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-[#10B981] text-black border border-black">
                  Instant Join
                </span>
              </div>

              <form onSubmit={handleJoinByPin} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="ENTER 6-DIGIT PIN"
                    className="w-full px-4 py-3.5 rounded-xl font-mono text-center text-xl font-black tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-black bg-[#FAFAF7] border-2 border-black text-[#121212] focus:outline-none focus:bg-[#FACC15]/20 focus:border-[#7C3AED] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!pinInput.trim()}
                  className="px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-black bg-[#10B981] hover:bg-[#059669] hover:text-white border-2 border-black shadow-brutal hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>ENTER ARENA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Host Action Buttons */}
              <div className="pt-2 border-t-2 border-black/10 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className="flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#6D28D9] border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Host A Live Game</span>
                </Link>
                <Link
                  href="/quizzes/new"
                  className="flex-1 py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#121212] bg-[#FF007F] text-white hover:bg-[#E11D48] border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Create Quiz</span>
                </Link>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> No Credit Card Ever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Unlimited Question Types
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF007F]" /> Projector Fullscreen Mode
              </span>
            </div>
          </div>

          {/* Right Column: Sticker-Bombed Interactive Showcase Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md bg-white rounded-3xl border-3 border-black shadow-brutal-xl p-6 relative flex flex-col space-y-5">
              {/* Top Card Bar with simulated room status */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                  <span className="font-mono text-xs font-black text-[#121212]">
                    LIVE ARENA #356178
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#121212] text-white">
                  ROUND 2/4
                </div>
              </div>

              {/* Graffiti Mascot Arena Stage */}
              <div className="relative py-3 flex flex-col items-center justify-center bg-[#FAFAF7] rounded-2xl border-2 border-black p-4 overflow-hidden">
                {/* Background spray blobs */}
                <div className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded bg-[#FACC15] border border-black -rotate-6 shadow-brutal-sm">
                  STREAK 5X 🔥
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-black px-2 py-0.5 rounded bg-[#10B981] text-black border border-black rotate-6 shadow-brutal-sm">
                  +990 PTS
                </div>

                <div className="my-2">
                  <Mascot themeId={themeId} state="excited" size="lg" />
                </div>

                <div className="text-center mt-1">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white border border-black">
                    {theme.mascot.name}
                  </span>
                  <div className="text-sm font-black text-[#121212] mt-1">
                    &ldquo;{theme.mascot.tagline}&rdquo;
                  </div>
                </div>
              </div>

              {/* Interactive Soundboard Answer Pad */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>TAP TO TEST SYNTH SOUNDS</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Interactive</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleSoundboardClick(0, 'red')}
                    className={`p-3 rounded-xl border-2 border-black flex items-center gap-2.5 font-black text-xs text-white shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      activeInteractiveOption === 0 ? 'scale-95 ring-2 ring-black' : ''
                    }`}
                    style={{ backgroundColor: theme.colors.answerRed }}
                  >
                    <span className="text-lg">▲</span>
                    <span className="truncate">Red Triangle</span>
                  </button>

                  <button
                    onClick={() => handleSoundboardClick(1, 'blue')}
                    className={`p-3 rounded-xl border-2 border-black flex items-center gap-2.5 font-black text-xs text-white shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      activeInteractiveOption === 1 ? 'scale-95 ring-2 ring-black' : ''
                    }`}
                    style={{ backgroundColor: theme.colors.answerBlue }}
                  >
                    <span className="text-lg">◆</span>
                    <span className="truncate">Blue Diamond</span>
                  </button>

                  <button
                    onClick={() => handleSoundboardClick(2, 'yellow')}
                    className={`p-3 rounded-xl border-2 border-black flex items-center gap-2.5 font-black text-xs text-black shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      activeInteractiveOption === 2 ? 'scale-95 ring-2 ring-black' : ''
                    }`}
                    style={{ backgroundColor: theme.colors.answerYellow }}
                  >
                    <span className="text-lg">●</span>
                    <span className="truncate">Yellow Circle</span>
                  </button>

                  <button
                    onClick={() => handleSoundboardClick(3, 'green')}
                    className={`p-3 rounded-xl border-2 border-black flex items-center gap-2.5 font-black text-xs text-white shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      activeInteractiveOption === 3 ? 'scale-95 ring-2 ring-black' : ''
                    }`}
                    style={{ backgroundColor: theme.colors.answerGreen }}
                  >
                    <span className="text-lg">■</span>
                    <span className="truncate">Green Square (Chime!)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STREET STATS BRUTALIST TICKER
      ========================================================================== */}
      <section className="border-y-3 border-black bg-[#121212] text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#10B981]">100+</span>
            <span className="text-xs font-black uppercase text-slate-300 mt-1">
              Simultaneous Players
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#FACC15]">$0/MO</span>
            <span className="text-xs font-black uppercase text-slate-300 mt-1">
              Zero Subscriptions Forever
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#FF007F]">1 SCAN</span>
            <span className="text-xs font-black uppercase text-slate-300 mt-1">
              Instant QR Mobile Join
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#A855F7]">780+</span>
            <span className="text-xs font-black uppercase text-slate-300 mt-1">
              Answer Throughput Req/S
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INSTANT 1-CLICK DROP MIXTAPES (PRE-SEEDED QUIZZES)
      ========================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black shadow-brutal-sm mb-2">
              <span>★ READY TO DROP</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#121212] uppercase tracking-tight">
              Launch Live in 3 Seconds
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-semibold mt-1">
              Pick any pre-loaded quiz below to generate an instant Game PIN & QR Code room.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase text-[#121212] bg-white border-2 border-black shadow-brutal hover:shadow-brutal-lg transition-all"
          >
            <span>View All Saved Quizzes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SEED_QUIZZES.map((quiz) => {
            const qTheme = THEMES[quiz.theme_id] || THEMES['party-pop'];
            const isCurrLaunching = isLaunching === quiz.id;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl border-3 border-black shadow-brutal-lg p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-brutal-xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border-2 border-black bg-[#10B981] text-black shadow-brutal-sm">
                      {qTheme.name}
                    </span>
                    <span className="text-xs font-black text-slate-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {quiz.questions.length} Qs
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-[#121212] mb-2 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-5 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                <button
                  onClick={() => handleQuickLaunch(quiz.id)}
                  disabled={isCurrLaunching}
                  className="w-full py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#121212] hover:bg-[#7C3AED] border-2 border-black shadow-brutal hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {isCurrLaunching ? (
                    <span className="animate-pulse">SPAWNING ROOM...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>LAUNCH ARENA</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FOUR VISUAL THEMES SHOWCASE
      ========================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t-3 border-black bg-[#F4F4F0]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-black bg-[#FF007F] text-white shadow-brutal-sm">
              ADAPTIVE THEMES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#121212] uppercase mt-3">
              Four Visual Worlds
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-semibold mt-2">
              Hosts can switch themes anytime. The chosen aesthetic instantly syncs to the projector
              display and every connected phone screen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
              const t = THEMES[tId];
              const isSelected = themeId === tId;

              return (
                <div
                  key={tId}
                  onClick={() => {
                    setThemeId(tId);
                    sounds.playPlayerJoined();
                  }}
                  className={`bg-white rounded-3xl border-3 border-black p-5 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 ${
                    isSelected ? 'shadow-brutal-xl ring-2 ring-black' : 'shadow-brutal'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black bg-[#FACC15] text-black">
                        {t.badge}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-black text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="h-28 flex items-center justify-center my-2 bg-[#FAFAF7] rounded-2xl border-2 border-black/10">
                      <Mascot themeId={tId} state={isSelected ? 'celebrating' : 'idle'} size="lg" />
                    </div>

                    <h3 className="text-xl font-black text-[#121212] uppercase">{t.name}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">{t.tagline}</p>
                    <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-black/10">
                    <button
                      className={`w-full py-2 rounded-xl text-xs font-black uppercase border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all ${
                        isSelected ? 'bg-[#121212] text-white' : 'bg-white text-black hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? 'CURRENTLY APPLIED' : `PREVIEW ${t.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE BREAKDOWN CARDS
      ========================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-[#121212] uppercase">
            Engineered For Pure Competition
          </h2>
          <p className="text-slate-600 font-semibold mt-1 text-sm sm:text-base">
            Everything you need to host classroom battles, gaming tournaments, and tech meetups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border-3 border-black shadow-brutal">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981] border-2 border-black flex items-center justify-center mb-4 shadow-brutal-sm font-black text-black">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#121212] uppercase mb-1">
              100+ Live Player Target
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Tested with 100 simultaneous simulated joins and answer bursts at over 780 requests/sec with zero score corruption.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-black shadow-brutal">
            <div className="w-12 h-12 rounded-2xl bg-[#FF007F] border-2 border-black flex items-center justify-center mb-4 shadow-brutal-sm font-black text-white">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#121212] uppercase mb-1">
              Zero-App QR Code Join
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Players simply scan the big screen with their phone camera. No logins, passwords, or app installations required.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-black shadow-brutal">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] border-2 border-black flex items-center justify-center mb-4 shadow-brutal-sm font-black text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#121212] uppercase mb-1">
              Server-Authoritative Anti-Cheat
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Correct answers are NEVER sent to player browsers before the reveal. Timers and scoring are validated server-side.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
      ========================================================================== */}
      <footer className="border-t-3 border-black bg-white py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-black text-[#121212]">⚡ ANTI KAHOOT</span>
            <span className="text-xs font-bold text-slate-500">
              — The 100% Free Open Multiplayer Quiz Arena
            </span>
          </div>
          <div className="flex items-center space-x-6 text-xs font-black text-[#121212]">
            <Link href="/join" className="hover:text-[#7C3AED] transition-colors">
              JOIN BY PIN
            </Link>
            <Link href="/dashboard" className="hover:text-[#7C3AED] transition-colors">
              HOST DASHBOARD
            </Link>
            <Link href="/quizzes/new" className="hover:text-[#7C3AED] transition-colors">
              CREATE QUIZ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
