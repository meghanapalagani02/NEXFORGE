import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { ScheduledTask, MachineUtilizationMetric } from '../types/planning';
import { planningApi } from '../services/planningApi';

interface ProductionSchedulingPageProps {
  initialProductionQuantity?: number;
}

export const ProductionSchedulingPage: React.FC<ProductionSchedulingPageProps> = ({
  initialProductionQuantity = 5200000
}) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [utilizations, setUtilizations] = useState<MachineUtilizationMetric[]>([]);
  const [bottleneck, setBottleneck] = useState<string | undefined>('Automated Stator Winding Cell A');
  const [totalHours, setTotalHours] = useState<number>(936);
  const [avgUtil, setAvgUtil] = useState<number>(66.7);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('Master shop-floor dispatch schedule synchronized.');

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await planningApi.getProductionSchedule({
        'Stator Sub-Assembly (Sub-A)': Math.round(initialProductionQuantity * 0.35),
        'Precision Rotor Shaft (Sub-B)': Math.round(initialProductionQuantity * 0.30),
        'Cast Iron Frame Housing (Sub-C)': Math.round(initialProductionQuantity * 0.20),
        'Final Induction Motor Pack': Math.round(initialProductionQuantity * 0.15)
      });
      setTasks(res.schedule);
      setUtilizations(res.machineUtilizations);
      setBottleneck(res.bottleneckMachineName);
      setTotalHours(res.totalScheduledHours);
      setAvgUtil(res.averageUtilizationPct);
      setStatusMsg(res.statusText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [initialProductionQuantity]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-mono text-[11px] font-bold rounded-md">
              MODULE 05
            </span>
            <span className="text-xs text-slate-500 font-mono">
              SHOP-FLOOR LINE BALANCING & GANTT SCHEDULING
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-mono">
            Production Scheduling & Machine Allocation
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Allocates master production quantities across shop-floor machine cells, calculating cycle times,
            identifying throughput bottlenecks, and preventing line overloads.
          </p>
        </div>

        <button
          onClick={fetchSchedule}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Line Schedule
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">SCHEDULED JOBS</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {tasks.length} Work Orders
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-mono">
            {totalHours} total processing hours
          </p>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">AVERAGE MACHINE LOAD</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {avgUtil}%
          </div>
          <p className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Balanced capacity load
          </p>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">CRITICAL BOTTLENECK CELL</span>
          <div className="text-sm font-bold font-mono text-amber-900 truncate mt-1">
            {bottleneck || 'None (All lines optimal)'}
          </div>
          <p className="text-[11px] text-amber-700 font-mono mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            92.0% cell utilization
          </p>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 block mb-1">DISPATCH INTEGRITY</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            100% On-Time
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-mono">
            0 overdue orders
          </p>
        </div>
      </div>

      {/* Machine Utilization Load Bars */}
      <div className="bg-white border border-orange-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 font-mono text-sm">
              Shop-Floor Cell Utilization & Bottleneck Status
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Standard: 22 Days × 16 Hours = 352 Available Hrs/Cell
          </span>
        </div>

        <div className="space-y-4">
          {utilizations.map((m) => (
            <div key={m.machineId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{m.machineName}</span>
                  {m.isBottleneck && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                      BOTTLENECK CELL
                    </span>
                  )}
                </div>
                <div className="text-slate-600">
                  <span className="font-bold text-slate-900">{m.allocatedHours} hrs</span> / {m.totalAvailableHours} hrs ({m.utilizationPct}%)
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.utilizationPct >= 90
                      ? 'bg-amber-500'
                      : m.utilizationPct >= 75
                      ? 'bg-orange-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, m.utilizationPct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt & Scheduled Jobs Table */}
      <div className="bg-white border border-orange-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-200 bg-orange-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 font-mono text-sm">
              Work Order Scheduling & Machine Dispatch Gantt
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{statusMsg}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-orange-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">JOB ID</th>
                <th className="py-3 px-4">SUB-ASSEMBLY / PRODUCT</th>
                <th className="py-3 px-4">ASSIGNED CELL</th>
                <th className="py-3 px-4 text-right">QUANTITY</th>
                <th className="py-3 px-4 text-right">CYCLE TIME</th>
                <th className="py-3 px-4">SCHEDULE WINDOW</th>
                <th className="py-3 px-4 text-center">PRIORITY</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 text-slate-800">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-orange-900">{task.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{task.productName}</td>
                  <td className="py-3 px-4 text-slate-600">{task.machineName}</td>
                  <td className="py-3 px-4 text-right">{task.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">{task.processingHours} hrs</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px]">
                      {task.startDate} → {task.endDate}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
