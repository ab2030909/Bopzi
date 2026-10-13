'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { sounds } from '@/lib/audio';
import { Mascot } from '@/components/mascot/Mascot';
import { Gamepad2, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'blip', label: 'Blip', theme: 'party-pop' },
  { id: 'pixel-bot', label: 'Pixel-Bot', theme: 'neon-arcade' },
  { id: 'astro-sprout', label: 'Astro-Sprout', theme: 'cosmic-quest' },
  { id: 'aegis', label: 'Aegis', theme: 'champion-mode' },
] as const;

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('blip');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pinParam = searchParams.get('pin');
    if (pinParam) {
      setPin(pinParam.replace(/\D/g, '').slice(0, 6));
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPin = pin.trim();
    const cleanNick = nickname.trim().slice(0, 20);

    if (!cleanPin || cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit Game PIN.');
      sounds.playIncorrect();
      return;
    }

    if (!cleanNick) {
      setError('Please choose a nickname to join.');
      sounds.playIncorrect();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/game/${cleanPin}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          nickname: cleanNick,
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to join game room.');
        sounds.playIncorrect();
        setLoading(false);
        return;
      }

      // Store participant info in session storage
      sessionStorage.setItem(`ak_participant_${cleanPin}`, JSON.stringify(data.participant));
      sounds.playPlayerJoined();
      router.push(`/play/${cleanPin}`);
    } catch (err: any) {
      setError('Network connection error. Please try again.');
      sounds.playIncorrect();
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-32 sm:pt-36 md:pt-40 pb-8 px-4 sm:px-6 overflow-x-hidden">
      {/* Immersive World Selection Arena Background Image */}
      <img
        src="/images/world_selection_bg.png"
        alt="Bopzi Arena Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Main Join Game Card - Positioned lower, Ultra-Transparent with High-Voltage Shiny Neon */}
      <div
        className="w-full max-w-sm sm:max-w-[375px] p-5 sm:p-6 rounded-[28px] border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.45)] relative backdrop-blur-md bg-black/25 text-white z-10 animate-fadeIn"
      >
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] [-webkit-text-stroke:0.5px_#06b6d4]">
            JOIN LIVE GAME
          </h1>
          <p className="text-[10px] sm:text-[11px] text-cyan-200 font-semibold mt-0.5 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
            Enter PIN & nickname to jump in!
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-xl bg-red-950/85 border border-red-500 text-red-200 text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-2.5">
          {/* Closely Stacked Inputs (No external labels, inside placeholders) */}
          <div className="space-y-1.5">
            {/* Game PIN Input */}
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Game PIN (6 digits)"
                className="w-full px-3.5 py-2.5 rounded-xl font-mono text-center text-xl font-black tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-bold placeholder:text-cyan-300/70 bg-black/60 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.5),inset_0_0_12px_rgba(6,182,212,0.2)] focus:border-pink-500 focus:text-white focus:shadow-[0_0_25px_rgba(236,72,153,0.7),inset_0_0_15px_rgba(236,72,153,0.3)] focus:outline-none transition-all drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                required
              />
              <Gamepad2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] pointer-events-none" />
            </div>

            {/* Nickname Input */}
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your Nickname"
                className="w-full px-3.5 py-2 rounded-xl text-center font-black text-sm placeholder:font-bold placeholder:text-xs placeholder:text-pink-300/70 bg-black/60 border-2 border-pink-400 text-pink-100 shadow-[0_0_18px_rgba(236,72,153,0.45),inset_0_0_12px_rgba(236,72,153,0.2)] focus:border-cyan-400 focus:text-white focus:shadow-[0_0_25px_rgba(6,182,212,0.7),inset_0_0_15px_rgba(6,182,212,0.3)] focus:outline-none transition-all drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]"
                required
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.9)] pointer-events-none" />
            </div>
          </div>

          {/* Avatar / Mascot Selection - Compact Grid */}
          <div>
            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = avatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setAvatar(av.id);
                      sounds.playCountdownTick();
                    }}
                    className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-cyan-300 bg-cyan-950/70 shadow-[0_0_20px_rgba(6,182,212,0.8),inset_0_0_10px_rgba(6,182,212,0.4)] scale-105 ring-2 ring-cyan-400'
                        : 'border-purple-500/40 bg-black/50 hover:bg-black/70 hover:border-cyan-400/80 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="w-8 h-8 mb-0.5 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                      <Mascot themeId={av.theme as any} state={isSelected ? 'celebrating' : 'idle'} size="sm" />
                    </div>
                    <span className="text-[9px] font-black text-cyan-200 truncate w-full text-center drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Join Button - Full Shiny Neon Cyber Pulse */}
          <button
            type="submit"
            disabled={loading || pin.length !== 6 || !nickname.trim()}
            className="w-full py-3.5 rounded-xl font-black text-base text-white shadow-[0_0_30px_rgba(236,72,153,0.7),0_0_15px_rgba(6,182,212,0.7)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.9)] border-2 border-white/60 tracking-wider"
          >
            {loading ? (
              <span className="animate-pulse">Entering Arena...</span>
            ) : (
              <>
                <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">JOIN GAME</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">Loading...</div>}>
      <JoinContent />
    </Suspense>
  );
}
