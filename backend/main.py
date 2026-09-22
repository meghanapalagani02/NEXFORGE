from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from models.schemas import (
    ForecastRequest, ForecastResponse,
    InventoryAnalysisRequest, InventoryAnalysisResponse,
    ProductionPlanRequest, ProductionPlanResponse,
    SchedulingRequest, SchedulingResponse,
    QuantumOptimizationRequest, QuantumOptimizationResponse,
    ScenarioRequest, ScenarioResponse, ScenarioMetrics,
    PlanningAgentRequest, PlanningAgentResponse
)

from services.forecasting_service import ForecastingService
from services.inventory_service import InventoryService
from services.production_service import ProductionPlanningService
from services.scheduling_service import ProductionSchedulingService
from services.planning_agent import PlanningAgentService
from quantum.quantum_service import QuantumOptimizationService

app = FastAPI(
    title="NexForge Manufacturing Intelligence & Planning API",
    description="Intelligent Demand Forecasting, Production Planning, Inventory Safety Optimization, and Quantum Optimization Services for Industry 4.0",
    version="2.1.0"
)

# Enable CORS for frontend Vite development server & production hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "NexForge Manufacturing Intelligence Engine",
        "engines": {
            "forecasting": "Ready (Statsmodels / Scikit-Learn)",
            "inventory": "Ready (Statistical Safety Buffers)",
            "planning": "Ready (Linear Programming Exact Solver)",
            "scheduling": "Ready (Machine Gantt Dispatcher)",
            "quantum": "Ready (Qiskit QAOA / QUBO Simulator)"
        },
        "version": "2.1.0"
    }

@app.post("/api/forecast", response_model=ForecastResponse)
def run_forecast(request: ForecastRequest) -> ForecastResponse:
    try:
        return ForecastingService.generate_forecast(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting calculation failed: {str(e)}")

@app.post("/api/inventory/analyze", response_model=InventoryAnalysisResponse)
def analyze_inventory(request: InventoryAnalysisRequest) -> InventoryAnalysisResponse:
    try:
        return InventoryService.analyze_inventory(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inventory analysis failed: {str(e)}")

@app.post("/api/production/plan", response_model=ProductionPlanResponse)
def plan_production(request: ProductionPlanRequest) -> ProductionPlanResponse:
    try:
        return ProductionPlanningService.solve_production_plan(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Production optimization failed: {str(e)}")

@app.post("/api/scheduling/plan", response_model=SchedulingResponse)
def schedule_production(request: SchedulingRequest) -> SchedulingResponse:
    try:
        return ProductionSchedulingService.generate_schedule(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Production scheduling failed: {str(e)}")

@app.post("/api/quantum/optimize", response_model=QuantumOptimizationResponse)
def run_quantum_optimization(request: QuantumOptimizationRequest) -> QuantumOptimizationResponse:
    try:
        return QuantumOptimizationService.run_optimization(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quantum optimization failed: {str(e)}")

@app.post("/api/scenario/run", response_model=ScenarioResponse)
def run_scenario(request: ScenarioRequest) -> ScenarioResponse:
    try:
        # Compute baseline
        base_demand = request.baseDemand
        base_cap = request.baseCapacity
        base_inv = request.baseInventory
        base_ss = request.baseSafetyStock
        
        base_needed = max(0.0, base_demand + base_ss - base_inv)
        base_prod = min(base_cap, base_needed)
        base_end = base_inv + base_prod - base_demand
        base_short = max(0.0, -base_end)
        base_end = max(0.0, base_end)
        base_cost = base_prod * 45.0 + base_end * 4.5 + base_short * 120.0
        base_util = round((base_prod / (base_cap + 1e-6)) * 100.0, 1)
        base_service = round(max(0.0, min(100.0, (1.0 - base_short / (base_demand + 1e-6)) * 100.0)), 1)
        
        baseline = ScenarioMetrics(
            forecastDemand=round(base_demand, 0),
            productionQuantity=round(base_prod, 0),
            endingInventory=round(base_end, 0),
            totalCost=round(base_cost, 0),
            shortageUnits=round(base_short, 0),
            serviceLevelPct=base_service,
            capacityUtilizationPct=base_util,
            isFeasible=bool(base_short < 1.0)
        )
        
        # Compute scenario with perturbations
        scen_demand = base_demand * (1.0 + request.demandChangePct / 100.0)
        scen_cap = base_cap * (1.0 + request.capacityChangePct / 100.0)
        
        buffer_multiplier = 1.3 if request.inventoryBufferOption == "High" else (0.7 if request.inventoryBufferOption == "Low" else 1.0)
        lead_time_multiplier = 1.25 if request.leadTimeOption == "Increased" else 1.0
        scen_ss = base_ss * buffer_multiplier * lead_time_multiplier
        
        scen_needed = max(0.0, scen_demand + scen_ss - base_inv)
        scen_prod = min(scen_cap, scen_needed)
        scen_end = base_inv + scen_prod - scen_demand
        scen_short = max(0.0, -scen_end)
        scen_end = max(0.0, scen_end)
        scen_cost = scen_prod * 45.0 + scen_end * 4.5 + scen_short * 120.0
        scen_util = round((scen_prod / (scen_cap + 1e-6)) * 100.0, 1)
        scen_service = round(max(0.0, min(100.0, (1.0 - scen_short / (scen_demand + 1e-6)) * 100.0)), 1)
        
        scenario = ScenarioMetrics(
            forecastDemand=round(scen_demand, 0),
            productionQuantity=round(scen_prod, 0),
            endingInventory=round(scen_end, 0),
            totalCost=round(scen_cost, 0),
            shortageUnits=round(scen_short, 0),
            serviceLevelPct=scen_service,
            capacityUtilizationPct=scen_util,
            isFeasible=bool(scen_short < 1.0)
        )
        
        deltas = {
            "demandDelta": round(scen_demand - base_demand, 0),
            "productionDelta": round(scen_prod - base_prod, 0),
            "costDelta": round(scen_cost - base_cost, 0),
            "utilizationDelta": round(scen_util - base_util, 1),
            "serviceLevelDelta": round(scen_service - base_service, 1)
        }
        
        status_label = "Feasible" if scen_short < 1.0 else "Capacity Constrained / Shortage"
        
        summary = (
            f"Under scenario conditions (Demand {request.demandChangePct:+.0f}%, Capacity {request.capacityChangePct:+.0f}%), "
            f"target production shifts by {deltas['productionDelta']:+,.0f} units. Total operating cost shifts by INR {deltas['costDelta']:+,.0f}. "
            f"Resulting service level is {scen_service}% with line utilization at {scen_util}%."
        )

        return ScenarioResponse(
            baseline=baseline,
            scenario=scenario,
            deltas=deltas,
            businessImpactSummary=summary,
            statusLabel=status_label
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scenario recalculation failed: {str(e)}")

@app.post("/api/planning/agent", response_model=PlanningAgentResponse)
def ask_planning_agent(request: PlanningAgentRequest) -> PlanningAgentResponse:
    try:
        return PlanningAgentService.answer_query(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Agent explanation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("BACKEND_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
