import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  HospitalBed,
  Patient,
  DepartmentInfo,
  DiagnosticResource,
  Recommendation,
  AlertNotification,
  AuditLogEntry,
  HistoricalArrivalRecord,
  UserRole,
  BedStatus,
  PatientFlowStage,
  SimulationParameters,
  SimulationResult,
  BottleneckItem,
  DepartmentId
} from '../types';
import {
  INITIAL_BEDS,
  INITIAL_PATIENTS,
  INITIAL_DEPARTMENTS,
  INITIAL_DIAGNOSTICS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOG,
  generateSyntheticHistory
} from '../data/syntheticHospitalData';
import { detectHospitalBottlenecks } from '../utils/bottleneckEngine';
import { runWhatIfSimulation } from '../utils/simulation';
import { computeDepartmentForecast, ForecastingResult } from '../utils/forecasting';

interface HospitalContextType {
  // Core Data
  departments: DepartmentInfo[];
  beds: HospitalBed[];
  patients: Patient[];
  diagnostics: DiagnosticResource[];
  recommendations: Recommendation[];
  alerts: AlertNotification[];
  auditLog: AuditLogEntry[];
  historyRecords: HistoricalArrivalRecord[];
  
  // Navigation & Role
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Thresholds & Configurations
  capacityThresholdPercent: number;
  setCapacityThresholdPercent: (val: number) => void;
  maxWaitThresholdMinutes: number;
  setMaxWaitThresholdMinutes: (val: number) => void;

  // Computed KPIs
  totalBedsCount: number;
  occupiedBedsCount: number;
  availableBedsCount: number;
  cleaningBedsCount: number;
  reservedBedsCount: number;
  overallOccupancyPercent: number;
  patientsWaitingCount: number;
  avgWaitTimeMinutes: number;
  activeAlertsCount: number;
  activeBottlenecks: BottleneckItem[];
  currentForecast: ForecastingResult;
  selectedForecastDept: DepartmentId;
  setSelectedForecastDept: (dept: DepartmentId) => void;

  // Simulation
  simulationParams: SimulationParameters;
  setSimulationParams: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  simulationResult: SimulationResult;
  runSimulation: () => void;
  resetSimulation: () => void;

  // Actions
  allocateBed: (patientId: string, bedId: string) => boolean;
  updateBedStatus: (bedId: string, status: BedStatus, notes?: string) => void;
  updateRecommendationStatus: (id: string, status: 'approved' | 'dismissed' | 'reviewed', notes?: string) => void;
  updateAlertStatus: (id: string, status: 'acknowledged' | 'resolved') => void;
  advancePatientStage: (patientId: string, nextStage: PatientFlowStage) => void;
  dischargePatientBed: (bedId: string) => void;
  resetToInitialData: () => void;
}

const DEFAULT_SIM_PARAMS: SimulationParameters = {
  arrivalSurgePercent: 20,
  availableBedsDelta: -2,
  staffingRatioPercent: 100,
  equipmentUptimePercent: 85,
  dischargeThroughputMultiplier: 1.0
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [userRole, setUserRole] = useState<UserRole>('administrator');

  // Configurable Thresholds
  const [capacityThresholdPercent, setCapacityThresholdPercent] = useState<number>(85);
  const [maxWaitThresholdMinutes, setMaxWaitThresholdMinutes] = useState<number>(40);

  // Entities initialized from localStorage or synthetic defaults
  const [departments] = useState<DepartmentInfo[]>(INITIAL_DEPARTMENTS);

  const [beds, setBeds] = useState<HospitalBed[]>(() => {
    const saved = localStorage.getItem('smartflow_beds');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_BEDS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('smartflow_patients');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PATIENTS;
  });

  const [diagnostics, setDiagnostics] = useState<DiagnosticResource[]>(() => {
    const saved = localStorage.getItem('smartflow_diagnostics');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_DIAGNOSTICS;
  });

  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    const saved = localStorage.getItem('smartflow_recommendations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_RECOMMENDATIONS;
  });

  const [alerts, setAlerts] = useState<AlertNotification[]>(() => {
    const saved = localStorage.getItem('smartflow_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ALERTS;
  });

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('smartflow_audit_log');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_AUDIT_LOG;
  });

  // 14 days of synthetic admissions history
  const [historyRecords] = useState<HistoricalArrivalRecord[]>(() => generateSyntheticHistory());

  // Forecasting department selector
  const [selectedForecastDept, setSelectedForecastDept] = useState<DepartmentId>('ed');

  // Simulation State
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>(DEFAULT_SIM_PARAMS);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() => 
    runWhatIfSimulation(DEFAULT_SIM_PARAMS, INITIAL_DEPARTMENTS, INITIAL_BEDS, INITIAL_PATIENTS)
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('smartflow_beds', JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem('smartflow_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('smartflow_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem('smartflow_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('smartflow_audit_log', JSON.stringify(auditLog));
  }, [auditLog]);

  useEffect(() => {
    localStorage.setItem('smartflow_diagnostics', JSON.stringify(diagnostics));
  }, [diagnostics]);

  // Append audit entry helper
  const addAuditEntry = useCallback((actionType: AuditLogEntry['actionType'], details: string, targetEntityId?: string) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      userRole,
      actionType,
      details,
      targetEntityId
    };
    setAuditLog(prev => [newEntry, ...prev]);
  }, [userRole]);

  // Computed KPIs
  const totalBedsCount = beds.length;
  const occupiedBedsCount = useMemo(() => beds.filter(b => b.status === 'occupied').length, [beds]);
  const availableBedsCount = useMemo(() => beds.filter(b => b.status === 'available').length, [beds]);
  const cleaningBedsCount = useMemo(() => beds.filter(b => b.status === 'cleaning').length, [beds]);
  const reservedBedsCount = useMemo(() => beds.filter(b => b.status === 'reserved').length, [beds]);

  const overallOccupancyPercent = useMemo(() => {
    return totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;
  }, [totalBedsCount, occupiedBedsCount]);

  const waitingPatients = useMemo(() => {
    return patients.filter(p => p.currentStage !== 'treatment' && p.currentStage !== 'discharge_pending');
  }, [patients]);

  const patientsWaitingCount = waitingPatients.length;

  const avgWaitTimeMinutes = useMemo(() => {
    if (waitingPatients.length === 0) return 0;
    const totalWait = waitingPatients.reduce((sum, p) => sum + p.waitingDurationMinutes, 0);
    return Math.round(totalWait / waitingPatients.length);
  }, [waitingPatients]);

  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => a.status === 'active').length;
  }, [alerts]);

  const activeBottlenecks = useMemo(() => {
    return detectHospitalBottlenecks(patients, beds, diagnostics, departments);
  }, [patients, beds, diagnostics, departments]);

  const currentForecast = useMemo(() => {
    const deptBeds = beds.filter(b => b.departmentId === selectedForecastDept);
    const deptOccupied = deptBeds.filter(b => b.status === 'occupied').length;
    return computeDepartmentForecast(
      historyRecords,
      selectedForecastDept,
      14, // 14:00 baseline hour
      1, // Monday
      deptBeds.length,
      deptOccupied,
      capacityThresholdPercent,
      12
    );
  }, [historyRecords, selectedForecastDept, beds, capacityThresholdPercent]);

  // Run Simulation handler
  const runSimulation = useCallback(() => {
    const result = runWhatIfSimulation(simulationParams, departments, beds, patients);
    setSimulationResult(result);
    addAuditEntry(
      'simulation_run',
      `Executed What-If scenario (Arrivals: ${simulationParams.arrivalSurgePercent > 0 ? '+' : ''}${simulationParams.arrivalSurgePercent}%, Bed Delta: ${simulationParams.availableBedsDelta}, Staff: ${simulationParams.staffingRatioPercent}%).`
    );
  }, [simulationParams, departments, beds, patients, addAuditEntry]);

  const resetSimulation = useCallback(() => {
    setSimulationParams(DEFAULT_SIM_PARAMS);
    const result = runWhatIfSimulation(DEFAULT_SIM_PARAMS, departments, beds, patients);
    setSimulationResult(result);
  }, [departments, beds, patients]);

  // Bed Allocation
  const allocateBed = useCallback((patientId: string, bedId: string): boolean => {
    const targetBed = beds.find(b => b.id === bedId);
    const targetPatient = patients.find(p => p.id === patientId);

    if (!targetBed || targetBed.status !== 'available' || !targetPatient) {
      return false;
    }

    // Update bed
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'occupied',
          currentPatientId: patientId,
          currentPatientName: patientId,
          lastUpdated: 'Just now',
          notes: `Assigned to ${patientId} (${targetPatient.operationalPriority})`
        };
      }
      return b;
    }));

    // Update patient
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          currentStage: 'treatment',
          assignedBedId: bedId,
          allocationConfirmedBy: userRole === 'administrator' ? 'Shift Admin' : 'Charge Nurse',
          allocationTimestamp: 'Just now'
        };
      }
      return p;
    }));

    addAuditEntry(
      'bed_allocation',
      `Confirmed allocation of Bed ${bedId} (${targetBed.wardName}) for Patient ${patientId}.`,
      bedId
    );

    return true;
  }, [beds, patients, userRole, addAuditEntry]);

  // Update Bed Status (e.g. Clean complete -> Available)
  const updateBedStatus = useCallback((bedId: string, status: BedStatus, notes?: string) => {
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status,
          currentPatientId: status === 'available' || status === 'cleaning' ? undefined : b.currentPatientId,
          currentPatientName: status === 'available' || status === 'cleaning' ? undefined : b.currentPatientName,
          lastUpdated: 'Just now',
          notes: notes || b.notes
        };
      }
      return b;
    }));

    addAuditEntry(
      'bed_status_change',
      `Updated Bed ${bedId} status to '${status}'${notes ? ` (${notes})` : ''}.`,
      bedId
    );
  }, [addAuditEntry]);

  // Discharge patient from bed
  const dischargePatientBed = useCallback((bedId: string) => {
    const targetBed = beds.find(b => b.id === bedId);
    if (!targetBed) return;

    const patientId = targetBed.currentPatientId;

    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'cleaning',
          currentPatientId: undefined,
          currentPatientName: undefined,
          lastUpdated: 'Just now',
          notes: 'Terminal disinfection initiated post-discharge'
        };
      }
      return b;
    }));

    if (patientId) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
    }

    addAuditEntry(
      'bed_status_change',
      `Processed clinical discharge for Bed ${bedId}${patientId ? ` (${patientId})` : ''}; bed transitioned to cleaning cycle.`,
      bedId
    );
  }, [beds, addAuditEntry]);

  // Advance patient stage
  const advancePatientStage = useCallback((patientId: string, nextStage: PatientFlowStage) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          currentStage: nextStage
        };
      }
      return p;
    }));

    addAuditEntry(
      'bed_status_change',
      `Advanced Patient ${patientId} workflow stage to '${nextStage.replace('_', ' ').toUpperCase()}'.`,
      patientId
    );
  }, [addAuditEntry]);

  // Recommendation actions
  const updateRecommendationStatus = useCallback((id: string, status: 'approved' | 'dismissed' | 'reviewed', notes?: string) => {
    setRecommendations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          reviewedByRole: userRole,
          reviewedTimestamp: 'Just now',
          notes
        };
      }
      return r;
    }));

    const rec = recommendations.find(r => r.id === id);
    addAuditEntry(
      'recommendation_review',
      `Marked recommendation '${rec?.title || id}' as ${status.toUpperCase()}.`,
      id
    );
  }, [userRole, recommendations, addAuditEntry]);

  // Alert actions
  const updateAlertStatus = useCallback((id: string, status: 'acknowledged' | 'resolved') => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          acknowledgedBy: userRole
        };
      }
      return a;
    }));

    const alert = alerts.find(a => a.id === id);
    addAuditEntry(
      'alert_action',
      `Alert '${alert?.title || id}' transitioned to ${status.toUpperCase()}.`,
      id
    );
  }, [userRole, alerts, addAuditEntry]);

  // Reset to initial demo data
  const resetToInitialData = useCallback(() => {
    localStorage.removeItem('smartflow_beds');
    localStorage.removeItem('smartflow_patients');
    localStorage.removeItem('smartflow_diagnostics');
    localStorage.removeItem('smartflow_recommendations');
    localStorage.removeItem('smartflow_alerts');
    localStorage.removeItem('smartflow_audit_log');

    setBeds(INITIAL_BEDS);
    setPatients(INITIAL_PATIENTS);
    setDiagnostics(INITIAL_DIAGNOSTICS);
    setRecommendations(INITIAL_RECOMMENDATIONS);
    setAlerts(INITIAL_ALERTS);
    setAuditLog(INITIAL_AUDIT_LOG);
    setSimulationParams(DEFAULT_SIM_PARAMS);
    setSimulationResult(runWhatIfSimulation(DEFAULT_SIM_PARAMS, INITIAL_DEPARTMENTS, INITIAL_BEDS, INITIAL_PATIENTS));
    setCapacityThresholdPercent(85);
    setMaxWaitThresholdMinutes(40);

    addAuditEntry('system_reset', 'Restored all hospital beds, patient queues, and operational benchmarks to pristine demo baseline.');
  }, [addAuditEntry]);

  return (
    <HospitalContext.Provider
      value={{
        departments,
        beds,
        patients,
        diagnostics,
        recommendations,
        alerts,
        auditLog,
        historyRecords,
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        capacityThresholdPercent,
        setCapacityThresholdPercent,
        maxWaitThresholdMinutes,
        setMaxWaitThresholdMinutes,
        totalBedsCount,
        occupiedBedsCount,
        availableBedsCount,
        cleaningBedsCount,
        reservedBedsCount,
        overallOccupancyPercent,
        patientsWaitingCount,
        avgWaitTimeMinutes,
        activeAlertsCount,
        activeBottlenecks,
        currentForecast,
        selectedForecastDept,
        setSelectedForecastDept,
        simulationParams,
        setSimulationParams,
        simulationResult,
        runSimulation,
        resetSimulation,
        allocateBed,
        updateBedStatus,
        updateRecommendationStatus,
        updateAlertStatus,
        advancePatientStage,
        dischargePatientBed,
        resetToInitialData
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
