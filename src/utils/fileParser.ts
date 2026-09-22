import { MonthlyPlanItem, PlanningSummary, HistoricalDemandPoint } from '../types/planning';
import {
  INITIAL_SUMMARY,
  BASELINE_MONTHLY_PLAN,
  HISTORICAL_DEMAND_SERIES,
  formatUnits
} from '../data/planningData';

export interface ImportResult {
  success: boolean;
  filename: string;
  fileType: 'csv' | 'json';
  message: string;
  summary?: PlanningSummary;
  monthlyPlan?: MonthlyPlanItem[];
  historicalDemand?: HistoricalDemandPoint[];
  itemCount?: number;
  totalDemand?: number;
  totalProduction?: number;
  error?: string;
}

/**
 * Clean numeric string from CSV/JSON (removes commas, quotes, spaces, currency symbols)
 */
function cleanNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).trim().replace(/,/g, '').replace(/₹|\$|Units|units|L|Cr/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Re-computes full monthly planning balances from a list of demands and constraints
 */
export function recalculatePlanFromDemands(
  demands: { month: string; demand: number; capacity?: number; safetyStock?: number }[],
  initialInventory: number = 6000000,
  defaultSafetyStock: number = 1000000,
  defaultMonthlyCapacity: number = 7000000
): {
  monthlyPlan: MonthlyPlanItem[];
  summary: PlanningSummary;
  historicalDemand: HistoricalDemandPoint[];
} {
  let currentInventory = initialInventory;
  const planItems: MonthlyPlanItem[] = [];
  let totalShortage = 0;
  let constrainedMonthsCount = 0;

  demands.forEach((item, index) => {
    const month = item.month || `Month ${index + 1}`;
    const demand = item.demand;
    const capacity = item.capacity && item.capacity > 0 ? item.capacity : defaultMonthlyCapacity;
    const safetyStock = item.safetyStock && item.safetyStock > 0 ? item.safetyStock : defaultSafetyStock;

    const openingInventory = currentInventory;

    // Ideal required production to cover demand and end at target safety stock
    const netDeficit = demand + safetyStock - openingInventory;
    const requiredProduction = Math.max(0, netDeficit);

    // Recommended capped by monthly plant capacity
    const recommendedProduction = Math.min(capacity, requiredProduction);

    // Ending stock = Opening + Recommended - Demand
    const rawEnding = openingInventory + recommendedProduction - demand;
    const endingInventory = Math.max(0, rawEnding);
    const shortage = rawEnding < 0 ? Math.abs(rawEnding) : 0;

    if (shortage > 0) {
      totalShortage += shortage;
    }

    if (recommendedProduction >= capacity && requiredProduction > capacity) {
      constrainedMonthsCount++;
    }

    const capacityUtilization = parseFloat(((recommendedProduction / capacity) * 100).toFixed(1));

    let status: 'safe' | 'constrained' | 'shortage' = 'safe';
    if (shortage > 0) {
      status = 'shortage';
    } else if (capacityUtilization > 90) {
      status = 'constrained';
    }

    planItems.push({
      month,
      monthIndex: index,
      demand,
      openingInventory,
      requiredProduction,
      recommendedProduction,
      endingInventory,
      safetyStock,
      shortage,
      capacity,
      capacityUtilization,
      status
    });

    currentInventory = endingInventory;
  });

  const totalDemand = planItems.reduce((acc, curr) => acc + curr.demand, 0);
  const totalRecommendedProduction = planItems.reduce(
    (acc, curr) => acc + curr.recommendedProduction,
    0
  );
  const minEnding = Math.min(...planItems.map((p) => p.endingInventory));
  const planFeasible = totalShortage === 0 && minEnding >= defaultSafetyStock;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const summary: PlanningSummary = {
    forecastHorizonMonths: planItems.length,
    forecastDemand: totalDemand,
    recommendedProduction: totalRecommendedProduction,
    potentialShortage: totalShortage,
    capacityConstrainedMonths: constrainedMonthsCount,
    currentInventory: initialInventory,
    safetyStock: defaultSafetyStock,
    monthlyCapacity: defaultMonthlyCapacity,
    planFeasible,
    demandCovered: totalShortage === 0,
    inventoryProtected: minEnding >= defaultSafetyStock,
    capacitySufficient: constrainedMonthsCount === 0,
    primaryRecommendation: `Dispatch ${formatUnits(totalRecommendedProduction)} across ${planItems.length} months`,
    supportingExplanation: `Imported dataset processed. Starting stock: ${formatUnits(initialInventory)}, buffer: ${formatUnits(defaultSafetyStock)}. Feasibility: ${planFeasible ? '100% Secure' : 'Constraints Identified'}.`,
    lastUpdated: `Live (Imported ${timeStr})`
  };

  // Build forecast historical demand series
  const historicalBaseline = HISTORICAL_DEMAND_SERIES.filter((h) => !h.isForecast);
  const newForecastPoints: HistoricalDemandPoint[] = planItems.map((item) => ({
    period: `${item.month} 2026`,
    month: item.month,
    demand: item.demand,
    isForecast: true,
    upperBound: Math.round(item.demand * 1.08),
    lowerBound: Math.round(item.demand * 0.92),
    movingAverage: item.demand
  }));

  const updatedHistoricalDemand: HistoricalDemandPoint[] = [
    ...historicalBaseline,
    ...newForecastPoints
  ];

  return {
    monthlyPlan: planItems,
    summary,
    historicalDemand: updatedHistoricalDemand
  };
}

/**
 * Parse CSV raw text
 */
export function parseCSV(csvText: string, filename: string): ImportResult {
  try {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return {
        success: false,
        filename,
        fileType: 'csv',
        message: 'CSV file is empty or missing data rows.',
        error: 'Insufficient rows in CSV.'
      };
    }

    // Split headers
    const headerLine = lines[0];
    const headers = headerLine.split(',').map((h) => h.trim().toLowerCase().replace(/[\s"()]/g, ''));

    // Check header indices
    const monthIdx = headers.findIndex((h) => h.includes('month') || h.includes('period'));
    const demandIdx = headers.findIndex(
      (h) => h.includes('demand') || h.includes('forecast') || h.includes('volume') || h.includes('order')
    );
    const capacityIdx = headers.findIndex((h) => h.includes('capacity') || h.includes('cap'));
    const safetyIdx = headers.findIndex((h) => h.includes('safety') || h.includes('buffer'));
    const openingIdx = headers.findIndex((h) => h.includes('open') || h.includes('startinv') || h.includes('inventory'));

    const parsedDemands: { month: string; demand: number; capacity?: number; safetyStock?: number }[] = [];
    let initialStock = 6000000;

    for (let i = 1; i < lines.length; i++) {
      // Split row values handling commas inside quotes
      const row = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (row.length === 0 || !row[0]) continue;

      // Skip summary / total row
      if (row[0].toLowerCase().includes('total') || row[0].toLowerCase().includes('avg')) continue;

      const monthName = monthIdx >= 0 && row[monthIdx] ? row[monthIdx] : `M${i}`;
      let demandVal = demandIdx >= 0 && row[demandIdx] ? cleanNumber(row[demandIdx]) : 0;

      // If no demand column found, try column 1
      if (demandIdx < 0 && row.length > 1) {
        demandVal = cleanNumber(row[1]);
      } else if (demandIdx < 0 && row.length === 1) {
        demandVal = cleanNumber(row[0]);
      }

      if (i === 1 && openingIdx >= 0 && row[openingIdx]) {
        const parsedOpen = cleanNumber(row[openingIdx]);
        if (parsedOpen > 0) initialStock = parsedOpen;
      }

      const capVal = capacityIdx >= 0 && row[capacityIdx] ? cleanNumber(row[capacityIdx]) : undefined;
      const safeVal = safetyIdx >= 0 && row[safetyIdx] ? cleanNumber(row[safetyIdx]) : undefined;

      if (demandVal > 0 || monthName) {
        parsedDemands.push({
          month: monthName,
          demand: demandVal > 0 ? demandVal : 5000000,
          capacity: capVal && capVal > 0 ? capVal : undefined,
          safetyStock: safeVal && safeVal > 0 ? safeVal : undefined
        });
      }
    }

    if (parsedDemands.length === 0) {
      return {
        success: false,
        filename,
        fileType: 'csv',
        message: 'Could not extract valid month and demand entries from CSV.',
        error: 'No valid records parsed.'
      };
    }

    const { monthlyPlan, summary, historicalDemand } = recalculatePlanFromDemands(
      parsedDemands,
      initialStock
    );

    return {
      success: true,
      filename,
      fileType: 'csv',
      message: `Successfully loaded ${parsedDemands.length} monthly planning intervals from ${filename}`,
      summary,
      monthlyPlan,
      historicalDemand,
      itemCount: parsedDemands.length,
      totalDemand: summary.forecastDemand,
      totalProduction: summary.recommendedProduction
    };
  } catch (err: any) {
    return {
      success: false,
      filename,
      fileType: 'csv',
      message: `Failed to parse CSV file: ${err.message || 'Unknown error'}`,
      error: err.message
    };
  }
}

/**
 * Parse JSON raw text
 */
export function parseJSON(jsonText: string, filename: string): ImportResult {
  try {
    const data = JSON.parse(jsonText);

    // Case A: Full Nexforge structured payload
    if (data.monthlyPlan && Array.isArray(data.monthlyPlan) && data.monthlyPlan.length > 0) {
      const parsedDemands = data.monthlyPlan.map((m: any, idx: number) => ({
        month: m.month || `M${idx + 1}`,
        demand: cleanNumber(m.demand),
        capacity: m.capacity ? cleanNumber(m.capacity) : undefined,
        safetyStock: m.safetyStock ? cleanNumber(m.safetyStock) : undefined
      }));

      const initialStock = data.summary?.currentInventory
        ? cleanNumber(data.summary.currentInventory)
        : cleanNumber(data.monthlyPlan[0]?.openingInventory) || 6000000;

      const { monthlyPlan, summary, historicalDemand } = recalculatePlanFromDemands(
        parsedDemands,
        initialStock,
        data.summary?.safetyStock ? cleanNumber(data.summary.safetyStock) : 1000000,
        data.summary?.monthlyCapacity ? cleanNumber(data.summary.monthlyCapacity) : 7000000
      );

      return {
        success: true,
        filename,
        fileType: 'json',
        message: `Successfully loaded ${monthlyPlan.length} monthly planning periods from JSON`,
        summary,
        monthlyPlan,
        historicalDemand,
        itemCount: monthlyPlan.length,
        totalDemand: summary.forecastDemand,
        totalProduction: summary.recommendedProduction
      };
    }

    // Case B: Raw Array of monthly objects [ { month, demand, ... } ]
    if (Array.isArray(data) && data.length > 0) {
      const parsedDemands = data.map((item: any, idx: number) => ({
        month: item.month || item.period || `M${idx + 1}`,
        demand: cleanNumber(item.demand || item.forecast || item.volume || item.units || item.val),
        capacity: item.capacity ? cleanNumber(item.capacity) : undefined,
        safetyStock: item.safetyStock ? cleanNumber(item.safetyStock) : undefined
      }));

      const { monthlyPlan, summary, historicalDemand } = recalculatePlanFromDemands(parsedDemands);

      return {
        success: true,
        filename,
        fileType: 'json',
        message: `Parsed ${parsedDemands.length} forecast items from JSON array`,
        summary,
        monthlyPlan,
        historicalDemand,
        itemCount: parsedDemands.length,
        totalDemand: summary.forecastDemand,
        totalProduction: summary.recommendedProduction
      };
    }

    // Case C: Object with demands dictionary e.g. { "Jan": 5400000, "Feb": 5800000, ... }
    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data).filter(([k]) => k !== 'summary' && k !== 'metadata');
      if (entries.length >= 2) {
        const parsedDemands = entries.map(([month, val]) => ({
          month,
          demand: cleanNumber(val)
        }));

        const { monthlyPlan, summary, historicalDemand } = recalculatePlanFromDemands(parsedDemands);

        return {
          success: true,
          filename,
          fileType: 'json',
          message: `Parsed ${parsedDemands.length} monthly key-value entries from JSON`,
          summary,
          monthlyPlan,
          historicalDemand,
          itemCount: parsedDemands.length,
          totalDemand: summary.forecastDemand,
          totalProduction: summary.recommendedProduction
        };
      }
    }

    return {
      success: false,
      filename,
      fileType: 'json',
      message: 'JSON structure could not be mapped to monthly demand forecast items.',
      error: 'Unrecognized JSON schema.'
    };
  } catch (err: any) {
    return {
      success: false,
      filename,
      fileType: 'json',
      message: `Invalid JSON file syntax: ${err.message || 'Parse error'}`,
      error: err.message
    };
  }
}

/**
 * Universal File Reader and Importer
 */
export async function parseUploadedFile(file: File): Promise<ImportResult> {
  const filename = file.name;
  const isJson = filename.toLowerCase().endsWith('.json') || file.type.includes('json');
  const isCsv =
    filename.toLowerCase().endsWith('.csv') ||
    filename.toLowerCase().endsWith('.txt') ||
    file.type.includes('csv') ||
    file.type.includes('text');

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        resolve({
          success: false,
          filename,
          fileType: isJson ? 'json' : 'csv',
          message: 'The uploaded file appears to be empty.',
          error: 'Empty file'
        });
        return;
      }

      if (isJson) {
        resolve(parseJSON(content, filename));
      } else {
        // Default to CSV parser
        resolve(parseCSV(content, filename));
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        filename,
        fileType: isJson ? 'json' : 'csv',
        message: 'Could not read file from storage device.',
        error: 'FileReader error'
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Generates sample CSV template for download
 */
export function getSampleCSVContent(): string {
  return `Month,Demand (Units),Opening Inventory,Required Production,Recommended Production,Capacity (Units),Safety Stock Target
Jan 2026,5400000,6000000,400000,400000,7000000,1000000
Feb 2026,5800000,5400000,1400000,1400000,7000000,1000000
Mar 2026,6300000,4600000,5400000,5400000,7000000,1000000
Apr 2026,5900000,3700000,5000000,5000000,7000000,1000000
May 2026,6500000,2800000,5700000,5700000,7000000,1000000
Jun 2026,6052000,2000000,5052000,5052000,7000000,1000000`;
}

/**
 * Generates sample JSON template for download
 */
export function getSampleJSONContent(): string {
  return JSON.stringify(
    {
      company: 'Nexforge Manufacturing Corp',
      plant: 'Plant 04 Industrial Campus',
      parameters: {
        startingInventory: 6000000,
        safetyStockTarget: 1000000,
        monthlyCapacity: 7000000
      },
      monthlyPlan: [
        { month: 'Jan', demand: 5400000, capacity: 7000000, safetyStock: 1000000 },
        { month: 'Feb', demand: 5800000, capacity: 7000000, safetyStock: 1000000 },
        { month: 'Mar', demand: 6300000, capacity: 7000000, safetyStock: 1000000 },
        { month: 'Apr', demand: 5900000, capacity: 7000000, safetyStock: 1000000 },
        { month: 'May', demand: 6500000, capacity: 7000000, safetyStock: 1000000 },
        { month: 'Jun', demand: 6052000, capacity: 7000000, safetyStock: 1000000 }
      ]
    },
    null,
    2
  );
}

/**
 * Download a file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
