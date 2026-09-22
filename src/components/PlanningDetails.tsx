import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { MonthlyPlanItem } from '../types/planning';
import { formatUnits } from '../data/planningData';

interface PlanningDetailsProps {
  monthlyPlan: MonthlyPlanItem[];
  defaultOpen?: boolean;
}

export const PlanningDetails: React.FC<PlanningDetailsProps> = ({
  monthlyPlan,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const totalDemand = monthlyPlan.reduce((acc, curr) => acc + curr.demand, 0);
  const totalRequired = monthlyPlan.reduce((acc, curr) => acc + curr.requiredProduction, 0);
  const totalRecommended = monthlyPlan.reduce((acc, curr) => acc + curr.recommendedProduction, 0);
  const totalShortage = monthlyPlan.reduce((acc, curr) => acc + curr.shortage, 0);

  const exportCSV = () => {
    const headers = [
      'Month',
      'Demand (Units)',
      'Opening Inventory',
      'Required Production',
      'Recommended Production',
      'Ending Inventory',
      'Safety Stock Target',
      'Shortage',
      'Capacity (Units)',
      'Capacity Utilization (%)'
    ];

    const rows = monthlyPlan.map((m) => [
      m.month,
      m.demand,
      m.openingInventory,
      m.requiredProduction,
      m.recommendedProduction,
      m.endingInventory,
      m.safetyStock,
      m.shortage,
      m.capacity,
      `${m.capacityUtilization}%`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nexforge_Production_Plan_Jan_Jun.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="planning-details-section"
      className="bg-white rounded-xl border border-orange-200 overflow-hidden shadow-xs transition-all duration-200"
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-orange-50/50 transition-colors text-left cursor-pointer font-sans"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 border border-orange-300 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">Planning Details & Monthly Matrix</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300 font-sans">
                Monthly Breakdown (Jan–Jun)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Comprehensive inventory balances, required dispatch, and capacity utilization in Indian Units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold font-sans">
          <span>{isOpen ? 'Collapse table' : 'View monthly details'}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Table */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-orange-100 space-y-4 font-sans">
          <div className="flex items-center justify-between font-sans">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Monthly Schedule Balance Table (Units in Lakhs / Crores)
            </span>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-orange-50 border border-orange-200 rounded-md transition-colors shadow-2xs cursor-pointer font-sans"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-orange-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50 text-slate-700 font-bold border-b border-orange-200 font-sans">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Demand</th>
                  <th className="py-2.5 px-3 text-right">Opening Inv.</th>
                  <th className="py-2.5 px-3 text-right">Required Prod.</th>
                  <th className="py-2.5 px-3 text-right bg-orange-100/70 text-orange-950">
                    Target Prod.
                  </th>
                  <th className="py-2.5 px-3 text-right">Ending Inv.</th>
                  <th className="py-2.5 px-3 text-right">Safety Stock</th>
                  <th className="py-2.5 px-3 text-right">Shortage</th>
                  <th className="py-2.5 px-3 text-right">Line Util.</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100 font-sans">
                {monthlyPlan.map((m) => (
                  <tr key={m.month} className="hover:bg-orange-50/40 text-slate-700">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {m.month}
                    </td>
                    <td className="py-3 px-3 font-mono text-right">{formatUnits(m.demand)}</td>
                    <td className="py-3 px-3 font-mono text-right text-slate-500">
                      {formatUnits(m.openingInventory)}
                    </td>
                    <td className="py-3 px-3 font-mono text-right">
                      {formatUnits(m.requiredProduction)}
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-orange-700 bg-orange-50/50">
                      {formatUnits(m.recommendedProduction)}
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-medium text-emerald-700">
                      {formatUnits(m.endingInventory)}
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-slate-400">
                      {formatUnits(m.safetyStock)}
                    </td>
                    <td className="py-3 px-3 font-mono text-right">
                      {m.shortage === 0 ? (
                        <span className="text-slate-400">0</span>
                      ) : (
                        <span className="text-red-600 font-bold">{formatUnits(m.shortage)}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          m.capacityUtilization > 90
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-orange-50 text-slate-700'
                        }`}
                      >
                        {m.capacityUtilization}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                        Safe
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange-50/80 font-semibold text-slate-900 border-t-2 border-orange-200 font-mono">
                <tr>
                  <td className="py-3 px-3">Total (6-Mo)</td>
                  <td className="py-3 px-3 font-mono text-right">{formatUnits(totalDemand)}</td>
                  <td className="py-3 px-3 font-mono text-right text-slate-400">—</td>
                  <td className="py-3 px-3 font-mono text-right">{formatUnits(totalRequired)}</td>
                  <td className="py-3 px-3 font-mono text-right text-orange-700 font-bold bg-orange-100/60">
                    {formatUnits(totalRecommended)}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-emerald-700 font-bold">
                    10.00 Lakh (Target)
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-500">10.00 Lakh</td>
                  <td className="py-3 px-3 font-mono text-right">
                    {totalShortage === 0 ? '0' : formatUnits(totalShortage)}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-600">73.7% Avg</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      Feasible
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
