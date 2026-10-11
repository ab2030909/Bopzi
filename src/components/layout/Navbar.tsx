'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../theme/ThemeProvider';
import { THEMES, ThemeId } from '@/types/theme';
import { Volume2, VolumeX, PlusCircle, Gamepad2, Sparkles, Zap } from 'lucide-react';
import { sounds } from '@/lib/audio';

export function Navbar() {
  const { theme, themeId, setThemeId, isMuted, setIsMuted } = useTheme();

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
    if (!nextMuted) {
      sounds.playPlayerJoined();
    }
  };

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300">
      {/* Gen-Z Graffiti Street Marquee Ticker */}
      <div className="bg-[#121212] text-white overflow-hidden py-1.5 border-b-2 border-black font-mono text-[11px] font-black uppercase tracking-wider select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="text-[#10B981]">★</span> 100% FREE FOREVER
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#FF007F]">★</span> NO SUBSCRIPTIONS OR PAYWALLS
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#A855F7]">★</span> 100+ CONCURRENT PLAYERS
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#FACC15]">★</span> INSTANT QR SCAN & 6-DIGIT PIN
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#10B981]">★</span> SERVER-AUTHORITATIVE ANTI-CHEAT
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#FF007F]">★</span> ORIGINAL MASCOTS & SYNTH AUDIO
          </span>
          <span className="text-slate-500">•</span>
          {/* Repeat for seamless loop */}
          <span className="flex items-center gap-2">
            <span className="text-[#10B981]">★</span> 100% FREE FOREVER
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#FF007F]">★</span> NO SUBSCRIPTIONS OR PAYWALLS
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#A855F7]">★</span> 100+ CONCURRENT PLAYERS
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#FACC15]">★</span> INSTANT QR SCAN & 6-DIGIT PIN
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className="backdrop-blur-md border-b-2 border-black"
        style={{
          backgroundColor: themeId === 'party-pop' ? 'rgba(250, 250, 247, 0.95)' : `${theme.colors.surface}f2`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#121212] border-2 border-black flex items-center justify-center font-black text-xl text-[#FACC15] shadow-brutal-sm group-hover:-translate-y-0.5 group-hover:shadow-brutal transition-all">
              ⚡
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight leading-none text-[#121212]">
                  ANTI KAHOOT
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black bg-[#10B981] text-black shadow-brutal-sm">
                  FREE
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Gen-Z Street Quiz Arena
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Theme Switcher */}
            <div className="hidden lg:flex items-center space-x-1 p-1 bg-white rounded-xl border-2 border-black shadow-brutal-sm">
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const t = THEMES[tId];
                const isSelected = themeId === tId;
                return (
                  <button
                    key={tId}
                    onClick={() => {
                      setThemeId(tId);
                      sounds.playCountdownTick();
                    }}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                      isSelected
                        ? 'bg-[#121212] text-white shadow-sm'
                        : 'text-slate-600 hover:text-black hover:bg-slate-100'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>

            {/* Sound Mute Toggle */}
            <button
              onClick={toggleSound}
              className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-slate-50 shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#121212]"
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              aria-label="Toggle audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#7C3AED]" />}
            </button>

            {/* Enter PIN Button */}
            <Link
              href="/join"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border-2 border-black bg-white hover:bg-[#FACC15] shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#121212]"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>JOIN PIN</span>
            </Link>

            {/* Host Quiz CTA */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black border-2 border-black bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">HOST ARENA</span>
              <span className="sm:hidden">HOST</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
