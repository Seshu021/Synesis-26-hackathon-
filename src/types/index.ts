export type UserRole = 'administrator' | 'authorized_staff';

export type DepartmentId = 'ed' | 'icu' | 'med_surg' | 'surgical' | 'diagnostics';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  totalBeds: number;
  targetMaxOccupancy: number; // e.g. 85%
  serviceThroughputPerHour: number; // patients/hr
  activeStaffCount: number;
  targetStaffCount: number;
  description: string;
}

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'reserved';

export type BedType = 
  | 'Standard Adult'
  | 'ICU Negative Pressure'
  | 'Telemetry / Step-Down'
  | 'Trauma Bay'
  | 'Isolation Room'
  | 'Post-Surgical Recovery';

export type EquipmentRequirement = 
  | 'ventilator'
  | 'cardiac_monitor'
  | 'hepa_filter'
  | 'dialysis_ready'
  | 'bariatric_lift'
  | 'infusion_pump';

export interface HospitalBed {
  id: string; // e.g., "ED-101", "ICU-201"
  departmentId: DepartmentId;
  wardName: string;
  bedNumber: string;
  status: BedStatus;
  bedType: BedType;
  equipment: EquipmentRequirement[];
  currentPatientId?: string;
  currentPatientName?: string; // Synthetic e.g. "PT-9421"
  estimatedDischargeTime?: string;
  lastUpdated: string;
  notes?: string;
}

export type PatientFlowStage = 
  | 'triage_intake'
  | 'assessment'
  | 'diagnostics'
  | 'treatment'
  | 'awaiting_bed'
  | 'discharge_pending';

export type OperationalPriority = 
  | 'P1 - Immediate / Resuscitation'
  | 'P2 - High / Emergent'
  | 'P3 - Urgent'
  | 'P4 - Standard / Routine';

export interface Patient {
  id: string; // Synthetic ID e.g., "PT-8102"
  ageGroup: 'Pediatric' | 'Adult (18-64)' | 'Geriatric (65+)';
  arrivalTimestamp: string;
  waitingDurationMinutes: number;
  currentStage: PatientFlowStage;
  targetDepartment: DepartmentId;
  requiredBedType: BedType;
  requiredEquipment: EquipmentRequirement[];
  operationalPriority: OperationalPriority;
  chiefComplaintSummary: string; // synthetic operational summary
  assignedBedId?: string;
  allocationConfirmedBy?: string;
  allocationTimestamp?: string;
}

export interface HistoricalArrivalRecord {
  timestamp: string;
  hour: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ...
  departmentId: DepartmentId;
  actualArrivals: number;
}

export interface ForecastPoint {
  timeLabel: string;
  timestamp: string;
  hour: number;
  predictedArrivals: number;
  actualArrivals?: number; // for overlapping historical point
  lowerBound: number;
  upperBound: number;
  projectedOccupancyPercent: number;
  riskOfCapacityExceedance: boolean;
}

export type BottleneckSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BottleneckItem {
  id: string;
  stageName: string;
  departmentId: DepartmentId;
  severity: BottleneckSeverity;
  currentQueue: number;
  thresholdQueue: number;
  avgWaitTimeMinutes: number;
  thresholdWaitTimeMinutes: number;
  triggerMeasurement: string;
  probableOperationalCause: string;
  recommendedAction: string;
  impactScope: string;
}

export type RecommendationUrgency = 'urgent' | 'moderate' | 'informational';
export type RecommendationStatus = 'pending' | 'approved' | 'dismissed' | 'reviewed';

export interface Recommendation {
  id: string;
  title: string;
  departmentId: DepartmentId;
  urgency: RecommendationUrgency;
  status: RecommendationStatus;
  triggerData: string;
  operationalContext: string;
  proposedAction: string;
  estimatedImpact: string;
  createdTimestamp: string;
  reviewedByRole?: UserRole;
  reviewedTimestamp?: string;
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  actionType: 'bed_allocation' | 'bed_status_change' | 'recommendation_review' | 'alert_action' | 'simulation_run' | 'settings_update' | 'system_reset';
  details: string;
  targetEntityId?: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  departmentId: DepartmentId;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  triggerCondition: string;
  recommendedNextStep: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
}

export interface DiagnosticResource {
  id: string;
  name: string;
  type: 'CT Scanner' | 'MRI Scanner' | 'Digital X-Ray' | 'Ultrasound Bay' | 'Stat Lab Analyzer';
  status: 'operational' | 'maintenance' | 'queued' | 'offline';
  currentUtilizationPercent: number;
  queueCount: number;
  avgTurnaroundMinutes: number;
  targetTurnaroundMinutes: number;
}

export interface SimulationParameters {
  arrivalSurgePercent: number; // e.g. -30% to +50%
  availableBedsDelta: number; // e.g. -8 to +8
  staffingRatioPercent: number; // e.g. 70% to 130%
  equipmentUptimePercent: number; // e.g. 60% to 100%
  dischargeThroughputMultiplier: number; // e.g. 0.7x to 1.5x
}

export interface SimulationResult {
  params: SimulationParameters;
  baseline: {
    overallOccupancyPercent: number;
    edWaitTimeMinutes: number;
    icuOccupancyPercent: number;
    bottleneckCount: number;
    atRiskDepartments: string[];
  };
  projected: {
    overallOccupancyPercent: number;
    edWaitTimeMinutes: number;
    icuOccupancyPercent: number;
    bottleneckCount: number;
    atRiskDepartments: string[];
  };
  deltas: {
    occupancyDeltaPercent: number;
    waitTimeDeltaMinutes: number;
    icuDeltaPercent: number;
  };
  keyDrivers: string[];
  suggestedMitigations: string[];
}
