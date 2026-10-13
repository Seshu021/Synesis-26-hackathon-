import { BottleneckItem, HospitalBed, Patient, DiagnosticResource, DepartmentInfo } from '../types';

export function detectHospitalBottlenecks(
  patients: Patient[],
  beds: HospitalBed[],
  diagnostics: DiagnosticResource[],
  departments: DepartmentInfo[]
): BottleneckItem[] {
  const bottlenecks: BottleneckItem[] = [];

  // Group patients by stage
  const stageQueues: Record<string, Patient[]> = {
    triage_intake: patients.filter(p => p.currentStage === 'triage_intake'),
    assessment: patients.filter(p => p.currentStage === 'assessment'),
    diagnostics: patients.filter(p => p.currentStage === 'diagnostics'),
    treatment: patients.filter(p => p.currentStage === 'treatment'),
    awaiting_bed: patients.filter(p => p.currentStage === 'awaiting_bed'),
    discharge_pending: patients.filter(p => p.currentStage === 'discharge_pending'),
  };

  // 1. Stage: Emergency Intake
  const intakePatients = stageQueues.triage_intake;
  const avgIntakeWait = intakePatients.length > 0 
    ? Math.round(intakePatients.reduce((s, p) => s + p.waitingDurationMinutes, 0) / intakePatients.length)
    : 15;
  const intakeThreshold = 20; // 20 mins benchmark

  if (intakePatients.length >= 3 || avgIntakeWait > intakeThreshold) {
    bottlenecks.push({
      id: 'BN-INTAKE',
      stageName: 'Emergency Intake & Rapid Registration',
      departmentId: 'ed',
      severity: avgIntakeWait > 30 ? 'high' : 'medium',
      currentQueue: intakePatients.length,
      thresholdQueue: 2,
      avgWaitTimeMinutes: avgIntakeWait,
      thresholdWaitTimeMinutes: intakeThreshold,
      triggerMeasurement: `Queue: ${intakePatients.length} patients | Average intake wait: ${avgIntakeWait} mins (target: ${intakeThreshold}m).`,
      probableOperationalCause: 'Concurrent ambulance arrivals and registration desk throughput constrained by manual insurance/ID verification.',
      recommendedAction: 'Open secondary triage station in Fast Track and initiate parallel bedside registration via mobile tablet carts.',
      impactScope: 'Affects incoming walk-in and EMS emergency arrivals before clinical triage.'
    });
  }

  // 2. Stage: Diagnostic Testing (CT/MRI/Lab)
  const diagPatients = stageQueues.diagnostics;
  const offlineScanners = diagnostics.filter(d => d.status !== 'operational');
  const ct01 = diagnostics.find(d => d.id === 'CT-01');
  const ctQueue = ct01 ? ct01.queueCount : diagPatients.length;
  const ctTurnaround = ct01 ? ct01.avgTurnaroundMinutes : 38;

  if (ctTurnaround > 25 || offlineScanners.length > 0 || ctQueue >= 5) {
    bottlenecks.push({
      id: 'BN-DIAGNOSTICS',
      stageName: 'Stat Diagnostic Imaging (CT/MRI)',
      departmentId: 'diagnostics',
      severity: ctTurnaround >= 35 ? 'critical' : 'high',
      currentQueue: ctQueue,
      thresholdQueue: 4,
      avgWaitTimeMinutes: ctTurnaround,
      thresholdWaitTimeMinutes: 25,
      triggerMeasurement: `Stat CT scanner utilization at 94% | Queue depth: ${ctQueue} cases | Avg cycle: ${ctTurnaround}m (target: 25m) | Secondary CT-02 offline for maintenance.`,
      probableOperationalCause: 'High volume of contrast abdominopelvic and neuro stroke scans concentrated onto single operational scanner CT-01.',
      recommendedAction: 'Route eligible stable P2/P3 patients to Outpatient Radiology Suite B and expedite transport escort turnover.',
      impactScope: 'Blocks downstream ED clinical decision-making and inpatient admission orders.'
    });
  }

  // 3. Stage: Inpatient Bed Transfer / Boarding (Awaiting Bed)
  const awaitingBedPatients = stageQueues.awaiting_bed;
  const avgBoardingWait = awaitingBedPatients.length > 0
    ? Math.round(awaitingBedPatients.reduce((s, p) => s + p.waitingDurationMinutes, 0) / awaitingBedPatients.length)
    : 50;

  // Check occupancy in Med-Surg and ICU
  const icuBeds = beds.filter(b => b.departmentId === 'icu');
  const icuOccupied = icuBeds.filter(b => b.status === 'occupied').length;
  const icuOccupancyPercent = icuBeds.length > 0 ? (icuOccupied / icuBeds.length) * 100 : 0;

  const medBeds = beds.filter(b => b.departmentId === 'med_surg');
  const medOccupied = medBeds.filter(b => b.status === 'occupied').length;
  const medOccupancyPercent = medBeds.length > 0 ? (medOccupied / medBeds.length) * 100 : 0;

  if (awaitingBedPatients.length >= 3 || avgBoardingWait > 60 || icuOccupancyPercent >= 80 || medOccupancyPercent >= 85) {
    bottlenecks.push({
      id: 'BN-BOARDING',
      stageName: 'Inpatient Admission & Boarding Transfers',
      departmentId: 'med_surg',
      severity: icuOccupancyPercent >= 85 || avgBoardingWait > 75 ? 'critical' : 'high',
      currentQueue: awaitingBedPatients.length,
      thresholdQueue: 2,
      avgWaitTimeMinutes: avgBoardingWait,
      thresholdWaitTimeMinutes: 45,
      triggerMeasurement: `${awaitingBedPatients.length} admitted patients boarding in ED | Avg boarding wait: ${avgBoardingWait}m | ICU: ${Math.round(icuOccupancyPercent)}% | Med-Surg: ${Math.round(medOccupancyPercent)}%.`,
      probableOperationalCause: 'Mismatch between ED admission velocity and inpatient discharge velocity; scarcity of monitored telemetry and negative-pressure beds.',
      recommendedAction: 'Prioritize discharge turnaround on 4-East Step-Down and assign dedicated inpatient transfer nurse.',
      impactScope: 'Ties up acute ED treatment bays with admitted patients, creating upstream ambulance diversion risk.'
    });
  }

  // 4. Stage: Discharge Processing
  const dischargePatients = stageQueues.discharge_pending;
  const bedsInCleaning = beds.filter(b => b.status === 'cleaning');
  const dischargeAvgWait = dischargePatients.length > 0
    ? Math.round(dischargePatients.reduce((s, p) => s + p.waitingDurationMinutes, 0) / dischargePatients.length)
    : 45;

  if (dischargeAvgWait > 60 || dischargePatients.length >= 2 || bedsInCleaning.length >= 3) {
    bottlenecks.push({
      id: 'BN-DISCHARGE',
      stageName: 'Discharge Processing & Bed Turnover',
      departmentId: 'med_surg',
      severity: dischargeAvgWait > 75 ? 'high' : 'medium',
      currentQueue: dischargePatients.length,
      thresholdQueue: 1,
      avgWaitTimeMinutes: dischargeAvgWait,
      thresholdWaitTimeMinutes: 45,
      triggerMeasurement: `Discharge dwell time: ${dischargeAvgWait} mins (target: 45m) | ${bedsInCleaning.length} beds awaiting environmental turnover.`,
      probableOperationalCause: 'Delays in takeaway outpatient prescription dispensing and non-emergency patient transit coordination.',
      recommendedAction: 'Deploy discharge concierge to escort ready patients to Hospital Transit Lounge and notify EVS supervisor for priority cleanings.',
      impactScope: 'Prevents released beds from transitioning into available inventory for incoming admissions.'
    });
  }

  // 5. Stage: Initial Assessment / Provider Consultation
  const assessmentPatients = stageQueues.assessment;
  const avgAssessmentWait = assessmentPatients.length > 0
    ? Math.round(assessmentPatients.reduce((s, p) => s + p.waitingDurationMinutes, 0) / assessmentPatients.length)
    : 28;

  if (assessmentPatients.length >= 3 || avgAssessmentWait > 30) {
    bottlenecks.push({
      id: 'BN-ASSESSMENT',
      stageName: 'Initial Clinical Assessment & Provider Exam',
      departmentId: 'ed',
      severity: avgAssessmentWait > 40 ? 'high' : 'medium',
      currentQueue: assessmentPatients.length,
      thresholdQueue: 2,
      avgWaitTimeMinutes: avgAssessmentWait,
      thresholdWaitTimeMinutes: 25,
      triggerMeasurement: `${assessmentPatients.length} patients in provider queue | Avg wait: ${avgAssessmentWait} mins (target: 25m).`,
      probableOperationalCause: 'Attending physician rounding on complex resuscitation cases, creating temporary lag in mid-acuity provider evaluations.',
      recommendedAction: 'Authorize advanced practice provider (APP) to initiate standardized rapid order sets for P3 presentations.',
      impactScope: 'Delays laboratory and imaging order placement for early diagnostic workups.'
    });
  }

  return bottlenecks;
}
