import React from 'react';
import { TrendingUp, ShieldCheck, Factory, ArrowUpRight } from 'lucide-react';
import { ActiveTab } from '../types/planning';

interface OutcomeCardsProps {
  demandText?: string;
  inventoryStatusText?: string;
  inventorySubtext?: string;
  capacityStatusText?: string;
  capacitySubtext?: string;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const OutcomeCards: React.FC<OutcomeCardsProps> = ({
  demandText = '35.95M',
  inventoryStatusText = 'SAFE',
  inventorySubtext = 'No shortage expected',
  capacityStatusText = 'SUFFICIENT',
  capacitySubtext = 'No constraint expected',
  onNavigateTab
}) => {
  return (
    <div id="outcome-cards-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 font-sans">
      {/* Card 1: Demand Forecast */}
      <div
        id="card-outcome-demand"
        onClick={() => onNavigateTab && onNavigateTab('forecast')}
        className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl flex items-center gap-4 hover:border-slate-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Demand Forecast
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {demandText} <span className="text-sm text-slate-400 font-medium">Units</span>
          </div>
        </div>
      </div>

      {/* Card 2: Inventory Status */}
      <div
        id="card-outcome-inventory"
        onClick={() => onNavigateTab && onNavigateTab('inventory')}
        className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl flex items-center gap-4 hover:border-slate-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Inventory Status
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 tabular-nums">
            {inventoryStatusText}
            <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Protected
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Capacity Load */}
      <div
        id="card-outcome-capacity"
        onClick={() => onNavigateTab && onNavigateTab('production')}
        className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl flex items-center gap-4 hover:border-slate-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
          <Factory className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Capacity Load
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {capacityStatusText} <span className="text-sm text-slate-400 font-medium">7.0M/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
