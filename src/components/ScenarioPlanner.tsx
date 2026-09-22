import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Factory,
  Boxes,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ScenarioParams, ScenarioResult, MonthlyPlanItem, PlanningSummary } from '../types/planning';
import { calculateScenario, formatUnits } from '../data/planningData';

interface ScenarioPlannerProps {
  monthlyPlan?: MonthlyPlanItem[];
  summary?: PlanningSummary;
  onApplyScenario?: (result: ScenarioResult) => void;
  onAskAgentAboutScenario?: (scenarioQuestion: string) => void;
}

export const ScenarioPlanner: React.FC<ScenarioPlannerProps> = ({
  monthlyPlan = [],
  summary,
  onApplyScenario,
  onAskAgentAboutScenario
}) => {
  const baseInventory = summary?.currentInventory ?? 6000000;
  const baseSafetyStock = summary?.safetyStock ?? 1000000;
  const baseCapacity = summary?.monthlyCapacity ?? 7000000;
  const baseDemand = summary?.forecastDemand ?? 35952000;
  const terminalMonth = monthlyPlan[monthlyPlan.length - 1]?.month || 'End';

  const [params, setParams] = useState<ScenarioParams>({
    demandChangePct: 0,
    capacityChangePct: 0,
    currentInventory: baseInventory,
    safetyStockTarget: baseSafetyStock
  });

  // Re-sync when uploaded dataset summary changes
  useEffect(() => {
    setParams({
      demandChangePct: 0,
      capacityChangePct: 0,
      currentInventory: summary?.currentInventory ?? 6000000,
      safetyStockTarget: summary?.safetyStock ?? 1000000
    });
  }, [summary?.currentInventory, summary?.safetyStock, summary?.forecastDemand]);

  const result = calculateScenario(params, monthlyPlan, summary);

  const handleDemandChange = (val: number) => {
    setParams((prev) => ({ ...prev, demandChangePct: val }));
  };

  const handleCapacityChange = (val: number) => {
    setParams((prev) => ({ ...prev, capacityChangePct: val }));
  };

  const handleInventoryChange = (val: number) => {
    setParams((prev) => ({ ...prev, currentInventory: val }));
  };

  const resetToBaseline = () => {
    setParams({
      demandChangePct: 0,
      capacityChangePct: 0,
      currentInventory: baseInventory,
      safetyStockTarget: baseSafetyStock
    });
  };

  const applyPreset = (preset: {
    name: string;
    demand: number;
    capacity: number;
    inventory: number;
  }) => {
    setParams({
      demandChangePct: preset.demand,
      capacityChangePct: preset.capacity,
      currentInventory: preset.inventory,
      safetyStockTarget: baseSafetyStock
    });
  };

  // Status styling helper
  const getStatusBadge = () => {
    switch (result.statusLabel) {
      case 'Feasible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Feasible
          </span>
        );
      case 'Capacity Constrained':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Capacity Constrained
          </span>
        );
      case 'Inventory Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 font-sans">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Inventory Buffer Risk
          </span>
        );
      case 'Critical Shortage':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-300 font-sans">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Critical Shortage
          </span>
        );
    }
  };

  const lowStockPresetVal = Math.round(baseInventory * 0.6);

  return (
    <div
      id="scenario-planner-section"
      className="bg-white rounded-xl border border-orange-200 p-6 shadow-xs space-y-6 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-700 border border-orange-300">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">What if things change?</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Test planning assumptions, simulate capacity fluctuations, or model demand spikes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-sans">
          {/* Quick Presets */}
          <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
          <button
            onClick={() =>
              applyPreset({ name: 'Baseline', demand: 0, capacity: 0, inventory: baseInventory })
            }
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors border cursor-pointer ${
              params.demandChangePct === 0 &&
              params.capacityChangePct === 0 &&
              params.currentInventory === baseInventory
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 text-slate-700 hover:bg-orange-100 border-orange-200'
            }`}
          >
            Baseline
          </button>
          <button
            onClick={() =>
              applyPreset({ name: 'Demand Surge', demand: 20, capacity: 0, inventory: baseInventory })
            }
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors border cursor-pointer ${
              params.demandChangePct === 20 && params.capacityChangePct === 0
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 text-slate-700 hover:bg-orange-100 border-orange-200'
            }`}
          >
            +20% Surge
          </button>
          <button
            onClick={() =>
              applyPreset({ name: 'Plant Outage', demand: 0, capacity: -20, inventory: baseInventory })
            }
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors border cursor-pointer ${
              params.capacityChangePct === -20
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-orange-50 text-slate-700 hover:bg-orange-100 border-orange-200'
            }`}
          >
            -20% Capacity
          </button>
          <button
            onClick={() =>
              applyPreset({ name: 'Low Stock', demand: 10, capacity: 0, inventory: lowStockPresetVal })
            }
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors border cursor-pointer ${
              params.currentInventory === lowStockPresetVal
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-orange-50 text-slate-700 hover:bg-orange-100 border-orange-200'
            }`}
          >
            Low Stock ({formatUnits(lowStockPresetVal)})
          </button>

          <button
            onClick={resetToBaseline}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
            title="Reset to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Slider Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-orange-50/50 rounded-xl border border-orange-200">
        {/* Slider 1: Demand Change (-20% to +30%) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
              1. Demand Change
            </span>
            <span
              className={`font-bold font-sans px-2 py-0.5 rounded text-xs tabular-nums ${
                params.demandChangePct > 0
                  ? 'bg-orange-100 text-orange-900 border border-orange-300'
                  : params.demandChangePct < 0
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-white text-slate-700 border border-orange-200'
              }`}
            >
              {params.demandChangePct > 0 ? `+${params.demandChangePct}%` : `${params.demandChangePct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="30"
            step="5"
            value={params.demandChangePct}
            onChange={(e) => handleDemandChange(Number(e.target.value))}
            className="w-full h-2 bg-orange-200/80 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-sans tabular-nums">
            <span>-20%</span>
            <span>0% ({formatUnits(baseDemand)})</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Slider 2: Capacity Change (-30% to +30%) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-sans">
              <Factory className="w-3.5 h-3.5 text-orange-600" />
              2. Plant Capacity Change
            </span>
            <span
              className={`font-bold font-sans px-2 py-0.5 rounded text-xs tabular-nums ${
                params.capacityChangePct > 0
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : params.capacityChangePct < 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white text-slate-700 border border-orange-200'
              }`}
            >
              {params.capacityChangePct > 0 ? `+${params.capacityChangePct}%` : `${params.capacityChangePct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="5"
            value={params.capacityChangePct}
            onChange={(e) => handleCapacityChange(Number(e.target.value))}
            className="w-full h-2 bg-orange-200/80 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-sans tabular-nums">
            <span>-30%</span>
            <span>0% ({formatUnits(baseCapacity)}/mo)</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Slider 3: Starting Inventory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-sans">
              <Boxes className="w-3.5 h-3.5 text-orange-600" />
              3. Starting Inventory
            </span>
            <span className="font-bold font-sans px-2 py-0.5 rounded text-xs bg-white text-slate-800 border border-orange-200 tabular-nums">
              {formatUnits(params.currentInventory)}
            </span>
          </div>
          <input
            type="range"
            min={Math.round(baseInventory * 0.3)}
            max={Math.round(baseInventory * 1.8)}
            step={Math.max(100000, Math.round(baseInventory * 0.05))}
            value={params.currentInventory}
            onChange={(e) => handleInventoryChange(Number(e.target.value))}
            className="w-full h-2 bg-orange-200/80 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-sans tabular-nums">
            <span>{formatUnits(Math.round(baseInventory * 0.3))}</span>
            <span>{formatUnits(baseInventory)} (Base)</span>
            <span>{formatUnits(Math.round(baseInventory * 1.8))}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Scenario Outcome Banner */}
      <div
        className={`p-5 rounded-xl border transition-all duration-200 ${
          result.isFeasible
            ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
            : result.statusLabel === 'Critical Shortage'
            ? 'bg-red-50/70 border-red-300 text-slate-900'
            : 'bg-amber-50/70 border-amber-300 text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-bold tracking-wider text-slate-600 uppercase">
                Scenario Outcome
              </span>
              {getStatusBadge()}
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed max-w-3xl font-sans">
              {result.businessSummary}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {onAskAgentAboutScenario && (
              <button
                onClick={() =>
                  onAskAgentAboutScenario(
                    `Explain the impact if demand changes by ${params.demandChangePct}% and capacity by ${params.capacityChangePct}% with ${formatUnits(
                      params.currentInventory
                    )} starting inventory.`
                  )
                }
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-orange-50 text-slate-800 text-xs font-sans font-semibold border border-orange-300 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Ask Explainer about this scenario
              </button>
            )}
          </div>
        </div>

        {/* Mini 4-Metric Grid */}
        <div className="mt-4 pt-4 border-t border-orange-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
          <div className="bg-white/90 p-2.5 rounded-lg border border-orange-200">
            <div className="text-[11px] text-slate-500 font-sans font-medium">Expected Demand</div>
            <div className="text-base font-extrabold text-slate-900 font-sans mt-0.5 tabular-nums">
              {formatUnits(result.totalDemand)}
            </div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-lg border border-orange-200">
            <div className="text-[11px] text-slate-500 font-sans font-medium">Target Production</div>
            <div className="text-base font-extrabold text-orange-600 font-sans mt-0.5 tabular-nums">
              {formatUnits(result.recommendedProduction)}
            </div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-lg border border-orange-200">
            <div className="text-[11px] text-slate-500 font-sans font-medium">Ending Buffer ({terminalMonth})</div>
            <div
              className={`text-base font-extrabold font-sans mt-0.5 tabular-nums ${
                result.minEndingInventory >= params.safetyStockTarget
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {formatUnits(result.minEndingInventory)}
            </div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-lg border border-orange-200">
            <div className="text-[11px] text-slate-500 font-sans font-medium">Potential Shortage</div>
            <div
              className={`text-base font-extrabold font-sans mt-0.5 tabular-nums ${
                result.shortageUnits === 0 ? 'text-slate-900' : 'text-red-600'
              }`}
            >
              {result.shortageUnits === 0 ? '0' : formatUnits(result.shortageUnits)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
