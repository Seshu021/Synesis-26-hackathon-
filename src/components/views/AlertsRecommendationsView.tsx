import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Eye,
  Clock,
  Filter,
  FileText,
  Radio,
  Layers
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Recommendation, AlertNotification, AuditLogEntry } from '../../types';

export const AlertsRecommendationsView: React.FC = () => {
  const {
    recommendations,
    alerts,
    auditLog,
    userRole,
    updateRecommendationStatus,
    updateAlertStatus
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<'recommendations' | 'alerts' | 'audit'>('recommendations');
  const [recFilter, setRecFilter] = useState<string>('all');
  const [alertFilter, setAlertFilter] = useState<string>('all');

  const filteredRecs = recommendations.filter(r => {
    if (recFilter === 'all') return true;
    return r.status === recFilter;
  });

  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'all') return true;
    return a.status === alertFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Operational Actions & Clinical Alarm Center
            </h1>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              DECISION SUPPORT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Intervention recommendations, active departmental alarms, and verified event ledger
          </p>
        </div>

        {/* Sub-tab Workstation Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab('recommendations')}
            className={`px-3 py-1 font-bold rounded transition-all ${
              activeSubTab === 'recommendations'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            INTERVENTIONS ({recommendations.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`px-3 py-1 font-bold rounded transition-all ${
              activeSubTab === 'alerts'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ALARMS ({alerts.filter(a => a.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1 font-bold rounded transition-all ${
              activeSubTab === 'audit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AUDIT LOG ({auditLog.length})
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase tracking-wider text-[11px]">FILTER:</span>
              <div className="flex gap-1 font-bold">
                {['all', 'pending', 'approved', 'dismissed', 'reviewed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRecFilter(st)}
                    className={`px-2 py-0.5 rounded uppercase text-[11px] transition-colors ${
                      recFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-slate-500">
              SHOWING {filteredRecs.length} PROTOCOLS
            </span>
          </div>

          {/* Recommendation Cards */}
          <div className="space-y-3">
            {filteredRecs.map((rec) => {
              const isPending = rec.status === 'pending';

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded border p-4 shadow-2xs space-y-3 transition-all ${
                    rec.urgency === 'urgent' && isPending
                      ? 'border-l-4 border-l-rose-700 border-slate-200'
                      : 'border-l-4 border-l-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                            rec.urgency === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {rec.urgency.toUpperCase()}
                        </span>
                        <span className="text-slate-400">
                          {rec.id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 uppercase">
                          STATUS: {rec.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {rec.title}
                      </h3>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {rec.createdTimestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        TRIGGER TELEMETRY:
                      </span>
                      <p className="text-slate-800 font-medium">
                        {rec.triggerData}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        CLINICAL RATIONALE:
                      </span>
                      <p className="text-slate-800">
                        {rec.operationalContext}
                      </p>
                    </div>
                  </div>

                  {/* Proposed Action & Estimated Impact */}
                  <div className="p-3 rounded bg-slate-900 text-white text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                      <span>PROPOSED INTERVENTION:</span>
                    </div>
                    <p className="text-slate-200 text-xs">
                      {rec.proposedAction}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      PROJECTED IMPACT: <span className="text-emerald-400 font-semibold">{rec.estimatedImpact}</span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-slate-400">
                      Administrative sign-off required. No automated patient transfers.
                    </span>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateRecommendationStatus(rec.id, 'dismissed')}
                          className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          DISMISS
                        </button>
                        <button
                          onClick={() => updateRecommendationStatus(rec.id, 'reviewed')}
                          className="px-2.5 py-1 rounded border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 font-bold"
                        >
                          MARK REVIEWED
                        </button>
                        <button
                          onClick={() => updateRecommendationStatus(rec.id, 'approved')}
                          className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AUTHORIZE</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Processed by {rec.reviewedByRole?.toUpperCase() || 'ADMIN'} ({rec.reviewedTimestamp || 'Earlier'})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Alerts */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase tracking-wider text-[11px]">FILTER:</span>
              <div className="flex gap-1 font-bold">
                {['all', 'active', 'acknowledged', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAlertFilter(st)}
                    className={`px-2 py-0.5 rounded uppercase text-[11px] transition-colors ${
                      alertFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-slate-500">
              SHOWING {filteredAlerts.length} ALARMS
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded border p-3.5 shadow-2xs space-y-2.5 ${
                  alert.severity === 'critical' ? 'border-l-4 border-l-rose-700 border-slate-200' : 'border-l-4 border-l-amber-500 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span
                        className={`font-bold px-1 py-0.2 rounded uppercase ${
                          alert.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-slate-400">{alert.id}</span>
                      <span className="font-bold text-slate-900 font-sans text-xs">
                        {alert.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {alert.triggerCondition}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {alert.timestamp}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                  <span className="text-slate-700 font-sans">
                    <span className="font-bold font-mono text-[10px] text-slate-500 uppercase mr-1">PROTOCOL:</span> {alert.recommendedNextStep}
                  </span>

                  {alert.status === 'active' ? (
                    <div className="flex items-center gap-2 shrink-0 ml-4 font-mono text-xs">
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded transition-colors"
                      >
                        ACK
                      </button>
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'resolved')}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded transition-colors"
                      >
                        RESOLVE
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                      ✓ {alert.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Audit Log */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between font-mono text-xs">
            <h3 className="font-bold text-slate-900 uppercase">
              OPERATIONAL INTERVENTION AUDIT TRAIL
            </h3>
            <span className="text-slate-400 text-[10px]">
              IMMUTABLE SESSION LEDGER
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-2.5">TIMESTAMP</th>
                  <th className="px-4 py-2.5">ROLE CONTEXT</th>
                  <th className="px-4 py-2.5">EVENT CODE</th>
                  <th className="px-4 py-2.5">TRANSACTION DETAILS</th>
                  <th className="px-4 py-2.5 text-right">ENTITY ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {auditLog.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60 font-mono text-xs">
                    <td className="px-4 py-2 text-slate-500">
                      {entry.timestamp}
                    </td>
                    <td className="px-4 py-2 font-bold text-slate-800 uppercase">
                      {entry.userRole.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-700">
                        {entry.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-800 font-sans text-xs max-w-md">
                      {entry.details}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-slate-700">
                      {entry.targetEntityId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
