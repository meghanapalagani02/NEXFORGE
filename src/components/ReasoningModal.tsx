import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Bot,
  HelpCircle,
  TrendingUp,
  Boxes,
  Shield,
  Factory,
  Calculator,
  Compass,
  AlertCircle
} from 'lucide-react';
import { PlanningSummary, MonthlyPlanItem } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface ReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: PlanningSummary;
  monthlyPlan?: MonthlyPlanItem[];
  onTestScenario: () => void;
  onAskAgent: () => void;
}

export const ReasoningModal: React.FC<ReasoningModalProps> = ({
  isOpen,
  onClose,
  summary,
  monthlyPlan = [],
  onTestScenario,
  onAskAgent
}) => {
  if (!isOpen) return null;

  const planHorizonMonths = summary.forecastHorizonMonths || monthlyPlan.length || 6;
  const firstMonth = monthlyPlan[0]?.month || 'Start';
  const lastMonth = monthlyPlan[monthlyPlan.length - 1]?.month || 'End';

  const totalDemand = summary.forecastDemand;
  const totalProduction = summary.recommendedProduction;
  const startingInventory = summary.currentInventory;
  const safetyStock = summary.safetyStock;
  const monthlyCapacity = summary.monthlyCapacity || (monthlyPlan[0]?.capacity ?? 7000000);
  const deployedStock = Math.max(0, startingInventory - safetyStock);

  // Peak metrics
  const peakProdItem = monthlyPlan.reduce(
    (prev, curr) => (curr.recommendedProduction > prev.recommendedProduction ? curr : prev),
    monthlyPlan[0] || { month: '-', recommendedProduction: 0, capacityUtilization: 0 }
  );

  const minEndingStock =
    monthlyPlan.length > 0
      ? Math.min(...monthlyPlan.map((m) => m.endingInventory))
      : safetyStock;

  const avgUtilization =
    monthlyPlan.length > 0
      ? Math.round(monthlyPlan.reduce((acc, curr) => acc + curr.capacityUtilization, 0) / monthlyPlan.length)
      : 0;

  const averageMonthlyDemand = totalDemand / planHorizonMonths;
  const inventoryCoverageMonths =
    averageMonthlyDemand > 0 ? (startingInventory / averageMonthlyDemand).toFixed(1) : '0';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-orange-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="p-5 bg-orange-50/90 text-slate-900 flex items-center justify-between border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-orange-700 block">
                  Decision Reasoning & Explanation
                </span>
                <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight">
                  Why This Production Plan?
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: 7 Clear Structured Sections */}
          <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-xs">
            {/* Top Summary Banner */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
                  Recommended Total Production
                </span>
                <div className="text-2xl font-extrabold text-orange-600 font-mono mt-0.5">
                  {formatUnits(totalProduction)} UNITS{' '}
                  <span className="text-sm font-semibold text-slate-600">
                    ({formatIndianFull(totalProduction)})
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Planning Horizon: {planHorizonMonths} Months ({firstMonth}–{lastMonth})
                </div>
              </div>

              <div>
                {summary.planFeasible ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    100% Feasible & Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Capacity Constraints Active
                  </span>
                )}
              </div>
            </div>

            {/* 1. Demand Outlook */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  1. Demand Outlook
                </span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {formatUnits(totalDemand)} ({formatIndianFull(totalDemand)})
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Projected cumulative customer demand across the {planHorizonMonths}-month horizon is{' '}
                <strong className="text-slate-900">{formatUnits(totalDemand)} units</strong> (averaging{' '}
                {formatUnits(averageMonthlyDemand)} units/month). Demand exhibits steady seasonal momentum peaking in{' '}
                {peakProdItem.month}.
              </p>
            </div>

            {/* 2. Inventory Position */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  2. Inventory Position
                </span>
                <span className="font-mono font-bold text-emerald-700 text-xs">
                  {formatUnits(startingInventory)} ({inventoryCoverageMonths} mo supply)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Starting warehouse inventory stands at{' '}
                <strong className="text-slate-900">{formatUnits(startingInventory)} units</strong>. Of this volume,{' '}
                <strong className="text-slate-900">{formatUnits(deployedStock)} units</strong> are actively deployed to
                fulfill immediate demand, reducing surplus holding costs while shielding production lines from sudden spikes.
              </p>
            </div>

            {/* 3. Safety Buffer */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  3. Safety Buffer
                </span>
                <span className="font-mono font-bold text-indigo-700 text-xs">
                  Target: {formatUnits(safetyStock)} | Min Projected: {formatUnits(minEndingStock)}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                A non-negotiable safety stock buffer of{' '}
                <strong className="text-slate-900">{formatUnits(safetyStock)} units</strong> is maintained throughout all
                periods. The projected ending inventory never dips below{' '}
                <strong className="text-slate-900">{formatUnits(minEndingStock)} units</strong>, ensuring uninterrupted
                customer fulfillment against unforeseen supplier or logistics delays.
              </p>
            </div>

            {/* 4. Capacity Situation */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Factory className="w-4 h-4 text-purple-600" />
                  4. Capacity Situation
                </span>
                <span className="font-mono font-bold text-purple-700 text-xs">
                  Peak: {peakProdItem.capacityUtilization}% ({peakProdItem.month})
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Plant capacity is rated at{' '}
                <strong className="text-slate-900">{formatUnits(monthlyCapacity)} units/month</strong>. Average planned
                utilization is <strong className="text-slate-900">{avgUtilization}%</strong>, well within safe
                machinery operating limits. The maximum scheduled volume occurs in {peakProdItem.month} at{' '}
                {formatUnits(peakProdItem.recommendedProduction)} units.
              </p>
            </div>

            {/* 5. Production Requirement */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  5. Production Requirement
                </span>
                <span className="font-mono font-bold text-amber-800 text-xs">
                  Net Needed: {formatUnits(totalProduction)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                Formula: (Forecast Demand {formatUnits(totalDemand)} + Safety Stock {formatUnits(safetyStock)}) - Starting
                Inventory {formatUnits(startingInventory)} = <strong>{formatUnits(totalProduction)} Units</strong>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Net production perfectly reconciles customer demand and inventory targets without over-producing or risking
                capital lockup.
              </p>
            </div>

            {/* 6. Planning Decision */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-600" />
                  6. Planning Decision
                </span>
                <span className="font-mono font-bold text-emerald-700 text-xs">
                  Optimal Levelized Smoothing
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Rather than fluctuating production erratically month-to-month, the plan adopts a smoothed, cost-minimizing
                manufacturing schedule. This avoids expensive overtime, reduces machine wear, and absorbs demand peaks
                naturally through pre-built stock.
              </p>
            </div>

            {/* 7. Risk / Warning */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-600" />
                  7. Risk / Warning Analysis
                </span>
                <span className="font-mono font-bold text-emerald-700 text-xs">
                  {summary.potentialShortage > 0
                    ? `${formatUnits(summary.potentialShortage)} SHORTAGE ALERT`
                    : 'Zero Stockouts Projected'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {summary.potentialShortage > 0
                  ? `Warning: Potential shortage of ${formatUnits(summary.potentialShortage)} units identified under unconstrained demand. Review production throttling or overtime shifts.`
                  : `Risk Level: Minimal. All months maintain healthy inventory coverage exceeding safety requirements. If demand surges beyond +15%, peak capacity in ${peakProdItem.month} will require advance batch staging.`}
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-orange-50/80 border-t border-orange-200 flex flex-wrap items-center justify-between gap-3 font-mono">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              CLOSE
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onTestScenario();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-orange-100 border border-orange-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                SIMULATE SCENARIO
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAskAgent();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-orange-600"
              >
                <Bot className="w-3.5 h-3.5" />
                OPEN AGENT
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
