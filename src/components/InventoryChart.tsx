import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { MonthlyPlanItem } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface InventoryChartProps {
  monthlyPlan: MonthlyPlanItem[];
  startingInventory?: number;
  safetyStockTarget?: number;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({
  monthlyPlan,
  startingInventory = 6000000,
  safetyStockTarget = 1000000
}) => {
  // Construct trajectory in Lakhs (1 Lakh = 100,000 units)
  const trajectoryData = [
    {
      period: 'Start',
      inventoryLakh: startingInventory / 100000,
      safetyStockLakh: safetyStockTarget / 100000,
      isStart: true,
      rawEnding: startingInventory
    },
    ...monthlyPlan.map((item) => ({
      period: item.month,
      inventoryLakh: item.endingInventory / 100000,
      safetyStockLakh: (item.safetyStock || safetyStockTarget) / 100000,
      isStart: false,
      rawEnding: item.endingInventory
    }))
  ];

  const safetyStockLakh = safetyStockTarget / 100000;
  const terminalItem = monthlyPlan[monthlyPlan.length - 1];
  const terminalEnding = terminalItem?.endingInventory ?? safetyStockTarget;
  const terminalMonth = terminalItem?.month || 'Final';
  const minEnding = monthlyPlan.length > 0 ? Math.min(...monthlyPlan.map((m) => m.endingInventory)) : terminalEnding;
  const isProtected = minEnding >= safetyStockTarget;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rawEnding = payload[0]?.payload?.rawEnding;

      return (
        <div className="bg-white text-slate-900 p-3 rounded-lg border border-orange-200 shadow-xl text-xs font-mono">
          <div className="flex items-center justify-between gap-4 font-semibold pb-1.5 border-b border-orange-100">
            <span className="text-slate-700">TIMELINE: {label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                rawEnding >= safetyStockTarget
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {rawEnding >= safetyStockTarget ? 'BUFFER PROTECTED' : 'SHORTAGE RISK'}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Warehouse Stock:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {formatUnits(rawEnding)} ({formatIndianFull(rawEnding)})
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Target Safety Buffer:</span>
              <span className="font-mono text-slate-700">
                {formatUnits(safetyStockTarget)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-orange-100 text-[11px]">
              <span className="text-slate-500">Surplus Headroom:</span>
              <span className="font-mono text-emerald-700 font-semibold">
                +{formatUnits(Math.max(0, rawEnding - safetyStockTarget))}
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
      transition={{ duration: 0.35, delay: 0.1 }}
      id="inventory-health-card"
      className="bg-white border border-orange-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden"
    >
      {/* CAD Corner Ticks */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-orange-400 select-none">┌ BUFFER_RUNWAY</div>
      <div className="absolute top-2 right-2 text-[8px] font-mono text-orange-400 select-none">┐</div>
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-orange-400 select-none">
        └ {formatUnits(startingInventory)} → {formatUnits(safetyStockTarget)}
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-orange-400 select-none">┘</div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              03. Inventory Trajectory & Buffer Health
            </h3>
            {isProtected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                100% Buffer Secure
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Buffer Risk
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Warehouse depletion path maintaining the mandatory {formatUnits(safetyStockTarget)} safety stock buffer.
          </p>
        </div>

        <div className="text-xs font-sans text-slate-600 flex items-center gap-2">
          <span>Terminal Buffer ({terminalMonth}):</span>
          <span className="font-sans text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold tabular-nums">
            {formatUnits(terminalEnding)} Units
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trajectoryData}
            margin={{ top: 18, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="invGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FED7AA" />

            <XAxis
              dataKey="period"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#FDBA74' }}
              tick={{ fill: '#64748B', fontFamily: 'monospace' }}
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, safetyStockLakh) * 1.2)]}
              tickFormatter={(v) => `${v} L`}
              tick={{ fill: '#64748B', fontFamily: 'monospace' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Safety Stock Reference Line */}
            <ReferenceLine
              y={safetyStockLakh}
              stroke="#D97706"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `SAFETY BUFFER TARGET (${formatUnits(safetyStockTarget)})`,
                position: 'insideBottomRight',
                fill: '#D97706',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: 'monospace'
              }}
            />

            {/* Shaded Area for Safety Stock Zone */}
            <Area
              type="monotone"
              dataKey="inventoryLakh"
              stroke="#059669"
              strokeWidth={2.5}
              fill="url(#invGradient)"
              name="Projected Inventory"
              dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5, stroke: '#FFFFFF' }}
              activeDot={{ r: 5, fill: '#059669' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Conclusion */}
      <div className="mt-3 pt-3 border-t border-orange-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-600 inline-block rounded-full"></span>
            <span>Warehouse Ending Stock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-600 inline-block"></span>
            <span className="text-amber-700">Safety Threshold ({formatUnits(safetyStockTarget)})</span>
          </div>
        </div>
        <div className="text-emerald-800 font-semibold flex items-center gap-1 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Warehouse balance {isProtected ? 'never violates' : 'falls below'} {formatUnits(safetyStockTarget)} safety buffer.</span>
        </div>
      </div>
    </motion.div>
  );
};
