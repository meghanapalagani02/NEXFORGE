import React from 'react';
import { ProductionChart } from '../components/ProductionChart';
import { PlanningDetails } from '../components/PlanningDetails';
import { MonthlyPlanItem } from '../types/planning';
import { Factory, ShieldCheck, Gauge, Layers } from 'lucide-react';
import { formatUnits } from '../data/planningData';

interface ProductionViewProps {
  monthlyPlan: MonthlyPlanItem[];
  capacityMonthly?: number;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  monthlyPlan,
  capacityMonthly = 7000000
}) => {
  const totalRecommended = monthlyPlan.reduce((acc, curr) => acc + curr.recommendedProduction, 0);
  const avgUtilization = monthlyPlan.length > 0
    ? (monthlyPlan.reduce((acc, curr) => acc + curr.capacityUtilization, 0) / monthlyPlan.length).toFixed(1)
    : '0.0';

  const peakMonth = monthlyPlan.reduce(
    (prev, curr) => (curr.recommendedProduction > prev.recommendedProduction ? curr : prev),
    monthlyPlan[0] || { month: '-', recommendedProduction: 0, capacityUtilization: 0 }
  );

  const constrainedCount = monthlyPlan.filter((m) => m.status === 'constrained' || m.status === 'shortage').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-300">
                <Factory className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-mono">Manufacturing Production Plan</h2>
            </div>
            <p className="text-xs text-slate-500">
              {monthlyPlan.length}-Month master production schedule dispatched within available plant capacity ({formatUnits(capacityMonthly)}/mo limit).
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs">
              <span className="text-slate-500">Target Output: </span>
              <strong className="text-orange-800 font-mono">{formatUnits(totalRecommended)}</strong>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs">
              <span className="text-slate-500">Avg Utilization: </span>
              <strong className="text-emerald-800 font-mono">{avgUtilization}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Production Bar Chart */}
      <ProductionChart data={monthlyPlan} capacityMonthly={capacityMonthly} />

      {/* Monthly Planning Details Table (Always open on Production view) */}
      <PlanningDetails monthlyPlan={monthlyPlan} defaultOpen={true} />

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <Gauge className="w-3.5 h-3.5 text-orange-600" />
            Peak Line Load
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            {peakMonth.month} requires maximum line throughput of {formatUnits(peakMonth.recommendedProduction)} ({peakMonth.capacityUtilization}% utilization). Plant headroom remains at {(Math.max(0, 100 - peakMonth.capacityUtilization)).toFixed(1)}%.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Line Feasibility
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            {constrainedCount === 0
              ? 'Every planned monthly production order satisfies 100% of customer orders within monthly capacity limits.'
              : `${constrainedCount} monthly periods require line capacity attention or pre-building.`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            Shift Allocation
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            Operating under standard manufacturing shifts across scheduled lines with monthly capacity ceiling of {formatUnits(capacityMonthly)}.
          </p>
        </div>
      </div>
    </div>
  );
};
