'use client';

import React from 'react';
import { ThemeId } from '@/types/theme';

export type MascotState = 'idle' | 'excited' | 'thinking' | 'celebrating' | 'surprised';

interface MascotProps {
  themeId?: ThemeId;
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Mascot({
  themeId = 'party-pop',
  state = 'idle',
  size = 'md',
  className = '',
}: MascotProps) {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  // State-based animation classes
  const animMap = {
    idle: 'animate-bounce-gentle',
    excited: 'animate-wiggle',
    thinking: 'animate-pulse',
    celebrating: 'animate-celebrate',
    surprised: 'animate-pop',
  };

  if (themeId === 'neon-arcade') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${animMap[state]} ${className}`}>
        {/* Pixel-Bot: Cyber Droid */}
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
          <rect x="25" y="25" width="50" height="45" rx="8" fill="#0F172A" stroke="#00F0FF" strokeWidth="4" />
          {/* Antenna */}
          <line x1="50" y1="25" x2="50" y2="10" stroke="#00F0FF" strokeWidth="4" />
          <circle cx="50" cy="8" r="5" fill="#FF007A" />
          {/* Cyber Visor */}
          <rect x="32" y="38" width="36" height="14" rx="4" fill="#000" stroke="#00F0FF" strokeWidth="2" />
          {state === 'celebrating' || state === 'excited' ? (
            <path d="M 36 45 Q 40 40 44 45 M 56 45 Q 60 40 64 45" stroke="#FF007A" strokeWidth="3" fill="none" />
          ) : state === 'surprised' ? (
            <circle cx="50" cy="45" r="4" fill="#FF007A" />
          ) : (
            <line x1="36" y1="45" x2="64" y2="45" stroke="#00F0FF" strokeWidth="3" />
          )}
          {/* Ear Bolts */}
          <rect x="18" y="38" width="7" height="16" rx="2" fill="#00F0FF" />
          <rect x="75" y="38" width="7" height="16" rx="2" fill="#00F0FF" />
          {/* Body */}
          <rect x="35" y="73" width="30" height="18" rx="4" fill="#0F172A" stroke="#FF007A" strokeWidth="3" />
          {/* Core Indicator */}
          <circle cx="50" cy="82" r="3" fill="#00F0FF" className="animate-ping" />
        </svg>
      </div>
    );
  }

  if (themeId === 'cosmic-quest') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${animMap[state]} ${className}`}>
        {/* Astro-Sprout: Space Voyager */}
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]">
          {/* Star Orbit */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 6" />
          {/* Space Helmet */}
          <circle cx="50" cy="46" r="30" fill="#1E1B4B" stroke="#6366F1" strokeWidth="4" />
          {/* Visor Reflection */}
          <ellipse cx="50" cy="46" rx="22" ry="18" fill="#0F172A" />
          {/* Sprout Antenna */}
          <path d="M 50 16 Q 54 8 62 10 Q 56 18 50 16" fill="#38BDF8" />
          {/* Expressive Eyes inside visor */}
          {state === 'celebrating' || state === 'excited' ? (
            <>
              <path d="M 40 44 Q 44 38 48 44" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 52 44 Q 56 38 60 44" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          ) : state === 'surprised' ? (
            <>
              <circle cx="43" cy="44" r="5" fill="#38BDF8" />
              <circle cx="57" cy="44" r="5" fill="#38BDF8" />
            </>
          ) : (
            <>
              <ellipse cx="43" cy="45" rx="3.5" ry="5" fill="#38BDF8" />
              <ellipse cx="57" cy="45" rx="3.5" ry="5" fill="#38BDF8" />
              <circle cx="44" cy="43" r="1.5" fill="#FFFFFF" />
              <circle cx="58" cy="43" r="1.5" fill="#FFFFFF" />
            </>
          )}
          {/* Spacesuit collar */}
          <rect x="36" y="72" width="28" height="16" rx="6" fill="#4338CA" stroke="#818CF8" strokeWidth="2.5" />
          <circle cx="50" cy="80" r="3" fill="#EC4899" />
        </svg>
      </div>
    );
  }

  if (themeId === 'champion-mode') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${animMap[state]} ${className}`}>
        {/* Aegis: Tournament Heraldic Crest */}
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
          {/* Laurel Crown */}
          <path d="M 22 45 Q 16 30 30 20 M 78 45 Q 84 30 70 20" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Shield Body */}
          <path d="M 50 15 L 75 25 L 72 65 Q 50 88 50 88 Q 50 88 28 65 L 25 25 Z" fill="#064E3B" stroke="#F59E0B" strokeWidth="4" />
          {/* Golden Crown */}
          <path d="M 38 40 L 44 32 L 50 38 L 56 32 L 62 40 Z" fill="#F59E0B" />
          {/* Lion / Mascot Face */}
          {state === 'celebrating' || state === 'excited' ? (
            <circle cx="50" cy="56" r="12" fill="#D97706" />
          ) : (
            <circle cx="50" cy="56" r="10" fill="#047857" stroke="#F59E0B" strokeWidth="2" />
          )}
          <circle cx="46" cy="54" r="2.5" fill="#FDFBF7" />
          <circle cx="54" cy="54" r="2.5" fill="#FDFBF7" />
          <path d="M 46 60 Q 50 64 54 60" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Default: Party Pop: Blip
  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${animMap[state]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(124,58,237,0.5)]">
        {/* Bouncy cute orb body */}
        <ellipse cx="50" cy="52" rx="36" ry="34" fill="#8B5CF6" />
        <ellipse cx="50" cy="50" rx="34" ry="32" fill="#A855F7" />
        {/* Cheek Blushes */}
        <circle cx="28" cy="58" r="5" fill="#F43F5E" opacity="0.6" />
        <circle cx="72" cy="58" r="5" fill="#F43F5E" opacity="0.6" />
        {/* Big expressive cyclops-or-twin eyes */}
        {state === 'celebrating' || state === 'excited' ? (
          <>
            <path d="M 33 46 Q 39 36 45 46" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 55 46 Q 61 36 67 46" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 42 60 Q 50 72 58 60" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
          </>
        ) : state === 'surprised' ? (
          <>
            <circle cx="39" cy="44" r="8" fill="#FFFFFF" />
            <circle cx="61" cy="44" r="8" fill="#FFFFFF" />
            <circle cx="39" cy="44" r="4" fill="#0F0926" />
            <circle cx="61" cy="44" r="4" fill="#0F0926" />
            <ellipse cx="50" cy="62" rx="6" ry="8" fill="#0F0926" />
          </>
        ) : state === 'thinking' ? (
          <>
            <circle cx="39" cy="44" r="7" fill="#FFFFFF" />
            <circle cx="61" cy="44" r="7" fill="#FFFFFF" />
            <circle cx="41" cy="41" r="3.5" fill="#0F0926" />
            <circle cx="63" cy="41" r="3.5" fill="#0F0926" />
            <ellipse cx="50" cy="60" rx="4" ry="2" fill="#0F0926" />
          </>
        ) : (
          <>
            <circle cx="39" cy="46" r="7" fill="#FFFFFF" />
            <circle cx="61" cy="46" r="7" fill="#FFFFFF" />
            <circle cx="40" cy="46" r="4" fill="#0F0926" />
            <circle cx="62" cy="46" r="4" fill="#0F0926" />
            <circle cx="42" cy="44" r="1.5" fill="#FFFFFF" />
            <circle cx="64" cy="44" r="1.5" fill="#FFFFFF" />
            <path d="M 44 58 Q 50 64 56 58" stroke="#0F0926" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* Playful head sprout / confetti crown */}
        <path d="M 50 18 Q 44 8 38 12 M 50 18 Q 56 6 62 10 M 50 18 L 50 8" stroke="#FACC15" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
