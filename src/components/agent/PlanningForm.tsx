import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Factory,
  Boxes,
  TrendingUp,
  Package,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  Shield,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  PlanningAgentInputState,
  ProductionType,
  ForecastHorizon,
  SeasonalPattern,
  RawMaterialItem
} from '../../types/agentPlanning';
import {
  calculateAutoMonthlyCapacity,
  generateMonthlyDemandsForHorizon,
  getSampleManufacturingData
} from '../../utils/agentCalculations';
import { formatNumber, formatUnits } from '../../data/planningData';

interface PlanningFormProps {
  inputState: PlanningAgentInputState;
  onChange: (newState: PlanningAgentInputState) => void;
  onGeneratePlan: () => void;
  onLoadSampleData: () => void;
  isGenerating: boolean;
  generatingStep: string;
}

export const PlanningForm: React.FC<PlanningFormProps> = ({
  inputState,
  onChange,
  onGeneratePlan,
  onLoadSampleData,
  isGenerating,
  generatingStep
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'product' | 'demand' | 'inventory' | 'capacity' | 'materials' | 'constraints'>('all');

  // Auto-calculated capacity preview
  const autoCapacity = calculateAutoMonthlyCapacity(
    inputState.capacity.numberOfMachines,
    inputState.capacity.machineCapacityPerDay,
    inputState.capacity.workingDaysPerMonth,
    inputState.capacity.workerProductivityPct,
    inputState.capacity.productionHoursPerDay
  );

  // Handle Horizon Change
  const handleHorizonChange = (horizon: ForecastHorizon) => {
    const updatedMonths = generateMonthlyDemandsForHorizon(
      horizon,
      inputState.demand.historicalDemandMonthlyAvg || 60000,
      inputState.demand.demandGrowthRatePct || 8.0,
      inputState.demand.seasonalPattern
    );
    onChange({
      ...inputState,
      demand: {
        ...inputState.demand,
        forecastHorizon: horizon,
        monthlyDemands: updatedMonths
      }
    });
  };

  // Add Raw Material Item
  const handleAddMaterial = () => {
    const newMat: RawMaterialItem = {
      id: `mat-${Date.now()}`,
      name: 'New Raw Material Item',
      availableQuantity: 50000,
      requiredPerUnit: 1.0,
      supplierLeadTimeDays: 14,
      minimumOrderQuantity: 10000,
      supplierStatus: 'Active & Reliable',
      expectedIncomingQuantity: 0,
      unit: 'units'
    };
    onChange({
      ...inputState,
      materials: [...inputState.materials, newMat]
    });
  };

  // Remove Material
  const handleRemoveMaterial = (id: string) => {
    onChange({
      ...inputState,
      materials: inputState.materials.filter((m) => m.id !== id)
    });
  };

  // Update Material
  const handleUpdateMaterial = (id: string, updates: Partial<RawMaterialItem>) => {
    onChange({
      ...inputState,
      materials: inputState.materials.map((m) => (m.id === id ? { ...m, ...updates } : m))
    });
  };

  // Update monthly demand table cell
  const handleMonthlyDemandChange = (index: number, val: number) => {
    const updated = [...inputState.demand.monthlyDemands];
    if (updated[index]) {
      updated[index] = { ...updated[index], demand: Math.max(0, val) };
      onChange({
        ...inputState,
        demand: {
          ...inputState.demand,
          monthlyDemands: updated
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Sample Data Trigger */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <h3 className="font-mono text-sm font-bold text-slate-900">
              Manufacturing Planning Input Workspace
            </h3>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl font-sans">
            Enter product parameters, demand outlook, inventory balances, shop-floor capacity, and raw material supply. The AI Planning Agent will synthesize a constraint-optimized production schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onLoadSampleData}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-orange-50 border border-orange-300 text-orange-800 text-xs font-mono font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          All Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('product')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'product'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          A. Product
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('demand')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'demand'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          B. Demand (3-Mo Default)
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('inventory')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          C. Inventory
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('capacity')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'capacity'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          D. Capacity & Plant
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('materials')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'materials'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          E. Raw Materials ({inputState.materials.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('constraints')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'constraints'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-orange-200 hover:bg-orange-50'
          }`}
        >
          F. Constraints & Directives
        </button>
      </div>

      <div className="space-y-6">
        {/* SECTION A: PRODUCT INFORMATION */}
        {(activeSection === 'all' || activeSection === 'product') && (
          <div className="bg-white rounded-xl border border-orange-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION A — Product Information
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Step 1 of 6</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Product Name</label>
                <input
                  type="text"
                  value={inputState.product.productName}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      product: { ...inputState.product, productName: e.target.value }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-sans text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                  placeholder="e.g. Industrial Motor TX-450"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Product ID / SKU</label>
                <input
                  type="text"
                  value={inputState.product.productId}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      product: { ...inputState.product, productId: e.target.value }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                  placeholder="e.g. PROD-TX450-MTR"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Product Category</label>
                <input
                  type="text"
                  value={inputState.product.productCategory}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      product: { ...inputState.product, productCategory: e.target.value }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-sans text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                  placeholder="e.g. Heavy Industrial Equipment"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Unit of Measurement (UOM)</label>
                <input
                  type="text"
                  value={inputState.product.unitOfMeasurement}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      product: { ...inputState.product, unitOfMeasurement: e.target.value }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                  placeholder="e.g. Units, Lakh, Batches"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-600 font-medium">Production Strategy</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Make to Stock (MTS)', 'Make to Order (MTO)', 'Hybrid (Assemble-to-Order)'] as ProductionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...inputState,
                          product: { ...inputState.product, productionType: type }
                        })
                      }
                      className={`px-2.5 py-2 rounded-lg text-center text-[11px] font-semibold border transition-all cursor-pointer truncate ${
                        inputState.product.productionType === type
                          ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: DEMAND INFORMATION */}
        {(activeSection === 'all' || activeSection === 'demand') && (
          <div className="bg-white rounded-xl border border-orange-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-orange-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION B — Demand Outlook & Forecast Horizon
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-orange-50 p-1 rounded-lg border border-orange-200">
                <span className="text-[10px] font-mono text-slate-500 px-1.5">Horizon:</span>
                {(['1 Month', '3 Months', '6 Months', '12 Months'] as ForecastHorizon[]).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHorizonChange(h)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      inputState.demand.forecastHorizon === h
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-orange-950'
                    }`}
                  >
                    {h === '3 Months' ? '3 Months (Primary)' : h}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Historical Monthly Avg Demand</label>
                <input
                  type="number"
                  value={inputState.demand.historicalDemandMonthlyAvg}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      demand: {
                        ...inputState.demand,
                        historicalDemandMonthlyAvg: Number(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Current Confirmed Orders</label>
                <input
                  type="number"
                  value={inputState.demand.currentCustomerOrders}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      demand: {
                        ...inputState.demand,
                        currentCustomerOrders: Number(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Pending / Quotation Orders</label>
                <input
                  type="number"
                  value={inputState.demand.pendingOrders}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      demand: {
                        ...inputState.demand,
                        pendingOrders: Number(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Demand Growth Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputState.demand.demandGrowthRatePct}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      demand: {
                        ...inputState.demand,
                        demandGrowthRatePct: Number(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Monthly Forecast Demand Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-800">
                  Monthly Forecast Breakdown ({inputState.demand.monthlyDemands.length} Periods)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Total Horizon Demand: {formatUnits(inputState.demand.monthlyDemands.reduce((a, b) => a + b.demand, 0))}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {inputState.demand.monthlyDemands.map((m, idx) => (
                  <div key={m.month} className="p-2.5 bg-orange-50/50 border border-orange-200/80 rounded-lg space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-600 font-bold text-[11px]">
                      <span>{m.month}</span>
                      <span className="text-[9px] text-orange-700 font-medium">P{idx + 1}</span>
                    </div>
                    <input
                      type="number"
                      value={m.demand}
                      onChange={(e) => handleMonthlyDemandChange(idx, Number(e.target.value) || 0)}
                      className="w-full bg-white border border-orange-200 rounded px-2 py-1 text-slate-900 text-xs font-mono focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                    <div className="text-[10px] text-slate-400 truncate">
                      {formatUnits(m.demand)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: INVENTORY INFORMATION */}
        {(activeSection === 'all' || activeSection === 'inventory') && (
          <div className="bg-white rounded-xl border border-orange-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-orange-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION C — Inventory Levels & Buffers
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Step 3 of 6</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Current Warehouse Inventory</label>
                <input
                  type="number"
                  value={inputState.inventory.currentInventory}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      inventory: { ...inputState.inventory, currentInventory: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
                <div className="text-[10px] text-slate-400">{formatUnits(inputState.inventory.currentInventory)}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Safety Stock Target</label>
                <input
                  type="number"
                  value={inputState.inventory.safetyStock}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      inventory: { ...inputState.inventory, safetyStock: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
                <div className="text-[10px] text-slate-400">{formatUnits(inputState.inventory.safetyStock)}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Reorder Level Trigger</label>
                <input
                  type="number"
                  value={inputState.inventory.reorderLevel}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      inventory: { ...inputState.inventory, reorderLevel: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
                <div className="text-[10px] text-slate-400">{formatUnits(inputState.inventory.reorderLevel)}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Max Warehouse Capacity Limit</label>
                <input
                  type="number"
                  value={inputState.inventory.maximumStockLevel}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      inventory: { ...inputState.inventory, maximumStockLevel: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
                <div className="text-[10px] text-slate-400">{formatUnits(inputState.inventory.maximumStockLevel)}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Reserved Stock (Committed POs)</label>
                <input
                  type="number"
                  value={inputState.inventory.reservedInventory}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      inventory: { ...inputState.inventory, reservedInventory: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Damaged / Quarantine Stock</label>
                <input
                  type="number"
                  value={inputState.inventory.damagedUnavailableInventory}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      inventory: { ...inputState.inventory, damagedUnavailableInventory: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900 font-bold">Net Usable Opening Stock</span>
                  <span className="text-emerald-800 font-bold text-sm">
                    {formatUnits(
                      Math.max(
                        0,
                        inputState.inventory.currentInventory -
                          (inputState.inventory.reservedInventory || 0) -
                          (inputState.inventory.damagedUnavailableInventory || 0)
                      )
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Derived from Current Inventory minus Reserved & Quarantine quantities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION D: PRODUCTION CAPACITY */}
        {(activeSection === 'all' || activeSection === 'capacity') && (
          <div className="bg-white rounded-xl border border-orange-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-orange-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-orange-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION D — Production Capacity & Shop Floor
                </h4>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-600">Calculated Plant Capacity:</span>
                <span className="font-bold text-slate-900">{formatUnits(autoCapacity)}/mo</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Number of Active Machines</label>
                <input
                  type="number"
                  value={inputState.capacity.numberOfMachines}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, numberOfMachines: Number(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Machine Output (Units/Day/Machine)</label>
                <input
                  type="number"
                  value={inputState.capacity.machineCapacityPerDay}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, machineCapacityPerDay: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Production Hours per Day</label>
                <input
                  type="number"
                  value={inputState.capacity.productionHoursPerDay}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, productionHoursPerDay: Number(e.target.value) || 8 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Working Days per Month</label>
                <input
                  type="number"
                  value={inputState.capacity.workingDaysPerMonth}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, workingDaysPerMonth: Number(e.target.value) || 20 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Number of Operators / Workers</label>
                <input
                  type="number"
                  value={inputState.capacity.numberOfWorkers}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, numberOfWorkers: Number(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Worker Productivity (%)</label>
                <input
                  type="number"
                  value={inputState.capacity.workerProductivityPct}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, workerProductivityPct: Number(e.target.value) || 80 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Production Lead Time (Days)</label>
                <input
                  type="number"
                  value={inputState.capacity.productionLeadTimeDays}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, productionLeadTimeDays: Number(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 font-medium">Setup / Changeover (Hours)</label>
                <input
                  type="number"
                  value={inputState.capacity.setupChangeoverHours}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      capacity: { ...inputState.capacity, setupChangeoverHours: Number(e.target.value) || 0 }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION E: RAW MATERIALS */}
        {(activeSection === 'all' || activeSection === 'materials') && (
          <div className="bg-white rounded-xl border border-orange-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION E — Bill of Materials (BOM) & Raw Material Availability
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Material</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-orange-200 bg-orange-50/70 text-slate-700">
                    <th className="py-2.5 px-3 text-left">Material Name</th>
                    <th className="py-2.5 px-3 text-right">Available Stock</th>
                    <th className="py-2.5 px-3 text-right">Req / Finished Unit</th>
                    <th className="py-2.5 px-3 text-right">Lead Time (Days)</th>
                    <th className="py-2.5 px-3 text-right">MOQ</th>
                    <th className="py-2.5 px-3 text-left">Supplier Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {inputState.materials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-orange-50/40">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={mat.name}
                          onChange={(e) => handleUpdateMaterial(mat.id, { name: e.target.value })}
                          className="w-full bg-slate-50 border border-orange-200 rounded px-2 py-1 text-slate-900 font-sans text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          value={mat.availableQuantity}
                          onChange={(e) =>
                            handleUpdateMaterial(mat.id, {
                              availableQuantity: Number(e.target.value) || 0
                            })
                          }
                          className="w-24 bg-slate-50 border border-orange-200 rounded px-2 py-1 text-right text-slate-900 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={mat.requiredPerUnit}
                          onChange={(e) =>
                            handleUpdateMaterial(mat.id, {
                              requiredPerUnit: Number(e.target.value) || 0
                            })
                          }
                          className="w-20 bg-slate-50 border border-orange-200 rounded px-2 py-1 text-right text-slate-900 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          value={mat.supplierLeadTimeDays}
                          onChange={(e) =>
                            handleUpdateMaterial(mat.id, {
                              supplierLeadTimeDays: Number(e.target.value) || 0
                            })
                          }
                          className="w-16 bg-slate-50 border border-orange-200 rounded px-2 py-1 text-right text-slate-900 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          value={mat.minimumOrderQuantity}
                          onChange={(e) =>
                            handleUpdateMaterial(mat.id, {
                              minimumOrderQuantity: Number(e.target.value) || 0
                            })
                          }
                          className="w-20 bg-slate-50 border border-orange-200 rounded px-2 py-1 text-right text-slate-900 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={mat.supplierStatus}
                          onChange={(e) =>
                            handleUpdateMaterial(mat.id, {
                              supplierStatus: e.target.value as any
                            })
                          }
                          className="bg-slate-50 border border-orange-200 rounded px-2 py-1 text-slate-900 text-xs"
                        >
                          <option value="Active & Reliable">Active & Reliable</option>
                          <option value="Tight Supply / Quota">Tight Supply / Quota</option>
                          <option value="Delayed / Constrained">Delayed / Constrained</option>
                          <option value="Alternative Active">Alternative Active</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(mat.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove material row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION F: CONSTRAINTS & INSTRUCTIONS */}
        {(activeSection === 'all' || activeSection === 'constraints') && (
          <div className="bg-white rounded-xl border border-orange-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                  SECTION F — Business Constraints & Strategic Planning Directives
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Step 6 of 6</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputState.constraints.priorityOrders}
                    onChange={(e) =>
                      onChange({
                        ...inputState,
                        constraints: { ...inputState.constraints, priorityOrders: e.target.checked }
                      })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Priority Orders Protection</span>
                </label>
                <div className="text-[11px] text-slate-500 pl-6">
                  Allocate first production slots to priority contracts ({formatNumber(inputState.constraints.priorityOrderUnits || 0)} units).
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputState.constraints.rawMaterialConstraintEnabled}
                    onChange={(e) =>
                      onChange({
                        ...inputState,
                        constraints: {
                          ...inputState.constraints,
                          rawMaterialConstraintEnabled: e.target.checked
                        }
                      })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Enforce BOM Supply Caps</span>
                </label>
                <div className="text-[11px] text-slate-500 pl-6">
                  Flag hard production stops if raw materials cannot be procured in time.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-orange-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputState.constraints.workforceConstraintEnabled}
                    onChange={(e) =>
                      onChange({
                        ...inputState,
                        constraints: {
                          ...inputState.constraints,
                          workforceConstraintEnabled: e.target.checked
                        }
                      })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Enforce Overtime Limits</span>
                </label>
                <div className="text-[11px] text-slate-500 pl-6">
                  Cap shift overtime at maximum 15% above standard working hours.
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-600" />
                  <span>Additional Planning Directives & Management Notes</span>
                </label>
                <textarea
                  rows={3}
                  value={inputState.constraints.additionalInstructions}
                  onChange={(e) =>
                    onChange({
                      ...inputState,
                      constraints: {
                        ...inputState.constraints,
                        additionalInstructions: e.target.value
                      }
                    })
                  }
                  className="w-full bg-slate-50 border border-orange-200 rounded-lg p-3 text-slate-900 font-sans text-xs focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
                  placeholder="e.g. Prioritize OEM contracts in Month 2; maintain at least 15,000 units safety stock in Month 3 for unexpected Q2 surges."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prominent Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600/30 border border-orange-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              AI Production Planning Engine
            </div>
            <div className="text-[11px] text-slate-400">
              Synthesizes Demand + Inventory + Capacity + BOM Constraints
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isGenerating ? (
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-2.5 rounded-lg border border-slate-700 text-xs w-full sm:w-auto justify-center">
              <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
              <span className="text-slate-200 font-semibold">{generatingStep}</span>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              type="button"
              id="btn-generate-ai-plan"
              onClick={onGeneratePlan}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-lg border border-orange-400/30 cursor-pointer flex items-center justify-center gap-2 tracking-wide"
            >
              <Sparkles className="w-4 h-4" />
              <span>GENERATE AI PRODUCTION PLAN</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
