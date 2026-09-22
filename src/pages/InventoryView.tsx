import React from 'react';
import { InventoryChart } from '../components/InventoryChart';
import { MonthlyPlanItem } from '../types/planning';
import { Boxes, ShieldCheck } from 'lucide-react';
import { formatUnits } from '../data/planningData';

interface InventoryViewProps {
  monthlyPlan: MonthlyPlanItem[];
  startingInventory?: number;
  safetyStockTarget?: number;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  monthlyPlan,
  startingInventory = 6000000,
  safetyStockTarget = 1000000
}) => {
  const terminalEnding = monthlyPlan[monthlyPlan.length - 1]?.endingInventory ?? safetyStockTarget;
  const minEnding = monthlyPlan.length > 0 ? Math.min(...monthlyPlan.map((m) => m.endingInventory)) : terminalEnding;
  const isProtected = minEnding >= safetyStockTarget;
  const deployedStock = Math.max(0, startingInventory - safetyStockTarget);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-300">
                <Boxes className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-mono">Inventory Health & Buffer Control</h2>
            </div>
            <p className="text-xs text-slate-500">
              Projected warehouse inventory drawdown tracking towards the mandated {formatUnits(safetyStockTarget)} safety stock buffer.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isProtected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {isProtected ? 'Protected (0 Stockouts Expected)' : 'Safety Buffer Warning'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Inventory Trajectory Chart */}
      <InventoryChart
        monthlyPlan={monthlyPlan}
        startingInventory={startingInventory}
        safetyStockTarget={safetyStockTarget}
      />

      {/* Monthly Inventory Step-down Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {monthlyPlan.map((item, idx) => (
          <div
            key={item.month}
            className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">{item.month}</span>
              <span className="text-[10px] text-slate-400">Mo. {idx + 1}</span>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Closing Balance</div>
              <div className="text-base font-bold text-emerald-700 font-mono">
                {formatUnits(item.endingInventory)}
              </div>
            </div>
            <div className="text-[11px] text-slate-600 pt-1 border-t border-orange-100 flex items-center justify-between">
              <span>Safety Buffer:</span>
              <span className="font-mono text-slate-800 font-medium">
                {formatUnits(item.safetyStock)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Summary */}
      <div className="p-6 bg-orange-50/80 text-slate-900 rounded-xl border border-orange-200 space-y-3 font-mono">
        <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          Controlled Stock Optimization Policy
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-4xl font-sans">
          By deploying {formatUnits(deployedStock)} of excess opening inventory ({formatUnits(startingInventory)} initial down to {formatUnits(terminalEnding)} closing balance), the plant avoids unnecessary manufacturing overtime while preventing deadweight carrying expenses. The {formatUnits(safetyStockTarget)} safety buffer remains protected as standard operational reserve.
        </p>
      </div>
    </div>
  );
};
