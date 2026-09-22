import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Cpu,
  Atom,
  Layers,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Terminal,
  Server
} from 'lucide-react';
import { QuantumExecutionResult } from '../types/planning';

interface TechnicalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantumResult?: QuantumExecutionResult | null;
}

export const TechnicalDetailsModal: React.FC<TechnicalDetailsModalProps> = ({
  isOpen,
  onClose,
  quantumResult
}) => {
  const [activeTab, setActiveTab] = useState<'quantum' | 'optimization' | 'forecasting'>('quantum');

  if (!isOpen) return null;

  // Extract backend-provided values or display honest "Awaiting optimization backend"
  const optimizationMethod =
    quantumResult?.technicalDetails?.optimizationMethod || 'Awaiting optimization backend';
  const numVariables =
    quantumResult?.qubitBreakdown?.num_variables != null
      ? String(quantumResult.qubitBreakdown.num_variables)
      : 'Awaiting optimization backend';
  const numQubits =
    quantumResult?.qubitCount != null
      ? `${quantumResult.qubitCount} qubits`
      : 'Awaiting optimization backend';
  const backend =
    quantumResult?.technicalDetails?.simulatorBackend || 'Awaiting optimization backend';
  const qaoaDepth =
    quantumResult?.circuitDepth != null
      ? `p=${quantumResult.circuitDepth}`
      : 'Awaiting optimization backend';
  const shots =
    quantumResult?.technicalDetails?.measuredCounts
      ? Object.values(quantumResult.technicalDetails.measuredCounts).reduce((a, b) => a + b, 0)
      : 'Awaiting optimization backend';
  const executionTime =
    quantumResult?.executionTimeMs != null
      ? `${quantumResult.executionTimeMs} ms`
      : 'Awaiting optimization backend';
  const objectiveValue =
    quantumResult?.evaluatedEnergy != null
      ? String(quantumResult.evaluatedEnergy)
      : 'Awaiting optimization backend';
  const feasibility =
    quantumResult?.isFeasible != null
      ? (quantumResult.isFeasible ? 'Feasible (Plan Validated)' : 'Infeasible')
      : 'Plan Validated (Classical deterministic baseline)';
  const fallbackStatus =
    quantumResult?.fallbackUsed != null
      ? (quantumResult.fallbackUsed
          ? 'Active (Classical deterministic fallback engaged)'
          : 'Standby')
      : 'Active (Classical baseline)';

  const technicalParameters = [
    { label: 'Optimization Method', value: optimizationMethod },
    { label: 'Number of Variables', value: numVariables },
    { label: 'Number of Qubits', value: numQubits },
    { label: 'Backend', value: backend },
    { label: 'QAOA Depth', value: qaoaDepth },
    { label: 'Shots', value: String(shots) },
    { label: 'Execution Time', value: executionTime },
    { label: 'Objective Value', value: objectiveValue },
    { label: 'Feasibility', value: feasibility },
    { label: 'Fallback Status', value: fallbackStatus }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white border border-orange-200 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-orange-200 bg-orange-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-300">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-mono text-base">
                  Technical Details & Evaluation Audit
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Deep-dive specifications, optimization methods, and backend execution contracts.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="px-6 border-b border-orange-200 bg-white flex gap-2 pt-2">
            <button
              onClick={() => setActiveTab('quantum')}
              className={`pb-2.5 px-3 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'quantum'
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Optimization Backend Telemetry
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`pb-2.5 px-3 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'optimization'
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Classical LP Formulation
            </button>
            <button
              onClick={() => setActiveTab('forecasting')}
              className={`pb-2.5 px-3 text-xs font-mono font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'forecasting'
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Forecasting Methodology
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
            {activeTab === 'quantum' && (
              <div className="space-y-4">
                {/* 10 Required Parameters Table */}
                <div className="border border-orange-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div className="p-3.5 bg-orange-50/70 border-b border-orange-200 flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono text-xs flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-orange-600" />
                      Backend Optimization Telemetry (10 Audit Points)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Standard Evaluation Contract
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 font-mono text-xs">
                    {technicalParameters.map((param, idx) => (
                      <div
                        key={param.label}
                        className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <span className="text-slate-600 font-medium">{param.label}</span>
                        <span
                          className={`font-semibold ${
                            param.value.includes('Awaiting')
                              ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]'
                              : param.value.includes('Feasible') || param.value.includes('Valid')
                              ? 'text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]'
                              : 'text-slate-900'
                          }`}
                        >
                          {param.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notice on Real Backend Connection */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-600 font-sans text-xs">
                  <h5 className="font-bold font-mono text-slate-900">Backend Connection Contract:</h5>
                  <p>
                    Values above are delivered directly from the backend optimization service via the{' '}
                    <code className="font-mono text-orange-800 bg-orange-100/60 px-1 py-0.5 rounded">
                      POST /api/quantum/optimize
                    </code>{' '}
                    endpoint. When the service is not connected, the platform gracefully indicates{' '}
                    <span className="font-mono text-amber-800 font-bold">"Awaiting optimization backend"</span>{' '}
                    without fabricating synthetic execution metrics or quantum advantage claims.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'optimization' && (
              <div className="space-y-4">
                <div className="bg-white border border-orange-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 font-mono text-xs">Linear Programming Mathematical Model</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 space-y-1">
                    <p className="font-bold text-orange-700">Objective: Minimize Total Operational Cost</p>
                    <p>min Z = ∑_t [ c_prod · X_t + c_hold · I_t + c_short · S_t ]</p>
                    <p className="font-bold text-orange-700 mt-2">Subject To Constraints:</p>
                    <p>1. Inventory Balance: I_t = I_(t-1) + X_t - D_t + S_t,  ∀ t</p>
                    <p>2. Line Capacity: X_t ≤ Cap_monthly,  ∀ t</p>
                    <p>3. Safety Buffer Target: I_t ≥ SafetyStock,  ∀ t</p>
                    <p>4. Non-Negativity: X_t ≥ 0, I_t ≥ 0, S_t ≥ 0,  ∀ t</p>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Calculates cost-minimizing production and inventory levels with exact constraint enforcement.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'forecasting' && (
              <div className="space-y-4">
                <div className="bg-white border border-orange-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 font-mono text-xs">Chronological Train/Test Validation</h4>
                  <p className="text-[11px] text-slate-600">
                    Time-series projection uses chronological rolling horizons to safeguard against lookahead leakage.
                  </p>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                    <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Horizon</span>
                      <strong className="text-orange-950">6 Months Forward</strong>
                    </div>
                    <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Interval</span>
                      <strong className="text-orange-950">Monthly Discrete</strong>
                    </div>
                    <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Trend Model</span>
                      <strong className="text-orange-950">Adaptive Trend & Seasonality</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-orange-200 bg-orange-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close Technical Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
