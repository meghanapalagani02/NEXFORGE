import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FastForward, ArrowRight } from 'lucide-react';
import { NexforgeLogo } from './NexforgeLogo';

interface NexforgeIntroProps {
  onComplete: () => void;
}

export const NexforgeIntro: React.FC<NexforgeIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Soft, subtle chime tone
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignored if autoplay is restricted
    }
  };

  useEffect(() => {
    playChime();

    // Fast, smooth timeline (1.8 seconds total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimeout);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-[#FFF8F1] text-slate-900 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden cursor-pointer"
      onClick={onComplete}
    >
      {/* Background Subtle Warm Radial Ambient Aura */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Bar: Minimal Skip */}
      <div className="w-full max-w-4xl flex items-center justify-end z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-orange-50 border border-orange-200 text-slate-600 hover:text-orange-700 text-xs font-mono font-medium transition-all shadow-2xs backdrop-blur-xs cursor-pointer"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5 text-orange-600" />
        </button>
      </div>

      {/* Center Stage: Minimal, Elegant Brand Focus */}
      <div className="flex flex-col items-center justify-center my-auto z-10 max-w-md w-full text-center">
        {/* Clean Logo Emblem */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 rounded-2xl bg-white border border-orange-200 shadow-xl shadow-orange-950/5 flex items-center justify-center mb-6"
        >
          <NexforgeLogo size="xl" glow showText={false} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-mono font-extrabold tracking-[0.25em] text-slate-900"
        >
          NEXFORGE
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 tracking-[0.2em] uppercase mt-2"
        >
          Production & Operations Intelligence
        </motion.p>

        {/* Minimal 3-Pillar Linear Dot Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center gap-2 mt-4 text-[11px] font-mono text-slate-400"
        >
          <span className="text-orange-700 font-medium">Demand</span>
          <span>•</span>
          <span className="text-orange-700 font-medium">Capacity</span>
          <span>•</span>
          <span className="text-orange-700 font-medium">Inventory</span>
        </motion.div>

        {/* Sleek Minimal Progress Line */}
        <div className="w-48 h-1 bg-orange-100 rounded-full overflow-hidden mt-6 border border-orange-200/60">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-[11px] font-mono text-slate-400 z-10">
        Click anywhere to continue
      </div>
    </motion.div>
  );
};
