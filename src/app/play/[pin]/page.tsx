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

  return (
    <div className="flex-1 flex flex-col p-4 max-w-xl mx-auto w-full justify-between">
      {/* Player Header Bar: Nickname, Score, Rank */}
      <header
        className="flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-md shadow-md mb-4"
        style={{
          backgroundColor: `${currentTheme.colors.surface}ee`,
          borderColor: currentTheme.colors.border,
        }}
      >
        <div className="flex items-center gap-2.5">
          <Mascot themeId={session.theme_id} state="idle" size="sm" className="w-8 h-8" />
          <div>
            <div className="text-xs font-black text-white truncate max-w-[120px]">
              {me.nickname}
            </div>
            {me.streak >= 2 && (
              <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" /> {me.streak} Streak
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-slate-300">Score</div>
          <div className="text-xl font-black font-mono text-white leading-none">
            {me.score}
          </div>
        </div>
      </header>

      {/* STATE 1: WAITING LOBBY */}
      {session.state === 'lobby' && (
        <div
          className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl border shadow-2xl my-auto backdrop-blur-xl"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="mb-4 animate-celebrate">
            <Mascot themeId={session.theme_id} state="excited" size="lg" />
          </div>

          <span
            className="text-xs font-black uppercase px-3 py-1 rounded-full text-white mb-2"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            Room PIN: {session.game_pin}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            You&apos;re in, {me.nickname}!
          </h2>

          <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">
            See your name on the host&apos;s main screen? Get ready, questions will appear automatically!
          </p>

          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 animate-pulse">
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
            className="p-5 rounded-2xl border shadow-lg text-center backdrop-blur-md"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">
                Q {session.current_question_index + 1} / {session.total_questions}
              </span>
              <div
                className={`flex items-center gap-1 font-mono text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  timeLeft <= 5 ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse' : 'text-white border-white/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              {currentQuestion.question_text}
            </h3>
          </div>

          {/* If already answered, show waiting state */}
          {hasAnswered ? (
            <div
              className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border shadow-xl text-center backdrop-blur-md my-4 animate-pop"
              style={{
                backgroundColor: `${currentTheme.colors.surface}dd`,
                borderColor: currentTheme.colors.border,
              }}
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3 animate-bounce-gentle" />
              <h3 className="text-2xl font-black text-white">Answer Locked In!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                Fingers crossed! Results will be revealed when the timer ends.
              </p>
            </div>
          ) : (
            /* 4 Big Tap Buttons for Answers */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 my-2">
              {currentQuestion.answer_options.map((opt, idx) => {
                const btn = answerButtons[idx] || answerButtons[0];
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSubmitAnswer(opt.id)}
                    disabled={submitting || timeLeft <= 0}
                    className="p-6 rounded-2xl flex items-center justify-center sm:justify-start gap-4 text-white font-black text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: btn.color }}
                  >
                    <span className="text-3xl select-none drop-shadow">{btn.shape}</span>
                    <span className="text-base sm:text-lg leading-tight text-left">
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
          className={`flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border shadow-2xl my-auto animate-pop ${
            lastAnswerResult.is_correct
              ? 'bg-emerald-950/80 border-emerald-500'
              : 'bg-rose-950/80 border-rose-500'
          }`}
        >
          {lastAnswerResult.is_correct ? (
            <>
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-2 animate-bounce-gentle" />
              <h2 className="text-3xl sm:text-4xl font-black text-white">CORRECT!</h2>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-2">
                +{lastAnswerResult.points_awarded} pts
              </div>
              <p className="text-xs text-emerald-200 mt-1">Lightning fast answer bonus awarded!</p>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-rose-400 mb-2 animate-wiggle" />
              <h2 className="text-3xl sm:text-4xl font-black text-white">INCORRECT</h2>
              <div className="text-lg font-bold text-rose-300 mt-2">+0 pts</div>
              <p className="text-xs text-rose-200 mt-1">Keep your focus for the next round!</p>
            </>
          )}

          <div className="mt-8 pt-4 border-t border-white/10 w-full flex items-center justify-around">
            <div>
              <div className="text-xs text-slate-300 font-bold uppercase">Current Rank</div>
              <div className="text-xl font-black text-white">#{lastAnswerResult.rank}</div>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-bold uppercase">Total Score</div>
              <div className="text-xl font-black font-mono text-white">
                {lastAnswerResult.total_score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: LEADERBOARD VIEW */}
      {session.state === 'leaderboard' && (
        <div
          className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border shadow-2xl my-auto backdrop-blur-xl"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.border,
          }}
        >
          <Trophy className="w-14 h-14 text-amber-400 mb-2" />
          <h2 className="text-2xl sm:text-3xl font-black text-white">Look at the Big Screen!</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Leaderboard standings are rolling on the projector display.
          </p>

          <div className="mt-8 p-4 rounded-2xl border w-full max-w-xs bg-black/30"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <div className="text-xs font-bold text-slate-400 uppercase">Your Position</div>
            <div className="text-3xl font-black text-white mt-1">
              {me.score} pts
            </div>
          </div>
        </div>
      )}

      {/* STATE 5: FINISHED / PODIUM */}
      {session.state === 'finished' && (
        <div
          className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border shadow-2xl my-auto backdrop-blur-xl"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="mb-3 animate-celebrate">
            <Mascot themeId={session.theme_id} state="celebrating" size="lg" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white">Game Over!</h2>
          <p className="text-sm text-slate-300 mt-1">
            Great competition! Check the main podium for the champion honors.
          </p>

          <div className="mt-6 p-4 rounded-2xl border w-full max-w-xs bg-black/40"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <div className="text-xs font-bold text-slate-400 uppercase">Your Final Score</div>
            <div className="text-3xl font-black font-mono text-amber-300 mt-1">
              {me.score} pts
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-8 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            Back to Home
          </button>
        </div>
      )}
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
