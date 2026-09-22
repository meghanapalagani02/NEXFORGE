import sys
import os
import pytest

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.schemas import QuantumOptimizationRequest, ProductInput
from quantum.qubo_builder import QUBOBuilder
from quantum.quantum_service import QuantumOptimizationService


def test_production_planning_qaoa_workflow():
    """
    Tests the complete NexForge production planning quantum pipeline:
      Inputs -> QUBO -> Dynamic Qubits -> Qiskit QAOA -> Bitstring Decoding -> Validation -> Result
    """
    print("\n" + "=" * 60)
    print("NEXFORGE PRODUCTION PLANNING QAOA WORKFLOW TEST")
    print("=" * 60)

    # 1. Setup NexForge Production Planning Instance
    prods = [
        ProductInput(
            id="PROD-01",
            name="Industrial Centrifugal Pump",
            currentInventory=6000000.0,
            safetyStockTarget=1000000.0,
            unitProductionCost=45.0,
            unitHoldingCost=4.5,
            unitShortageCost=120.0
        )
    ]
    # 2 planning periods
    demands = [5800000.0, 5950000.0]
    monthly_capacity = 7000000.0
    bits_per_var = 2

    # Verify Dynamic Qubit Calculation
    P = len(prods)
    T = len(demands)
    B = bits_per_var
    expected_qubits = P * T * B

    total_qubits, formula, breakdown = QUBOBuilder.calculate_qubits(P, T, B)
    assert total_qubits == expected_qubits, f"Expected {expected_qubits} qubits, got {total_qubits}"
    print(f"\n[1] Dynamic Qubit Calculation: {formula}")
    print(f"    Breakdown: {breakdown}")

    # Build QUBO
    Q, var_map, meta = QUBOBuilder.build_qubo(
        products=prods,
        demands=demands,
        capacity_per_period=monthly_capacity,
        bits_per_var=bits_per_var
    )
    assert meta["totalQubits"] == expected_qubits
    assert Q.shape == (expected_qubits, expected_qubits)
    print(f"[2] QUBO Matrix Built: Shape={Q.shape}, Sparsity={meta['sparsity']}")
    print(f"    Variables: {meta['variables']}")

    # 2. Run Full QuantumOptimizationService
    request = QuantumOptimizationRequest(
        products=prods,
        demands=demands,
        capacityPerPeriod=monthly_capacity,
        discretizationBits=bits_per_var,
        shots=512,
        pSteps=1,
        useHardwareSimulator=True
    )

    response = QuantumOptimizationService.run_optimization(request)

    print(f"\n[3] Quantum Optimization Response:")
    print(f"    Status:            {response.status}")
    print(f"    Status Code:       {response.statusCode}")
    print(f"    Qubit Count:       {response.qubitCount}")
    print(f"    Circuit Depth:     {response.circuitDepth}")
    print(f"    Execution Time:    {response.executionTimeMs} ms")
    print(f"    Fallback Used:     {response.fallbackUsed}")
    print(f"    Production Plan:   {response.recommendedProductionPerPeriod}")
    print(f"    Total Cost ($):    ${response.totalCost:,.2f}")
    print(f"    Validation Checks: {response.validationChecks}")

    tech = response.technicalDetails
    print(f"\n[4] Technical Details:")
    print(f"    Simulator:         {tech.get('simulatorBackend')}")
    print(f"    Optimal Bitstring: '{tech.get('optimalBitstring')}'")
    print(f"    Decoded Bits:      {tech.get('decodedBits')}")
    print(f"    Sample Counts:     {tech.get('measuredCounts')}")

    assert response.qubitCount == expected_qubits
    assert response.circuitDepth > 0
    assert response.executionTimeMs > 0
    assert len(response.recommendedProductionPerPeriod) == T
    assert response.statusCode in ["quantum_completed", "quantum_infeasible_fallback"]


def test_production_planning_fallback_trigger():
    """
    Tests that classical fallback cleanly triggers when impossible/extreme demand is requested
    that cannot be satisfied within capacity.
    """
    print("\n" + "=" * 60)
    print("TESTING CLASSICAL FALLBACK MECHANISM ON EXTREME CAPACITY LIMIT")
    print("=" * 60)

    # Initial inventory 0, safety stock 5,000,000, demand 15,000,000, but capacity only 1,000,000
    # Any quantum candidate will exceed capacity or cause massive stockouts
    prods = [
        ProductInput(
            id="PROD-01",
            name="Restricted Pump",
            currentInventory=0.0,
            safetyStockTarget=2000000.0
        )
    ]
    demands = [10000000.0]
    tiny_capacity = 1000000.0  # severely constrained

    request = QuantumOptimizationRequest(
        products=prods,
        demands=demands,
        capacityPerPeriod=tiny_capacity,
        discretizationBits=2,
        shots=256,
        pSteps=1
    )

    response = QuantumOptimizationService.run_optimization(request)

    print(f"\nFallback Scenario Results:")
    print(f"  Status:          {response.status}")
    print(f"  Status Code:     {response.statusCode}")
    print(f"  Fallback Used:   {response.fallbackUsed}")
    print(f"  Fallback Reason: {response.fallbackReason}")
    print(f"  Violations:      {response.violations}")

    # Fallback should be used because demand greatly exceeds tiny capacity
    assert response.fallbackUsed is True
    assert "Fallback" in response.status or response.statusCode == "quantum_infeasible_fallback"
    print("  Classical fallback verified successfully!")


if __name__ == "__main__":
    test_production_planning_qaoa_workflow()
    test_production_planning_fallback_trigger()
    print("\nAll production QAOA tests passed successfully!")
