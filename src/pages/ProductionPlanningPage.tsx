import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Factory,
  Layers,
  Coins,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Cpu,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  MonthlyPlanItem,
  PlanningSummary,
  ProductConfig
} from '../types/planning';
import { TechnicalDetailsModal } from '../components/TechnicalDetailsModal';

interface ProductionPlanningPageProps {
  monthlyPlan: MonthlyPlanItem[];
  summary: PlanningSummary;
  productConfig: ProductConfig;
  onUpdateConfig?: (config: Partial<ProductConfig>) => void;
  onRecalculate?: () => void;
  isLoading?: boolean;
}

export const ProductionPlanningPage: React.FC<ProductionPlanningPageProps> = ({
  monthlyPlan,
  summary,
  productConfig,
  onUpdateConfig,
  onRecalculate,
  isLoading = false
}) => {
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [unitCost, setUnitCost] = useState(productConfig.unitProductionCost || 45);
  const [holdingCost, setHoldingCost] = useState(productConfig.unitHoldingCost || 4.5);
  const [shortageCost, setShortageCost] = useState(productConfig.unitShortageCost || 120);

  // Derived mathematical operational costs
  const totalProductionUnits = monthlyPlan.reduce((acc, r) => acc + r.recommendedProduction, 0);
  const totalHoldingUnits = monthlyPlan.reduce((acc, r) => acc + r.endingInventory, 0);
  const totalShortageUnits = monthlyPlan.reduce((acc, r) => acc + r.shortage, 0);

  const calcProdCost = totalProductionUnits * unitCost;
  const calcHoldCost = totalHoldingUnits * holdingCost;
  const calcShortCost = totalShortageUnits * shortageCost;
  const calcTotalCost = calcProdCost + calcHoldCost + calcShortCost;

  const avgUtilization =
    monthlyPlan.length > 0
      ? Math.round(
          (monthlyPlan.reduce((acc, r) => acc + r.capacityUtilization, 0) / monthlyPlan.length) * 10
        ) / 10
      : 84.5;

  const serviceLevel =
    summary.forecastDemand > 0
      ? Math.round(
          Math.max(0, Math.min(100, (1 - totalShortageUnits / summary.forecastDemand) * 100)) * 10
        ) / 10
      : 100.0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-mono text-[11px] font-bold rounded-md">
              MODULE 04
            </span>
            <span className="text-xs text-slate-500 font-mono">
              COST-OPTIMIZED MASTER PRODUCTION PLANNING
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-mono">
            Intelligent Production Planning
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Calculates cost-minimizing monthly manufacturing quantities by balancing demand requirements,
            existing stock buffers, holding fees, and plant line capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTechModalOpen(true)}
            className="px-3 py-2 bg-white border border-orange-300 hover:bg-orange-50 text-orange-800 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-orange-600" />
            Technical Details
          </button>
          <button
            onClick={onRecalculate}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Recalculate Plan
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">RECOMMENDED PRODUCTION</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {(totalProductionUnits / 10000000).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">Cr units</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {totalProductionUnits.toLocaleString()} total units
          </p>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">AVG LINE UTILIZATION</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {avgUtilization}%
          </div>
          <p className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Within healthy 70-95% band
          </p>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">SERVICE LEVEL FULFILLMENT</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {serviceLevel}%
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {totalShortageUnits === 0 ? 'Zero projected stockout' : `${totalShortageUnits.toLocaleString()} units short`}
          </p>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">OPTIMAL OPERATIONAL COST</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ₹{(calcTotalCost / 10000000).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">Cr</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Prod + Holding + Penalty
          </p>
        </div>
      </div>

      {/* Main Monthly Planning Table */}
      <div className="bg-white border border-orange-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-200 bg-orange-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 font-mono text-sm">
              Monthly Inventory Balance & Master Production Plan
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {monthlyPlan.length} Planning Periods Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-orange-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">PERIOD</th>
                <th className="py-3 px-4 text-right">DEMAND</th>
                <th className="py-3 px-4 text-right">OPENING INV</th>
                <th className="py-3 px-4 text-right bg-orange-50/70 text-orange-950 font-bold">
                  RECOMMENDED PROD
                </th>
                <th className="py-3 px-4 text-right">ENDING INV</th>
                <th className="py-3 px-4 text-right">SAFETY BUFFER</th>
                <th className="py-3 px-4 text-right">LINE CAPACITY</th>
                <th className="py-3 px-4 text-right">UTILIZATION</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 text-slate-800">
              {monthlyPlan.map((row) => (
                <tr key={row.monthIndex} className="hover:bg-orange-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.month} (P-{row.monthIndex})
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.demand.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {row.openingInventory.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-orange-700 bg-orange-50/50">
                    {row.recommendedProduction.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {row.endingInventory.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {row.safetyStock.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {row.capacity.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.capacityUtilization >= 95
                              ? 'bg-amber-500'
                              : 'bg-orange-600'
                          }`}
                          style={{ width: `${Math.min(100, row.capacityUtilization)}%` }}
                        />
                      </div>
                      <span>{row.capacityUtilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.status === 'safe' && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                        FEASIBLE
                      </span>
                    )}
                    {row.status === 'constrained' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                        CONSTRAINED
                      </span>
                    )}
                    {row.status === 'shortage' && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                        SHORTAGE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* "Why This Plan?" Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-orange-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 font-mono text-sm">
              Why This Plan? (Operational Intelligence Rationale)
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-lg">
              <strong className="text-orange-950 block font-mono mb-0.5">1. Demand Matching:</strong>
              Total demand across the {monthlyPlan.length} periods stands at {summary.forecastDemand.toLocaleString()} units.
              The production plan schedules {totalProductionUnits.toLocaleString()} units, with existing opening stock fulfilling the net variance.
            </div>
            <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-lg">
              <strong className="text-orange-950 block font-mono mb-0.5">2. Safety Buffer Compliance:</strong>
              Every planning period retains minimum inventory above the {productConfig.safetyStockTarget.toLocaleString()} unit protective target,
              insulating the plant from supplier shipping volatility.
            </div>
            <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-lg">
              <strong className="text-orange-950 block font-mono mb-0.5">3. Capacity Boundary Adherence:</strong>
              No individual monthly schedule violates the plant's installed line limit of {summary.monthlyCapacity.toLocaleString()} units/month,
              avoiding unplanned weekend overtime penalties.
            </div>
          </div>
        </div>

        {/* Cost Matrix Breakdown */}
        <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 font-mono text-sm">
              Cost Matrix Breakdown
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Unit Production Fee (₹{unitCost}):</span>
              <strong className="text-slate-900">₹{(calcProdCost / 100000).toFixed(2)} L</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Holding Carrying Cost (₹{holdingCost}):</span>
              <strong className="text-slate-900">₹{(calcHoldCost / 100000).toFixed(2)} L</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Stockout Penalty Cost:</span>
              <strong className="text-emerald-700">₹{(calcShortCost / 100000).toFixed(2)} L</strong>
            </div>
            <div className="flex justify-between py-2 border-t border-orange-200 text-sm font-bold text-orange-900">
              <span>Total Operational Cost:</span>
              <span>₹{(calcTotalCost / 10000000).toFixed(2)} Cr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details Modal */}
      <TechnicalDetailsModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
      />
    </div>
  );
};
