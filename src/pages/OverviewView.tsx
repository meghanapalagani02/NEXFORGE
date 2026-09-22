import React from 'react';
import { motion } from 'motion/react';
import { IndustrialTelemetryGrid } from '../components/IndustrialTelemetryGrid';
import { DemandChart } from '../components/DemandChart';
import { ProductionChart } from '../components/ProductionChart';
import { InventoryChart } from '../components/InventoryChart';
import { ScenarioPlanner } from '../components/ScenarioPlanner';
import { ForecastDetails } from '../components/ForecastDetails';
import { PlanningDetails } from '../components/PlanningDetails';
import {
  PlanningSummary,
  MonthlyPlanItem,
  HistoricalDemandPoint,
  ActiveTab
} from '../types/planning';

interface OverviewViewProps {
  summary: PlanningSummary;
  monthlyPlan: MonthlyPlanItem[];
  historicalDemand: HistoricalDemandPoint[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenWhyThisPlan: () => void;
  onAskAgentWithQuery: (query: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  monthlyPlan,
  historicalDemand,
  onNavigateTab,
  onOpenWhyThisPlan,
  onAskAgentWithQuery
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. STARTING FACE: 3 SEPARATE INDUSTRIAL TELEMETRY BLOCKS (DEMAND, PRODUCTION, STOCK) */}
      <IndustrialTelemetryGrid
        summary={summary}
        monthlyPlan={monthlyPlan}
        onWhyThisPlan={onOpenWhyThisPlan}
        onNavigateTab={onNavigateTab}
        onAskAgent={() => onNavigateTab('agent')}
      />

      {/* 2. VISUAL EVIDENCE GRID: Demand Outlook & Master Production Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemandChart
          data={historicalDemand}
          onOpenModelDetails={() => onNavigateTab('forecast')}
        />
        <ProductionChart
          data={monthlyPlan}
          capacityMonthly={summary.monthlyCapacity}
        />
      </div>

      {/* 3. INVENTORY HEALTH & SAFETY RUNWAY */}
      <InventoryChart
        monthlyPlan={monthlyPlan}
        startingInventory={summary.currentInventory}
        safetyStockTarget={summary.safetyStock}
      />

      {/* 4. WHAT IF THINGS CHANGE? (INTERACTIVE SCENARIO SIMULATOR) */}
      <ScenarioPlanner
        monthlyPlan={monthlyPlan}
        summary={summary}
        onAskAgentAboutScenario={(scenarioQ) => {
          onAskAgentWithQuery(scenarioQ);
          onNavigateTab('agent');
        }}
      />

      {/* 5. INDUSTRIAL SYSTEM & SCHEDULE TECHNICAL DEEP-DIVE */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1 font-sans">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Technical Audit & Model Configuration
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Collapsible Telemetry
          </span>
        </div>

        <ForecastDetails defaultOpen={false} />
        <PlanningDetails monthlyPlan={monthlyPlan} defaultOpen={false} />
      </div>
    </motion.div>
  );
};
