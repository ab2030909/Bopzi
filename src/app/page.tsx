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
  BookOpen,
  Globe2,
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  ChevronDown,
  Flame,
  Quote,
  BarChart3,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { setThemeId, themeId } = useTheme();
  const [selectedVibe, setSelectedVibe] = useState<ThemeId>('party-pop');
  const [activeScreenAnswer, setActiveScreenAnswer] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
          HERO SECTION (IMMERSIVE BLENDED BACKGROUND MATCHING SCREENSHOT 2)
      ========================================================================== */}
      <section className="relative w-full overflow-hidden bg-white min-h-[500px] lg:min-h-[540px] flex items-center">
        {/* Pastel Organic Background Doodles on the Left (Matching reference) */}
        <div className="absolute -top-10 -left-16 w-56 h-56 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none select-none z-0" />
        <div className="absolute top-28 -left-20 w-48 h-48 bg-purple-100/50 rounded-full blur-2xl pointer-events-none select-none z-0" />
        <div className="absolute -bottom-10 -left-12 w-44 h-44 bg-lime-100/50 rounded-full blur-2xl pointer-events-none select-none z-0" />

        {/* Abstract organic shapes on left edge */}
        <div className="absolute bottom-4 left-0 w-8 h-24 bg-lime-200/40 rounded-r-full blur-sm pointer-events-none select-none z-0" />
        <div className="absolute top-16 left-0 w-10 h-32 bg-purple-200/30 rounded-r-full blur-sm pointer-events-none select-none z-0" />

        {/* IMMERSIVE RIGHT-SIDE CLASSROOM SCENE BACKGROUND (Edge-to-edge on right, smoothly blended on left, NO CARD) */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[62%] h-full z-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/images/hero-classroom-bg.png"
            alt="Bopzi Live Classroom Arena"
            className="w-full h-full object-cover object-left block"
          />
        </div>

        {/* CONTENT CONTAINER (Max width 1550px, centered) */}
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 w-full relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[500px] lg:min-h-[540px]">
          {/* LEFT COLUMN: HEADLINE, SUBTITLE, CTAS, SOCIAL PROOF (Extra 2 finger gap from left corner) */}
          <div className="w-full lg:w-[42%] xl:w-[38%] flex-shrink-0 flex flex-col items-start py-8 lg:py-12 pl-12 sm:pl-16 lg:pl-20 xl:pl-24 z-20">
            {/* 100% FREE Pill Badge with 4-point sparkle icon */}
            <div className="inline-flex items-center gap-2 p-1 pr-3.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-600 shadow-2xs mb-5">
              <span className="flex items-center justify-center w-4 h-4 ml-1 text-sm select-none">

              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white font-black uppercase text-[10px] tracking-wide">
                100% FREE
              </span>
              <span className="text-slate-600 font-semibold text-xs">No subscriptions • No limits • Just play</span>
            </div>

            {/* Main Headline (Matching Screenshot 2 exactly: More in Purple, Fun in Pink) */}
            <h1 className="text-5xl sm:text-6xl lg:text-[58px] xl:text-[66px] font-black tracking-tight text-[#0F172A] leading-[1.06] mb-4">
              Make Learning<br />
              and Events<br />
              <span className="text-[#7C3AED]">More</span>{' '}
              <span className="text-[#EC4899]">Fun</span>
              <span className="text-[#0F172A]">.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-md mb-6">
              Bopzi is a free, interactive quiz platform for classrooms, events, communities and friends. Create your own quiz, share a game PIN and let everyone play together in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-6">
              <Link
                href="/dashboard"
                onClick={() => sounds.playQuestionStart()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm md:text-base text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="text-lg font-black leading-none">+</span>
                <span>Create a Quiz</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                href="/join"
                onClick={() => sounds.playCountdownTick()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm md:text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Gamepad2 className="w-4 h-4 text-[#7C3AED]" />
                <span>Join a Game</span>
              </Link>
            </div>

            {/* Social Proof (Overlapping avatars + Stars + Count in Screenshot 2 order) */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 select-none">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                  alt="Student avatar"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              </div>

              <div className="flex flex-col text-xs font-semibold text-slate-600">
                <span className="text-slate-600 text-xs font-semibold">Loved by students, teachers and communities</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-[#F59E0B]">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-xs">4.9/5</span>
                  <span className="text-slate-400 font-normal text-xs">(1K+ games hosted)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA: FLOATING MASCOT & MOBILE CLASSROOM SCENE */}
          <div className="w-full lg:w-[58%] xl:w-[62%] relative flex items-center justify-end min-h-[320px] lg:min-h-[500px]">
            {/* Mobile Classroom Image (Only shown on small screens) */}
            <div className="w-full relative mt-4 rounded-2xl overflow-hidden shadow-lg lg:hidden">
              <img
                src="/images/hero-classroom-bg.png"
                alt="Bopzi Arena"
                className="w-full h-auto object-cover block"
              />
            </div>

            {/* Graffiti Accents around Mascot (Pink Crown Doodle & Streaks) */}
            {/* Pink crown doodle beside mascot's body */}
            <div className="hidden lg:block absolute -left-6 xl:-left-8 top-28 xl:top-32 z-20 pointer-events-none select-none">
              <svg width="56" height="44" viewBox="0 0 60 48" fill="none" stroke="#EC4899" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12 opacity-85">
                <path d="M6 36 L16 12 L30 26 L44 12 L54 36 Z" />
              </svg>
            </div>
            {/* Pink splash streaks top-left of mascot */}
            <div className="hidden lg:block absolute -left-2 xl:-left-4 top-8 xl:top-10 z-20 pointer-events-none select-none text-[#EC4899] font-black text-2xl -rotate-45 opacity-85">
              \\
            </div>
            {/* Neon green slash streaks below mascot */}
            <div className="hidden lg:block absolute left-12 xl:left-14 bottom-8 xl:bottom-10 z-20 pointer-events-none select-none text-[#10B981] font-black text-2xl rotate-45 opacity-85">
              //
            </div>

            {/* THE 3D PURPLE CROWN MASCOT (BOPZI) IN DYNAMIC MOTION (Properly framed, fully visible) */}
            <div
              onClick={() => sounds.playPlayerJoined()}
              className="absolute top-4 lg:top-8 xl:top-10 left-2 sm:left-4 lg:-left-4 xl:-left-8 w-60 sm:w-72 lg:w-[350px] xl:w-[380px] z-30 cursor-pointer group"
              title="Click me to hear robot mascot chime!"
            >
              <div className="w-full h-auto animate-mascot-motion">
                <img
                  src="/images/mascot.png"
                  alt="Bopzi Purple Crown Mascot in Motion"
                  className="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(124,58,237,0.45)] group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "PERFECT FOR" BAR (SLIM, WIDE MATCHING SCREENSHOT 2)
      ========================================================================== */}
      <section className="py-6 sm:py-7 border-y border-slate-100 bg-[#FAFAFC]">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 pl-14 sm:pl-20 lg:pl-24 xl:pl-28 flex flex-wrap items-center justify-start gap-8 sm:gap-12 lg:gap-16 xl:gap-20 text-sm sm:text-base font-bold text-slate-700">
          <span className="uppercase tracking-wider text-slate-500 font-extrabold text-xs sm:text-sm mr-4 sm:mr-8">
            PERFECT FOR
          </span>

          <div className="flex items-center gap-3 hover:text-[#7C3AED] transition-colors cursor-default">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#7C3AED]" />
            <span>Schools & Colleges</span>
          </div>

          <div className="flex items-center gap-3 hover:text-[#EC4899] transition-colors cursor-default">
            <Users2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#EC4899]" />
            <span>Communities</span>
          </div>

          <div className="flex items-center gap-3 hover:text-[#8B5CF6] transition-colors cursor-default">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5CF6]" />
            <span>Events & Hackathons</span>
          </div>

          <div className="flex items-center gap-3 hover:text-[#3B82F6] transition-colors cursor-default">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B82F6]" />
            <span>Companies</span>
          </div>

          <div className="flex items-center gap-3 hover:text-[#10B981] transition-colors cursor-default">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#10B981]" />
            <span>Friends & Family</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "CHOOSE YOUR VIBE" SECTION (MATCHING SCREENSHOT EXACTLY)
      ========================================================================== */}
      <section id="themes" className="py-20 px-4 sm:px-6 lg:px-10 max-w-[1680px] mx-auto w-full relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Choose Your <span className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Vibe</span>
            </h2>
            {/* Green doodle sprout rays */}
            <svg className="w-6 h-6 text-emerald-400 absolute -top-3.5 -right-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
              <path d="M4 14l3-3M10 6l1 4M17 11l4-2" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            Four unique themes to make every quiz feel special. All free.
          </p>
        </div>

        {/* 4 Theme Cards - All 4 in one row side-by-side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 items-stretch">
          {/* Card 1: Party Pop */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setThemeId('party-pop');
              setSelectedVibe('party-pop');
              sounds.playPlayerJoined();
              router.push('/quizzes/new?theme=party-pop');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setThemeId('party-pop');
                setSelectedVibe('party-pop');
                sounds.playPlayerJoined();
                router.push('/quizzes/new?theme=party-pop');
              }
            }}
            className={`group relative rounded-[28px] overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer focus:outline-none flex flex-col justify-between ${
              themeId === 'party-pop'
                ? 'ring-4 ring-[#8B5CF6] ring-offset-4 ring-offset-white shadow-xl shadow-purple-500/20'
                : 'hover:ring-2 hover:ring-purple-300 shadow-md'
            }`}
          >
            <div className="relative">
              <img
                src="/images/themes/party.png"
                alt="Party Pop Theme"
                className="w-full h-auto block object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              {themeId === 'party-pop' && (
                <div className="absolute top-4 right-4 bg-[#8B5CF6] text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 z-10 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Active
                </div>
              )}
            </div>
            <div className="p-3 bg-white/95 border-t border-purple-100 flex items-center justify-between">
              <span className="text-xs font-black text-[#7C3AED]">Create with Party Pop</span>
              <span className="text-xs font-extrabold text-[#7C3AED] group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 2: Neon Arcade */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setThemeId('neon-arcade');
              setSelectedVibe('neon-arcade');
              sounds.playCountdownTick();
              router.push('/quizzes/new?theme=neon-arcade');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setThemeId('neon-arcade');
                setSelectedVibe('neon-arcade');
                sounds.playCountdownTick();
                router.push('/quizzes/new?theme=neon-arcade');
              }
            }}
            className={`group relative rounded-[28px] overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer focus:outline-none flex flex-col justify-between ${
              themeId === 'neon-arcade'
                ? 'ring-4 ring-[#00F0FF] ring-offset-4 ring-offset-white shadow-xl shadow-cyan-500/20'
                : 'hover:ring-2 hover:ring-cyan-300 shadow-md'
            }`}
          >
            <div className="relative">
              <img
                src="/images/themes/neon.png"
                alt="Neon Arcade Theme"
                className="w-full h-auto block object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              {themeId === 'neon-arcade' && (
                <div className="absolute top-4 right-4 bg-[#00F0FF] text-black text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 z-10 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Active
                </div>
              )}
            </div>
            <div className="p-3 bg-[#060B1E] border-t border-cyan-500/40 flex items-center justify-between">
              <span className="text-xs font-black text-cyan-300">Create with Neon Arcade</span>
              <span className="text-xs font-extrabold text-cyan-300 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 3: Cosmic Quest */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setThemeId('cosmic-quest');
              setSelectedVibe('cosmic-quest');
              sounds.playCountdownTick();
              router.push('/quizzes/new?theme=cosmic-quest');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setThemeId('cosmic-quest');
                setSelectedVibe('cosmic-quest');
                sounds.playCountdownTick();
                router.push('/quizzes/new?theme=cosmic-quest');
              }
            }}
            className={`group relative rounded-[28px] overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer focus:outline-none flex flex-col justify-between ${
              themeId === 'cosmic-quest'
                ? 'ring-4 ring-[#38BDF8] ring-offset-4 ring-offset-white shadow-xl shadow-sky-500/20'
                : 'hover:ring-2 hover:ring-blue-300 shadow-md'
            }`}
          >
            <div className="relative">
              <img
                src="/images/themes/cosmic.png"
                alt="Cosmic Quest Theme"
                className="w-full h-auto block object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              {themeId === 'cosmic-quest' && (
                <div className="absolute top-4 right-4 bg-[#38BDF8] text-black text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 z-10 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Active
                </div>
              )}
            </div>
            <div className="p-3 bg-[#071326] border-t border-cyan-500/40 flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">Create with Cosmic Quest</span>
              <span className="text-xs font-extrabold text-amber-300 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 4: Champion Mode */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setThemeId('champion-mode');
              setSelectedVibe('champion-mode');
              sounds.playPlayerJoined();
              router.push('/quizzes/new?theme=champion-mode');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setThemeId('champion-mode');
                setSelectedVibe('champion-mode');
                sounds.playPlayerJoined();
                router.push('/quizzes/new?theme=champion-mode');
              }
            }}
            className={`group relative rounded-[28px] overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer focus:outline-none flex flex-col justify-between ${
              themeId === 'champion-mode'
                ? 'ring-4 ring-[#F59E0B] ring-offset-4 ring-offset-white shadow-xl shadow-amber-500/20'
                : 'hover:ring-2 hover:ring-amber-300 shadow-md'
            }`}
          >
            <div className="relative">
              <img
                src="/images/themes/champion.png"
                alt="Champion Mode Theme"
                className="w-full h-auto block object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              {themeId === 'champion-mode' && (
                <div className="absolute top-4 right-4 bg-[#F59E0B] text-black text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 z-10 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Active
                </div>
              )}
            </div>
            <div className="p-3 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between">
              <span className="text-xs font-black text-amber-700">Create with Champion Mode</span>
              <span className="text-xs font-extrabold text-amber-700 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "HOW IT WORKS" SECTION (MATCHING SCREENSHOT EXACTLY)
      ========================================================================== */}
      <section id="how-it-works" className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
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
          SECTION A — AMAZING FEATURES
      ========================================================================== */}
      <section id="features" className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-[1550px] mx-auto w-full relative">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="relative inline-block">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Amazing <span className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Features</span>
            </h2>
            {/* Green doodle sprout rays */}
            <svg className="w-6 h-6 text-emerald-400 absolute -top-3.5 -right-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
              <path d="M4 14l3-3M10 6l1 4M17 11l4-2" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            Everything you need to create, play and enjoy interactive quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 4 Feature Cards */}
          <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {/* Feature 1: Easy Quiz Creation */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Pencil className="w-6 h-6 text-[#F43F5E]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Easy Quiz Creation</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Create quizzes in seconds with our simple and powerful editor.
              </p>
            </div>

            {/* Feature 2: Play in Real Time */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Gamepad2 className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Play in Real Time</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Share a game PIN and let everyone join instantly from any device.
              </p>
            </div>

            {/* Feature 3: Fun for Everyone */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Users2 className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Fun for Everyone</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Perfect for classrooms, events, communities and friends.
              </p>
            </div>

            {/* Feature 4: Track & Compete */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <BarChart3 className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">Track & Compete</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Live scoreboard, detailed results and exciting leaderboards.
              </p>
            </div>
          </div>

          {/* Right Mascot Illustration */}
          <div className="lg:col-span-4 xl:col-span-3 flex justify-center lg:justify-end">
            <div className="relative w-48 sm:w-56 lg:w-64 animate-mascot-motion">
              <img
                src="/images/sections/mascot_features.png"
                alt="Bopzi Mascot with Crown and Stars"
                className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(124,58,237,0.35)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B — LEARNING IS BETTER TOGETHER
      ========================================================================== */}
      <section className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-[1550px] mx-auto w-full">
        <div className="rounded-[36px] bg-gradient-to-r from-[#FAF8FF] via-[#F3EEFF] to-[#FAF5FF] border border-purple-200/60 p-8 sm:p-12 lg:p-14 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Mascot */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
            <div className="relative w-56 sm:w-64 lg:w-72">
              <img
                src="/images/sections/mascot_together.png"
                alt="Bopzi Mascot Chill"
                className="w-full h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(124,58,237,0.3)] animate-float-slow"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-2/3 flex flex-col items-start text-left">
            <div className="relative inline-block mb-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
                Learning is Better <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">Together</span>
              </h2>
              <div className="text-emerald-500 font-black text-xl absolute -top-4 -right-6">
                〰️
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mb-8 leading-relaxed">
              Join a growing community of students, teachers and organizations making learning more fun every day.
            </p>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {/* Stat 1: 50K+ Quizzes Created */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-pink-100/70 text-pink-600 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4 text-[#F43F5E]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">50K+</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Quizzes Created</div>
              </div>

              {/* Stat 2: 1M+ Players Joined */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center mb-2">
                  <Users2 className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">1M+</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Players Joined</div>
              </div>

              {/* Stat 3: 10K+ Active Communities */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-2">
                  <Globe2 className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">10K+</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Active Communities</div>
              </div>

              {/* Stat 4: 4.9/5 Average Rating */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-500 flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 fill-current text-[#F59E0B]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">4.9/5</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — POPULAR QUIZZES
      ========================================================================== */}
      <section className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-[1550px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10 gap-4">
          <div className="text-center sm:text-left">
            <div className="relative inline-block">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
                Popular <span className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Quizzes</span>
              </h2>
              <svg className="w-6 h-6 text-emerald-400 absolute -top-3.5 -right-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                <path d="M4 14l3-3M10 6l1 4M17 11l4-2" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
              Play trending quizzes created by our community.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:text-[#7C3AED] hover:border-purple-300 transition-colors shadow-2xs"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Quiz Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quiz Card 1: Space & Planets */}
          <div
            onClick={() => handleLaunchGame('quiz-space-planets')}
            className="rounded-[28px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="p-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900">
                <img
                  src="/images/sections/quiz_space.png"
                  alt="Space & Planets Quiz"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-rose-500/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Flame className="w-3 h-3 fill-current" />
                  Trending
                </span>
              </div>
            </div>
            <div className="p-4 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                  Space & Planets
                </h3>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">1.2K plays</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-50 text-pink-600 border border-pink-100/80">
                  Science
                </span>
              </div>
            </div>
          </div>

          {/* Quiz Card 2: World Geography */}
          <div
            onClick={() => handleLaunchGame('quiz-world-geo')}
            className="rounded-[28px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="p-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-blue-900">
                <img
                  src="/images/sections/quiz_geo.png"
                  alt="World Geography Quiz"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-blue-500/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-current" />
                  Popular
                </span>
              </div>
            </div>
            <div className="p-4 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                  World Geography
                </h3>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">985 plays</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                  Geography
                </span>
              </div>
            </div>
          </div>

          {/* Quiz Card 3: General Knowledge */}
          <div
            onClick={() => handleLaunchGame('quiz-general-knowledge')}
            className="rounded-[28px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="p-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-amber-900">
                <img
                  src="/images/sections/quiz_gk.png"
                  alt="General Knowledge Quiz"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-orange-500/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Flame className="w-3 h-3 fill-current" />
                  Hot
                </span>
              </div>
            </div>
            <div className="p-4 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                  General Knowledge
                </h3>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">2.1K plays</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100/80">
                  Mixed
                </span>
              </div>
            </div>
          </div>

          {/* Quiz Card 4: Tech & AI */}
          <div
            onClick={() => handleLaunchGame('quiz-tech-ai')}
            className="rounded-[28px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="p-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-purple-950">
                <img
                  src="/images/sections/quiz_tech.png"
                  alt="Tech & AI Quiz"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="p-4 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                  Tech & AI
                </h3>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">760 plays</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100/80">
                  Technology
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — PLAY ANYWHERE, ON ANY DEVICE (WITH CUSTOM ARTWORK BACKGROUND)
      ========================================================================== */}
      <section className="w-full relative pt-4 sm:pt-6 pb-8 sm:pb-12 overflow-hidden">
        <div className="relative w-full aspect-[1024/341] max-w-[1920px] mx-auto min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
          {/* Background Image */}
          <img
            src="/images/sections/play_anywhere_bg.png"
            alt="Play Anywhere On Any Device Background"
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none z-0"
          />

          {/* Foreground Text & Device Cards (with 4-finger gap from left edge) */}
          <div className="relative z-10 w-full max-w-[1550px] mx-auto pl-14 sm:pl-24 lg:pl-36 xl:pl-44 pr-6 sm:pr-12 lg:pr-16 flex items-center">
            <div className="w-full sm:w-[58%] lg:w-[48%] xl:w-[44%] flex flex-col items-start text-left py-6">
              <div className="relative inline-block mb-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
                  Play Anywhere,<br />
                  On <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">Any Device</span>
                </h2>
                <div className="text-cyan-400 font-black text-xl absolute -top-4 -right-6 select-none pointer-events-none">
                  〰️
                </div>
              </div>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed mb-6 max-w-md">
                No app required! Works on all devices — phones, tablets, laptops and smart TVs. Just share the game PIN and start playing instantly.
              </p>

              {/* 4 Device Categories with colorful icons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5 w-full max-w-md">
                {/* Mobile */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-3 hover:scale-[1.02] transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">Mobile</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">iOS & Android</p>
                  </div>
                </div>

                {/* Laptops */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-3 hover:scale-[1.02] transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">Laptops</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Windows & Mac</p>
                  </div>
                </div>

                {/* Tablets */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-3 hover:scale-[1.02] transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Tablet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">Tablets</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">iPad & Android</p>
                  </div>
                </div>

                {/* Smart TVs */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-3 hover:scale-[1.02] transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A]">Smart TVs</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — LOVED BY OUR COMMUNITY
      ========================================================================== */}
      <section className="pt-12 sm:pt-16 pb-2 px-4 sm:px-6 lg:px-8 max-w-[1550px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Loved by Our <span className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">Community</span>
            </h2>
            <svg className="w-6 h-6 text-emerald-400 absolute -top-3.5 -right-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
              <path d="M4 14l3-3M10 6l1 4M17 11l4-2" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            See what students, teachers and organizations say about Anti Kahoot.
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1: Ayesha M. */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="text-pink-400 mb-4">
                <Quote className="w-8 h-8 fill-pink-100 text-pink-400" />
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
                “Perfect for my classroom! My students are more engaged and actually excited to learn.”
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
                  alt="Ayesha M."
                  className="w-10 h-10 rounded-full object-cover border border-purple-100"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F172A]">Ayesha M.</h4>
                  <p className="text-xs text-slate-400 font-medium">Teacher</p>
                </div>
              </div>
              <div className="flex text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial 2: Bilal K. */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="text-purple-400 mb-4">
                <Quote className="w-8 h-8 fill-purple-100 text-purple-400" />
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
                “We used it for our college event and it was a huge hit! Super easy and really fun.”
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
                  alt="Bilal K."
                  className="w-10 h-10 rounded-full object-cover border border-purple-100"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F172A]">Bilal K.</h4>
                  <p className="text-xs text-slate-400 font-medium">Student</p>
                </div>
              </div>
              <div className="flex text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial 3: Sara N. */}
          <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="text-indigo-400 mb-4">
                <Quote className="w-8 h-8 fill-indigo-100 text-indigo-400" />
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
                “Bopzi makes learning feel like a game. The themes and live scoreboard are amazing!”
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Sara N."
                  className="w-10 h-10 rounded-full object-cover border border-purple-100"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F172A]">Sara N.</h4>
                  <p className="text-xs text-slate-400 font-medium">Community Host</p>
                </div>
              </div>
              <div className="flex text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          <span className="w-2 h-2 rounded-full bg-purple-200" />
          <span className="w-2 h-2 rounded-full bg-purple-200" />
        </div>
      </section>

      {/* =========================================================================
          SECTION F — FREQUENTLY ASKED QUESTIONS (MASCOT -> TEXT -> FAQ)
      ========================================================================== */}
      <section id="faq" className="pt-8 pb-8 px-4 sm:px-6 lg:px-12 max-w-[1650px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-10 items-center">
          {/* Left Block: Mascot + Heading & Button (Horizontal on tablet/desktop) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
            {/* 1. Mascot First (Enlarged) */}
            <div className="relative w-72 sm:w-80 lg:w-[360px] xl:w-[410px] flex-shrink-0 animate-float-slow">
              <img
                src="/images/sections/mascot_faq_clean.png"
                alt="Bopzi Mascot with Question Marks"
                className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(124,58,237,0.25)]"
              />
            </div>

            {/* 2. Text Next */}
            <div className="flex flex-col items-start text-left">
              <div className="relative inline-block mb-3">
                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
                  Frequently<br />
                  Asked <span className="bg-gradient-to-r from-[#EC4899] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">Questions</span>
                </h2>
                {/* Pink doodle rays above Questions */}
                <div className="text-[#EC4899] font-black text-xl absolute -top-3 -right-6 select-none pointer-events-none">
                  ///
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
                Got questions? We've got answers.
              </p>

              <button
                type="button"
                onClick={() => {
                  setOpenFaq(openFaq === null ? 0 : null);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-purple-200 text-[#7C3AED] bg-white hover:bg-purple-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <span>View All FAQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. FAQ Accordion on the Right */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-2.5">
            {[
              {
                q: 'Is Bopzi really free?',
                a: 'Yes! Bopzi is 100% free. No subscriptions, no limits. Just create, share and play as much as you want.',
              },
              {
                q: 'Do players need to create an account?',
                a: 'No! Players only need the 6-digit game PIN to join. No login, download, or account registration required.',
              },
              {
                q: 'Can I use it for my classroom or event?',
                a: 'Absolutely! Bopzi is built specifically for classroom lessons, corporate workshops, hackathons, and family game nights.',
              },
              {
                q: 'How do players join a game?',
                a: 'Simply visit bopzi.com/join (or scan the on-screen QR code), enter the Game PIN shown on the host display, choose a nickname, and you’re in!',
              },
              {
                q: 'Can I customize the themes and questions?',
                a: 'Yes! You can choose between Party Pop, Neon Arcade, Cosmic Quest, and Champion Mode themes, plus fully customize question timers, answer options, and points.',
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-slate-50/70 border-purple-200 shadow-sm'
                      : 'bg-white border-slate-100 shadow-xs hover:border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-3 sm:py-3.5 flex items-center justify-between text-left font-extrabold text-sm sm:text-base text-[#0F172A] hover:text-[#7C3AED] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-[#7C3AED]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-3.5 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G — FINAL CALL TO ACTION (WITH CUSTOM ARTWORK BACKGROUND)
      ========================================================================== */}
      <section className="w-full relative mt-0 overflow-hidden">
        <div className="relative w-full aspect-[1024/341] max-w-[1920px] mx-auto min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center">
          {/* Background Image */}
          <img
            src="/images/footer-bg.png"
            alt="Anti Kahoot Celebration Background"
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none z-0"
          />

          {/* Foreground Text & Buttons Content (Extra 4 finger gap from left) */}
          <div className="relative z-10 w-full max-w-[1550px] mx-auto pl-16 sm:pl-28 lg:pl-40 xl:pl-44 pr-6 sm:pr-12 lg:pr-20 flex items-center">
            <div className="w-full sm:w-2/3 lg:w-1/2 flex flex-col items-start text-left py-8 sm:py-12">
              <h2 className="text-2xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-black text-white tracking-tight leading-[1.08] mb-3">
                Join Thousands<br />
                Making <span className="text-[#EC4899]">Learning</span> Fun!
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-purple-100 font-medium max-w-sm sm:max-w-md lg:max-w-lg mb-6 sm:mb-8 leading-relaxed">
                Create your own quiz, share a game PIN and let everyone play together. It's free, simple and instant.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/quizzes/new"
                  onClick={() => sounds.playQuestionStart()}
                  className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-extrabold text-xs sm:text-sm md:text-base text-[#7C3AED] bg-white hover:bg-slate-50 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Create a Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/join"
                  onClick={() => sounds.playCountdownTick()}
                  className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-extrabold text-xs sm:text-sm md:text-base text-white bg-purple-950/40 hover:bg-purple-950/60 border border-white/20 backdrop-blur-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Gamepad2 className="w-4 h-4 text-purple-200" />
                  <span>Join a Game</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DARK PURPLE FOOTER BAR (MATCHING REFERENCE DESIGN EXACTLY)
      ========================================================================== */}
      <footer className="w-full bg-[#240B68] text-white py-6 px-4 sm:px-6 lg:px-12 border-t border-purple-900/50">
        <div className="max-w-[1550px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Logo with Crown */}
          <Link href="/" className="flex items-center space-x-1.5 font-black text-xl hover:opacity-90 transition-opacity">
            <span className="text-[#F59E0B] text-base">👑</span>
            <span className="text-white tracking-wide">ANTI</span>
            <span className="text-[#EC4899] ml-0.5 tracking-wide">KAHOOT</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs sm:text-sm font-semibold text-purple-200">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#themes" className="hover:text-white transition-colors">
              Themes
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Social Icons & Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-purple-300">
            <div className="flex items-center space-x-2">
              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Discord"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <span className="hidden sm:inline text-purple-400/40">|</span>

            <span className="text-purple-300/80">
              © 2026 Anti Kahoot. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
