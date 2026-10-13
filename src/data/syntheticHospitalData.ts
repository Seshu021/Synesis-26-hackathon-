import { 
  HospitalBed, 
  Patient, 
  DepartmentInfo, 
  DiagnosticResource, 
  Recommendation, 
  AlertNotification, 
  HistoricalArrivalRecord,
  AuditLogEntry
} from '../types';

export const INITIAL_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'ed',
    name: 'Emergency Department',
    shortName: 'ED / Trauma',
    totalBeds: 12,
    targetMaxOccupancy: 85,
    serviceThroughputPerHour: 4.8,
    activeStaffCount: 14,
    targetStaffCount: 16,
    description: 'Acute emergency intake, resuscitation, trauma bays, and rapid assessment.'
  },
  {
    id: 'icu',
    name: 'Intensive Care Unit',
    shortName: 'ICU / Critical Care',
    totalBeds: 8,
    targetMaxOccupancy: 80,
    serviceThroughputPerHour: 0.9,
    activeStaffCount: 10,
    targetStaffCount: 10,
    description: 'Critical hemodynamic support, mechanical ventilation, and continuous multi-parameter telemetry.'
  },
  {
    id: 'med_surg',
    name: 'General Medical-Surgical Ward',
    shortName: 'Med-Surg',
    totalBeds: 16,
    targetMaxOccupancy: 90,
    serviceThroughputPerHour: 2.2,
    activeStaffCount: 12,
    targetStaffCount: 14,
    description: 'Inpatient medical care, sub-acute monitoring, telemetry step-down, and rehabilitation readiness.'
  },
  {
    id: 'surgical',
    name: 'Surgical & Post-Op Recovery',
    shortName: 'Surg Recovery',
    totalBeds: 8,
    targetMaxOccupancy: 85,
    serviceThroughputPerHour: 1.5,
    activeStaffCount: 8,
    targetStaffCount: 8,
    description: 'Post-anesthesia care unit (PACU), elective surgical recovery, and specialized orthopedic observation.'
  },
  {
    id: 'diagnostics',
    name: 'Diagnostic Imaging & Stat Labs',
    shortName: 'Diagnostics',
    totalBeds: 0,
    targetMaxOccupancy: 85,
    serviceThroughputPerHour: 6.0,
    activeStaffCount: 7,
    targetStaffCount: 8,
    description: 'High-throughput CT, MRI, X-ray, Ultrasound, and point-of-care laboratory analytics.'
  }
];

export const INITIAL_BEDS: HospitalBed[] = [
  // ED Beds (12)
  { id: 'ED-101', departmentId: 'ed', wardName: 'ED Acute Pod A', bedNumber: '101', status: 'occupied', bedType: 'Trauma Bay', equipment: ['cardiac_monitor', 'ventilator', 'infusion_pump'], currentPatientId: 'PT-9011', currentPatientName: 'PT-9011', lastUpdated: '10 mins ago' },
  { id: 'ED-102', departmentId: 'ed', wardName: 'ED Acute Pod A', bedNumber: '102', status: 'occupied', bedType: 'Trauma Bay', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-9014', currentPatientName: 'PT-9014', lastUpdated: '35 mins ago' },
  { id: 'ED-103', departmentId: 'ed', wardName: 'ED Rapid Assessment', bedNumber: '103', status: 'occupied', bedType: 'Standard Adult', equipment: ['cardiac_monitor'], currentPatientId: 'PT-9022', currentPatientName: 'PT-9022', lastUpdated: '1 hour ago' },
  { id: 'ED-104', departmentId: 'ed', wardName: 'ED Rapid Assessment', bedNumber: '104', status: 'available', bedType: 'Standard Adult', equipment: ['cardiac_monitor'], lastUpdated: '5 mins ago' },
  { id: 'ED-105', departmentId: 'ed', wardName: 'ED Rapid Assessment', bedNumber: '105', status: 'occupied', bedType: 'Standard Adult', equipment: ['infusion_pump'], currentPatientId: 'PT-9035', currentPatientName: 'PT-9035', lastUpdated: '40 mins ago' },
  { id: 'ED-106', departmentId: 'ed', wardName: 'ED Negative Pressure', bedNumber: '106', status: 'cleaning', bedType: 'Isolation Room', equipment: ['hepa_filter', 'cardiac_monitor'], lastUpdated: '15 mins ago', notes: 'Terminal disinfection following discharge' },
  { id: 'ED-107', departmentId: 'ed', wardName: 'ED Acute Pod B', bedNumber: '107', status: 'occupied', bedType: 'Standard Adult', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-9041', currentPatientName: 'PT-9041', lastUpdated: '50 mins ago' },
  { id: 'ED-108', departmentId: 'ed', wardName: 'ED Acute Pod B', bedNumber: '108', status: 'reserved', bedType: 'Standard Adult', equipment: ['cardiac_monitor'], lastUpdated: '12 mins ago', notes: 'Reserved for inbound EMS trauma ETA 8m' },
  { id: 'ED-109', departmentId: 'ed', wardName: 'ED Acute Pod B', bedNumber: '109', status: 'available', bedType: 'Standard Adult', equipment: ['infusion_pump'], lastUpdated: '8 mins ago' },
  { id: 'ED-110', departmentId: 'ed', wardName: 'ED Isolation Pod', bedNumber: '110', status: 'available', bedType: 'Isolation Room', equipment: ['hepa_filter', 'cardiac_monitor'], lastUpdated: '22 mins ago' },
  { id: 'ED-111', departmentId: 'ed', wardName: 'ED Fast Track', bedNumber: '111', status: 'occupied', bedType: 'Standard Adult', equipment: [], currentPatientId: 'PT-9055', currentPatientName: 'PT-9055', lastUpdated: '18 mins ago' },
  { id: 'ED-112', departmentId: 'ed', wardName: 'ED Fast Track', bedNumber: '112', status: 'available', bedType: 'Standard Adult', equipment: ['cardiac_monitor'], lastUpdated: '3 mins ago' },

  // ICU Beds (8)
  { id: 'ICU-201', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '201', status: 'occupied', bedType: 'ICU Negative Pressure', equipment: ['ventilator', 'cardiac_monitor', 'hepa_filter', 'infusion_pump', 'dialysis_ready'], currentPatientId: 'PT-8801', currentPatientName: 'PT-8801', lastUpdated: '2 hours ago' },
  { id: 'ICU-202', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '202', status: 'occupied', bedType: 'ICU Negative Pressure', equipment: ['ventilator', 'cardiac_monitor', 'hepa_filter', 'infusion_pump'], currentPatientId: 'PT-8804', currentPatientName: 'PT-8804', lastUpdated: '4 hours ago' },
  { id: 'ICU-203', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '203', status: 'occupied', bedType: 'ICU Negative Pressure', equipment: ['cardiac_monitor', 'infusion_pump', 'dialysis_ready'], currentPatientId: 'PT-8812', currentPatientName: 'PT-8812', lastUpdated: '1 hour ago' },
  { id: 'ICU-204', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '204', status: 'occupied', bedType: 'ICU Negative Pressure', equipment: ['ventilator', 'cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-8815', currentPatientName: 'PT-8815', lastUpdated: '3 hours ago' },
  { id: 'ICU-205', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '205', status: 'occupied', bedType: 'ICU Negative Pressure', equipment: ['ventilator', 'cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-8820', currentPatientName: 'PT-8820', lastUpdated: '6 hours ago' },
  { id: 'ICU-206', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '206', status: 'occupied', bedType: 'ICU Negative Pressure', equipment: ['cardiac_monitor', 'infusion_pump', 'bariatric_lift'], currentPatientId: 'PT-8824', currentPatientName: 'PT-8824', lastUpdated: '5 hours ago' },
  { id: 'ICU-207', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '207', status: 'cleaning', bedType: 'ICU Negative Pressure', equipment: ['ventilator', 'cardiac_monitor', 'hepa_filter'], lastUpdated: '20 mins ago', notes: 'Scheduled for completion in 15 mins' },
  { id: 'ICU-208', departmentId: 'icu', wardName: 'Intensive Care Unit', bedNumber: '208', status: 'available', bedType: 'ICU Negative Pressure', equipment: ['ventilator', 'cardiac_monitor', 'infusion_pump', 'dialysis_ready'], lastUpdated: '4 mins ago' },

  // Med-Surg Beds (16)
  { id: 'MED-301', departmentId: 'med_surg', wardName: '4-East Step-Down', bedNumber: '301', status: 'occupied', bedType: 'Telemetry / Step-Down', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-7101', currentPatientName: 'PT-7101', lastUpdated: '8 hours ago' },
  { id: 'MED-302', departmentId: 'med_surg', wardName: '4-East Step-Down', bedNumber: '302', status: 'occupied', bedType: 'Telemetry / Step-Down', equipment: ['cardiac_monitor'], currentPatientId: 'PT-7105', currentPatientName: 'PT-7105', lastUpdated: '12 hours ago' },
  { id: 'MED-303', departmentId: 'med_surg', wardName: '4-East Step-Down', bedNumber: '303', status: 'occupied', bedType: 'Telemetry / Step-Down', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-7110', currentPatientName: 'PT-7110', lastUpdated: '6 hours ago' },
  { id: 'MED-304', departmentId: 'med_surg', wardName: '4-East Step-Down', bedNumber: '304', status: 'occupied', bedType: 'Telemetry / Step-Down', equipment: ['cardiac_monitor'], currentPatientId: 'PT-7118', currentPatientName: 'PT-7118', lastUpdated: '14 hours ago', estimatedDischargeTime: 'Clinical discharge pending transport' },
  { id: 'MED-305', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '305', status: 'occupied', bedType: 'Standard Adult', equipment: ['infusion_pump'], currentPatientId: 'PT-7122', currentPatientName: 'PT-7122', lastUpdated: '1 day ago' },
  { id: 'MED-306', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '306', status: 'occupied', bedType: 'Standard Adult', equipment: [], currentPatientId: 'PT-7128', currentPatientName: 'PT-7128', lastUpdated: '1 day ago' },
  { id: 'MED-307', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '307', status: 'occupied', bedType: 'Standard Adult', equipment: ['infusion_pump'], currentPatientId: 'PT-7133', currentPatientName: 'PT-7133', lastUpdated: '18 hours ago' },
  { id: 'MED-308', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '308', status: 'occupied', bedType: 'Standard Adult', equipment: ['bariatric_lift'], currentPatientId: 'PT-7140', currentPatientName: 'PT-7140', lastUpdated: '2 days ago' },
  { id: 'MED-309', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '309', status: 'occupied', bedType: 'Standard Adult', equipment: ['infusion_pump'], currentPatientId: 'PT-7145', currentPatientName: 'PT-7145', lastUpdated: '10 hours ago' },
  { id: 'MED-310', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '310', status: 'occupied', bedType: 'Standard Adult', equipment: [], currentPatientId: 'PT-7150', currentPatientName: 'PT-7150', lastUpdated: '16 hours ago' },
  { id: 'MED-311', departmentId: 'med_surg', wardName: '4-West General', bedNumber: '311', status: 'occupied', bedType: 'Standard Adult', equipment: ['infusion_pump'], currentPatientId: 'PT-7156', currentPatientName: 'PT-7156', lastUpdated: '20 hours ago', estimatedDischargeTime: 'Rx reconciliation pending' },
  { id: 'MED-312', departmentId: 'med_surg', wardName: '4-North Isolation', bedNumber: '312', status: 'occupied', bedType: 'Isolation Room', equipment: ['hepa_filter', 'infusion_pump'], currentPatientId: 'PT-7160', currentPatientName: 'PT-7160', lastUpdated: '2 days ago' },
  { id: 'MED-313', departmentId: 'med_surg', wardName: '4-North Isolation', bedNumber: '313', status: 'available', bedType: 'Isolation Room', equipment: ['hepa_filter', 'cardiac_monitor'], lastUpdated: '45 mins ago' },
  { id: 'MED-314', departmentId: 'med_surg', wardName: '4-North General', bedNumber: '314', status: 'available', bedType: 'Standard Adult', equipment: ['cardiac_monitor', 'infusion_pump'], lastUpdated: '25 mins ago' },
  { id: 'MED-315', departmentId: 'med_surg', wardName: '4-North General', bedNumber: '315', status: 'cleaning', bedType: 'Standard Adult', equipment: ['infusion_pump'], lastUpdated: '10 mins ago', notes: 'Housekeeping in progress' },
  { id: 'MED-316', departmentId: 'med_surg', wardName: '4-North General', bedNumber: '316', status: 'available', bedType: 'Standard Adult', equipment: ['bariatric_lift', 'infusion_pump'], lastUpdated: '15 mins ago' },

  // Surgical Recovery Beds (8)
  { id: 'SURG-401', departmentId: 'surgical', wardName: 'PACU Recovery Bay 1', bedNumber: '401', status: 'occupied', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-6201', currentPatientName: 'PT-6201', lastUpdated: '2 hours ago' },
  { id: 'SURG-402', departmentId: 'surgical', wardName: 'PACU Recovery Bay 1', bedNumber: '402', status: 'occupied', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-6205', currentPatientName: 'PT-6205', lastUpdated: '3 hours ago' },
  { id: 'SURG-403', departmentId: 'surgical', wardName: 'PACU Recovery Bay 1', bedNumber: '403', status: 'occupied', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor'], currentPatientId: 'PT-6208', currentPatientName: 'PT-6208', lastUpdated: '1 hour ago' },
  { id: 'SURG-404', departmentId: 'surgical', wardName: 'PACU Recovery Bay 2', bedNumber: '404', status: 'occupied', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor', 'infusion_pump', 'ventilator'], currentPatientId: 'PT-6211', currentPatientName: 'PT-6211', lastUpdated: '4 hours ago' },
  { id: 'SURG-405', departmentId: 'surgical', wardName: 'PACU Recovery Bay 2', bedNumber: '405', status: 'occupied', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor', 'infusion_pump'], currentPatientId: 'PT-6218', currentPatientName: 'PT-6218', lastUpdated: '2 hours ago' },
  { id: 'SURG-406', departmentId: 'surgical', wardName: 'PACU Recovery Bay 2', bedNumber: '406', status: 'available', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor', 'infusion_pump'], lastUpdated: '30 mins ago' },
  { id: 'SURG-407', departmentId: 'surgical', wardName: 'PACU Recovery Bay 3', bedNumber: '407', status: 'available', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor'], lastUpdated: '12 mins ago' },
  { id: 'SURG-408', departmentId: 'surgical', wardName: 'PACU Recovery Bay 3', bedNumber: '408', status: 'reserved', bedType: 'Post-Surgical Recovery', equipment: ['cardiac_monitor', 'ventilator'], lastUpdated: '18 mins ago', notes: 'Reserved for OR-3 post-cardiac bypass recovery' },
];

export const INITIAL_PATIENTS: Patient[] = [
  // Patients currently waiting or in flow stages
  {
    id: 'PT-4101',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '42 mins ago',
    waitingDurationMinutes: 42,
    currentStage: 'awaiting_bed',
    targetDepartment: 'icu',
    requiredBedType: 'ICU Negative Pressure',
    requiredEquipment: ['ventilator', 'cardiac_monitor'],
    operationalPriority: 'P1 - Immediate / Resuscitation',
    chiefComplaintSummary: 'Post-resuscitation hemodynamic instability; requires continuous mechanical ventilation and arterial line monitoring.'
  },
  {
    id: 'PT-4102',
    ageGroup: 'Geriatric (65+)',
    arrivalTimestamp: '65 mins ago',
    waitingDurationMinutes: 65,
    currentStage: 'awaiting_bed',
    targetDepartment: 'med_surg',
    requiredBedType: 'Telemetry / Step-Down',
    requiredEquipment: ['cardiac_monitor', 'infusion_pump'],
    operationalPriority: 'P2 - High / Emergent',
    chiefComplaintSummary: 'Acute decompensated heart failure with exacerbation; continuous telemetry and IV diuretics indicated.'
  },
  {
    id: 'PT-4103',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '78 mins ago',
    waitingDurationMinutes: 78,
    currentStage: 'awaiting_bed',
    targetDepartment: 'med_surg',
    requiredBedType: 'Standard Adult',
    requiredEquipment: ['infusion_pump'],
    operationalPriority: 'P3 - Urgent',
    chiefComplaintSummary: 'Complicated pyelonephritis requiring IV antimicrobial therapy and fluid resuscitation.'
  },
  {
    id: 'PT-4104',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '54 mins ago',
    waitingDurationMinutes: 54,
    currentStage: 'diagnostics',
    targetDepartment: 'ed',
    requiredBedType: 'Standard Adult',
    requiredEquipment: [],
    operationalPriority: 'P3 - Urgent',
    chiefComplaintSummary: 'Suspected acute appendicitis; in diagnostic queue for Stat Contrast Abdominal CT.'
  },
  {
    id: 'PT-4105',
    ageGroup: 'Geriatric (65+)',
    arrivalTimestamp: '92 mins ago',
    waitingDurationMinutes: 92,
    currentStage: 'diagnostics',
    targetDepartment: 'ed',
    requiredBedType: 'Standard Adult',
    requiredEquipment: ['cardiac_monitor'],
    operationalPriority: 'P2 - High / Emergent',
    chiefComplaintSummary: 'Atypical chest discomfort and syncope; pending CT Pulmonary Angiogram rule-out.'
  },
  {
    id: 'PT-4106',
    ageGroup: 'Pediatric',
    arrivalTimestamp: '35 mins ago',
    waitingDurationMinutes: 35,
    currentStage: 'assessment',
    targetDepartment: 'ed',
    requiredBedType: 'Standard Adult',
    requiredEquipment: [],
    operationalPriority: 'P3 - Urgent',
    chiefComplaintSummary: 'High febrile presentation with dehydration; secondary triage assessment in progress.'
  },
  {
    id: 'PT-4107',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '18 mins ago',
    waitingDurationMinutes: 18,
    currentStage: 'triage_intake',
    targetDepartment: 'ed',
    requiredBedType: 'Standard Adult',
    requiredEquipment: [],
    operationalPriority: 'P4 - Standard / Routine',
    chiefComplaintSummary: 'Distal radius closed fracture following fall; vital signs stable.'
  },
  {
    id: 'PT-4108',
    ageGroup: 'Geriatric (65+)',
    arrivalTimestamp: '85 mins ago',
    waitingDurationMinutes: 85,
    currentStage: 'awaiting_bed',
    targetDepartment: 'med_surg',
    requiredBedType: 'Isolation Room',
    requiredEquipment: ['hepa_filter'],
    operationalPriority: 'P2 - High / Emergent',
    chiefComplaintSummary: 'Respiratory syncytial virus with hypoxemic respiratory effort; droplet isolation mandatory.'
  },
  {
    id: 'PT-4109',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '110 mins ago',
    waitingDurationMinutes: 110,
    currentStage: 'discharge_pending',
    targetDepartment: 'med_surg',
    requiredBedType: 'Standard Adult',
    requiredEquipment: [],
    operationalPriority: 'P4 - Standard / Routine',
    chiefComplaintSummary: 'Post-pneumonia clinical recovery; medically stable, awaiting family discharge transportation and pharmacy counseling.'
  },
  {
    id: 'PT-4110',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '25 mins ago',
    waitingDurationMinutes: 25,
    currentStage: 'triage_intake',
    targetDepartment: 'ed',
    requiredBedType: 'Trauma Bay',
    requiredEquipment: ['cardiac_monitor', 'infusion_pump'],
    operationalPriority: 'P2 - High / Emergent',
    chiefComplaintSummary: 'Motorcycle collision; blunt abdominal trauma and localized contusions.'
  },
  {
    id: 'PT-4111',
    ageGroup: 'Geriatric (65+)',
    arrivalTimestamp: '48 mins ago',
    waitingDurationMinutes: 48,
    currentStage: 'treatment',
    targetDepartment: 'ed',
    requiredBedType: 'Standard Adult',
    requiredEquipment: ['cardiac_monitor'],
    operationalPriority: 'P3 - Urgent',
    chiefComplaintSummary: 'Symptomatic atrial fibrillation with rapid ventricular response; initial beta-blocker titration.'
  },
  {
    id: 'PT-4112',
    ageGroup: 'Adult (18-64)',
    arrivalTimestamp: '60 mins ago',
    waitingDurationMinutes: 60,
    currentStage: 'awaiting_bed',
    targetDepartment: 'surgical',
    requiredBedType: 'Post-Surgical Recovery',
    requiredEquipment: ['cardiac_monitor'],
    operationalPriority: 'P3 - Urgent',
    chiefComplaintSummary: 'Elective laparoscopic cholecystectomy completed in OR 4; awaiting PACU recovery bay.'
  }
];

export const INITIAL_DIAGNOSTICS: DiagnosticResource[] = [
  {
    id: 'CT-01',
    name: 'Stat Dual-Energy CT Scanner (Main ER)',
    type: 'CT Scanner',
    status: 'operational',
    currentUtilizationPercent: 94,
    queueCount: 8,
    avgTurnaroundMinutes: 38,
    targetTurnaroundMinutes: 25
  },
  {
    id: 'CT-02',
    name: 'Helical CT Scanner (Outpatient Wing)',
    type: 'CT Scanner',
    status: 'maintenance',
    currentUtilizationPercent: 0,
    queueCount: 0,
    avgTurnaroundMinutes: 0,
    targetTurnaroundMinutes: 30
  },
  {
    id: 'MRI-01',
    name: '3.0T High-Field MRI',
    type: 'MRI Scanner',
    status: 'operational',
    currentUtilizationPercent: 78,
    queueCount: 4,
    avgTurnaroundMinutes: 52,
    targetTurnaroundMinutes: 45
  },
  {
    id: 'XRAY-01',
    name: 'Direct Digital Radiography Suite 1',
    type: 'Digital X-Ray',
    status: 'operational',
    currentUtilizationPercent: 62,
    queueCount: 3,
    avgTurnaroundMinutes: 14,
    targetTurnaroundMinutes: 15
  },
  {
    id: 'LAB-01',
    name: 'Point-of-Care Stat Analyzer (Troponin/ABG)',
    type: 'Stat Lab Analyzer',
    status: 'operational',
    currentUtilizationPercent: 88,
    queueCount: 6,
    avgTurnaroundMinutes: 22,
    targetTurnaroundMinutes: 20
  }
];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-101',
    title: 'Expedite Med-Surg Step-Down Discharges for Inbound Transfers',
    departmentId: 'med_surg',
    urgency: 'urgent',
    status: 'pending',
    triggerData: 'Med-Surg occupancy at 87.5% with 3 pending transfer requests from ED and 2 patients clinically cleared in beds MED-304 and MED-311.',
    operationalContext: 'ED boarding time has reached 78 minutes for admitted inpatients due to shortage of telemetry-capable beds.',
    proposedAction: 'Coordinate immediate transit escort and discharge lounge transfer for cleared patients MED-304 and MED-311 to release 2 staffed beds.',
    estimatedImpact: 'Reduces ED boarding queue by 66% and frees 2 beds for high-priority inbound transfers within 35 minutes.',
    createdTimestamp: '15 mins ago'
  },
  {
    id: 'REC-102',
    title: 'Reroute Emergency Contrast CTs to Outpatient Center Scanner B',
    departmentId: 'diagnostics',
    urgency: 'urgent',
    status: 'pending',
    triggerData: 'Main ER CT-01 scanner queue reached 8 patients with avg turnaround of 38m (benchmark: 25m). Scanner CT-02 is undergoing calibration.',
    operationalContext: 'Diagnostic turnaround delay is elevating ED dwell times by an estimated 28 minutes per acute abdominal and stroke workup.',
    proposedAction: 'Temporarily authorize emergency escort to Outpatient Radiology Suite B for stable P2/P3 patients awaiting non-interventional scans.',
    estimatedImpact: 'Reduces diagnostic queue by 4 patients and shortens avg scan turnaround from 38m to 24m.',
    createdTimestamp: '25 mins ago'
  },
  {
    id: 'REC-103',
    title: 'Deploy Cross-Trained Pool Nurse to ED Rapid Assessment Pod',
    departmentId: 'ed',
    urgency: 'moderate',
    status: 'pending',
    triggerData: 'ED nurse-to-patient ratio currently at 1:5.2 against standard 1:4.0 during peak arrival window (14:00 - 18:00).',
    operationalContext: 'Intake triage queue has 3 patients approaching the 30-minute benchmark without secondary nursing assessment.',
    proposedAction: 'Assign 1 float nurse from Post-Op (currently operating at 62% capacity) to ED Pod B for a 4-hour shift extension.',
    estimatedImpact: 'Restores ED ratio to 1:3.9, lowering intake assessment wait time by ~16 minutes.',
    createdTimestamp: '40 mins ago'
  },
  {
    id: 'REC-104',
    title: 'Pre-Stage Terminal Cleaning for ICU Isolation Bed 207',
    departmentId: 'icu',
    urgency: 'moderate',
    status: 'pending',
    triggerData: 'ICU Bed 208 is the single available critical bed. High-priority resuscitation patient PT-4101 requires negative pressure placement.',
    operationalContext: 'Housekeeping turnaround on ICU-207 is currently estimated at 35 mins. Proactive assignment can accelerate readiness.',
    proposedAction: 'Escalate bed ICU-207 turnover priority with environmental services supervisor.',
    estimatedImpact: 'Provides immediate redundancy and eliminates zero-buffer vulnerability for critical care intake.',
    createdTimestamp: '10 mins ago'
  }
];

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'ALT-301',
    departmentId: 'icu',
    severity: 'critical',
    title: 'Critical Care Capacity Threshold Approaching (87.5%)',
    triggerCondition: 'ICU has 6 of 8 beds occupied, 1 in terminal cleaning, and 1 available with 1 inbound high-priority transfer request.',
    recommendedNextStep: 'Review step-down transfer candidates in ICU-203 with attending intensivist.',
    status: 'active',
    timestamp: '12 mins ago'
  },
  {
    id: 'ALT-302',
    departmentId: 'diagnostics',
    severity: 'critical',
    title: 'Stat CT Imaging Queue Exceeds Operational Benchmark (38 min turnaround)',
    triggerCondition: 'Queue depth: 8 patients. Equipment CT-02 is offline for bi-monthly collimator recalibration.',
    recommendedNextStep: 'Implement protocol for secondary scan rerouting to Imaging Suite B.',
    status: 'active',
    timestamp: '22 mins ago'
  },
  {
    id: 'ALT-303',
    departmentId: 'ed',
    severity: 'warning',
    title: 'Emergency Intake Waiting Duration Escalation (42 min avg)',
    triggerCondition: '7 patients in arrival queue during forecasted afternoon influx peak.',
    recommendedNextStep: 'Open Rapid Assessment Bay 104 and activate float staff pool.',
    status: 'active',
    timestamp: '35 mins ago'
  },
  {
    id: 'ALT-304',
    departmentId: 'med_surg',
    severity: 'warning',
    title: 'Discharge Processing Bottleneck Identified (Avg Delay: 55 mins)',
    triggerCondition: '3 medically cleared patients awaiting transport services or pharmacy discharge reconciliation.',
    recommendedNextStep: 'Notify social services discharge coordinator to dispatch patient transport team.',
    status: 'active',
    timestamp: '48 mins ago'
  }
];

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '10 mins ago',
    userRole: 'administrator',
    actionType: 'alert_action',
    details: 'Acknowledged operational warning for ED intake waiting time escalation.'
  },
  {
    id: 'AUD-002',
    timestamp: '32 mins ago',
    userRole: 'authorized_staff',
    actionType: 'bed_allocation',
    details: 'Confirmed allocation of Bed ED-101 for trauma patient PT-9011 after clinician review.'
  },
  {
    id: 'AUD-003',
    timestamp: '1 hour ago',
    userRole: 'administrator',
    actionType: 'simulation_run',
    details: 'Executed what-if scenario testing +20% arrival surge with -2 emergency beds.'
  }
];

// Generates 14 days of hourly historical admissions
export function generateSyntheticHistory(): HistoricalArrivalRecord[] {
  const records: HistoricalArrivalRecord[] = [];
  const now = new Date('2026-10-12T14:00:00Z');
  
  // 14 days * 24 hours = 336 hourly records
  for (let d = 13; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const date = new Date(now.getTime() - (d * 24 * 3600 * 1000) + (h * 3600 * 1000));
      const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ...
      
      // Realistic hospital diurnal curve:
      // Lowest at 03:00 - 05:00, ramps at 08:00, peaks at 14:00 - 18:00, secondary spike at 20:00
      let hourFactor = 1.0;
      if (h >= 2 && h <= 5) hourFactor = 0.35;
      else if (h >= 6 && h <= 8) hourFactor = 0.8;
      else if (h >= 9 && h <= 12) hourFactor = 1.3;
      else if (h >= 13 && h <= 18) hourFactor = 1.65; // afternoon peak
      else if (h >= 19 && h <= 22) hourFactor = 1.25;
      else hourFactor = 0.65;

      // Day of week factor: Mondays (1) highest post-weekend surge, Weekends (0, 6) higher trauma
      let dayFactor = 1.0;
      if (dayOfWeek === 1) dayFactor = 1.35; // Monday rush
      else if (dayOfWeek === 2) dayFactor = 1.15;
      else if (dayOfWeek === 5) dayFactor = 1.2; // Friday evening
      else if (dayOfWeek === 6 || dayOfWeek === 0) dayFactor = 1.05;

      // Pseudo-random deterministic noise based on day and hour
      const seedNoise = Math.sin(d * 11 + h * 7) * 0.8;
      
      const edArrivals = Math.max(1, Math.round(3.8 * hourFactor * dayFactor + seedNoise));
      const icuArrivals = Math.max(0, Math.round(0.7 * hourFactor * (dayOfWeek === 1 ? 1.2 : 1.0) + (seedNoise * 0.3)));
      const medArrivals = Math.max(1, Math.round(2.1 * hourFactor + (seedNoise * 0.4)));
      const surgArrivals = Math.max(0, Math.round(1.4 * (h >= 7 && h <= 17 ? hourFactor : 0.2) + (seedNoise * 0.3)));

      records.push({
        timestamp: date.toISOString(),
        hour: h,
        dayOfWeek,
        departmentId: 'ed',
        actualArrivals: edArrivals
      });
      records.push({
        timestamp: date.toISOString(),
        hour: h,
        dayOfWeek,
        departmentId: 'icu',
        actualArrivals: icuArrivals
      });
      records.push({
        timestamp: date.toISOString(),
        hour: h,
        dayOfWeek,
        departmentId: 'med_surg',
        actualArrivals: medArrivals
      });
      records.push({
        timestamp: date.toISOString(),
        hour: h,
        dayOfWeek,
        departmentId: 'surgical',
        actualArrivals: surgArrivals
      });
    }
  }

  return records;
}
