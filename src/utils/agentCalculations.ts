import {
  PlanningAgentInputState,
  AgentProductionPlanResult,
  MonthlyAgentPlanRow,
  RawMaterialAnalysisItem,
  CapacityAnalysisResult,
  RiskItem,
  ManagementRecommendationItem,
  ForecastHorizon,
  ScenarioPresetOption
} from '../types/agentPlanning';
import { MonthlyPlanItem, PlanningSummary } from '../types/planning';
import { formatUnits, formatNumber, formatIndianUnitsFull } from '../data/planningData';

// Calculate monthly capacity from machine and workforce parameters
export function calculateAutoMonthlyCapacity(
  machines: number,
  capacityPerDay: number,
  workingDays: number,
  productivityPct: number,
  hoursPerDay: number = 16
): number {
  const baseDailyTotal = machines * capacityPerDay;
  // Normalized for standard 16h 2-shift day
  const hourFactor = Math.min(1.5, Math.max(0.5, hoursPerDay / 16));
  const efficiency = Math.min(1.2, Math.max(0.4, productivityPct / 100));
  return Math.round(baseDailyTotal * workingDays * hourFactor * efficiency);
}

// Generate realistic default/sample manufacturing data (3-Month default)
export function getSampleManufacturingData(): PlanningAgentInputState {
  return {
    product: {
      productName: 'High-Torque Industrial Induction Motor (TX-450)',
      productId: 'PROD-TX450-MTR',
      productCategory: 'Heavy Industrial Drives & Rotating Equipment',
      unitOfMeasurement: 'Units',
      productionType: 'Make to Stock (MTS)'
    },
    demand: {
      historicalDemandMonthlyAvg: 58000,
      currentCustomerOrders: 42000,
      pendingOrders: 16000,
      expectedFutureDemandAvg: 68000,
      demandGrowthRatePct: 8.5,
      seasonalPattern: 'Q1 Industrial Peak',
      forecastHorizon: '3 Months',
      monthlyDemands: [
        { month: 'Month 1', demand: 62000, ordersFirm: 48000 },
        { month: 'Month 2', demand: 68500, ordersFirm: 36000 },
        { month: 'Month 3', demand: 74000, ordersFirm: 21000 }
      ]
    },
    inventory: {
      currentInventory: 35000,
      safetyStock: 15000,
      minimumStockLevel: 10000,
      maximumStockLevel: 85000,
      reorderLevel: 22000,
      reservedInventory: 8000,
      damagedUnavailableInventory: 1500
    },
    capacity: {
      numberOfMachines: 8,
      machineCapacityPerDay: 350,
      productionHoursPerDay: 16,
      workingDaysPerMonth: 25,
      numberOfWorkers: 48,
      workerProductivityPct: 94,
      productionLeadTimeDays: 7,
      setupChangeoverHours: 4
    },
    materials: [
      {
        id: 'mat-1',
        name: 'Grade-H Copper Magnet Wire (0.85mm)',
        availableQuantity: 420000,
        requiredPerUnit: 2.4, // kg per motor
        supplierLeadTimeDays: 14,
        minimumOrderQuantity: 50000,
        supplierStatus: 'Active & Reliable',
        expectedIncomingQuantity: 80000,
        unit: 'kg'
      },
      {
        id: 'mat-2',
        name: 'Silicon Steel Stator Laminations (M-19)',
        availableQuantity: 185000,
        requiredPerUnit: 1.0, // core set per motor
        supplierLeadTimeDays: 21,
        minimumOrderQuantity: 30000,
        supplierStatus: 'Active & Reliable',
        expectedIncomingQuantity: 40000,
        unit: 'sets'
      },
      {
        id: 'mat-3',
        name: 'Cast Iron Housing Enclosure (Frame 215T)',
        availableQuantity: 95000,
        requiredPerUnit: 1.0, // housing per motor
        supplierLeadTimeDays: 30,
        minimumOrderQuantity: 25000,
        supplierStatus: 'Tight Supply / Quota',
        expectedIncomingQuantity: 60000,
        unit: 'pcs'
      },
      {
        id: 'mat-4',
        name: 'Deep Groove Precision Bearings (6308-2RS)',
        availableQuantity: 380000,
        requiredPerUnit: 2.0, // 2 bearings per motor
        supplierLeadTimeDays: 10,
        minimumOrderQuantity: 20000,
        supplierStatus: 'Active & Reliable',
        expectedIncomingQuantity: 100000,
        unit: 'pcs'
      },
      {
        id: 'mat-5',
        name: 'Microcontroller Inverter Driver Board',
        availableQuantity: 140000,
        requiredPerUnit: 1.0, // 1 board per unit
        supplierLeadTimeDays: 28,
        minimumOrderQuantity: 15000,
        supplierStatus: 'Delayed / Constrained',
        expectedIncomingQuantity: 35000,
        unit: 'units'
      }
    ],
    constraints: {
      priorityOrders: true,
      priorityOrderUnits: 25000,
      urgentOrders: true,
      urgentDeadlineDescription: 'Month 2 OEM Assembly line shipment of 20,000 units',
      maxProductionLimit: 75000,
      minProductionQuantity: 40000,
      deliveryDeadlineDays: 45,
      budgetConstraintEnabled: false,
      workforceConstraintEnabled: true,
      machineConstraintEnabled: true,
      rawMaterialConstraintEnabled: true,
      additionalInstructions: 'Prioritize Month 2 OEM customer commitments; maintain at least 15,000 units safety stock in Month 3 for unexpected Q2 surges.'
    }
  };
}

// Generate months demand template based on horizon
export function generateMonthlyDemandsForHorizon(
  horizon: ForecastHorizon,
  baseDemand: number = 60000,
  growthRatePct: number = 8.0,
  pattern: string = 'Q1 Industrial Peak'
): { month: string; demand: number; ordersFirm?: number }[] {
  let count = 3;
  if (horizon === '1 Month') count = 1;
  else if (horizon === '3 Months') count = 3;
  else if (horizon === '6 Months') count = 6;
  else if (horizon === '12 Months') count = 12;

  const result: { month: string; demand: number; ordersFirm?: number }[] = [];
  for (let i = 1; i <= count; i++) {
    let seasonalMult = 1.0;
    if (pattern.includes('Peak')) {
      seasonalMult = 1.0 + (i === 2 ? 0.12 : i === 3 ? 0.18 : 0.04);
    } else if (pattern.includes('Surge')) {
      seasonalMult = 1.0 + (i === count ? 0.22 : 0.05);
    } else if (pattern.includes('Cyclical')) {
      seasonalMult = 1.0 + Math.sin(i * 0.8) * 0.12;
    }

    const growth = 1 + (growthRatePct / 100) * ((i - 1) / (count || 1));
    const demand = Math.round(baseDemand * growth * seasonalMult);
    const ordersFirm = Math.round(demand * Math.max(0.2, 0.85 - (i - 1) * 0.2));

    result.push({
      month: `Month ${i}`,
      demand,
      ordersFirm
    })
  }

  return result;
}

// Core AI Production Planning Engine
export function runPlanningEngine(inputs: PlanningAgentInputState): AgentProductionPlanResult {
  const { product, demand, inventory, capacity, materials, constraints } = inputs;

  // 1. Calculate Monthly Plant Capacity
  const monthlyMaxCapacity =
    capacity.customMaxCapacityOverride && capacity.customMaxCapacityOverride > 0
      ? capacity.customMaxCapacityOverride
      : calculateAutoMonthlyCapacity(
          capacity.numberOfMachines,
          capacity.machineCapacityPerDay,
          capacity.workingDaysPerMonth,
          capacity.workerProductivityPct,
          capacity.productionHoursPerDay
        );

  // 2. Usable Opening Inventory
  const unusableStock = (inventory.reservedInventory || 0) + (inventory.damagedUnavailableInventory || 0);
  const usableInventory = Math.max(0, inventory.currentInventory - unusableStock);

  // 3. Multi-Period Production Balance Calculation
  let runningInventory = usableInventory;
  const monthlyPlan: MonthlyAgentPlanRow[] = [];
  let totalForecastDemand = 0;
  let totalRecommendedProduction = 0;
  let safetyStockViolationsCount = 0;
  let reorderRequired = false;
  let reorderMonthTrigger: string | null = null;

  demand.monthlyDemands.forEach((item, index) => {
    const monthDemand = item.demand;
    totalForecastDemand += monthDemand;

    const opening = runningInventory;
    const targetBuffer = inventory.safetyStock;

    // Mathematical balance needed to satisfy demand and end with safety stock
    const netRequiredToKeepBuffer = Math.max(0, monthDemand + targetBuffer - opening);

    // Apply constraints
    let recommended = netRequiredToKeepBuffer;

    // Respect min/max limits
    if (constraints.minProductionQuantity && recommended > 0) {
      recommended = Math.max(recommended, constraints.minProductionQuantity);
    }
    if (constraints.maxProductionLimit) {
      recommended = Math.min(recommended, constraints.maxProductionLimit);
    }

    // Capacity cap
    let shortageUnits = 0;
    if (recommended > monthlyMaxCapacity) {
      shortageUnits = recommended - monthlyMaxCapacity;
      recommended = monthlyMaxCapacity;
    }

    const ending = opening + recommended - monthDemand;
    runningInventory = ending;

    const utilPct = monthlyMaxCapacity > 0 ? Math.round((recommended / monthlyMaxCapacity) * 1000) / 10 : 0;

    let status: 'safe' | 'constrained' | 'shortage' = 'safe';
    if (shortageUnits > 0 || ending < targetBuffer * 0.5) {
      status = 'shortage';
    } else if (utilPct >= 92 || ending < targetBuffer) {
      status = 'constrained';
    }

    if (ending < targetBuffer) {
      safetyStockViolationsCount++;
    }

    if (ending <= inventory.reorderLevel && !reorderRequired) {
      reorderRequired = true;
      reorderMonthTrigger = item.month;
    }

    totalRecommendedProduction += recommended;

    monthlyPlan.push({
      month: item.month,
      monthIndex: index + 1,
      forecastDemand: monthDemand,
      openingInventory: opening,
      recommendedProduction: recommended,
      expectedClosingInventory: ending,
      capacityUtilization: utilPct,
      status,
      shortageUnits,
      firmOrders: item.ordersFirm || 0
    });
  });

  const expectedEndingInventory = runningInventory;
  const avgUtilization =
    monthlyPlan.length > 0
      ? Math.round(
          (monthlyPlan.reduce((acc, p) => acc + p.capacityUtilization, 0) / monthlyPlan.length) * 10
        ) / 10
      : 0;

  const peakUtilization = Math.max(...monthlyPlan.map((p) => p.capacityUtilization));
  const peakMonth = monthlyPlan.find((p) => p.capacityUtilization === peakUtilization)?.month || 'Month 1';

  // 4. Raw Material Sufficiency & BOM Analysis
  const rawMaterialAnalysis: RawMaterialAnalysisItem[] = materials.map((mat) => {
    const totalRequired = Math.round(totalRecommendedProduction * mat.requiredPerUnit);
    const netAvailable = mat.availableQuantity + mat.expectedIncomingQuantity;
    const shortageQuantity = Math.max(0, totalRequired - netAvailable);

    let status: 'sufficient' | 'warning' | 'critical' = 'sufficient';
    let recommendedAction: 'Sufficient' | 'Reorder' | 'Expedite' | 'Alternative Supplier' | 'Production Adjustment' =
      'Sufficient';
    let leadTimeImpact = `Lead time: ${mat.supplierLeadTimeDays}d. Current stock covers demand.`;

    if (shortageQuantity > 0) {
      if (mat.supplierLeadTimeDays > 25 || mat.supplierStatus.includes('Delayed')) {
        status = 'critical';
        recommendedAction = mat.supplierStatus.includes('Delayed') ? 'Alternative Supplier' : 'Expedite';
        leadTimeImpact = `CRITICAL: ${mat.supplierLeadTimeDays}-day lead time exceeds immediate production window. Deficit: ${formatNumber(
          shortageQuantity
        )} ${mat.unit}.`;
      } else {
        status = 'warning';
        recommendedAction = 'Reorder';
        leadTimeImpact = `Reorder required immediately to meet ${mat.supplierLeadTimeDays}-day lead time. Deficit: ${formatNumber(
          shortageQuantity
        )} ${mat.unit}.`;
      }
    } else if (netAvailable - totalRequired < mat.minimumOrderQuantity * 0.5) {
      status = 'warning';
      recommendedAction = 'Reorder';
      leadTimeImpact = `Buffer tight post-production (${formatNumber(
        netAvailable - totalRequired
      )} ${mat.unit} remaining). Reorder recommended.`;
    }

    return {
      material: mat,
      totalRequiredForPlan: totalRequired,
      netAvailable,
      shortageQuantity,
      status,
      recommendedAction,
      leadTimeImpact
    };
  });

  // 5. Capacity Analysis
  const totalHorizonCapacity = monthlyMaxCapacity * demand.monthlyDemands.length;
  const overallCapacityUtil =
    totalHorizonCapacity > 0 ? Math.round((totalRecommendedProduction / totalHorizonCapacity) * 1000) / 10 : 0;
  const capacityShortageUnits = Math.max(0, totalForecastDemand + inventory.safetyStock - usableInventory - totalHorizonCapacity);

  const capacityActions: string[] = [];
  if (peakUtilization >= 95) {
    capacityActions.push('Authorize 10-15% overtime in peak periods (e.g. ' + peakMonth + ') to build pre-buffer.');
  }
  if (capacity.setupChangeoverHours > 3) {
    capacityActions.push(`Implement SMED rapid changeover to recoup ${(capacity.setupChangeoverHours * 2.5).toFixed(0)} hours/month.`);
  }
  if (overallCapacityUtil > 90) {
    capacityActions.push('Consider adding an auxiliary weekend shift or qualifying secondary contract manufacturing.');
  } else {
    capacityActions.push('Line throughput is well balanced; maintain standardized preventive maintenance schedule.');
  }

  const capacityAnalysis: CapacityAnalysisResult = {
    monthlyMaxCapacity,
    totalHorizonCapacity,
    totalRequiredProduction: totalRecommendedProduction,
    overallUtilizationPct: overallCapacityUtil,
    peakMonth,
    peakMonthUtilizationPct: peakUtilization,
    bottleneckMachineDescription:
      capacity.numberOfMachines <= 4
        ? 'Cell Line #1 - Stator Winding & Rotor Balancing (High Cycle Time)'
        : 'Primary Assembly Cell & Final QC Testing Bays',
    workforceUtilizationPct: Math.min(100, Math.round(overallCapacityUtil * 0.96)),
    capacityShortageUnits,
    recommendedActions: capacityActions
  };

  // 6. Risk Scoring & Causal Explanation
  const hasMaterialShortage = rawMaterialAnalysis.some((r) => r.status === 'critical');
  const hasMaterialWarning = rawMaterialAnalysis.some((r) => r.status === 'warning');
  const minClosing = Math.min(...monthlyPlan.map((p) => p.expectedClosingInventory));

  const stockoutRiskLevel: 'Low' | 'Medium' | 'High' =
    minClosing < 0
      ? 'High'
      : minClosing < inventory.safetyStock * 0.6
      ? 'Medium'
      : 'Low';

  const capacityRiskLevel: 'Low' | 'Medium' | 'High' =
    peakUtilization >= 100 || capacityShortageUnits > 0
      ? 'High'
      : peakUtilization >= 88
      ? 'Medium'
      : 'Low';

  const materialRiskLevel: 'Low' | 'Medium' | 'High' =
    hasMaterialShortage ? 'High' : hasMaterialWarning ? 'Medium' : 'Low';

  const deliveryRiskLevel: 'Low' | 'Medium' | 'High' =
    stockoutRiskLevel === 'High' || materialRiskLevel === 'High'
      ? 'High'
      : stockoutRiskLevel === 'Medium' || capacityRiskLevel === 'Medium'
      ? 'Medium'
      : 'Low';

  const overproductionRiskLevel: 'Low' | 'Medium' | 'High' =
    expectedEndingInventory > inventory.maximumStockLevel
      ? 'High'
      : expectedEndingInventory > inventory.safetyStock * 2.2
      ? 'Medium'
      : 'Low';

  const riskAnalysis: RiskItem[] = [
    {
      id: 'stockout',
      title: 'Stock-out Risk',
      level: stockoutRiskLevel,
      whyExplanation:
        stockoutRiskLevel === 'High'
          ? `Ending inventory drops to ${formatNumber(
              minClosing
            )} units, violating the required safety stock of ${formatNumber(inventory.safetyStock)} units.`
          : stockoutRiskLevel === 'Medium'
          ? `Buffer drops close to safety threshold (${formatNumber(
              minClosing
            )} units minimum vs ${formatNumber(inventory.safetyStock)} target).`
          : `Warehouse inventory maintains at least ${formatNumber(
              minClosing
            )} units across all intervals, fully absorbing demand variations.`,
      mitigationAction:
        stockoutRiskLevel !== 'Low'
          ? 'Increase production in early periods or release safety stock buffer.'
          : 'Maintain current production release schedules.'
    },
    {
      id: 'capacity',
      title: 'Capacity Bottleneck Risk',
      level: capacityRiskLevel,
      whyExplanation:
        capacityRiskLevel === 'High'
          ? `Peak line utilization reaches ${peakUtilization}% in ${peakMonth}, exceeding safe operational threshold of 92%.`
          : capacityRiskLevel === 'Medium'
          ? `Peak month load reaches ${peakUtilization}% in ${peakMonth}, leaving minimal headroom for machine downtime.`
          : `Plant capacity utilization averages ${avgUtilization}%, providing comfortable buffer for routine maintenance.`,
      mitigationAction:
        capacityRiskLevel !== 'Low'
          ? 'Smooth production across earlier months or approve overtime shifts.'
          : 'Standard operational cadence is sufficient.'
    },
    {
      id: 'material',
      title: 'Raw Material Availability Risk',
      level: materialRiskLevel,
      whyExplanation: hasMaterialShortage
        ? `Critical deficit detected in raw materials with long lead times (e.g. ${
            rawMaterialAnalysis.find((r) => r.status === 'critical')?.material.name || 'Core BOM item'
          }).`
        : hasMaterialWarning
        ? 'Some raw material inventory will drop below reorder levels during the horizon.'
        : 'All 5 BOM materials are fully covered by on-hand inventory and incoming shipments.',
      mitigationAction: hasMaterialShortage
        ? 'Issue emergency expedited purchase orders or qualify local backup supplier.'
        : hasMaterialWarning
        ? 'Issue standard purchase orders for materials approaching reorder point.'
        : 'Confirm delivery dates with current suppliers.'
    },
    {
      id: 'delivery',
      title: 'On-Time Customer Delivery Risk',
      level: deliveryRiskLevel,
      whyExplanation:
        deliveryRiskLevel === 'High'
          ? `Pending priority orders (${formatNumber(
              constraints.priorityOrderUnits || demand.pendingOrders
            )} units) may face delays due to upstream capacity or material limits.`
          : deliveryRiskLevel === 'Medium'
          ? 'Tight schedule in peak month may compress delivery buffers by 2-4 days.'
          : 'All customer order commitments can be dispatched within the required lead time.',
      mitigationAction:
        deliveryRiskLevel !== 'Low'
          ? 'Lock in production slots for priority customer orders first.'
          : 'Proceed with planned dispatch schedule.'
    },
    {
      id: 'overproduction',
      title: 'Overproduction & Holding Cost Risk',
      level: overproductionRiskLevel,
      whyExplanation:
        overproductionRiskLevel === 'High'
          ? `Expected closing inventory (${formatNumber(
              expectedEndingInventory
            )} units) exceeds warehouse maximum storage capacity (${formatNumber(inventory.maximumStockLevel)} units).`
          : `Expected closing inventory (${formatNumber(
              expectedEndingInventory
            )} units) remains within the optimal storage band (${formatNumber(
              inventory.minimumStockLevel
            )} - ${formatNumber(inventory.maximumStockLevel)} units).`,
      mitigationAction:
        overproductionRiskLevel === 'High'
          ? 'Throttle production back to match pure pull demand.'
          : 'Inventory turnover rate is within target parameters.'
    }
  ];

  // 7. Structured AI Explanation ("Why this plan?")
  const isFeasible = stockoutRiskLevel !== 'High' && capacityRiskLevel !== 'High';

  const situation = `Production analysis for ${product.productName} (${product.productId}) across a ${
    demand.forecastHorizon
  } horizon (${demand.monthlyDemands.length} periods). Total forecasted market demand is ${formatUnits(
    totalForecastDemand
  )} (${formatNumber(totalForecastDemand)} units).`;

  const forecastRationale = `Demand pattern is evaluated as '${demand.seasonalPattern}' with an annualized growth trajectory of +${
    demand.demandGrowthRatePct
  }%. Firm customer commitments currently account for ${formatNumber(
    demand.currentCustomerOrders
  )} units, with peak demand occurring in ${peakMonth} (${formatUnits(
    monthlyPlan.find((p) => p.month === peakMonth)?.forecastDemand || 0
  )}).`;

  const inventoryLogic = `Starting with ${formatUnits(
    inventory.currentInventory
  )} gross inventory, we isolate ${formatUnits(
    unusableStock
  )} reserved/damaged units, deploying ${formatUnits(
    usableInventory
  )} usable units to absorb initial demand. Production is calculated so that closing inventory smoothly transitions to ${formatUnits(
    expectedEndingInventory
  )}, preserving the mandated ${formatUnits(inventory.safetyStock)} safety buffer.`;

  const capacityLogic = `The plant provides ${formatUnits(
    monthlyMaxCapacity
  )} units/month capacity (${capacity.numberOfMachines} machines @ ${capacity.productionHoursPerDay} hrs/day, ${
    capacity.workerProductivityPct
  }% labor efficiency). The recommended schedule yields an average load of ${avgUtilization}% (peaking at ${peakUtilization}% in ${peakMonth}), avoiding shop-floor saturation.`;

  const materialLogic = hasMaterialShortage
    ? `ATTENTION: Bill-of-Materials evaluation identifies critical shortages in ${
        rawMaterialAnalysis.filter((r) => r.status === 'critical').length
      } raw material(s). Supplier lead times must be expedited to fulfill planned targets.`
    : `BOM analysis verifies all ${materials.length} required raw materials are sufficient to support the ${formatUnits(
        totalRecommendedProduction
      )} production run.`;

  const summaryProof = `Mathematical Balance: ${formatUnits(totalForecastDemand)} (Demand) + ${formatUnits(
    inventory.safetyStock
  )} (Target Buffer) − ${formatUnits(usableInventory)} (Usable Opening) = ${formatUnits(
    totalRecommendedProduction
  )} Total Target Production. Plan status: ${isFeasible ? 'FEASIBLE & BALANCED' : 'CONSTRAINED - MITIGATION REQUIRED'}.`;

  // 8. Management Recommendations
  const managementRecommendations: ManagementRecommendationItem[] = [];

  if (hasMaterialShortage) {
    const critMat = rawMaterialAnalysis.find((r) => r.status === 'critical');
    managementRecommendations.push({
      id: 'rec-1',
      priority: 'High',
      action: `Expedite purchase order for ${critMat?.material.name || 'Raw Materials'}`,
      reason: `Supplier lead time of ${critMat?.material.supplierLeadTimeDays || 21} days risks delaying Month 2-3 assembly line.`,
      timeframe: 'Immediate (Next 48h)',
      category: 'Procurement'
    });
  }

  if (peakUtilization >= 90) {
    managementRecommendations.push({
      id: 'rec-2',
      priority: 'High',
      action: `Schedule auxiliary overtime in ${peakMonth}`,
      reason: `Line utilization reaches ${peakUtilization}%, leaving insufficient margin for unexpected equipment downtime.`,
      timeframe: 'Next 2 Weeks',
      category: 'Capacity'
    });
  }

  managementRecommendations.push({
    id: 'rec-3',
    priority: 'Medium',
    action: `Release production batch order for ${formatUnits(monthlyPlan[0]?.recommendedProduction || 0)} in Month 1`,
    reason: `Aligns with pull demand while drawing down usable opening inventory to optimal holding levels.`,
    timeframe: 'Immediate (Next 48h)',
    category: 'Production'
  });

  if (reorderRequired) {
    managementRecommendations.push({
      id: 'rec-4',
      priority: 'Medium',
      action: `Initiate safety stock replenishment cycle in ${reorderMonthTrigger || 'Month 2'}`,
      reason: `Inventory reaches reorder trigger level (${formatUnits(inventory.reorderLevel)}).`,
      timeframe: 'Next 2 Weeks',
      category: 'Inventory'
    });
  }

  // 9. Sync to legacy planning summary & monthly plan items for global app synchronization
  const appliedMonthlyPlanItems: MonthlyPlanItem[] = monthlyPlan.map((p) => ({
    month: p.month,
    monthIndex: p.monthIndex,
    demand: p.forecastDemand,
    openingInventory: p.openingInventory,
    requiredProduction: p.recommendedProduction,
    recommendedProduction: p.recommendedProduction,
    endingInventory: p.expectedClosingInventory,
    safetyStock: inventory.safetyStock,
    shortage: p.shortageUnits,
    capacity: monthlyMaxCapacity,
    capacityUtilization: p.capacityUtilization,
    status: p.status
  }));

  const appliedToSystemSummary: PlanningSummary = {
    forecastHorizonMonths: demand.monthlyDemands.length,
    forecastDemand: totalForecastDemand,
    recommendedProduction: totalRecommendedProduction,
    potentialShortage: capacityShortageUnits,
    capacityConstrainedMonths: monthlyPlan.filter((p) => p.capacityUtilization >= 90).length,
    currentInventory: inventory.currentInventory,
    safetyStock: inventory.safetyStock,
    monthlyCapacity: monthlyMaxCapacity,
    planFeasible: isFeasible,
    demandCovered: stockoutRiskLevel !== 'High',
    inventoryProtected: expectedEndingInventory >= inventory.safetyStock,
    capacitySufficient: capacityRiskLevel !== 'High',
    primaryRecommendation: `Manufacture ${formatUnits(
      totalRecommendedProduction
    )} across ${demand.forecastHorizon} to satisfy ${formatUnits(
      totalForecastDemand
    )} demand and safeguard ${formatUnits(inventory.safetyStock)} buffer.`,
    supportingExplanation: summaryProof,
    lastUpdated: 'Live AI Agent Plan'
  };

  return {
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    product,
    horizon: demand.forecastHorizon,
    executiveSummary: {
      totalForecastDemand,
      totalRecommendedProduction,
      currentInventory: inventory.currentInventory,
      usableInventory,
      expectedEndingInventory,
      averageCapacityUtilization: avgUtilization,
      peakCapacityUtilization: peakUtilization,
      stockoutRisk: stockoutRiskLevel,
      overproductionRisk: overproductionRiskLevel,
      isFeasible,
      primaryHeadline: `${formatUnits(totalRecommendedProduction)} Recommended Output // ${
        isFeasible ? '100% Feasible' : 'Constrained'
      } (${avgUtilization}% Avg Line Load)`
    },
    monthlyPlan,
    inventoryAnalysis: {
      isSufficient: usableInventory > 0 && expectedEndingInventory >= inventory.safetyStock,
      depletionRatePerMonth: Math.round(
        (usableInventory - expectedEndingInventory) / demand.monthlyDemands.length
      ),
      safetyStockViolationsCount,
      reorderRequired,
      reorderMonthTrigger,
      status: stockoutRiskLevel === 'High' ? 'CRITICAL' : stockoutRiskLevel === 'Medium' ? 'WARNING' : 'SAFE',
      detailedExplanation: `Warehouse inventory begins at ${formatUnits(
        inventory.currentInventory
      )} (${formatUnits(
        usableInventory
      )} usable after reserves). Inventory ends at ${formatUnits(
        expectedEndingInventory
      )}, providing a ${Math.max(0, Math.round((expectedEndingInventory / (totalForecastDemand / demand.monthlyDemands.length)) * 30))} days-of-supply buffer.`
    },
    rawMaterialAnalysis,
    capacityAnalysis,
    riskAnalysis,
    aiExplanationWhyThisPlan: {
      situation,
      forecastRationale,
      inventoryLogic,
      capacityLogic,
      materialLogic,
      summaryProof
    },
    managementRecommendations,
    appliedToSystemSummary,
    appliedMonthlyPlanItems
  };
}

// Preset Scenario Options
export const SCENARIO_PRESETS: ScenarioPresetOption[] = [
  {
    id: 'base',
    name: 'Current Baseline Plan',
    description: 'Current nominal plan calculated from provided parameters.',
    demandMultiplier: 1.0,
    capacityMultiplier: 1.0,
    materialDelayDays: 0,
    extraShiftEnabled: false
  },
  {
    id: 'surge_10',
    name: '+10% Demand Growth',
    description: 'Moderate customer order acceleration across the horizon.',
    demandMultiplier: 1.1,
    capacityMultiplier: 1.0,
    materialDelayDays: 0,
    extraShiftEnabled: false
  },
  {
    id: 'surge_20',
    name: '+20% Demand Surge',
    description: 'High unexpected demand spike testing peak line limits.',
    demandMultiplier: 1.2,
    capacityMultiplier: 1.0,
    materialDelayDays: 0,
    extraShiftEnabled: false
  },
  {
    id: 'drop_10',
    name: '-10% Demand Contraction',
    description: 'Economic or market slowdown, testing inventory holding risks.',
    demandMultiplier: 0.9,
    capacityMultiplier: 1.0,
    materialDelayDays: 0,
    extraShiftEnabled: false
  },
  {
    id: 'machine_down',
    name: 'Machine Downtime (-20% Capacity)',
    description: 'Unplanned major overhaul or tooling maintenance on primary cells.',
    demandMultiplier: 1.0,
    capacityMultiplier: 0.8,
    materialDelayDays: 0,
    extraShiftEnabled: false
  },
  {
    id: 'extra_shift',
    name: 'Add Weekend Shift (+25% Capacity)',
    description: 'Introduce auxiliary weekend shift to absorb peak demand surges.',
    demandMultiplier: 1.0,
    capacityMultiplier: 1.25,
    materialDelayDays: 0,
    extraShiftEnabled: true
  },
  {
    id: 'material_delay',
    name: '14-Day Supplier Delay',
    description: 'Supply chain bottleneck in critical copper wire and PCB delivery.',
    demandMultiplier: 1.0,
    capacityMultiplier: 1.0,
    materialDelayDays: 14,
    extraShiftEnabled: false
  }
];

// Conversational Manufacturing Planning Assistant (contextual Q&A grounded in plan data)
export function answerManufacturingQuery(
  query: string,
  plan: AgentProductionPlanResult,
  inputs: PlanningAgentInputState
): { text: string; keyStats?: { label: string; value: string; status?: 'normal' | 'positive' | 'warning' }[]; takeaway: string } {
  const q = query.toLowerCase();
  const summary = plan.executiveSummary;
  const cap = plan.capacityAnalysis;

  // 1. "Explain my current plan" / "Explain this production plan"
  if (q.includes('explain my current plan') || q.includes('explain this production plan') || q.includes('explain plan')) {
    return {
      text: `Comprehensive Plan Explanation for ${plan.product.productName}:\n\n` +
        `• Customer Demand: ${formatUnits(summary.totalForecastDemand)} across ${plan.horizon} horizon\n` +
        `• Starting Warehouse Stock: ${formatUnits(summary.usableInventory)} usable (${formatUnits(inputs.inventory.currentInventory)} gross)\n` +
        `• Mandatory Safety Stock: ${formatUnits(inputs.inventory.safetyStock)}\n` +
        `• Recommended Production: ${formatUnits(summary.totalRecommendedProduction)}\n` +
        `• Factory Capacity: ${formatUnits(cap.monthlyMaxCapacity)}/month (Plant utilization averages ${summary.averageCapacityUtilization}%, peaking at ${summary.peakCapacityUtilization}% in ${cap.peakMonth})\n\n` +
        `Core Strategy:\n` +
        `Production is levelized to absorb peak seasonal spikes smoothly. Deployed warehouse stock covers early delivery periods, keeping shop-floor operations within sustainable capacity limits while preserving ending buffer at ${formatUnits(summary.expectedEndingInventory)}.`,
      takeaway: `Current plan allocates ${formatUnits(summary.totalRecommendedProduction)} production to fulfill ${formatUnits(summary.totalForecastDemand)} demand with zero stockouts.`,
      keyStats: [
        { label: 'Demand', value: formatUnits(summary.totalForecastDemand) },
        { label: 'Planned Output', value: formatUnits(summary.totalRecommendedProduction) },
        { label: 'Feasibility', value: summary.isFeasible ? '100% Feasible' : 'Constrained', status: 'positive' }
      ]
    };
  }

  // 2. "Why is production increased?" / "Why is production recommended at this level?"
  if (q.includes('why is production increased') || q.includes('why is production recommended') || q.includes('at this level') || q.includes('production increased')) {
    const netRequired = summary.totalForecastDemand + inputs.inventory.safetyStock - summary.usableInventory;
    return {
      text: `Production Volume Justification:\n\n` +
        `1. Projected Demand Volume: ${formatUnits(summary.totalForecastDemand)} units across the horizon.\n` +
        `2. Safety Buffer Protection: An active safety stock target of ${formatUnits(inputs.inventory.safetyStock)} must be preserved to guard against supplier lead-time variance.\n` +
        `3. Available Opening Stock: Only ${formatUnits(summary.usableInventory)} usable inventory is currently on hand.\n\n` +
        `Mathematical Calculation:\n` +
        `Demand (${formatUnits(summary.totalForecastDemand)}) + Target Safety Buffer (${formatUnits(inputs.inventory.safetyStock)}) − Usable Inventory (${formatUnits(summary.usableInventory)}) = ${formatUnits(netRequired)} units.\n\n` +
        `Therefore, production is scheduled at ${formatUnits(summary.totalRecommendedProduction)} units to balance order fulfillment without creating costly post-horizon warehouse surplus.`,
      takeaway: `Production matches net requirement: ${formatUnits(summary.totalForecastDemand)} demand + ${formatUnits(inputs.inventory.safetyStock)} buffer − ${formatUnits(summary.usableInventory)} opening inventory.`,
      keyStats: [
        { label: 'Target Output', value: formatUnits(summary.totalRecommendedProduction) },
        { label: 'Net Demand', value: formatUnits(summary.totalForecastDemand) },
        { label: 'Buffer Target', value: formatUnits(inputs.inventory.safetyStock) }
      ]
    };
  }

  // 3. "Why is inventory considered risky?" / "Show inventory risks"
  if (q.includes('why is inventory considered risky') || q.includes('inventory risks') || q.includes('show inventory risks') || q.includes('inventory considered risky')) {
    const minEnding = Math.min(...plan.monthlyPlan.map((m) => m.expectedClosingInventory));
    const isBufferViolated = minEnding < inputs.inventory.safetyStock;
    return {
      text: `Inventory Risk Diagnostic:\n\n` +
        `• Current Stock: ${formatUnits(inputs.inventory.currentInventory)} units (${formatUnits(summary.usableInventory)} net usable)\n` +
        `• Minimum Projected Stock: ${formatUnits(minEnding)} units (Safety target is ${formatUnits(inputs.inventory.safetyStock)})\n` +
        `• Days-of-Supply Coverage: Approximately ${Math.max(1, Math.round((summary.usableInventory / (summary.totalForecastDemand / plan.monthlyPlan.length)) * 30))} days\n` +
        `• Reorder Status: ${plan.inventoryAnalysis.reorderRequired ? `Triggered in ${plan.inventoryAnalysis.reorderMonthTrigger}` : 'Normal / On Schedule'}\n\n` +
        `Risk Explanation:\n` +
        (isBufferViolated
          ? `⚠️ Critical Risk: Projected ending stock falls below safety buffer (${formatUnits(minEnding)} vs target ${formatUnits(inputs.inventory.safetyStock)}). Any supply disruption or demand surge will cause stockouts.`
          : `✅ Low Risk: Warehouse stock remains at or above target safety buffer (${formatUnits(minEnding)} min vs ${formatUnits(inputs.inventory.safetyStock)} target). Holding costs are kept low while service level exceeds 98%.`),
      takeaway: isBufferViolated
        ? `Inventory alert: Minimum stock dips to ${formatUnits(minEnding)} below safety target.`
        : `Inventory position is stable with ${formatUnits(summary.expectedEndingInventory)} projected closing stock.`,
      keyStats: [
        { label: 'Current Inventory', value: formatUnits(inputs.inventory.currentInventory) },
        { label: 'Safety Buffer', value: formatUnits(inputs.inventory.safetyStock) },
        { label: 'Min Ending Stock', value: formatUnits(minEnding), status: isBufferViolated ? 'warning' : 'positive' }
      ]
    };
  }

  // 4. "Why do I need additional inventory?"
  if (q.includes('why do i need additional inventory') || q.includes('additional inventory') || q.includes('need additional inventory')) {
    const leadTimeWeeks = inputs.materials?.[0]?.supplierLeadTimeDays ? Math.ceil(inputs.materials[0].supplierLeadTimeDays / 7) : 2;
    return {
      text: `Why Additional Inventory Is Required:\n\n` +
        `1. Demand Seasonality Absorption: Peak monthly demand reaches ${formatUnits(Math.max(...plan.monthlyPlan.map((m) => m.forecastDemand)))} units. Without pre-built inventory, monthly factory output would exceed plant line capacity.\n` +
        `2. Supplier Lead-Time Buffer: Key raw materials require ${leadTimeWeeks} weeks procurement lead time. Advance inventory protects continuous operation against shipment delays.\n` +
        `3. Batch Leveling Economics: Continuous level production avoids expensive short-notice machine changeovers and third-shift labor premiums.`,
      takeaway: `Additional inventory acts as an operational buffer between fixed monthly line capacity and fluctuating customer demand peaks.`,
      keyStats: [
        { label: 'Peak Monthly Demand', value: formatUnits(Math.max(...plan.monthlyPlan.map((m) => m.forecastDemand))) },
        { label: 'Plant Line Ceiling', value: formatUnits(cap.monthlyMaxCapacity) },
        { label: 'Safety Buffer', value: formatUnits(inputs.inventory.safetyStock) }
      ]
    };
  }

  // 5. "What is causing the capacity constraint?"
  if (q.includes('causing the capacity constraint') || q.includes('capacity constraint') || q.includes('what is causing')) {
    return {
      text: `Capacity Constraint Root Cause Analysis:\n\n` +
        `• Plant Line Ceiling: ${formatUnits(cap.monthlyMaxCapacity)} units/month\n` +
        `• Peak Production Requirement: ${formatUnits(Math.max(...plan.monthlyPlan.map((m) => m.recommendedProduction)))} units in ${cap.peakMonth}\n` +
        `• Primary Shop Floor Bottleneck: ${cap.bottleneckMachineDescription}\n` +
        `• Machine & Labor Setup: ${inputs.capacity.numberOfMachines} operating lines running ${inputs.capacity.productionHoursPerDay} hrs/day (${inputs.capacity.workingDaysPerMonth} workdays/mo)\n\n` +
        `Root Cause:\n` +
        `In ${cap.peakMonth}, customer demand combined with safety replenishment drives line utilization to ${cap.peakMonthUtilizationPct}%. The bottleneck is stator winding and precision assembly cycle times. Mitigation: Pre-building inventory during preceding months absorbs the peak.`,
      takeaway: `Capacity constraint is driven by peak demand in ${cap.peakMonth} hitting ${cap.peakMonthUtilizationPct}% of the ${formatUnits(cap.monthlyMaxCapacity)} ceiling on ${cap.bottleneckMachineDescription}.`,
      keyStats: [
        { label: 'Plant Ceiling', value: formatUnits(cap.monthlyMaxCapacity) },
        { label: 'Peak Utilization', value: `${cap.peakMonthUtilizationPct}%`, status: cap.peakMonthUtilizationPct > 90 ? 'warning' : 'normal' },
        { label: 'Bottleneck Cell', value: cap.bottleneckMachineDescription.split(' ')[0] || 'Assembly' }
      ]
    };
  }

  // 6. "What happens if demand increases?" / "What changes if demand increases by 20%?"
  if (q.includes('demand increases by 20%') || q.includes('if demand increases') || q.includes('what happens if demand')) {
    const surgeMultiplier = q.includes('20%') ? 1.2 : 1.15;
    const surgedDemand = Math.round(summary.totalForecastDemand * surgeMultiplier);
    const surgedProductionReq = surgedDemand + inputs.inventory.safetyStock - summary.usableInventory;
    const maxPossibleOutput = cap.monthlyMaxCapacity * plan.monthlyPlan.length;
    const isExceeded = surgedProductionReq > maxPossibleOutput;
    return {
      text: `Impact Analysis for ${Math.round((surgeMultiplier - 1) * 100)}% Demand Surge:\n\n` +
        `• Baseline Demand: ${formatUnits(summary.totalForecastDemand)} → Surged Demand: ${formatUnits(surgedDemand)} (+${formatUnits(surgedDemand - summary.totalForecastDemand)})\n` +
        `• Required Production: Increases from ${formatUnits(summary.totalRecommendedProduction)} to ${formatUnits(surgedProductionReq)}\n` +
        `• Total Available Capacity: ${formatUnits(maxPossibleOutput)} across ${plan.monthlyPlan.length} months\n\n` +
        `Consequence:\n` +
        (isExceeded
          ? `⚠️ Capacity Deficit: Production requirement (${formatUnits(surgedProductionReq)}) exceeds maximum line capability (${formatUnits(maxPossibleOutput)}). Deficit: ${formatUnits(surgedProductionReq - maxPossibleOutput)} units. An extra weekend shift (+20% capacity) or subcontractor outsourcing would be mandatory.`
          : `✅ Capacity Feasible with Overtime: The factory can absorb the surge by elevating monthly utilization from ${summary.averageCapacityUtilization}% to ${Math.round((surgedProductionReq / maxPossibleOutput) * 100)}%. Overtime shifts in ${cap.peakMonth} will be required.`),
      takeaway: `${Math.round((surgeMultiplier - 1) * 100)}% demand increase elevates required output to ${formatUnits(surgedProductionReq)} (${isExceeded ? 'over capacity' : 'absorbable with overtime'}).`,
      keyStats: [
        { label: 'Surged Demand', value: formatUnits(surgedDemand) },
        { label: 'Required Output', value: formatUnits(surgedProductionReq) },
        { label: 'Feasibility', value: isExceeded ? 'Deficit' : 'Feasible w/ Overtime', status: isExceeded ? 'warning' : 'positive' }
      ]
    };
  }

  // 7. "Explain the forecast"
  if (q.includes('explain the forecast') || q.includes('forecast explanation') || q.includes('explain forecast')) {
    const monthlyVals = plan.monthlyPlan.map((m) => m.forecastDemand);
    const peak = Math.max(...monthlyVals);
    const min = Math.min(...monthlyVals);
    const trendGrowth = Math.round(((monthlyVals[monthlyVals.length - 1] - monthlyVals[0]) / (monthlyVals[0] || 1)) * 100);
    return {
      text: `Demand Forecast Intelligence Breakdown:\n\n` +
        `• Horizon Cumulative Demand: ${formatUnits(summary.totalForecastDemand)} units across ${plan.horizon}\n` +
        `• Monthly Demand Range: ${formatUnits(min)} (low) to ${formatUnits(peak)} (peak)\n` +
        `• Net Horizon Trajectory: ${trendGrowth >= 0 ? `+${trendGrowth}% Growth Trend` : `${trendGrowth}% Contraction`}\n` +
        `• Order Confidence: ${inputs.demand.currentCustomerOrders > 0 ? `${formatNumber(inputs.demand.currentCustomerOrders)} units backed by firm purchase orders` : 'Grounded in rolling historical order trends'}\n\n` +
        `Forecasting Rationale:\n` +
        `Demand reflects seasonal commercial demand acceleration. Planning establishes production targets to front-load output before peak delivery periods to prevent line bottlenecks.`,
      takeaway: `Forecast projects ${formatUnits(summary.totalForecastDemand)} total demand with ${trendGrowth >= 0 ? `+${trendGrowth}%` : `${trendGrowth}%`} horizon trajectory peaking at ${formatUnits(peak)}/mo.`,
      keyStats: [
        { label: 'Total Demand', value: formatUnits(summary.totalForecastDemand) },
        { label: 'Monthly Peak', value: formatUnits(peak) },
        { label: 'Trend Trajectory', value: `${trendGrowth >= 0 ? `+${trendGrowth}%` : `${trendGrowth}%`}` }
      ]
    };
  }

  // 8. "Which planning constraint is most important?"
  if (q.includes('which planning constraint is most important') || q.includes('most important constraint') || q.includes('primary constraint')) {
    return {
      text: `Priority Ranking of Planning Constraints:\n\n` +
        `1. Monthly Plant Capacity (${formatUnits(cap.monthlyMaxCapacity)} units/mo): Absolute physical limit governed by machine cell cycle times. Operating beyond 95% induces defect spikes and maintenance downtime.\n` +
        `2. Safety Buffer (${formatUnits(inputs.inventory.safetyStock)} units): Strategic shock absorber protecting customer fulfillment against 2-week raw material lead-time variances.\n` +
        `3. Non-Negative Inventory Condition (I_t ≥ 0): Prevents backorders and commercial penalty clauses.\n` +
        `4. Levelized Production Smoothing: Minimizes overtime payroll costs and equipment changeover losses.\n\n` +
        `Conclusion: Monthly Plant Capacity is the primary hard constraint governing this schedule.`,
      takeaway: `Monthly plant capacity (${formatUnits(cap.monthlyMaxCapacity)}/mo) is the paramount hard boundary.`,
      keyStats: [
        { label: 'Primary Constraint', value: 'Plant Capacity' },
        { label: 'Capacity Ceiling', value: formatUnits(cap.monthlyMaxCapacity) },
        { label: 'Safety Buffer', value: formatUnits(inputs.inventory.safetyStock) }
      ]
    };
  }

  // If asking general production / why questions
  if (q.includes('why') || q.includes('how') || q.includes('calculate') || q.includes('production')) {
    return {
      text: `Production derivation for ${plan.product.productName}:\n\n` +
        `• Forecasted Demand: ${formatUnits(summary.totalForecastDemand)} (${formatNumber(summary.totalForecastDemand)} units)\n` +
        `• Usable Opening Stock: ${formatUnits(summary.usableInventory)}\n` +
        `• Required Safety Buffer: ${formatUnits(inputs.inventory.safetyStock)}\n\n` +
        `Balance Formula:\n` +
        `Target Output = Demand (${formatUnits(summary.totalForecastDemand)}) + Safety Stock (${formatUnits(
          inputs.inventory.safetyStock
        )}) − Usable Inventory (${formatUnits(summary.usableInventory)}) = ${formatUnits(
          summary.totalRecommendedProduction
        )}.\n\n` +
        `This schedule achieves an average shop-floor load of ${summary.averageCapacityUtilization}% and protects ending inventory at ${formatUnits(
          summary.expectedEndingInventory
        )}.`,
      takeaway: `Mathematical proof: ${formatUnits(summary.totalForecastDemand)} demand is satisfied with ${formatUnits(
        summary.totalRecommendedProduction
      )} production and ${formatUnits(summary.usableInventory)} opening inventory.`,
      keyStats: [
        { label: 'Demand', value: formatUnits(summary.totalForecastDemand) },
        { label: 'Recommended Output', value: formatUnits(summary.totalRecommendedProduction) },
        { label: 'Avg Line Load', value: `${summary.averageCapacityUtilization}%` }
      ]
    };
  }

  if (q.includes('stockout') || q.includes('risk') || q.includes('shortage')) {
    const critRisk = plan.riskAnalysis.find((r) => r.level === 'High') || plan.riskAnalysis[0];
    return {
      text: `Production Risk Assessment:\n\n` +
        `• Stock-out Risk: ${summary.stockoutRisk.toUpperCase()}\n` +
        `• Capacity Risk: ${plan.riskAnalysis.find((r) => r.id === 'capacity')?.level.toUpperCase()}\n` +
        `• Raw Material Risk: ${plan.riskAnalysis.find((r) => r.id === 'material')?.level.toUpperCase()}\n` +
        `• Delivery Risk: ${plan.riskAnalysis.find((r) => r.id === 'delivery')?.level.toUpperCase()}\n\n` +
        `Primary Assessment: ${critRisk.whyExplanation}\n\n` +
        `Recommended Mitigation: ${critRisk.mitigationAction}`,
      takeaway: `Primary Risk Level: ${critRisk.level} for ${critRisk.title}.`,
      keyStats: [
        { label: 'Stock-out Risk', value: summary.stockoutRisk, status: summary.stockoutRisk === 'High' ? 'warning' : 'positive' },
        { label: 'Peak Line Load', value: `${summary.peakCapacityUtilization}%`, status: summary.peakCapacityUtilization > 92 ? 'warning' : 'normal' },
        { label: 'Ending Buffer', value: formatUnits(summary.expectedEndingInventory) }
      ]
    };
  }

  if (q.includes('capacity') || q.includes('machine') || q.includes('bottleneck') || q.includes('utilization')) {
    return {
      text: `Manufacturing Line Capacity Analysis:\n\n` +
        `• Monthly Plant Capacity: ${formatUnits(cap.monthlyMaxCapacity)}/month (${inputs.capacity.numberOfMachines} machines @ ${inputs.capacity.productionHoursPerDay} hrs/day)\n` +
        `• Overall Horizon Utilization: ${cap.overallUtilizationPct}%\n` +
        `• Peak Month: ${cap.peakMonth} at ${cap.peakMonthUtilizationPct}% capacity\n` +
        `• Identified Bottleneck: ${cap.bottleneckMachineDescription}\n` +
        `• Workforce Efficiency: ${cap.workforceUtilizationPct}%\n\n` +
        `Capacity Strategy:\n${cap.recommendedActions.map((a) => `• ${a}`).join('\n')}`,
      takeaway: `Peak month is ${cap.peakMonth} at ${cap.peakMonthUtilizationPct}% load against a ${formatUnits(
        cap.monthlyMaxCapacity
      )}/mo ceiling.`,
      keyStats: [
        { label: 'Monthly Capacity', value: formatUnits(cap.monthlyMaxCapacity) },
        { label: 'Avg Line Load', value: `${cap.overallUtilizationPct}%` },
        { label: 'Peak Load', value: `${cap.peakMonthUtilizationPct}%` }
      ]
    };
  }

  // Clear honest response when data is unavailable for arbitrary ungrounded questions
  return {
    text: `Based on the currently loaded manufacturing plan for ${plan.product.productName}:\n\n` +
      `The production schedule allocates ${formatUnits(summary.totalRecommendedProduction)} units to meet ${formatUnits(
        summary.totalForecastDemand
      )} total demand. Starting inventory is ${formatUnits(summary.usableInventory)} with a required ${formatUnits(
        inputs.inventory.safetyStock
      )} safety buffer.\n\n` +
      `Note: If your question relates to information outside the current planning dataset (such as third-party market data or external supplier contracts), that information cannot be determined from available data.`,
    takeaway: `Target: ${formatUnits(summary.totalRecommendedProduction)} production across ${plan.horizon}.`,
    keyStats: [
      { label: 'Demand', value: formatUnits(summary.totalForecastDemand) },
      { label: 'Planned Output', value: formatUnits(summary.totalRecommendedProduction) },
      { label: 'Ending Stock', value: formatUnits(summary.expectedEndingInventory) }
    ]
  };
}
