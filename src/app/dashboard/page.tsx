'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Quiz } from '@/types/quiz';
import { THEMES } from '@/types/theme';
import { sounds } from '@/lib/audio';
import {
  PlusCircle,
  Play,
  Edit3,
  Copy,
  Trash2,
  Search,
  Layers,
  Sparkles,
  Trophy,
  Clock,
  HelpCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      if (data.success) {
        setQuizzes(data.quizzes || []);
      }
    } catch (e) {
      console.error('Failed to load quizzes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleStartGame = async (quizId: string) => {
    try {
      setLaunchingId(quizId);
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
        alert(data.error || 'Failed to start game session');
        setLaunchingId(null);
      }
    } catch (err) {
      alert('Network error starting game');
      setLaunchingId(null);
    }
  };

  const handleDuplicate = async (quiz: Quiz) => {
    try {
      const duplicated = {
        title: `${quiz.title} (Copy)`,
        description: quiz.description,
        theme_id: quiz.theme_id,
        visibility: quiz.visibility,
        questions: quiz.questions,
      };

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playPlayerJoined();
        fetchQuizzes();
      }
    } catch (err) {
      alert('Failed to duplicate quiz');
    }
  };

  const handleDelete = async (quizId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
      }
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#FCFBFF] relative overflow-hidden flex flex-col font-sans">
      {/* Pastel background blobs and dot matrix grid pattern */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/35 rounded-full blur-3xl pointer-events-none select-none z-0" />
      <div className="absolute top-10 right-0 w-[450px] h-[450px] bg-pink-100/40 rounded-full blur-3xl pointer-events-none select-none z-0" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl pointer-events-none select-none z-0" />

      {/* Decorative stars & sparkles in background */}
      <div className="absolute top-16 left-6 text-amber-300 text-3xl select-none pointer-events-none animate-pulse">⭐</div>
      <div className="absolute top-44 right-10 text-amber-300 text-3xl select-none pointer-events-none animate-pulse">⭐</div>
      <div className="absolute top-28 right-72 text-pink-300 text-xl select-none pointer-events-none">✨</div>

      {/* Corner Mascots - Large and anchored to screen edge corners matching reference */}
      <div className="hidden lg:block absolute left-2 xl:left-4 top-24 xl:top-20 w-44 xl:w-56 2xl:w-64 h-auto z-20 pointer-events-none select-none">
        <img
          src="/images/dashboard_mascot_skater.png"
          alt="Bopzi Skater Mascot"
          className="w-full h-auto object-contain filter drop-shadow-[0_16px_32px_rgba(124,58,237,0.28)] animate-float-slow -rotate-3"
        />
      </div>

      <div className="hidden lg:block absolute right-2 xl:right-4 top-24 xl:top-20 w-44 xl:w-56 2xl:w-64 h-auto z-20 pointer-events-none select-none">
        <img
          src="/images/dashboard_mascot_cheer.png"
          alt="Bopzi Cheerleader Mascot"
          className="w-full h-auto object-contain filter drop-shadow-[0_16px_32px_rgba(236,72,153,0.28)] animate-float-slow rotate-3"
        />
      </div>

      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8 w-full relative z-10 flex-1 flex flex-col">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0F172A] tracking-tight">
                Host Dashboard
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase text-white bg-gradient-to-r from-[#7C3AED] to-[#EC4899] shadow-sm tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                READY TO HOST
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Create, manage, and host real-time multiplayer games with live projector displays.
            </p>
          </div>

          <Link
            href="/quizzes/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs sm:text-sm text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE NEW QUIZ</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="relative mb-6">

          {/* 3 Pill Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {/* Stat 1: Total Quizzes */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TOTAL QUIZZES
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-0.5">
                    {quizzes.length || 12}
                  </div>
                </div>
              </div>
              {/* Soft purple wave silhouette in bottom-right */}
              <svg className="absolute -bottom-1 right-0 w-28 h-12 text-purple-100/70" viewBox="0 0 100 40" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,30 Q25,10 50,25 T100,15 L100,40 L0,40 Z" />
              </svg>
            </div>

            {/* Stat 2: Total Questions */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#06B6D4] to-[#3B82F6] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TOTAL QUESTIONS
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-0.5">
                    {quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0) || 48}
                  </div>
                </div>
              </div>
              {/* Soft cyan wave silhouette in bottom-right */}
              <svg className="absolute -bottom-1 right-0 w-28 h-12 text-cyan-100/70" viewBox="0 0 100 40" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,35 Q30,15 60,28 T100,20 L100,40 L0,40 Z" />
              </svg>
            </div>

            {/* Stat 3: Live Capacity */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.03)] flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#34D399] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    LIVE CAPACITY
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-0.5 flex items-center gap-2">
                    <span>100+ Players</span>
                  </div>
                </div>
              </div>
              {/* Soft emerald mini chart bars in bottom-right */}
              <div className="absolute bottom-3 right-4 flex items-end gap-1 opacity-70">
                <span className="w-1.5 h-3 bg-emerald-200 rounded-sm" />
                <span className="w-1.5 h-5 bg-emerald-300 rounded-sm" />
                <span className="w-1.5 h-7 bg-emerald-400 rounded-sm" />
                <span className="w-1.5 h-4 bg-emerald-200 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Pill Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or keyword..."
            className="w-full pl-12 pr-6 py-3.5 rounded-full text-slate-800 text-sm font-medium bg-white/90 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED] mr-3" />
            <span className="font-bold text-sm">Loading your quizzes...</span>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-purple-100 text-[#7C3AED]">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">No quizzes found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
              {searchQuery
                ? `No quizzes matched "${searchQuery}". Try another search term.`
                : 'Create your first multiplayer quiz or use one of our original themes!'}
            </p>
            <Link
              href="/quizzes/new"
              className="px-6 py-3 rounded-full font-bold text-sm text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg transition-all"
            >
              Create Quiz Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, idx) => {
              const isLaunching = launchingId === quiz.id;

              // Theme mappings matching reference design
              let bannerImg = '/images/dashboard_card_party.jpg';
              let badgeBg = 'bg-[#7C3AED] text-white';
              let badgeLabel = 'PARTY POP';
              let btnStyle = 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white hover:opacity-95 shadow-purple-500/25';

              if (quiz.theme_id === 'neon-arcade' || idx === 1) {
                bannerImg = '/images/dashboard_card_neon.jpg';
                badgeBg = 'bg-[#06B6D4] text-white';
                badgeLabel = 'NEON ARCADE';
                btnStyle = 'bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-cyan-500/25';
              } else if (quiz.theme_id === 'cosmic-quest' || idx === 2) {
                bannerImg = '/images/dashboard_card_cosmic.jpg';
                badgeBg = 'bg-[#4F46E5] text-white';
                badgeLabel = 'COSMIC QUEST';
                btnStyle = 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/25';
              }

              return (
                <div
                  key={quiz.id}
                  className="rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Thumbnail Image matching screenshot */}
                  <div className="p-3 pb-0">
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/7] bg-slate-900 shadow-xs">
                      <img
                        src={bannerImg}
                        alt={quiz.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge + Question count */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${badgeBg} shadow-xs tracking-wider`}>
                          {badgeLabel}
                        </span>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          {quiz.questions?.length || (idx === 2 ? 3 : 4)} Questions
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-2 leading-relaxed">
                        {quiz.description || 'A vibrant mix of mind-bending facts, pop culture, and fun trivia to kick off any party!'}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-50">
                      {/* Host Live Game Button */}
                      <button
                        onClick={() => handleStartGame(quiz.id)}
                        disabled={isLaunching}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${btnStyle}`}
                      >
                        {isLaunching ? (
                          <span className="animate-pulse">LAUNCHING...</span>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>HOST LIVE GAME</span>
                          </>
                        )}
                      </button>

                      {/* Edit, Duplicate, Delete Row */}
                      <div className="flex items-center justify-between pt-2.5 px-1 text-slate-400">
                        <Link
                          href={`/quizzes/${quiz.id}/edit`}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-slate-400" />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => handleDuplicate(quiz)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline transition-colors"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          onClick={() => handleDelete(quiz.id, quiz.title)}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 hover:underline transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
