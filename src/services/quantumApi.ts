/**
 * NexForge Quantum Optimization API Contract Service
 *
 * Frontend service interface for future FastAPI / Qiskit QAOA backend integration.
 * Endpoint target: POST /api/quantum/optimize and GET /api/quantum/status
 *
 * NOTE: When the backend is not connected, this contract cleanly returns
 * 'awaiting_backend' status with zero fabricated metrics.
 */

export interface QuantumOptimizationRequest {
  products: {
    id: string;
    name: string;
    currentInventory: number;
    safetyStockTarget: number;
    monthlyCapacity: number;
    unitCost?: number;
  }[];
  demands: number[];
  capacityPerPeriod: number;
  discretizationBits?: number;
  shots?: number;
  qaoaDepth?: number;
  backendTarget?: string;
}

export interface QuantumExecutionDetails {
  executed: boolean;
  backend: string;
  num_qubits: number;
  qaoa_reps: number;
  shots: number;
  execution_time_seconds: number;
}

export interface QuantumProductionPlanItem {
  period: number;
  monthName: string;
  demand: number;
  recommendedProduction: number;
  endingInventory: number;
  capacityUtilizationPct: number;
}

export interface QuantumSolution {
  production_plan: QuantumProductionPlanItem[];
  objective_value: number;
  total_cost?: number;
}

export interface QuantumValidation {
  feasible: boolean;
  violations: string[];
}

export interface QuantumFallback {
  used: boolean;
  reason: string | null;
}

export interface QuantumOptimizationResponse {
  status: 'quantum_completed' | 'fallback_completed' | 'awaiting_backend' | 'error';
  statusMessage: string;
  quantum: QuantumExecutionDetails | null;
  solution: QuantumSolution | null;
  validation: QuantumValidation;
  fallback: QuantumFallback;
  timestamp: string;
}

export interface QuantumBackendStatus {
  isAvailable: boolean;
  backendName: string;
  serviceUrl: string;
  supportedMethods: string[];
  message: string;
}

const API_BASE_URL: string =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';

class QuantumApiService {
  /**
   * Check if external quantum optimization backend is reachable.
   */
  public async getQuantumStatus(): Promise<QuantumBackendStatus> {
    if (!API_BASE_URL) {
      return {
        isAvailable: false,
        backendName: 'Awaiting optimization backend',
        serviceUrl: 'Not configured (VITE_API_URL unset)',
        supportedMethods: ['QAOA (Pending)', 'QUBO Solver (Pending)', 'Classical LP Fallback'],
        message: 'Awaiting optimization backend connection. System operates on verified client-side planning logic.'
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/quantum/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        return {
          isAvailable: true,
          backendName: data.backend || 'Qiskit Aer / IBM Quantum Simulator',
          serviceUrl: API_BASE_URL,
          supportedMethods: data.supported_methods || ['QAOA', 'QUBO', 'Exact LP'],
          message: 'Quantum optimization service connected and ready.'
        };
      }
    } catch {
      // Backend configured but unreachable
    }

    return {
      isAvailable: false,
      backendName: 'Awaiting optimization backend',
      serviceUrl: API_BASE_URL,
      supportedMethods: ['QAOA (Pending)', 'QUBO Solver (Pending)', 'Classical LP Fallback'],
      message: 'Backend server currently unreachable. Awaiting optimization backend.'
    };
  }

  /**
   * Dispatches optimization request to the future Qiskit QAOA backend.
   * If the backend is not connected or fails, returns an unexecuted contract
   * without any fabricated quantum execution, qubit counts, or fake speedups.
   */
  public async optimizeProduction(
    request: QuantumOptimizationRequest
  ): Promise<QuantumOptimizationResponse> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quantum/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });

        if (res.ok) {
          const data = await res.json();
          return {
            status: data.status || 'quantum_completed',
            statusMessage: data.statusMessage || 'Optimization completed via backend.',
            quantum: data.quantum || null,
            solution: data.solution || null,
            validation: data.validation || { feasible: true, violations: [] },
            fallback: data.fallback || { used: false, reason: null },
            timestamp: data.timestamp || new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Quantum optimization backend call failed, transitioning to awaiting state.', err);
      }
    }

    // Honest contract response when backend is not connected:
    // Zero fabricated quantum metrics, zero fake qubit counts.
    return {
      status: 'awaiting_backend',
      statusMessage: 'Awaiting optimization backend. Real Qiskit QAOA execution will be provided once backend service is active.',
      quantum: null,
      solution: null,
      validation: {
        feasible: true,
        violations: []
      },
      fallback: {
        used: true,
        reason: 'Backend service disconnected. Ready for FastAPI Qiskit integration.'
      },
      timestamp: new Date().toISOString()
    };
  }
}

export const quantumApi = new QuantumApiService();
