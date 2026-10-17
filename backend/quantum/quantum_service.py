import logging
import traceback
from typing import List, Dict, Any, Optional
import numpy as np

try:
    import qiskit
    import qiskit_aer
    QISKIT_VER = getattr(qiskit, "__version__", "2.5.2")
    AER_VER = getattr(qiskit_aer, "__version__", "0.17.2")
except Exception:
    QISKIT_VER = "unknown"
    AER_VER = "unknown"

from models.schemas import (
    QuantumOptimizationRequest,
    QuantumOptimizationResponse,
    ProductInput,
    ProductionPlanRequest
)
from .qubo_builder import QUBOBuilder
from .qaoa_optimizer import QAOAOptimizer, decode_bitstring
from services.production_service import ProductionPlanningService

logger = logging.getLogger("nexforge.quantum")


class QuantumOptimizationService:
    """
    Orchestration service for Quantum-Assisted Production Optimization.
    Coordinates:
      1. Problem formulation and dynamic qubit calculation (QUBOBuilder)
      2. Genuine Qiskit QAOA execution on Aer simulator (QAOAOptimizer)
      3. Candidate bitstring extraction and endian-aware decoding
      4. Constraint validation & feasibility checks
      5. Safe classical fallback execution if quantum candidate is infeasible or errors
    """

    @classmethod
    def run_optimization(cls, request: QuantumOptimizationRequest) -> QuantumOptimizationResponse:
        prods = request.products if request.products else [ProductInput()]
        demands = request.demands if request.demands else [5800000.0, 5950000.0, 6300000.0]
        capacity = request.capacityPerPeriod if request.capacityPerPeriod > 0 else 7000000.0
        num_periods = len(demands)
        p_steps = max(1, request.pSteps)
        shots = max(100, request.shots)

        logger.info(
            f"[QUANTUM] Starting Optimization Pipeline: {len(prods)} products, "
            f"{num_periods} periods, capacity={capacity:,.0f}, bits={request.discretizationBits}"
        )

        # ---------------------------------------------------------
        # Step 1: Formulate QUBO and dynamic qubit calculation
        # ---------------------------------------------------------
        Q, var_map, meta = QUBOBuilder.build_qubo(
            products=prods,
            demands=demands,
            capacity_per_period=capacity,
            bits_per_var=request.discretizationBits
        )
        total_qubits = meta["totalQubits"]
        logger.info(f"[QUANTUM] QUBO Model Formulated: {total_qubits} qubits. Formula: {meta['formula']}")

        # ---------------------------------------------------------
        # Step 2: Execute Genuine Qiskit QAOA on Aer Simulator
        # ---------------------------------------------------------
        qaoa_success = False
        qaoa_result: Dict[str, Any] = {}
        quantum_error: Optional[str] = None

        try:
            optimizer = QAOAOptimizer(
                p_steps=p_steps,
                shots=shots,
                optimizer_name="COBYLA",
                seed=42,
                max_evals=20
            )
            qaoa_result = optimizer.optimize(
                Q=Q,
                offset=meta.get("constantOffset", 0.0),
                variable_names=meta.get("variables")
            )
            qaoa_success = True
            logger.info(
                f"[QUANTUM] Qiskit QAOA Execution Succeeded: Depth={qaoa_result['circuit_depth']}, "
                f"Time={qaoa_result['execution_time_ms']}ms, Bitstring='{qaoa_result['bitstring']}'"
            )
        except Exception as e:
            quantum_error = str(e)
            logger.error(f"[QUANTUM] QAOA Execution failed with error: {quantum_error}")
            logger.error(traceback.format_exc())

        # ---------------------------------------------------------
        # Step 3: Candidate Solution Decoding (Endian-Aware)
        # ---------------------------------------------------------
        # decoded_bits has length total_qubits, where decoded_bits[i] = value of variable i
        raw_production_per_period = [0.0] * num_periods
        violations: List[str] = []

        if qaoa_success:
            decoded_bits = qaoa_result.get("decoded_bits", [])
            for var_idx, bit_val in enumerate(decoded_bits):
                if bit_val == 1:
                    info = var_map[var_idx]
                    t_idx = info["period"] - 1
                    raw_production_per_period[t_idx] += info["weightUnits"]
        else:
            decoded_bits = [0] * total_qubits

        # ---------------------------------------------------------
        # Step 4: Feasibility Validation & Constraint Checking
        # ---------------------------------------------------------
        check_non_negative = all(p >= 0.0 for p in raw_production_per_period)
        if not check_non_negative:
            violations.append("Negative production scheduled in one or more periods.")

        # Capacity check with 2% tolerance buffer
        check_capacity = True
        for t, prod_amt in enumerate(raw_production_per_period):
            if prod_amt > capacity * 1.02:
                check_capacity = False
                excess = prod_amt - capacity
                violations.append(f"Month {t+1} production ({prod_amt:,.0f}) exceeds capacity by {excess:,.0f} units.")

        # Inventory balance and demand satisfaction check
        running_inv = prods[0].currentInventory if prods else 6000000.0
        safety_stock = prods[0].safetyStockTarget if prods else 1000000.0
        check_demand_sat = True
        check_safety_stock = True

        for t, d in enumerate(demands):
            produced = raw_production_per_period[t]
            ending_inv = running_inv + produced - d
            if ending_inv < 0:
                check_demand_sat = False
                shortage = abs(ending_inv)
                violations.append(f"Month {t+1} demand stockout of {shortage:,.0f} units (Inventory: {ending_inv:,.0f}).")
            if ending_inv < safety_stock * 0.75:
                check_safety_stock = False
                violations.append(f"Month {t+1} inventory ({ending_inv:,.0f}) breaches safety stock threshold ({safety_stock:,.0f}).")
            running_inv = max(0.0, ending_inv)

        is_feasible = (
            qaoa_success and
            check_non_negative and
            check_capacity and
            check_demand_sat and
            check_safety_stock
        )

        # ---------------------------------------------------------
        # Step 5: Classical Fallback & Final Plan Synthesis
        # ---------------------------------------------------------
        fallback_used = False
        fallback_reason = None
        status_code = "quantum_completed"

        if is_feasible:
            status = "Quantum Optimization Completed - Feasible Solution Found"
            final_production = raw_production_per_period
            logger.info("[QUANTUM] Candidate solution passed all feasibility checks. No fallback needed.")
        else:
            fallback_used = True
            if not qaoa_success:
                status = "Classical Fallback Used - Quantum Execution Error"
                status_code = "quantum_error_fallback"
                fallback_reason = f"QAOA circuit simulation encountered an error: {quantum_error}"
            else:
                status = "Classical Fallback Used - Quantum Candidate Infeasible"
                status_code = "quantum_infeasible_fallback"
                fallback_reason = f"Quantum candidate had {len(violations)} constraint violation(s): " + "; ".join(violations[:2])

            logger.warning(f"[FALLBACK] {status}: {fallback_reason}. Invoking High-Performance Classical LP...")
            prod_payload = [p.model_dump() if hasattr(p, "model_dump") else p for p in prods]
            lp_req = ProductionPlanRequest(
                products=prod_payload,
                monthlyDemands=demands,
                horizonMonths=num_periods,
                monthlyCapacity=capacity
            )
            lp_res = ProductionPlanningService.solve_production_plan(lp_req)
            final_production = [row.recommendedProduction for row in lp_res.monthlyPlan]
            logger.info(f"[FALLBACK] Classical solution obtained: {final_production}")

        # Compute production cost
        unit_cost = prods[0].unitProductionCost if prods else 45.0
        total_cost = sum(final_production) * unit_cost

        # Generate detailed production plan breakdown
        production_plan_rows: List[Dict[str, Any]] = []
        inv_tracker = prods[0].currentInventory if prods else 6000000.0
        for t, d in enumerate(demands):
            p_val = final_production[t]
            end_inv = inv_tracker + p_val - d
            utilization = (p_val / capacity) * 100.0 if capacity > 0 else 0.0
            production_plan_rows.append({
                "period": t + 1,
                "monthName": f"Month {t+1}",
                "demand": d,
                "recommendedProduction": round(p_val, 0),
                "endingInventory": round(end_inv, 0),
                "capacityUtilizationPct": round(utilization, 1),
                "unitCost": unit_cost,
                "periodCost": round(p_val * unit_cost, 0)
            })
            inv_tracker = max(0.0, end_inv)

        validation_dict = {
            "nonNegativeProduction": check_non_negative,
            "withinCapacityLimits": check_capacity,
            "demandSatisfied": check_demand_sat,
            "safetyStockMaintained": check_safety_stock
        }

        technical_details = {
            "hamiltonianType": "Ising Hamiltonian (Z-Pauli Basis mapped from QUBO via x_i = (I - Z_i)/2)",
            "qaoaAnsatz": f"p={p_steps} layer Alternating Operator Ansatz",
            "mixerHamiltonian": "Standard Transverse-field Mixer H_B = sum_i X_i",
            "classicalOptimizer": "COBYLA parameter convergence",
            "qubitEncodingScheme": "Binary Discretization of Capacity Levels",
            "simulatorBackend": f"Qiskit Aer Simulator (qiskit-aer v{AER_VER})",
            "qiskitVersion": QISKIT_VER,
            "aerVersion": AER_VER,
            "optimalBitstring": qaoa_result.get("bitstring", "N/A"),
            "decodedBits": decoded_bits,
            "optimalGamma": qaoa_result.get("optimal_gamma", []),
            "optimalBeta": qaoa_result.get("optimal_beta", []),
            "measuredCounts": qaoa_result.get("counts_sample", {}),
            "circuitDepth": qaoa_result.get("circuit_depth", 0),
            "executionTimeMs": qaoa_result.get("execution_time_ms", 0.0),
            "qubitAllocationFormula": meta["formula"],
            "rawCandidateOutput": raw_production_per_period,
            "fallbackTriggered": fallback_used,
            "fallbackReason": fallback_reason,
            "candidateViolations": violations
        }

        from datetime import datetime, timezone
        status_msg = f"{status}. Simulator: Qiskit Aer (v{AER_VER}). Qubits: {meta['totalQubits']}, Circuit Depth: {qaoa_result.get('circuit_depth', 0)}."

        quantum_payload = {
            "executed": True,
            "backend": f"Qiskit AerSimulator (v{AER_VER})",
            "num_qubits": meta["totalQubits"],
            "qaoa_reps": p_steps,
            "shots": shots,
            "execution_time_seconds": round(qaoa_result.get("execution_time_ms", 0.0) / 1000.0, 3)
        }

        solution_payload = {
            "production_plan": production_plan_rows,
            "objective_value": round(qaoa_result.get("objective_value", 0.0), 2),
            "total_cost": round(total_cost, 0)
        }

        validation_payload = {
            "feasible": is_feasible,
            "violations": violations
        }

        fallback_payload = {
            "used": fallback_used,
            "reason": fallback_reason
        }

        return QuantumOptimizationResponse(
            status=status,
            statusCode=status_code,
            isFeasible=is_feasible,
            fallbackUsed=fallback_used,
            fallbackReason=fallback_reason,
            qubitCount=meta["totalQubits"],
            qubitFormula=meta["formula"],
            qubitBreakdown=meta["breakdown"],
            circuitDepth=qaoa_result.get("circuit_depth", 0),
            evaluatedEnergy=round(qaoa_result.get("objective_value", 0.0), 2),
            executionTimeMs=round(qaoa_result.get("execution_time_ms", 0.0), 2),
            recommendedProductionPerPeriod=final_production,
            productionPlan=production_plan_rows,
            totalCost=round(total_cost, 0),
            validationChecks=validation_dict,
            violations=violations,
            technicalDetails=technical_details,
            statusMessage=status_msg,
            quantum=quantum_payload,
            solution=solution_payload,
            validation=validation_payload,
            fallback=fallback_payload,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

