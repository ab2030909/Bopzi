'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { THEMES, ThemeId } from '@/types/theme';
import { TvMascot } from '@/components/mascot/TvMascot';
import { sounds } from '@/lib/audio';
import {
  Gamepad2,
  ArrowRight,
  Plus,
  Star,
  GraduationCap,
  Users2,
  Calendar,
  Building2,
  Heart,
  Pencil,
  Share2,
  UserCheck,
  Trophy,
  CheckCircle2,
  QrCode,
  Volume2,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { setThemeId, themeId } = useTheme();
  const [selectedVibe, setSelectedVibe] = useState<ThemeId>('party-pop');
  const [activeScreenAnswer, setActiveScreenAnswer] = useState<string | null>(null);

  const handleLaunchGame = async (quizId: string = 'quiz-party-pop-01') => {
    try {
      sounds.playQuestionStart();
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        router.push(`/host/${data.session.game_pin}`);
      }
    } catch (e) {
      router.push('/dashboard');
    }
  };

  const handleAnswerTap = (name: string, isCorrect: boolean) => {
    setActiveScreenAnswer(name);
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playAnswerSubmitted();
    }
    setTimeout(() => setActiveScreenAnswer(null), 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-x-hidden selection:bg-[#EC4899] selection:text-white">
      {/* =========================================================================
          HERO SECTION (MATCHING REFERENCE IMAGE EXACTLY)
      ========================================================================== */}
      <section className="relative pt-6 pb-16 md:pt-10 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Soft background pastel decorative doodles */}
        <div className="absolute top-12 left-6 text-yellow-300 text-3xl opacity-80 pointer-events-none select-none">
          ✨
        </div>
        <div className="absolute top-28 right-12 text-pink-300 text-4xl opacity-70 pointer-events-none select-none">
          👑
        </div>
        <div className="absolute -bottom-8 left-1/3 text-emerald-300 text-3xl opacity-60 pointer-events-none select-none">
          〰️
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT COLUMN: HEADLINE, SUBTITLE, CTAS, SOCIAL PROOF */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            {/* 100% FREE Pill Badge */}
            <div className="inline-flex items-center gap-2.5 p-1 pr-4 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-600 shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-[#16A34A] text-white font-extrabold uppercase text-[11px] tracking-wide">
                100% FREE
              </span>
              <span>No subscriptions • No limits • Just play</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-[#0F172A] leading-[1.08]">
              Make Learning<br />
              and Events<br />
              More{' '}
              <span className="inline-flex">
                <span className="text-[#EC4899]">F</span>
                <span className="text-[#7C3AED]">u</span>
                <span className="text-[#16A34A]">n.</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              Anti Kahoot is a free, interactive quiz platform for classrooms, events, communities and friends. Create your own quiz, share a game PIN and let everyone play together in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/dashboard"
                onClick={() => sounds.playQuestionStart()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create a Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/join"
                onClick={() => sounds.playCountdownTick()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Gamepad2 className="w-4 h-4 text-[#7C3AED]" />
                <span>Join a Game</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 pt-4">
              {/* Overlapping student avatar circles */}
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
              </div>

              {/* Stars & Text */}
              <div className="flex flex-col text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="flex text-[#F59E0B]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="font-bold text-slate-800">4.9/5</span>
                  <span className="text-slate-500 font-normal">(1K+ games hosted)</span>
                </div>
                <span>Loved by students, teachers and communities</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: THE BIG SCREEN + CUTE TV MASCOT + STUDENTS AUDIENCE */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            {/* Top Right Sticky Note */}
            <div className="absolute -top-6 -right-2 sm:right-2 z-20 bg-[#FEF08A] text-slate-900 px-3.5 py-2 rounded-md shadow-md rotate-6 border border-yellow-300 font-black text-xs uppercase tracking-tight flex flex-col items-center select-none">
              <span className="text-[10px] text-emerald-700 font-extrabold">QUIZ</span>
              <span>PLAY TOGETHER</span>
              <span className="text-emerald-700 font-black">FREE!</span>
            </div>

            {/* Floating Winking TV-Head Mascot pointing at the screen */}
            <div className="absolute -top-12 -left-8 sm:-left-12 z-20 animate-float-slow">
              <TvMascot variant="party" size="lg" winking={true} />
            </div>

            {/* The Big Monitor / Presentation Screen */}
            <div className="w-full bg-[#1E1B4B] rounded-3xl p-3 sm:p-4 shadow-2xl border-4 border-slate-900 relative overflow-hidden">
              {/* Screen Top Bar */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-indigo-900/60">
                {/* Brand watermark */}
                <div className="flex items-center gap-1 font-black text-sm text-white">
                  <span className="text-amber-400 text-xs">👑</span>
                  <span className="text-purple-300">ANTI</span>
                  <span className="text-pink-400">KAHOOT</span>
                </div>

                {/* Game PIN & Join pill */}
                <div className="flex items-center gap-3 bg-white/10 px-3.5 py-1.5 rounded-full text-xs text-white backdrop-blur-sm">
                  <span className="text-slate-300 font-medium">Join at antikahoot.com</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[10px]">Game PIN</span>
                    <span className="font-mono font-black text-white text-sm">784 210</span>
                  </div>
                  <QrCode className="w-4 h-4 text-white/80" />
                </div>

                {/* Players counter */}
                <div className="bg-[#7C3AED] px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                  <span>32</span>
                  <span className="text-[10px] text-purple-200">Players</span>
                </div>
              </div>

              {/* Active Question Display */}
              <div className="my-4 bg-white rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4">
                {/* Left: Circular Timer & Question Text */}
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-12 h-12 rounded-full border-4 border-[#7C3AED] bg-purple-50 flex items-center justify-center font-black text-lg text-[#7C3AED] flex-shrink-0 shadow-inner">
                    12
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-600 mb-0.5">
                      Question 3 / 10
                    </div>
                    <h3 className="text-base sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      Which planet is known as the Red Planet?
                    </h3>
                  </div>
                </div>

                {/* Right: Mars Illustration / Photo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-orange-950 flex-shrink-0 border-2 border-orange-200 shadow">
                  <img
                    src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=160&auto=format&fit=crop&q=80"
                    alt="Mars Red Planet"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 4 Answer Buttons (Matching reference colors exactly!) */}
              <div className="grid grid-cols-2 gap-2.5 pb-2">
                {/* 1. Mars - Coral Red with Triangle */}
                <button
                  onClick={() => handleAnswerTap('Mars', true)}
                  className={`p-3.5 sm:p-4 rounded-xl font-extrabold text-sm sm:text-base text-white flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all ${
                    activeScreenAnswer === 'Mars' ? 'ring-4 ring-white animate-pop' : ''
                  }`}
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <span className="text-xl font-black">▲</span>
                  <span className="truncate">Mars</span>
                </button>

                {/* 2. Jupiter - Sky Blue with Diamond */}
                <button
                  onClick={() => handleAnswerTap('Jupiter', false)}
                  className={`p-3.5 sm:p-4 rounded-xl font-extrabold text-sm sm:text-base text-white flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all ${
                    activeScreenAnswer === 'Jupiter' ? 'ring-4 ring-white animate-pop' : ''
                  }`}
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <span className="text-xl font-black">◆</span>
                  <span className="truncate">Jupiter</span>
                </button>

                {/* 3. Venus - Bright Green with Circle */}
                <button
                  onClick={() => handleAnswerTap('Venus', false)}
                  className={`p-3.5 sm:p-4 rounded-xl font-extrabold text-sm sm:text-base text-white flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all ${
                    activeScreenAnswer === 'Venus' ? 'ring-4 ring-white animate-pop' : ''
                  }`}
                  style={{ backgroundColor: '#16A34A' }}
                >
                  <span className="text-xl font-black">●</span>
                  <span className="truncate">Venus</span>
                </button>

                {/* 4. Saturn - Warm Yellow with Square */}
                <button
                  onClick={() => handleAnswerTap('Saturn', false)}
                  className={`p-3.5 sm:p-4 rounded-xl font-extrabold text-sm sm:text-base text-white flex items-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all ${
                    activeScreenAnswer === 'Saturn' ? 'ring-4 ring-white animate-pop' : ''
                  }`}
                  style={{ backgroundColor: '#EAB308' }}
                >
                  <span className="text-xl font-black">■</span>
                  <span className="truncate">Saturn</span>
                </button>
              </div>
            </div>

            {/* Students Playing In Front of Screen (Phone holders viewed from back) */}
            <div className="flex items-end justify-center -space-x-4 sm:-space-x-6 -mt-6 sm:-mt-8 z-10 select-none pointer-events-none">
              {/* Student 1 (Red phone button) */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-14 bg-slate-900 rounded-lg p-1 border-2 border-slate-700 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-[#EF4444] rounded flex items-center justify-center text-white text-xs font-black">
                    ▲
                  </div>
                </div>
                <div className="w-16 h-12 bg-purple-700 rounded-t-full -mt-2" />
              </div>

              {/* Student 2 (Green phone button) */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-14 bg-slate-900 rounded-lg p-1 border-2 border-slate-700 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-[#16A34A] rounded flex items-center justify-center text-white text-xs font-black">
                    ●
                  </div>
                </div>
                <div className="w-16 h-14 bg-pink-600 rounded-t-full -mt-2" />
              </div>

              {/* Student 3 (Blue phone button) with cap */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-14 bg-slate-900 rounded-lg p-1 border-2 border-slate-700 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-[#3B82F6] rounded flex items-center justify-center text-white text-xs font-black">
                    ◆
                  </div>
                </div>
                <div className="w-18 h-14 bg-amber-500 rounded-t-full -mt-2" />
              </div>

              {/* Student 4 (Yellow phone button) */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-14 bg-slate-900 rounded-lg p-1 border-2 border-slate-700 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-[#EAB308] rounded flex items-center justify-center text-white text-xs font-black">
                    ■
                  </div>
                </div>
                <div className="w-16 h-12 bg-emerald-600 rounded-t-full -mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "PERFECT FOR" BAR
      ========================================================================== */}
      <section className="py-6 border-y border-slate-100 bg-[#FAFAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-6 text-xs font-bold text-slate-600">
          <span className="uppercase tracking-wider text-slate-600 font-extrabold">
            PERFECT FOR
          </span>

          <div className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-default">
            <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
            <span>Schools & Colleges</span>
          </div>

          <div className="flex items-center gap-2 hover:text-[#EC4899] transition-colors cursor-default">
            <Users2 className="w-4 h-4 text-[#EC4899]" />
            <span>Communities</span>
          </div>

          <div className="flex items-center gap-2 hover:text-[#8B5CF6] transition-colors cursor-default">
            <Calendar className="w-4 h-4 text-[#8B5CF6]" />
            <span>Events & Hackathons</span>
          </div>

          <div className="flex items-center gap-2 hover:text-[#3B82F6] transition-colors cursor-default">
            <Building2 className="w-4 h-4 text-[#3B82F6]" />
            <span>Companies</span>
          </div>

          <div className="flex items-center gap-2 hover:text-[#10B981] transition-colors cursor-default">
            <Heart className="w-4 h-4 text-[#10B981]" />
            <span>Friends & Family</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "CHOOSE YOUR VIBE" SECTION (MATCHING SCREENSHOT EXACTLY)
      ========================================================================== */}
      <section id="themes" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="relative inline-block">
            {/* Green doodle sprout above "Vibe" */}
            <div className="absolute -top-5 right-2 text-emerald-500 font-black text-xl animate-bounce-gentle">
              🌱
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Choose Your <span className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Vibe</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            Four unique themes to make every quiz feel special. All free.
          </p>
        </div>

        {/* 4 Theme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Party Pop */}
          <div
            onClick={() => {
              setThemeId('party-pop');
              sounds.playPlayerJoined();
            }}
            className="p-6 rounded-3xl bg-[#F5F3FF] border border-purple-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">Party Pop</h3>
              <p className="text-xs text-slate-500 font-medium">Bright, playful and full of energy.</p>

              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm mt-4 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="h-32 flex items-center justify-center mt-4">
              <TvMascot variant="party" size="md" winking={true} />
            </div>
          </div>

          {/* Card 2: Neon Arcade */}
          <div
            onClick={() => {
              setThemeId('neon-arcade');
              sounds.playCountdownTick();
            }}
            className="p-6 rounded-3xl bg-[#0F172A] text-white border border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Neon Arcade</h3>
              <p className="text-xs text-slate-400 font-medium">Dark, futuristic and gaming vibes.</p>

              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shadow-sm mt-4 group-hover:bg-[#00F0FF] group-hover:text-black transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="h-32 flex items-center justify-center mt-4">
              <TvMascot variant="neon" size="md" />
            </div>
          </div>

          {/* Card 3: Cosmic Quest */}
          <div
            onClick={() => {
              setThemeId('cosmic-quest');
              sounds.playCountdownTick();
            }}
            className="p-6 rounded-3xl bg-[#090D25] text-white border border-indigo-900/50 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Cosmic Quest</h3>
              <p className="text-xs text-slate-400 font-medium">Explore the universe with style.</p>

              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shadow-sm mt-4 group-hover:bg-[#38BDF8] group-hover:text-black transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="h-32 flex items-center justify-center mt-4">
              <TvMascot variant="cosmic" size="md" />
            </div>
          </div>

          {/* Card 4: Champion Mode */}
          <div
            onClick={() => {
              setThemeId('champion-mode');
              sounds.playPlayerJoined();
            }}
            className="p-6 rounded-3xl bg-[#FEFCE8] border border-amber-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">Champion Mode</h3>
              <p className="text-xs text-slate-500 font-medium">Elegant and competitive for serious games.</p>

              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm mt-4 group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="h-32 flex items-center justify-center mt-4">
              <TvMascot variant="champion" size="md" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "HOW IT WORKS" SECTION (MATCHING SCREENSHOT EXACTLY)
      ========================================================================== */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="relative inline-block">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              How It Works
            </h2>
            <div className="text-emerald-500 text-lg absolute -top-3.5 -right-5">
              〰️
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            Create, share and play in just a few steps.
          </p>
        </div>

        {/* 4 Connected Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Step 1 */}
          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-extrabold text-sm text-[#0F172A]">Create a Quiz</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Add questions, choose a theme and customize settings.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EC4899] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-extrabold text-sm text-[#0F172A]">Share the Game PIN</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Start a game and share the PIN or QR code with your players.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-[#16A34A] text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-extrabold text-sm text-[#0F172A]">Everyone Joins</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Players enter the PIN, choose a nickname and join instantly.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAB308] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-[#EAB308] text-white text-[10px] font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-extrabold text-sm text-[#0F172A]">Play Together</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Answer questions in real time, climb the leaderboard and have fun!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
      ========================================================================== */}
      <footer className="border-t border-slate-100 bg-[#FAFAFC] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-1 font-black text-xl">
            <span className="text-[#F59E0B] text-sm">👑</span>
            <span className="text-[#3B127A]">ANTI</span>
            <span className="text-[#EC4899] ml-1">KAHOOT</span>
            <span className="text-xs text-slate-500 font-semibold ml-2">
              — Free Real-Time Multiplayer Quiz Arena
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-bold text-slate-600">
            <Link href="/join" className="hover:text-[#7C3AED] transition-colors">
              Join a Game
            </Link>
            <Link href="/dashboard" className="hover:text-[#7C3AED] transition-colors">
              Host Dashboard
            </Link>
            <Link href="/quizzes/new" className="hover:text-[#7C3AED] transition-colors">
              Create a Quiz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
