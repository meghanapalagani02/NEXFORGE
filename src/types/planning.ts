export interface PlanningSummary {
  forecastHorizonMonths: number;
  forecastDemand: number;
  recommendedProduction: number;
  potentialShortage: number;
  capacityConstrainedMonths: number;
  currentInventory: number;
  safetyStock: number;
  monthlyCapacity: number;
  planFeasible: boolean;
  demandCovered: boolean;
  inventoryProtected: boolean;
  capacitySufficient: boolean;
  primaryRecommendation: string;
  supportingExplanation: string;
  lastUpdated: string;
}

export interface MonthlyPlanItem {
  month: string;
  monthIndex: number;
  demand: number;
  openingInventory: number;
  requiredProduction: number;
  recommendedProduction: number;
  endingInventory: number;
  safetyStock: number;
  shortage: number;
  capacity: number;
  capacityUtilization: number;
  status: 'safe' | 'constrained' | 'shortage';
}

export interface HistoricalDemandPoint {
  period: string;
  month: string;
  demand: number;
  isForecast: boolean;
  upperBound?: number;
  lowerBound?: number;
  movingAverage?: number;
}

export interface ModelEvaluation {
  id: string;
  name: string;
  category: 'statistical' | 'machine_learning' | 'quantum';
  algorithmType: string;
  mae: number;
  rmse: number;
  mape?: number;
  isSelected: boolean;
  rationale: string;
  trainingObservations: number;
  testingObservations: number;
  characteristics: string;
  mathFormula?: string;
  hyperparameters?: Record<string, string | number>;
  quantumMetrics?: {
    qubits: number;
    circuitDepth: number;
    hamiltonianType: string;
    energyGroundState: number;
    convergenceIterations: number;
    speedupFactor: string;
  };
  forecastData?: number[];
}

export interface ScenarioParams {
  demandChangePct: number; // e.g. -20 to +30
  capacityChangePct: number; // e.g. -30 to +30
  currentInventory: number; // in units
  safetyStockTarget: number;
}

export interface ScenarioResult {
  params: ScenarioParams;
  totalDemand: number;
  recommendedProduction: number;
  totalCapacity: number;
  minEndingInventory: number;
  shortageUnits: number;
  isFeasible: boolean;
  capacityConstrained: boolean;
  inventoryRisk: boolean;
  constrainedMonths: string[];
  shortageMonths: string[];
  statusLabel: 'Feasible' | 'Capacity Constrained' | 'Inventory Risk' | 'Critical Shortage';
  businessSummary: string;
  monthlyPlan: MonthlyPlanItem[];
}

export interface AgentCannedQuestion {
  id: string;
  question: string;
  category: 'rationale' | 'scenario' | 'risk' | 'model' | 'inventory';
  shortPrompt: string;
  response: string;
  takeaway: string;
  keyStats?: { label: string; value: string; status?: 'normal' | 'positive' | 'warning' }[];
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  category?: string;
  keyStats?: { label: string; value: string; status?: 'normal' | 'positive' | 'warning' }[];
  takeaway?: string;
  reasoningSteps?: string[];
  isThinking?: boolean;
}

export type ActiveTab =
  | 'overview'
  | 'forecast'
  | 'inventory'
  | 'production'
  | 'planning'
  | 'scheduling'
  | 'scenarios'
  | 'agent'
  | 'quantum';

export interface ProductConfig {
  id: string;
  name: string;
  currentInventory: number;
  safetyStockTarget: number;
  monthlyCapacity: number;
  leadTimeWeeks: number;
  unitProductionCost: number;
  unitHoldingCost: number;
  unitShortageCost: number;
  processingTimeHours: number;
}

export interface ScheduledTask {
  id: string;
  productId: string;
  productName: string;
  machineId: string;
  machineName: string;
  quantity: number;
  processingHours: number;
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Standard';
  status: 'Scheduled' | 'In-Queue' | 'Completed';
}

export interface MachineUtilizationMetric {
  machineId: string;
  machineName: string;
  allocatedHours: number;
  totalAvailableHours: number;
  utilizationPct: number;
  isBottleneck: boolean;
  status: 'Optimal' | 'High Load' | 'Overloaded';
}

export interface QuantumExecutionResult {
  status: string;
  statusCode?: 'quantum_completed' | 'fallback_completed' | 'awaiting_backend' | 'error';
  isFeasible?: boolean;
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
  qubitCount?: number | null;
  qubitFormula?: string | null;
  qubitBreakdown?: {
    products?: number;
    periods?: number;
    discretizationBits?: number;
    totalQubits?: number;
    num_variables?: number;
  } | null;
  circuitDepth?: number | null;
  evaluatedEnergy?: number | null;
  executionTimeMs?: number | null;
  recommendedProductionPerPeriod?: number[];
  productionPlan?: Array<{
    period: number;
    monthName: string;
    demand: number;
    recommendedProduction: number;
    endingInventory: number;
    capacityUtilizationPct: number;
    unitCost: number;
    periodCost: number;
  }>;
  totalCost?: number | null;
  validationChecks?: {
    nonNegativeProduction: boolean;
    withinCapacityLimits: boolean;
    demandSatisfied: boolean;
    safetyStockMaintained: boolean;
  };
  violations?: string[];
  technicalDetails?: {
    optimizationMethod?: string;
    hamiltonianType?: string;
    qaoaAnsatz?: string;
    mixerHamiltonian?: string;
    classicalOptimizer?: string;
    qubitEncodingScheme?: string;
    simulatorBackend?: string;
    qiskitVersion?: string;
    aerVersion?: string;
    optimalBitstring?: string;
    decodedBits?: number[];
    optimalGamma?: number[];
    optimalBeta?: number[];
    measuredCounts?: Record<string, number>;
    circuitDepth?: number | null;
    executionTimeMs?: number | null;
    qubitAllocationFormula?: string;
    rawCandidateOutput?: number[];
    fallbackTriggered?: boolean;
    fallbackReason?: string | null;
    candidateViolations?: string[];
  };
}

export interface BackendConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  url: string;
  engineName: string;
  version?: string;
  lastChecked?: string;
}

/**
 * Standardized Backend-Ready Planning Interfaces (Section 20)
 */

export interface ForecastResult {
  historicalData: HistoricalDemandPoint[];
  forecastData: HistoricalDemandPoint[];
  totalForecastDemand: number;
  demandTrend: string;
  averageMonthlyDemand: number;
  confidenceSummary: string;
  demandChangePct: number;
  demandChangeExplanation: string;
  uncertaintyRiskLevel: 'Low' | 'Moderate' | 'High';
  forecastHorizonMonths: number;
  selectedProductId: string;
  modelEvaluations?: ModelEvaluation[];
}

export interface InventoryResult {
  currentInventory: number;
  forecastDemand: number;
  safetyStock: number;
  reorderRequirement: number;
  inventoryCoverageMonths: number;
  inventoryCoverageDays: number;
  stockoutRiskPct: number;
  excessStockRiskPct: number;
  leadTimeWeeks: number;
  leadTimeDays: number;
  recommendedAction: string;
  inventoryStatus: 'Healthy' | 'Watch' | 'Critical';
  monthlyTrajectory: MonthlyPlanItem[];
}

export interface ProductionPlanProductRow {
  product: string;
  productId: string;
  period: string;
  monthIndex: number;
  forecast: number;
  inventory: number;
  recommendedProduction: number;
  capacityStatus: 'Safe' | 'Constrained' | 'Shortage';
  lineCapacity: number;
  utilization: number;
}

export interface ProductionPlan {
  recommendedProduction: number;
  currentInventory: number;
  forecastDemand: number;
  productionCapacity: number;
  capacityUtilization: number;
  productionGap: number;
  expectedShortage: number;
  expectedSurplus: number;
  serviceLevel: number;
  planningHorizonMonths: number;
  items: MonthlyPlanItem[];
  productRows: ProductionPlanProductRow[];
}

export interface AgentResponse {
  query: string;
  answer: string;
  keyFactors: string[];
  suggestedAction: string;
  contextSummary?: {
    demand: number;
    production: number;
    inventory: number;
    safetyStock: number;
    utilization: number;
  };
  scenarioImpact?: string;
}

export interface QuantumOptimizationResult {
  status: 'ready' | 'running' | 'completed' | 'fallback' | 'failed' | 'awaiting_backend';
  optimization_type: 'quantum_assisted' | 'classical_deterministic' | string;
  qubits: number | null;
  variables: number | null;
  backend: string | null;
  shots: number | null;
  circuit_depth: number | null;
  objective_value: number | null;
  execution_time: number | null;
  feasible: boolean | null;
  production_plan: Array<{
    period: number | string;
    month?: string;
    demand?: number;
    recommendedProduction?: number;
    endingInventory?: number;
    capacityUtilization?: number;
  }>;
  fallback_used: boolean;
  fallback_reason?: string | null;
}
