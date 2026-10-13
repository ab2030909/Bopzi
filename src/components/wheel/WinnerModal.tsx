'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCw, UserMinus, X, Flame } from 'lucide-react';
import { Mascot } from '@/components/mascot/Mascot';
import { WheelItem } from './WheelCanvas';
import { sounds } from '@/lib/audio';
import { ThemeId, THEMES } from '@/types/theme';

interface WinnerModalProps {
  winner: WheelItem | null;
  roundNumber: number;
  totalRounds: number | 'unlimited';
  eliminationMode: boolean;
  themeId?: ThemeId;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinnerAndSpin: (winnerId: string) => void;
}

export function WinnerModal({
  winner,
  roundNumber,
  totalRounds,
  eliminationMode,
  themeId = 'party-pop',
  onClose,
  onSpinAgain,
  onRemoveWinnerAndSpin,
}: WinnerModalProps) {
  const currentTheme = THEMES[themeId] || THEMES['party-pop'];

  useEffect(() => {
    if (!winner) return;

    // Play triumphant sound
    sounds.playWheelWinner();

    // Theme-matched Confetti colors
    const themeConfettiColors: Record<ThemeId, string[]> = {
      'party-pop': ['#7C3AED', '#EC4899', '#38BDF8', '#F59E0B', '#10B981'],
      'neon-arcade': ['#00F0FF', '#FF007A', '#FFE600', '#00FF66', '#BD00FF'],
      'cosmic-quest': ['#6366F1', '#38BDF8', '#A855F7', '#EC4899', '#06B6D4'],
      'champion-mode': ['#F59E0B', '#10B981', '#FBBF24', '#059669', '#D97706'],
    };

    const colors = themeConfettiColors[themeId] || themeConfettiColors['party-pop'];

    // Multistage Confetti fireworks
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    // Immediate side cannons
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.1 },
      colors,
    });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.9 },
      colors,
    });

    // Ongoing bursts
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors,
      });
    }, 400);

    return () => clearInterval(interval);
  }, [winner, themeId]);

  if (!winner) return null;

  const isTournamentComplete =
    totalRounds !== 'unlimited' && roundNumber >= totalRounds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      {/* Outer Card with Theme Aura */}
      <div
        className={`relative rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-center p-6 sm:p-8 transform transition-all animate-pop border ${
          themeId === 'neon-arcade'
            ? 'bg-[#0F172A] border-[#00F0FF] shadow-[0_0_40px_rgba(0,240,255,0.35)]'
            : themeId === 'cosmic-quest'
            ? 'bg-[#0D1329] border-[#6366F1] shadow-[0_0_40px_rgba(99,102,241,0.35)]'
            : themeId === 'champion-mode'
            ? 'bg-[#0A2E22] border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
            : 'bg-white border-purple-200'
        }`}
      >
        {/* Glow background behind card */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: currentTheme.colors.primary }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
            themeId === 'neon-arcade' || themeId === 'cosmic-quest' || themeId === 'champion-mode'
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Theme Mascot Celebrating */}
        <div className="flex justify-center -mt-2 mb-3">
          <Mascot themeId={themeId} state="celebrating" size="md" />
        </div>

        {/* Mascot Tagline */}
        <p className="text-[11px] font-bold text-slate-400 mb-2">
          {currentTheme.mascot.name} says: &ldquo;{currentTheme.mascot.tagline}&rdquo;
        </p>

        {/* Trophy / Winner Tag */}
        <div
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm border"
          style={{
            backgroundColor: `${currentTheme.colors.primary}20`,
            borderColor: `${currentTheme.colors.primary}50`,
            color: themeId === 'party-pop' ? currentTheme.colors.primary : '#FFFFFF',
          }}
        >
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>
            {totalRounds === 'unlimited'
              ? `Winner of Spin #${roundNumber}`
              : `Round ${roundNumber} of ${totalRounds} Winner`}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>

        {/* Subtitle */}
        <h3 className={`text-sm font-semibold mb-1 ${
          themeId === 'party-pop' ? 'text-slate-500' : 'text-slate-300'
        }`}>
          The wheel has chosen our champion!
        </h3>

        {/* Giant Winner Name */}
        <div
          className={`my-4 py-4 px-6 rounded-2xl border shadow-inner ${
            themeId === 'neon-arcade'
              ? 'bg-[#070A13] border-[#00F0FF]/50'
              : themeId === 'cosmic-quest'
              ? 'bg-[#040714] border-[#38BDF8]/40'
              : themeId === 'champion-mode'
              ? 'bg-[#041E15] border-amber-500/50'
              : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-purple-100'
          }`}
        >
          <h1
            className="text-3xl sm:text-4xl font-black break-words"
            style={{
              color:
                themeId === 'neon-arcade'
                  ? '#00F0FF'
                  : themeId === 'cosmic-quest'
                  ? '#38BDF8'
                  : themeId === 'champion-mode'
                  ? '#FBBF24'
                  : currentTheme.colors.primary,
              textShadow:
                themeId === 'neon-arcade'
                  ? '0 0 16px rgba(0, 240, 255, 0.8)'
                  : themeId === 'cosmic-quest'
                  ? '0 0 16px rgba(56, 189, 248, 0.8)'
                  : themeId === 'champion-mode'
                  ? '0 0 16px rgba(251, 191, 36, 0.8)'
                  : 'none',
            }}
          >
            {winner.name}
          </h1>
        </div>

        {/* Tournament Completed Badge */}
        {isTournamentComplete && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>All {totalRounds} scheduled rounds completed!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {eliminationMode ? (
            <button
              onClick={() => onRemoveWinnerAndSpin(winner.id)}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2"
              style={{
                backgroundColor: currentTheme.colors.primary,
              }}
            >
              <UserMinus className="w-4 h-4" />
              <span>Remove Winner & Spin Next</span>
            </button>
          ) : (
            <button
              onClick={onSpinAgain}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2"
              style={{
                backgroundColor: currentTheme.colors.primary,
              }}
            >
              <RotateCw className="w-4 h-4" />
              <span>Spin Again</span>
            </button>
          )}

          <div className="flex space-x-2">
            {eliminationMode && (
              <button
                onClick={onSpinAgain}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                  themeId === 'party-pop'
                    ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    : 'text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Keep on Wheel & Spin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                themeId === 'party-pop'
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
