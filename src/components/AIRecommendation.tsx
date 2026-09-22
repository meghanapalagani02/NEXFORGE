import React from 'react';
import { Sparkles } from 'lucide-react';
import { PlanningSummary } from '../types/planning';

interface AIRecommendationProps {
  summary: PlanningSummary;
  onOpenWhyThisPlanModal: () => void;
  onTestScenario: () => void;
  onAskAgent: () => void;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({
  summary,
  onOpenWhyThisPlanModal,
  onTestScenario,
  onAskAgent
}) => {
  return (
    <section
      id="ai-recommendation-panel"
      className="bg-slate-900 text-white rounded-xl p-6 flex flex-col relative overflow-hidden h-full border border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] font-mono"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-orange-500/20 rounded border border-orange-500/30">
          <Sparkles className="w-4 h-4 text-orange-400" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Plan Explanation
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-300">
        Expected demand is <span className="text-white font-bold">35.95M units</span>. Current inventory reduces manufacturing requirement. Capacity is sufficient to maintain a 1.0M unit safety buffer.
      </p>

      <div className="mt-auto pt-6 space-y-2">
        <button
          id="btn-ai-why-plan"
          onClick={onOpenWhyThisPlanModal}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold rounded-lg text-slate-100 border border-slate-700 cursor-pointer"
        >
          Why this plan?
        </button>
        <button
          id="btn-ai-test-scenario"
          onClick={onTestScenario}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold rounded-lg text-slate-100 border border-slate-700 cursor-pointer"
        >
          Test a scenario
        </button>
        <button
          id="btn-ai-ask-agent"
          onClick={onAskAgent}
          className="w-full py-2 bg-orange-600 hover:bg-orange-500 transition-colors text-xs font-bold rounded-lg text-white border border-orange-500 cursor-pointer"
        >
          Open AI Planning Agent
        </button>
      </div>
    </section>
  );
};
