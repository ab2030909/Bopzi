'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, X, Award, Flame, Users, ArrowRight } from 'lucide-react';
import { ScoreTeam } from '@/types/guess';
import { sounds } from '@/lib/audio';
import { ThemeId, THEMES } from '@/types/theme';

interface GameFinishedModalProps {
  isOpen: boolean;
  totalQuestions: number;
  teams: ScoreTeam[];
  themeId?: ThemeId;
  onClose: () => void;
  onPlayAgain: () => void;
  onEditGame: () => void;
}

export function GameFinishedModal({
  isOpen,
  totalQuestions,
  teams,
  themeId = 'party-pop',
  onClose,
  onPlayAgain,
  onEditGame,
}: GameFinishedModalProps) {
  if (!isOpen) return null;

  // Rank teams by score descending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const highestScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;
  // Check for ties at the top
  const winningTeams = sortedTeams.filter((t) => t.score === highestScore && t.score > 0);
  const isTie = winningTeams.length > 1;
  const noScores = highestScore === 0;

  useEffect(() => {
    // Triumphant celebration sound
    sounds.playWheelWinner();

    const themeConfettiColors: Record<ThemeId, string[]> = {
      'party-pop': ['#7C3AED', '#EC4899', '#38BDF8', '#F59E0B', '#10B981'],
      'neon-arcade': ['#00F0FF', '#FF007A', '#FFE600', '#00FF66', '#BD00FF'],
      'cosmic-quest': ['#6366F1', '#38BDF8', '#A855F7', '#EC4899', '#06B6D4'],
      'champion-mode': ['#F59E0B', '#10B981', '#FBBF24', '#059669', '#D97706'],
    };

    const colors = themeConfettiColors[themeId] || themeConfettiColors['party-pop'];

    // Multistage Confetti fireworks
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6, x: 0.15 },
      colors,
    });
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6, x: 0.85 },
      colors,
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [themeId]);

  const isNeon = themeId === 'neon-arcade';
  const isCosmic = themeId === 'cosmic-quest';
  const isChampion = themeId === 'champion-mode';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden flex flex-col items-center text-center transition-all ${
          isNeon
            ? 'bg-slate-950/95 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-white'
            : isCosmic
            ? 'bg-[#060D1E]/95 border-amber-500/50 shadow-[0_0_50px_rgba(251,191,36,0.3)] text-white'
            : isChampion
            ? 'bg-amber-50/95 border-amber-400/70 shadow-2xl text-slate-900'
            : 'bg-white/95 border-purple-300 shadow-2xl text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Trophy & Fireworks Badge */}
        <div className="relative mb-4 mt-2">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl animate-bounce-gentle ${
              isNeon
                ? 'bg-gradient-to-tr from-pink-500 to-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)]'
                : isCosmic
                ? 'bg-gradient-to-tr from-amber-400 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.8)]'
                : 'bg-gradient-to-tr from-amber-400 to-yellow-500 shadow-amber-300/50'
            }`}
          >
            <Trophy className="w-14 h-14 text-slate-950 drop-shadow-md" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-white text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Game Finished Subtitle */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 ${
            isNeon
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : isCosmic
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}
        >
          🎉 Game Completed! All {totalQuestions} Questions Revealed
        </span>

        {/* Champion Name Announcement */}
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
          {noScores ? (
            <span>Great Game Everyone!</span>
          ) : isTie ? (
            <span>It&apos;s a Tie! 🤝</span>
          ) : (
            <>
              🏆 Winner:{' '}
              <span
                style={{ color: winningTeams[0].color }}
                className="underline decoration-wavy decoration-amber-400 drop-shadow-md"
              >
                {winningTeams[0].name}
              </span>
            </>
          )}
        </h2>

        {/* Score statement */}
        <p className="text-sm opacity-80 mb-6 font-medium">
          {noScores
            ? 'All logos and pictures were guessed! Fantastic teamwork!'
            : isTie
            ? `Tied with an incredible ${highestScore} points each!`
            : `Secured 1st Place with ${highestScore} points!`}
        </p>

        {/* Leaderboard Podiums / Team Standings */}
        {sortedTeams.length > 0 && (
          <div className="w-full bg-black/10 dark:bg-white/5 rounded-2xl p-4 border border-black/10 dark:border-white/10 mb-6">
            <div className="flex items-center justify-between text-xs font-black opacity-70 uppercase tracking-wider mb-2.5 px-2">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Team Standings
              </span>
              <span>Final Points</span>
            </div>

            <div className="space-y-2">
              {sortedTeams.map((team, idx) => {
                const isFirst = team.score === highestScore && highestScore > 0;
                return (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      isFirst
                        ? 'bg-amber-500/15 border-amber-400 font-black shadow-xs ring-1 ring-amber-400/50'
                        : 'bg-black/5 dark:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-sm font-black opacity-80">
                        {idx === 0 && highestScore > 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-sm font-bold">{team.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base font-black px-2 py-0.5 rounded-lg bg-black/10 dark:bg-white/10">
                        {team.score} pts
                      </span>
                      {isFirst && (
                        <span className="text-xs font-black text-amber-500 px-1.5 py-0.5 rounded-md bg-amber-500/10 uppercase">
                          Winner
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className={`flex-1 w-full py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition transform hover:scale-[1.02] shadow-xl ${
              isNeon
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                : isCosmic
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/30'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again (Reset Reveals)</span>
          </button>

          <button
            onClick={onEditGame}
            className="flex-1 w-full py-3.5 px-5 rounded-2xl font-black text-sm bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 transition flex items-center justify-center gap-2"
          >
            <span>Back to Creator Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
