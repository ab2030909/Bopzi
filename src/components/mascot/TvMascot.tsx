'use client';

import React from 'react';

interface TvMascotProps {
  variant?: 'party' | 'neon' | 'cosmic' | 'champion';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  winking?: boolean;
}

export function TvMascot({
  variant = 'party',
  size = 'md',
  className = '',
  winking = true,
}: TvMascotProps) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-64 h-64',
  };

  if (variant === 'neon') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
        {/* Neon Arcade TV Mascot */}
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(139,92,246,0.6)]">
          {/* Cyber Antennas / Crown */}
          <path d="M 75 42 L 88 18 L 100 32 L 112 18 L 125 42 Z" fill="#00F0FF" stroke="#070A13" strokeWidth="3" />
          {/* TV Outer Shell */}
          <rect x="35" y="38" width="130" height="105" rx="28" fill="#1E1242" stroke="#00F0FF" strokeWidth="4" />
          {/* Screen Inner Bevel */}
          <rect x="48" y="52" width="104" height="78" rx="20" fill="#0B0F19" stroke="#FF007A" strokeWidth="3" />
          {/* Neon Glow Eyes */}
          <circle cx="82" cy="85" r="9" fill="#00F0FF" />
          <path d="M 112 85 L 124 78 L 124 92 Z" fill="#FF007A" />
          {/* Smile */}
          <path d="M 92 105 Q 100 115 108 105" stroke="#00F0FF" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Legs */}
          <rect x="70" y="142" width="18" height="26" rx="9" fill="#1E1242" />
          <rect x="112" y="142" width="18" height="26" rx="9" fill="#1E1242" />
          <ellipse cx="78" cy="172" rx="15" ry="9" fill="#FF007A" />
          <ellipse cx="122" cy="172" rx="15" ry="9" fill="#00F0FF" />
        </svg>
      </div>
    );
  }

  if (variant === 'cosmic') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
        {/* Cosmic Quest Space TV Mascot */}
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_8px_25px_rgba(56,189,248,0.5)]">
          {/* Space Helmet Orbit Ring */}
          <ellipse cx="100" cy="90" rx="78" ry="74" fill="none" stroke="#38BDF8" strokeWidth="3" opacity="0.4" strokeDasharray="8 6" />
          {/* Space TV Head */}
          <rect x="42" y="42" width="116" height="96" rx="28" fill="#1E1B4B" stroke="#6366F1" strokeWidth="4" />
          {/* Glass Visor */}
          <rect x="54" y="54" width="92" height="72" rx="20" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
          {/* Cute Friendly Glowing Eyes */}
          <circle cx="80" cy="86" r="8" fill="#38BDF8" />
          <circle cx="120" cy="86" r="8" fill="#38BDF8" />
          <circle cx="82" cy="84" r="2.5" fill="#FFFFFF" />
          <circle cx="122" cy="84" r="2.5" fill="#FFFFFF" />
          <path d="M 94 102 Q 100 110 106 102" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Spacesuit Body */}
          <path d="M 72 138 L 128 138 L 136 175 L 64 175 Z" fill="#312E81" stroke="#818CF8" strokeWidth="3" />
          <circle cx="100" cy="156" r="6" fill="#EC4899" />
        </svg>
      </div>
    );
  }

  if (variant === 'champion') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
        {/* Champion Golden Trophy TV Mascot */}
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(245,158,11,0.5)]">
          {/* Big Golden Crown */}
          <path d="M 68 40 L 82 10 L 100 28 L 118 10 L 132 40 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          <circle cx="82" cy="10" r="4" fill="#FDE68A" />
          <circle cx="100" cy="28" r="4" fill="#FDE68A" />
          <circle cx="118" cy="10" r="4" fill="#FDE68A" />
          {/* TV Outer Shell */}
          <rect x="38" y="38" width="124" height="102" rx="28" fill="#6B21A8" stroke="#F59E0B" strokeWidth="4" />
          {/* Screen */}
          <rect x="52" y="52" width="96" height="74" rx="20" fill="#18181B" />
          {/* Cool Sunglasses / Eyes */}
          <rect x="66" y="74" width="28" height="18" rx="6" fill="#F59E0B" />
          <rect x="106" y="74" width="28" height="18" rx="6" fill="#F59E0B" />
          <line x1="94" y1="82" x2="106" y2="82" stroke="#F59E0B" strokeWidth="4" />
          <path d="M 92 106 Q 100 114 108 106" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Holding Golden Trophies Left & Right */}
          <path d="M 22 75 L 36 75 L 36 95 Q 29 105 22 95 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <path d="M 164 75 L 178 75 L 178 95 Q 171 105 164 95 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // DEFAULT: Party Pop Mascot (The Exact Character from Reference Screenshot!)
  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 220 220"
        className="w-full h-full filter drop-shadow-[0_12px_28px_rgba(124,58,237,0.45)]"
      >
        {/* Golden Crown */}
        <g transform="translate(0, -6)">
          <path
            d="M 80 44 L 92 16 L 110 32 L 128 16 L 140 44 Z"
            fill="url(#goldCrownGrad)"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Jewels on crown tips */}
          <circle cx="92" cy="16" r="4.5" fill="#FEF08A" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="110" cy="32" r="4" fill="#FEF08A" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="128" cy="16" r="4.5" fill="#FEF08A" stroke="#D97706" strokeWidth="1.5" />
        </g>

        {/* TV Outer Beveled Shell (Vibrant Purple/Violet with 3D gradient) */}
        <rect
          x="34"
          y="36"
          width="152"
          height="124"
          rx="34"
          fill="url(#purpleShellGrad)"
          stroke="#4C1D95"
          strokeWidth="4"
        />

        {/* Outer Shell Bevel Highlight */}
        <rect
          x="40"
          y="42"
          width="140"
          height="112"
          rx="28"
          fill="none"
          stroke="#C084FC"
          strokeWidth="3"
          opacity="0.6"
        />

        {/* Dark Screen */}
        <rect
          x="50"
          y="52"
          width="120"
          height="92"
          rx="24"
          fill="url(#screenGrad)"
          stroke="#2E1065"
          strokeWidth="3"
        />

        {/* Screen Glass Reflection Arc */}
        <path
          d="M 58 64 Q 100 56 150 72"
          stroke="#FFFFFF"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.15"
        />

        {/* EXPRESSIVE FACE */}
        {winking ? (
          <>
            {/* Left Eye: Big Joyful Bright Neon Green Oval Eye */}
            <ellipse cx="86" cy="94" rx="9" ry="14" fill="#22C55E" />
            <circle cx="89" cy="89" r="4" fill="#86EFAC" />

            {/* Right Eye: Cute Playful Wink (>) */}
            <path
              d="M 126 90 L 139 96 L 126 102"
              stroke="#22C55E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Cute Smile */}
            <path
              d="M 98 116 Q 112 128 126 116"
              stroke="#22C55E"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <ellipse cx="86" cy="94" rx="9" ry="14" fill="#22C55E" />
            <circle cx="89" cy="89" r="4" fill="#86EFAC" />
            <ellipse cx="134" cy="94" rx="9" ry="14" fill="#22C55E" />
            <circle cx="137" cy="89" r="4" fill="#86EFAC" />
            <path
              d="M 100 116 Q 110 126 120 116"
              stroke="#22C55E"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Cute Hands (White gloved pointer hands) */}
        {/* Right Pointing Hand */}
        <g transform="translate(176, 85)">
          <ellipse cx="14" cy="12" rx="14" ry="10" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="3" />
          <path
            d="M 16 8 L 32 4 L 30 14 L 16 14"
            fill="#FFFFFF"
            stroke="#4C1D95"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
        {/* Left Hand */}
        <ellipse cx="26" cy="95" rx="13" ry="11" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="3" />

        {/* Shoes / Feet */}
        <g transform="translate(0, 150)">
          <rect x="76" y="8" width="16" height="24" rx="8" fill="#7C3AED" stroke="#4C1D95" strokeWidth="3" />
          <rect x="128" y="8" width="16" height="24" rx="8" fill="#7C3AED" stroke="#4C1D95" strokeWidth="3" />

          {/* Left Sneaker (White & purple with laces) */}
          <ellipse cx="78" cy="36" rx="20" ry="12" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="3" />
          <path d="M 68 34 Q 78 30 88 34" stroke="#7C3AED" strokeWidth="2.5" fill="none" />

          {/* Right Sneaker */}
          <ellipse cx="142" cy="36" rx="20" ry="12" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="3" />
          <path d="M 132 34 Q 142 30 152 34" stroke="#7C3AED" strokeWidth="2.5" fill="none" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="purpleShellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#581C87" />
          </linearGradient>

          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
