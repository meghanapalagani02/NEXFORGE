import React, { ChangeEvent, useState } from 'react';
import { motion } from 'motion/react';
import {
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clapperboard,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { PlanningSummary, BackendConnectionStatus } from '../types/planning';
import { UserProfile } from '../types/auth';
import { NexforgeLogo } from './NexforgeLogo';

interface HeaderProps {
  summary: PlanningSummary;
  user?: UserProfile | null;
  activeScenarioName?: string;
  isScenarioModified?: boolean;
  isCustomDataLoaded?: boolean;
  currentCustomFilename?: string;
  backendStatus?: BackendConnectionStatus;
  onResetToBaseline?: () => void;
  onOpenWhyThisPlan?: () => void;
  onAskAgent?: () => void;
  onOpenUploadModal?: () => void;
  onDirectFileUpload?: (file: File) => void;
  onReplayIntro?: () => void;
  onLogout?: () => void;
  onCheckBackendHealth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  user,
  activeScenarioName,
  isScenarioModified = false,
  isCustomDataLoaded = false,
  currentCustomFilename,
  backendStatus,
  onResetToBaseline,
  onOpenWhyThisPlan,
  onAskAgent,
  onOpenUploadModal,
  onDirectFileUpload,
  onReplayIntro,
  onLogout,
  onCheckBackendHealth
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  return (
    <header
      id="app-header"
      className="h-16 bg-white/90 backdrop-blur-xs border-b border-orange-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 text-slate-900 select-none shadow-2xs"
    >
      <div className="flex items-center gap-3">
        <NexforgeLogo size="sm" showText={false} glow />
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-sans tracking-tight leading-tight">
            NEX<span className="text-orange-600">FORGE</span>
          </h2>
        </div>

        {/* Real Backend Engine Status Chip */}
        <div className="hidden md:flex items-center gap-1.5 ml-2">
          {backendStatus?.isConnected ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-sans text-emerald-900"
              title={`Connected to ${backendStatus.url} (${backendStatus.engineName})`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-semibold">Backend: FastAPI Active</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-300 rounded-lg text-xs font-sans text-orange-950"
              title="Integrated high-precision client-side optimization & statistical calculation active."
            >
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              <span className="font-semibold">Hybrid Engine: Live Solver</span>
            </div>
          )}
          {onCheckBackendHealth && (
            <button
              onClick={onCheckBackendHealth}
              disabled={backendStatus?.isChecking}
              className="p-1 text-slate-500 hover:text-orange-600 hover:bg-orange-100 rounded transition-colors cursor-pointer"
              title="Check backend health"
            >
              <RefreshCw className={`w-3 h-3 ${backendStatus?.isChecking ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Replay Cinematic Intro Button */}
        {onReplayIntro && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReplayIntro}
            id="header-replay-intro-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-sans font-semibold text-slate-700 hover:text-orange-700 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Replay System Production Intro Animation"
          >
            <Clapperboard className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden lg:inline">Play Intro</span>
          </motion.button>
        )}

        {/* Custom Dataset Loaded Badge / Baseline Reset */}
        {isCustomDataLoaded && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-sans text-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[120px] lg:max-w-[160px] font-semibold">
              {currentCustomFilename || 'Imported File'}
            </span>
            {onResetToBaseline && (
              <button
                onClick={onResetToBaseline}
                className="ml-1 p-0.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200/60 rounded transition-colors cursor-pointer"
                title="Reset to baseline"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {isScenarioModified ? (
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 px-2.5 sm:px-3 py-1 rounded text-[11px] font-sans font-bold border border-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-amber-600" />
              SCENARIO ACTIVE
            </span>
            {onResetToBaseline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onResetToBaseline}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-semibold text-slate-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition-colors cursor-pointer"
                title="Reset to baseline"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </motion.button>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-800 px-2.5 sm:px-3 py-1 rounded text-[11px] font-sans font-bold border border-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            PLAN FEASIBLE
          </div>
        )}

        {/* User Account / Logout Control */}
        {user && (
          <div className="relative pl-1 sm:pl-2 border-l border-orange-200">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-orange-50/80 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer text-left"
              title="User Account"
            >
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold font-sans">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold font-sans text-slate-900 leading-none truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 font-sans leading-none mt-0.5">
                  {user.provider === 'google' ? 'Google SSO' : 'Email Auth'}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-orange-200 p-2 z-50 text-xs font-sans">
                <div className="p-2 border-b border-orange-100">
                  <div className="font-bold text-slate-900 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-sans font-semibold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded w-fit">
                    <ShieldCheck className="w-3 h-3 text-orange-600" />
                    <span>{user.role}</span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full mt-1 flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

