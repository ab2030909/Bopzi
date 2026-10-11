export type ThemeId = 'party-pop' | 'neon-arcade' | 'cosmic-quest' | 'champion-mode';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textMuted: string;
  cardBg: string;
  // Kahoot-inspired 4 distinct answer colors, tuned for each theme
  answerRed: string;
  answerBlue: string;
  answerYellow: string;
  answerGreen: string;
}

export interface ThemeMascot {
  name: string;
  role: string;
  tagline: string;
  color: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  tagline: string;
  badge: string;
  colors: ThemeColors;
  mascot: ThemeMascot;
  cardRadius: string;
  buttonClass: string;
  glowEffect: boolean;
  starsOrGrid: 'none' | 'stars' | 'grid' | 'confetti';
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'party-pop': {
    id: 'party-pop',
    name: 'Party Pop',
    description: 'Bright, playful and full of energy.',
    tagline: 'Vibrant vibes & bouncy celebrations',
    badge: 'DEFAULT',
    colors: {
      primary: '#7C3AED', // Royal Purple
      primaryHover: '#6D28D9',
      secondary: '#22C55E', // Bright Green
      accent: '#EC4899', // Hot Pink
      background: '#FFFFFF', // Clean white
      surface: '#FFFFFF',
      surfaceHover: '#F8FAFC',
      border: '#E2E8F0',
      text: '#0F172A',
      textMuted: '#64748B',
      cardBg: '#FFFFFF',
      answerRed: '#EF4444',
      answerBlue: '#3B82F6',
      answerYellow: '#EAB308',
      answerGreen: '#22C55E',
    },
    mascot: {
      name: 'Blip',
      role: 'The Party Champion',
      tagline: 'Ready to pop some brains!',
      color: '#7C3AED',
    },
    cardRadius: 'rounded-3xl border border-slate-200/80 shadow-sm',
    buttonClass: 'rounded-full font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all',
    glowEffect: false,
    starsOrGrid: 'none',
  },
  'neon-arcade': {
    id: 'neon-arcade',
    name: 'Neon Arcade',
    description: 'High-voltage cyber aesthetics, neon glows, and retro 8-bit energy for hackathons and gaming.',
    tagline: 'Cyber pulses & pixel precision',
    badge: 'GAMER',
    colors: {
      primary: '#00F0FF', // Cyan
      primaryHover: '#00C8D6',
      secondary: '#FF007A', // Magenta
      accent: '#7928CA',
      background: '#070A13',
      surface: '#0F172A',
      surfaceHover: '#1E293B',
      border: '#00F0FF44',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      cardBg: 'rgba(15, 23, 42, 0.9)',
      answerRed: '#FF0055',
      answerBlue: '#00B4D8',
      answerYellow: '#FFB703',
      answerGreen: '#00F5D4',
    },
    mascot: {
      name: 'Pixel-Bot',
      role: 'Cyber Synthesizer',
      tagline: 'Executing game loop 100%...',
      color: '#00F0FF',
    },
    cardRadius: 'rounded-lg border-2 border-cyan-500/30',
    buttonClass: 'rounded-lg uppercase font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all',
    glowEffect: true,
    starsOrGrid: 'grid',
  },
  'cosmic-quest': {
    id: 'cosmic-quest',
    name: 'Cosmic Quest',
    description: 'Atmospheric deep-space blues, nebula purples, and celestial glow for STEM and discovery.',
    tagline: 'Deep space exploration & discovery',
    badge: 'SCI-FI',
    colors: {
      primary: '#6366F1', // Indigo
      primaryHover: '#4F46E5',
      secondary: '#38BDF8', // Sky
      accent: '#EC4899', // Pink
      background: '#040714',
      surface: '#0D1329',
      surfaceHover: '#161F42',
      border: '#233060',
      text: '#F1F5F9',
      textMuted: '#818CF8',
      cardBg: 'rgba(13, 19, 41, 0.85)',
      answerRed: '#F43F5E',
      answerBlue: '#3B82F6',
      answerYellow: '#F59E0B',
      answerGreen: '#10B981',
    },
    mascot: {
      name: 'Astro-Sprout',
      role: 'Cosmic Voyager',
      tagline: 'Reaching beyond the stars!',
      color: '#6366F1',
    },
    cardRadius: 'rounded-3xl backdrop-blur-md',
    buttonClass: 'rounded-2xl shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all',
    glowEffect: true,
    starsOrGrid: 'stars',
  },
  'champion-mode': {
    id: 'champion-mode',
    name: 'Champion Mode',
    description: 'Emerald green, brushed gold, and prestigious styling for tournaments, workshops, and awards.',
    tagline: 'Prestigious tournament & honors',
    badge: 'PRESTIGE',
    colors: {
      primary: '#10B981', // Emerald
      primaryHover: '#059669',
      secondary: '#F59E0B', // Amber gold
      accent: '#D97706',
      background: '#041E15',
      surface: '#0A2E22',
      surfaceHover: '#0F3F2F',
      border: '#D9770666',
      text: '#FDFBF7',
      textMuted: '#6EE7B7',
      cardBg: 'rgba(10, 46, 34, 0.9)',
      answerRed: '#DC2626',
      answerBlue: '#2563EB',
      answerYellow: '#D97706',
      answerGreen: '#059669',
    },
    mascot: {
      name: 'Aegis',
      role: 'Tournament Guardian',
      tagline: 'May the sharpest mind triumph!',
      color: '#F59E0B',
    },
    cardRadius: 'rounded-xl border border-amber-500/30',
    buttonClass: 'rounded-xl font-semibold shadow-md border border-amber-500/40 hover:border-amber-400 active:scale-98 transition-all',
    glowEffect: false,
    starsOrGrid: 'none',
  },
};
