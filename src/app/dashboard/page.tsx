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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>Host Dashboard</span>
            <span
              className="text-xs font-black uppercase px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Ready to Host
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Create, manage, and host real-time multiplayer games with live projector displays.
          </p>
        </div>

        <Link
          href="/quizzes/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm text-white shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <PlusCircle className="w-5 h-5" />
          <span>CREATE NEW QUIZ</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quizzes</div>
          <div className="text-3xl font-black text-white mt-1">{quizzes.length}</div>
        </div>
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</div>
          <div className="text-3xl font-black text-white mt-1">
            {quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)}
          </div>
        </div>
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Capacity</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">100+ Players</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes by title or keyword..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-white font-medium bg-black/30 border focus:outline-none transition-all placeholder:text-slate-400"
          style={{ borderColor: theme.colors.border }}
        />
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3" />
          <span>Loading your quizzes...</span>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-3xl border my-6"
          style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white font-black text-2xl"
            style={{ backgroundColor: `${theme.colors.primary}44` }}
          >
            <HelpCircle className="w-8 h-8" style={{ color: theme.colors.primary }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">No quizzes found</h3>
          <p className="text-sm text-slate-300 max-w-sm mb-6">
            {searchQuery
              ? `No quizzes matched "${searchQuery}". Try another search term.`
              : 'Create your first multiplayer quiz or use one of our pre-seeded themes!'}
          </p>
          <Link
            href="/quizzes/new"
            className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Create Quiz Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const qTheme = THEMES[quiz.theme_id] || THEMES['party-pop'];
            const isLaunching = launchingId === quiz.id;

            return (
              <div
                key={quiz.id}
                className="rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-2xl shadow-lg"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: theme.colors.border,
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
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {quiz.questions?.length || 0} Questions
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-2 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 mb-6 leading-relaxed">
                    {quiz.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t" style={{ borderColor: `${theme.colors.border}66` }}>
                  {/* Start Live Game button */}
                  <button
                    onClick={() => handleStartGame(quiz.id)}
                    disabled={isLaunching}
                    className="w-full py-3 px-4 rounded-xl font-black text-sm text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: qTheme.colors.primary }}
                  >
                    {isLaunching ? (
                      <span className="animate-pulse">Launching Live Session...</span>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>HOST LIVE GAME</span>
                      </>
                    )}
                  </button>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/quizzes/${quiz.id}/edit`}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => handleDuplicate(quiz)}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      onClick={() => handleDelete(quiz.id, quiz.title)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
