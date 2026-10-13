import React, { useState } from 'react';
import {
  GitFork,
  Clock,
  Users,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity,
  Bed,
  Stethoscope,
  Radio
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient, PatientFlowStage, DepartmentId } from '../../types';

export const PatientFlowView: React.FC = () => {
  const {
    patients,
    departments,
    advancePatientStage,
    setActiveTab,
    allocateBed,
    beds
  } = useHospital();

  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  const stages: { id: PatientFlowStage; code: string; label: string; description: string }[] = [
    { id: 'triage_intake', code: 'STG-1', label: 'Triage Intake', description: 'Registration & primary vitals' },
    { id: 'assessment', code: 'STG-2', label: 'Provider Exam', description: 'Physician / APP evaluation' },
    { id: 'diagnostics', code: 'STG-3', label: 'Stat Diagnostics', description: 'Stat CT, MRI, Labs' },
    { id: 'treatment', code: 'STG-4', label: 'Active Care', description: 'Interventions & stabilization' },
    { id: 'awaiting_bed', code: 'STG-5', label: 'Inpatient Boarding', description: 'Bed assignment & transport' },
    { id: 'discharge_pending', code: 'STG-6', label: 'Discharge Ready', description: 'Rx reconciliation & transport' }
  ];

  // Department-level throughput telemetry
  const deptQueueMetrics = departments.map(d => {
    const deptPatients = patients.filter(p => p.targetDepartment === d.id);
    const queueLength = deptPatients.filter(p => p.currentStage !== 'treatment' && p.currentStage !== 'discharge_pending').length;
    const estWait = Math.round((queueLength / Math.max(1, d.serviceThroughputPerHour)) * 60);
    const staffRatio = (d.activeStaffCount / Math.max(1, d.targetStaffCount)) * 100;
    
    return {
      department: d,
      queueLength,
      estWaitMinutes: estWait,
      throughputPerHour: d.serviceThroughputPerHour,
      staffRatio: Math.round(staffRatio),
      confidence: queueLength > 4 ? 'ELEVATED INFLUX' : 'STEADY CYCLE',
      trend: queueLength > 3 ? '+12m vs baseline' : '-5m vs baseline'
    };
  });

  // Filter patients
  const filteredPatients = patients.filter(p => {
    if (selectedStageFilter !== 'all' && p.currentStage !== selectedStageFilter) return false;
    if (selectedDeptFilter !== 'all' && p.targetDepartment !== selectedDeptFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    if (priority.startsWith('P1')) {
      return 'bg-rose-900 text-white font-mono font-bold';
    }
    if (priority.startsWith('P2')) {
      return 'bg-amber-800 text-white font-mono font-bold';
    }
    if (priority.startsWith('P3')) {
      return 'bg-slate-700 text-white font-mono font-medium';
    }
    return 'bg-slate-200 text-slate-800 font-mono font-medium';
  };

  const getNextStage = (current: PatientFlowStage): PatientFlowStage | null => {
    switch (current) {
      case 'triage_intake': return 'assessment';
      case 'assessment': return 'diagnostics';
      case 'diagnostics': return 'treatment';
      case 'treatment': return 'awaiting_bed';
      case 'awaiting_bed': return 'discharge_pending';
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Emergency & Inpatient Patient Flow Pipeline
            </h1>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              {patients.length} ACTIVE PATIENTS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage dwell telemetry, service throughput benchmarks, and clinical triage tracking
          </p>
        </div>

        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Clinical priorities established by attending triage physician</span>
        </div>
      </div>

      {/* Department Service Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {deptQueueMetrics.filter(m => m.department.id !== 'diagnostics').map((m) => {
          const isElevated = m.estWaitMinutes > 40;
          return (
            <div
              key={m.department.id}
              className={`bg-white rounded border p-3.5 shadow-2xs space-y-2 ${
                isElevated ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">
                    {m.department.shortName}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    CAP: {m.department.totalBeds} BEDS · STAFF: {m.department.activeStaffCount}
                  </span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                  isElevated ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {m.confidence}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1 font-mono">
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    {m.estWaitMinutes}m
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">AVG DWELL</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">
                    {m.queueLength} QUEUED
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {m.throughputPerHour} PTS/HR
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>STAFF COVERAGE: {m.staffRatio}%</span>
                <span>{m.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Stage Tracker */}
      <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs space-y-2">
        <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
          CLINICAL WORKFLOW STAGES (CLICK TO FILTER)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((stg) => {
            const count = patients.filter(p => p.currentStage === stg.id).length;
            const isFilterActive = selectedStageFilter === stg.id;

            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStageFilter(isFilterActive ? 'all' : stg.id)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isFilterActive
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className={`text-[9px] font-bold ${isFilterActive ? 'text-sky-400' : 'text-slate-500'}`}>
                    {stg.code}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.2 rounded ${isFilterActive ? 'bg-slate-800 text-white' : 'bg-white border text-slate-900'}`}>
                    {count}
                  </span>
                </div>
                <div className="text-xs font-bold truncate">
                  {stg.label}
                </div>
                <p className={`text-[9px] truncate ${isFilterActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {stg.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              ACTIVE CLINICAL QUEUE
            </span>
            <span className="text-slate-500">
              ({filteredPatients.length} CASES)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-800 font-sans focus:outline-hidden"
            >
              <option value="all">All Hospital Departments</option>
              <option value="ed">Emergency Department</option>
              <option value="icu">Intensive Care Unit</option>
              <option value="med_surg">Medical-Surgical Ward</option>
              <option value="surgical">PACU Recovery</option>
            </select>

            {(selectedStageFilter !== 'all' || selectedDeptFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedStageFilter('all');
                  setSelectedDeptFilter('all');
                }}
                className="text-blue-700 hover:text-blue-900 font-semibold px-2 py-0.5"
              >
                [RESET FILTERS]
              </button>
            )}
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Patient ID</th>
                <th className="px-4 py-2.5">Triage Level</th>
                <th className="px-4 py-2.5">Current Stage</th>
                <th className="px-4 py-2.5">Dwell Time</th>
                <th className="px-4 py-2.5">Required Bed Type</th>
                <th className="px-4 py-2.5">Clinical Presentation</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredPatients.map((patient) => {
                const nextStage = getNextStage(patient.currentStage);
                const hasAssignedBed = Boolean(patient.assignedBedId);

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      <div>{patient.id}</div>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">
                        {patient.ageGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] ${getPriorityBadge(patient.operationalPriority)}`}>
                        {patient.operationalPriority.split(' - ')[0]}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {patient.operationalPriority.split(' - ')[1]}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-800">
                      {patient.currentStage.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className={`font-bold ${patient.waitingDurationMinutes > 60 ? 'text-rose-700' : 'text-slate-800'}`}>
                        {patient.waitingDurationMinutes}m
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {patient.targetDepartment.toUpperCase()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {patient.requiredBedType}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {patient.chiefComplaintSummary}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono">
                      {patient.currentStage === 'awaiting_bed' && !hasAssignedBed ? (
                        <button
                          onClick={() => setActiveTab('bed_management')}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Bed className="w-3 h-3 text-sky-400" />
                          <span>MATCH BED</span>
                        </button>
                      ) : nextStage ? (
                        <button
                          onClick={() => advancePatientStage(patient.id, nextStage)}
                          className="px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span>ADVANCE</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          IN TREATMENT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
