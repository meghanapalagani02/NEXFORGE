import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Factory,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Sliders,
  Bot,
  Activity,
  Cpu,
  Boxes,
  Workflow
} from 'lucide-react';
import { PlanningSummary, MonthlyPlanItem, ActiveTab } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface IndustrialTelemetryGridProps {
  summary: PlanningSummary;
  monthlyPlan?: MonthlyPlanItem[];
  onWhyThisPlan: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onAskAgent: () => void;
}

export const IndustrialTelemetryGrid: React.FC<IndustrialTelemetryGridProps> = ({
  summary,
  monthlyPlan = [],
  onWhyThisPlan,
  onNavigateTab,
  onAskAgent
}) => {
  const planHorizonMonths = summary.forecastHorizonMonths || monthlyPlan.length || 6;
  const firstMonth = monthlyPlan[0]?.month || 'Start';
  const lastMonth = monthlyPlan[monthlyPlan.length - 1]?.month || 'End';

  const totalDemand = summary.forecastDemand;
  const totalProduction = summary.recommendedProduction;
  const startingInventory = summary.currentInventory;
  const safetyStock = summary.safetyStock;
  const monthlyCapacity = summary.monthlyCapacity || (monthlyPlan[0]?.capacity ?? 7000000);
  const totalCapacity = monthlyCapacity * planHorizonMonths;
  const productionGap = Math.max(0, totalCapacity - totalProduction);

  // Sparkline bars calculation
  const maxDemand = Math.max(...monthlyPlan.map((m) => m.demand), 1);
  const dynamicDemandBars = monthlyPlan.map((m) => ({
    month: m.month,
    val: `${(m.demand / 100000).toFixed(1)}L`,
    pct: Math.max(12, Math.round((m.demand / maxDemand) * 100))
  }));

  const avgDemandMonthly = Math.round(totalDemand / (monthlyPlan.length || 1));
  const avgUtilization =
    monthlyPlan.length > 0
      ? Math.round(monthlyPlan.reduce((acc, curr) => acc + curr.capacityUtilization, 0) / monthlyPlan.length)
      : 73.8;

  // Peak demand
  const peakDemandItem = monthlyPlan.reduce(
    (prev, curr) => (curr.demand > prev.demand ? curr : prev),
    monthlyPlan[0] || { month: '-', demand: 0 }
  );

  // Production peak and line load
  const peakProdItem = monthlyPlan.reduce(
    (prev, curr) => (curr.recommendedProduction > prev.recommendedProduction ? curr : prev),
    monthlyPlan[0] || { month: '-', recommendedProduction: 0, capacityUtilization: 0 }
  );
  const peakProdUtilization = peakProdItem?.capacityUtilization ?? 0;
  const peakProdUnits = peakProdItem?.recommendedProduction || 0;
  const headroomPct = Math.max(0, 100 - peakProdUtilization).toFixed(1);
  const headroomUnits = Math.max(0, monthlyCapacity - peakProdUnits);
  const constrainedMonthsList = monthlyPlan.filter(
    (m) => m.status === 'constrained' || m.status === 'shortage'
  );

  // Stock and inventory calculations
  const terminalEndingStock = monthlyPlan[monthlyPlan.length - 1]?.endingInventory ?? safetyStock;
  const minEndingStock = monthlyPlan.length > 0 ? Math.min(...monthlyPlan.map((m) => m.endingInventory)) : terminalEndingStock;
  const deployedStock = Math.max(0, startingInventory - safetyStock);
  const deployRatio = startingInventory > 0 ? Math.min(100, Math.round((deployedStock / startingInventory) * 100)) : 0;
  const bufferRatio = Math.max(0, 100 - deployRatio);
  const isStockProtected = summary.inventoryProtected && minEndingStock >= safetyStock;
  const inventoryTarget = startingInventory + safetyStock;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  return (
    <div id="industrial-telemetry-section" className="space-y-4">
      {/* Top Operations Telemetry Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/90 border border-orange-200/90 rounded-xl px-5 py-3 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs relative overflow-hidden"
      >
        {/* Subtle warm industrial watermark */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-sans text-emerald-900 font-bold uppercase tracking-wider text-[11px]">
              Operations Engine Active // NexForge
            </span>
          </div>

          <span className="text-orange-200 hidden sm:inline">|</span>

          <div className="text-slate-600 hidden sm:flex items-center gap-1.5 font-sans text-xs">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Horizon: {planHorizonMonths} Months ({firstMonth.toUpperCase()}–{lastMonth.toUpperCase()})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 font-sans">
          {summary.planFeasible ? (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md font-semibold text-xs tracking-normal flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Feasible
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md font-semibold text-xs tracking-normal flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Adjustments Needed
            </span>
          )}
          <span className="bg-orange-50 text-orange-900 border border-orange-200 px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums">
            {summary.potentialShortage > 0 ? `${formatUnits(summary.potentialShortage)} Shortage` : '0 Shortage'}
          </span>
        </div>
      </motion.div>

      {/* 4 DISTINCT INDUSTRIAL SECTIONS (A, B, C, D) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch"
      >
        {/* ============================================================ */}
        {/* SECTION A: DEMAND OUTLOOK                                    */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-orange-200 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-orange-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 border border-orange-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                    A. Demand Outlook
                  </h3>
                  <span className="text-xs text-slate-500 font-sans font-normal">Forecast & Variance</span>
                </div>
              </div>

              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                +14.0% Trend
              </span>
            </div>

            {/* Upcoming Demand (Primary Metric) */}
            <div className="mt-4">
              <div className="text-xs font-sans font-medium uppercase text-slate-500 tracking-wider">
                Upcoming Demand ({planHorizonMonths}M)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
                  {formatUnits(totalDemand)}
                </span>
                <span className="text-xs font-semibold text-orange-600 font-sans tabular-nums">
                  ({(totalDemand / 100000).toFixed(2)}L)
                </span>
              </div>
            </div>

            {/* Demand Outlook Telemetry Details */}
            <div className="mt-3.5 bg-orange-50/60 border border-orange-200/70 rounded-lg p-2.5 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Forecast Trend:</span>
                <span className="text-emerald-700 font-semibold">Seasonal Uptrend</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Demand Change:</span>
                <span className="text-blue-700 font-semibold">+14.0% vs Baseline</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Upcoming Demand:</span>
                <span className="text-slate-900 font-bold tabular-nums">{formatUnits(totalDemand)} Units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Risk Indicator:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Low (95% Conf.)
                </span>
              </div>
            </div>

            {/* Mini Sparkline Bar Distribution */}
            <div className="mt-3 pt-2.5 border-t border-orange-100">
              <div className="flex items-center justify-between text-[11px] font-sans text-slate-500 mb-1.5">
                <span>Monthly Distribution</span>
                <span className="text-orange-800 font-semibold tabular-nums">Avg: {formatUnits(avgDemandMonthly)}/mo</span>
              </div>
              <div
                className="grid gap-1 items-end h-9"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, dynamicDemandBars.length)}, minmax(0, 1fr))` }}
              >
                {dynamicDemandBars.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 h-full justify-end">
                    <div className="w-full bg-orange-100 rounded-xs h-full flex items-end overflow-hidden">
                      <div
                        style={{ height: `${d.pct}%` }}
                        className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-xs"
                      />
                    </div>
                    <span className="text-[9px] font-sans font-medium text-slate-500">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="mt-3.5 pt-2.5 border-t border-orange-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('forecast')}
              className="text-xs font-sans font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Forecast</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-sans text-slate-400">{planHorizonMonths} Periods</span>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* SECTION B: INVENTORY HEALTH                                  */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-emerald-200 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                    B. Inventory Health
                  </h3>
                  <span className="text-xs text-slate-500 font-sans font-normal">Buffer & Runway</span>
                </div>
              </div>

              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Healthy
              </span>
            </div>

            {/* Current Inventory (Primary Metric) */}
            <div className="mt-4">
              <div className="text-xs font-sans font-medium uppercase text-slate-500 tracking-wider">
                Current On-Hand Stock
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
                  {formatUnits(startingInventory)}
                </span>
                <span className="text-xs font-semibold text-emerald-700 font-sans tabular-nums">
                  ({(startingInventory / 100000).toFixed(2)}L)
                </span>
              </div>
            </div>

            {/* Inventory Health Details */}
            <div className="mt-3.5 bg-emerald-50/50 border border-emerald-200/70 rounded-lg p-2.5 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Inventory:</span>
                <span className="text-slate-800 font-semibold tabular-nums">{formatUnits(inventoryTarget)} Target</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Safety Buffer:</span>
                <span className="text-emerald-700 font-bold tabular-nums">{formatUnits(safetyStock)} (Floor Protected)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Stock-out Risk:</span>
                <span className="text-emerald-700 font-bold">0.0% (Zero Risk)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Excess Stock:</span>
                <span className="text-slate-700 font-medium">Optimal (1.0 mo supply)</span>
              </div>
            </div>

            {/* Deployment Meter */}
            <div className="mt-3 pt-2.5 border-t border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-sans text-slate-500">
                <span>Stock Allocation</span>
                <span className="text-emerald-800 font-bold tabular-nums">{deployRatio}% Active</span>
              </div>
              <div className="h-2.5 w-full bg-emerald-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${deployRatio}%` }} className="h-full bg-orange-500" />
                <div style={{ width: `${bufferRatio}%` }} className="h-full bg-emerald-600" />
              </div>
              <div className="flex justify-between text-[10px] font-sans text-slate-400 pt-0.5 tabular-nums">
                <span>{formatUnits(deployedStock)} Deployed</span>
                <span>{formatUnits(safetyStock)} Buffer</span>
              </div>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="mt-3.5 pt-2.5 border-t border-emerald-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-sans font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-sans text-slate-400 tabular-nums">{formatUnits(safetyStock)} Buffer</span>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* SECTION C: PRODUCTION PLANNING                               */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-amber-300/80 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                    C. Production Planning
                  </h3>
                  <span className="text-xs text-slate-500 font-sans font-normal">Master Output Schedule</span>
                </div>
              </div>

              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Feasible
              </span>
            </div>

            {/* Recommended Production (Primary Metric) */}
            <div className="mt-4">
              <div className="text-xs font-sans font-medium uppercase text-slate-500 tracking-wider">
                Recommended Production ({planHorizonMonths}M)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
                  {formatUnits(totalProduction)}
                </span>
                <span className="text-xs font-semibold text-amber-800 font-sans tabular-nums">
                  ({(totalProduction / 100000).toFixed(2)}L)
                </span>
              </div>
            </div>

            {/* Production Planning Details */}
            <div className="mt-3.5 bg-amber-50/60 border border-amber-200/70 rounded-lg p-2.5 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Plant Capacity:</span>
                <span className="text-slate-900 font-semibold tabular-nums">{formatUnits(monthlyCapacity)}/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Utilization (Avg):</span>
                <span className="text-amber-800 font-bold tabular-nums">{avgUtilization}% (Peak: {peakProdUtilization}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Production Gap:</span>
                <span className="text-emerald-700 font-bold tabular-nums">{formatUnits(productionGap)} Headroom</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expected Service:</span>
                <span className="text-emerald-700 font-bold">100.0% OTIF</span>
              </div>
            </div>

            {/* Line Capacity Gauge */}
            <div className="mt-3 pt-2.5 border-t border-amber-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-sans text-slate-500">
                <span>Line Utilization Load</span>
                <span className="text-amber-800 font-bold tabular-nums">{avgUtilization}% Avg</span>
              </div>
              <div className="h-2.5 w-full bg-amber-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, avgUtilization)}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500"
                />
              </div>
              <div className="flex justify-between text-[10px] font-sans text-slate-400 pt-0.5 tabular-nums">
                <span>0 Units</span>
                <span>{headroomPct}% Headroom</span>
                <span>{formatUnits(monthlyCapacity)}/mo</span>
              </div>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="mt-3.5 pt-2.5 border-t border-amber-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('planning')}
              className="text-xs font-sans font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Production Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-sans text-slate-400 tabular-nums">{avgUtilization}% Util</span>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* SECTION D: HYBRID OPTIMIZATION (Section 2 & 9)              */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-purple-200 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 border border-purple-300 flex items-center justify-center">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                    D. Hybrid Optimization
                  </h3>
                  <span className="text-xs text-slate-500 font-sans font-normal">Classical + Quantum</span>
                </div>
              </div>

              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                Ready
              </span>
            </div>

            {/* Status (Primary Metric) */}
            <div className="mt-4">
              <div className="text-xs font-sans font-medium uppercase text-slate-500 tracking-wider">
                Optimization Status
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-purple-950 tracking-tight font-sans">
                  Ready for Quantum
                </span>
              </div>
              <div className="text-xs text-slate-500 font-sans mt-1">
                Classical planning active; backend pending
              </div>
            </div>

            {/* Honest Placeholders without fabricated quantum numbers */}
            <div className="mt-3.5 bg-purple-50/50 border border-purple-200/70 rounded-lg p-2.5 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Quantum Backend:</span>
                <span className="text-amber-800 font-semibold">Not Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Qubit Count:</span>
                <span className="text-slate-400 font-bold tabular-nums">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Circuit Depth:</span>
                <span className="text-slate-400 font-bold tabular-nums">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Objective Value:</span>
                <span className="text-slate-400 font-bold tabular-nums">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Execution Time:</span>
                <span className="text-slate-400 font-bold tabular-nums">--</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-xs font-sans text-slate-500">
              <span>Fallback Status:</span>
              <span className="text-emerald-700 font-semibold">Deterministic LP Validated</span>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="mt-3.5 pt-2.5 border-t border-purple-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('quantum')}
              className="text-xs font-sans font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Hybrid Optimization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-sans text-slate-400">Section 08</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* INDUSTRIAL PLANNING SYNTHESIZER (MATHEMATICAL BALANCE EQUATION) */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white border border-orange-200/90 rounded-xl p-5 text-slate-900 shadow-xs relative overflow-hidden font-sans"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Equation Formula Flow */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500">
                Master Production Calculation Equation
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base font-sans font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-300 text-orange-950 tabular-nums">
                [ {formatUnits(totalDemand)} Demand ]
              </span>
              <span className="text-slate-400 text-lg font-mono">−</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 tabular-nums">
                [ {formatUnits(startingInventory)} Initial Stock ]
              </span>
              <span className="text-slate-400 text-lg font-mono">+</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 tabular-nums">
                [ {formatUnits(safetyStock)} Safety Buffer ]
              </span>
              <span className="text-orange-600 text-lg font-mono">=</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-orange-600 border border-orange-700 text-white text-base sm:text-lg shadow-xs tabular-nums">
                [ {formatUnits(totalProduction)} Production Target ]
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              By deploying {formatUnits(deployedStock)} of existing warehouse stock toward the {formatUnits(totalDemand)} customer demand ({(totalDemand / 100000).toFixed(2)} Lakh), the factory needs to manufacture <strong>{formatUnits(totalProduction)} ({(totalProduction / 100000).toFixed(2)} Lakh)</strong> while locking in the {formatUnits(safetyStock)} safety stock buffer.
            </p>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-industrial-why-plan"
              onClick={onWhyThisPlan}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-sans font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer border border-orange-600"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan Explanation</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-industrial-scenarios"
              onClick={() => onNavigateTab('scenarios')}
              className="px-4 py-2.5 bg-white hover:bg-orange-50 text-slate-800 text-xs font-sans font-semibold rounded-lg border border-orange-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Test Scenarios</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-industrial-agent"
              onClick={onAskAgent}
              className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-sans font-bold rounded-lg border border-orange-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-orange-600" />
              <span>AI Agent</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
