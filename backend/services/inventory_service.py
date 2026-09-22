import math
from typing import List
from models.schemas import (
    InventoryAnalysisRequest,
    InventoryAnalysisResponse,
    InventoryItemAnalysis,
    ProductInput
)

class InventoryService:
    @staticmethod
    def analyze_inventory(request: InventoryAnalysisRequest) -> InventoryAnalysisResponse:
        items: List[InventoryItemAnalysis] = []
        
        total_current_stock = 0.0
        total_safety_stock = 0.0
        total_forecast_demand = 0.0
        
        has_critical = False
        has_warning = False
        
        for prod in request.products:
            # Baseline monthly demand assumption if not provided
            monthly_consumption = 6000000.0
            total_period_demand = monthly_consumption * request.forecastHorizonMonths
            
            # Demand variability: if not supplied, assume 12% coefficient of variation
            sigma_d = request.demandVariabilityStdDev or (monthly_consumption * 0.12)
            
            # Lead time in months (weeks / 4.33)
            lead_time_months = max(0.5, prod.leadTimeWeeks / 4.33)
            
            # Safety Stock formula: SS = Z * sigma_d * sqrt(LeadTime)
            # For 95% service level, Z = 1.65
            z_factor = 1.65
            calc_safety_stock = z_factor * sigma_d * math.sqrt(lead_time_months)
            
            # Harmonize with user target if provided
            final_safety_stock = max(calc_safety_stock, prod.safetyStockTarget)
            
            # Reorder Point = (Average Demand Rate * Lead Time) + Safety Stock
            reorder_point = (monthly_consumption * lead_time_months) + final_safety_stock
            
            # Expected ending inventory
            # Net buffer = Current Inventory - Safety Stock
            inventory_buffer = prod.currentInventory - final_safety_stock
            expected_ending = prod.currentInventory - total_period_demand
            
            runway_months = prod.currentInventory / (monthly_consumption + 1e-6)
            
            # Risk assessment
            if prod.currentInventory < final_safety_stock or runway_months < 1.0:
                stockout_risk = "Critical Stockout Risk"
                status_color = "red"
                has_critical = True
                explanation = (
                    f"Current stock ({prod.currentInventory:,.0f}) is below the required safety buffer ({final_safety_stock:,.0f}). "
                    f"Only {runway_months:.1f} months runway available. Expedited manufacturing replenishment required immediately."
                )
            elif prod.currentInventory < reorder_point or runway_months < 1.8:
                stockout_risk = "Low Buffer Warning"
                status_color = "yellow"
                has_warning = True
                explanation = (
                    f"Inventory is approaching reorder threshold ({reorder_point:,.0f}). "
                    f"Buffer is adequate for {runway_months:.1f} months, but scheduled production must begin before lead-time window expires."
                )
            else:
                stockout_risk = "Healthy"
                status_color = "green"
                explanation = (
                    f"Stock position is resilient. Inventory runway stands at {runway_months:.1f} months, comfortably "
                    f"exceeding both safety buffer ({final_safety_stock:,.0f}) and lead-time demands."
                )
                
            items.append(InventoryItemAnalysis(
                productId=prod.id,
                productName=prod.name,
                currentStock=prod.currentInventory,
                forecastDemand=total_period_demand,
                safetyStock=round(final_safety_stock, 0),
                inventoryBuffer=round(inventory_buffer, 0),
                expectedEndingInventory=round(expected_ending, 0),
                runwayMonths=round(runway_months, 1),
                reorderPoint=round(reorder_point, 0),
                stockoutRisk=stockout_risk,
                statusColor=status_color,
                businessExplanation=explanation
            ))
            
            total_current_stock += prod.currentInventory
            total_safety_stock += final_safety_stock
            total_forecast_demand += total_period_demand

        overall_health = "High Risk" if has_critical else ("Attention Needed" if has_warning else "Optimal")
        
        summary_rec = (
            "All product inventories are currently healthy and above protective buffers."
            if overall_health == "Optimal"
            else "Replenishment production is required to maintain safety thresholds across plant lines."
        )

        return InventoryAnalysisResponse(
            items=items,
            overallHealth=overall_health,
            totalCurrentStock=total_current_stock,
            totalSafetyStock=round(total_safety_stock, 0),
            totalForecastConsumption=total_forecast_demand,
            summaryRecommendation=summary_rec
        )
