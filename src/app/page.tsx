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
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { theme, themeId, setThemeId } = useTheme();
  const [pinInput, setPinInput] = useState('');
  const [isLaunching, setIsLaunching] = useState<string | null>(null);

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

  return (
    <div className="flex-1 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md"
              style={{
                backgroundColor: `${theme.colors.surface}cc`,
                borderColor: theme.colors.border,
                color: theme.colors.textMuted,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
              <span>Free Forever • No Paywalls • 100+ Players</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
              The Free Live Quiz Platform for{' '}
              <span
                className="underline decoration-wavy underline-offset-8"
                style={{ color: theme.colors.primary }}
              >
                Everyone.
              </span>
            </h1>

            <p className="text-lg sm:text-xl max-w-2xl text-slate-300 leading-relaxed font-normal">
              Host high-energy multiplayer quizzes with real-time scoreboards, speed bonuses,
              original animated mascots, sound effects, and 4 stunning themes. No account needed to play!
            </p>

            {/* Quick Actions: Enter PIN or Create */}
            <div className="w-full max-w-md pt-2 space-y-3">
              <form onSubmit={handleJoinByPin} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit Game PIN"
                    className="w-full px-4 py-3.5 rounded-2xl font-mono text-lg font-bold tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-medium bg-black/40 border-2 focus:outline-none transition-all text-white"
                    style={{
                      borderColor: pinInput.length >= 6 ? theme.colors.primary : `${theme.colors.border}bb`,
                    }}
                  />
                  <Gamepad2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={!pinInput.trim()}
                  className="px-6 py-3.5 rounded-2xl font-black text-white shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <span>JOIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-center border transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                >
                  <Trophy className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                  <span>Host Dashboard</span>
                </Link>
                <Link
                  href="/quizzes/new"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-center border transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: `${theme.colors.primary}22`,
                    borderColor: theme.colors.primary,
                    color: theme.colors.primary,
                  }}
                >
                  <Zap className="w-4 h-4" />
                  <span>Create Quiz</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive Preview Card with Mascot */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative backdrop-blur-xl flex flex-col items-center text-center space-y-6"
              style={{
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
              }}
            >
              {/* Mascot Showcase with dynamic state */}
              <div className="py-2">
                <Mascot themeId={themeId} state="excited" size="xl" />
              </div>

              <div>
                <span
                  className="text-xs font-extrabold uppercase px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  Meet {theme.mascot.name}
                </span>
                <h3 className="text-2xl font-black mt-2 text-white">{theme.mascot.role}</h3>
                <p className="text-sm italic mt-1" style={{ color: theme.colors.textMuted }}>
                  &ldquo;{theme.mascot.tagline}&rdquo;
                </p>
              </div>

              {/* 4 Theme Answers Preview Palette */}
              <div className="grid grid-cols-2 gap-2.5 w-full pt-2">
                <div
                  className="p-3 rounded-xl flex items-center gap-2 text-white font-bold text-xs shadow"
                  style={{ backgroundColor: theme.colors.answerRed }}
                >
                  <span>▲</span>
                  <span className="truncate">Red Triangle</span>
                </div>
                <div
                  className="p-3 rounded-xl flex items-center gap-2 text-white font-bold text-xs shadow"
                  style={{ backgroundColor: theme.colors.answerBlue }}
                >
                  <span>◆</span>
                  <span className="truncate">Blue Diamond</span>
                </div>
                <div
                  className="p-3 rounded-xl flex items-center gap-2 text-white font-bold text-xs shadow"
                  style={{ backgroundColor: theme.colors.answerYellow }}
                >
                  <span>●</span>
                  <span className="truncate">Yellow Circle</span>
                </div>
                <div
                  className="p-3 rounded-xl flex items-center gap-2 text-white font-bold text-xs shadow"
                  style={{ backgroundColor: theme.colors.answerGreen }}
                >
                  <span>■</span>
                  <span className="truncate">Green Square</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTANT 1-CLICK DEMO GAMES */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 border-y transition-colors duration-300"
        style={{
          backgroundColor: `${theme.colors.surface}88`,
          borderColor: `${theme.colors.border}66`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div
                className="text-xs font-black uppercase tracking-wider mb-1"
                style={{ color: theme.colors.primary }}
              >
                Instant Action
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Launch a Live Game in 3 Seconds
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-1">
                Choose any pre-built quiz below to generate an instant Game PIN and QR code room.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
              style={{ color: theme.colors.primary }}
            >
              <span>View All Saved Quizzes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEED_QUIZZES.map((quiz) => {
              const qTheme = THEMES[quiz.theme_id];
              return (
                <div
                  key={quiz.id}
                  className="rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg"
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    borderColor: `${theme.colors.border}aa`,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: qTheme.colors.primary }}
                      >
                        {qTheme.name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {quiz.questions.length} Questions
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg text-white mb-2 leading-snug">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleQuickLaunch(quiz.id)}
                    disabled={isLaunching === quiz.id}
                    className="w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: qTheme.colors.primary }}
                  >
                    {isLaunching === quiz.id ? (
                      <span className="animate-pulse">Starting Live Room...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Live Game</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 THEMES SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span
            className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
            style={{
              backgroundColor: `${theme.colors.surface}`,
              borderColor: theme.colors.border,
              color: theme.colors.primary,
            }}
          >
            Adaptive Visual Identity
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-3">
            Four Full Visual Themes
          </h2>
          <p className="text-base text-slate-300 mt-2">
            Switch themes freely! The selected theme synchronizes seamlessly to the host projector
            display and all player devices.
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
                className={`rounded-3xl border-2 p-6 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 ${
                  isSelected ? 'shadow-2xl ring-2' : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: t.colors.surface,
                  borderColor: isSelected ? t.colors.primary : t.colors.border,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: t.colors.primary }}
                    >
                      {t.badge}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>

                  {/* Mascot for theme */}
                  <div className="h-28 flex items-center justify-center my-2">
                    <Mascot themeId={tId} state={isSelected ? 'celebrating' : 'idle'} size="lg" />
                  </div>

                  <h3 className="text-xl font-black text-white">{t.name}</h3>
                  <p className="text-xs font-semibold mt-1" style={{ color: t.colors.textMuted }}>
                    {t.tagline}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t" style={{ borderColor: `${t.colors.border}88` }}>
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.secondary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.answerYellow }} />
                  </div>
                  <button
                    className="w-full py-2 rounded-xl text-xs font-extrabold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: t.colors.primary }}
                  >
                    {isSelected ? 'Currently Selected' : `Preview ${t.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 border-t"
        style={{
          backgroundColor: `${theme.colors.surface}aa`,
          borderColor: `${theme.colors.border}66`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Built for Scale, Speed & Maximum Fun
            </h2>
            <p className="text-slate-300 mt-2">
              Everything you need for classrooms, conferences, game nights, and tech meetups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.primary}33`, color: theme.colors.primary }}
              >
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100+ Concurrent Players</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Engineered for simultaneous joins and real-time synchronized answer submissions with
                sub-second state broadcasts.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.secondary}33`, color: theme.colors.secondary }}
              >
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Zero-Install QR Joining</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Players simply scan the host projector QR code or enter a 6-digit PIN on any mobile
                device. No app downloads or accounts required.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.accent}33`, color: theme.colors.accent }}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Server-Authoritative Anti-Cheat</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Correct answers are never sent to player browsers before the reveal. Timers, speed
                bonuses, and duplicate answer protections are validated server-side.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.answerYellow}33`, color: theme.colors.answerYellow }}
              >
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Speed Scoring & Streaks</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Deterministic mathematical scoring rewards lightning-fast correct answers with up to
                double points, boosting competition and leaderboard excitement.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.answerGreen}33`, color: theme.colors.answerGreen }}
              >
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Web Audio Synthesizer</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Programmatic audio generated via Web Audio API. Zero missing sound assets, zero
                copyright conflicts, with built-in mute and volume controls.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.primary}33`, color: theme.colors.primary }}
              >
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Grand Victory Podium</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Celebrate winners with dynamic 1st, 2nd, and 3rd place podium pedestals, mascot
                celebrations, full accuracy stats, and celebratory confetti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-10 px-4 sm:px-6 lg:px-8 border-t mt-auto"
        style={{
          backgroundColor: theme.colors.background,
          borderColor: `${theme.colors.border}66`,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">⚡ ANTI KAHOOT</span>
            <span className="text-xs text-slate-400">
              — 100% Free Open Multiplayer Quiz Arena
            </span>
          </div>
          <div className="flex items-center space-x-6 text-xs text-slate-400 font-medium">
            <Link href="/join" className="hover:text-white transition-colors">
              Join Game
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Host Dashboard
            </Link>
            <Link href="/quizzes/new" className="hover:text-white transition-colors">
              Create Quiz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
