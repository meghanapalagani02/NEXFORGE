from typing import List, Dict
from models.schemas import (
    SchedulingRequest,
    SchedulingResponse,
    ScheduledJob,
    MachineUtilization,
    MachineConfig
)

class ProductionSchedulingService:
    @staticmethod
    def generate_schedule(request: SchedulingRequest) -> SchedulingResponse:
        machines = request.machines
        if not machines:
            machines = [
                MachineConfig(id="M-01", name="Automated Stator Winding Cell A", hourlyCapacityPerMonth=352.0),
                MachineConfig(id="M-02", name="Rotor Dynamic Balancing Lathe B", hourlyCapacityPerMonth=352.0),
                MachineConfig(id="M-03", name="Vacuum Pressure Impregnation Tank", hourlyCapacityPerMonth=320.0),
                MachineConfig(id="M-04", name="End-of-Line Dyno Test Bench", hourlyCapacityPerMonth=380.0)
            ]
            
        total_work_hours_per_machine = request.workDaysInMonth * request.hoursPerShift * request.shiftsPerDay
        
        # Products / jobs to schedule
        prod_orders = request.productionQuantities
        if not prod_orders:
            prod_orders = {
                "Stator Sub-Assembly (Sub-A)": 1800000.0,
                "Precision Rotor Shaft (Sub-B)": 1550000.0,
                "Cast Iron Frame Housing (Sub-C)": 1100000.0,
                "Final Induction Motor Pack": 750000.0
            }
            
        scheduled_jobs: List[ScheduledJob] = []
        machine_hours: Dict[str, float] = {m.id: 0.0 for m in machines}
        
        job_idx = 1
        day_counter = 1
        
        for prod_name, qty in prod_orders.items():
            # Estimate processing standard: 0.00018 hours per unit
            total_job_hours = round(qty * 0.00018, 1)
            
            # Select machine with lowest current allocated hours (Greedy dispatching)
            assigned_m = min(machines, key=lambda m: machine_hours[m.id])
            
            duration_days = max(1, int(round(total_job_hours / (request.hoursPerShift * request.shiftsPerDay))))
            start_day = f"Day {day_counter}"
            end_day = f"Day {min(request.workDaysInMonth, day_counter + duration_days)}"
            day_counter = (day_counter + duration_days - 1) % request.workDaysInMonth + 1
            
            priority = "High" if qty > 1400000 else ("Medium" if qty > 900000 else "Standard")
            
            scheduled_jobs.append(ScheduledJob(
                id=f"JOB-{job_idx:03d}",
                productId=f"SKU-{job_idx}",
                productName=prod_name,
                machineId=assigned_m.id,
                machineName=assigned_m.name,
                quantity=qty,
                processingHours=total_job_hours,
                startDate=start_day,
                endDate=end_day,
                priority=priority,
                status="Scheduled"
            ))
            
            machine_hours[assigned_m.id] += total_job_hours
            job_idx += 1
            
        utilizations: List[MachineUtilization] = []
        bottleneck_name = None
        max_util = -1.0
        total_scheduled = sum(machine_hours.values())
        total_avail = total_work_hours_per_machine * len(machines)
        
        for m in machines:
            alloc = machine_hours[m.id]
            util = round((alloc / total_work_hours_per_machine) * 100.0, 1)
            is_bottleneck = False
            
            if util > max_util:
                max_util = util
                bottleneck_name = m.name
                
            if util > 90.0:
                status = "Overloaded"
            elif util > 75.0:
                status = "High Load"
            else:
                status = "Optimal"
                
            utilizations.append(MachineUtilization(
                machineId=m.id,
                machineName=m.name,
                allocatedHours=round(alloc, 1),
                totalAvailableHours=float(total_work_hours_per_machine),
                utilizationPct=util,
                isBottleneck=False,
                status=status
            ))
            
        # Mark bottleneck
        for u in utilizations:
            if u.machineName == bottleneck_name:
                u.isBottleneck = True

        avg_util = round((total_scheduled / (total_avail + 1e-6)) * 100.0, 1)

        return SchedulingResponse(
            schedule=scheduled_jobs,
            machineUtilizations=utilizations,
            bottleneckMachineName=bottleneck_name if max_util > 75.0 else None,
            totalScheduledHours=round(total_scheduled, 1),
            totalAvailableHours=float(total_avail),
            averageUtilizationPct=avg_util,
            schedulingStatus=f"Gantt schedule generated. Line bottleneck identified at '{bottleneck_name}' ({max_util}% load)."
        )
