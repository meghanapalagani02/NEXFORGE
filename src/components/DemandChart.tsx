import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { ArrowRight } from 'lucide-react';
import { HistoricalDemandPoint } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface DemandChartProps {
  data: HistoricalDemandPoint[];
  onOpenModelDetails?: () => void;
}

export const DemandChart: React.FC<DemandChartProps> = ({
  data,
  onOpenModelDetails
}) => {
  const [showConfidenceBounds, setShowConfidenceBounds] = useState<boolean>(true);

  // Format data for chart display in Lakhs (1 Lakh = 100,000 units)
  const chartData = data.map((item) => ({
    period: item.period,
    historicalDemand: !item.isForecast ? item.demand / 100000 : null,
    forecastDemand: item.isForecast ? item.demand / 100000 : null,
    upperBound: item.isForecast && item.upperBound ? item.upperBound / 100000 : null,
    lowerBound: item.isForecast && item.lowerBound ? item.lowerBound / 100000 : null,
    movingAverage: item.movingAverage ? item.movingAverage / 100000 : null,
    raw: item
  }));

  // Find the split point between historical and forecast
  const forecastStartIndex = data.findIndex((d) => d.isForecast);
  const forecastStartPeriod = forecastStartIndex >= 0 ? data[forecastStartIndex].period : '';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload?.raw as HistoricalDemandPoint;
      const val = item.demand;
      const isFc = item.isForecast;

      return (
        <div className="bg-white text-slate-900 p-3 rounded-lg border border-orange-200 shadow-xl text-xs font-mono">
          <div className="flex items-center justify-between gap-4 font-semibold pb-1.5 border-b border-orange-100">
            <span className="text-slate-700">PERIOD: {label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                isFc
                  ? 'bg-orange-100 text-orange-900 border border-orange-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              {isFc ? 'FORECAST' : 'ACTUAL'}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Demand:</span>
              <span className="font-bold text-orange-600 font-mono">
                {formatUnits(val)} ({formatIndianFull(val)} units)
              </span>
            </div>
            {isFc && item.upperBound && item.lowerBound && (
              <div className="flex items-center justify-between gap-4 text-[11px] text-slate-500 pt-1 border-t border-orange-100">
                <span>95% Confidence:</span>
                <span className="font-mono text-slate-700">
                  {formatUnits(item.lowerBound)} – {formatUnits(item.upperBound)}
                </span>
              </div>
            )}
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
      transition={{ duration: 0.35 }}
      id="demand-outlook-card"
      className="bg-white border border-orange-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden"
    >
      {/* CAD Corner Ticks */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-orange-400 select-none">┌ DEMAND_STREAM</div>
      <div className="absolute top-2 right-2 text-[8px] font-mono text-orange-400 select-none">┐</div>
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-orange-400 select-none">└ 48_PERIODS</div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-orange-400 select-none">┘</div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              01. Demand Trajectory & Forecast
            </h3>
            <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-orange-100 text-orange-950 border border-orange-300 font-semibold tabular-nums">
              ~60.00 Lakh/mo Stable
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            48-Month historical baseline vs. 6-Month 3-Mo moving average projection (Indian Numbering).
          </p>
        </div>

        <div className="flex items-center gap-3 font-sans">
          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none font-medium">
            <input
              type="checkbox"
              checked={showConfidenceBounds}
              onChange={(e) => setShowConfidenceBounds(e.target.checked)}
              className="rounded border-orange-300 bg-orange-50 text-orange-600 focus:ring-orange-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="text-xs">95% Band</span>
          </label>

          {onOpenModelDetails && (
            <button
              onClick={onOpenModelDetails}
              className="text-xs text-orange-700 hover:text-orange-950 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Model Audit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA580C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EA580C" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FED7AA" />

            <XAxis
              dataKey="period"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#FDBA74' }}
              interval="preserveStartEnd"
              tick={{ fill: '#64748B', fontFamily: 'monospace' }}
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[45, 75]}
              tickFormatter={(v) => `${v} L`}
              tick={{ fill: '#64748B', fontFamily: 'monospace' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Vertical Divider separating Historical from Forecast */}
            {forecastStartPeriod && (
              <ReferenceLine
                x={forecastStartPeriod}
                stroke="#EA580C"
                strokeDasharray="4 4"
                label={{
                  value: 'FORECAST →',
                  position: 'insideTopLeft',
                  fill: '#EA580C',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}
              />
            )}

            {/* Confidence Area for Forecast */}
            {showConfidenceBounds && (
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="transparent"
                fill="#EA580C"
                fillOpacity={0.12}
                isAnimationActive={true}
              />
            )}

            {/* Forecast Area */}
            <Area
              type="monotone"
              dataKey="forecastDemand"
              stroke="#EA580C"
              strokeWidth={2.5}
              fill="url(#forecastGradient)"
              name="Forecast Demand"
              dot={{ r: 3.5, fill: '#EA580C', strokeWidth: 1.5, stroke: '#FFFFFF' }}
              activeDot={{ r: 5, fill: '#EA580C' }}
            />

            {/* Historical Demand Line */}
            <Line
              type="monotone"
              dataKey="historicalDemand"
              stroke="#64748B"
              strokeWidth={2}
              name="Historical Demand"
              dot={{ r: 2.5, fill: '#64748B' }}
              activeDot={{ r: 4, fill: '#334155' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="mt-3 pt-3 border-t border-orange-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-500 inline-block"></span>
            <span>Historical Actuals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-orange-600 inline-block rounded-full"></span>
            <span className="font-semibold text-orange-700">Forecast (3-Mo Moving Avg)</span>
          </div>
        </div>
        <div className="text-slate-700 text-[11px]">
          Total 6-mo demand: <strong className="text-slate-900 font-mono">3.60 Cr units (359.52 Lakh)</strong>
        </div>
      </div>
    </motion.div>
  );
};
