import React from 'react';
import { ScenarioPlanner } from '../components/ScenarioPlanner';
import { Sliders, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MonthlyPlanItem, PlanningSummary } from '../types/planning';

interface ScenarioViewProps {
  monthlyPlan?: MonthlyPlanItem[];
  summary?: PlanningSummary;
  onAskAgentWithQuery: (query: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  monthlyPlan,
  summary,
  onAskAgentWithQuery,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-300">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-mono">Scenario Simulation Lab</h2>
            </div>
            <p className="text-xs text-slate-500">
              Interactive sensitivity analysis: dynamically evaluate capacity boundaries, demand spikes, and stock policies (Indian Units).
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Scenario Planner */}
      <ScenarioPlanner
        monthlyPlan={monthlyPlan}
        summary={summary}
        onAskAgentAboutScenario={(scenarioQ) => {
          onAskAgentWithQuery(scenarioQ);
          onNavigateTab('agent');
        }}
      />

      {/* Scenario Guidance Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Demand Surge Threshold
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            Plant capacity remains unconstrained up to +12% demand increase (~4.02 Cr units). Beyond +15%, peak months exceed 70.00 Lakh monthly ceiling.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Safety Buffer Sensitivity
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            If starting inventory is reduced below 40.00 Lakh units, additional production shifts must be pre-loaded into Q1 to maintain the 10.00 Lakh threshold.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Explainer Deep Dive
          </span>
          <p className="text-slate-600 leading-relaxed font-sans text-xs">
            Click "Ask Explainer about this scenario" from any parameter state to receive an instant natural-language mathematical breakdown and impact explanation.
          </p>
        </div>
      </div>
    </div>
  );
};
