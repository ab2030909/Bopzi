import { ThemeId } from '@/types/theme';

export interface ThemeStyles {
  // Main background styling and text
  pageBg: string;
  textPrimary: string;
  textSecondary: string;

  // Glass panel boxes
  panelBg: string;
  panelBorder: string;
  panelShadow: string;

  // Primary buttons and accent pills
  accentGrad: string;
  accentSolid: string;
  accentText: string;
  accentShadow: string;
  accentBorder: string;

  // Active / selected card state
  activeCardBg: string;
  activeCardBorder: string;
  activeCardRing: string;
  activeCardShadow: string;

  // Subtle interactive buttons (quick packs, secondary btns)
  btnSecondary: string;
  btnSecondaryText: string;
  btnSecondaryBorder: string;

  // Logo / Mystery arena elements
  logoBorder: string;
  tileBg: string;
  tileText: string;
  tileBorder: string;
  tileHover: string;

  // Reveal Button
  revealBtnBg: string;
  revealBtnText: string;
  revealBtnShadow: string;

  // Scoreboard badge
  scoreBadgeBg: string;
  scoreBadgeText: string;
}

export const GUESS_THEME_STYLES: Record<ThemeId, ThemeStyles> = {
  'neon-arcade': {
    pageBg: 'bg-[#030712] text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-cyan-300/70',

    panelBg: 'bg-black/40 backdrop-blur-xl',
    panelBorder: 'border-cyan-500/40',
    panelShadow: 'shadow-[0_0_35px_rgba(6,182,212,0.25)]',

    accentGrad: 'bg-gradient-to-r from-pink-500 to-cyan-400',
    accentSolid: 'bg-cyan-500',
    accentText: 'text-slate-950 font-black',
    accentShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.7)]',
    accentBorder: 'border-cyan-400',

    activeCardBg: 'bg-cyan-500/20',
    activeCardBorder: 'border-cyan-400',
    activeCardRing: 'ring-1 ring-cyan-400',
    activeCardShadow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]',

    btnSecondary: 'bg-cyan-950/60 hover:bg-cyan-900/80',
    btnSecondaryText: 'text-cyan-300',
    btnSecondaryBorder: 'border-cyan-500/40',

    logoBorder: 'border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    tileBg: 'bg-slate-900/90',
    tileText: 'text-cyan-300 font-black',
    tileBorder: 'border-cyan-500/50',
    tileHover: 'hover:bg-cyan-500/30',

    revealBtnBg: 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-400',
    revealBtnText: 'text-white font-black',
    revealBtnShadow: 'shadow-[0_0_30px_rgba(6,182,212,0.6)]',

    scoreBadgeBg: 'bg-cyan-500/20',
    scoreBadgeText: 'text-cyan-300 border border-cyan-500/40',
  },

  'cosmic-quest': {
    pageBg: 'bg-[#050C1A] text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-amber-200/70',

    panelBg: 'bg-[#071329]/45 backdrop-blur-xl',
    panelBorder: 'border-blue-500/40',
    panelShadow: 'shadow-[0_0_35px_rgba(59,130,246,0.25)]',

    accentGrad: 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500',
    accentSolid: 'bg-amber-400',
    accentText: 'text-slate-950 font-black',
    accentShadow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]',
    accentBorder: 'border-amber-400',

    activeCardBg: 'bg-amber-500/20',
    activeCardBorder: 'border-amber-400',
    activeCardRing: 'ring-1 ring-amber-400',
    activeCardShadow: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]',

    btnSecondary: 'bg-[#0E2040]/70 hover:bg-[#142C58]',
    btnSecondaryText: 'text-amber-300',
    btnSecondaryBorder: 'border-amber-500/40',

    logoBorder: 'border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.3)]',
    tileBg: 'bg-[#0B172E]/95',
    tileText: 'text-amber-300 font-black',
    tileBorder: 'border-amber-500/50',
    tileHover: 'hover:bg-amber-500/25',

    revealBtnBg: 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600',
    revealBtnText: 'text-slate-950 font-black',
    revealBtnShadow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',

    scoreBadgeBg: 'bg-amber-500/20',
    scoreBadgeText: 'text-amber-300 border border-amber-500/40',
  },

  'champion-mode': {
    pageBg: 'bg-[#FDFBF7] text-[#0F172A]',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-amber-900/70',

    panelBg: 'bg-amber-50/50 backdrop-blur-xl',
    panelBorder: 'border-amber-300/60',
    panelShadow: 'shadow-xl shadow-amber-900/5',

    accentGrad: 'bg-gradient-to-r from-amber-500 to-yellow-600',
    accentSolid: 'bg-amber-500',
    accentText: 'text-white font-black',
    accentShadow: 'shadow-md shadow-amber-500/40',
    accentBorder: 'border-amber-400',

    activeCardBg: 'bg-amber-100',
    activeCardBorder: 'border-amber-500',
    activeCardRing: 'ring-1 ring-amber-500',
    activeCardShadow: 'shadow-md shadow-amber-500/20',

    btnSecondary: 'bg-white/80 hover:bg-white',
    btnSecondaryText: 'text-amber-950',
    btnSecondaryBorder: 'border-amber-300',

    logoBorder: 'border-amber-400 shadow-xl',
    tileBg: 'bg-amber-600/95',
    tileText: 'text-amber-100 font-black',
    tileBorder: 'border-amber-300',
    tileHover: 'hover:bg-amber-700',

    revealBtnBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700',
    revealBtnText: 'text-white font-black',
    revealBtnShadow: 'shadow-xl shadow-amber-500/30',

    scoreBadgeBg: 'bg-amber-100',
    scoreBadgeText: 'text-amber-900 border border-amber-300',
  },

  'party-pop': {
    pageBg: 'bg-[#FCFBFF] text-slate-800',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-purple-900/60',

    panelBg: 'bg-white/45 backdrop-blur-xl',
    panelBorder: 'border-purple-200/70',
    panelShadow: 'shadow-xl shadow-purple-900/5',

    accentGrad: 'bg-gradient-to-r from-[#7C3AED] via-purple-600 to-pink-500',
    accentSolid: 'bg-[#7C3AED]',
    accentText: 'text-white font-black',
    accentShadow: 'shadow-md shadow-purple-500/30',
    accentBorder: 'border-purple-300',

    activeCardBg: 'bg-purple-100/90',
    activeCardBorder: 'border-[#7C3AED]',
    activeCardRing: 'ring-1 ring-[#7C3AED]',
    activeCardShadow: 'shadow-md shadow-purple-500/20',

    btnSecondary: 'bg-white/80 hover:bg-white',
    btnSecondaryText: 'text-slate-700',
    btnSecondaryBorder: 'border-slate-200',

    logoBorder: 'border-purple-200/80 shadow-xl',
    tileBg: 'bg-purple-600/90',
    tileText: 'text-white font-black',
    tileBorder: 'border-purple-300',
    tileHover: 'hover:bg-purple-700',

    revealBtnBg: 'bg-gradient-to-r from-[#7C3AED] via-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
    revealBtnText: 'text-white font-black',
    revealBtnShadow: 'shadow-xl shadow-purple-500/30',

    scoreBadgeBg: 'bg-purple-100',
    scoreBadgeText: 'text-purple-900 border border-purple-200',
  },
};
