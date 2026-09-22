import React from 'react';
import { PlanningAgent } from '../components/PlanningAgent';
import { MonthlyPlanItem, PlanningSummary } from '../types/planning';

interface AgentViewProps {
  initialQuestion?: string;
  currentSummary?: PlanningSummary;
  currentMonthlyPlan?: MonthlyPlanItem[];
  onApplyPlanToApp?: (plan: MonthlyPlanItem[], summary: PlanningSummary) => void;
}

export const AgentView: React.FC<AgentViewProps> = ({
  initialQuestion,
  currentSummary,
  currentMonthlyPlan,
  onApplyPlanToApp
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <PlanningAgent
        initialQuestion={initialQuestion}
        currentSummary={currentSummary}
        currentMonthlyPlan={currentMonthlyPlan}
        onApplyPlanToApp={onApplyPlanToApp}
      />
    </div>
  );
};
