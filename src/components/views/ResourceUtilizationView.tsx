import React, { useState } from 'react';
import {
  Layers,
  Users,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Filter,
  Activity,
  ShieldCheck,
  Radio,
  Building2
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const ResourceUtilizationView: React.FC = () => {
  const {
    departments,
    beds,
    diagnostics,
    overallOccupancyPercent
  } = useHospital();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Wards bed utilization
  const wardUtilization = [
    { ward: 'ED Acute Pods', dept: 'ed', total: 6, occupied: 5, rate: 83 },
    { ward: 'ED Rapid Assessment', dept: 'ed', total: 4, occupied: 3, rate: 75 },
    { ward: 'ED Negative Pressure', dept: 'ed', total: 2, occupied: 1, rate: 50 },
    { ward: 'ICU Critical Care', dept: 'icu', total: 8, occupied: 6, rate: 75 },
    { ward: '4-East Step-Down', dept: 'med_surg', total: 4, occupied: 4, rate: 100 },
    { ward: '4-West General', dept: 'med_surg', total: 7, occupied: 7, rate: 100 },
    { ward: '4-North Isolation/Gen', dept: 'med_surg', total: 5, occupied: 3, rate: 60 },
    { ward: 'PACU Recovery Bay', dept: 'surgical', total: 8, occupied: 5, rate: 62 },
  ].filter(w => selectedDeptFilter === 'all' || w.dept === selectedDeptFilter);

  // Staff availability data
  const staffData = departments.map(d => {
    const ratio = Math.round((d.activeStaffCount / Math.max(1, d.targetStaffCount)) * 100);
    return {
      name: d.shortName,
      active: d.activeStaffCount,
      target: d.targetStaffCount,
      ratio,
      status: ratio >= 100 ? 'STANDARD RATIO' : ratio >= 80 ? 'MODERATE DEFICIT' : 'CRITICAL DEFICIT'
    };
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Fleet & Workforce Utilization
            </h1>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              DIAGNOSTIC & CLINICAL RATIOS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic scanner availability, clinical nurse-to-patient ratios, and ward-level capacity constraints
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-xs px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-800 font-mono focus:outline-hidden"
          >
            <option value="all">ALL HOSPITAL WARDS</option>
            <option value="ed">EMERGENCY DEPARTMENT</option>
            <option value="icu">INTENSIVE CARE UNIT</option>
            <option value="med_surg">MEDICAL-SURGICAL WARD</option>
            <option value="surgical">PACU RECOVERY</option>
          </select>
        </div>
      </div>

      {/* Constrained vs. Underutilized Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Constrained Resources */}
        <div className="bg-white rounded border border-rose-200/90 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                CONSTRAINED FLEET & CAPACITY
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-700">
              PRIORITY ATTENTION
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-rose-50/60 border border-rose-100 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900">4-East Step-Down & 4-West General Wards</span>
                <p className="text-slate-600 text-[11px] mt-0.5">100% bed saturation with 3 pending boarding transfers from ED acute bays.</p>
              </div>
              <span className="font-mono font-bold text-rose-800 shrink-0 ml-2">100% SAT</span>
            </div>

            <div className="p-2.5 rounded bg-rose-50/60 border border-rose-100 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900">Stat ER CT Scanner (CT-01)</span>
                <p className="text-slate-600 text-[11px] mt-0.5">Operating at 94% continuous utilization; secondary scanner CT-02 in calibration downtime.</p>
              </div>
              <span className="font-mono font-bold text-rose-800 shrink-0 ml-2">94% LOAD</span>
            </div>
          </div>
        </div>

        {/* Underutilized / Spare Capacity */}
        <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                FLEX & ABSORPTION HEADROOM
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700">
              AVAILABLE BUFFER
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-emerald-50/50 border border-emerald-100 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900">PACU Surgical Recovery Bays</span>
                <p className="text-slate-600 text-[11px] mt-0.5">62% unit occupancy with 3 monitored beds available for step-down flex.</p>
              </div>
              <span className="font-mono font-bold text-emerald-800 shrink-0 ml-2">3 BEDS READY</span>
            </div>

            <div className="p-2.5 rounded bg-emerald-50/50 border border-emerald-100 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900">Digital Radiography Suite 1 (X-Ray)</span>
                <p className="text-slate-600 text-[11px] mt-0.5">62% utilization with only 3 patients in queue and rapid 14m cycle turnaround.</p>
              </div>
              <span className="font-mono font-bold text-emerald-800 shrink-0 ml-2">38% IDLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ward-Level Bed Utilization Matrix */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            WARD BED UTILIZATION MATRIX
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            OCCUPIED / LICENSED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {wardUtilization.map((ward, idx) => {
            const isHigh = ward.rate >= 90;
            const isMid = ward.rate >= 75 && ward.rate < 90;

            return (
              <div
                key={idx}
                className={`p-3 rounded border space-y-2 ${
                  isHigh ? 'border-rose-200 bg-rose-50/20' : isMid ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {ward.ward}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isHigh ? 'bg-rose-100 text-rose-800' : isMid ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ward.rate}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isHigh ? 'bg-rose-600' : isMid ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${ward.rate}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>OCC: {ward.occupied}</span>
                  <span>LICENSED: {ward.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostic Fleet & Workforce Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagnostic Imaging Fleet */}
        <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              DIAGNOSTIC IMAGING & LAB FLEET TELEMETRY
            </h3>
            <span className="text-[10px] font-mono text-slate-400">STATUS</span>
          </div>

          <div className="divide-y divide-slate-100">
            {diagnostics.map((diag) => {
              const isOffline = diag.status !== 'operational';
              return (
                <div
                  key={diag.id}
                  className="py-2.5 flex items-center justify-between text-xs font-sans"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{diag.name}</span>
                      <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded uppercase ${
                        isOffline ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {diag.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Queue: <span className="text-slate-800 font-bold">{diag.queueCount} cases</span> · Cycle: <span className="text-slate-800 font-bold">{diag.avgTurnaroundMinutes}m</span> (ref: {diag.targetTurnaroundMinutes}m)
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-sm text-slate-900">
                      {diag.currentUtilizationPercent}%
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase">LOAD</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Staffing Ratios */}
        <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              CLINICAL SHIFT NURSE COVERAGE
            </h3>
            <span className="text-[10px] font-mono text-slate-400">ACTIVE / TARGET</span>
          </div>

          <div className="space-y-3 pt-1">
            {staffData.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{st.name}</span>
                  <div className="font-mono text-[11px]">
                    <span className="font-bold text-slate-900">{st.active}/{st.target}</span>
                    <span className="text-slate-400 ml-1">({st.ratio}%)</span>
                    <span className={`ml-2 text-[10px] font-bold ${st.ratio < 90 ? 'text-amber-700' : 'text-slate-600'}`}>
                      [{st.status}]
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      st.ratio >= 100 ? 'bg-slate-800' : st.ratio >= 80 ? 'bg-amber-600' : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, st.ratio)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
