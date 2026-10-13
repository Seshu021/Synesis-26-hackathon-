import { SimulationParameters, SimulationResult, HospitalBed, Patient, DepartmentInfo } from '../types';

export function runWhatIfSimulation(
  params: SimulationParameters,
  departments: DepartmentInfo[],
  beds: HospitalBed[],
  patients: Patient[]
): SimulationResult {
  // 1. Calculate Baseline Metrics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const baselineOccupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  const waitingPatients = patients.filter(p => p.currentStage !== 'treatment' && p.currentStage !== 'discharge_pending');
  const baselineEdWaitTimeMinutes = waitingPatients.length > 0
    ? Math.round(waitingPatients.reduce((sum, p) => sum + p.waitingDurationMinutes, 0) / waitingPatients.length)
    : 38;

  const icuBeds = beds.filter(b => b.departmentId === 'icu');
  const icuOccupied = icuBeds.filter(b => b.status === 'occupied').length;
  const baselineIcuOccupancy = icuBeds.length > 0 ? Math.round((icuOccupied / icuBeds.length) * 100) : 0;

  const baselineAtRiskDepts: string[] = [];
  if (baselineOccupancyPercent > 80) baselineAtRiskDepts.push('General Facility');
  if (baselineIcuOccupancy >= 80) baselineAtRiskDepts.push('Intensive Care Unit');
  if (baselineEdWaitTimeMinutes > 40) baselineAtRiskDepts.push('Emergency Department');

  const baselineBottlenecks = 3;

  // 2. Projected Calculations based on parameters:
  // a) Effective capacity: totalBeds + availableBedsDelta
  const simulatedTotalBeds = Math.max(10, totalBeds + params.availableBedsDelta);
  
  // b) Influx impact: arrival factor
  const arrivalMultiplier = 1 + (params.arrivalSurgePercent / 100);

  // c) Outflux / Discharge factor:
  const dischargeMultiplier = params.dischargeThroughputMultiplier;

  // d) Staffing factor impacts wait time and service velocity
  const staffingMultiplier = params.staffingRatioPercent / 100;

  // e) Equipment factor impacts diagnostic delay & throughput
  const equipmentMultiplier = params.equipmentUptimePercent / 100;

  // Calculate projected occupied beds:
  // Occupancy increases with arrival multiplier and decreases with discharge throughput
  const netDemandFactor = arrivalMultiplier / (dischargeMultiplier * 0.95);
  const projectedOccupied = Math.min(
    simulatedTotalBeds, 
    Math.round(occupiedBeds * (0.4 + 0.6 * netDemandFactor))
  );

  const projectedOccupancyPercent = Math.min(100, Math.round((projectedOccupied / simulatedTotalBeds) * 100));

  // Wait time calculation:
  // Baseline wait time scaled by: arrivals / (staffing * equipment * discharge)
  const capacityStrainFactor = (simulatedTotalBeds < totalBeds) ? 1.25 : 1.0;
  const waitMultiplier = (arrivalMultiplier * capacityStrainFactor) / (staffingMultiplier * Math.sqrt(equipmentMultiplier) * Math.sqrt(dischargeMultiplier));
  const projectedWaitTime = Math.max(12, Math.round(baselineEdWaitTimeMinutes * waitMultiplier));

  // Projected ICU occupancy:
  const icuArrivalFactor = 1 + (params.arrivalSurgePercent * 0.7 / 100);
  const projectedIcuOccupied = Math.min(
    icuBeds.length,
    Math.round(icuOccupied * icuArrivalFactor)
  );
  const projectedIcuOccupancy = icuBeds.length > 0 
    ? Math.min(100, Math.round((projectedIcuOccupied / icuBeds.length) * 100))
    : 0;

  // Projected bottlenecks count
  let projectedBottlenecks = baselineBottlenecks;
  if (projectedOccupancyPercent > 88) projectedBottlenecks += 2;
  else if (projectedOccupancyPercent < 75) projectedBottlenecks = Math.max(1, projectedBottlenecks - 1);
  if (equipmentMultiplier < 0.8) projectedBottlenecks += 1;
  if (staffingMultiplier < 0.85) projectedBottlenecks += 1;
  if (dischargeMultiplier >= 1.25 && arrivalMultiplier <= 1.0) projectedBottlenecks = Math.max(1, projectedBottlenecks - 1);

  // Projected At-Risk Departments
  const projectedAtRisk: string[] = [];
  if (projectedOccupancyPercent >= 85) projectedAtRisk.push('Medical-Surgical Ward');
  if (projectedIcuOccupancy >= 85) projectedAtRisk.push('Intensive Care Unit');
  if (projectedWaitTime >= 45) projectedAtRisk.push('Emergency Department');
  if (params.equipmentUptimePercent < 75) projectedAtRisk.push('Diagnostic Imaging Suite');

  // Deltas
  const occupancyDeltaPercent = projectedOccupancyPercent - baselineOccupancyPercent;
  const waitTimeDeltaMinutes = projectedWaitTime - baselineEdWaitTimeMinutes;
  const icuDeltaPercent = projectedIcuOccupancy - baselineIcuOccupancy;

  // Key Drivers explanation
  const keyDrivers: string[] = [];
  if (params.arrivalSurgePercent !== 0) {
    keyDrivers.push(
      `Patient arrival variance (${params.arrivalSurgePercent > 0 ? '+' : ''}${params.arrivalSurgePercent}%) modifies upstream hourly admission volume across triage.`
    );
  }
  if (params.availableBedsDelta !== 0) {
    keyDrivers.push(
      `Bed inventory shift (${params.availableBedsDelta > 0 ? '+' : ''}${params.availableBedsDelta} beds) alters inpatient absorption headroom.`
    );
  }
  if (params.staffingRatioPercent !== 100) {
    keyDrivers.push(
      `Staffing ratio set to ${params.staffingRatioPercent}% of target baseline, directly shifting provider evaluation cycle velocity.`
    );
  }
  if (params.equipmentUptimePercent < 100) {
    keyDrivers.push(
      `Diagnostic equipment availability at ${params.equipmentUptimePercent}%, amplifying scan backlogs and ED boarding dwell times.`
    );
  }
  if (params.dischargeThroughputMultiplier !== 1.0) {
    keyDrivers.push(
      `Discharge throughput adjusted to ${params.dischargeThroughputMultiplier}x standard speed, modifying the rate of inpatient bed turnover.`
    );
  }
  if (keyDrivers.length === 0) {
    keyDrivers.push('Baseline simulation parameters active (no operational variances applied).');
  }

  // Suggested Mitigations based on simulated stresses
  const suggestedMitigations: string[] = [];
  if (projectedOccupancyPercent >= 88) {
    suggestedMitigations.push('Activate surge protocol: pre-authorize step-down transfers to surgical recovery beds.');
  }
  if (projectedWaitTime >= 50) {
    suggestedMitigations.push('Establish Fast-Track minor injury lane to divert P4 presentations from main acute bays.');
  }
  if (params.equipmentUptimePercent < 80) {
    suggestedMitigations.push('Reroute non-emergent abdominal CTs to Outpatient Center Imaging B to preserve acute bay cycle times.');
  }
  if (params.dischargeThroughputMultiplier < 1.0) {
    suggestedMitigations.push('Implement multidisciplinary morning discharge rounds and mobilize pharmacy concierge to bedside.');
  }
  if (suggestedMitigations.length === 0) {
    suggestedMitigations.push('Operational resilience within normal safety thresholds. Continue standard shift oversight.');
  }

  return {
    params,
    baseline: {
      overallOccupancyPercent: baselineOccupancyPercent,
      edWaitTimeMinutes: baselineEdWaitTimeMinutes,
      icuOccupancyPercent: baselineIcuOccupancy,
      bottleneckCount: baselineBottlenecks,
      atRiskDepartments: baselineAtRiskDepts
    },
    projected: {
      overallOccupancyPercent: projectedOccupancyPercent,
      edWaitTimeMinutes: projectedWaitTime,
      icuOccupancyPercent: projectedIcuOccupancy,
      bottleneckCount: projectedBottlenecks,
      atRiskDepartments: projectedAtRisk
    },
    deltas: {
      occupancyDeltaPercent,
      waitTimeDeltaMinutes,
      icuDeltaPercent
    },
    keyDrivers,
    suggestedMitigations
  };
}
