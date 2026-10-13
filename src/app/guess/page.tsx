'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/audio';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ThemeId, THEMES } from '@/types/theme';
import { GuessItem, MysteryEffect, ScoreTeam } from '@/types/guess';
import { GUESS_LIBRARIES } from '@/lib/guess-library';
import { GUESS_THEME_STYLES } from '@/lib/guess-theme-styles';
import { GuessLibraryModal } from '@/components/guess/GuessLibraryModal';
import { GameFinishedModal } from '@/components/guess/GameFinishedModal';
import {
  Sparkles,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  RotateCcw,
  Library,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Trophy,
  Users,
  CheckCircle,
  Lightbulb,
  Layers,
  Grid3X3,
  Flame,
  Shuffle,
  X,
  Play,
  Settings,
  Edit3,
  ArrowRight,
  PlusCircle,
  Image as ImageIcon,
} from 'lucide-react';

const INITIAL_TEAMS: ScoreTeam[] = [
  { id: 'team-1', name: 'Team Red', score: 0, color: '#EF4444' },
  { id: 'team-2', name: 'Team Blue', score: 0, color: '#3B82F6' },
  { id: 'team-3', name: 'Team Green', score: 0, color: '#10B981' },
];

export default function GuessLogoPage() {
  const { themeId, setThemeId, theme: themeConfig } = useTheme();

  // Mode: 'creator' (Build & Customize) vs 'play' (Interactive arena)
  const [viewMode, setViewMode] = useState<'creator' | 'play'>('creator');
  const [gameTitle, setGameTitle] = useState('My Logo Guessing Game');

  // Items State (starts empty or with items creator adds)
  const [items, setItems] = useState<GuessItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mystery Mode & Controls
  const [mysteryEffect, setMysteryEffect] = useState<MysteryEffect>('none');
  const [showHint, setShowHint] = useState(false);
  const [revealedCurrent, setRevealedCurrent] = useState(false);
  const [tilesRevealed, setTilesRevealed] = useState<{ [key: number]: boolean }>({});

  // Sound & Screen Controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Teams & Scoreboard
  const [teams, setTeams] = useState<ScoreTeam[]>(INITIAL_TEAMS);
  const [newTeamName, setNewTeamName] = useState('');

  // Game Finished Modal
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Modals & Custom Add
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const currentItem = items[currentIndex] || null;

  // Thematic flags & tokens
  const isNeon = themeId === 'neon-arcade';
  const isCosmic = themeId === 'cosmic-quest';
  const isChampion = themeId === 'champion-mode';
  const isParty = !isNeon && !isCosmic && !isChampion;

  const ts = GUESS_THEME_STYLES[themeId] || GUESS_THEME_STYLES['party-pop'];

  // Reset tiles when slide changes or effect changes
  useEffect(() => {
    setTilesRevealed({});
    setShowHint(false);
    if (currentItem) {
      setRevealedCurrent(!!currentItem.revealed);
    } else {
      setRevealedCurrent(false);
    }
  }, [currentIndex, mysteryEffect]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Trigger Reveal
  const handleReveal = () => {
    if (revealedCurrent) return;

    setRevealedCurrent(true);
    setItems((prev) =>
      prev.map((item, idx) => (idx === currentIndex ? { ...item, revealed: true } : item))
    );

    // Audio & Confetti celebration
    if (soundEnabled) {
      sounds.playWheelWinner();
    }

    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.6 },
      colors: isNeon
        ? ['#06B6D4', '#EC4899', '#3B82F6', '#A855F7']
        : isCosmic
        ? ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981']
        : ['#7C3AED', '#EC4899', '#F59E0B', '#10B981'],
    });
  };

  // Navigation
  const handleNext = () => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const handlePrev = () => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const handleFinishGame = () => {
    setIsGameFinished(true);
  };

  const handlePlayAgain = () => {
    setItems((prev) => prev.map((item) => ({ ...item, revealed: false })));
    setCurrentIndex(0);
    setRevealedCurrent(false);
    setTilesRevealed({});
    setShowHint(false);
    setIsGameFinished(false);
    if (soundEnabled) sounds.playCorrect();
  };

  const handleShuffle = () => {
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const handleResetAllReveals = () => {
    setItems((prev) => prev.map((item) => ({ ...item, revealed: false })));
    setRevealedCurrent(false);
    setTilesRevealed({});
    setShowHint(false);
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  // Add items from library
  const handleAddLibraryItems = (newItems: GuessItem[]) => {
    setItems((prev) => [...prev, ...newItems]);
    if (soundEnabled) sounds.playCorrect();
  };

  // Add pack directly from quick packs
  const handleAddPack = (packId: string) => {
    const pack = GUESS_LIBRARIES.find((p) => p.id === packId);
    if (!pack) return;
    const mapped: GuessItem[] = pack.items.map((item, idx) => ({
      id: `${pack.id}-${Date.now()}-${idx}`,
      name: item.name,
      imageUrl: item.imageUrl,
      hint: item.hint,
      category: item.category,
      revealed: false,
    }));
    setItems((prev) => [...prev, ...mapped]);
    if (soundEnabled) sounds.playCorrect();
  };

  // Add single custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    const newItem: GuessItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      imageUrl: customUrl.trim(),
      hint: customHint.trim() || undefined,
      category: customCategory.trim() || 'Custom',
      revealed: false,
    };

    setItems((prev) => [...prev, newItem]);
    setCustomName('');
    setCustomUrl('');
    setCustomHint('');
    setCustomCategory('');
    setIsAddCustomOpen(false);
    if (soundEnabled) sounds.playCorrect();
  };

  // File upload for custom item
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomUrl(result);
        if (!customName) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setCustomName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove Item
  const handleRemoveItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (currentIndex >= filtered.length && filtered.length > 0) {
        setCurrentIndex(filtered.length - 1);
      }
      return filtered;
    });
  };

  // Teams Score
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const newTeam: ScoreTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      score: 0,
      color: colors[teams.length % colors.length],
    };
    setTeams((prev) => [...prev, newTeam]);
    setNewTeamName('');
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const updateScore = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
    if (delta > 0 && soundEnabled) sounds.playCorrect();
  };

  const handleTileClick = (index: number) => {
    setTilesRevealed((prev) => ({ ...prev, [index]: true }));
    if (soundEnabled) sounds.playWheelTick();
  };

  const startPlayingGame = () => {
    if (items.length === 0) {
      alert('Please add at least 1 logo or picture before launching the game!');
      return;
    }
    setCurrentIndex(0);
    setRevealedCurrent(false);
    setViewMode('play');
    if (soundEnabled) sounds.playCorrect();
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full relative overflow-hidden flex flex-col font-sans transition-colors duration-500 ${
        isNeon
          ? 'bg-[#030712] text-white'
          : isCosmic
          ? 'bg-[#050C1A] text-white'
          : isChampion
          ? 'bg-[#FDFBF7] text-[#0F172A]'
          : 'bg-[#FCFBFF] text-slate-800'
      }`}
    >
      {/* =========================================================================
          BACKGROUND LAYER: DYNAMIC BACKGROUND IMAGE BASED ON SELECTED THEME
      ========================================================================== */}
      {isNeon && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/neon_arcade_bg.png')" }}
        />
      )}
      {isCosmic && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/cosmic_quest_bg.png')" }}
        />
      )}
      {isChampion && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/champion_mode_bg.png')" }}
        />
      )}
      {!isNeon && !isCosmic && !isChampion && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
          style={{ backgroundImage: "url('/images/bopzi_pastel_bg.png')" }}
        />
      )}

      {/* =========================================================================
          MAIN CONTAINER
      ========================================================================== */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full relative z-10 flex-1 flex flex-col">
        {/* =========================================================================
            HEADER BAR: TITLE + MODE SWITCHER + THEME SELECTOR + ACTIONS
        ========================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-4 pb-3 border-b border-black/10 dark:border-white/10">
          {/* Left: Title + Mode Badge */}
          <div>
            <div className="flex items-center gap-2">
              <h1
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isChampion ? 'text-slate-900' : isNeon || isCosmic ? 'text-white' : 'text-slate-900'
                }`}
              >
                Guess the{' '}
                <span
                  className={
                    isNeon
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                      : isCosmic
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400'
                      : isChampion
                      ? 'text-amber-500 drop-shadow-sm [-webkit-text-stroke:1px_#78350F]'
                      : 'text-[#7C3AED]'
                  }
                >
                  Logo & Picture
                </span>
              </h1>

              {/* Creator vs Play Mode Tabs */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 ml-2">
                <button
                  onClick={() => setViewMode('creator')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                    viewMode === 'creator'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Game Creator</span>
                </button>
                <button
                  onClick={() => {
                    if (items.length === 0) {
                      alert('Add at least 1 logo or picture first!');
                      return;
                    }
                    setViewMode('play');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                    viewMode === 'play'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>Play Game ({items.length})</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {viewMode === 'creator'
                ? 'Game Creator: Add logos from curated packs, search libraries, or upload custom pictures, then launch!'
                : 'Live Game Arena: Host presents logos, tests audience, and reveals names with celebration sound & confetti!'}
            </p>
          </div>

          {/* Center: Text-Only Theme Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs self-start lg:self-center">
            {[
              { id: 'party-pop' as ThemeId, name: 'Party Pop', emoji: '🪄' },
              { id: 'neon-arcade' as ThemeId, name: 'Neon Arcade', emoji: '⚡' },
              { id: 'cosmic-quest' as ThemeId, name: 'Cosmic Quest', emoji: '🪐' },
              { id: 'champion-mode' as ThemeId, name: 'Champion Mode', emoji: '👑' },
            ].map((t) => {
              const isSelected = themeId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? isNeon
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-105'
                        : isCosmic
                        ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105'
                        : isChampion
                        ? 'bg-amber-500 text-white shadow-md scale-105'
                        : 'bg-[#7C3AED] text-white shadow-md scale-105'
                      : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{t.emoji}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Quick Controls */}
          <div className="flex items-center gap-2">
            {viewMode === 'play' && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? 'Hide Controls & Items' : 'Show Controls & Items'}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
                  sidebarOpen
                    ? isNeon
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/20'
                      : isCosmic
                      ? 'bg-[#0A1628]/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20'
                      : isChampion
                      ? 'bg-white/90 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    : 'bg-emerald-500 text-white font-black shadow-md animate-pulse'
                }`}
              >
                {sidebarOpen ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Sidebar</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Sidebar</span>
                  </>
                )}
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                sounds.setMuted(soundEnabled);
              }}
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
              className={`p-2 rounded-xl border transition-all ${
                isNeon
                  ? 'bg-slate-900/60 border-cyan-500/30 text-cyan-400 hover:border-cyan-400'
                  : isCosmic
                  ? 'bg-slate-900/60 border-amber-500/30 text-amber-400 hover:border-amber-400'
                  : isChampion
                  ? 'bg-white/70 border-amber-300 text-amber-800 hover:bg-white'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className={`p-2 rounded-xl border transition-all ${
                isNeon
                  ? 'bg-slate-900/60 border-cyan-500/30 text-cyan-400 hover:border-cyan-400'
                  : isCosmic
                  ? 'bg-slate-900/60 border-amber-500/30 text-amber-400 hover:border-amber-400'
                  : isChampion
                  ? 'bg-white/70 border-amber-300 text-amber-800 hover:bg-white'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: GAME CREATOR WORKBENCH (When viewMode === 'creator')
        ========================================================================== */}
        {viewMode === 'creator' && (
          <div className="flex-1 flex flex-col gap-6 animate-fade-in">
            {/* Creator Hero Header Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border ${ts.panelBg} ${ts.panelBorder} ${ts.panelShadow} transition-all`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-2 rounded-xl ${ts.scoreBadgeBg} ${ts.scoreBadgeText}`}>
                      🛠️
                    </span>
                    <input
                      type="text"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      placeholder="Enter Game Title (e.g. Mega Tech Logo Quiz)"
                      className="text-xl sm:text-2xl font-black bg-transparent border-b border-transparent hover:border-current focus:outline-none transition"
                    />
                  </div>
                  <p className="text-xs sm:text-sm opacity-70">
                    Step 1: Pick logos or pictures from libraries or add custom pictures. Step 2: Click Launch Game to start playing!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsLibraryOpen(true)}
                    className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black ${ts.accentGrad} ${ts.accentText} ${ts.accentShadow} flex items-center gap-2 transition transform hover:scale-105`}
                  >
                    <Library className="w-4 h-4" />
                    <span>Search / Browse Library</span>
                  </button>

                  <button
                    onClick={() => setIsAddCustomOpen(true)}
                    className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-white/20 dark:bg-white/10 hover:bg-white/30 border border-black/10 dark:border-white/10 flex items-center gap-2 transition transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Picture</span>
                  </button>

                  <button
                    onClick={startPlayingGame}
                    disabled={items.length === 0}
                    className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition transform shadow-xl ${
                      items.length > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:scale-105 animate-pulse'
                        : 'bg-black/10 dark:bg-white/10 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Launch Game ({items.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick-Add Pre-Curated Packs Strip */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-black uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick-Add Pre-curated Packs:
                </h3>
                <span className="text-xs opacity-50">Click to instantly add an entire category</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {GUESS_LIBRARIES.map((pack) => {
                  return (
                    <div
                      key={pack.id}
                      className={`p-3.5 rounded-2xl border ${ts.panelBg} ${ts.panelBorder} transition-all hover:scale-[1.02] flex flex-col justify-between`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{pack.icon}</span>
                        <div>
                          <h4 className="font-bold text-xs line-clamp-1">{pack.name}</h4>
                          <span className="text-[10px] opacity-60">{pack.items.length} items</span>
                        </div>
                      </div>
                      <p className="text-[11px] opacity-70 line-clamp-2 mb-3">
                        {pack.description}
                      </p>
                      <button
                        onClick={() => handleAddPack(pack.id)}
                        className={`w-full py-1.5 px-2 rounded-xl text-xs font-black ${ts.accentGrad} ${ts.accentText} transition flex items-center justify-center gap-1 shadow-xs hover:scale-[1.02]`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add All ({pack.items.length})</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Creator's Current Game Playlist Grid */}
            <div
              className={`rounded-3xl p-6 border ${ts.panelBg} ${ts.panelBorder} ${ts.panelShadow} flex-1`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🖼️</span>
                  <h3 className="font-black text-sm tracking-tight">
                    Current Game Logos & Pictures ({items.length})
                  </h3>
                </div>

                {items.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShuffle}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition flex items-center gap-1"
                    >
                      <Shuffle className="w-3.5 h-3.5" /> Shuffle
                    </button>
                    <button
                      onClick={() => setItems([])}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className={`w-16 h-16 rounded-3xl ${ts.scoreBadgeBg} ${ts.scoreBadgeText} flex items-center justify-center text-3xl mx-auto mb-3`}>
                    🎨
                  </div>
                  <h3 className="text-base font-bold mb-1">Your Game is Currently Empty</h3>
                  <p className="text-xs opacity-70 max-w-md mx-auto mb-5">
                    Add logos from the pre-curated packs above, search the logo library, or upload your own pictures to begin building your custom guessing game!
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsLibraryOpen(true)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black ${ts.accentGrad} ${ts.accentText} shadow-md flex items-center gap-2 transition hover:scale-105`}
                    >
                      <Library className="w-4 h-4" /> Browse Library
                    </button>
                    <button
                      onClick={() => setIsAddCustomOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-white/15 hover:bg-white/25 text-inherit transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Custom Picture
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`group relative rounded-2xl border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/5 p-3 flex flex-col items-center text-center transition hover:scale-[1.02] hover:${ts.activeCardBorder}`}
                    >
                      {/* Delete icon */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        title="Remove logo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Number badge */}
                      <span className="absolute top-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-black/30 text-white">
                        #{idx + 1}
                      </span>

                      {/* Image container */}
                      <div className="w-full h-24 rounded-xl bg-white p-2.5 flex items-center justify-center my-2 shadow-inner">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Name & Hint */}
                      <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
                      {item.hint && (
                        <p className="text-[10px] opacity-60 line-clamp-1 mt-0.5" title={item.hint}>
                          💡 {item.hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: LIVE PLAY GAME ARENA (When viewMode === 'play')
        ========================================================================== */}
        {viewMode === 'play' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-0 animate-fade-in">
            {/* =========================================================================
                LEFT: GUESSING ARENA BOX (LOW TRANSPARENCY SO WALLPAPER SHINES THROUGH)
            ========================================================================== */}
            <div
              className={`flex flex-col transition-all duration-300 ${
                sidebarOpen ? 'lg:col-span-8 xl:col-span-8' : 'lg:col-span-12'
              }`}
            >
              <div
                className={`flex-1 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between border ${ts.panelBg} ${ts.panelBorder} ${ts.panelShadow} relative overflow-hidden transition-all duration-500`}
              >
                {/* Top Arena Header: Slide Counter + Mystery Mode Selector + Hint */}
                <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                  {/* Counter */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${ts.scoreBadgeBg} ${ts.scoreBadgeText}`}
                    >
                      Question {items.length > 0 ? currentIndex + 1 : 0} of {items.length}
                    </span>
                    {currentItem?.category && (
                      <span className="text-xs font-semibold opacity-70">
                        📁 {currentItem.category}
                      </span>
                    )}
                  </div>

                  {/* Mystery Filter Modes */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10">
                    <span className="text-[11px] font-bold px-2 opacity-70 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Mode:
                    </span>
                    {[
                      { id: 'none' as MysteryEffect, label: 'Clear' },
                      { id: 'blur' as MysteryEffect, label: 'Blur' },
                      { id: 'silhouette' as MysteryEffect, label: 'Silhouette' },
                      { id: 'tiles' as MysteryEffect, label: '9-Tiles' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMysteryEffect(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          mysteryEffect === m.id
                            ? `${ts.accentSolid} ${ts.accentText} shadow-xs`
                            : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Hint Toggle */}
                  {currentItem?.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                        showHint
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10 hover:border-amber-400/50'
                      }`}
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${showHint ? 'text-amber-400 fill-amber-400' : ''}`} />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  )}
                </div>

                {/* Hint Callout banner */}
                {showHint && currentItem?.hint && (
                  <div className="w-full my-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Clue:</strong> {currentItem.hint}
                    </span>
                  </div>
                )}

                {/* CENTERPIECE: LOGO / PICTURE STAGE */}
                <div className="w-full flex-1 flex flex-col items-center justify-center my-4 relative">
                  {items.length === 0 ? (
                    <div className="text-center p-8">
                      <Library className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <h3 className="text-lg font-bold">No logos in list</h3>
                      <p className="text-xs opacity-70 mb-4">
                        Switch to Game Creator to add logos or browse the library!
                      </p>
                      <button
                        onClick={() => setViewMode('creator')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black ${ts.accentGrad} ${ts.accentText} shadow-lg hover:scale-105 transition`}
                      >
                        Open Game Creator
                      </button>
                    </div>
                  ) : (
                    <div className={`relative w-full max-w-[540px] aspect-4/3 max-h-[380px] rounded-3xl bg-white/95 border-4 ${ts.logoBorder} overflow-hidden flex items-center justify-center p-6 group select-none`}>
                      {/* The Logo/Picture Image with active mystery filter */}
                      <img
                        src={currentItem?.imageUrl}
                        alt={revealedCurrent ? currentItem?.name : 'Mystery Logo'}
                        className={`max-h-full max-w-full object-contain filter transition-all duration-700 ease-out ${
                          revealedCurrent
                            ? 'scale-105 drop-shadow-xl'
                            : mysteryEffect === 'blur'
                            ? 'blur-xl scale-110'
                            : mysteryEffect === 'silhouette'
                            ? 'brightness-0 contrast-200 drop-shadow-lg'
                            : ''
                        }`}
                      />

                      {/* 9-Tiles Cover Layer (if mysteryEffect is 'tiles' and not revealed) */}
                      {!revealedCurrent && mysteryEffect === 'tiles' && (
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1.5 p-2 bg-slate-900/60 backdrop-blur-xs">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((tIdx) => {
                            const isTileOpen = !!tilesRevealed[tIdx];
                            return (
                              <button
                                key={tIdx}
                                onClick={() => handleTileClick(tIdx)}
                                disabled={isTileOpen}
                                className={`rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center select-none shadow-md ${
                                  isTileOpen
                                    ? 'opacity-0 pointer-events-none'
                                    : `${ts.tileBg} ${ts.tileText} border ${ts.tileBorder} ${ts.tileHover} hover:scale-95`
                                }`}
                              >
                                <span>{tIdx + 1}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* REVEAL BADGE OVERLAY WHEN REVEALED */}
                      {revealedCurrent && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 text-center flex flex-col items-center justify-end animate-fade-in">
                          <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-400 mb-1 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> REVEALED ANSWER
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                            {currentItem?.name}
                          </h2>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* BOTTOM ACTIONS: PREV / REVEAL BUTTON / NEXT */}
                <div className="w-full flex items-center justify-between gap-4 pt-3 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={handlePrev}
                    disabled={items.length <= 1}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all ${ts.btnSecondary} ${ts.btnSecondaryText} border ${ts.btnSecondaryBorder}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* THE BIG REVEAL BUTTON */}
                  <button
                    onClick={handleReveal}
                    disabled={items.length === 0 || revealedCurrent}
                    className={`px-8 py-3.5 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2.5 transition-all duration-300 transform active:scale-95 ${
                      revealedCurrent
                        ? 'bg-emerald-600/60 text-white cursor-default border border-emerald-400/50'
                        : `${ts.revealBtnBg} ${ts.revealBtnText} ${ts.revealBtnShadow} hover:scale-105`
                    }`}
                  >
                    <Sparkles className="w-5 h-5 animate-spin-slow" />
                    <span>{revealedCurrent ? 'REVEALED!' : 'CLICK TO REVEAL NAME'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNext}
                      disabled={items.length <= 1}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all ${ts.btnSecondary} ${ts.btnSecondaryText} border ${ts.btnSecondaryBorder}`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Manual Finish Game & Announce Results Button */}
                    <button
                      onClick={handleFinishGame}
                      title="Finish Game and Announce Winner Team"
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all ${ts.accentGrad} ${ts.accentText} ${ts.accentShadow} hover:scale-105 active:scale-95`}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Submit Results & Winner</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK SCOREBOARD STRIP BELOW ARENA */}
              <div
                className={`mt-4 rounded-2xl p-3.5 border ${ts.panelBg} ${ts.panelBorder} flex flex-wrap items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">Scoreboard:</span>
                </div>

                {/* Teams score buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/20 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: team.color }}
                      />
                      <span>{team.name}:</span>
                      <span className="font-black text-sm px-1 text-amber-400">{team.score}</span>
                      <button
                        onClick={() => updateScore(team.id, 1)}
                        className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white flex items-center justify-center font-bold text-xs transition"
                        title="Add 1 Point"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => updateScore(team.id, -1)}
                        className="w-5 h-5 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white flex items-center justify-center font-bold text-xs transition"
                        title="Minus 1 Point"
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>

                {/* Scoreboard Actions: Add Team + Submit Results */}
                <div className="flex items-center gap-2">
                  <form onSubmit={handleAddTeam} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="+ New Team"
                      className="px-2.5 py-1 text-xs rounded-lg bg-black/20 dark:bg-white/10 border border-black/10 dark:border-white/10 text-inherit placeholder-opacity-50 focus:outline-none w-24"
                    />
                    <button
                      type="submit"
                      disabled={!newTeamName.trim()}
                      className={`p-1 rounded-lg ${ts.accentSolid} ${ts.accentText} transition disabled:opacity-40`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  <button
                    onClick={handleFinishGame}
                    className={`px-3 py-1 rounded-xl text-xs font-black ${ts.accentGrad} ${ts.accentText} transition flex items-center gap-1 shadow-sm hover:scale-105`}
                    title="Calculate final points and announce winner team"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Submit Score & Announce Winner</span>
                  </button>
                </div>
              </div>
            </div>

            {/* =========================================================================
                RIGHT: COLLAPSIBLE SIDEBAR (LIST + LIBRARY BROWSER + CUSTOM CREATOR)
            ========================================================================== */}
            {sidebarOpen && (
              <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-4">
                <div
                  className={`rounded-3xl p-5 border ${ts.panelBg} ${ts.panelBorder} ${ts.panelShadow} flex flex-col h-full`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <h3 className="font-black text-sm tracking-tight">Logo Playlist</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/10 dark:bg-white/10">
                        {items.length}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleShuffle}
                        title="Shuffle List"
                        className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-white/20 transition text-inherit text-xs"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleResetAllReveals}
                        title="Reset All Reveals"
                        className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-white/20 transition text-inherit text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Add Buttons: Browse Library & Custom Add */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => setIsLibraryOpen(true)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-black ${ts.accentGrad} ${ts.accentText} ${ts.accentShadow} flex items-center justify-center gap-1.5 transition transform hover:scale-[1.02]`}
                    >
                      <Library className="w-3.5 h-3.5" />
                      <span>Browse Library</span>
                    </button>

                    <button
                      onClick={() => setIsAddCustomOpen(true)}
                      className="py-2.5 px-3 rounded-2xl text-xs font-black bg-white/20 dark:bg-white/10 hover:bg-white/30 border border-black/10 dark:border-white/10 flex items-center justify-center gap-1.5 transition transform hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom</span>
                    </button>
                  </div>

                  {/* Playlist items scrollable */}
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[460px] pr-1">
                    {items.map((item, idx) => {
                      const isSelected = idx === currentIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`p-2.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition select-none group ${
                            isSelected
                              ? `${ts.activeCardBg} ${ts.activeCardBorder} ${ts.activeCardRing} ${ts.activeCardShadow}`
                              : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/10 dark:hover:border-white/10'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-black/10 shadow-xs">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          {/* Title & Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black line-clamp-1">{item.name}</span>
                              {item.revealed && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                                  ✓
                                </span>
                              )}
                            </div>
                            {item.hint && (
                              <p className="text-[10px] opacity-60 line-clamp-1">{item.hint}</p>
                            )}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleRemoveItem(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS
      ========================================================================== */}
      {/* 1. Library Picker Modal */}
      <GuessLibraryModal
        isOpen={isLibraryOpen}
        themeId={themeId}
        onClose={() => setIsLibraryOpen(false)}
        onAddItems={handleAddLibraryItems}
      />

      {/* 2. Custom Add Modal */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold">Add Custom Logo or Picture</h3>
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Logo / Picture Name (Hidden until reveal) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks, Tesla, Colosseum"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Image Source *
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">or upload file:</span>
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {customUrl && (
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-28">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Hint / Clue (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Famous Italian sports car with prancing horse"
                  value={customHint}
                  onChange={(e) => setCustomHint(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brands, Gaming, Food"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim() || !customUrl.trim()}
                  className={`px-5 py-2 rounded-xl text-xs font-black ${ts.accentGrad} ${ts.accentText} ${ts.accentShadow} transition disabled:opacity-50`}
                >
                  Add to Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Game Finished & Winner Announcement Modal */}
      <GameFinishedModal
        isOpen={isGameFinished}
        totalQuestions={items.length}
        teams={teams}
        themeId={themeId}
        onClose={() => setIsGameFinished(false)}
        onPlayAgain={handlePlayAgain}
        onEditGame={() => {
          setIsGameFinished(false);
          setViewMode('creator');
        }}
      />
    </div>
  );
}
