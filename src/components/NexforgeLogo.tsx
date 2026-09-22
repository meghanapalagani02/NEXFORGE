import React from 'react';

interface NexforgeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  className?: string;
  glow?: boolean;
}

export const NexforgeLogo: React.FC<NexforgeLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'text-slate-900',
  subtextColor = 'text-orange-600',
  className = '',
  glow = false
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 22;
      case 'sm':
        return 30;
      case 'md':
        return 38;
      case 'lg':
        return 50;
      case 'xl':
        return 68;
      default:
        return 38;
    }
  };

  const dim = getDimension();

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* NexForge Production & Management Matrix Icon */}
      <div
        style={{ width: dim, height: dim }}
        className={`relative shrink-0 flex items-center justify-center ${
          glow ? 'drop-shadow-[0_0_12px_rgba(234,88,12,0.65)]' : ''
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-200 hover:scale-105"
        >
          <defs>
            {/* Base Shield Gradient */}
            <linearGradient id="nf-base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Production Orange Gradient */}
            <linearGradient id="nf-prod-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>

            {/* Management Cyan Data Stream Gradient */}
            <linearGradient id="nf-data-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Core Fusion Glow */}
            <radialGradient id="nf-core-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FED7AA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Isometric Industrial Hexagon Chassis */}
          <polygon
            points="50,4 90,26 90,74 50,96 10,74 10,26"
            fill="url(#nf-base-grad)"
            stroke="#EA580C"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Internal Capacity & Flow Grid Mesh */}
          <path
            d="M50 4 L50 96 M10 26 L90 74 M10 74 L90 26"
            stroke="#334155"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Upper Tier: Demand & Capacity Optimization Arc (Interlocking Production Gear-Chevron) */}
          <path
            d="M50 16 L76 31 L76 46 L50 31 L24 46 L24 31 Z"
            fill="url(#nf-prod-grad)"
          />

          {/* Middle Tier: Assembly Conveyor & Processing Track */}
          <path
            d="M50 38 L76 53 L76 66 L50 51 L24 66 L24 53 Z"
            fill="#EA580C"
            opacity="0.9"
          />

          {/* Lower Tier: Inventory Buffer & Warehouse Stability Foundation */}
          <path
            d="M50 60 L76 75 L50 89 L24 75 Z"
            fill="url(#nf-prod-grad)"
          />

          {/* Live Management Metrics Indicators (3 Integrated Synced Flow Nodes) */}
          {/* Left Node: Demand Ingestion */}
          <circle cx="24" cy="46" r="3.5" fill="#38BDF8" />
          {/* Right Node: Line Output / Supply Chain */}
          <circle cx="76" cy="46" r="3.5" fill="#38BDF8" />
          {/* Top Apex Node: Executive Decision Engine */}
          <circle cx="50" cy="16" r="3.5" fill="#FED7AA" />
          {/* Bottom Buffer Node */}
          <circle cx="50" cy="89" r="3.5" fill="#EA580C" />

          {/* Central Synchronized Forge Core */}
          <circle cx="50" cy="51" r="7" fill="url(#nf-core-pulse)" />
          <circle cx="50" cy="51" r="2.5" fill="#EA580C" />
        </svg>
      </div>

      {/* Brand Text Branding */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-sans font-extrabold tracking-tight text-base sm:text-lg ${textColor}`}>
              NEX<span className="text-orange-600">FORGE</span>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
          </div>
          <span className={`text-[9px] font-sans font-semibold uppercase tracking-wider mt-1 ${subtextColor}`}>
            Decision Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
