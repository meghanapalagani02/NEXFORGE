import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Boxes,
  Factory,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  RotateCcw,
  Sliders,
  ArrowRight,
  Info,
  Package,
  FileSpreadsheet,
  Zap,
  Check
} from 'lucide-react';
import {
  AgentProductionPlanResult,
  PlanningAgentInputState,
  ScenarioPresetOption
} from '../../types/agentPlanning';
import {
  SCENARIO_PRESETS,
  runPlanningEngine
} from '../../utils/agentCalculations';
import {
  formatUnits,
  formatNumber,
  formatIndianUnitsFull
} from '../../data/planningData';
import { MonthlyPlanItem, PlanningSummary } from '../../types/planning';

interface PlanningReportProps {
  planResult: AgentProductionPlanResult;
  inputs: PlanningAgentInputState;
  onModifyInputs: () => void;
  onApplyToDashboard?: (monthlyPlan: MonthlyPlanItem[], summary: PlanningSummary) => void;
}

export const PlanningReport: React.FC<PlanningReportProps> = ({
  planResult,
  inputs,
  onModifyInputs,
  onApplyToDashboard
}) => {
  const { executiveSummary, monthlyPlan, rawMaterialAnalysis, capacityAnalysis, riskAnalysis, aiExplanationWhyThisPlan, managementRecommendations, product, horizon } = planResult;

  // What-If Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('base');
  const [isAppliedToDashboard, setIsAppliedToDashboard] = useState<boolean>(false);

  // Active Scenario Computation
  const activeScenario = SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0];

  const scenarioResult = React.useMemo(() => {
    if (selectedScenarioId === 'base') return planResult;

    // Apply multiplier to demand & capacity
    const modifiedInputs: PlanningAgentInputState = {
      ...inputs,
      demand: {
        ...inputs.demand,
        monthlyDemands: inputs.demand.monthlyDemands.map((m) => ({
          ...m,
          demand: Math.round(m.demand * activeScenario.demandMultiplier)
        }))
      },
      capacity: {
        ...inputs.capacity,
        customMaxCapacityOverride: Math.round(
          capacityAnalysis.monthlyMaxCapacity * activeScenario.capacityMultiplier
        )
      }
    };

    return runPlanningEngine(modifiedInputs);
  }, [selectedScenarioId, inputs, planResult, activeScenario, capacityAnalysis.monthlyMaxCapacity]);

  // Chart Data Preparation
  const chartData = (selectedScenarioId === 'base' ? monthlyPlan : scenarioResult.monthlyPlan).map((m) => ({
    month: m.month,
    demand: m.forecastDemand,
    production: m.recommendedProduction,
    inventory: m.expectedClosingInventory,
    capacity: scenarioResult.capacityAnalysis.monthlyMaxCapacity
  }));

  // Handle Apply to Dashboard
  const handleApply = () => {
    if (onApplyToDashboard) {
      onApplyToDashboard(
        scenarioResult.appliedMonthlyPlanItems,
        scenarioResult.appliedToSystemSummary
      );
      setIsAppliedToDashboard(true);
      setTimeout(() => setIsAppliedToDashboard(false), 3500);
    }
  };

  // Handle Export / Print
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Month',
      'Forecast Demand',
      'Opening Inventory',
      'Recommended Production',
      'Expected Closing Inventory',
      'Capacity Utilization (%)',
      'Status'
    ];
    const rows = monthlyPlan.map((m) => [
      m.month,
      m.forecastDemand,
      m.openingInventory,
      m.recommendedProduction,
      m.expectedClosingInventory,
      `${m.capacityUtilization}%`,
      m.status
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nexforge_AI_Production_Plan_${product.productId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="bg-white border border-orange-200/90 rounded-xl p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-[10px] font-mono font-bold">
              AI PRODUCTION PLAN // {horizon}
            </span>
            <span className="text-slate-400 text-xs font-mono">Generated Live</span>
          </div>
          <h2 className="font-mono text-base sm:text-lg font-bold text-slate-900">
            {product.productName} ({product.productId})
          </h2>
          <p className="text-xs text-slate-600 font-sans">
            Category: <span className="font-semibold text-slate-800">{product.productCategory}</span> • Strategy: <span className="font-semibold text-slate-800">{product.productionType}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onModifyInputs}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-semibold rounded-lg border border-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Modify Inputs</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3 py-2 bg-white hover:bg-orange-50 text-orange-900 text-xs font-mono font-semibold rounded-lg border border-orange-300 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-white hover:bg-orange-50 text-slate-800 text-xs font-mono font-semibold rounded-lg border border-orange-300 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>

          {onApplyToDashboard && (
            <button
              type="button"
              onClick={handleApply}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all ${
                isAppliedToDashboard
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xs'
              }`}
            >
              {isAppliedToDashboard ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Applied to Dashboard!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply to Global Dashboard</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SECTION 9: EXECUTIVE SUMMARY (7 KEY METRICS) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>A. Executive Summary & Production Outcomes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 font-mono">
          {/* 1. Forecasted Demand */}
          <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Forecasted Demand</span>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {formatUnits(executiveSummary.totalForecastDemand)}
            </div>
            <div className="text-[10px] text-slate-400">
              {formatNumber(executiveSummary.totalForecastDemand)} units
            </div>
          </div>

          {/* 2. Recommended Production */}
          <div className="bg-orange-50/80 p-3.5 rounded-xl border border-orange-300 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-orange-950">Recommended Output</span>
            <div className="text-sm sm:text-base font-bold text-orange-700">
              {formatUnits(executiveSummary.totalRecommendedProduction)}
            </div>
            <div className="text-[10px] text-orange-800 font-semibold">
              Net Target for Horizon
            </div>
          </div>

          {/* 3. Opening Inventory */}
          <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Current Inventory</span>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {formatUnits(executiveSummary.currentInventory)}
            </div>
            <div className="text-[10px] text-slate-500">
              {formatUnits(executiveSummary.usableInventory)} usable
            </div>
          </div>

          {/* 4. Expected Ending Inventory */}
          <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Expected Ending Stock</span>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {formatUnits(executiveSummary.expectedEndingInventory)}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              Buffer Protected
            </div>
          </div>

          {/* 5. Capacity Utilization */}
          <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Avg Capacity Load</span>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {executiveSummary.averageCapacityUtilization}%
            </div>
            <div className="text-[10px] text-slate-400">
              Peak: {executiveSummary.peakCapacityUtilization}%
            </div>
          </div>

          {/* 6. Stock-out Risk */}
          <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Stock-out Risk</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  executiveSummary.stockoutRisk === 'High'
                    ? 'bg-rose-500'
                    : executiveSummary.stockoutRisk === 'Medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  executiveSummary.stockoutRisk === 'High'
                    ? 'text-rose-600'
                    : executiveSummary.stockoutRisk === 'Medium'
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {executiveSummary.stockoutRisk.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Demand Coverage</div>
          </div>

          {/* 7. Overproduction Risk */}
          <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Overproduction Risk</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  executiveSummary.overproductionRisk === 'High'
                    ? 'bg-rose-500'
                    : executiveSummary.overproductionRisk === 'Medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  executiveSummary.overproductionRisk === 'High'
                    ? 'text-rose-600'
                    : executiveSummary.overproductionRisk === 'Medium'
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {executiveSummary.overproductionRisk.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Warehouse Cap</div>
          </div>
        </div>
      </div>

      {/* SECTION 10 & 11: DEMAND FORECAST VISUALIZER + PRODUCTION RECOMMENDATION TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Demand & Production Comparison Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                B. Demand Forecast & Production Plan
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {horizon} Comparison
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontFamily="monospace" />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 text-xs font-mono shadow-xl space-y-1">
                          <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
                            {label}
                          </div>
                          {payload.map((p: any) => (
                            <div key={p.name} className="flex justify-between gap-4">
                              <span className="text-slate-400 capitalize">{p.name}:</span>
                              <span className="font-bold">{formatUnits(p.value)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <ReferenceLine
                  y={scenarioResult.capacityAnalysis.monthlyMaxCapacity}
                  stroke="#ea580c"
                  strokeDasharray="4 4"
                  label={{ value: 'Capacity Limit', fill: '#ea580c', fontSize: 10, position: 'top' }}
                />
                <Bar dataKey="demand" name="Forecast Demand" fill="#fdba74" radius={[4, 4, 0, 0]} />
                <Bar dataKey="production" name="Recommended Output" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="inventory"
                  name="Closing Stock"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 font-sans mt-auto border-t border-orange-100 pt-2">
            Visual comparison tracks forecasted demand against recommended production batches and expected ending warehouse buffer.
          </p>
        </div>

        {/* Production Recommendation Table */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                C. Production Recommendation Schedule
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Calculated Schedule
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-orange-200 bg-orange-50/70 text-slate-700 text-[11px]">
                  <th className="py-2.5 px-2.5 text-left">Month</th>
                  <th className="py-2.5 px-2.5 text-right">Forecast</th>
                  <th className="py-2.5 px-2.5 text-right">Opening</th>
                  <th className="py-2.5 px-2.5 text-right font-bold text-orange-950">Recommended</th>
                  <th className="py-2.5 px-2.5 text-right">Closing</th>
                  <th className="py-2.5 px-2.5 text-right">Util (%)</th>
                  <th className="py-2.5 px-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {monthlyPlan.map((row) => (
                  <tr key={row.month} className="hover:bg-orange-50/40">
                    <td className="py-2.5 px-2.5 font-bold text-slate-900">{row.month}</td>
                    <td className="py-2.5 px-2.5 text-right text-slate-700">{formatUnits(row.forecastDemand)}</td>
                    <td className="py-2.5 px-2.5 text-right text-slate-500">{formatUnits(row.openingInventory)}</td>
                    <td className="py-2.5 px-2.5 text-right font-bold text-orange-700">{formatUnits(row.recommendedProduction)}</td>
                    <td className="py-2.5 px-2.5 text-right text-slate-900 font-semibold">{formatUnits(row.expectedClosingInventory)}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono">{row.capacityUtilization}%</td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          row.status === 'safe'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'constrained'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-orange-50/60 border border-orange-200 rounded-lg text-[11px] font-mono text-slate-700 flex items-center justify-between">
            <span>Total Production Run: <strong>{formatUnits(executiveSummary.totalRecommendedProduction)}</strong></span>
            <span>Safety Stock Target: <strong>{formatUnits(inputs.inventory.safetyStock)}</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 12 & 13: INVENTORY ANALYSIS + RAW MATERIAL BOM TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inventory Analysis Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                D. Inventory Depletion & Runway Analysis
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                planResult.inventoryAnalysis.status === 'SAFE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              STATUS: {planResult.inventoryAnalysis.status}
            </span>
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            {planResult.inventoryAnalysis.detailedExplanation}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Safety Stock Violations</span>
              <div className="text-sm font-bold text-slate-900">
                {planResult.inventoryAnalysis.safetyStockViolationsCount === 0 ? (
                  <span className="text-emerald-700">0 Periods (Clean)</span>
                ) : (
                  <span className="text-amber-600">{planResult.inventoryAnalysis.safetyStockViolationsCount} Periods Below Target</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Reorder Trigger</span>
              <div className="text-sm font-bold text-slate-900">
                {planResult.inventoryAnalysis.reorderRequired ? (
                  <span className="text-orange-700">Triggered in {planResult.inventoryAnalysis.reorderMonthTrigger || 'Month 2'}</span>
                ) : (
                  <span className="text-emerald-700">Buffer Sufficient</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Material Analysis Table */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                E. Bill of Materials (BOM) & Material Availability Analysis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {rawMaterialAnalysis.length} BOM Items Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-orange-200 bg-orange-50/70 text-slate-700 text-[11px]">
                  <th className="py-2.5 px-2.5 text-left">Material</th>
                  <th className="py-2.5 px-2.5 text-right">Available</th>
                  <th className="py-2.5 px-2.5 text-right">Required</th>
                  <th className="py-2.5 px-2.5 text-right">Shortage</th>
                  <th className="py-2.5 px-2.5 text-right">Lead Time</th>
                  <th className="py-2.5 px-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {rawMaterialAnalysis.map((item) => (
                  <tr key={item.material.id} className="hover:bg-orange-50/40">
                    <td className="py-2.5 px-2.5">
                      <div className="font-semibold text-slate-900">{item.material.name}</div>
                      <div className="text-[10px] text-slate-400">{item.material.supplierStatus}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono">{formatNumber(item.netAvailable)} {item.material.unit}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">{formatNumber(item.totalRequiredForPlan)} {item.material.unit}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono">
                      {item.shortageQuantity > 0 ? (
                        <span className="font-bold text-rose-600">-{formatNumber(item.shortageQuantity)} {item.material.unit}</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">{item.material.supplierLeadTimeDays}d</td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          item.recommendedAction === 'Sufficient'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.recommendedAction === 'Reorder'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.recommendedAction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 14 & 15: CAPACITY & BOTTLENECK ANALYSIS + PRODUCTION RISK MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Capacity Analysis */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                F. Capacity & Bottleneck Analysis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Shop Floor Telemetry
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-orange-200">
              <span className="text-slate-600">Monthly Capacity Limit:</span>
              <span className="font-bold text-slate-900">{formatUnits(capacityAnalysis.monthlyMaxCapacity)}/mo</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-orange-200">
              <span className="text-slate-600">Total Horizon Capacity:</span>
              <span className="font-bold text-slate-900">{formatUnits(capacityAnalysis.totalHorizonCapacity)}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-orange-200">
              <span className="text-slate-600">Workforce Efficiency:</span>
              <span className="font-bold text-slate-900">{capacityAnalysis.workforceUtilizationPct}%</span>
            </div>
            <div className="p-2.5 bg-orange-50/70 rounded-lg border border-orange-200 text-slate-800">
              <div className="text-[10px] uppercase font-bold text-orange-950">Primary Bottleneck Cell</div>
              <div className="font-semibold text-xs mt-0.5">{capacityAnalysis.bottleneckMachineDescription}</div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-sans">
            <div className="font-mono text-[10px] uppercase font-bold text-slate-500">Recommended Capacity Actions</div>
            {capacityAnalysis.recommendedActions.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Monitor */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                G. Production Risk Monitor (Causal Diagnostic)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              5 Risk Dimensions
            </span>
          </div>

          <div className="space-y-2.5">
            {riskAnalysis.map((r) => (
              <div
                key={r.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                  r.level === 'High'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : r.level === 'Medium'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-orange-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-black/5">
                  <span className="font-bold">{r.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      r.level === 'High'
                        ? 'bg-rose-600 text-white'
                        : r.level === 'Medium'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {r.level} Risk
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-700 mt-1.5 leading-relaxed">
                  <strong>Why:</strong> {r.whyExplanation}
                </p>
                <div className="text-[11px] font-sans text-slate-600 mt-1">
                  <strong>Mitigation:</strong> {r.mitigationAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 16 & 17: AI EXPLANATION ("WHY THIS PLAN?") + MANAGEMENT RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Explanation */}
        <div className="lg:col-span-7 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-orange-400">
              H. AI Explanation — Why This Plan?
            </h3>
          </div>

          <div className="space-y-3 text-xs font-sans leading-relaxed text-slate-300">
            <div>
              <strong className="text-white font-mono text-[11px] block uppercase text-orange-300">1. Operational Situation:</strong>
              <p className="mt-0.5">{aiExplanationWhyThisPlan.situation}</p>
            </div>
            <div>
              <strong className="text-white font-mono text-[11px] block uppercase text-orange-300">2. Demand Rationale:</strong>
              <p className="mt-0.5">{aiExplanationWhyThisPlan.forecastRationale}</p>
            </div>
            <div>
              <strong className="text-white font-mono text-[11px] block uppercase text-orange-300">3. Inventory Optimization:</strong>
              <p className="mt-0.5">{aiExplanationWhyThisPlan.inventoryLogic}</p>
            </div>
            <div>
              <strong className="text-white font-mono text-[11px] block uppercase text-orange-300">4. Capacity & Material Balancing:</strong>
              <p className="mt-0.5">{aiExplanationWhyThisPlan.capacityLogic} {aiExplanationWhyThisPlan.materialLogic}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-200">
            <span className="text-orange-400 font-bold">Mathematical Proof:</span> {aiExplanationWhyThisPlan.summaryProof}
          </div>
        </div>

        {/* Management Recommendations */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                I. Management Action Directives
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Prioritized
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {managementRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg border border-orange-200 bg-orange-50/40 space-y-1 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rec.action}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      rec.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-600">{rec.reason}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-orange-100">
                  <span>Category: {rec.category}</span>
                  <span className="text-orange-700 font-semibold">{rec.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 19: WHAT-IF / SCENARIO SIMULATOR */}
      <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-orange-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              J. Scenario Simulator — What-If Stress Testing
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Compare Current Plan vs Scenario Plan
          </span>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedScenarioId(preset.id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedScenarioId === preset.id
                  ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-orange-200 hover:bg-orange-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Scenario Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Scenario Description</span>
            <p className="text-xs text-slate-800 font-sans">{activeScenario.description}</p>
          </div>

          <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Total Demand Delta</span>
            <div className="text-sm font-bold text-slate-900">
              {formatUnits(scenarioResult.executiveSummary.totalForecastDemand)}
            </div>
            <div className="text-[10px] text-slate-500">
              Base: {formatUnits(planResult.executiveSummary.totalForecastDemand)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Recommended Output Delta</span>
            <div className="text-sm font-bold text-orange-700">
              {formatUnits(scenarioResult.executiveSummary.totalRecommendedProduction)}
            </div>
            <div className="text-[10px] text-slate-500">
              Base: {formatUnits(planResult.executiveSummary.totalRecommendedProduction)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Scenario Feasibility</span>
            <div className="text-sm font-bold">
              {scenarioResult.executiveSummary.isFeasible ? (
                <span className="text-emerald-700">100% Feasible</span>
              ) : (
                <span className="text-rose-600">Capacity Bottleneck</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">
              Peak: {scenarioResult.executiveSummary.peakCapacityUtilization}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
