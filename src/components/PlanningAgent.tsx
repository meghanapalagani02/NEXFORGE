import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight,
  Layers,
  Factory,
  Boxes,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import {
  MonthlyPlanItem,
  PlanningSummary
} from '../types/planning';
import {
  PlanningAgentInputState,
  AgentProductionPlanResult
} from '../types/agentPlanning';
import {
  getSampleManufacturingData,
  runPlanningEngine
} from '../utils/agentCalculations';
import { PlanningForm } from './agent/PlanningForm';
import { PlanningReport } from './agent/PlanningReport';
import { AIChatAssistantPanel } from './agent/AIChatAssistantPanel';

interface PlanningAgentProps {
  initialQuestion?: string;
  currentSummary?: PlanningSummary;
  currentMonthlyPlan?: MonthlyPlanItem[];
  onApplyPlanToApp?: (plan: MonthlyPlanItem[], summary: PlanningSummary) => void;
}

type WorkspaceView = 'empty' | 'form' | 'report';

const GENERATION_STEPS = [
  'Analyzing historical demand & growth rate...',
  'Checking warehouse inventory & safety buffer...',
  'Evaluating shop floor machine & labor capacity...',
  'Evaluating raw material BOM & lead times...',
  'Generating optimized multi-period production plan...',
  'Formulating causal explanations & recommendations...'
];

export const PlanningAgent: React.FC<PlanningAgentProps> = ({
  initialQuestion,
  currentSummary,
  currentMonthlyPlan,
  onApplyPlanToApp
}) => {
  // Input State initialized with realistic sample data
  const [inputState, setInputState] = useState<PlanningAgentInputState>(() =>
    getSampleManufacturingData()
  );

  // Active View State: 'form' (Input Workspace) vs 'report' (Generated Planning Report)
  const [activeView, setActiveView] = useState<WorkspaceView>('report');

  // Loading State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingStepIndex, setGeneratingStepIndex] = useState<number>(0);

  // Computed Plan Result
  const [planResult, setPlanResult] = useState<AgentProductionPlanResult>(() =>
    runPlanningEngine(getSampleManufacturingData())
  );

  // Chat toggle on report view
  const [showChatPanel, setShowChatPanel] = useState<boolean>(true);

  // Staged Generation Effect
  const handleStartGeneration = () => {
    setIsGenerating(true);
    setGeneratingStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < GENERATION_STEPS.length) {
        setGeneratingStepIndex(step);
      } else {
        clearInterval(interval);
        const result = runPlanningEngine(inputState);
        setPlanResult(result);
        setIsGenerating(false);
        setActiveView('report');
      }
    }, 280);
  };

  const handleLoadSampleData = () => {
    const sample = getSampleManufacturingData();
    setInputState(sample);
    const result = runPlanningEngine(sample);
    setPlanResult(result);
  };

  return (
    <div id="ai-planning-agent-workspace" className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white border border-orange-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm border border-orange-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base sm:text-lg font-bold text-slate-900 leading-tight">
                AI Planning Agent
              </h1>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300 font-mono text-[9px] font-bold">
                ENTERPRISE CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-sans">
              Intelligent demand, inventory and production decision support
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Quick Voice Mode */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <div className="flex items-center gap-1.5 bg-orange-50/80 p-1 rounded-lg border border-orange-200 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                activeView === 'form'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planning Input Form
            </button>
            <button
              type="button"
              onClick={() => setActiveView('report')}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                activeView === 'report'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Generated AI Plan
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Option if activeView === 'empty' */}
      {activeView === 'empty' && (
        <div className="bg-white border border-orange-200 rounded-xl p-10 text-center space-y-4 max-w-2xl mx-auto shadow-2xs font-mono">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Let's build your production plan.</h2>
            <p className="text-xs text-slate-600 font-sans max-w-lg mx-auto leading-relaxed">
              Enter your demand, inventory, production capacity and material information. The AI Planning Agent will analyze the situation and generate a data-driven production recommendation.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Start Planning →
            </button>
            <button
              type="button"
              onClick={() => {
                handleLoadSampleData();
                setActiveView('report');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-slate-300"
            >
              Load Sample Manufacturing Data
            </button>
          </div>
        </div>
      )}

      {/* Form Input View */}
      {activeView === 'form' && (
        <PlanningForm
          inputState={inputState}
          onChange={setInputState}
          onGeneratePlan={handleStartGeneration}
          onLoadSampleData={handleLoadSampleData}
          isGenerating={isGenerating}
          generatingStep={GENERATION_STEPS[generatingStepIndex]}
        />
      )}

      {/* Report View */}
      {activeView === 'report' && (
        <div className="space-y-6">
          <PlanningReport
            planResult={planResult}
            inputs={inputState}
            onModifyInputs={() => setActiveView('form')}
            onApplyToDashboard={onApplyPlanToApp}
          />

          {/* Section 18: Contextual AI Conversational Assistant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                <span>K. AI Conversational Assistant (Read Aloud Supported)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowChatPanel(!showChatPanel)}
                className="text-xs font-mono text-orange-700 hover:underline cursor-pointer"
              >
                {showChatPanel ? 'Hide Assistant' : 'Show Assistant'}
              </button>
            </div>

            {showChatPanel && (
              <AIChatAssistantPanel
                planResult={planResult}
                inputs={inputState}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
