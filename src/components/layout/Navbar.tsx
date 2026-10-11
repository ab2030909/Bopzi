'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../theme/ThemeProvider';
import { THEMES, ThemeId } from '@/types/theme';
import { Volume2, VolumeX, Sparkles, PlusCircle, Gamepad2, Layers } from 'lucide-react';
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
    <header className="border-b transition-colors duration-300 backdrop-blur-md sticky top-0 z-50"
      style={{
        borderColor: `${theme.colors.border}88`,
        backgroundColor: `${theme.colors.surface}cc`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg transition-transform group-hover:scale-105"
            style={{ backgroundColor: theme.colors.primary }}
          >
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight leading-none text-white flex items-center gap-1.5">
              ANTI KAHOOT
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wide text-white"
                style={{ backgroundColor: theme.colors.accent }}
              >
                100% Free
              </span>
            </span>
            <span className="text-xs font-medium" style={{ color: theme.colors.textMuted }}>
              Open Multiplayer Quiz Arena
            </span>
          </div>
        </Link>

        {/* Center / Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Quick Theme Switcher */}
          <div className="hidden md:flex items-center space-x-1 p-1 rounded-xl"
            style={{ backgroundColor: `${theme.colors.background}aa`, border: `1px solid ${theme.colors.border}` }}
          >
            {(Object.keys(THEMES) as ThemeId[]).map(tId => {
              const t = THEMES[tId];
              const isSelected = themeId === tId;
              return (
                <button
                  key={tId}
                  onClick={() => {
                    setThemeId(tId);
                    sounds.playCountdownTick();
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isSelected ? 'text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  style={isSelected ? { backgroundColor: t.colors.primary } : {}}
                  title={t.description}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl transition-all border hover:scale-105"
            style={{
              backgroundColor: `${theme.colors.background}88`,
              borderColor: theme.colors.border,
              color: isMuted ? '#94A3B8' : theme.colors.primary,
            }}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label="Toggle audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Join button */}
          <Link
            href="/join"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold border transition-all hover:scale-105"
            style={{
              backgroundColor: `${theme.colors.surfaceHover}`,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Enter PIN</span>
          </Link>

          {/* Create Quiz CTA */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Host & Quizzes</span>
            <span className="sm:hidden">Host</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
