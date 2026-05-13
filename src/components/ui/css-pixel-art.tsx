'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

type ClassType = 'mage' | 'merchant' | 'hero';

interface CSSPixelArtProps {
  type: ClassType;
  tier: number;
  size?: number;
  className?: string;
}

/**
 * ALCHEMIST: CSS Box-Shadow Pixel Art System
 * This component renders procedural pixel art based on class and tier.
 */
export const CSSPixelArt = ({ type, tier, size, className }: CSSPixelArtProps) => {
  // Resolution based on tier
  const resolution = useMemo(() => {
    if (tier === 1) return 24;
    if (tier === 2) return 32;
    if (tier === 3) return 40;
    if (tier === 4) return 48;
    return 64;
  }, [tier]);

  const displaySize = size || resolution * 2;

  // Color Palettes
  const palette = useMemo(() => {
    const common = {
      skin: '#FFDBAC',
      eye: '#000000',
      outline: '#1a1a1a',
      white: '#ffffff',
      gold: '#FFD700',
    };

    if (type === 'mage') return {
      ...common,
      primary: '#10b981', // Emerald
      secondary: '#06b6d4', // Cyan
      accent: '#34d399',
      hair: '#1e293b',
      staff: '#78350f',
    };
    if (type === 'merchant') return {
      ...common,
      primary: '#f59e0b', // Orange/Amber
      secondary: '#fbbf24', // Gold
      accent: '#d97706',
      hair: '#451a03',
      clothes: '#7c2d12',
    };
    // hero
    return {
      ...common,
      primary: '#3b82f6', // Blue
      secondary: '#94a3b8', // Silver
      accent: '#ef4444', // Red Cape
      hair: '#fbbf24', // Blonde
      armor: '#cbd5e1',
    };
  }, [type]);

  // Procedural Pixel Generation
  // Instead of manual grid, we use a "Part-based" constructor to reach High-Definition SFC quality.
  const shadow = useMemo(() => {
    const pixels: string[] = [];
    const res = resolution;
    const mid = res / 2;
    
    const addPixel = (x: number, y: number, color: string, blur: number = 0) => {
      pixels.push(`${x}px ${y}px ${blur}px ${color}`);
    };

    const addOutline = (x: number, y: number) => {
      addPixel(x, y, palette.outline);
    };

    // --- Basic Body Construction (Common) ---
    const drawBody = () => {
      const height = res * 0.6;
      const width = res * 0.4;
      const startY = res * 0.3;
      const startX = mid - width / 2;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const px = Math.floor(startX + x);
          const py = Math.floor(startY + y);
          
          // Head (Upper 30%)
          if (y < height * 0.3) {
            if (x > width * 0.2 && x < width * 0.8) {
              addPixel(px, py, palette.skin);
              // Outline
              if (x < width * 0.3 || x > width * 0.7 || y < 1) addOutline(px, py);
            }
          } 
          // Torso
          else {
            if (x > width * 0.1 && x < width * 0.9) {
              addPixel(px, py, palette.primary);
              // Outline
              if (x < width * 0.2 || x > width * 0.8) addOutline(px, py);
            }
          }
        }
      }
    };

    // --- Class Specific Gear ---
    const drawGear = () => {
      if (type === 'mage') {
        // Floating Staff
        const staffX = mid + res * 0.25;
        const staffY = res * 0.2;
        const staffH = res * 0.6;
        for (let y = 0; y < staffH; y++) {
          addPixel(staffX, staffY + y, palette.staff);
          addOutline(staffX - 1, staffY + y);
          addOutline(staffX + 1, staffY + y);
        }
        // Staff Orb
        addPixel(staffX, staffY - 2, palette.secondary, tier >= 1 ? 2 : 0);
        if (tier >= 3) {
          // Magic Aura
          for(let i=0; i<8; i++) {
             const angle = (i / 8) * Math.PI * 2;
             addPixel(staffX + Math.cos(angle)*4, staffY - 2 + Math.sin(angle)*4, palette.accent, 1);
          }
        }
      }

      if (type === 'hero') {
        // Cape
        const capeW = res * 0.5;
        const capeH = res * 0.5;
        for (let y = 0; y < capeH; y++) {
          for (let x = 0; x < capeW; x++) {
            const px = mid - capeW / 2 + x;
            const py = res * 0.4 + y;
            if (x < 2 || x > capeW - 3 || y > capeH - 2) {
               addPixel(px, py, palette.accent);
            }
          }
        }
        // Sword
        const swordX = mid - res * 0.3;
        const swordY = res * 0.3;
        const swordH = res * 0.5;
        for (let y = 0; y < swordH; y++) {
          addPixel(swordX, swordY + y, palette.secondary);
        }
      }

      if (type === 'merchant') {
        // Gold Key (Rank 1+)
        const keyX = mid - res * 0.3;
        const keyY = res * 0.4;
        addPixel(keyX, keyY, palette.gold);
        addPixel(keyX, keyY + 1, palette.gold);
        addPixel(keyX + 1, keyY + 1, palette.gold);
        addPixel(keyX + 1, keyY, palette.gold);
      }
    };

    // --- VFX (Rank 3+) ---
    const drawVFX = () => {
      if (tier < 3) return;
      
      const auraColor = palette.secondary;
      if (type === 'mage') {
        // Magic Circle (Simplified Dot version)
        for (let i = 0; i < 20; i++) {
          const r = res * 0.35;
          const angle = (i / 20) * Math.PI * 2;
          addPixel(mid + Math.cos(angle) * r, mid + Math.sin(angle) * r, auraColor, 1);
        }
      }
      
      if (tier >= 5) {
        // Particles
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * res;
          const y = Math.random() * res;
          addPixel(x, y, palette.white, 2);
        }
      }
    };

    drawBody();
    drawGear();
    drawVFX();

    return pixels.join(',');
  }, [type, tier, resolution, palette]);

  return (
    <div 
      className={cn("relative shrink-0", className)} 
      style={{ 
        width: displaySize, 
        height: displaySize,
        perspective: '1000px'
      }}
    >
      {/* Base Layer */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-[1px] h-[1px]",
          tier >= 4 && "animate-pulse"
        )}
        style={{ 
          boxShadow: shadow,
          transform: `scale(${displaySize / resolution})`,
          transformOrigin: '0 0'
        }}
      />
      
      {/* SVG Layer for Hero's Light Blade (Rank 5) */}
      {type === 'hero' && tier === 5 && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <svg viewBox="0 0 100 100" className="w-full h-full scale-150 -translate-x-1/4 -translate-y-1/4 animate-pulse">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path 
              d="M30 80 L70 20 L80 30 L40 90 Z" 
              fill="rgba(59, 130, 246, 0.6)" 
              filter="url(#glow)"
              className="animate-lightning"
            />
            <path 
              d="M35 75 L65 25" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Merchant's Coin Rain (Rank 5) */}
      {type === 'merchant' && tier === 5 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {[...Array(10)].map((_, i) => (
             <div 
               key={i}
               className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
               style={{ 
                 left: `${Math.random() * 100}%`, 
                 top: `-${Math.random() * 20}%`,
                 animationDelay: `${Math.random() * 2}s`,
                 animationDuration: `${1 + Math.random()}s`
               }}
             />
           ))}
        </div>
      )}

      {/* Mage's Grand Circle (Rank 5) */}
      {type === 'mage' && tier === 5 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-[140%] h-[140%] border border-emerald-500/30 rounded-full animate-spin-slow flex items-center justify-center">
             <div className="w-[80%] h-[80%] border border-cyan-500/20 rounded-full border-dashed" />
           </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lightning {
          0%, 100% { opacity: 0.8; filter: brightness(1.2) drop-shadow(0 0 5px #3b82f6); }
          50% { opacity: 1; filter: brightness(2) drop-shadow(0 0 15px #ffffff); }
        }
      `}</style>
    </div>
  );
};
