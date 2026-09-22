import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  Factory,
  Sliders,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Upload,
  FileSpreadsheet,
  FileCode2,
  RefreshCw,
  FolderOpen,
  Clapperboard
} from 'lucide-react';
import { ActiveTab } from '../types/planning';
import { NexforgeLogo } from './NexforgeLogo';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  planFeasible: boolean;
  onOpenUploadModal?: () => void;
  onDirectFileUpload?: (file: File) => void;
  isCustomDataLoaded?: boolean;
  currentCustomFilename?: string;
  onResetToBaseline?: () => void;
  onReplayIntro?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  planFeasible,
  onOpenUploadModal,
  onDirectFileUpload,
  isCustomDataLoaded = false,
  currentCustomFilename,
  onResetToBaseline,
  onReplayIntro
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const navItems: { id: ActiveTab; label: string; code: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', code: '01', icon: LayoutDashboard },
    { id: 'forecast', label: 'Demand Forecast', code: '02', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', code: '03', icon: Boxes },
    { id: 'planning', label: 'Production Planning', code: '04', icon: Factory },
    { id: 'scheduling', label: 'Production Scheduling', code: '05', icon: Layers },
    { id: 'scenarios', label: 'Scenario Simulator', code: '06', icon: Sliders },
    { id: 'agent', label: 'Planning Explainer', code: '07', icon: Bot },
    { id: 'quantum', label: 'Hybrid Optimization', code: '08', icon: Cpu }
  ];

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onDirectFileUpload) {
      onDirectFileUpload(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && onDirectFileUpload) {
      onDirectFileUpload(files[0]);
    }
  };

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-[#FFFBF7] text-slate-800 flex flex-col shrink-0 border-r border-orange-200 select-none z-30 transition-all duration-200"
    >
      {/* Hidden file input element */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, .json, text/csv, application/json, text/plain"
        onChange={handleFileInputChange}
        className="hidden"
        id="sidebar-file-input"
      />

      {/* Brand & App Title */}
      <div className="p-4 flex items-center justify-between border-b border-orange-200 bg-orange-50/60">
        <NexforgeLogo size="md" showText={true} />
        {onReplayIntro && (
          <button
            type="button"
            onClick={onReplayIntro}
            title="Replay System Intro Animation"
            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-100/70 rounded-md transition-colors cursor-pointer"
          >
            <Clapperboard className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Facility Context Box */}
      <div className="p-3 mx-3 my-3 bg-white border border-orange-200/90 rounded-lg text-xs font-sans shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold tracking-wider uppercase">
          <span>FACILITY</span>
          <span className="text-emerald-700 font-bold">PLANT 04 // ACTIVE</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 text-xs mt-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase">CAPACITY</span>
          <span className="text-slate-900 font-bold tabular-nums">70.00 Lakh/mo LIMIT</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-sans font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-sans transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-orange-100 text-orange-950 border border-orange-300 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/70 font-medium border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-orange-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.id === 'agent' && (
                <span className="ml-auto text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-orange-200/80 text-orange-900 border border-orange-300">
                  AI
                </span>
              )}
              {item.id === 'scenarios' && (
                <span className="ml-auto text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  SIM
                </span>
              )}
            </motion.button>
          );
        })}

        {/* File Upload Component in Sidebar */}
        <div className="pt-3">
          <div className="px-3 pb-1.5 text-[10px] font-sans font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>DATA INGESTION</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold">CSV/JSON</span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-lg border border-dashed transition-all cursor-pointer text-left space-y-1.5 ${
              isDragging
                ? 'bg-orange-100/70 border-orange-500'
                : isCustomDataLoaded
                ? 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50'
                : 'bg-white border-orange-300/80 hover:bg-orange-50/60 hover:border-orange-400'
            }`}
            title="Click or drag CSV/JSON file to upload"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-slate-900">
                <Upload className="w-3.5 h-3.5 text-orange-600" />
                <span>Upload File</span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans font-medium">Browse</span>
            </div>

            <p className="text-[11px] text-slate-500 line-clamp-1 font-sans">
              {isCustomDataLoaded
                ? `Loaded: ${currentCustomFilename || 'Custom File'}`
                : 'Drop CSV or JSON file here'}
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px] font-sans">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenUploadModal) onOpenUploadModal();
                  else fileInputRef.current?.click();
                }}
                className="text-orange-700 font-semibold hover:underline"
              >
                Upload Wizard →
              </button>

              {isCustomDataLoaded && onResetToBaseline && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetToBaseline();
                  }}
                  className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                  title="Reset to default baseline"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer System Telemetry Status */}
      <div className="p-4 border-t border-orange-200 bg-orange-50/40 font-sans">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
          <span className="text-slate-900 text-xs font-bold tracking-tight">SOLVER TELEMETRY</span>
        </div>
        <div className="text-[11px] text-emerald-700 mt-1.5 flex items-center justify-between">
          <span className="text-slate-500">Feasibility:</span>
          <span className="font-bold">{planFeasible ? '100% Locked' : 'Check Plan'}</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
          <span>Source Data:</span>
          <span className="text-slate-800 font-semibold truncate max-w-[100px]">
            {isCustomDataLoaded ? currentCustomFilename || 'Imported' : 'Default Base'}
          </span>
        </div>
      </div>
    </aside>
  );
};
