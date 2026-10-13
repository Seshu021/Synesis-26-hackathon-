import { HospitalBed, Patient, OperationalPriority, EquipmentRequirement } from '../types';

export interface BedCompatibilityScore {
  bed: HospitalBed;
  isCompatible: boolean;
  incompatibilityReasons: string[];
  matchScore: number; // 0 to 100
  equipmentMatchSummary: string;
  wardSuitabilityExplanation: string;
  recommendedPriorityRank: number;
}

export interface PatientAllocationRecommendation {
  patient: Patient;
  compatibleBeds: BedCompatibilityScore[];
  bestMatchBedId: string | null;
  priorityWeightScore: number;
  clinicalSafetyNotes: string[];
}

/**
 * Calculates operational priority weighting
 */
export function getPriorityWeight(priority: OperationalPriority): number {
  switch (priority) {
    case 'P1 - Immediate / Resuscitation':
      return 1000;
    case 'P2 - High / Emergent':
      return 500;
    case 'P3 - Urgent':
      return 250;
    case 'P4 - Standard / Routine':
      return 100;
  }
}

/**
 * Checks bed compatibility with patient requirements
 */
export function evaluateBedCompatibility(patient: Patient, bed: HospitalBed): BedCompatibilityScore {
  const incompatibilityReasons: string[] = [];
  let score = 100;

  // 1. Availability check: Must be 'available'
  if (bed.status !== 'available') {
    incompatibilityReasons.push(`Bed is currently ${bed.status} (Occupied/Cleaning/Reserved).`);
    return {
      bed,
      isCompatible: false,
      incompatibilityReasons,
      matchScore: 0,
      equipmentMatchSummary: 'Unavailable',
      wardSuitabilityExplanation: `Bed ${bed.id} is not free for immediate intake.`,
      recommendedPriorityRank: 0
    };
  }

  // 2. Department check
  const isDirectDepartment = bed.departmentId === patient.targetDepartment;
  if (!isDirectDepartment) {
    // Cross-department flex: e.g. Surg PACU can temporarily flex to Med-Surg or vice versa under supervision
    if ((patient.targetDepartment === 'med_surg' && bed.departmentId === 'surgical') ||
        (patient.targetDepartment === 'surgical' && bed.departmentId === 'med_surg')) {
      score -= 20; // Acceptable overflow with slight penalty
    } else {
      incompatibilityReasons.push(`Target department is ${patient.targetDepartment.toUpperCase()}, but bed is in ${bed.departmentId.toUpperCase()}.`);
    }
  }

  // 3. Bed Type check
  if (patient.requiredBedType === 'ICU Negative Pressure' && bed.bedType !== 'ICU Negative Pressure') {
    incompatibilityReasons.push(`Patient strictly requires ICU Negative Pressure isolation.`);
  } else if (patient.requiredBedType === 'Isolation Room' && bed.bedType !== 'Isolation Room' && bed.bedType !== 'ICU Negative Pressure') {
    incompatibilityReasons.push(`Patient requires negative-pressure/isolation facility.`);
  } else if (patient.requiredBedType === 'Trauma Bay' && bed.bedType !== 'Trauma Bay') {
    score -= 25; // Can flex to standard if trauma bay full, but penalized
  } else if (patient.requiredBedType === 'Telemetry / Step-Down') {
    if (!bed.equipment.includes('cardiac_monitor')) {
      incompatibilityReasons.push(`Missing essential cardiac telemetry monitor.`);
    }
  }

  // 4. Equipment check
  const missingEquipment: EquipmentRequirement[] = [];
  for (const eq of patient.requiredEquipment) {
    if (!bed.equipment.includes(eq)) {
      missingEquipment.push(eq);
    }
  }

  if (missingEquipment.length > 0) {
    incompatibilityReasons.push(`Bed lacks required equipment: ${missingEquipment.join(', ')}.`);
  }

  // 5. Score calculation if compatible
  const isCompatible = incompatibilityReasons.length === 0;
  if (!isCompatible) {
    return {
      bed,
      isCompatible: false,
      incompatibilityReasons,
      matchScore: 0,
      equipmentMatchSummary: `Deficits: ${incompatibilityReasons.join('; ')}`,
      wardSuitabilityExplanation: 'Not clinically or logistically viable.',
      recommendedPriorityRank: 0
    };
  }

  // Bonus points for optimal fit
  if (isDirectDepartment) score += 15;
  if (bed.bedType === patient.requiredBedType) score += 15;
  // If bed has excess equipment that patient doesn't need, small deduction to preserve rare resources for higher acuity
  const unneededEquipment = bed.equipment.filter(e => !patient.requiredEquipment.includes(e));
  if (unneededEquipment.includes('ventilator') && !patient.requiredEquipment.includes('ventilator')) {
    score -= 10; // Save ventilator bed for ventilator patient if possible
  }

  const equipmentMatchSummary = patient.requiredEquipment.length === 0 
    ? 'Standard equipment satisfied' 
    : `All required gear available (${patient.requiredEquipment.join(', ')})`;

  const wardSuitabilityExplanation = `${bed.wardName} (${bed.bedType}) satisfies all clinical protocol specifications with ${isDirectDepartment ? 'direct unit placement' : 'approved cross-ward flex placement'}.`;

  return {
    bed,
    isCompatible: true,
    incompatibilityReasons: [],
    matchScore: Math.min(100, Math.max(10, score)),
    equipmentMatchSummary,
    wardSuitabilityExplanation,
    recommendedPriorityRank: 1
  };
}

/**
 * Generates recommendation ranking for all waiting patients against all hospital beds
 */
export function rankBedAllocationsForPatient(
  patient: Patient,
  beds: HospitalBed[]
): PatientAllocationRecommendation {
  const evaluations: BedCompatibilityScore[] = [];

  for (const bed of beds) {
    evaluations.push(evaluateBedCompatibility(patient, bed));
  }

  const compatibleOnly = evaluations
    .filter(e => e.isCompatible)
    .sort((a, b) => b.matchScore - a.matchScore);

  const priorityWeight = getPriorityWeight(patient.operationalPriority);
  // Total ranking score combines clinical priority and wait time (1 pt per minute)
  const priorityWeightScore = priorityWeight + (patient.waitingDurationMinutes * 1.5);

  const clinicalSafetyNotes: string[] = [
    `Logistical match calculated using clinician-provided triage priority (${patient.operationalPriority}).`,
    'Final bed transfer must be authorized by attending nurse supervisor.',
    'Bed sterility and operational telemetry verification required prior to patient transport.'
  ];

  return {
    patient,
    compatibleBeds: compatibleOnly,
    bestMatchBedId: compatibleOnly.length > 0 ? compatibleOnly[0].bed.id : null,
    priorityWeightScore,
    clinicalSafetyNotes
  };
}
