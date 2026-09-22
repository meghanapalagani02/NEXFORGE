import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
  Atom,
  Brain,
  Sliders,
  Layers,
  Zap,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { MODEL_EVALUATIONS, formatNumber, formatUnits } from '../data/planningData';
import { ModelEvaluation } from '../types/planning';

interface ForecastDetailsProps {
  defaultOpen?: boolean;
  selectedModelId?: string;
  onSelectModel?: (model: ModelEvaluation) => void;
}

export const ForecastDetails: React.FC<ForecastDetailsProps> = ({
  defaultOpen = false,
  selectedModelId,
  onSelectModel
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'statistical' | 'machine_learning' | 'quantum'>('all');
  const [activeModelId, setActiveModelId] = useState<string>(selectedModelId || 'ma3');

  const models = MODEL_EVALUATIONS;
  const filteredModels = categoryFilter === 'all' 
    ? models 
    : models.filter((m) => m.category === categoryFilter);

  const activeModel = models.find((m) => m.id === activeModelId) || models[0];

  const handleModelClick = (model: ModelEvaluation) => {
    setActiveModelId(model.id);
    if (onSelectModel) {
      onSelectModel(model);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'statistical':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-md">
            <Cpu className="w-3 h-3 text-slate-600" />
            Statistical
          </span>
        );
      case 'machine_learning':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-orange-800 bg-orange-100 border border-orange-300 px-2.5 py-0.5 rounded-md">
            <Brain className="w-3 h-3 text-orange-600" />
            Hybrid ML
          </span>
        );
      case 'quantum':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-purple-800 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-md">
            <Atom className="w-3 h-3 text-purple-600" />
            Quantum-Inspired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="forecast-details-section"
      className="bg-white rounded-xl border border-orange-200 overflow-hidden shadow-xs transition-all duration-200 font-sans"
    >
      {/* Collapsible Trigger Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-orange-50/50 transition-colors text-left cursor-pointer font-sans"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 border border-orange-300 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap font-sans">
              <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Algorithm Benchmark: Statistical, Hybrid ML & Quantum
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 font-sans">
                Active: {activeModel.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Evaluating 9 predictive & optimization architectures across statistical, neural deep-learning, and QAOA/QUBO quantum solvers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold font-sans shrink-0 ml-2">
          <span>{isOpen ? 'Collapse' : 'Explore Algorithms'}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-orange-100 space-y-6 font-sans">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-sans text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-orange-50/70 border border-orange-200 rounded-lg">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100/50'
                }`}
              >
                All Models ({models.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('statistical')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'statistical'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100/50'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Statistical (3)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('machine_learning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'machine_learning'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100/50'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                Hybrid ML (3)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('quantum')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'quantum'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100/50'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                Quantum / QAOA (3)
              </button>
            </div>

            <span className="text-slate-500 text-[11px]">
              Click any algorithm below to inspect its architecture & formula.
            </span>
          </div>

          {/* Active Model Deep Dive Card */}
          <div className="p-5 rounded-xl bg-orange-50/70 border border-orange-200 text-slate-900 space-y-4 font-mono">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                    SELECTED ARCHITECTURE
                  </span>
                  {getCategoryBadge(activeModel.category)}
                  {activeModel.id === 'ma3' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Production Default
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {activeModel.name}
                </h4>
                <div className="text-xs text-slate-500 font-mono">
                  Algorithm Family: <strong className="text-slate-800">{activeModel.algorithmType}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 md:border-l md:border-orange-200 md:pl-6 bg-white/80 p-3 rounded-lg border border-orange-200/80">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">MAE Error</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatNumber(activeModel.mae)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">RMSE</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatNumber(activeModel.rmse)}
                  </div>
                </div>
                {activeModel.mape && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">MAPE</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono">
                      {activeModel.mape}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {activeModel.rationale}
            </p>

            {/* Formula & Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              {/* Formula */}
              {activeModel.mathFormula && (
                <div className="p-3.5 rounded-lg bg-white border border-orange-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-orange-600" />
                    Mathematical Formulation
                  </div>
                  <div className="text-xs font-mono font-bold text-orange-950 bg-orange-50/50 p-2 rounded border border-orange-200 overflow-x-auto">
                    {activeModel.mathFormula}
                  </div>
                </div>
              )}

              {/* Hyperparameters / Quantum Metrics */}
              {activeModel.quantumMetrics ? (
                <div className="p-3.5 rounded-lg bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Atom className="w-3.5 h-3.5 text-purple-700" />
                    Quantum Circuit Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-purple-600">Qubits: </span>
                      <strong className="text-purple-950 font-bold">{activeModel.quantumMetrics.qubits}</strong>
                    </div>
                    <div>
                      <span className="text-purple-600">Circuit Depth: </span>
                      <strong className="text-purple-950 font-bold">{activeModel.quantumMetrics.circuitDepth}</strong>
                    </div>
                    <div>
                      <span className="text-purple-600">Ground Energy: </span>
                      <strong className="text-purple-950 font-bold">{activeModel.quantumMetrics.energyGroundState}</strong>
                    </div>
                    <div>
                      <span className="text-purple-600">Convergence: </span>
                      <strong className="text-purple-950 font-bold">{activeModel.quantumMetrics.convergenceIterations} iters</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-purple-800 font-semibold pt-1 border-t border-purple-200">
                    🚀 {activeModel.quantumMetrics.speedupFactor}
                  </div>
                </div>
              ) : activeModel.hyperparameters ? (
                <div className="p-3.5 rounded-lg bg-white border border-orange-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-orange-600" />
                    Hyperparameters & Gating
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(activeModel.hyperparameters).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-slate-500">{key}: </span>
                        <strong className="text-slate-800 font-bold">{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                Algorithm Leaderboard & Holdout Performance
              </span>
              <span className="text-slate-500 text-[11px]">
                Validation: 48 Training / 12 Holdout Periods
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-orange-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-orange-50 text-slate-700 font-semibold border-b border-orange-200 font-mono">
                  <tr>
                    <th className="py-2.5 px-3.5">Algorithm Name</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5 font-mono text-right">MAE</th>
                    <th className="py-2.5 px-3.5 font-mono text-right">RMSE</th>
                    <th className="py-2.5 px-3.5 font-mono text-right">MAPE</th>
                    <th className="py-2.5 px-3.5">Primary Strengths</th>
                    <th className="py-2.5 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {filteredModels.map((model) => {
                    const isCurrent = model.id === activeModelId;
                    return (
                      <tr
                        key={model.id}
                        onClick={() => handleModelClick(model)}
                        className={`transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-orange-50/80 font-semibold text-slate-900'
                            : 'text-slate-700 hover:bg-orange-50/40'
                        }`}
                      >
                        <td className="py-3 px-3.5 font-mono">
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0"></span>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{model.name}</div>
                              <div className="text-[10px] text-slate-400 font-sans">{model.algorithmType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          {getCategoryBadge(model.category)}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-right font-semibold">
                          {formatNumber(model.mae)}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-right font-semibold">
                          {formatNumber(model.rmse)}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-right text-emerald-700 font-semibold">
                          {model.mape ? `${model.mape}%` : '-'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 text-[11px] font-sans max-w-xs truncate">
                          {model.characteristics}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModelClick(model);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-orange-300 hover:bg-orange-100'
                            }`}
                          >
                            {isCurrent ? 'Inspecting' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
