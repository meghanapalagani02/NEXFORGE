import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { MonthlyPlanItem } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface ProductionChartProps {
  data: MonthlyPlanItem[];
  capacityMonthly?: number;
}

export const ProductionChart: React.FC<ProductionChartProps> = ({
  data,
  capacityMonthly = 7000000
}) => {
  // Convert units to Lakhs (1 Lakh = 100,000 units)
  const chartData = data.map((item) => ({
    month: item.month,
    productionLakh: item.recommendedProduction / 100000,
    demandLakh: item.demand / 100000,
    capacityLakh: (item.capacity || capacityMonthly) / 100000,
    utilization: item.capacityUtilization,
    raw: item
  }));

  const capacityLakh = capacityMonthly / 100000;
  const maxMonth = data.reduce(
    (prev, current) => (prev.recommendedProduction > current.recommendedProduction ? prev : current),
    data[0] || { month: '-', recommendedProduction: 0, capacityUtilization: 0 }
  );

  const totalProduction = data.reduce((acc, curr) => acc + curr.recommendedProduction, 0);
  const isAllFeasible = data.every((d) => (d.capacityUtilization ?? 0) <= 100);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload?.raw as MonthlyPlanItem;
      const cap = item?.capacity || capacityMonthly;
      const isConstrained = item ? item.recommendedProduction >= cap : false;

      return (
        <div className="bg-white text-slate-900 p-3 rounded-lg border border-orange-200 shadow-xl text-xs font-mono">
          <div className="flex items-center justify-between gap-4 font-semibold pb-1.5 border-b border-orange-100">
            <span className="text-slate-700">MONTH: {label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                isConstrained
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {isConstrained ? 'AT CEILING' : 'FEASIBLE'}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Recommended Target:</span>
              <span className="font-bold text-orange-600 font-mono">
                {formatUnits(item.recommendedProduction)} ({formatIndianFull(item.recommendedProduction)})
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Customer Demand:</span>
              <span className="font-mono text-slate-700">
                {formatUnits(item.demand)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Capacity Ceiling:</span>
              <span className="font-mono text-slate-600">{formatUnits(cap)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-orange-100 text-[11px]">
              <span className="text-slate-500">Line Load:</span>
              <span className="font-bold text-amber-700 font-mono">
                {item.capacityUtilization}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      id="production-plan-card"
      className="bg-white border border-orange-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden"
    >
      {/* CAD Corner Ticks */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-orange-400 select-none">┌ PRODUCTION_MATRIX</div>
      <div className="absolute top-2 right-2 text-[8px] font-mono text-orange-400 select-none">┐</div>
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-orange-400 select-none">
        └ CEILING_{capacityLakh.toFixed(0)}L
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-orange-400 select-none">┘</div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              02. Production Schedule & Line Load
            </h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-0.5 rounded-md border font-semibold ${
              isAllFeasible
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {isAllFeasible ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  100% Feasible
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Capacity Limits
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Optimized monthly line allocation against {formatUnits(capacityMonthly)} units monthly threshold.
          </p>
        </div>

        <div className="text-xs font-sans text-slate-600 flex items-center gap-2">
          <span>Peak Utilization:</span>
          <span className="font-sans text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold tabular-nums">
            {maxMonth.month} ({maxMonth.capacityUtilization}%)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 18, right: 10, left: -10, bottom: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FED7AA" />

            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#FDBA74' }}
              tick={{ fill: '#64748B', fontFamily: 'monospace' }}
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, capacityLakh) * 1.15)]}
              tickFormatter={(v) => `${v} L`}
              tick={{ fill: '#64748B', fontFamily: 'monospace' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Horizontal Capacity Line */}
            <ReferenceLine
              y={capacityLakh}
              stroke="#DC2626"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `CAPACITY CEILING (${formatUnits(capacityMonthly)})`,
                position: 'insideTopRight',
                fill: '#DC2626',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: 'monospace'
              }}
            />

            <Bar
              dataKey="productionLakh"
              radius={[4, 4, 0, 0]}
              name="Production Schedule"
            >
              {chartData.map((entry, index) => {
                const isNearCap = entry.productionLakh >= capacityLakh * 0.75;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isNearCap ? '#EA580C' : '#F97316'}
                    className="hover:opacity-90 transition-opacity"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics */}
      <div className="mt-3 pt-3 border-t border-orange-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-orange-600 inline-block rounded-xs"></span>
            <span>Production Schedule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-600 inline-block"></span>
            <span className="text-red-700">Monthly Limit ({formatUnits(capacityMonthly)})</span>
          </div>
        </div>
        <div className="text-slate-700 text-[11px]">
          Total {data.length}-mo production: <strong className="text-orange-700 font-mono">{formatUnits(totalProduction)} ({(totalProduction / 100000).toFixed(2)} Lakh)</strong>
        </div>
      </div>
    </motion.div>
  );
};
