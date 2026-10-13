import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Database,
  Lock,
  Building2
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const SettingsView: React.FC = () => {
  const {
    capacityThresholdPercent,
    setCapacityThresholdPercent,
    maxWaitThresholdMinutes,
    setMaxWaitThresholdMinutes,
    userRole,
    setUserRole,
    resetToInitialData
  } = useHospital();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Hospital System Configuration & Policy Controls
          </h1>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            STATION PARAMETERS
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Surge threshold limits, workstation access permissions, and session data management
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-mono font-medium text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Operational parameters persisted to local storage.</span>
        </div>
      )}

      {/* Role Access Management */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              WORKSTATION ROLE ACCESS
            </h3>
            <p className="text-[11px] text-slate-500">
              Toggle authorization level between hospital administrator and floor charge nurse
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold uppercase">
            ACTIVE: {userRole}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setUserRole('administrator')}
            className={`p-3.5 rounded border cursor-pointer transition-all ${
              userRole === 'administrator'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className={`w-4 h-4 ${userRole === 'administrator' ? 'text-sky-400' : 'text-slate-700'}`} />
              <span className="text-xs font-bold font-mono uppercase">Administrator</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${userRole === 'administrator' ? 'text-slate-300' : 'text-slate-600'}`}>
              Full facility control: surge thresholds, clinical recommendations authorization, and session reset authority.
            </p>
          </div>

          <div
            onClick={() => setUserRole('authorized_staff')}
            className={`p-3.5 rounded border cursor-pointer transition-all ${
              userRole === 'authorized_staff'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className={`w-4 h-4 ${userRole === 'authorized_staff' ? 'text-emerald-400' : 'text-slate-700'}`} />
              <span className="text-xs font-bold font-mono uppercase">Authorized Floor Nurse</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${userRole === 'authorized_staff' ? 'text-slate-300' : 'text-slate-600'}`}>
              Floor triage & bed management: queue tracking, bed cleaning turnover sign-offs, and bed allocation authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Configurable Operational Thresholds */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            AUTOMATED ALARM BENCHMARKS
          </h3>
          <p className="text-[11px] text-slate-500">
            Define limits that automatically trigger hospital surge warnings
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Bed Occupancy Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-700">
                Unit Occupancy Warning Ceiling:
              </span>
              <span className="font-bold text-slate-900">
                {capacityThresholdPercent}% OCCUPANCY
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={95}
              step={5}
              value={capacityThresholdPercent}
              onChange={(e) => setCapacityThresholdPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>70% (CONSERVATIVE)</span>
              <span>85% (STANDARD ACADEMIC)</span>
              <span>95% (EMERGENCY SURGE)</span>
            </div>
          </div>

          {/* Wait Time Threshold */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-700">
                Maximum Acceptable Intake Dwell:
              </span>
              <span className="font-bold text-slate-900">
                {maxWaitThresholdMinutes} MINUTES
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={60}
              step={5}
              value={maxWaitThresholdMinutes}
              onChange={(e) => setMaxWaitThresholdMinutes(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>20m (FAST TRACK)</span>
              <span>40m (NORMAL ACUTE)</span>
              <span>60m (OVERBURDENED)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end font-mono">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-colors"
            >
              COMMIT SETTINGS
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Pristine Reset */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            BENCHMARK STATE RESTORATION
          </h3>
          <p className="text-[11px] text-slate-500">
            Clear all local evaluations and restore 44 beds, active patient rosters, and alarm queues
          </p>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 font-mono">
              RESTORE INITIAL DEMO STATE
            </span>
            <p className="text-[11px] text-slate-500">
              Re-seeds pristine 44 beds, 26 queue cases, equipment inventory, and clean audit logs.
            </p>
          </div>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-bold font-mono flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DATA</span>
          </button>
        </div>

        {showConfirmReset && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
              <span>CONFIRM BENCHMARK RESET</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              This will discard all bed status modifications, patient allocations, and threshold overrides.
            </p>
            <div className="flex justify-end gap-2 font-mono pt-1">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 bg-white border border-rose-200 text-xs font-semibold text-slate-700 rounded"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  resetToInitialData();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1 bg-rose-700 text-white text-xs font-bold rounded hover:bg-rose-800"
              >
                RESTORE BENCHMARK
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-3.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] text-slate-700 uppercase">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Operational Integrity & Medical Governance</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-500">
          SmartFlow AI serves as an administrative resource optimization platform. Clinical decision-making and triage categorization remain the sole responsibility of licensed attending medical staff.
        </p>
      </div>
    </div>
  );
};
