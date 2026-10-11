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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
      <div
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative backdrop-blur-xl"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.border,
        }}
      >
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl text-white shadow-lg mb-3"
            style={{ backgroundColor: theme.colors.primary }}
          >
            ⚡
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Join Live Game</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Enter your PIN and nickname to jump straight into the arena!
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          {/* Game PIN Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
                className="w-full px-4 py-3.5 rounded-2xl font-mono text-center text-2xl font-black tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:font-medium bg-black/40 border-2 focus:outline-none transition-all text-white"
                style={{
                  borderColor: pin.length === 6 ? theme.colors.primary : `${theme.colors.border}bb`,
                }}
                required
              />
              <Gamepad2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Your Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. QuizMaster99"
                className="w-full px-4 py-3.5 rounded-2xl font-bold text-lg placeholder:font-normal placeholder:text-sm bg-black/40 border-2 focus:outline-none transition-all text-white"
                style={{
                  borderColor: nickname.trim().length > 0 ? theme.colors.primary : `${theme.colors.border}bb`,
                }}
                required
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Avatar / Mascot Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
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
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      isSelected ? 'ring-2 scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${theme.colors.primary}33` : 'rgba(0,0,0,0.3)',
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    <div className="w-10 h-10 mb-1 flex items-center justify-center">
                      <Mascot themeId={av.theme as any} state={isSelected ? 'celebrating' : 'idle'} size="sm" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full text-center">
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
            className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-4"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {loading ? (
              <span className="animate-pulse">Entering Arena...</span>
            ) : (
              <>
                <span>JOIN GAME</span>
                <ArrowRight className="w-5 h-5" />
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
