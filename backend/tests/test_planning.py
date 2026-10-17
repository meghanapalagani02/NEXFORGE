import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from models.schemas import (
    HistoricalPoint,
    ForecastRequest,
    ProductInput,
    InventoryAnalysisRequest,
    ProductionPlanRequest,
    SchedulingRequest,
    QuantumOptimizationRequest,
    ScenarioRequest
)
from services.forecasting_service import ForecastingService
from services.inventory_service import InventoryService
from services.production_service import ProductionPlanningService
from services.scheduling_service import ProductionSchedulingService
from quantum.quantum_service import QuantumOptimizationService
from quantum.qubo_builder import QUBOBuilder

def test_forecasting_service():
    pts = [
        HistoricalPoint(period=f"Month {i}", month=f"M{i}", demand=5000000.0 + i * 100000.0, isForecast=False)
        for i in range(1, 7)
    ]
    req = ForecastRequest(historicalData=pts, horizonMonths=3)
    res = ForecastingService.generate_forecast(req)
    assert len(res.forecastData) == 3
    assert res.totalForecastDemand > 0
    assert len(res.modelEvaluations) >= 5
    assert any(m.isBest for m in res.modelEvaluations)

def test_inventory_service_safety_stock():
    prod = ProductInput(
        id="P-01",
        name="Test SKU",
        currentInventory=5000000.0,
        safetyStockTarget=800000.0,
        monthlyCapacity=6000000.0,
        leadTimeWeeks=3.0
    )
    req = InventoryAnalysisRequest(products=[prod], forecastHorizonMonths=3)
    res = InventoryService.analyze_inventory(req)
    assert len(res.items) == 1
    item = res.items[0]
    assert item.safetyStock >= 800000.0
    assert item.runwayMonths > 0
    assert item.stockoutRisk in ["Healthy", "Low Buffer Warning", "Critical Stockout Risk"]

def test_production_planning_lp():
    prod = ProductInput(
        id="P-01",
        currentInventory=4000000.0,
        safetyStockTarget=1000000.0
    )
    demands = [5000000.0, 5200000.0, 5100000.0]
    req = ProductionPlanRequest(
        products=[prod],
        monthlyDemands=demands,
        horizonMonths=3,
        monthlyCapacity=6000000.0
    )
    res = ProductionPlanningService.solve_production_plan(req)
    assert len(res.monthlyPlan) == 3
    assert res.totalProduction > 0
    assert res.totalCost > 0
    assert res.serviceLevelPct >= 90.0

def test_scheduling_service():
    req = SchedulingRequest(
        productionQuantities={"Winding SKU": 1000000.0, "Rotor SKU": 800000.0},
        machines=[]
    )
    res = ProductionSchedulingService.generate_schedule(req)
    assert len(res.schedule) >= 2
    assert len(res.machineUtilizations) >= 4
    assert res.totalScheduledHours > 0

def test_quantum_qubo_dynamic_qubit_calculation():
    # 2 products, 3 periods, 2 bits = 2 * 3 * 2 = 12 qubits
    total_q, formula, breakdown = QUBOBuilder.calculate_qubits(num_products=2, num_periods=3, bits_per_var=2)
    assert total_q == 12
    assert "12" in formula
    assert breakdown["totalQubits"] == 12

def test_quantum_optimization_execution():
    req = QuantumOptimizationRequest(
        products=[ProductInput(currentInventory=5000000.0, safetyStockTarget=1000000.0)],
        demands=[5000000.0, 5200000.0, 5100000.0],
        capacityPerPeriod=6000000.0,
        discretizationBits=2,
        shots=128
    )
    res = QuantumOptimizationService.run_optimization(req)
    # Dynamic qubit count must equal 1 product * 3 periods * 2 bits = 6 qubits
    assert res.qubitCount == 6
    assert len(res.recommendedProductionPerPeriod) == 3
    assert res.status in [
        "Quantum Optimization Completed - Feasible Solution Found",
        "Classical Fallback Used - Quantum Candidate Infeasible"
    ]
    assert "validationChecks" in res.model_dump()

