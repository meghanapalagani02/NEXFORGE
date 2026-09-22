import React, { useState } from 'react';
import { DemandChart } from '../components/DemandChart';
import { ForecastDetails } from '../components/ForecastDetails';
import { HistoricalDemandPoint, ModelEvaluation } from '../types/planning';
import { MODEL_EVALUATIONS, formatNumber, formatUnits } from '../data/planningData';
import { TrendingUp, Cpu, Sparkles, Layers, Brain, Atom } from 'lucide-react';

interface ForecastViewProps {
  historicalDemand: HistoricalDemandPoint[];
}

export const ForecastView: React.FC<ForecastViewProps> = ({ historicalDemand }) => {
  const [selectedModel, setSelectedModel] = useState<ModelEvaluation>(
    MODEL_EVALUATIONS.find((m) => m.isSelected) || MODEL_EVALUATIONS[0]
  );

  const forecastPoints = historicalDemand.filter((d) => d.isForecast);
  const totalForecastDemand = forecastPoints.reduce((acc, curr) => acc + curr.demand, 0);
  const forecastMonthsCount = forecastPoints.length || 6;

  const handleSelectModel = (model: ModelEvaluation) => {
    setSelectedModel(model);
  };

  const getModelCategoryIcon = (category: string) => {
    switch (category) {
      case 'statistical':
        return <Cpu className="w-3.5 h-3.5 text-slate-600" />;
      case 'machine_learning':
        return <Brain className="w-3.5 h-3.5 text-orange-600" />;
      case 'quantum':
        return <Atom className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-mono">Demand Forecasting & Algorithm Suite</h2>
            </div>
            <p className="text-xs text-slate-500">
              {forecastMonthsCount}-Month projected requirement ({formatUnits(totalForecastDemand)}) evaluated across statistical and Machine Learning algorithms, with hybrid quantum interface prepared for future backend acceleration.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono flex-wrap">
            <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs flex items-center gap-1.5">
              {getModelCategoryIcon(selectedModel.category)}
              <span className="text-slate-500">Active Model: </span>
              <strong className="text-orange-900">{selectedModel.name}</strong>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs">
              <span className="text-slate-500">MAE: </span>
              <strong className="text-emerald-800 font-mono">{formatNumber(selectedModel.mae)}</strong>
            </div>
            {selectedModel.mape && (
              <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs">
                <span className="text-slate-500">MAPE: </span>
                <strong className="text-purple-900 font-mono">{selectedModel.mape}%</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <DemandChart data={historicalDemand} />

      {/* 9-Model Detailed Benchmark & Inspector (Always open on this page) */}
      <ForecastDetails
        defaultOpen={true}
        selectedModelId={selectedModel.id}
        onSelectModel={handleSelectModel}
      />

      {/* Statistical Methodology & Horizon Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            Evaluation Protocol
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            The dataset spans {historicalDemand.length} total sequential periods. The initial periods serve as training observations, while the forecast horizon is dynamically projected and evaluated across holdouts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <Brain className="w-3.5 h-3.5 text-orange-600" />
            Hybrid ML & Neural Attention
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            Temporal Fusion Transformer (TFT) and XGBoost-ARIMA fit nonlinear macro residuals while maintaining bounded quantile intervals (p10, p50, p90) for risk mitigation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <Atom className="w-3.5 h-3.5 text-purple-600" />
            Hybrid Quantum Backend (Prepared)
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            Combinatorial shift and buffer allocations are structured for Ising Hamiltonian formulation, ready for dispatch to the future Qiskit/QAOA backend service.
          </p>
        </div>
      </div>
    </div>
  );
};
