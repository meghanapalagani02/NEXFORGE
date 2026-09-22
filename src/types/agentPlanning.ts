import { MonthlyPlanItem, PlanningSummary } from './planning';

export type ProductionType = 'Make to Stock (MTS)' | 'Make to Order (MTO)' | 'Hybrid (Assemble-to-Order)';
export type ForecastHorizon = '1 Month' | '3 Months' | '6 Months' | '12 Months';
export type SeasonalPattern = 'Q1 Industrial Peak' | 'Steady Baseline' | 'Quarter-End Surge' | 'Cyclical / Seasonal';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type MaterialAction = 'Sufficient' | 'Reorder' | 'Expedite' | 'Alternative Supplier' | 'Production Adjustment';

export interface ProductInformation {
  productName: string;
  productId: string;
  productCategory: string;
  unitOfMeasurement: string;
  productionType: ProductionType;
}

export interface MonthlyDemandInput {
  month: string;
  demand: number;
  ordersFirm?: number;
}

export interface DemandInformation {
  historicalDemandMonthlyAvg: number;
  currentCustomerOrders: number;
  pendingOrders: number;
  expectedFutureDemandAvg: number;
  demandGrowthRatePct: number;
  seasonalPattern: SeasonalPattern;
  forecastHorizon: ForecastHorizon;
  monthlyDemands: MonthlyDemandInput[];
}

export interface InventoryInformation {
  currentInventory: number;
  safetyStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderLevel: number;
  reservedInventory: number;
  damagedUnavailableInventory: number;
}

export interface CapacityInformation {
  numberOfMachines: number;
  machineCapacityPerDay: number; // units per machine per day
  productionHoursPerDay: number;
  workingDaysPerMonth: number;
  numberOfWorkers: number;
  workerProductivityPct: number; // e.g. 95%
  productionLeadTimeDays: number;
  setupChangeoverHours: number;
  customMaxCapacityOverride?: number;
}

export interface RawMaterialItem {
  id: string;
  name: string;
  availableQuantity: number;
  requiredPerUnit: number;
  supplierLeadTimeDays: number;
  minimumOrderQuantity: number;
  supplierStatus: 'Active & Reliable' | 'Delayed / Constrained' | 'Tight Supply / Quota' | 'Alternative Active';
  expectedIncomingQuantity: number;
  unit: string;
}

export interface BusinessConstraints {
  priorityOrders: boolean;
  priorityOrderUnits: number;
  urgentOrders: boolean;
  urgentDeadlineDescription: string;
  maxProductionLimit?: number;
  minProductionQuantity?: number;
  deliveryDeadlineDays: number;
  budgetConstraintEnabled: boolean;
  workforceConstraintEnabled: boolean;
  machineConstraintEnabled: boolean;
  rawMaterialConstraintEnabled: boolean;
  additionalInstructions: string;
}

export interface PlanningAgentInputState {
  product: ProductInformation;
  demand: DemandInformation;
  inventory: InventoryInformation;
  capacity: CapacityInformation;
  materials: RawMaterialItem[];
  constraints: BusinessConstraints;
}

export interface RawMaterialAnalysisItem {
  material: RawMaterialItem;
  totalRequiredForPlan: number;
  netAvailable: number; // available + expected incoming
  shortageQuantity: number;
  status: 'sufficient' | 'warning' | 'critical';
  recommendedAction: MaterialAction;
  leadTimeImpact: string;
}

export interface CapacityAnalysisResult {
  monthlyMaxCapacity: number;
  totalHorizonCapacity: number;
  totalRequiredProduction: number;
  overallUtilizationPct: number;
  peakMonth: string;
  peakMonthUtilizationPct: number;
  bottleneckMachineDescription: string;
  workforceUtilizationPct: number;
  capacityShortageUnits: number;
  recommendedActions: string[];
}

export interface RiskItem {
  id: 'stockout' | 'capacity' | 'material' | 'delivery' | 'overproduction';
  title: string;
  level: RiskLevel;
  whyExplanation: string;
  mitigationAction: string;
}

export interface ManagementRecommendationItem {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  reason: string;
  timeframe: 'Immediate (Next 48h)' | 'Next 2 Weeks' | 'Monthly Cycle';
  category: 'Production' | 'Procurement' | 'Inventory' | 'Capacity';
}

export interface MonthlyAgentPlanRow {
  month: string;
  monthIndex: number;
  forecastDemand: number;
  openingInventory: number;
  recommendedProduction: number;
  expectedClosingInventory: number;
  capacityUtilization: number;
  status: 'safe' | 'constrained' | 'shortage';
  shortageUnits: number;
  firmOrders: number;
}

export interface AgentProductionPlanResult {
  generatedAt: string;
  product: ProductInformation;
  horizon: ForecastHorizon;
  executiveSummary: {
    totalForecastDemand: number;
    totalRecommendedProduction: number;
    currentInventory: number;
    usableInventory: number;
    expectedEndingInventory: number;
    averageCapacityUtilization: number;
    peakCapacityUtilization: number;
    stockoutRisk: RiskLevel;
    overproductionRisk: RiskLevel;
    isFeasible: boolean;
    primaryHeadline: string;
  };
  monthlyPlan: MonthlyAgentPlanRow[];
  inventoryAnalysis: {
    isSufficient: boolean;
    depletionRatePerMonth: number;
    safetyStockViolationsCount: number;
    reorderRequired: boolean;
    reorderMonthTrigger: string | null;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
    detailedExplanation: string;
  };
  rawMaterialAnalysis: RawMaterialAnalysisItem[];
  capacityAnalysis: CapacityAnalysisResult;
  riskAnalysis: RiskItem[];
  aiExplanationWhyThisPlan: {
    situation: string;
    forecastRationale: string;
    inventoryLogic: string;
    capacityLogic: string;
    materialLogic: string;
    summaryProof: string;
  };
  managementRecommendations: ManagementRecommendationItem[];
  appliedToSystemSummary: PlanningSummary;
  appliedMonthlyPlanItems: MonthlyPlanItem[];
}

export interface ScenarioPresetOption {
  id: string;
  name: string;
  description: string;
  demandMultiplier: number;
  capacityMultiplier: number;
  materialDelayDays: number;
  extraShiftEnabled: boolean;
}
