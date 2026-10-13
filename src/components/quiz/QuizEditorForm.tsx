'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Quiz, Question, QuestionType, AnswerOption } from '@/types/quiz';
import { THEMES, ThemeId } from '@/types/theme';
import { sounds } from '@/lib/audio';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Zap,
  Save,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface QuizEditorFormProps {
  initialQuiz?: Quiz;
  isEditing?: boolean;
}

export function QuizEditorForm({ initialQuiz, isEditing = false }: QuizEditorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeParam = searchParams?.get('theme') as ThemeId | null;
  const { theme } = useTheme();

  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [themeId, setSelectedThemeId] = useState<ThemeId>(
    initialQuiz?.theme_id || (themeParam && THEMES[themeParam] ? themeParam : 'party-pop')
  );

  useEffect(() => {
    if (!initialQuiz && themeParam && THEMES[themeParam]) {
      setSelectedThemeId(themeParam);
    }
  }, [themeParam, initialQuiz]);
  const [questions, setQuestions] = useState<Question[]>(
    initialQuiz?.questions || [
      {
        id: 'q-1',
        quiz_id: '',
        position: 1,
        question_text: '',
        question_type: 'multiple_choice',
        time_limit_seconds: 20,
        points: 1000,
        answer_options: [
          { id: 'opt-1-1', position: 1, answer_text: '', is_correct: true },
          { id: 'opt-1-2', position: 2, answer_text: '', is_correct: false },
          { id: 'opt-1-3', position: 3, answer_text: '', is_correct: false },
          { id: 'opt-1-4', position: 4, answer_text: '', is_correct: false },
        ],
      },
    ]
  );
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentQ = questions[activeQuestionIdx] || questions[0];

  // Answer buttons theme colors
  const activeTheme = THEMES[themeId] || THEMES['party-pop'];
  const answerColorPalette = [
    { color: activeTheme.colors.answerRed, shape: '▲' },
    { color: activeTheme.colors.answerBlue, shape: '◆' },
    { color: activeTheme.colors.answerYellow, shape: '●' },
    { color: activeTheme.colors.answerGreen, shape: '■' },
  ];

  const handleAddQuestion = () => {
    sounds.playPlayerJoined();
    const newQ: Question = {
      id: `q-${Date.now()}`,
      quiz_id: '',
      position: questions.length + 1,
      question_text: '',
      question_type: 'multiple_choice',
      time_limit_seconds: 20,
      points: 1000,
      answer_options: [
        { id: `opt-${Date.now()}-1`, position: 1, answer_text: '', is_correct: true },
        { id: `opt-${Date.now()}-2`, position: 2, answer_text: '', is_correct: false },
        { id: `opt-${Date.now()}-3`, position: 3, answer_text: '', is_correct: false },
        { id: `opt-${Date.now()}-4`, position: 4, answer_text: '', is_correct: false },
      ],
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIdx(questions.length);
  };

  const handleDuplicateQuestion = (idx: number) => {
    sounds.playPlayerJoined();
    const target = questions[idx];
    const duplicated: Question = {
      ...target,
      id: `q-${Date.now()}`,
      position: questions.length + 1,
      answer_options: target.answer_options.map(opt => ({
        ...opt,
        id: `opt-${Date.now()}-${opt.position}`,
      })),
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, duplicated);
    setQuestions(updated);
    setActiveQuestionIdx(idx + 1);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setActiveQuestionIdx(Math.max(0, idx - 1));
  };

  const handleUpdateCurrentQ = (fields: Partial<Question>) => {
    const updated = [...questions];
    updated[activeQuestionIdx] = { ...updated[activeQuestionIdx], ...fields };
    setQuestions(updated);
  };

  const handleUpdateAnswerText = (optIdx: number, text: string) => {
    const updatedOptions = [...currentQ.answer_options];
    updatedOptions[optIdx] = { ...updatedOptions[optIdx], answer_text: text };
    handleUpdateCurrentQ({ answer_options: updatedOptions });
  };

  const handleSetCorrectOption = (optIdx: number) => {
    sounds.playCountdownTick();
    const updatedOptions = currentQ.answer_options.map((opt, i) => ({
      ...opt,
      is_correct: i === optIdx,
    }));
    handleUpdateCurrentQ({ answer_options: updatedOptions });
  };

  const handleSwitchType = (type: QuestionType) => {
    if (type === 'true_false') {
      handleUpdateCurrentQ({
        question_type: 'true_false',
        answer_options: [
          { id: `opt-${Date.now()}-1`, position: 1, answer_text: 'True', is_correct: true },
          { id: `opt-${Date.now()}-2`, position: 2, answer_text: 'False', is_correct: false },
        ],
      });
    } else {
      handleUpdateCurrentQ({
        question_type: 'multiple_choice',
        answer_options: [
          { id: `opt-${Date.now()}-1`, position: 1, answer_text: '', is_correct: true },
          { id: `opt-${Date.now()}-2`, position: 2, answer_text: '', is_correct: false },
          { id: `opt-${Date.now()}-3`, position: 3, answer_text: '', is_correct: false },
          { id: `opt-${Date.now()}-4`, position: 4, answer_text: '', is_correct: false },
        ],
      });
    }
  };

  const handleSaveQuiz = async () => {
    setError('');

    if (!title.trim()) {
      setError('Quiz title is required.');
      sounds.playIncorrect();
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question #${i + 1} has empty text.`);
        setActiveQuestionIdx(i);
        sounds.playIncorrect();
        return;
      }

      const hasCorrect = q.answer_options.some(o => o.is_correct);
      if (!hasCorrect) {
        setError(`Question #${i + 1} must have a marked correct answer.`);
        setActiveQuestionIdx(i);
        sounds.playIncorrect();
        return;
      }

      for (let j = 0; j < q.answer_options.length; j++) {
        if (!q.answer_options[j].answer_text.trim()) {
          setError(`Question #${i + 1}, Answer #${j + 1} is empty.`);
          setActiveQuestionIdx(i);
          sounds.playIncorrect();
          return;
        }
      }
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        theme_id: themeId,
        questions,
      };

      const url = isEditing && initialQuiz ? `/api/quizzes/${initialQuiz.id}` : '/api/quizzes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to save quiz');
        sounds.playIncorrect();
        setSaving(false);
        return;
      }

      sounds.playVictory();
      router.push('/dashboard');
    } catch (err: any) {
      setError('Network error saving quiz.');
      sounds.playIncorrect();
      setSaving(false);
    }
  };

  const isNeon = themeId === 'neon-arcade';
  const isCosmic = themeId === 'cosmic-quest';
  const isChampion = themeId === 'champion-mode';

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden flex flex-col font-sans transition-colors duration-500 ${
        isNeon
          ? 'bg-[#030712] text-white'
          : isCosmic
          ? 'bg-[#050C1A] text-white'
          : isChampion
          ? 'bg-[#FDFBF7] text-[#0F172A]'
          : 'bg-[#FCFBFF] text-slate-800'
      }`}
    >
      {/* Background Layer: Dynamic based on Selected Theme */}
      {isNeon && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/neon_arcade_bg.png')" }}
        />
      )}
      {isCosmic && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/cosmic_quest_bg.png')" }}
        />
      )}
      {isChampion && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/champion_mode_bg.png')" }}
        />
      )}
      {!isNeon && !isCosmic && !isChampion && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/bopzi_pastel_bg.png')" }}
        />
      )}

      {/* Corner Mascots - Skater & Cheer for Party Pop */}
      {!isNeon && !isCosmic && !isChampion && (
        <>
          <div className="hidden lg:block absolute -left-4 sm:-left-2 xl:left-1 bottom-8 xl:bottom-12 w-32 sm:w-40 xl:w-48 h-auto z-20 pointer-events-none select-none">
            <img
              src="/images/dashboard_mascot_skater.png"
              alt="Bopzi Skater Mascot"
              className="w-full h-auto object-contain filter drop-shadow-[0_14px_28px_rgba(124,58,237,0.25)] animate-float-slow -rotate-3"
            />
          </div>

          <div className="hidden lg:block absolute -right-4 sm:-right-2 xl:right-1 bottom-8 xl:bottom-12 w-36 sm:w-44 xl:w-52 h-auto z-20 pointer-events-none select-none">
            <img
              src="/images/dashboard_mascot_cheer.png"
              alt="Bopzi Cheerleader Mascot"
              className="w-full h-auto object-contain filter drop-shadow-[0_14px_28px_rgba(236,72,153,0.25)] animate-float-slow rotate-3"
            />
          </div>
        </>
      )}


      {/* Main Container */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full relative z-10 flex-1 flex flex-col">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative">
            <div className="flex items-center gap-2">
              <h1 className={`text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight ${
                isChampion ? 'text-white drop-shadow-md' : isNeon || isCosmic ? 'text-white' : 'text-slate-900'
              }`}>
                Create{' '}
                <span className={
                  isNeon
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]'
                    : isCosmic
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                    : isChampion
                    ? 'text-amber-400 drop-shadow-md'
                    : 'text-[#7C3AED]'
                }>
                  New Quiz
                </span>
              </h1>
              <span className="text-2xl font-black select-none">
                {isNeon ? '⚡' : isCosmic ? '🪐' : isChampion ? '👑' : '🪄'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-semibold mt-1 ${
              isNeon
                ? 'text-slate-400'
                : isCosmic
                ? 'text-slate-300'
                : isChampion
                ? 'text-white/90 drop-shadow-sm'
                : 'text-slate-500'
            }`}>
              Author questions, configure timers, answer options, and select your visual theme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                isNeon
                  ? 'bg-slate-950/80 text-cyan-300 hover:text-white border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:border-cyan-400'
                  : isCosmic
                  ? 'bg-[#0A1628]/85 text-cyan-300 hover:text-white border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:border-cyan-400'
                  : isChampion
                  ? 'bg-white/80 hover:bg-white text-slate-700 border border-amber-200/90 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 shadow-sm hover:shadow'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveQuiz}
              disabled={saving}
              className={`px-7 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
                isNeon
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] shadow-[0_0_25px_rgba(236,72,153,0.7)] border-2 border-pink-400 hover:shadow-[0_0_35px_rgba(236,72,153,0.9)]'
                  : isCosmic
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.8)]'
                  : isChampion
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 border border-yellow-200'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-purple-500/25'
              }`}
            >
              <Save className="w-4 h-4" />
              <span className={isCosmic || isChampion ? 'text-slate-950 font-black' : ''}>{saving ? 'SAVING...' : 'SAVE QUIZ'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-5 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            isNeon
              ? 'bg-rose-950/60 border-2 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
              : isCosmic
              ? 'bg-[#18070D]/90 border-2 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
              : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Card: Quiz Title, Description, Selected Visual Theme */}
        <div
          className={`p-5 sm:p-6 rounded-3xl mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all ${
            isNeon
              ? 'bg-[#060B1E]/60 backdrop-blur-xl border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
              : isCosmic
              ? 'bg-[#071326]/60 backdrop-blur-xl border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
              : isChampion
              ? 'bg-white/85 backdrop-blur-md border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.1)]'
              : 'bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
          }`}
        >
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className={`text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                isNeon ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.7)]' : isCosmic ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : isChampion ? 'text-amber-700' : 'text-slate-500'
              }`}>
                <span>📄</span> QUIZ TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Science & Space Championship"
                className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isNeon
                    ? 'bg-[#030712]/95 border-2 border-cyan-500/70 text-white placeholder:text-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                    : isCosmic
                    ? 'bg-[#040C1A]/95 border-2 border-cyan-500/60 text-white placeholder:text-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                    : isChampion
                    ? 'bg-white/95 border-2 border-amber-200 text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40 focus:outline-none placeholder:text-slate-400 shadow-sm'
                    : 'bg-slate-50/70 border border-slate-200/80 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 placeholder:text-slate-400'
                }`}
                required
              />
            </div>
            <div>
              <label className={`text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                isNeon ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.7)]' : isCosmic ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : isChampion ? 'text-amber-700' : 'text-slate-500'
              }`}>
                <span>📝</span> DESCRIPTION
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for hosts and players..."
                className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium resize-none transition-all ${
                  isNeon
                    ? 'bg-[#030712]/95 border-2 border-cyan-500/70 text-white placeholder:text-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                    : isCosmic
                    ? 'bg-[#040C1A]/95 border-2 border-cyan-500/60 text-white placeholder:text-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                    : isChampion
                    ? 'bg-white/95 border-2 border-amber-200 text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40 focus:outline-none placeholder:text-slate-400 shadow-sm'
                    : 'bg-slate-50/70 border border-slate-200/80 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Right: Visual Themes 4-Tile Row */}
          <div className="lg:col-span-7">
            <label className={`text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isNeon ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.7)]' : 'text-slate-500'
            }`}>
              <span>🎨</span> SELECTED VISUAL THEME
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'party-pop' as ThemeId,
                  name: 'Party Pop',
                  tag: 'Big Fun!',
                  img: '/images/themes/party.png',
                  accent: '#7C3AED',
                },
                {
                  id: 'neon-arcade' as ThemeId,
                  name: 'Neon Arcade',
                  tag: 'Dark & Futuristic',
                  img: '/images/themes/neon.png',
                  accent: '#06B6D4',
                },
                {
                  id: 'cosmic-quest' as ThemeId,
                  name: 'Cosmic Quest',
                  tag: 'Out of This World',
                  img: '/images/themes/cosmic.png',
                  accent: '#F59E0B',
                },
                {
                  id: 'champion-mode' as ThemeId,
                  name: 'Champion Mode',
                  tag: 'For Winners',
                  img: '/images/themes/champion.png',
                  accent: '#F59E0B',
                },
              ].map((t) => {
                const isSelected = themeId === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeId(t.id);
                      sounds.playCountdownTick();
                    }}
                    className={`relative rounded-2xl overflow-hidden text-center transition-all flex flex-col group cursor-pointer ${
                      isSelected
                        ? isNeon && t.id === 'neon-arcade'
                          ? 'border-2 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.9)] ring-2 ring-cyan-400 scale-[1.03]'
                          : isCosmic && t.id === 'cosmic-quest'
                          ? 'border-2 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.8)] ring-2 ring-amber-400 scale-[1.03]'
                          : 'border-2 border-[#7C3AED] shadow-xl ring-2 ring-purple-400/40 scale-[1.03]'
                        : isNeon || isCosmic
                          ? 'border-2 border-slate-700/80 hover:border-cyan-500/60 shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:scale-105 opacity-80 hover:opacity-100'
                          : 'border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-md hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Theme Preview Image */}
                    <div className="relative w-full aspect-[16/11] bg-black/20 overflow-hidden">
                      <img
                        src={t.img}
                        alt={t.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Active Indicator Pill */}
                      {isSelected && (
                        <div className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 ${
                          isNeon && t.id === 'neon-arcade'
                            ? 'bg-cyan-400 text-slate-950'
                            : isCosmic && t.id === 'cosmic-quest'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-[#7C3AED] text-white'
                        }`}>
                          <span>✓</span> Active
                        </div>
                      )}
                    </div>

                    {/* Bottom Label Bar */}
                    <div className={`p-2 w-full text-left flex items-center justify-between ${
                      isNeon
                        ? 'bg-[#030712] border-t border-cyan-500/40'
                        : isCosmic
                        ? 'bg-[#040C1A] border-t border-cyan-500/30'
                        : 'bg-white border-t border-slate-100'
                    }`}>
                      <div>
                        <div className={`text-xs font-black leading-tight ${isNeon || isCosmic ? 'text-white' : 'text-[#0F172A]'}`}>
                          {t.name}
                        </div>
                        <div className={`text-[10px] font-medium leading-tight ${isNeon || isCosmic ? 'text-slate-400' : 'text-slate-500'}`}>
                          {t.tag}
                        </div>
                      </div>
                      <span className="text-xs">
                        {t.id === 'neon-arcade' ? '🎮' : t.id === 'cosmic-quest' ? '🪐' : t.id === 'champion-mode' ? '🏆' : '🎉'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Authoring Area: Left Sidebar (Question list) & Right Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Sidebar: Questions list */}
          <div
            className={`lg:col-span-3 p-4 sm:p-5 rounded-3xl space-y-3 transition-all ${
              isNeon
                ? 'bg-[#060B1E]/60 backdrop-blur-xl border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
                : isCosmic
                ? 'bg-[#071326]/60 backdrop-blur-xl border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
                : isChampion
                ? 'bg-white/85 backdrop-blur-md border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.1)]'
                : 'bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
            }`}
          >
            <div className={`flex items-center justify-between pb-1 border-b ${
              isNeon || isCosmic ? 'border-cyan-500/40' : isChampion ? 'border-amber-200' : 'border-slate-100'
            }`}>
              <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isNeon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : isCosmic ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : isChampion ? 'text-amber-800' : 'text-slate-500'
              }`}>
                <span>📑</span> QUESTIONS ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className={`text-xs font-black px-3.5 py-1.5 rounded-full text-white flex items-center gap-1 transition-all hover:scale-105 ${
                  isNeon
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.7)] border border-pink-300'
                    : isCosmic
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300'
                    : isChampion
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md border border-amber-200'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-sm shadow-purple-500/20'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isSelected = activeQuestionIdx === idx;
                return (
                  <div
                    key={q.id || idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? isNeon
                          ? 'bg-cyan-950/60 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                          : isCosmic
                          ? 'bg-[#040C1A] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                          : isChampion
                          ? 'bg-amber-50/90 border-amber-400 shadow-sm'
                          : 'bg-purple-50/70 border-purple-400/80 shadow-xs'
                        : isNeon
                          ? 'bg-[#030712]/70 border-slate-800/80 hover:border-cyan-500/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : isCosmic
                          ? 'bg-[#040C1A]/60 border-cyan-900/60 hover:border-cyan-500/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : isChampion
                          ? 'bg-white/80 border-amber-100 hover:border-amber-300'
                          : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                          isSelected
                            ? isNeon
                              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.9)]'
                              : isCosmic
                              ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                              : isChampion
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'bg-[#7C3AED] text-white shadow-xs'
                            : isNeon || isCosmic
                              ? 'bg-slate-800 text-slate-400'
                              : isChampion
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? isNeon
                              ? 'font-black text-cyan-200 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                              : isCosmic
                              ? 'font-black text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : isChampion
                              ? 'font-black text-amber-950'
                              : 'font-black text-[#0F172A]'
                            : isNeon || isCosmic
                              ? 'font-medium text-slate-400'
                              : 'font-medium text-slate-600'
                        }`}
                      >
                        {q.question_text || 'Untitled Question'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(idx)}
                        className={`p-1 rounded transition-colors ${
                          isNeon || isCosmic ? 'text-slate-500 hover:text-cyan-300' : isChampion ? 'text-amber-600 hover:text-amber-800' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className={`p-1 rounded transition-colors ${
                          isNeon || isCosmic ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Canvas: Question Authoring */}
          <div
            className={`lg:col-span-9 p-5 sm:p-7 rounded-3xl flex flex-col justify-between transition-all ${
              isNeon
                ? 'bg-[#060B1E]/60 backdrop-blur-xl border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
                : isCosmic
                ? 'bg-[#071326]/60 backdrop-blur-xl border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_20px_rgba(6,182,212,0.08)]'
                : isChampion
                ? 'bg-white/85 backdrop-blur-md border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.1)]'
                : 'bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
            }`}
          >
            <div className="space-y-6">
              {/* Question Textarea & Type Selector */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isNeon ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'text-slate-500'
                  }`}>
                    <span>❓</span> QUESTION #{activeQuestionIdx + 1} TEXT
                  </label>

                  {/* Multiple Choice vs True/False Pill Switcher */}
                  <div className={`inline-flex p-1 rounded-full border-2 self-start sm:self-auto transition-all ${
                    isNeon
                      ? 'bg-[#030712] border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : isCosmic
                      ? 'bg-[#050E1E] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : isChampion
                      ? 'bg-amber-100/80 border-amber-300'
                      : 'bg-slate-100 border-slate-200/70'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleSwitchType('multiple_choice')}
                      className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                        currentQ.question_type === 'multiple_choice'
                          ? isNeon
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] border border-pink-300'
                            : isCosmic
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                            : isChampion
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'bg-[#7C3AED] text-white shadow-xs'
                          : isNeon || isCosmic
                            ? 'text-slate-400 hover:text-white'
                            : isChampion
                            ? 'text-amber-800 hover:text-amber-950'
                            : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Multiple Choice (4)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchType('true_false')}
                      className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                        currentQ.question_type === 'true_false'
                          ? isNeon
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] border border-pink-300'
                            : isCosmic
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                            : isChampion
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'bg-[#7C3AED] text-white shadow-xs'
                          : isNeon || isCosmic
                            ? 'text-slate-400 hover:text-white'
                            : isChampion
                            ? 'text-amber-800 hover:text-amber-950'
                            : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      True / False (2)
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={currentQ.question_text}
                  onChange={(e) => handleUpdateCurrentQ({ question_text: e.target.value })}
                  placeholder="Type your question here (e.g. Which planet is closest to the sun?)..."
                  className={`w-full px-4 py-3.5 rounded-2xl text-sm sm:text-base font-semibold resize-none leading-relaxed transition-all ${
                    isNeon
                      ? 'bg-[#030712]/95 border-2 border-cyan-500/70 text-white placeholder:text-slate-500 shadow-[0_0_20px_rgba(6,182,212,0.25)] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                      : isCosmic
                      ? 'bg-[#040C1A]/95 border-2 border-cyan-500/60 text-white placeholder:text-slate-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                      : isChampion
                      ? 'bg-white/95 border-2 border-amber-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40 shadow-sm'
                      : 'bg-slate-50/70 border border-slate-200/80 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 placeholder:text-slate-400'
                  }`}
                  required
                />
              </div>

              {/* Time Limit & Points Pill Controls */}
              <div className={`flex flex-wrap items-center gap-4 py-2 border-y ${
                isNeon || isCosmic ? 'border-cyan-500/30' : isChampion ? 'border-amber-200' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${
                    isNeon ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : isCosmic || isChampion ? 'text-amber-500' : 'text-[#7C3AED]'
                  }`} />
                  <span className={`text-xs font-bold ${isNeon || isCosmic ? 'text-slate-300' : 'text-slate-600'}`}>Time Limit:</span>
                  <select
                    value={currentQ.time_limit_seconds}
                    onChange={(e) => handleUpdateCurrentQ({ time_limit_seconds: Number(e.target.value) })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black focus:outline-none transition-all ${
                      isNeon
                        ? 'bg-[#030712] border-2 border-cyan-500/70 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] focus:border-cyan-300'
                        : isCosmic
                        ? 'bg-[#050E1E] border-2 border-cyan-500/60 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)] focus:border-cyan-300'
                        : isChampion
                        ? 'bg-amber-50/90 border border-amber-300 text-slate-800 focus:ring-2 focus:ring-amber-400/40'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-purple-400/40'
                    }`}
                  >
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={20}>20 seconds (Standard)</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className={
                    isNeon ? 'text-pink-400 text-sm drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' : isCosmic || isChampion ? 'text-amber-500 text-sm' : 'text-[#7C3AED] text-sm'
                  }>⭐</span>
                  <span className={`text-xs font-bold ${isNeon || isCosmic ? 'text-slate-300' : 'text-slate-600'}`}>Points:</span>
                  <select
                    value={currentQ.points}
                    onChange={(e) => handleUpdateCurrentQ({ points: Number(e.target.value) })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black focus:outline-none transition-all ${
                      isNeon
                        ? 'bg-[#030712] border-2 border-cyan-500/70 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] focus:border-cyan-300'
                        : isCosmic
                        ? 'bg-[#050E1E] border-2 border-cyan-500/60 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)] focus:border-cyan-300'
                        : isChampion
                        ? 'bg-amber-50/90 border border-amber-300 text-slate-800 focus:ring-2 focus:ring-amber-400/40'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-purple-400/40'
                    }`}
                  >
                    <option value={1000}>1000 Standard</option>
                    <option value={2000}>2000 Double Points</option>
                  </select>
                </div>
              </div>

              {/* Answer Options Grid */}
              <div>
                <div className="mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isNeon ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.7)]' : isCosmic || isChampion ? 'text-amber-700 font-extrabold' : 'text-slate-500'
                  }`}>
                    <span>📋</span> ANSWER OPTIONS (CLICK CHECKMARK TO SELECT CORRECT ANSWER)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    {
                      neonBg: 'bg-[#18070D] border-2 border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.5),inset_0_0_10px_rgba(244,63,94,0.2)] text-rose-400',
                      cosmicBg: 'bg-gradient-to-r from-[#59101C] to-[#2B080E] border-2 border-rose-500/90 shadow-[0_0_20px_rgba(244,63,94,0.4),inset_0_0_10px_rgba(244,63,94,0.15)] text-rose-300',
                      championBg: 'bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white shadow-md border border-rose-300',
                      pastelBg: 'bg-[#EF4444]',
                      shape: '▲',
                    },
                    {
                      neonBg: 'bg-[#070F22] border-2 border-blue-500 shadow-[0_0_22px_rgba(59,130,246,0.5),inset_0_0_10px_rgba(59,130,246,0.2)] text-blue-400',
                      cosmicBg: 'bg-gradient-to-r from-[#0C355E] to-[#061B30] border-2 border-cyan-400/90 shadow-[0_0_20px_rgba(6,182,212,0.4),inset_0_0_10px_rgba(6,182,212,0.15)] text-cyan-300',
                      championBg: 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-md border border-sky-300',
                      pastelBg: 'bg-[#3B82F6]',
                      shape: '◆',
                    },
                    {
                      neonBg: 'bg-[#1C1304] border-2 border-amber-500 shadow-[0_0_22px_rgba(245,158,11,0.5),inset_0_0_10px_rgba(245,158,11,0.2)] text-amber-400',
                      cosmicBg: 'bg-gradient-to-r from-[#5E3808] to-[#2E1B04] border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.4),inset_0_0_10px_rgba(245,158,11,0.15)] text-amber-300',
                      championBg: 'bg-gradient-to-r from-[#D97706] to-[#B45309] text-white shadow-md border border-amber-300',
                      pastelBg: 'bg-[#F59E0B]',
                      shape: '●',
                    },
                    {
                      neonBg: 'bg-[#041B12] border-2 border-emerald-500 shadow-[0_0_22px_rgba(16,185,129,0.5),inset_0_0_10px_rgba(16,185,129,0.2)] text-emerald-400',
                      cosmicBg: 'bg-gradient-to-r from-[#0B4527] to-[#052314] border-2 border-emerald-400/90 shadow-[0_0_20px_rgba(16,185,129,0.4),inset_0_0_10px_rgba(16,185,129,0.15)] text-emerald-300',
                      championBg: 'bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-md border border-emerald-300',
                      pastelBg: 'bg-[#10B981]',
                      shape: '■',
                    },
                  ].slice(0, currentQ.answer_options.length).map((style, optIdx) => {
                    const opt = currentQ.answer_options[optIdx];
                    if (!opt) return null;

                    return (
                      <div
                        key={opt.id || optIdx}
                        className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
                          isNeon
                            ? `${style.neonBg} ${opt.is_correct ? 'ring-2 ring-white scale-[1.01]' : ''}`
                            : isCosmic
                            ? `${style.cosmicBg} ${opt.is_correct ? 'ring-2 ring-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-[1.01]' : ''}`
                            : isChampion
                            ? `${style.championBg} ${opt.is_correct ? 'ring-4 ring-amber-300 shadow-xl scale-[1.01]' : 'opacity-95'}`
                            : `${style.pastelBg} ${opt.is_correct ? 'ring-4 ring-emerald-400/80 scale-[1.01]' : 'opacity-95'} shadow-sm`
                        }`}
                      >
                        <span className="font-black text-lg select-none pl-1">
                          {style.shape}
                        </span>
                        <input
                          type="text"
                          value={opt.answer_text}
                          onChange={(e) => handleUpdateAnswerText(optIdx, e.target.value)}
                          placeholder={`Answer option ${optIdx + 1}...`}
                          className={`flex-1 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
                            isNeon || isCosmic
                              ? 'bg-black/40 text-white border-white/20 focus:border-cyan-400 placeholder:text-slate-400'
                              : 'bg-black/15 text-white border-white/20 focus:bg-black/25 placeholder:text-white/60'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleSetCorrectOption(optIdx)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            opt.is_correct
                              ? isNeon
                                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.9)] scale-110'
                                : isCosmic
                                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,1)] scale-110'
                                : 'bg-white text-emerald-600 shadow-md scale-110'
                              : isNeon || isCosmic
                                ? 'bg-black/40 text-slate-500 hover:text-white border border-slate-700'
                                : 'bg-black/25 text-white/40 hover:text-white hover:bg-black/40'
                          }`}
                          title={opt.is_correct ? 'Correct Answer' : 'Mark as Correct'}
                        >
                          <CheckCircle2 className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
