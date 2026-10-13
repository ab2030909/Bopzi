'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  WheelCanvas,
  WheelItem,
  THEME_PALETTES,
} from '@/components/wheel/WheelCanvas';
import { WheelImportModal } from '@/components/wheel/WheelImportModal';
import { WinnerModal } from '@/components/wheel/WinnerModal';
import { sounds } from '@/lib/audio';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ThemeId, THEMES } from '@/types/theme';
import {
  Sparkles,
  Play,
  RotateCw,
  Upload,
  UserPlus,
  Trash2,
  Shuffle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Award,
  Download,
  CheckCircle2,
  Flame,
  Clock,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

interface WinnerRecord {
  id: string;
  name: string;
  roundNumber: number;
  timestamp: string;
}

const DEFAULT_PARTICIPANTS: WheelItem[] = [
  { id: '1', name: 'Sophia Miller', active: true },
  { id: '2', name: 'Jackson Lee', active: true },
  { id: '3', name: 'Olivia Garcia', active: true },
  { id: '4', name: 'Liam Davies', active: true },
  { id: '5', name: 'Emma Wilson', active: true },
  { id: '6', name: 'Noah Martinez', active: true },
  { id: '7', name: 'Ava Anderson', active: true },
  { id: '8', name: 'Lucas Taylor', active: true },
];

export default function SpinWheelPage() {
  const { themeId, setThemeId, theme: themeConfig } = useTheme();

  // Participants State
  const [participants, setParticipants] = useState<WheelItem[]>(DEFAULT_PARTICIPANTS);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Wheel & Game State
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<WheelItem | null>(null);

  // Spin Rules Configuration
  const [totalRounds, setTotalRounds] = useState<number | 'unlimited'>('unlimited');
  const [customRoundsInput, setCustomRoundsInput] = useState<string>('5');
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  const [eliminationMode, setEliminationMode] = useState<boolean>(true);
  const [spinDuration, setSpinDuration] = useState<number>(6); // seconds
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Winners History
  const [winnersHistory, setWinnersHistory] = useState<WinnerRecord[]>([]);

  // UI State: Collapsible Sidebar & Full Focus Game Mode
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'participants' | 'settings' | 'history'>('participants');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active participants count
  const activeParticipants = useMemo(
    () => participants.filter((p) => p.active !== false),
    [participants]
  );

  // Handle Fullscreen Toggle
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

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Theme flags matching QuizEditorForm
  const isNeon = themeId === 'neon-arcade';
  const isCosmic = themeId === 'cosmic-quest';
  const isChampion = themeId === 'champion-mode';

  // Handle Theme Change with sound
  const handleSelectTheme = (newTheme: ThemeId) => {
    setThemeId(newTheme);
    if (soundEnabled) {
      if (newTheme === 'neon-arcade') sounds.playCountdownTick();
      else if (newTheme === 'cosmic-quest') sounds.playQuestionStart();
      else if (newTheme === 'champion-mode') sounds.playLeaderboard();
      else sounds.playPlayerJoined();
    }
  };

  // Handle Spin Start
  const handleStartSpin = useCallback(() => {
    if (isSpinning) return;
    if (activeParticipants.length < 2) {
      alert('Please add at least 2 active participants to spin the wheel!');
      return;
    }

    if (totalRounds !== 'unlimited' && currentRoundNumber > totalRounds) {
      alert(`Tournament completed! You configured ${totalRounds} max spins. Reset spins to play again.`);
      return;
    }

    setIsSpinning(true);
    if (soundEnabled) {
      sounds.playQuestionStart();
    }
  }, [isSpinning, activeParticipants, totalRounds, currentRoundNumber, soundEnabled]);

  // Handle Keyboard Spacebar to Spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;
        if (!isInput && !isSpinning && !currentWinner && !isImportModalOpen) {
          e.preventDefault();
          handleStartSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartSpin, isSpinning, currentWinner, isImportModalOpen]);

  // Handle Spin End
  const handleSpinEnd = (winner: WheelItem) => {
    setIsSpinning(false);
    setCurrentWinner(winner);

    // Add to history
    const record: WinnerRecord = {
      id: `winner-${Date.now()}`,
      name: winner.name,
      roundNumber: currentRoundNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setWinnersHistory((prev) => [record, ...prev]);
  };

  // Participant Management
  const handleAddParticipant = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newParticipantName.trim();
    if (!trimmed) return;

    const newItem: WheelItem = {
      id: `participant-${Date.now()}`,
      name: trimmed,
      active: true,
    };
    setParticipants((prev) => [...prev, newItem]);
    setNewParticipantName('');
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: p.active === false ? true : false } : p))
    );
  };

  const handleShuffle = () => {
    setParticipants((prev) => [...prev].sort(() => Math.random() - 0.5));
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const handleSortAZ = () => {
    setParticipants((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
    if (soundEnabled) sounds.playAnswerSubmitted();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all participants?')) {
      setParticipants([]);
    }
  };

  const handleImport = (newItems: WheelItem[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setParticipants(newItems);
    } else {
      setParticipants((prev) => [...prev, ...newItems]);
    }
    if (soundEnabled) sounds.playCorrect();
  };

  // Winner Modal Actions
  const handleCloseWinnerModal = () => {
    setCurrentWinner(null);
    setCurrentRoundNumber((prev) => prev + 1);
  };

  const handleSpinAgain = () => {
    setCurrentWinner(null);
    setCurrentRoundNumber((prev) => prev + 1);
    setTimeout(() => {
      handleStartSpin();
    }, 300);
  };

  const handleRemoveWinnerAndSpin = (winnerId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== winnerId));
    setCurrentWinner(null);
    setCurrentRoundNumber((prev) => prev + 1);
    setTimeout(() => {
      handleStartSpin();
    }, 300);
  };

  const handleResetRounds = () => {
    setCurrentRoundNumber(1);
    setWinnersHistory([]);
    if (soundEnabled) sounds.playCountdownTick();
  };

  // Export winners history to CSV
  const handleExportWinnersCSV = () => {
    if (winnersHistory.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Round,Winner Name,Time']
        .concat(winnersHistory.map((w) => `${w.roundNumber},"${w.name}",${w.timestamp}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bopzi-wheel-winners-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
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
            HEADER BAR: COMPACT TITLE + TEXT-ONLY THEME SELECTOR + ACTION BUTTONS
        ========================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5 pb-3 border-b border-black/10 dark:border-white/10">
          {/* Left: Compact Title */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isChampion ? 'text-slate-900' : isNeon || isCosmic ? 'text-white' : 'text-slate-900'
              }`}>
                Spin the{' '}
                <span className={
                  isNeon
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : isCosmic
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400'
                    : isChampion
                    ? 'text-amber-500 drop-shadow-sm [-webkit-text-stroke:1px_#78350F]'
                    : 'text-[#7C3AED]'
                }>
                  Wheel
                </span>
              </h1>
              <span className="text-xl font-black select-none">
                {isNeon ? '⚡' : isCosmic ? '🪐' : isChampion ? '👑' : '🪄'}
              </span>
            </div>
            <p className="text-xs opacity-75 font-medium">
              Random name picker, classroom decider & giveaway arena
            </p>
          </div>

          {/* Center: COMPACT TEXT-ONLY THEME SELECTOR (No big pictures) */}
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
                  onClick={() => handleSelectTheme(t.id)}
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

          {/* Right: Quick Controls + Toggle Sidebar Button */}
          <div className="flex items-center gap-2">
            {/* Toggle Sidebar (Hide Rules & Participants for full-screen wheel play) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Hide Rules & Players (Play Game Mode)' : 'Show Rules & Players Panel'}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
                sidebarOpen
                  ? isNeon
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/20'
                    : isCosmic
                    ? 'bg-[#0A1628]/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20'
                    : isChampion
                    ? 'bg-white/90 text-amber-900 border border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  : isNeon
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse'
                  : isCosmic
                  ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-pulse'
                  : isChampion
                  ? 'bg-amber-500 text-white font-black shadow-md animate-pulse'
                  : 'bg-[#7C3AED] text-white font-black shadow-md animate-pulse'
              }`}
            >
              {sidebarOpen ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Rules & List</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Rules & List</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                sounds.setMuted(soundEnabled);
              }}
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isNeon
                  ? 'bg-slate-900/80 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/20'
                  : isCosmic
                  ? 'bg-[#0A1628]/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20'
                  : isChampion
                  ? 'bg-white/80 text-amber-800 border border-amber-300 hover:bg-amber-100/60'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Classroom / Projector Mode)'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isNeon
                  ? 'bg-slate-900/80 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/20'
                  : isCosmic
                  ? 'bg-[#0A1628]/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20'
                  : isChampion
                  ? 'bg-white/80 text-amber-800 border border-amber-300 hover:bg-amber-100/60'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Import Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isNeon
                  ? 'bg-slate-950/80 text-cyan-300 hover:text-white border border-cyan-500/60'
                  : isCosmic
                  ? 'bg-[#0A1628]/85 text-cyan-300 hover:text-white border border-cyan-500/50'
                  : isChampion
                  ? 'bg-white/90 text-amber-900 border border-amber-300'
                  : 'text-slate-700 bg-white border border-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            GAME STAGE: WHEEL (COMPACT & PROPORTIONED FOR 1920x1080 BACKGROUND VISIBILITY)
        ========================================================================== */}
        <div className={`grid gap-5 items-start transition-all duration-300 ${
          sidebarOpen ? 'grid-cols-1 lg:grid-cols-12 max-w-[1280px] mx-auto w-full' : 'grid-cols-1 max-w-[620px] mx-auto w-full'
        }`}>
          {/* THE WHEEL ARENA */}
          <div
            className={`flex flex-col items-center justify-center space-y-4 rounded-3xl p-4 sm:p-5 transition-all ${
              sidebarOpen ? 'lg:col-span-7 xl:col-span-7' : 'w-full'
            } ${
              isNeon
                ? 'bg-[#060B1E]/25 backdrop-blur-md border border-cyan-400/35 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : isCosmic
                ? 'bg-[#071326]/25 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                : isChampion
                ? 'bg-white/30 backdrop-blur-md border border-amber-300/40 shadow-sm'
                : 'bg-white/30 backdrop-blur-md border border-white/50 shadow-sm'
            }`}
          >
            {/* Top Wheel Banner */}
            <div className={`w-full flex items-center justify-between pb-2 border-b ${
              isNeon ? 'border-cyan-500/25' : isCosmic ? 'border-indigo-500/25' : isChampion ? 'border-amber-200/40' : 'border-slate-200/35'
            }`}>
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: themeConfig.colors.primary }}
                />
                <p className="text-[11px] font-bold">
                  {isSpinning
                    ? 'Hold your breath... wheel is spinning!'
                    : activeParticipants.length < 2
                    ? 'Add at least 2 participants to unlock spin'
                    : 'Ready to choose the next winner!'}
                </p>
              </div>

              {/* Live Round Badge */}
              <div
                className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xl text-[11px] font-bold border"
                style={{
                  backgroundColor: `${themeConfig.colors.primary}15`,
                  borderColor: `${themeConfig.colors.primary}40`,
                  color: isNeon ? '#00F0FF' : isCosmic ? '#38BDF8' : isChampion ? '#B45309' : '#7C3AED',
                }}
              >
                <Flame className="w-3 h-3" />
                <span>
                  {totalRounds === 'unlimited'
                    ? `Spin #${currentRoundNumber} (Unlimited)`
                    : `Round ${Math.min(currentRoundNumber, totalRounds)} / ${totalRounds}`}
                </span>
              </div>
            </div>

            {/* THE WHEEL CANVAS - Sized nicely for clear view */}
            <div className="py-2 flex items-center justify-center w-full">
              <WheelCanvas
                items={participants}
                theme={themeId}
                isSpinning={isSpinning}
                onSpinEnd={handleSpinEnd}
                spinDuration={spinDuration}
                soundEnabled={soundEnabled}
                size={sidebarOpen ? 450 : 490}
                onSpinStart={handleStartSpin}
              />
            </div>

            {/* BIG TACTILE SPIN BUTTON */}
            <div className="w-full max-w-sm flex flex-col items-center pt-1 pb-1">
              <button
                onClick={handleStartSpin}
                disabled={isSpinning || activeParticipants.length < 2}
                className={`w-full py-3.5 px-8 rounded-2xl font-black text-base tracking-wider uppercase transition-all flex items-center justify-center space-x-2.5 shadow-lg ${
                  isSpinning
                    ? 'opacity-60 cursor-not-allowed scale-[0.98]'
                    : activeParticipants.length < 2
                    ? 'opacity-50 cursor-not-allowed'
                    : isNeon
                    ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] border border-pink-400 hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] hover:scale-105 active:scale-95'
                    : isCosmic
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95'
                    : isChampion
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-yellow-200 hover:scale-105 active:scale-95'
                    : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white hover:opacity-95 shadow-md shadow-purple-500/20 hover:scale-105 active:scale-95'
                }`}
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>Spinning Wheel...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>SPIN THE WHEEL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =========================================================================
              RIGHT SIDEBAR: PLAYERS LIST, GAME RULES & WINNERS LOG
          ========================================================================== */}
          {sidebarOpen && (
            <div
              className={`lg:col-span-5 xl:col-span-5 rounded-3xl transition-all flex flex-col overflow-hidden min-h-[500px] max-h-[620px] animate-fadeIn ${
                isNeon
                  ? 'bg-[#060B1E]/25 backdrop-blur-md border border-cyan-400/35 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : isCosmic
                  ? 'bg-[#071326]/25 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                  : isChampion
                  ? 'bg-white/30 backdrop-blur-md border border-amber-300/40 shadow-sm'
                  : 'bg-white/30 backdrop-blur-md border border-white/50 shadow-sm'
              }`}
            >
              {/* Tab Navigation */}
              <div className={`grid grid-cols-3 p-1.5 gap-1 border-b ${
                isNeon ? 'border-cyan-500/30 bg-[#030712]/50' : isCosmic ? 'border-indigo-500/30 bg-[#040C1A]/50' : isChampion ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-slate-50/60'
              }`}>
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'participants' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'participants' ? themeConfig.colors.primary : 'transparent',
                    color: activeTab === 'participants' ? '#FFFFFF' : 'inherit',
                  }}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Players</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
                    {participants.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'settings' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'settings' ? themeConfig.colors.primary : 'transparent',
                    color: activeTab === 'settings' ? '#FFFFFF' : 'inherit',
                  }}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Rules</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'history' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'history' ? themeConfig.colors.primary : 'transparent',
                    color: activeTab === 'history' ? '#FFFFFF' : 'inherit',
                  }}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Winners</span>
                  {winnersHistory.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
                      {winnersHistory.length}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: PARTICIPANTS */}
              {activeTab === 'participants' && (
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  {/* Quick Add Form */}
                  <form onSubmit={handleAddParticipant} className="flex space-x-2">
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="Type a participant name..."
                      className={`flex-1 px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
                        isNeon
                          ? 'bg-[#030712]/95 border-cyan-500/70 text-white placeholder:text-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] focus:border-cyan-300'
                          : isCosmic
                          ? 'bg-[#040C1A]/95 border-cyan-500/60 text-white placeholder:text-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] focus:border-cyan-300'
                          : isChampion
                          ? 'bg-white/95 border-amber-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-300'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!newParticipantName.trim()}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center space-x-1 shadow-sm disabled:opacity-50 ${
                        isNeon
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black'
                          : isCosmic
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                          : isChampion
                          ? 'bg-amber-500 hover:bg-amber-600 text-white font-bold'
                          : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Action Toolbar */}
                  <div className={`flex items-center justify-between text-xs pt-1 pb-2 border-b ${
                    isNeon ? 'border-cyan-500/20' : isCosmic ? 'border-indigo-500/20' : isChampion ? 'border-amber-200' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleShuffle}
                        className="p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-all flex items-center space-x-1"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Shuffle</span>
                      </button>
                      <button
                        onClick={handleSortAZ}
                        className="px-2 py-1 rounded-lg opacity-80 hover:opacity-100 transition-all text-[11px] font-semibold"
                      >
                        A-Z
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className={`text-[11px] font-bold hover:underline transition-colors flex items-center space-x-1 ${
                          isNeon ? 'text-cyan-300' : isCosmic ? 'text-amber-300' : isChampion ? 'text-amber-700' : 'text-[#7C3AED]'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Import Excel</span>
                      </button>
                      {participants.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="text-[11px] font-bold text-red-400 hover:text-red-500 transition-colors ml-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Participants List */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[380px] pr-1">
                    {participants.length === 0 ? (
                      <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 opacity-70">
                        <p className="text-xs font-bold">No participants yet</p>
                        <p className="text-[11px]">Type a name above or import from spreadsheet.</p>
                      </div>
                    ) : (
                      participants.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between group ${
                            isNeon
                              ? 'bg-[#030712]/80 border-cyan-500/30'
                              : isCosmic
                              ? 'bg-[#040C1A]/80 border-cyan-500/30'
                              : isChampion
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-slate-50/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  item.active !== false
                                    ? THEME_PALETTES[themeId][idx % THEME_PALETTES[themeId].length]
                                    : '#64748b',
                              }}
                            />
                            <span
                              className={`text-xs font-semibold truncate ${
                                item.active === false ? 'line-through opacity-50' : ''
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleToggleActive(item.id)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/10 dark:bg-white/10"
                            >
                              {item.active !== false ? 'Active' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => handleRemoveParticipant(item.id)}
                              className="w-7 h-7 rounded-lg opacity-60 hover:opacity-100 hover:text-red-400 flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GAME SETUP & RULES */}
              {activeTab === 'settings' && (
                <div className="p-5 flex-1 overflow-y-auto space-y-6">
                  {/* Rounds Config */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-bold flex items-center space-x-1.5 ${
                        isNeon ? 'text-pink-400' : isCosmic ? 'text-amber-300' : isChampion ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        <Flame className="w-4 h-4" />
                        <span>How Many Times to Spin? (Rounds)</span>
                      </label>
                      <button
                        onClick={handleResetRounds}
                        className={`text-[11px] font-semibold hover:underline ${
                          isNeon ? 'text-cyan-300' : isCosmic ? 'text-amber-300' : isChampion ? 'text-amber-700' : 'text-purple-600'
                        }`}
                      >
                        Reset Round to 1
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTotalRounds('unlimited')}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                          totalRounds === 'unlimited'
                            ? isNeon
                              ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200'
                              : isCosmic
                              ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                              : isChampion
                              ? 'border-amber-400 bg-amber-100 text-amber-950'
                              : 'border-purple-600 bg-purple-50 text-purple-800'
                            : 'border-transparent bg-black/10 dark:bg-white/10'
                        }`}
                      >
                        Unlimited
                      </button>

                      {[1, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setTotalRounds(num)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                            totalRounds === num
                              ? isNeon
                                ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200'
                                : isCosmic
                                ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                                : isChampion
                                ? 'border-amber-400 bg-amber-100 text-amber-950'
                                : 'border-purple-600 bg-purple-50 text-purple-800'
                              : 'border-transparent bg-black/10 dark:bg-white/10'
                          }`}
                        >
                          {num} {num === 1 ? 'Winner' : 'Spins'}
                        </button>
                      ))}

                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={customRoundsInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomRoundsInput(val);
                          const num = parseInt(val, 10);
                          if (!isNaN(num) && num > 0) setTotalRounds(num);
                        }}
                        placeholder="Custom"
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 text-center font-bold bg-black/5 dark:bg-white/5"
                      />
                    </div>
                  </div>

                  {/* Elimination Mode */}
                  <div className={`pt-4 border-t space-y-2 ${
                    isNeon ? 'border-cyan-500/20' : isCosmic ? 'border-indigo-500/20' : isChampion ? 'border-amber-200' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold">Remove Winner After Spin</h4>
                        <p className="text-[11px] opacity-70">
                          Winner is automatically eliminated from future spins
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eliminationMode}
                          onChange={(e) => setEliminationMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-slate-400/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor: eliminationMode ? themeConfig.colors.primary : undefined,
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Spin Duration */}
                  <div className={`pt-4 border-t space-y-2 ${
                    isNeon ? 'border-cyan-500/20' : isCosmic ? 'border-indigo-500/20' : isChampion ? 'border-amber-200' : 'border-slate-100'
                  }`}>
                    <label className="text-xs font-bold flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Spin Duration: {spinDuration}s</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Fast (3s)', val: 3 },
                        { label: 'Normal (6s)', val: 6 },
                        { label: 'Suspense (9s)', val: 9 },
                        { label: 'Epic (12s)', val: 12 },
                      ].map((dur) => (
                        <button
                          key={dur.val}
                          type="button"
                          onClick={() => setSpinDuration(dur.val)}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                            spinDuration === dur.val
                              ? isNeon
                                ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200'
                                : isCosmic
                                ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                                : isChampion
                                ? 'border-amber-400 bg-amber-100 text-amber-950'
                                : 'border-purple-600 bg-purple-50 text-purple-800'
                              : 'border-transparent bg-black/10 dark:bg-white/10'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WINNERS LOG */}
              {activeTab === 'history' && (
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold">Winners Record</h4>
                      <p className="text-[11px] opacity-70">
                        {winnersHistory.length} total winner{winnersHistory.length === 1 ? '' : 's'} recorded
                      </p>
                    </div>
                    {winnersHistory.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleExportWinnersCSV}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                            isNeon
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                              : isCosmic
                              ? 'bg-amber-950 border-amber-400 text-amber-300'
                              : isChampion
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}
                        >
                          <Download className="w-3 h-3" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Clear winners log?')) setWinnersHistory([]);
                          }}
                          className="text-[11px] font-bold text-red-400 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
                    {winnersHistory.length === 0 ? (
                      <div className="py-16 text-center flex flex-col items-center justify-center space-y-2 opacity-70">
                        <Award className="w-6 h-6 text-amber-400" />
                        <p className="text-xs font-bold">No winners yet</p>
                        <p className="text-[11px]">Spin the wheel to crown your first lucky winner!</p>
                      </div>
                    ) : (
                      winnersHistory.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border shadow-2xs flex items-center justify-between ${
                            isNeon
                              ? 'bg-[#030712]/80 border-cyan-500/30'
                              : isCosmic
                              ? 'bg-[#040C1A]/80 border-cyan-500/30'
                              : isChampion
                              ? 'bg-amber-50/70 border-amber-200'
                              : 'bg-purple-50/50 border-purple-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                                isNeon
                                ? 'bg-cyan-950 text-cyan-300'
                                : isCosmic
                                ? 'bg-amber-950 text-amber-300'
                                : isChampion
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              #{winnersHistory.length - idx}
                            </div>
                            <div>
                              <h5 className="text-xs font-extrabold">{item.name}</h5>
                              <span className="text-[10px] opacity-60">
                                Round {item.roundNumber} • {item.timestamp}
                              </span>
                            </div>
                          </div>
                          <span className="text-amber-400">🏆</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* IMPORT MODAL */}
      <WheelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* WINNER CELEBRATION MODAL */}
      <WinnerModal
        winner={currentWinner}
        roundNumber={currentRoundNumber}
        totalRounds={totalRounds}
        eliminationMode={eliminationMode}
        themeId={themeId}
        onClose={handleCloseWinnerModal}
        onSpinAgain={handleSpinAgain}
        onRemoveWinnerAndSpin={handleRemoveWinnerAndSpin}
      />
    </div>
  );
}
