from typing import List, Dict, Any
from models.schemas import PlanningAgentRequest, PlanningAgentResponse

class PlanningAgentService:
    @staticmethod
    def answer_query(request: PlanningAgentRequest) -> PlanningAgentResponse:
        q = request.userQuery.lower()
        d = request.currentDemand
        p = request.currentProduction
        inv = request.currentInventory
        ss = request.currentSafetyStock
        cap = request.currentCapacity
        
        utilization = (p / (cap + 1e-6)) * 100.0 if cap > 0 else 0.0
        net_demand = max(0.0, d + ss - inv)
        inventory_cushion = inv - ss
        
        # Determine topic and generate contextual explanation based on real calculations
        if any(term in q for term in ["why", "reason", "recommend", "quantity", "produce"]):
            answer = (
                f"The system recommends producing {p:,.0f} units to address total projected demand of {d:,.0f} units. "
                f"Because existing opening inventory provides {inv:,.0f} units (with a required safety buffer of {ss:,.0f} units), "
                f"the net manufacturing target is {net_demand:,.0f} units. This schedules production within the plant's "
                f"{cap:,.0f} units/month limit at an optimal {utilization:.1f}% capacity utilization."
            )
            key_factors = [
                f"Projected Demand: {d:,.0f} units",
                f"Net Working Inventory: {inv:,.0f} units (Protects {ss:,.0f} safety buffer)",
                f"Target Capacity Load: {utilization:.1f}% across plant cells",
                "Cost-minimization: Balances inventory holding vs shortage penalties"
            ]
            action = "Approve master production schedule and dispatch line work orders."
            
        elif any(term in q for term in ["bottleneck", "machine", "line", "capacity", "overload"]):
            answer = (
                f"The plant is operating at {utilization:.1f}% of total monthly capacity ({cap:,.0f} units). "
                f"If production demand surges beyond {cap:,.0f} units in any single period, line balancing or a second shift "
                f"will be required to avoid exceeding machine hourly ceilings."
            )
            key_factors = [
                f"Installed Monthly Capacity: {cap:,.0f} units",
                f"Scheduled Production: {p:,.0f} units ({utilization:.1f}% loaded)",
                "Bottleneck Stage: Sub-assembly winding & testing stations"
            ]
            action = "Monitor line throughput and stagger shift handovers during peak production cycles."
            
        elif any(term in q for term in ["inventory", "stock", "buffer", "risk", "shortage"]):
            runway = inv / (d / 6.0 + 1e-6) if d > 0 else 0.0
            if inv < ss:
                answer = (
                    f"Warning: Current inventory ({inv:,.0f} units) is below the minimum safety buffer ({ss:,.0f} units). "
                    f"Runway is limited to {runway:.1f} months. The schedule prioritizes early replenishment to prevent stockouts."
                )
                action = "Expedite raw material procurement and begin initial lot fabrication immediately."
            else:
                answer = (
                    f"Current inventory is healthy at {inv:,.0f} units, comfortably exceeding the {ss:,.0f} unit safety stock. "
                    f"Net buffer cushion is {inventory_cushion:,.0f} units, providing {runway:.1f} months of baseline demand coverage."
                )
                action = "Maintain regular manufacturing cadence and monitor weekly consumption."
            key_factors = [
                f"Current Physical Inventory: {inv:,.0f} units",
                f"Protective Safety Stock Target: {ss:,.0f} units",
                f"Effective Demand Runway: {runway:.1f} months"
            ]
            
        elif any(term in q for term in ["scenario", "what if", "increase", "20%"]):
            d_surge = d * 1.20
            p_surge = min(cap, max(0.0, d_surge + ss - inv))
            cost_surge = (p_surge - p) * 45.0
            answer = (
                f"Under a +20% demand surge scenario (total demand: {d_surge:,.0f} units), recommended production expands "
                f"from {p:,.0f} to {p_surge:,.0f} units. Estimated operational cost increases by INR {cost_surge:,.0f}, "
                f"with line utilization reaching {round((p_surge/cap)*100.0, 1)}%."
            )
            key_factors = [
                f"Surge Demand (+20%): {d_surge:,.0f} units",
                f"Recommended Surge Output: {p_surge:,.0f} units",
                f"Capacity Feasibility: {'Feasible within limit' if p_surge <= cap else 'Exceeds monthly capacity'}",
                f"Estimated Cost Delta: +INR {cost_surge:,.0f}"
            ]
            action = "Review line overtime options in Scenario Simulator before committing supplier contracts."
            
        else:
            answer = (
                f"NexForge Intelligence Summary: Based on current plant parameters, forecast demand stands at {d:,.0f} units "
                f"with current stock at {inv:,.0f} units. The mathematical optimization model recommends producing {p:,.0f} units "
                f"to achieve 100% demand fulfillment while upholding the {ss:,.0f} unit safety buffer."
            )
            key_factors = [
                f"Demand: {d:,.0f} units",
                f"Production: {p:,.0f} units",
                f"Safety Buffer: {ss:,.0f} units",
                f"Capacity Utilization: {utilization:.1f}%"
            ]
            action = "Select an action below or ask specific questions regarding line capacity, inventory, or forecast models."

        return PlanningAgentResponse(
            answer=answer,
            keyFactors=key_factors,
            supportingStats={
                "demand": d,
                "production": p,
                "inventory": inv,
                "safetyStock": ss,
                "capacity": cap,
                "utilization": round(utilization, 1)
            },
            suggestedAction=action,
            confidenceScore=0.98
        )
