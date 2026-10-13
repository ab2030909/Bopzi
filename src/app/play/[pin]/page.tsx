'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { PlayerGameView } from '@/types/game';
import { THEMES } from '@/types/theme';
import { Mascot } from '@/components/mascot/Mascot';
import { sounds } from '@/lib/audio';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function PlayerGameContent() {
  const params = useParams();
  const pin = params?.pin as string;
  const router = useRouter();
  const { setThemeId } = useTheme();

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [view, setView] = useState<PlayerGameView | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const prevQuestionIdxRef = useRef(-1);
  const prevResultStateRef = useRef<string>('');

  // 1. Load participant session
  useEffect(() => {
    if (!pin) return;
    const stored = sessionStorage.getItem(`ak_participant_${pin}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setParticipantId(parsed.id);
        return;
      } catch (e) {}
    }

    // Check if nickname was provided in query string for instant joining
    const searchParams = new URLSearchParams(window.location.search);
    const queryNick = searchParams.get('nickname');
    if (queryNick) {
      fetch(`/api/game/${pin}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', nickname: queryNick.slice(0, 20), avatar: 'blip' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.participant) {
            sessionStorage.setItem(`ak_participant_${pin}`, JSON.stringify(data.participant));
            setParticipantId(data.participant.id);
          } else {
            router.push(`/join?pin=${pin}`);
          }
        })
        .catch(() => router.push(`/join?pin=${pin}`));
    } else {
      router.push(`/join?pin=${pin}`);
    }
  }, [pin, router]);

  // 2. Fetch Player View
  const fetchPlayerView = async () => {
    if (!pin || !participantId) return;

    try {
      const res = await fetch(`/api/game/${pin}/view?role=player&participantId=${participantId}`);
      const data = await res.json();
      if (data.success && data.view) {
        setView(data.view);
        setThemeId(data.view.session.theme_id);

        // Sound on new question start
        if (
          data.view.session.state === 'question_active' &&
          data.view.session.current_question_index !== prevQuestionIdxRef.current
        ) {
          sounds.playQuestionStart();
          prevQuestionIdxRef.current = data.view.session.current_question_index;
          setSubmitting(false);
        }

        // Sound and vibration on answer reveal
        if (
          data.view.session.state === 'answer_reveal' &&
          prevResultStateRef.current !== `q-${data.view.session.current_question_index}`
        ) {
          prevResultStateRef.current = `q-${data.view.session.current_question_index}`;
          if (data.view.lastAnswerResult?.is_correct) {
            sounds.playCorrect();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          } else {
            sounds.playIncorrect();
          }
        }
      } else if (res.status === 404) {
        // Player removed or session expired
        sessionStorage.removeItem(`ak_participant_${pin}`);
        router.push(`/join?pin=${pin}`);
      }
    } catch (e) {
      console.error('Failed to fetch player view', e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Realtime SSE connection + polling sync
  useEffect(() => {
    if (!pin || !participantId) return;
    fetchPlayerView();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/game/${pin}/stream`);
      eventSource.onmessage = () => {
        fetchPlayerView();
      };
      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
      };
    } catch (e) {}

    const interval = setInterval(fetchPlayerView, 1500);
    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [pin, participantId]);

  // 4. Client countdown calculation
  useEffect(() => {
    if (view?.session.state === 'question_active' && view.session.question_deadline) {
      const deadline = new Date(view.session.question_deadline).getTime();
      const update = () => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setTimeLeft(remaining);
      };
      update();
      const t = setInterval(update, 500);
      return () => clearInterval(t);
    }
  }, [view?.session.state, view?.session.question_deadline]);

  // Submit Answer Action
  const handleSubmitAnswer = async (optionId: string) => {
    if (!view?.currentQuestion || view.hasAnswered || submitting) return;

    try {
      setSubmitting(true);
      sounds.playAnswerSubmitted();

      const res = await fetch(`/api/game/${pin}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_answer',
          participantId,
          questionId: view.currentQuestion.id,
          selectedOptionId: optionId,
        }),
      });

      const data = await res.json();
      if (data.isAccepted) {
        fetchPlayerView();
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !view) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3" />
        <span className="font-bold">Joining game room...</span>
      </div>
    );
  }

  const { session, me, currentQuestion, hasAnswered, selectedOptionId, lastAnswerResult, podium } = view;
  const currentTheme = THEMES[session.theme_id] || THEMES['party-pop'];

  const answerButtons = [
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
    <div className={`relative min-h-screen w-full flex-1 flex flex-col transition-colors duration-500 overflow-hidden ${
      isNeon
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0 opacity-90"
          style={{ backgroundImage: "url('/images/bopzi_pastel_bg.png')" }}
        />
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col p-4 max-w-xl mx-auto w-full justify-between">
        {/* Player Header Bar: Nickname, Score, Rank */}
        <header
          className={`flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-md shadow-md mb-4 transition-all ${
            isNeon
              ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
              : isCosmic
              ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
              : isChampion
              ? 'bg-white/90 border-2 border-amber-300 shadow-[0_10px_25px_rgba(245,158,11,0.12)]'
              : isPartyPop
              ? 'bg-white/95 border-purple-100 shadow-[0_8px_20px_rgba(124,58,237,0.06)]'
              : ''
          }`}
        style={
          !isNeon && !isCosmic && !isPartyPop
            ? {
                backgroundColor: `${currentTheme.colors.surface}ee`,
                borderColor: currentTheme.colors.border,
              }
            : undefined
        }
      >
        <div className="flex items-center gap-2.5">
          <Mascot themeId={session.theme_id} state="idle" size="sm" className="w-8 h-8" />
          <div>
            <div className={`text-xs font-black truncate max-w-[120px] ${
              isPartyPop ? 'text-[#0F172A]' : 'text-white'
            }`}>
              {me.nickname}
            </div>
            {me.streak >= 2 && (
              <div className={`text-[10px] font-bold flex items-center gap-1 ${
                isNeon
                  ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                  : isCosmic
                  ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : 'text-amber-500'
              }`}>
                <Flame className="w-3 h-3 fill-current" /> {me.streak} Streak
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xs font-bold ${
            isNeon ? 'text-cyan-300' : isCosmic ? 'text-amber-300' : isPartyPop ? 'text-slate-500' : 'text-slate-300'
          }`}>Score</div>
          <div className={`text-xl font-black font-mono leading-none ${
            isNeon
              ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : isCosmic
              ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              : isPartyPop
              ? 'text-[#7C3AED]'
              : 'text-white'
          }`}>
            {me.score}
          </div>
        </div>
      </header>

      {/* STATE 1: WAITING LOBBY */}
      {session.state === 'lobby' && (
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl border shadow-2xl my-auto backdrop-blur-xl transition-all ${
            isNeon
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
          <div className="mb-4 animate-celebrate">
            <Mascot themeId={session.theme_id} state="excited" size="lg" />
          </div>

          <span
            className={`text-xs font-black uppercase px-4 py-1.5 rounded-full text-white mb-2 shadow-sm ${
              isNeon
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.7)] border border-pink-300'
                : isCosmic
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.7)] border border-amber-300'
                : isPartyPop
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899]'
                : ''
            }`}
            style={!isNeon && !isCosmic && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
          >
            Room PIN: {session.game_pin}
          </span>

          <h2 className={`text-2xl sm:text-3xl font-black mt-2 ${
            isPartyPop ? 'text-[#0F172A]' : 'text-white'
          }`}>
            You&apos;re in, {me.nickname}!
          </h2>

          <p className={`text-sm mt-2 max-w-xs leading-relaxed ${
            isPartyPop ? 'text-slate-600' : 'text-slate-300'
          }`}>
            See your name on the host&apos;s main screen? Get ready, questions will appear automatically!
          </p>

          <div className={`mt-8 flex items-center gap-2 text-xs font-bold animate-pulse ${
            isNeon ? 'text-cyan-300' : isCosmic ? 'text-cyan-300' : isPartyPop ? 'text-[#7C3AED]' : 'text-slate-400'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Waiting for host to start the game...</span>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE QUESTION */}
      {session.state === 'question_active' && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          {/* Question Text & Remaining Time */}
          <div
            className={`p-5 rounded-2xl border shadow-lg text-center backdrop-blur-md transition-all ${
              isNeon
                ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35),inset_0_0_15px_rgba(6,182,212,0.1)]'
                : isCosmic
                ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.25),inset_0_0_15px_rgba(6,182,212,0.08)]'
                : isPartyPop
                ? 'bg-white/95 border-purple-100 shadow-[0_10px_30px_rgba(124,58,237,0.08)]'
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
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase ${
                isNeon
                  ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                  : isCosmic
                  ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : isPartyPop
                  ? 'text-[#7C3AED]'
                  : 'text-slate-400'
              }`}>
                Q {session.current_question_index + 1} / {session.total_questions}
              </span>
              <div
                className={`flex items-center gap-1 font-mono text-xs font-black px-2.5 py-0.5 rounded-full border transition-all ${
                  timeLeft <= 5
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : isNeon
                    ? 'bg-[#030712] border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : isCosmic
                    ? 'bg-[#040C1A] border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : isPartyPop
                    ? 'bg-purple-50 text-[#7C3AED] border-purple-200'
                    : 'text-white border-white/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <h3 className={`text-lg sm:text-xl font-black leading-snug ${
              isNeon
                ? 'text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : isCosmic
                ? 'text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                : isPartyPop
                ? 'text-[#0F172A]'
                : 'text-white'
            }`}>
              {currentQuestion.question_text}
            </h3>
          </div>

          {/* If already answered, show waiting state */}
          {hasAnswered ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border shadow-xl text-center backdrop-blur-md my-4 animate-pop transition-all ${
                isNeon
                  ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
                  : isCosmic
                  ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                  : isPartyPop
                  ? 'bg-white/95 border-purple-100 shadow-[0_15px_40px_rgba(124,58,237,0.08)]'
                  : ''
              }`}
              style={
                !isNeon && !isCosmic && !isPartyPop
                  ? {
                      backgroundColor: `${currentTheme.colors.surface}dd`,
                      borderColor: currentTheme.colors.border,
                    }
                  : undefined
              }
            >
              <CheckCircle2 className={`w-16 h-16 mb-3 animate-bounce-gentle ${
                isNeon
                  ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                  : isCosmic
                  ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                  : 'text-emerald-500'
              }`} />
              <h3 className={`text-2xl font-black ${isPartyPop ? 'text-[#0F172A]' : 'text-white'}`}>Answer Locked In!</h3>
              <p className={`text-xs mt-1 max-w-xs ${isPartyPop ? 'text-slate-500' : 'text-slate-300'}`}>
                Fingers crossed! Results will be revealed when the timer ends.
              </p>
            </div>
          ) : (
            /* 4 Big Tap Buttons for Answers */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 my-2">
              {currentQuestion.answer_options.map((opt, idx) => {
                const btn = answerButtons[idx] || answerButtons[0];
                const neonStyles = [
                  {
                    card: 'bg-[#18070D] border-2 border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.5),inset_0_0_10px_rgba(244,63,94,0.2)] text-rose-300 hover:shadow-[0_0_30px_rgba(244,63,94,0.8)]',
                    shape: 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]',
                  },
                  {
                    card: 'bg-[#070F22] border-2 border-blue-500 shadow-[0_0_22px_rgba(59,130,246,0.5),inset_0_0_10px_rgba(59,130,246,0.2)] text-blue-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]',
                    shape: 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]',
                  },
                  {
                    card: 'bg-[#1C1304] border-2 border-amber-500 shadow-[0_0_22px_rgba(245,158,11,0.5),inset_0_0_10px_rgba(245,158,11,0.2)] text-amber-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.8)]',
                    shape: 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]',
                  },
                  {
                    card: 'bg-[#041B12] border-2 border-emerald-500 shadow-[0_0_22px_rgba(16,185,129,0.5),inset_0_0_10px_rgba(16,185,129,0.2)] text-emerald-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]',
                    shape: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]',
                  },
                ];
                const cosmicStyles = [
                  {
                    card: 'bg-gradient-to-r from-[#59101C] to-[#2B080E] border-2 border-rose-500/90 shadow-[0_0_22px_rgba(244,63,94,0.4),inset_0_0_10px_rgba(244,63,94,0.15)] text-rose-300 hover:shadow-[0_0_30px_rgba(244,63,94,0.7)]',
                    shape: 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#0C355E] to-[#061B30] border-2 border-cyan-400/90 shadow-[0_0_22px_rgba(6,182,212,0.4),inset_0_0_10px_rgba(6,182,212,0.15)] text-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.7)]',
                    shape: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#5E3808] to-[#2E1B04] border-2 border-amber-400/90 shadow-[0_0_22px_rgba(245,158,11,0.4),inset_0_0_10px_rgba(245,158,11,0.15)] text-amber-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.7)]',
                    shape: 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#0B4527] to-[#052314] border-2 border-emerald-400/90 shadow-[0_0_22px_rgba(16,185,129,0.4),inset_0_0_10px_rgba(16,185,129,0.15)] text-emerald-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.7)]',
                    shape: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]',
                  },
                ];
                const championStyles = [
                  {
                    card: 'bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white shadow-xl border border-rose-300',
                    shape: 'text-rose-100 drop-shadow',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-xl border border-sky-300',
                    shape: 'text-sky-100 drop-shadow',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#D97706] to-[#B45309] text-white shadow-xl border border-amber-300',
                    shape: 'text-amber-100 drop-shadow',
                  },
                  {
                    card: 'bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-xl border border-emerald-300',
                    shape: 'text-emerald-100 drop-shadow',
                  },
                ];
                const optionStyle = isNeon ? neonStyles[idx] || neonStyles[0] : isCosmic ? cosmicStyles[idx] || cosmicStyles[0] : isChampion ? championStyles[idx] || championStyles[0] : null;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSubmitAnswer(opt.id)}
                    disabled={submitting || timeLeft <= 0}
                    className={`p-6 rounded-2xl flex items-center justify-center sm:justify-start gap-4 font-black text-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${
                      optionStyle
                        ? `${optionStyle.card}`
                        : 'text-white shadow-xl'
                    }`}
                    style={!optionStyle ? { backgroundColor: btn.color } : undefined}
                  >
                    <span className={`text-3xl select-none ${
                      optionStyle ? optionStyle.shape : 'drop-shadow'
                    }`}>
                      {btn.shape}
                    </span>
                    <span className={`text-base sm:text-lg leading-tight text-left ${optionStyle ? 'text-white' : ''}`}>
                      {opt.answer_text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STATE 3: ANSWER REVEAL */}
      {session.state === 'answer_reveal' && lastAnswerResult && (
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border shadow-2xl my-auto animate-pop transition-all ${
            isNeon
              ? lastAnswerResult.is_correct
                ? 'bg-[#041B12]/95 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5),inset_0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-[#18070D]/95 border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.5),inset_0_0_15px_rgba(244,63,94,0.2)]'
              : isCosmic
              ? lastAnswerResult.is_correct
                ? 'bg-[#042017]/95 border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.4)]'
                : 'bg-[#220713]/95 border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
              : isPartyPop
              ? lastAnswerResult.is_correct
                ? 'bg-emerald-50/95 border-2 border-emerald-200 shadow-[0_15px_40px_rgba(16,185,129,0.1)]'
                : 'bg-rose-50/95 border-2 border-rose-200 shadow-[0_15px_40px_rgba(244,63,94,0.1)]'
              : lastAnswerResult.is_correct
              ? 'bg-emerald-950/80 border-emerald-500'
              : 'bg-rose-950/80 border-rose-500'
          }`}
        >
          {lastAnswerResult.is_correct ? (
            <>
              <CheckCircle2 className={`w-20 h-20 mb-2 animate-bounce-gentle ${
                isNeon ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.9)]' : isCosmic ? 'text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.7)]' : 'text-emerald-500'
              }`} />
              <h2 className={`text-3xl sm:text-4xl font-black ${
                isNeon ? 'text-white drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]' : isCosmic ? 'text-emerald-300 drop-shadow-[0_0_14px_rgba(110,231,183,0.6)]' : isPartyPop ? 'text-emerald-700' : 'text-white'
              }`}>CORRECT!</h2>
              <div className={`text-2xl font-black font-mono mt-2 ${
                isNeon ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,0.8)]' : isCosmic ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : isPartyPop ? 'text-emerald-600' : 'text-emerald-300'
              }`}>
                +{lastAnswerResult.points_awarded} pts
              </div>
              <p className={`text-xs mt-1 ${isCosmic ? 'text-cyan-200 font-medium' : isPartyPop ? 'text-emerald-700 font-bold' : 'text-emerald-200'}`}>Lightning fast answer bonus awarded!</p>
            </>
          ) : (
            <>
              <XCircle className={`w-20 h-20 mb-2 animate-wiggle ${
                isNeon ? 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]' : isCosmic ? 'text-rose-400 drop-shadow-[0_0_16px_rgba(244,63,94,0.7)]' : 'text-rose-500'
              }`} />
              <h2 className={`text-3xl sm:text-4xl font-black ${
                isNeon ? 'text-white drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]' : isCosmic ? 'text-rose-300' : isPartyPop ? 'text-rose-700' : 'text-white'
              }`}>INCORRECT</h2>
              <div className={`text-lg font-bold mt-2 ${isPartyPop ? 'text-rose-600' : 'text-rose-300'}`}>+0 pts</div>
              <p className={`text-xs mt-1 ${isCosmic ? 'text-slate-300' : isPartyPop ? 'text-rose-600' : 'text-rose-200'}`}>Keep your focus for the next round!</p>
            </>
          )}

          <div className={`mt-8 pt-4 border-t w-full flex items-center justify-around ${
            isCosmic ? 'border-cyan-500/30' : isPartyPop ? 'border-purple-200/60' : 'border-white/10'
          }`}>
            <div>
              <div className={`text-xs font-bold uppercase ${isCosmic ? 'text-slate-400' : isPartyPop ? 'text-slate-500' : 'text-slate-300'}`}>Current Rank</div>
              <div className={`text-xl font-black ${
                isNeon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : isCosmic ? 'text-amber-300' : isPartyPop ? 'text-[#7C3AED]' : 'text-white'
              }`}>
                #{lastAnswerResult.rank}
              </div>
            </div>
            <div>
              <div className={`text-xs font-bold uppercase ${isCosmic ? 'text-slate-400' : isPartyPop ? 'text-slate-500' : 'text-slate-300'}`}>Total Score</div>
              <div className={`text-xl font-black font-mono ${
                isNeon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : isCosmic ? 'text-cyan-300' : isPartyPop ? 'text-[#7C3AED]' : 'text-white'
              }`}>
                {lastAnswerResult.total_score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: LEADERBOARD VIEW */}
      {session.state === 'leaderboard' && (
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border shadow-2xl my-auto backdrop-blur-xl transition-all ${
            isNeon
              ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
              : isCosmic
              ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
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
          <Trophy className={`w-14 h-14 mb-2 ${
            isNeon ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : isCosmic ? 'text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.5)]' : 'text-amber-400'
          }`} />
          <h2 className={`text-2xl sm:text-3xl font-black ${isPartyPop ? 'text-[#0F172A]' : 'text-white'}`}>Look at the Big Screen!</h2>
          <p className={`text-xs mt-1 max-w-xs ${isCosmic ? 'text-cyan-200/80' : isPartyPop ? 'text-slate-600' : 'text-slate-300'}`}>
            Leaderboard standings are rolling on the projector display.
          </p>

          <div
            className={`mt-8 p-4 rounded-2xl border w-full max-w-xs ${
              isNeon
                ? 'bg-[#030712]/90 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                : isCosmic
                ? 'bg-[#0a1a36]/90 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                : isPartyPop
                ? 'bg-purple-50/90 border-purple-200 shadow-sm'
                : 'bg-black/30'
            }`}
            style={!isNeon && !isCosmic && !isPartyPop ? { borderColor: currentTheme.colors.border } : undefined}
          >
            <div className={`text-xs font-bold uppercase ${isNeon ? 'text-pink-400' : isCosmic ? 'text-amber-300' : isPartyPop ? 'text-[#7C3AED]' : 'text-slate-400'}`}>Your Position</div>
            <div className={`text-3xl font-black mt-1 ${
              isNeon ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]' : isCosmic ? 'text-amber-300' : isPartyPop ? 'text-[#7C3AED]' : 'text-white'
            }`}>
              {me.score} pts
            </div>
          </div>
        </div>
      )}

      {/* STATE 5: FINISHED / PODIUM */}
      {session.state === 'finished' && (
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border shadow-2xl my-auto backdrop-blur-xl transition-all ${
            isNeon
              ? 'bg-[#060B1E]/90 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35),inset_0_0_20px_rgba(6,182,212,0.1)]'
              : isCosmic
              ? 'bg-[#071326]/90 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
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
          <div className="mb-3 animate-celebrate">
            <Mascot themeId={session.theme_id} state="celebrating" size="lg" />
          </div>

          <h2 className={`text-3xl sm:text-4xl font-black ${isPartyPop ? 'text-[#0F172A]' : 'text-white'}`}>Game Over!</h2>
          <p className={`text-sm mt-1 ${isCosmic ? 'text-cyan-200/80' : isPartyPop ? 'text-slate-600' : 'text-slate-300'}`}>
            Great competition! Check the main podium for the champion honors.
          </p>

          <div
            className={`mt-6 p-4 rounded-2xl border w-full max-w-xs ${
              isNeon
                ? 'bg-[#030712]/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                : isCosmic
                ? 'bg-[#0a1a36]/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
                : isPartyPop
                ? 'bg-amber-50/90 border-amber-200 shadow-sm'
                : 'bg-black/40'
            }`}
            style={!isNeon && !isCosmic && !isPartyPop ? { borderColor: currentTheme.colors.border } : undefined}
          >
            <div className={`text-xs font-bold uppercase ${isNeon ? 'text-pink-400' : isCosmic ? 'text-amber-300' : isPartyPop ? 'text-amber-600' : 'text-slate-400'}`}>Your Final Score</div>
            <div className={`text-3xl font-black font-mono mt-1 ${
              isNeon ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]' : isCosmic ? 'text-amber-300' : isPartyPop ? 'text-amber-600' : 'text-amber-300'
            }`}>
              {me.score} pts
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className={`mt-8 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 ${
              isNeon
                ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-2 border-cyan-300 shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)]'
                : isCosmic
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.8)]'
                : isPartyPop
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#DB2777] shadow-[0_10px_25px_rgba(124,58,237,0.3)]'
                : 'shadow-xl'
            }`}
            style={!isNeon && !isCosmic && !isPartyPop ? { backgroundColor: currentTheme.colors.primary } : undefined}
          >
            Back to Home
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default function PlayerGamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-white font-bold">
          Loading Arena...
        </div>
      }
    >
      <PlayerGameContent />
    </Suspense>
  );
}
