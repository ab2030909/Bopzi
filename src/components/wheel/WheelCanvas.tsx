'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '@/lib/audio';
import { ThemeId, THEMES } from '@/types/theme';

export interface WheelItem {
  id: string;
  name: string;
  color?: string;
  weight?: number;
  active?: boolean;
}

export const THEME_PALETTES: Record<ThemeId, string[]> = {
  'party-pop': [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', 
    '#06B6D4', '#F43F5E', '#84CC16', '#6366F1', '#D946EF'
  ],
  'neon-arcade': [
    '#00F0FF', '#FF007A', '#FFE600', '#00FF66', '#BD00FF', 
    '#FF3B00', '#00E5FF', '#FF0055', '#76FF03', '#9D00FF'
  ],
  'cosmic-quest': [
    '#4F46E5', '#06B6D4', '#9333EA', '#2563EB', '#EC4899', 
    '#14B8A6', '#8B5CF6', '#38BDF8', '#A855F7', '#0284C7'
  ],
  'champion-mode': [
    '#047857', '#D97706', '#1D4ED8', '#DC2626', '#065F46', 
    '#B45309', '#2563EB', '#B91C1C', '#059669', '#7C3AED'
  ],
};

interface WheelCanvasProps {
  items: WheelItem[];
  theme?: ThemeId;
  isSpinning: boolean;
  onSpinEnd: (winner: WheelItem) => void;
  spinDuration?: number; // seconds
  soundEnabled?: boolean;
  size?: number;
  onSpinStart?: () => void;
}

export function WheelCanvas({
  items,
  theme = 'party-pop',
  isSpinning,
  onSpinEnd,
  spinDuration = 6,
  soundEnabled = true,
  size = 520,
  onSpinStart,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastPegCrossedRef = useRef<number>(-1);
  const [needleDeflection, setNeedleDeflection] = useState<number>(0);

  // Active items only
  const activeItems = items.filter((item) => item.active !== false);
  const palette = THEME_PALETTES[theme] || THEME_PALETTES['party-pop'];

  // Main drawing routine
  const drawWheel = useCallback((angle: number, pinBounce: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = size;
    const height = size;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = width / 2 - 24;
    const innerRadius = 52;

    const numSlices = Math.max(1, activeItems.length);
    const sliceAngle = (2 * Math.PI) / numSlices;

    // =========================================================================
    // 1. OUTER RIM & GLOW BASED ON THEME
    // =========================================================================
    ctx.save();
    if (theme === 'neon-arcade') {
      // High-voltage cyber neon glow
      ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#070A13';
      ctx.fill();

      // Cyber Rim Gradient
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      const rimGrad = ctx.createLinearGradient(0, 0, width, height);
      rimGrad.addColorStop(0, '#00F0FF');
      rimGrad.addColorStop(0.5, '#BD00FF');
      rimGrad.addColorStop(1, '#FF007A');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Cyber Inner dark track
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#0B0F19';
      ctx.fill();
    } else if (theme === 'cosmic-quest') {
      // Atmospheric deep space galaxy glow
      ctx.shadowColor = 'rgba(99, 102, 241, 0.65)';
      ctx.shadowBlur = 32;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#040714';
      ctx.fill();

      // Celestial Rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      const rimGrad = ctx.createLinearGradient(0, 0, width, height);
      rimGrad.addColorStop(0, '#6366F1');
      rimGrad.addColorStop(0.5, '#38BDF8');
      rimGrad.addColorStop(1, '#A855F7');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Deep space inner bezel
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#0D1329';
      ctx.fill();
    } else if (theme === 'champion-mode') {
      // Prestigious tournament brushed gold glow
      ctx.shadowColor = 'rgba(245, 158, 11, 0.55)';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#041E15';
      ctx.fill();

      // Gold Bezel Rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      const rimGrad = ctx.createLinearGradient(0, 0, width, height);
      rimGrad.addColorStop(0, '#FBBF24');
      rimGrad.addColorStop(0.3, '#D97706');
      rimGrad.addColorStop(0.7, '#F59E0B');
      rimGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Emerald inner bezel
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#064E3B';
      ctx.fill();
    } else {
      // Party Pop default: Vibrant purple/pink celebration
      ctx.shadowColor = 'rgba(124, 58, 237, 0.4)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();

      // Gradient party rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 14, 0, 2 * Math.PI);
      const rimGrad = ctx.createLinearGradient(0, 0, width, height);
      rimGrad.addColorStop(0, '#A855F7');
      rimGrad.addColorStop(0.5, '#EC4899');
      rimGrad.addColorStop(1, '#6366F1');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Inner rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    }
    ctx.restore();

    // =========================================================================
    // 2. DRAW ROTATED WHEEL SLICES
    // =========================================================================
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    if (activeItems.length === 0) {
      // Empty placeholder
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = theme === 'neon-arcade' ? '#0F172A' : theme === 'cosmic-quest' ? '#0D1329' : theme === 'champion-mode' ? '#064E3B' : '#334155';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add participants to spin!', 0, 0);
    } else {
      activeItems.forEach((item, i) => {
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;
        const sliceColor = item.color || palette[i % palette.length];

        // Slice path
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = sliceColor;
        ctx.fill();

        // Divider styling per theme
        ctx.lineWidth = numSlices > 30 ? 1 : 2.5;
        if (theme === 'neon-arcade') {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        } else if (theme === 'cosmic-quest') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        } else if (theme === 'champion-mode') {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        }
        ctx.stroke();

        // Slice text label
        ctx.save();
        const midA = startA + sliceAngle / 2;
        ctx.rotate(midA);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        // Dynamic font size
        let fontSize = 16;
        if (numSlices > 36) fontSize = 11;
        else if (numSlices > 24) fontSize = 12;
        else if (numSlices > 14) fontSize = 14;
        else if (numSlices <= 6) fontSize = 18;

        const fontFam = theme === 'neon-arcade' ? '"Courier New", monospace' : '"Outfit", "Plus Jakarta Sans", sans-serif';
        ctx.font = `800 ${fontSize}px ${fontFam}`;

        // Text shadow for high contrast
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const maxTextLen = Math.floor(outerRadius * 0.58);
        let displayName = item.name;
        while (ctx.measureText(displayName).width > maxTextLen && displayName.length > 4) {
          displayName = displayName.slice(0, -2) + '…';
        }

        ctx.fillText(displayName, outerRadius - 20, 0);
        ctx.restore();
      });
    }

    // Outer Rim Pegs / Studs (Theme-specific rivets)
    const pegCount = Math.max(12, Math.min(48, activeItems.length || 12));
    const pegAngleStep = (2 * Math.PI) / pegCount;
    for (let p = 0; p < pegCount; p++) {
      const pAngle = p * pegAngleStep;
      const pegX = (outerRadius + 8) * Math.cos(pAngle);
      const pegY = (outerRadius + 8) * Math.sin(pAngle);

      ctx.beginPath();
      ctx.arc(pegX, pegY, 3.5, 0, 2 * Math.PI);
      if (theme === 'neon-arcade') {
        ctx.fillStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 8;
      } else if (theme === 'cosmic-quest') {
        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 6;
      } else if (theme === 'champion-mode') {
        ctx.fillStyle = '#FDE68A';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = '#FDFBF7';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 4;
      }
      ctx.fill();
    }

    ctx.restore(); // Restore rotated wheel

    // =========================================================================
    // 3. CENTER HUB (Theme-specific styling)
    // =========================================================================
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);

    if (theme === 'neon-arcade') {
      ctx.fillStyle = '#070A13';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowBlur = 20;
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00F0FF';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FF007A';
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 15px "Courier New", monospace';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.fillText('SPIN', centerX, centerY);
    } else if (theme === 'cosmic-quest') {
      ctx.fillStyle = '#040714';
      ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
      ctx.shadowBlur = 20;
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38BDF8';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 9, 0, 2 * Math.PI);
      const cGrad = ctx.createLinearGradient(centerX - 35, centerY - 35, centerX + 35, centerY + 35);
      cGrad.addColorStop(0, '#1E1B4B');
      cGrad.addColorStop(1, '#4338CA');
      ctx.fillStyle = cGrad;
      ctx.fill();

      ctx.fillStyle = '#38BDF8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 15px "Outfit", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 8;
      // High-contrast black border/stroke around the text for crystal clear readability
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeText('SPIN', centerX, centerY);
      ctx.fillText('SPIN', centerX, centerY);
    } else if (theme === 'champion-mode') {
      ctx.fillStyle = '#041E15';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
      ctx.shadowBlur = 20;
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 9, 0, 2 * Math.PI);
      const cGrad = ctx.createLinearGradient(centerX - 35, centerY - 35, centerX + 35, centerY + 35);
      cGrad.addColorStop(0, '#064E3B');
      cGrad.addColorStop(1, '#047857');
      ctx.fillStyle = cGrad;
      ctx.fill();

      ctx.fillStyle = '#FDE68A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 15px "Outfit", serif';
      ctx.shadowColor = '#D97706';
      ctx.shadowBlur = 6;
      ctx.fillText('SPIN', centerX, centerY);
    } else {
      // Party Pop
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 16;
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = palette[0];
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 10, 0, 2 * Math.PI);
      const centerGrad = ctx.createLinearGradient(centerX - 40, centerY - 40, centerX + 40, centerY + 40);
      centerGrad.addColorStop(0, '#7C3AED');
      centerGrad.addColorStop(1, '#EC4899');
      ctx.fillStyle = centerGrad;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 15px "Outfit", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.fillText('SPIN', centerX, centerY - 1);
    }
    ctx.restore();

    // =========================================================================
    // 4. TOP INDICATOR NEEDLE (Theme-specific pointer)
    // =========================================================================
    ctx.save();
    ctx.translate(centerX, 20);
    ctx.rotate((pinBounce * Math.PI) / 180);

    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(-14, 2);
    ctx.arc(0, 2, 14, Math.PI, 0, false);
    ctx.lineTo(14, 2);
    ctx.closePath();

    if (theme === 'neon-arcade') {
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#00F0FF';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FF007A';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 2, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF007A';
      ctx.fill();
    } else if (theme === 'cosmic-quest') {
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 14;
      const cGrad = ctx.createLinearGradient(-14, 0, 14, 36);
      cGrad.addColorStop(0, '#6366F1');
      cGrad.addColorStop(0.5, '#38BDF8');
      cGrad.addColorStop(1, '#0284C7');
      ctx.fillStyle = cGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 2, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#A855F7';
      ctx.fill();
    } else if (theme === 'champion-mode') {
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 14;
      const gGrad = ctx.createLinearGradient(-14, 0, 14, 36);
      gGrad.addColorStop(0, '#FDE68A');
      gGrad.addColorStop(0.5, '#F59E0B');
      gGrad.addColorStop(1, '#B45309');
      ctx.fillStyle = gGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#064E3B';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 2, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#047857';
      ctx.fill();
    } else {
      // Party Pop
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      const needleGrad = ctx.createLinearGradient(-14, 0, 14, 36);
      needleGrad.addColorStop(0, '#F59E0B');
      needleGrad.addColorStop(0.5, '#FBBF24');
      needleGrad.addColorStop(1, '#B45309');
      ctx.fillStyle = needleGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 2, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#78350F';
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }, [activeItems, palette, size, theme]);

  // Initial draw
  useEffect(() => {
    drawWheel(currentAngleRef.current, needleDeflection);
  }, [drawWheel, needleDeflection]);

  // Handle spin animation
  useEffect(() => {
    if (!isSpinning || activeItems.length === 0) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startAngle = currentAngleRef.current;
    const winningIndex = Math.floor(Math.random() * activeItems.length);
    const numSlices = activeItems.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    const minRotations = 6;
    const extraRotations = Math.floor(Math.random() * 3);
    const fullSpins = (minRotations + extraRotations) * 2 * Math.PI;

    const normalizedStart = startAngle % (2 * Math.PI);
    const targetSliceAngle = (winningIndex + 0.5) * sliceAngle;
    let targetAngle = -Math.PI / 2 - targetSliceAngle;
    while (targetAngle < normalizedStart) {
      targetAngle += 2 * Math.PI;
    }
    const totalRotation = fullSpins + (targetAngle - normalizedStart);
    const destinationAngle = startAngle + totalRotation;

    const durationMs = spinDuration * 1000;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 4);

    let lastTickTime = 0;
    let pinVibration = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startAngle + totalRotation * easedProgress;
      currentAngleRef.current = currentAngle;

      const currentSliceBoundary = Math.floor(
        ((-Math.PI / 2 - currentAngle) % (2 * Math.PI) + 2 * Math.PI) / sliceAngle
      );

      if (currentSliceBoundary !== lastPegCrossedRef.current) {
        lastPegCrossedRef.current = currentSliceBoundary;
        if (soundEnabled && currentTime - lastTickTime > 40) {
          const speedFactor = 1 - progress * 0.4;
          sounds.playWheelTick(Math.max(0.6, speedFactor));
          lastTickTime = currentTime;
          pinVibration = -18 * (1 - progress * 0.7);
        }
      } else {
        pinVibration *= 0.82;
      }

      drawWheel(currentAngle, pinVibration);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentAngleRef.current = destinationAngle;
        drawWheel(destinationAngle, 0);

        const winner = activeItems[winningIndex];
        if (winner) {
          onSpinEnd(winner);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpinning, activeItems, spinDuration, soundEnabled, onSpinEnd, drawWheel]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="max-w-full h-auto cursor-pointer filter drop-shadow-2xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
        onClick={() => {
          if (!isSpinning && activeItems.length > 0 && onSpinStart) {
            onSpinStart();
          }
        }}
        aria-label="Interactive Spin the Wheel"
      />
    </div>
  );
}
