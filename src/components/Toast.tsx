import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  FileCode2,
  Database,
  ArrowRight
} from 'lucide-react';
import { formatUnits } from '../data/planningData';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  filename?: string;
  fileType?: 'csv' | 'json';
  itemCount?: number;
  totalDemand?: number;
  totalProduction?: number;
  duration?: number; // ms
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`pointer-events-auto rounded-xl border shadow-2xl p-4 sm:p-5 flex flex-col gap-2.5 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-950/10'
                : toast.type === 'error'
                ? 'bg-white/95 border-red-300 text-slate-900 shadow-red-950/10'
                : 'bg-white/95 border-orange-300 text-slate-900 shadow-orange-950/10'
            }`}
            role="alert"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                    toast.type === 'success'
                      ? 'bg-emerald-600 text-white'
                      : toast.type === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  {toast.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : toast.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono font-bold text-sm tracking-tight text-slate-900">
                      {toast.title}
                    </h4>
                    {toast.fileType && (
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
                        .{toast.fileType.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {toast.filename && (
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-500 mt-0.5 truncate max-w-[240px]">
                      {toast.fileType === 'json' ? (
                        <FileCode2 className="w-3 h-3 text-orange-600 shrink-0" />
                      ) : (
                        <FileSpreadsheet className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate font-semibold text-slate-700">{toast.filename}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              {toast.message}
            </p>

            {/* Stats chips if success */}
            {toast.type === 'success' && (toast.totalDemand || toast.itemCount) && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
                {toast.itemCount && (
                  <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                    <span className="text-slate-400">Horizon:</span>{' '}
                    <strong className="text-slate-900">{toast.itemCount} Months</strong>
                  </div>
                )}
                {toast.totalDemand && (
                  <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                    <span className="text-emerald-600">Demand:</span>{' '}
                    <strong className="text-emerald-950">{formatUnits(toast.totalDemand)}</strong>
                  </div>
                )}
                {toast.totalProduction && (
                  <div className="px-2 py-1 bg-orange-50 border border-orange-200 rounded text-[11px] text-orange-900">
                    <span className="text-orange-600">Prod:</span>{' '}
                    <strong className="text-orange-950">{formatUnits(toast.totalProduction)}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Countdown animation bar */}
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-full mt-1">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                className={`h-full ${
                  toast.type === 'success'
                    ? 'bg-emerald-500'
                    : toast.type === 'error'
                    ? 'bg-red-500'
                    : 'bg-orange-500'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
