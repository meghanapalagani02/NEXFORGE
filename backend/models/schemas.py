from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Common Data Types
class HistoricalPoint(BaseModel):
    period: str
    month: str
    demand: float
    isForecast: bool = False
    upperBound: Optional[float] = None
    lowerBound: Optional[float] = None

class ProductInput(BaseModel):
    id: str = "PROD-01"
    name: str = "Industrial Transmission Unit"
    currentInventory: float = 6000000.0
    safetyStockTarget: float = 1000000.0
    monthlyCapacity: float = 7000000.0
    leadTimeWeeks: float = 3.0
    unitProductionCost: float = 45.0
    unitHoldingCost: float = 4.5
    unitShortageCost: float = 120.0
    processingTimeHours: float = 1.2

# 1. Forecasting Schemas
class ForecastRequest(BaseModel):
    historicalData: List[HistoricalPoint]
    horizonMonths: int = 6
    selectedModel: Optional[str] = "Auto-Best"
    confidenceInterval: float = 0.95

class ModelMetric(BaseModel):
    id: str
    name: str
    category: str
    mae: float
    rmse: float
    mape: float
    r2: float
    rank: int
    isBest: bool
    businessDescription: str

class ForecastResponse(BaseModel):
    forecastData: List[HistoricalPoint]
    totalForecastDemand: float
    demandTrend: Literal["Increasing", "Decreasing", "Stable"]
    averageMonthlyDemand: float
    demandVariabilityStdDev: float
    bestModelName: str
    modelEvaluations: List[ModelMetric]
    confidenceSummary: str

# 2. Inventory Intelligence Schemas
class InventoryItemAnalysis(BaseModel):
    productId: str
    productName: str
    currentStock: float
    forecastDemand: float
    safetyStock: float
    inventoryBuffer: float
    expectedEndingInventory: float
    runwayMonths: float
    reorderPoint: float
    stockoutRisk: Literal["Healthy", "Low Buffer Warning", "Critical Stockout Risk"]
    statusColor: Literal["green", "yellow", "red"]
    businessExplanation: str

class InventoryAnalysisRequest(BaseModel):
    products: List[ProductInput]
    forecastHorizonMonths: int = 6
    demandVariabilityStdDev: Optional[float] = None

class InventoryAnalysisResponse(BaseModel):
    items: List[InventoryItemAnalysis]
    overallHealth: Literal["Optimal", "Attention Needed", "High Risk"]
    totalCurrentStock: float
    totalSafetyStock: float
    totalForecastConsumption: float
    summaryRecommendation: str

# 3. Production Planning Schemas
class ProductionPlanRequest(BaseModel):
    products: List[ProductInput]
    monthlyDemands: List[float]
    horizonMonths: int = 6
    monthlyCapacity: float = 7000000.0
    allowOvertime: bool = False
    solverMode: Literal["classical_lp", "hybrid_quantum"] = "classical_lp"

class MonthlyPlanRow(BaseModel):
    month: str
    monthIndex: int
    demand: float
    openingInventory: float
    requiredProduction: float
    recommendedProduction: float
    endingInventory: float
    safetyStock: float
    shortage: float
    capacity: float
    capacityUtilization: float
    status: Literal["safe", "constrained", "shortage"]

class ProductionPlanResponse(BaseModel):
    monthlyPlan: List[MonthlyPlanRow]
    totalDemand: float
    totalProduction: float
    totalCost: float
    productionCost: float
    holdingCost: float
    shortageCost: float
    serviceLevelPct: float
    averageCapacityUtilization: float
    isFeasible: bool = True
    constrainedMonthsCount: int
    whyThisPlan: Dict[str, Any]
    optimizationMethodUsed: str

# 4. Production Scheduling Schemas
class MachineConfig(BaseModel):
    id: str
    name: str
    hourlyCapacityPerMonth: float = 350.0
    costPerHour: float = 120.0
    efficiencyPct: float = 95.0

class SchedulingRequest(BaseModel):
    productionQuantities: Dict[str, float]  # productId -> quantity
    machines: List[MachineConfig]
    planningMonth: str = "Month 1"
    workDaysInMonth: int = 22
    hoursPerShift: int = 8
    shiftsPerDay: int = 2

class ScheduledJob(BaseModel):
    id: str
    productId: str
    productName: str
    machineId: str
    machineName: str
    quantity: float
    processingHours: float
    startDate: str
    endDate: str
    priority: Literal["High", "Medium", "Standard"]
    status: Literal["Scheduled", "In-Queue", "Completed"]

class MachineUtilization(BaseModel):
    machineId: str
    machineName: str
    allocatedHours: float
    totalAvailableHours: float
    utilizationPct: float
    isBottleneck: bool
    status: Literal["Optimal", "High Load", "Overloaded"]

class SchedulingResponse(BaseModel):
    schedule: List[ScheduledJob]
    machineUtilizations: List[MachineUtilization]
    bottleneckMachineName: Optional[str]
    totalScheduledHours: float
    totalAvailableHours: float
    averageUtilizationPct: float
    schedulingStatus: str

# 5. Scenario Simulation Schemas
class ScenarioRequest(BaseModel):
    baseDemand: float
    baseCapacity: float
    baseInventory: float
    baseSafetyStock: float
    demandChangePct: float = 0.0      # -20% to +20%
    capacityChangePct: float = 0.0    # -20% to +20%
    leadTimeOption: Literal["Normal", "Increased"] = "Normal"
    inventoryBufferOption: Literal["Low", "Normal", "High"] = "Normal"

class ScenarioMetrics(BaseModel):
    forecastDemand: float
    productionQuantity: float
    endingInventory: float
    totalCost: float
    shortageUnits: float
    serviceLevelPct: float
    capacityUtilizationPct: float
    isFeasible: bool

class ScenarioResponse(BaseModel):
    baseline: ScenarioMetrics
    scenario: ScenarioMetrics
    deltas: Dict[str, float]
    businessImpactSummary: str
    statusLabel: str

# 6. Quantum Optimization Schemas
class QuantumOptimizationRequest(BaseModel):
    products: List[ProductInput]
    demands: List[float]
    capacityPerPeriod: float
    discretizationBits: int = 2  # Bits per variable
    shots: int = 1024
    pSteps: int = 1
    useHardwareSimulator: bool = True

class QuantumOptimizationResponse(BaseModel):
    status: str
    statusCode: str = "quantum_completed"  # "quantum_completed", "classical_fallback", "quantum_infeasible_fallback", "quantum_error_fallback"
    isFeasible: bool
    fallbackUsed: bool
    fallbackReason: Optional[str] = None
    qubitCount: int
    qubitFormula: str
    qubitBreakdown: Dict[str, int]
    circuitDepth: int
    evaluatedEnergy: float
    executionTimeMs: float
    recommendedProductionPerPeriod: List[float]
    productionPlan: Optional[List[Dict[str, Any]]] = None
    totalCost: float
    validationChecks: Dict[str, bool]
    violations: List[str] = []
    technicalDetails: Dict[str, Any]
    statusMessage: Optional[str] = None
    quantum: Optional[Dict[str, Any]] = None
    solution: Optional[Dict[str, Any]] = None
    validation: Optional[Dict[str, Any]] = None
    fallback: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

# 7. AI Planning Explainer Schemas
class PlanningAgentRequest(BaseModel):
    userQuery: str
    currentDemand: float
    currentProduction: float
    currentInventory: float
    currentSafetyStock: float
    currentCapacity: float
    activeScenario: Optional[Dict[str, Any]] = None

class PlanningAgentResponse(BaseModel):
    answer: str
    keyFactors: List[str]
    supportingStats: Dict[str, Any]
    suggestedAction: str
    confidenceScore: float = 0.98

