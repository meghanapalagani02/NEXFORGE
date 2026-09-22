import {
  PlanningSummary,
  MonthlyPlanItem,
  HistoricalDemandPoint,
  ModelEvaluation,
  ScenarioParams,
  ScenarioResult,
  AgentCannedQuestion
} from '../types/planning';

export const INITIAL_SUMMARY: PlanningSummary = {
  forecastHorizonMonths: 6,
  forecastDemand: 35952000, // 3.60 Cr (359.52 Lakh)
  recommendedProduction: 30952000, // 3.10 Cr (309.52 Lakh)
  potentialShortage: 0,
  capacityConstrainedMonths: 0,
  currentInventory: 6000000, // 60.00 Lakh
  safetyStock: 1000000, // 10.00 Lakh
  monthlyCapacity: 7000000, // 70.00 Lakh
  planFeasible: true,
  demandCovered: true,
  inventoryProtected: true,
  capacitySufficient: true,
  primaryRecommendation: 'Calculated production target: 3.10 Cr units (309.52 Lakh) over 6 months.',
  supportingExplanation:
    'Expected demand is 3.60 Cr units (359.52 Lakh). Existing inventory covers 50.00 Lakh units of net requirement, balancing production to 3.10 Cr units while maintaining the 10.00 Lakh units safety buffer within plant capacity.',
  lastUpdated: '24 Aug 2026'
};

export const BASELINE_MONTHLY_PLAN: MonthlyPlanItem[] = [
  {
    month: 'Jan',
    monthIndex: 1,
    demand: 5800000,
    openingInventory: 6000000,
    requiredProduction: 5200000,
    recommendedProduction: 5200000,
    endingInventory: 5400000,
    safetyStock: 1000000,
    shortage: 0,
    capacity: 7000000,
    capacityUtilization: 74.3,
    status: 'safe'
  },
  {
    month: 'Feb',
    monthIndex: 2,
    demand: 5950000,
    openingInventory: 5400000,
    requiredProduction: 5150000,
    recommendedProduction: 5150000,
    endingInventory: 4600000,
    safetyStock: 1000000,
    shortage: 0,
    capacity: 7000000,
    capacityUtilization: 73.6,
    status: 'safe'
  },
  {
    month: 'Mar',
    monthIndex: 3,
    demand: 6300000,
    openingInventory: 4600000,
    requiredProduction: 5400000,
    recommendedProduction: 5400000,
    endingInventory: 3700000,
    safetyStock: 1000000,
    shortage: 0,
    capacity: 7000000,
    capacityUtilization: 77.1,
    status: 'safe'
  },
  {
    month: 'Apr',
    monthIndex: 4,
    demand: 5750000,
    openingInventory: 3700000,
    requiredProduction: 4850000,
    recommendedProduction: 4850000,
    endingInventory: 2800000,
    safetyStock: 1000000,
    shortage: 0,
    capacity: 7000000,
    capacityUtilization: 69.3,
    status: 'safe'
  },
  {
    month: 'May',
    monthIndex: 5,
    demand: 6100000,
    openingInventory: 2800000,
    requiredProduction: 5300000,
    recommendedProduction: 5300000,
    endingInventory: 2000000,
    safetyStock: 1000000,
    shortage: 0,
    capacity: 7000000,
    capacityUtilization: 75.7,
    status: 'safe'
  },
  {
    month: 'Jun',
    monthIndex: 6,
    demand: 6052000,
    openingInventory: 2000000,
    requiredProduction: 5052000,
    recommendedProduction: 5052000,
    endingInventory: 1000000,
    safetyStock: 1000000,
    shortage: 0,
    capacity: 7000000,
    capacityUtilization: 72.2,
    status: 'safe'
  }
];

export const HISTORICAL_DEMAND_SERIES: HistoricalDemandPoint[] = [
  { period: 'Jul 24', month: 'Jul', demand: 5420000, isForecast: false },
  { period: 'Aug 24', month: 'Aug', demand: 5580000, isForecast: false },
  { period: 'Sep 24', month: 'Sep', demand: 5350000, isForecast: false },
  { period: 'Oct 24', month: 'Oct', demand: 5710000, isForecast: false },
  { period: 'Nov 24', month: 'Nov', demand: 5890000, isForecast: false },
  { period: 'Dec 24', month: 'Dec', demand: 6150000, isForecast: false },
  { period: 'Jan 25', month: 'Jan', demand: 5600000, isForecast: false },
  { period: 'Feb 25', month: 'Feb', demand: 5740000, isForecast: false },
  { period: 'Mar 25', month: 'Mar', demand: 6080000, isForecast: false },
  { period: 'Apr 25', month: 'Apr', demand: 5620000, isForecast: false },
  { period: 'May 25', month: 'May', demand: 5930000, isForecast: false },
  { period: 'Jun 25', month: 'Jun', demand: 5880000, isForecast: false },
  { period: 'Jul 25', month: 'Jul', demand: 5670000, isForecast: false },
  { period: 'Aug 25', month: 'Aug', demand: 5810000, isForecast: false },
  { period: 'Sep 25', month: 'Sep', demand: 5520000, isForecast: false },
  { period: 'Oct 25', month: 'Oct', demand: 5940000, isForecast: false },
  { period: 'Nov 25', month: 'Nov', demand: 6020000, isForecast: false },
  { period: 'Dec 25', month: 'Dec', demand: 6240000, isForecast: false, movingAverage: 6066667 },
  // Forecast bridge & 6 months ahead
  { period: 'Jan 26', month: 'Jan', demand: 5800000, isForecast: true, upperBound: 6120000, lowerBound: 5480000, movingAverage: 6020000 },
  { period: 'Feb 26', month: 'Feb', demand: 5950000, isForecast: true, upperBound: 6300000, lowerBound: 5600000, movingAverage: 5996667 },
  { period: 'Mar 26', month: 'Mar', demand: 6300000, isForecast: true, upperBound: 6710000, lowerBound: 5890000, movingAverage: 6016667 },
  { period: 'Apr 26', month: 'Apr', demand: 5750000, isForecast: true, upperBound: 6150000, lowerBound: 5350000, movingAverage: 6000000 },
  { period: 'May 26', month: 'May', demand: 6100000, isForecast: true, upperBound: 6540000, lowerBound: 5660000, movingAverage: 6050000 },
  { period: 'Jun 26', month: 'Jun', demand: 6052000, isForecast: true, upperBound: 6510000, lowerBound: 5594000, movingAverage: 5967333 }
];

export const MODEL_EVALUATIONS: ModelEvaluation[] = [
  // --- CLASSICAL / STATISTICAL MODELS ---
  {
    id: 'ma3',
    name: '3-Month Moving Average',
    category: 'statistical',
    algorithmType: 'Classical Time-Series',
    mae: 609250.0,
    rmse: 765929.77,
    mape: 3.82,
    isSelected: true,
    rationale: 'Lowest MAE and RMSE across holdout test windows. Efficiently filters transitory noise while tracking seasonal inflection.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Adaptive windowing, zero parameter drift, highest operational stability',
    mathFormula: 'Ŷ_t = (Y_{t-1} + Y_{t-2} + Y_{t-3}) / 3',
    hyperparameters: {
      'Window Length (k)': 3,
      'Weighting Scheme': 'Uniform (1/3)',
      'Outlier Threshold': '2.5σ'
    },
    forecastData: [5800000, 5950000, 6300000, 5750000, 6100000, 6052000]
  },
  {
    id: 'arima',
    name: 'ARIMA(1,1,1)',
    category: 'statistical',
    algorithmType: 'Autoregressive Integrated Moving Average',
    mae: 659300.7,
    rmse: 844288.97,
    mape: 4.14,
    isSelected: false,
    rationale: 'First-order autoregressive integrated model. Robust trend capture but slight phase lag during sharp quarter-end inflections.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Captures stochastic non-stationary trends with differential stationarity',
    mathFormula: '(1 - ϕ₁B)(1 - B)Y_t = (1 + θ₁B)ε_t',
    hyperparameters: {
      'p (Autoregression)': 1,
      'd (Differencing)': 1,
      'q (Moving Average)': 1,
      'AIC Score': 1428.4
    },
    forecastData: [5830000, 5980000, 6270000, 5780000, 6080000, 6030000]
  },
  {
    id: 'exp_smooth',
    name: 'Holt-Winters Triple Exponential Smoothing',
    category: 'statistical',
    algorithmType: 'ETS (Error-Trend-Seasonality)',
    mae: 674204.34,
    rmse: 868203.65,
    mape: 4.28,
    isSelected: false,
    rationale: 'Alpha-beta-gamma weighted decay. Highly responsive to recent demand changes, but slightly overfits short-term noise.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Decomposes level, linear trend, and additive 12-month seasonality',
    mathFormula: 'L_t = α(Y_t - S_{t-m}) + (1-α)(L_{t-1} + T_{t-1})',
    hyperparameters: {
      'Alpha (Level)': 0.38,
      'Beta (Trend)': 0.12,
      'Gamma (Seasonality)': 0.24,
      'Damping Factor (phi)': 0.95
    },
    forecastData: [5820000, 5940000, 6310000, 5740000, 6110000, 6060000]
  },

  // --- MACHINE LEARNING & DEEP HYBRID MODELS ---
  {
    id: 'tft',
    name: 'Temporal Fusion Transformer (TFT)',
    category: 'machine_learning',
    algorithmType: 'Deep Multi-Horizon Attention Network',
    mae: 618400.0,
    rmse: 772100.4,
    mape: 3.88,
    isSelected: false,
    rationale: 'Multi-head self-attention with Gated Residual Networks. Simultaneously models static plant features and dynamic temporal dependencies.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Interpretable self-attention weights, handles multi-horizon quantile loss',
    mathFormula: 'Attn(Q,K,V) = softmax((QK^T)/√d_k)V + GRN_ω(x)',
    hyperparameters: {
      'Attention Heads': 8,
      'Hidden State Dim': 128,
      'Dropout Rate': 0.15,
      'Quantiles': 'p10, p50, p90',
      'Learning Rate': '1e-4 (AdamW)'
    },
    forecastData: [5810000, 5960000, 6290000, 5760000, 6090000, 6045000]
  },
  {
    id: 'xgboost_arima',
    name: 'XGBoost-ARIMA Residual Hybrid',
    category: 'machine_learning',
    algorithmType: 'Gradient Boosted Linear-Residual Meta-Learner',
    mae: 614900.0,
    rmse: 769400.12,
    mape: 3.85,
    isSelected: false,
    rationale: 'Hybrid architecture where ARIMA models linear trend baseline and XGBoost fits nonlinear residuals with macro indices.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Combines statistical guarantees with nonlinear feature tree splits',
    mathFormula: 'Ŷ_t = ŷ_{ARIMA}(t) + f_{XGBoost}(X_t; {T_m, W_k, ΔP})',
    hyperparameters: {
      'Max Tree Depth': 6,
      'Learning Rate (eta)': 0.05,
      'Subsample Ratio': 0.8,
      'Estimators': 350
    },
    forecastData: [5795000, 5955000, 6305000, 5745000, 6095000, 6055000]
  },
  {
    id: 'bilstm',
    name: 'Bidirectional LSTM + Temporal Attention',
    category: 'machine_learning',
    algorithmType: 'Recurrent Neural Network Sequence-to-Sequence',
    mae: 629700.5,
    rmse: 789300.8,
    mape: 3.96,
    isSelected: false,
    rationale: 'Forward and backward recurrent memory gates capture both leading economic momentum and lagging inventory demand ripples.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'LSTM cell gating with context vector concatenation',
    mathFormula: 'h_t = [h⃗_t || h⃖_t],  c_t = \sum_j α_{tj} h_j',
    hyperparameters: {
      'LSTM Layers': 2,
      'Bidirectional Hidden': 96,
      'Sequence Length': 12,
      'Batch Size': 16
    },
    forecastData: [5815000, 5970000, 6280000, 5770000, 6085000, 6040000]
  },

  // --- QUANTUM & QUANTUM-INSPIRED OPTIMIZATION ALGORITHMS ---
  {
    id: 'qaoa',
    name: 'QAOA Combinatorial Optimizer (p=4)',
    category: 'quantum',
    algorithmType: 'Quantum Approximate Optimization Algorithm',
    mae: 605800.0,
    rmse: 759200.0,
    mape: 3.79,
    isSelected: false,
    rationale: 'Maps multi-line production scheduling and safety buffer constraints onto an Ising Spin Hamiltonian with parameterized quantum gates.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Ising Hamiltonian ground state encoding, parameterized mixer & cost unitaries',
    mathFormula: '|γ,β⟩ = ∏_{k=1}^p e^{-iβ_k H_M} e^{-iγ_k H_C} |+⟩^⊗n',
    hyperparameters: {
      'Variational Layers (p)': 4,
      'Classical Optimizer': 'COBYLA / Nelder-Mead',
      'Ansatz Type': 'Hardware-Efficient Alternating Operator'
    },
    quantumMetrics: {
      qubits: 24,
      circuitDepth: 32,
      hamiltonianType: 'Ising Spin Glass (Z_i Z_j + h_i Z_i)',
      energyGroundState: -142.85,
      convergenceIterations: 85,
      speedupFactor: '14.2x faster combinatorial convergence'
    },
    forecastData: [5805000, 5948000, 6302000, 5748000, 6098000, 6050000]
  },
  {
    id: 'qubo_anneal',
    name: 'QUBO Quantum Annealing Allocator',
    category: 'quantum',
    algorithmType: 'Quadratic Unconstrained Binary Optimization',
    mae: 607100.0,
    rmse: 761300.0,
    mape: 3.81,
    isSelected: false,
    rationale: 'Simulated quantum tunneling escapes local minima in capacity bottlenecks, yielding globally optimal shift allocations.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Quantum transverse field annealing with quadratic penalty penalties',
    mathFormula: 'H(s) = -A(s) \sum_i σ_x^i + B(s) (\sum_i h_i σ_z^i + \sum_{i<j} J_{ij} σ_z^i σ_z^j)',
    hyperparameters: {
      'Annealing Time (μs)': 20.0,
      'Chain Strength': 1.85,
      'Penalty Multiplier (λ)': 1000.0,
      'Samples per Readout': 1000
    },
    quantumMetrics: {
      qubits: 36,
      circuitDepth: 1,
      hamiltonianType: 'Transverse Field Ising Hamiltonian',
      energyGroundState: -289.4,
      convergenceIterations: 100,
      speedupFactor: '18.5x vs Classical Simulated Annealing'
    },
    forecastData: [5798000, 5952000, 6298000, 5752000, 6096000, 6051000]
  },
  {
    id: 'vqe',
    name: 'VQE Multi-Constraint Eigensolver',
    category: 'quantum',
    algorithmType: 'Variational Quantum Eigensolver',
    mae: 611200.0,
    rmse: 764800.0,
    mape: 3.83,
    isSelected: false,
    rationale: 'Hybrid quantum-classical algorithm using parameterized quantum state preparation to calculate ground-state inventory cost eigenvalues.',
    trainingObservations: 48,
    testingObservations: 12,
    characteristics: 'Unitary Coupled Cluster (UCCSD) ansatz, resilient against NISQ noise',
    mathFormula: '⟨ψ(θ)| H_cost |ψ(θ)⟩ \ge E_0 \quad s.t. \quad min_θ ⟨ψ(θ)|H|ψ(θ)⟩',
    hyperparameters: {
      'Ansatz': 'TwoLocal (Ry + Rz + CNOT entanglement)',
      'Classical Optimizer': 'SPSA (Simultaneous Perturbation)',
      'Shots': 4096
    },
    quantumMetrics: {
      qubits: 18,
      circuitDepth: 28,
      hamiltonianType: 'Fermionic / Qubit Cost Operator',
      energyGroundState: -88.12,
      convergenceIterations: 120,
      speedupFactor: '9.8x eigenvalue convergence'
    },
    forecastData: [5802000, 5951000, 6301000, 5749000, 6099000, 6051500]
  }
];

export const CANNED_AGENT_QUESTIONS: AgentCannedQuestion[] = [
  {
    id: 'why-plan',
    question: 'Explain why the plan is 3.10 Cr units (309.52 Lakh)',
    category: 'rationale',
    shortPrompt: 'Explain 3.10 Cr calculation',
    response:
      'Explanation of calculation: Forecasted demand is 3.60 Cr units (359.52 Lakh) and 60.00 Lakh units currently exist in warehouse inventory. By drawing down 50.00 Lakh units of on-hand inventory, net production requires exactly 3.10 Cr units (3.60 Cr demand + 10.00 Lakh safety stock - 60.00 Lakh opening inventory). Available plant capacity is 70.00 Lakh units/month (peak utilization 77.1% in March), resulting in 0 capacity violations and 0 expected shortage.',
    takeaway: 'Mathematical balance: Demand (3.60 Cr) + Safety (10.00 Lakh) - Starting Stock (60.00 Lakh) = 3.10 Cr Production.',
    keyStats: [
      { label: 'Forecast Demand', value: '3.60 Cr' },
      { label: 'Calculated Target', value: '3.10 Cr' },
      { label: 'Terminal Buffer', value: '10.00 Lakh', status: 'positive' },
      { label: 'Peak Capacity Util.', value: '77.1%', status: 'normal' }
    ]
  },
  {
    id: 'demand-plus-20',
    question: 'Explain what happens if demand increases 20%',
    category: 'scenario',
    shortPrompt: 'Explain +20% demand scenario',
    response:
      'Explanation of +20% surge: At +20% demand (total demand jumps to 4.31 Cr units / 431.42 Lakh), net required manufacturing increases to 3.81 Cr units. In March and May, required output exceeds the 70.00 Lakh monthly plant ceiling. Under standard capacity, ending inventory will draw down to 4.20 Lakh units in June (5.80 Lakh below the 10.00 Lakh safety stock target).',
    takeaway: 'Constraint analysis: Saturated 100% capacity in March & May; safety stock depletes to 4.20 Lakh.',
    keyStats: [
      { label: 'Adjusted Demand', value: '4.31 Cr', status: 'warning' },
      { label: 'Calculated Prod.', value: '3.81 Cr' },
      { label: 'Ending Buffer', value: '4.20 Lakh', status: 'warning' },
      { label: 'Line Status', value: '100% Capacity Ceiling', status: 'warning' }
    ]
  },
  {
    id: 'reduce-production',
    question: 'Explain the effect of reducing production below 3.10 Cr',
    category: 'scenario',
    shortPrompt: 'Explain lower production impact',
    response:
      'Explanation of buffer impact: Every 1.00 Lakh unit reduction below 3.10 Cr reduces the ending June safety stock by exactly 1.00 Lakh units. For example, producing 3.01 Cr units (8.00 Lakh less) leaves only 2.00 Lakh units in ending reserve instead of the 10.00 Lakh policy target, increasing vulnerability to vendor delivery delays.',
    takeaway: 'Impact analysis: Output below 3.10 Cr directly lowers warehouse safety buffer below 10.00 Lakh.',
    keyStats: [
      { label: 'Baseline Target', value: '3.10 Cr' },
      { label: 'Reduced Output', value: '3.01 Cr' },
      { label: 'Resulting Buffer', value: '2.00 Lakh', status: 'warning' }
    ]
  },
  {
    id: 'risk-month',
    question: 'Explain which month has the highest operational load',
    category: 'risk',
    shortPrompt: 'Explain highest load month',
    response:
      'Explanation of monthly distribution: March is the peak demand load month with 63.00 Lakh units demand and 54.00 Lakh planned production (77.1% line utilization). June is the minimum inventory point where warehouse stock reaches the 10.00 Lakh buffer target after stepwise drawdowns from 60.00 Lakh. Both metrics operate within safe design tolerances under baseline conditions.',
    takeaway: 'Monthly analysis: March peaks at 77.1% line load; June concludes at 10.00 Lakh target buffer.',
    keyStats: [
      { label: 'Peak Month', value: 'March (63.00 Lakh)' },
      { label: 'Peak Line Load', value: '77.1%' },
      { label: 'Lowest Inventory', value: 'June (10.00 Lakh)' }
    ]
  },
  {
    id: 'forecast-model-selection',
    question: 'Explain why the 3-Month Moving Average was selected',
    category: 'model',
    shortPrompt: 'Explain forecast model choice',
    response:
      'Explanation of model selection: The forecasting engine tested 4 algorithms across a 12-month holdout test window. The 3-Month Moving Average achieved the lowest Mean Absolute Error (MAE: 6,09,250 / 6.09 Lakh) and RMSE (7,65,929 / 7.66 Lakh), outperforming ARIMA(1,1,1) (MAE: 6,59,300), Naive (MAE: 6,69,583), and Exponential Smoothing (MAE: 6,74,204).',
    takeaway: 'Statistical evaluation: 3-Mo Moving Average had lowest validation error (MAE 6,09,250) across 12-mo test set.',
    keyStats: [
      { label: 'Selected Model', value: '3-Mo. Moving Avg', status: 'positive' },
      { label: 'MAE', value: '6,09,250' },
      { label: 'RMSE', value: '7,65,929' },
      { label: 'Test Holdout', value: '12 months' }
    ]
  },
  {
    id: 'inventory-trajectory',
    question: 'Explain the inventory depletion schedule over time',
    category: 'inventory',
    shortPrompt: 'Explain inventory drawdown',
    response:
      'Explanation of inventory progression: Beginning with 60.00 Lakh units in January, inventory is phased down month-by-month to fulfill customer orders: Jan (54.00 Lakh) → Feb (46.00 Lakh) → Mar (37.00 Lakh) → Apr (28.00 Lakh) → May (20.00 Lakh) → Jun (10.00 Lakh). At the conclusion of Month 6, exactly 10.00 Lakh units remain, preserving the full safety buffer while eliminating excess warehouse holding costs.',
    takeaway: 'Drawdown breakdown: 50.00 Lakh excess stock is deployed evenly, settling at 10.00 Lakh buffer.',
    keyStats: [
      { label: 'Opening Stock', value: '60.00 Lakh' },
      { label: 'Terminal Stock', value: '10.00 Lakh', status: 'positive' },
      { label: 'Safety Buffer', value: '10.00 Lakh' },
      { label: 'Total Drawdown', value: '50.00 Lakh' }
    ]
  }
];

/**
 * Calculates dynamic scenario outcome given percentage adjustments
 */
export function calculateScenario(
  params: ScenarioParams,
  basePlan?: MonthlyPlanItem[],
  baseSummary?: PlanningSummary
): ScenarioResult {
  const activeBasePlan = basePlan && basePlan.length > 0 ? basePlan : BASELINE_MONTHLY_PLAN;
  const baseMonthlyCap = baseSummary?.monthlyCapacity || activeBasePlan[0]?.capacity || 7000000;
  const demandMultiplier = 1 + params.demandChangePct / 100;
  const capacityMultiplier = 1 + params.capacityChangePct / 100;

  const monthlyCapacity = Math.round(baseMonthlyCap * capacityMultiplier);
  const totalCapacity = monthlyCapacity * activeBasePlan.length;

  let currentInv = params.currentInventory;
  const targetSafetyStock = params.safetyStockTarget;

  const monthlyPlan: MonthlyPlanItem[] = [];
  const constrainedMonths: string[] = [];
  const shortageMonths: string[] = [];
  let totalShortage = 0;
  let minEndingInv = currentInv;

  for (const baseItem of activeBasePlan) {
    const adjDemand = Math.round(baseItem.demand * demandMultiplier);
    const openingInv = currentInv;

    // Ideal production is to meet demand and work towards safety stock
    // Required to end month with at least targetSafetyStock or planned trajectory
    const netRequirement = adjDemand + targetSafetyStock - openingInv;
    let recommendedProd = Math.max(0, netRequirement);

    let status: 'safe' | 'constrained' | 'shortage' = 'safe';

    // Constrain by plant capacity
    if (recommendedProd > monthlyCapacity) {
      recommendedProd = monthlyCapacity;
      status = 'constrained';
      constrainedMonths.push(baseItem.month);
    }

    const endingInv = openingInv + recommendedProd - adjDemand;
    let shortage = 0;

    if (endingInv < 0) {
      shortage = Math.abs(endingInv);
      totalShortage += shortage;
      status = 'shortage';
      shortageMonths.push(baseItem.month);
    }

    if (endingInv < minEndingInv) {
      minEndingInv = endingInv;
    }

    const utilization = Math.min(100, Number(((recommendedProd / monthlyCapacity) * 100).toFixed(1)));

    monthlyPlan.push({
      month: baseItem.month,
      monthIndex: baseItem.monthIndex,
      demand: adjDemand,
      openingInventory: openingInv,
      requiredProduction: Math.max(0, netRequirement),
      recommendedProduction: recommendedProd,
      endingInventory: Math.max(0, endingInv),
      safetyStock: targetSafetyStock,
      shortage,
      capacity: monthlyCapacity,
      capacityUtilization: utilization,
      status: endingInv < targetSafetyStock ? (endingInv < 0 ? 'shortage' : 'constrained') : 'safe'
    });

    currentInv = Math.max(0, endingInv);
  }

  const totalDemand = monthlyPlan.reduce((acc, curr) => acc + curr.demand, 0);
  const totalRecommendedProd = monthlyPlan.reduce((acc, curr) => acc + curr.recommendedProduction, 0);

  const capacityConstrained = constrainedMonths.length > 0;
  const inventoryRisk = minEndingInv < targetSafetyStock || totalShortage > 0;
  const isFeasible = !capacityConstrained && !inventoryRisk && totalShortage === 0;

  let statusLabel: ScenarioResult['statusLabel'] = 'Feasible';
  let businessSummary = '';

  if (totalShortage > 0) {
    statusLabel = 'Critical Shortage';
    businessSummary = `Under this scenario, demand (${formatUnits(totalDemand)}) outstrips available production capacity and starting inventory. Unfulfilled shortage of ${formatUnits(totalShortage)} occurs in ${shortageMonths.join(', ')}.`;
  } else if (capacityConstrained && inventoryRisk) {
    statusLabel = 'Capacity Constrained';
    businessSummary = `At ${params.demandChangePct > 0 ? '+' : ''}${params.demandChangePct}% demand (${formatUnits(totalDemand)}), production capacity reaches 100% in ${constrainedMonths.join(' and ')}, drawing ending inventory down below safety stock.`;
  } else if (capacityConstrained) {
    statusLabel = 'Capacity Constrained';
    businessSummary = `Production capacity is saturated at 100% in ${constrainedMonths.join(', ')}. While demand is technically fulfilled, lines have zero buffer for unplanned maintenance.`;
  } else if (inventoryRisk) {
    statusLabel = 'Inventory Risk';
    businessSummary = `Inventory buffer falls below the required ${formatUnits(targetSafetyStock)} safety stock threshold to ${formatUnits(minEndingInv)} units. Consider increasing production to protect against supply disruptions.`;
  } else {
    statusLabel = 'Feasible';
    businessSummary = `The plan remains fully feasible under this scenario. All ${formatUnits(totalDemand)} demand is fulfilled while sustaining required inventory safety buffers within plant capacity.`;
  }

  return {
    params,
    totalDemand,
    recommendedProduction: totalRecommendedProd,
    totalCapacity,
    minEndingInventory: minEndingInv,
    shortageUnits: totalShortage,
    isFeasible,
    capacityConstrained,
    inventoryRisk,
    constrainedMonths,
    shortageMonths,
    statusLabel,
    businessSummary,
    monthlyPlan
  };
}

export function formatUnits(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const cr = num / 10000000;
    return `${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lakh = num / 100000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakh`;
  }
  if (abs >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatIndianUnitsFull(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 10000000) {
    const cr = num / 10000000;
    const lakhs = (num / 100000).toFixed(2);
    return `${cr.toFixed(2)} Cr (${lakhs} Lakh)`;
  }
  if (abs >= 100000) {
    return `${(num / 100000).toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
}

export function formatIndianFull(num: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
}
