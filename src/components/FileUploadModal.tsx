import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileSpreadsheet,
  FileCode2,
  X,
  CheckCircle2,
  Download,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  FileText
} from 'lucide-react';
import {
  parseUploadedFile,
  getSampleCSVContent,
  getSampleJSONContent,
  downloadFile,
  ImportResult,
  parseCSV,
  parseJSON
} from '../utils/fileParser';
import { formatUnits } from '../data/planningData';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: (result: ImportResult) => void;
  onResetToBaseline?: () => void;
  isCustomDataLoaded?: boolean;
  currentFilename?: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
  onResetToBaseline,
  isCustomDataLoaded = false,
  currentFilename
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await parseUploadedFile(file);
      if (result.success) {
        onDataImported(result);
        setIsProcessing(false);
        onClose();
      } else {
        setErrorMessage(result.message || 'Failed to process file format.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing uploaded file.');
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so same file can be re-selected if needed
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
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const loadSampleDataset = (type: 'q3q4' | 'automotive' | 'surge') => {
    let filename = '';
    let content = '';

    if (type === 'q3q4') {
      filename = 'Nexforge_Q3_Q4_Plan_2026.csv';
      content = `Month,Demand (Units),Capacity (Units),Safety Stock Target
Jul 2026,6200000,7500000,1200000
Aug 2026,6800000,7500000,1200000
Sep 2026,7100000,7500000,1200000
Oct 2026,6400000,7500000,1200000
Nov 2026,6900000,7500000,1200000
Dec 2026,7400000,7500000,1200000`;
    } else if (type === 'automotive') {
      filename = 'Automotive_Tier1_Schedule.json';
      content = JSON.stringify(
        {
          company: 'Nexforge Automotive Group',
          parameters: { startingInventory: 8000000, safetyStockTarget: 1500000, monthlyCapacity: 8500000 },
          monthlyPlan: [
            { month: 'Jan', demand: 6200000, capacity: 8500000, safetyStock: 1500000 },
            { month: 'Feb', demand: 6600000, capacity: 8500000, safetyStock: 1500000 },
            { month: 'Mar', demand: 7800000, capacity: 8500000, safetyStock: 1500000 },
            { month: 'Apr', demand: 7100000, capacity: 8500000, safetyStock: 1500000 },
            { month: 'May', demand: 7500000, capacity: 8500000, safetyStock: 1500000 },
            { month: 'Jun', demand: 8100000, capacity: 8500000, safetyStock: 1500000 }
          ]
        },
        null,
        2
      );
    } else {
      filename = 'Consumer_Electronics_Surge.csv';
      content = `Month,Demand (Units),Capacity (Units),Safety Stock Target
Jan 2026,5200000,7000000,1000000
Feb 2026,5500000,7000000,1000000
Mar 2026,8200000,7000000,1000000
Apr 2026,7900000,7000000,1000000
May 2026,6300000,7000000,1000000
Jun 2026,5800000,7000000,1000000`;
    }

    const result = filename.endsWith('.json')
      ? parseJSON(content, filename)
      : parseCSV(content, filename);

    if (result.success) {
      onDataImported(result);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl border border-orange-200 shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-slate-900 text-base sm:text-lg">
                  Upload Company Planning Data
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
                  CSV / JSON
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Import demand forecasts, warehouse opening balances, and monthly capacity schedules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Current Loaded Dataset Status */}
          {isCustomDataLoaded && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Custom Dataset Active:{' '}
                  <strong className="text-emerald-950 font-bold">{currentFilename || 'Uploaded Plan'}</strong>
                </span>
              </div>
              {onResetToBaseline && (
                <button
                  onClick={() => {
                    onResetToBaseline();
                    onClose();
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restore Baseline
                </button>
              )}
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-orange-500 bg-orange-100/50 scale-[1.01]'
                : 'border-orange-300/80 bg-orange-50/40 hover:bg-orange-50/80 hover:border-orange-400'
            }`}
          >
            {/* Native Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .json, text/csv, application/json, text/plain"
              onChange={handleInputChange}
              className="hidden"
              id="nexforge-file-input"
            />

            <div className="w-14 h-14 rounded-2xl bg-white border border-orange-200 text-orange-600 flex items-center justify-center shadow-xs">
              <FolderOpen className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="font-mono font-bold text-sm text-slate-900">
                {isProcessing ? 'Processing planning matrix...' : 'Click to browse or drag & drop file'}
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Supports <strong className="text-slate-700 font-mono">.CSV</strong> and{' '}
                <strong className="text-slate-700 font-mono">.JSON</strong> company spreadsheets or planning records
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-slate-700 text-xs font-mono border border-orange-200 shadow-2xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                CSV Format
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-slate-700 text-xs font-mono border border-orange-200 shadow-2xs">
                <FileCode2 className="w-3.5 h-3.5 text-orange-600" />
                JSON Format
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold font-mono">Upload Parsing Error:</strong>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Preset Sample Datasets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Quick-Load Sample Company Datasets
              </span>
              <span className="text-slate-500 text-[11px]">Instant 1-Click Simulation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => loadSampleDataset('q3q4')}
                className="p-3 bg-white hover:bg-orange-50/70 border border-orange-200 rounded-xl text-left transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-mono font-bold text-slate-900 flex items-center justify-between">
                  <span>Q3-Q4 Expansion</span>
                  <ArrowRight className="w-3 h-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  6-Mo Forecast (Jul-Dec)
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
                  ~4.18 Cr Units
                </div>
              </button>

              <button
                onClick={() => loadSampleDataset('automotive')}
                className="p-3 bg-white hover:bg-orange-50/70 border border-orange-200 rounded-xl text-left transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-mono font-bold text-slate-900 flex items-center justify-between">
                  <span>Automotive Tier-1</span>
                  <ArrowRight className="w-3 h-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  High-Cap (85.00L Cap)
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
                  ~4.33 Cr Units
                </div>
              </button>

              <button
                onClick={() => loadSampleDataset('surge')}
                className="p-3 bg-white hover:bg-orange-50/70 border border-orange-200 rounded-xl text-left transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="text-xs font-mono font-bold text-slate-900 flex items-center justify-between">
                  <span>Electronics Surge</span>
                  <ArrowRight className="w-3 h-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  March Peak Stress Test
                </div>
                <div className="text-[10px] text-amber-700 font-mono font-semibold mt-1">
                  ~3.89 Cr Units
                </div>
              </button>
            </div>
          </div>

          {/* Download Blank Templates */}
          <div className="pt-3 border-t border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-500">Need blank templates to populate?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  downloadFile(getSampleCSVContent(), 'nexforge_template.csv', 'text/csv')
                }
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                CSV Template
              </button>
              <button
                onClick={() =>
                  downloadFile(getSampleJSONContent(), 'nexforge_template.json', 'application/json')
                }
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                JSON Template
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
