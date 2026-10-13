'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const { theme } = useTheme();

  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [themeId, setSelectedThemeId] = useState<ThemeId>(initialQuiz?.theme_id || 'party-pop');
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

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden flex flex-col font-sans transition-colors duration-500 ${
        isNeon ? 'bg-[#030712] text-white' : 'bg-[#FCFBFF] text-slate-800'
      }`}
    >
      {/* Background Layer: Dynamic based on Selected Theme */}
      {isNeon ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/neon_arcade_bg.png')" }}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/bopzi_pastel_bg.png')" }}
        />
      )}

      {/* Corner Mascots - Displayed on pastel themes, removed from Neon Arcade */}
      {!isNeon && (
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
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight">
                Create{' '}
                <span className={isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'text-[#7C3AED]'}>
                  New Quiz
                </span>
              </h1>
              <span className="text-2xl font-black select-none">
                {isNeon ? '⚡' : '🪄'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-medium mt-1 ${isNeon ? 'text-slate-400' : 'text-slate-500'}`}>
              Author questions, configure timers, answer options, and select your visual theme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                isNeon
                  ? 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 hover:bg-slate-800'
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
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] shadow-[0_0_25px_rgba(236,72,153,0.5)] border border-pink-400/50 hover:opacity-95'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-purple-500/25'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING...' : 'SAVE QUIZ'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-5 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            isNeon ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Card: Quiz Title, Description, Selected Visual Theme */}
        <div
          className={`p-5 sm:p-6 rounded-3xl mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all ${
            isNeon
              ? 'bg-[#0B1021]/80 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)]'
              : 'bg-white border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
          }`}
        >
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className={`text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                isNeon ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-slate-500'
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
                    ? 'bg-[#070B19]/90 border border-cyan-500/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-50/70 border border-slate-200/80 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 placeholder:text-slate-400'
                }`}
                required
              />
            </div>
            <div>
              <label className={`text-[11px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                isNeon ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-slate-500'
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
                    ? 'bg-[#070B19]/90 border border-cyan-500/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-50/70 border border-slate-200/80 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Right: Visual Themes 4-Tile Row */}
          <div className="lg:col-span-7">
            <label className={`text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isNeon ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-slate-500'
            }`}>
              <span>🎨</span> SELECTED VISUAL THEME
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'neon-arcade' as ThemeId,
                  name: 'Neon Arcade',
                  tag: 'Dark & Futuristic',
                  bg: isNeon ? 'bg-gradient-to-b from-[#0F172A] to-[#022C22]' : 'bg-gradient-to-b from-slate-900 to-teal-950',
                  icon: '🎮',
                  accent: '#06B6D4',
                  darkText: false,
                },
                {
                  id: 'party-pop' as ThemeId,
                  name: 'Party Pop',
                  tag: 'Big Fun!',
                  bg: 'bg-gradient-to-b from-purple-50 to-pink-50',
                  icon: '🎉',
                  accent: '#7C3AED',
                  darkText: true,
                },
                {
                  id: 'cosmic-quest' as ThemeId,
                  name: 'Cosmic Quest',
                  tag: 'Out of This World',
                  bg: 'bg-gradient-to-b from-indigo-950 to-purple-950',
                  icon: '🪐',
                  accent: '#8B5CF6',
                  darkText: false,
                },
                {
                  id: 'champion-mode' as ThemeId,
                  name: 'Champion Mode',
                  tag: 'For Winners',
                  bg: 'bg-gradient-to-b from-amber-50 to-orange-100',
                  icon: '🏆',
                  accent: '#F59E0B',
                  darkText: true,
                },
              ].map((t) => {
                const isSelected = themeId === t.id;
                const isLightCard = t.darkText;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeId(t.id);
                      sounds.playCountdownTick();
                    }}
                    className={`relative p-3 rounded-2xl text-center transition-all flex flex-col items-center justify-between min-h-[110px] overflow-hidden ${
                      t.bg
                    } ${
                      isSelected
                        ? isNeon && t.id === 'neon-arcade'
                          ? 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/40 scale-[1.03]'
                          : 'border-2 border-[#7C3AED] shadow-md ring-2 ring-purple-400/30 scale-[1.02]'
                        : isNeon
                          ? 'border border-slate-700/60 hover:scale-105 opacity-80 hover:opacity-100'
                          : 'border border-slate-200/80 hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                  >
                    {/* Selected Checkmark in Top Right */}
                    {isSelected && (
                      <span className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                        isNeon && t.id === 'neon-arcade'
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                          : 'bg-[#7C3AED] text-white'
                      }`}>
                        ✓
                      </span>
                    )}

                    <div className="text-2xl mt-1 select-none filter drop-shadow-sm">{t.icon}</div>
                    <div className="mt-2">
                      <div className={`text-xs font-black ${isLightCard ? 'text-[#0F172A]' : 'text-white'}`}>
                        {t.name}
                      </div>
                      <div className={`text-[10px] font-bold ${isLightCard ? 'text-slate-500' : 'text-slate-300'}`}>
                        {t.tag}
                      </div>
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
                ? 'bg-[#0B1021]/80 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)]'
                : 'bg-white border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
            }`}
          >
            <div className={`flex items-center justify-between pb-1 border-b ${isNeon ? 'border-cyan-500/20' : 'border-slate-100'}`}>
              <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isNeon ? 'text-cyan-300' : 'text-slate-500'
              }`}>
                <span>📑</span> QUESTIONS ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className={`text-xs font-black px-3 py-1.5 rounded-full text-white flex items-center gap-1 transition-all hover:scale-105 ${
                  isNeon
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-400/50'
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
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? isNeon
                          ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-purple-50/70 border-purple-400/80 shadow-xs'
                        : isNeon
                          ? 'bg-[#070B19]/60 border-slate-800 hover:border-cyan-500/50'
                          : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                          isSelected
                            ? isNeon
                              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                              : 'bg-[#7C3AED] text-white shadow-xs'
                            : isNeon
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? isNeon
                              ? 'font-black text-cyan-200'
                              : 'font-black text-[#0F172A]'
                            : isNeon
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
                          isNeon ? 'text-slate-500 hover:text-cyan-300' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className={`p-1 rounded transition-colors ${
                          isNeon ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
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
                ? 'bg-[#0B1021]/80 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)]'
                : 'bg-white border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
            }`}
          >
            <div className="space-y-6">
              {/* Question Textarea & Type Selector */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isNeon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-500'
                  }`}>
                    <span>❓</span> QUESTION #{activeQuestionIdx + 1} TEXT
                  </label>

                  {/* Multiple Choice vs True/False Pill Switcher */}
                  <div className={`inline-flex p-1 rounded-full border self-start sm:self-auto ${
                    isNeon ? 'bg-[#070B19] border-cyan-500/50' : 'bg-slate-100 border-slate-200/70'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleSwitchType('multiple_choice')}
                      className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                        currentQ.question_type === 'multiple_choice'
                          ? isNeon
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                            : 'bg-[#7C3AED] text-white shadow-xs'
                          : isNeon
                            ? 'text-slate-400 hover:text-white'
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
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                            : 'bg-[#7C3AED] text-white shadow-xs'
                          : isNeon
                            ? 'text-slate-400 hover:text-white'
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
                      ? 'bg-[#070B19]/90 border border-cyan-500/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-50/70 border border-slate-200/80 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 placeholder:text-slate-400'
                  }`}
                  required
                />
              </div>

              {/* Time Limit & Points Pill Controls */}
              <div className={`flex flex-wrap items-center gap-4 py-2 border-y ${isNeon ? 'border-cyan-500/20' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isNeon ? 'text-cyan-400' : 'text-[#7C3AED]'}`} />
                  <span className={`text-xs font-bold ${isNeon ? 'text-slate-300' : 'text-slate-600'}`}>Time Limit:</span>
                  <select
                    value={currentQ.time_limit_seconds}
                    onChange={(e) => handleUpdateCurrentQ({ time_limit_seconds: Number(e.target.value) })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black focus:outline-none transition-all ${
                      isNeon
                        ? 'bg-[#070B19] border border-cyan-500/50 text-white focus:border-cyan-400'
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
                  <span className={isNeon ? 'text-pink-400 text-sm' : 'text-[#7C3AED] text-sm'}>⭐</span>
                  <span className={`text-xs font-bold ${isNeon ? 'text-slate-300' : 'text-slate-600'}`}>Points:</span>
                  <select
                    value={currentQ.points}
                    onChange={(e) => handleUpdateCurrentQ({ points: Number(e.target.value) })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black focus:outline-none transition-all ${
                      isNeon
                        ? 'bg-[#070B19] border border-cyan-500/50 text-white focus:border-cyan-400'
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
                    isNeon ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-slate-500'
                  }`}>
                    <span>📋</span> ANSWER OPTIONS (CLICK CHECKMARK TO SELECT CORRECT ANSWER)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    {
                      neonBg: 'bg-[#18070D] border-2 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.4)] text-rose-400',
                      pastelBg: 'bg-[#EF4444]',
                      shape: '▲',
                    },
                    {
                      neonBg: 'bg-[#070F22] border-2 border-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.4)] text-blue-400',
                      pastelBg: 'bg-[#3B82F6]',
                      shape: '◆',
                    },
                    {
                      neonBg: 'bg-[#1C1304] border-2 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.4)] text-amber-400',
                      pastelBg: 'bg-[#F59E0B]',
                      shape: '●',
                    },
                    {
                      neonBg: 'bg-[#041B12] border-2 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.4)] text-emerald-400',
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
                            isNeon
                              ? 'bg-black/50 text-white border-white/20 focus:border-white/60 placeholder:text-slate-500'
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
                                : 'bg-white text-emerald-600 shadow-md scale-110'
                              : isNeon
                                ? 'bg-black/40 text-slate-600 hover:text-white border border-slate-700'
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
