'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, THEMES, ThemeConfig } from '@/types/theme';

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setThemeId: (id: ThemeId) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = 'party-pop',
}: {
  children: React.ReactNode;
  initialTheme?: ThemeId;
}) {
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme);
  const [isMuted, setIsMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const theme = THEMES[themeId] || THEMES['party-pop'];

  useEffect(() => {
    // Apply background and color CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.colors.background);
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-text', theme.colors.text);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        isMuted,
        setIsMuted,
        reducedMotion,
        setReducedMotion,
      }}
    >
      <div
        className="min-h-screen transition-colors duration-500 relative flex flex-col"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        {/* Dynamic Theme Background Patterns */}
        {theme.starsOrGrid === 'grid' && (
          <div
            className="fixed inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `linear-gradient(${theme.colors.primary}33 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.primary}33 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}
        {theme.starsOrGrid === 'stars' && (
          <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        )}
        {theme.starsOrGrid === 'confetti' && (
          <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#f43f5e_2px,transparent_2px),radial-gradient(#facc15_2px,transparent_2px)] [background-size:48px_48px] [background-position:0_0,24px_24px]" />
        )}
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeId: 'party-pop' as ThemeId,
      theme: THEMES['party-pop'],
      setThemeId: () => {},
      isMuted: false,
      setIsMuted: () => {},
      reducedMotion: false,
      setReducedMotion: () => {},
    };
  }
  return ctx;
}
