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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-end pt-28 pb-8 sm:pb-12 px-4 sm:px-6 overflow-x-hidden">
      {/* Immersive World Selection Arena Background Image */}
      <img
        src="/images/world_selection_bg.png"
        alt="Bopzi Arena Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Main Join Game Card - Positioned lower, Black Neon Glassmorphism */}
      <div
        className="w-full max-w-sm sm:max-w-[375px] p-5 sm:p-6 rounded-[28px] border border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)] relative backdrop-blur-2xl bg-black/80 text-white z-10 animate-fadeIn"
      >
        <div className="text-center mb-4">
          <div
            className="w-11 h-11 rounded-2xl mx-auto flex items-center justify-center font-black text-xl text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] mb-2.5 bg-gradient-to-tr from-cyan-500 to-purple-600 border border-cyan-300/40"
          >
            ⚡
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            Join Live Game
          </h1>
          <p className="text-[11px] sm:text-xs text-cyan-200/80 font-medium mt-0.5">
            Enter PIN & nickname to jump into the arena!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-300 text-xs flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-3.5">
          {/* Game PIN Input */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-cyan-300/90 mb-1">
              Game PIN
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN"
                className="w-full px-3.5 py-2.5 rounded-xl font-mono text-center text-xl font-black tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-medium bg-slate-950/90 border-2 border-cyan-500/50 focus:border-cyan-400 focus:bg-black focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] focus:outline-none transition-all text-white"
                required
              />
              <Gamepad2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-cyan-300/90 mb-1">
              Your Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. QuizMaster99"
                className="w-full px-3.5 py-2.5 rounded-xl font-bold text-sm placeholder:font-normal placeholder:text-xs bg-slate-950/90 border-2 border-cyan-500/50 focus:border-cyan-400 focus:bg-black focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] focus:outline-none transition-all text-white"
                required
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
            </div>
          </div>

          {/* Avatar / Mascot Selection */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-cyan-300/90 mb-1.5">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-1.5">
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
                        ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105 ring-1 ring-cyan-300'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/80 opacity-70 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 mb-0.5 flex items-center justify-center">
                      <Mascot themeId={av.theme as any} state={isSelected ? 'celebrating' : 'idle'} size="sm" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            disabled={loading || pin.length !== 6 || !nickname.trim()}
            className="w-full py-3 rounded-xl font-black text-sm text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 mt-2 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 border border-cyan-300/50"
          >
            {loading ? (
              <span className="animate-pulse">Entering Arena...</span>
            ) : (
              <>
                <span>JOIN GAME</span>
                <ArrowRight className="w-4 h-4" />
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
