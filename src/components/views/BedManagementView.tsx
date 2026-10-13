import React, { useState, useMemo } from 'react';
import {
  Bed,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  User,
  Filter,
  Check,
  X,
  Stethoscope,
  Info,
  Activity,
  Layers,
  Wind,
  HeartPulse,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { HospitalBed, BedStatus, BedType, DepartmentId, Patient } from '../../types';
import { rankBedAllocationsForPatient } from '../../utils/allocation';

export const BedManagementView: React.FC = () => {
  const {
    beds,
    patients,
    userRole,
    allocateBed,
    updateBedStatus,
    dischargePatientBed
  } = useHospital();

  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Selected Bed for Detail Modal
  const [activeBedModal, setActiveBedModal] = useState<HospitalBed | null>(null);

  // Selected Patient for Smart Allocation Drawer
  const [allocatingPatientId, setAllocatingPatientId] = useState<string | null>(null);
  const [allocationSuccessMessage, setAllocationSuccessMessage] = useState<string | null>(null);

  // Patients awaiting bed
  const waitingPatients = useMemo(() => {
    return patients.filter(p => p.currentStage === 'awaiting_bed' && !p.assignedBedId);
  }, [patients]);

  const activePatientForAllocation = useMemo(() => {
    if (!allocatingPatientId) return null;
    return patients.find(p => p.id === allocatingPatientId) || null;
  }, [allocatingPatientId, patients]);

  // Compute ranking if a patient is selected
  const allocationRecommendations = useMemo(() => {
    if (!activePatientForAllocation) return null;
    return rankBedAllocationsForPatient(activePatientForAllocation, beds);
  }, [activePatientForAllocation, beds]);

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    if (selectedDeptFilter !== 'all' && b.departmentId !== selectedDeptFilter) return false;
    if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) return false;
    if (selectedTypeFilter !== 'all' && b.bedType !== selectedTypeFilter) return false;
    return true;
  });

  // Group beds by Ward Name for clinical ward-level view
  const wardGroups = useMemo(() => {
    const map = new Map<string, HospitalBed[]>();
    for (const b of filteredBeds) {
      const existing = map.get(b.wardName) || [];
      existing.push(b);
      map.set(b.wardName, existing);
    }
    return Array.from(map.entries());
  }, [filteredBeds]);

  // Status Styling
  const getStatusBorder = (status: BedStatus) => {
    switch (status) {
      case 'available':
        return 'border-l-4 border-l-emerald-600';
      case 'occupied':
        return 'border-l-4 border-l-slate-800';
      case 'cleaning':
        return 'border-l-4 border-l-amber-500';
      case 'reserved':
        return 'border-l-4 border-l-purple-600';
    }
  };

  const getStatusLabel = (status: BedStatus) => {
    switch (status) {
      case 'available':
        return { label: 'AVAILABLE', text: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'occupied':
        return { label: 'OCCUPIED', text: 'text-slate-700', bg: 'bg-slate-100' };
      case 'cleaning':
        return { label: 'TURNOVER', text: 'text-amber-700', bg: 'bg-amber-50' };
      case 'reserved':
        return { label: 'RESERVED', text: 'text-purple-700', bg: 'bg-purple-50' };
    }
  };

  const handleConfirmAllocation = (bedId: string) => {
    if (!allocatingPatientId) return;
    const ok = allocateBed(allocatingPatientId, bedId);
    if (ok) {
      setAllocationSuccessMessage(`Bed ${bedId} successfully allocated to Patient ${allocatingPatientId}.`);
      setAllocatingPatientId(null);
      setTimeout(() => setAllocationSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Match CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Bed Inventory & Ward Board
            </h1>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              {beds.length} BEDS LICENSED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ward-level telemetry status, negative-pressure isolation readiness, and algorithmic patient-bed compatibility
          </p>
        </div>

        {waitingPatients.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 text-white rounded-md p-1.5 px-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold">
                {waitingPatients.length} BOARDING QUEUE
              </span>
            </div>
            <button
              onClick={() => setAllocatingPatientId(waitingPatients[0].id)}
              className="ml-2 text-xs font-bold font-mono px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded transition-colors"
            >
              ALLOCATE NEXT ({waitingPatients[0].id})
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {allocationSuccessMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-medium text-emerald-900 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{allocationSuccessMessage}</span>
        </div>
      )}

      {/* Clinical Filter Strip */}
      <div className="bg-white rounded border border-slate-200 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            FILTER:
          </span>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
          >
            <option value="all">All Hospital Units (44 beds)</option>
            <option value="ed">Emergency Department (12 beds)</option>
            <option value="icu">Intensive Care Unit (8 beds)</option>
            <option value="med_surg">Medical-Surgical (16 beds)</option>
            <option value="surgical">PACU Recovery (8 beds)</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
          >
            <option value="all">All Operational Statuses</option>
            <option value="available">Available Ready</option>
            <option value="occupied">Occupied Active</option>
            <option value="cleaning">Turnover / Cleaning</option>
            <option value="reserved">Reserved Intake</option>
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
          >
            <option value="all">All Bed Classifications</option>
            <option value="Standard Adult">Standard Adult</option>
            <option value="ICU Negative Pressure">ICU Negative Pressure</option>
            <option value="Telemetry / Step-Down">Telemetry / Step-Down</option>
            <option value="Trauma Bay">Trauma Bay</option>
            <option value="Isolation Room">Isolation Room</option>
            <option value="Post-Surgical Recovery">Post-Surgical Recovery</option>
          </select>

          {(selectedDeptFilter !== 'all' || selectedStatusFilter !== 'all' || selectedTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedDeptFilter('all');
                setSelectedStatusFilter('all');
                setSelectedTypeFilter('all');
              }}
              className="text-blue-700 hover:text-blue-900 font-mono font-semibold text-[11px] px-2 py-0.5"
            >
              [RESET]
            </button>
          )}
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          MATCHING: <span className="font-bold text-slate-900">{filteredBeds.length}</span> BEDS
        </div>
      </div>

      {/* Ward-by-Ward Clinical Bed Board */}
      <div className="space-y-5">
        {wardGroups.map(([wardName, wardBeds]) => {
          const occupiedCount = wardBeds.filter(b => b.status === 'occupied').length;
          const availableCount = wardBeds.filter(b => b.status === 'available').length;

          return (
            <div key={wardName} className="space-y-2">
              {/* Ward Section Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800 font-mono">
                    {wardName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({wardBeds.length} BEDS)
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 flex items-center gap-3">
                  <span>OCCUPIED: <span className="font-bold text-slate-800">{occupiedCount}</span></span>
                  <span>AVAILABLE: <span className="font-bold text-emerald-700">{availableCount}</span></span>
                </div>
              </div>

              {/* Beds Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {wardBeds.map((bed) => {
                  const st = getStatusLabel(bed.status);
                  const isSelected = activeBedModal?.id === bed.id;

                  return (
                    <div
                      key={bed.id}
                      onClick={() => setActiveBedModal(bed)}
                      className={`bg-white rounded border p-2.5 cursor-pointer transition-all hover:shadow-xs space-y-1.5 relative ${getStatusBorder(
                        bed.status
                      )} ${
                        isSelected ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200'
                      }`}
                    >
                      {/* Bed ID & Status */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 font-mono tracking-tight">
                          {bed.id}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>

                      {/* Bed Type */}
                      <div className="text-[10px] font-medium text-slate-600 truncate leading-tight">
                        {bed.bedType}
                      </div>

                      {/* Equipment Tags */}
                      <div className="flex flex-wrap gap-0.5 pt-0.5">
                        {bed.equipment.map((eq) => (
                          <span
                            key={eq}
                            className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 uppercase"
                            title={eq}
                          >
                            {eq === 'ventilator' ? 'VENT' : eq === 'cardiac_monitor' ? 'TELE' : eq === 'hepa_filter' ? 'HEPA' : eq === 'dialysis_ready' ? 'DIAL' : eq.slice(0, 4)}
                          </span>
                        ))}
                      </div>

                      {/* Patient ID or Ready status */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                        {bed.currentPatientId ? (
                          <span className="font-bold text-slate-900 truncate">
                            PT: {bed.currentPatientId}
                          </span>
                        ) : (
                          <span className="text-slate-400">VACANT</span>
                        )}
                        <span className="text-[9px] text-slate-400">{bed.lastUpdated.split(' ')[0]}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Detail Clinical Modal */}
      {activeBedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-md w-full p-5 space-y-4 font-sans">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                  BED MASTER RECORD
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {activeBedModal.id} — {activeBedModal.wardName}
                </h3>
              </div>
              <button
                onClick={() => setActiveBedModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold font-mono text-slate-900 uppercase">{activeBedModal.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Classification:</span>
                <span className="font-semibold text-slate-900">{activeBedModal.bedType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Current Occupant:</span>
                <span className="font-mono font-bold text-slate-900">{activeBedModal.currentPatientId || 'NONE'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Equipment & Telemetry:</span>
                <span className="font-mono text-[11px] text-slate-800">
                  {activeBedModal.equipment.join(', ') || 'Standard monitoring'}
                </span>
              </div>
              {activeBedModal.notes && (
                <div className="py-1">
                  <span className="text-slate-500 block">Notes:</span>
                  <p className="text-slate-700 italic mt-0.5">{activeBedModal.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Authorized Nurse Actions:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {activeBedModal.status === 'occupied' && (
                  <button
                    onClick={() => {
                      dischargePatientBed(activeBedModal.id);
                      setActiveBedModal(null);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-colors text-center"
                  >
                    DISCHARGE PATIENT
                  </button>
                )}

                {activeBedModal.status === 'cleaning' && (
                  <button
                    onClick={() => {
                      updateBedStatus(activeBedModal.id, 'available', 'Housekeeping terminal disinfection signed off');
                      setActiveBedModal(null);
                    }}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded transition-colors text-center"
                  >
                    MARK SANITIZED
                  </button>
                )}

                {activeBedModal.status === 'available' && (
                  <button
                    onClick={() => {
                      updateBedStatus(activeBedModal.id, 'reserved', 'Reserved for inbound trauma');
                      setActiveBedModal(null);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded transition-colors text-center"
                  >
                    RESERVE BED
                  </button>
                )}

                {activeBedModal.status === 'reserved' && (
                  <button
                    onClick={() => {
                      updateBedStatus(activeBedModal.id, 'available', 'Reservation released');
                      setActiveBedModal(null);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded transition-colors text-center"
                  >
                    RELEASE HOLD
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Bed Allocation Modal */}
      {allocatingPatientId && activePatientForAllocation && allocationRecommendations && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500 text-slate-950 font-bold rounded">
                    MATCH ALGORITHM
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    PRIORITY: {activePatientForAllocation.operationalPriority}
                  </span>
                </div>
                <h3 className="text-sm font-bold font-mono text-white">
                  Bed Transfer Order: Patient {activePatientForAllocation.id}
                </h3>
                <p className="text-xs text-slate-300">
                  Target: {activePatientForAllocation.requiredBedType} in {activePatientForAllocation.targetDepartment.toUpperCase()} · Inflow dwell: {activePatientForAllocation.waitingDurationMinutes}m
                </p>
              </div>
              <button
                onClick={() => setAllocatingPatientId(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compatible Beds List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                <span>
                  Found <span className="font-bold font-mono text-slate-900">{allocationRecommendations.compatibleBeds.length}</span> clinically verified beds
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  STAFF CONFIRMATION MANDATORY
                </span>
              </div>

              {allocationRecommendations.compatibleBeds.length === 0 ? (
                <div className="p-6 text-center space-y-2 border border-slate-200 rounded">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-900 font-mono">
                    Zero Compatible Beds in Unit
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    All matching beds in this unit are currently occupied or in housekeeping turnover. Check discharge recommendations to liberate capacity.
                  </p>
                </div>
              ) : (
                allocationRecommendations.compatibleBeds.map((compat, idx) => {
                  const isTopMatch = idx === 0;

                  return (
                    <div
                      key={compat.bed.id}
                      className={`pt-3 flex items-start justify-between gap-3 ${
                        isTopMatch ? 'bg-sky-50/50 p-3 rounded border border-sky-200 mt-2' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 font-mono">
                            {compat.bed.id}
                          </span>
                          <span className="text-xs text-slate-600">
                            {compat.bed.wardName} ({compat.bed.bedType})
                          </span>
                          {isTopMatch && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-slate-900 text-sky-400 rounded">
                              SCORE {compat.matchScore}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700">
                          {compat.wardSuitabilityExplanation}
                        </p>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{compat.equipmentMatchSummary}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmAllocation(compat.bed.id)}
                        className="px-3 py-1.5 text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                        <span>AUTHORIZE</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Protocol: Clinical placement verification required before transport dispatch.</span>
              <button
                onClick={() => setAllocatingPatientId(null)}
                className="px-2 py-1 text-slate-600 hover:text-slate-900 font-semibold"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
