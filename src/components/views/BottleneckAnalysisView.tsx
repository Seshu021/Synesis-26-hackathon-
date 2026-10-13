import React from 'react';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const BottleneckAnalysisView: React.FC = () => {
  const {
    activeBottlenecks,
    setActiveTab,
    overallOccupancyPercent,
    avgWaitTimeMinutes,
    diagnostics,
    patients
  } = useHospital();

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-semibold';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Multi-Stage Operational Bottleneck Engine
          </h2>
          <p className="text-xs text-slate-500">
            Rule-based detection across 6 hospital workflow stages using live cycle times and queue telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {activeBottlenecks.length} Active Bottlenecks Detected
          </span>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block">
            Most Constrained Stage
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            Stat Diagnostic Imaging (CT)
          </div>
          <span className="text-xs text-rose-700 font-medium mt-0.5 block">
            Turnaround at 38 mins (Benchmark: 25m)
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block">
            Downstream Boarding Delay
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            Inpatient Ward Transfers
          </div>
          <span className="text-xs text-amber-700 font-medium mt-0.5 block">
            3 ED admitted patients awaiting telemetry beds
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block">
            Equipment Availability
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            80% Active Fleet
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Scanner CT-02 offline for maintenance
          </span>
        </div>
      </div>

      {/* Detailed Bottleneck Cards */}
      <div className="space-y-4">
        {activeBottlenecks.map((bn) => (
          <div
            key={bn.id}
            className={`bg-white rounded-xl border p-5 shadow-2xs space-y-4 transition-all ${
              bn.severity === 'critical' ? 'border-rose-300 ring-1 ring-rose-500/20' : 'border-slate-200/90'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${getSeverityBadge(bn.severity)}`}>
                    {bn.severity} Severity
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Stage ID: {bn.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {bn.stageName}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Current Queue Depth</span>
                <span className="text-base font-bold text-slate-900">
                  {bn.currentQueue} patients{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (threshold: {bn.thresholdQueue})
                  </span>
                </span>
              </div>
            </div>

            {/* Metrics & Probable Cause Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Triggering Measurements & Dwell Time:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {bn.triggerMeasurement}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cycle Duration: {bn.avgWaitTimeMinutes}m vs target {bn.thresholdWaitTimeMinutes}m</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Probable Operational Cause:
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {bn.probableOperationalCause}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Scope: <span className="text-slate-700 font-medium">{bn.impactScope}</span>
                </div>
              </div>
            </div>

            {/* Recommended Action Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40 -mx-5 -mb-5 p-4 rounded-b-xl border-t">
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-blue-900 block">
                    Recommended Operational Intervention:
                  </span>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    {bn.recommendedAction}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('alerts_recommendations')}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Review Actions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
