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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Author questions, configure timers, answer options, and select your visual theme.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            style={{ backgroundColor: activeTheme.colors.primary }}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Quiz Metadata: Title, Description, Theme */}
      <div
        className="p-5 sm:p-6 rounded-2xl border mb-6 grid grid-cols-1 md:grid-cols-12 gap-5"
        style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
      >
        <div className="md:col-span-5 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science & Space Championship"
              className="w-full px-3.5 py-2.5 rounded-xl font-bold text-white bg-black/40 border focus:outline-none"
              style={{ borderColor: theme.colors.border }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for hosts and players..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-black/40 border focus:outline-none"
              style={{ borderColor: theme.colors.border }}
            />
          </div>
        </div>

        {/* Theme Picker */}
        <div className="md:col-span-7">
          <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
            Selected Visual Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
              const t = THEMES[tId];
              const isSelected = themeId === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => {
                    setSelectedThemeId(tId);
                    sounds.playCountdownTick();
                  }}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                    isSelected ? 'ring-2 scale-[1.02] shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${t.colors.primary}22` : 'rgba(0,0,0,0.2)',
                    borderColor: isSelected ? t.colors.primary : t.colors.border,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full mb-1.5"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  <div className="text-xs font-black text-white">{t.name}</div>
                  <div className="text-[10px] text-slate-300 truncate">{t.mascot.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Authoring Area: Left Sidebar (Question list) & Right Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Sidebar: Questions list */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Questions ({questions.length})
            </span>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs font-bold px-2.5 py-1 rounded-lg text-white flex items-center gap-1 transition-all hover:scale-105"
              style={{ backgroundColor: activeTheme.colors.primary }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isSelected = activeQuestionIdx === idx;
              return (
                <div
                  key={q.id || idx}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected ? 'ring-2 font-bold shadow' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${activeTheme.colors.surfaceHover}` : theme.colors.cardBg,
                    borderColor: isSelected ? activeTheme.colors.primary : theme.colors.border,
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                      style={{ backgroundColor: activeTheme.colors.primary }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs truncate text-slate-200">
                      {q.question_text || 'Untitled Question'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(idx)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Canvas: Question Authoring */}
        <div
          className="lg:col-span-9 p-6 rounded-2xl border flex flex-col justify-between"
          style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}
        >
          <div className="space-y-6">
            {/* Question Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase text-slate-300">
                  Question #{activeQuestionIdx + 1} Text
                </label>
                {/* Type toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchType('multiple_choice')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentQ.question_type === 'multiple_choice'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 bg-black/30'
                    }`}
                  >
                    Multiple Choice (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchType('true_false')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentQ.question_type === 'true_false'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 bg-black/30'
                    }`}
                  >
                    True / False (2)
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={currentQ.question_text}
                onChange={(e) => handleUpdateCurrentQ({ question_text: e.target.value })}
                placeholder="Type your question here (e.g. Which planet is closest to the sun?)..."
                className="w-full px-4 py-3 rounded-xl font-bold text-lg text-white bg-black/40 border focus:outline-none"
                style={{ borderColor: theme.colors.border }}
                required
              />
            </div>

            {/* Timers & Points controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Time Limit:</span>
                <select
                  value={currentQ.time_limit_seconds}
                  onChange={(e) => handleUpdateCurrentQ({ time_limit_seconds: Number(e.target.value) })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/40 border text-white focus:outline-none"
                  style={{ borderColor: theme.colors.border }}
                >
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={20}>20 seconds (Standard)</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Points:</span>
                <select
                  value={currentQ.points}
                  onChange={(e) => handleUpdateCurrentQ({ points: Number(e.target.value) })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/40 border text-white focus:outline-none"
                  style={{ borderColor: theme.colors.border }}
                >
                  <option value={1000}>1000 Standard</option>
                  <option value={2000}>2000 Double Points</option>
                </select>
              </div>
            </div>

            {/* Answer Options Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-300">
                  Answer Options (Click checkmark to select correct answer)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.answer_options.map((opt, optIdx) => {
                  const palette = answerColorPalette[optIdx] || answerColorPalette[0];
                  return (
                    <div
                      key={opt.id || optIdx}
                      className="p-3 rounded-2xl flex items-center gap-3 shadow-md border-2 transition-all"
                      style={{
                        backgroundColor: palette.color,
                        borderColor: opt.is_correct ? '#FFFFFF' : 'transparent',
                      }}
                    >
                      <span className="text-white font-black text-lg select-none">
                        {palette.shape}
                      </span>
                      <input
                        type="text"
                        value={opt.answer_text}
                        onChange={(e) => handleUpdateAnswerText(optIdx, e.target.value)}
                        placeholder={`Answer option ${optIdx + 1}...`}
                        className="flex-1 bg-black/20 text-white font-bold text-sm px-3 py-2 rounded-xl border border-white/20 focus:outline-none placeholder:text-white/60"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(optIdx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          opt.is_correct ? 'bg-white text-emerald-600 scale-110 shadow-lg' : 'bg-black/30 text-white/40 hover:text-white'
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
  );
}
