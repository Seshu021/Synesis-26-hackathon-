import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw,
  Clock,
  Radio
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const Header: React.FC = () => {
  const { 
    userRole, 
    setUserRole, 
    activeAlertsCount, 
    setActiveTab, 
    overallOccupancyPercent,
    occupiedBedsCount,
    totalBedsCount,
    resetToInitialData 
  } = useHospital();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [timeString, setTimeString] = useState('14:48:00 EDT');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' EDT'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clinical posture status
  const posture = overallOccupancyPercent >= 90
    ? { level: 'SURGE CODE RED', desc: 'Critical Inflow Warning', dot: 'bg-rose-500', text: 'text-rose-700' }
    : overallOccupancyPercent >= 80
    ? { level: 'ELEVATED CENSUS (LEVEL 2)', desc: 'Bed Turnover Escalation', dot: 'bg-amber-500', text: 'text-amber-700' }
    : { level: 'NORMAL OPERATIONAL (LEVEL 1)', desc: 'Standard Flow', dot: 'bg-emerald-600', text: 'text-emerald-700' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Hospital Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 uppercase font-mono">
                SmartFlow AI
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                v2.6-PROD
              </span>
              <span className="hidden sm:inline-block text-slate-300">|</span>
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 tracking-tight">
                St. Jude Academic Medical Center
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="text-slate-400 uppercase tracking-wider text-[9px] font-semibold">Center:</span>
              <span className="font-medium text-slate-600">Central Inpatient & Acute Flow Operations</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">Live Census Telemetry</span>
            </div>
          </div>
        </div>

        {/* Operational Status & Action Controls */}
        <div className="flex items-center gap-3">
          {/* Live Synchronized Clinical Clock */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 bg-slate-50/70 text-slate-700 font-mono text-[11px]">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">OCT 12</span>
            <span className="font-semibold text-slate-900">{timeString}</span>
          </div>

          {/* Hospital Census Posture Banner */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 bg-slate-50/70 text-xs">
            <span className={`w-2 h-2 rounded-full ${posture.dot}`} />
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-500">CENSUS:</span>
              <span className="font-bold text-slate-900">{occupiedBedsCount}/{totalBedsCount}</span>
              <span className={`font-semibold ${posture.text}`}>({overallOccupancyPercent}%)</span>
            </div>
          </div>

          {/* Active Alerts Button */}
          <button
            onClick={() => setActiveTab('alerts_recommendations')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              activeAlertsCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="View operational alerts"
          >
            <Bell className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
            <span className="font-mono text-[11px]">ALERTS</span>
            {activeAlertsCount > 0 && (
              <span className="px-1 py-0.2 bg-rose-600 text-white font-mono font-bold text-[10px] rounded">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Clinical Workstation Role Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200">
            <button
              onClick={() => setUserRole('administrator')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded transition-all ${
                userRole === 'administrator'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-slate-700" />
              <span>ADMIN</span>
            </button>
            <button
              onClick={() => setUserRole('authorized_staff')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded transition-all ${
                userRole === 'authorized_staff'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3 h-3 text-slate-700" />
              <span>STAFF</span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <div className="relative">
            <button
              onClick={() => setShowResetConfirm(!showResetConfirm)}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Reset state to pristine baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {showResetConfirm && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 space-y-2">
                <div className="text-xs font-semibold text-slate-900">
                  Reset Benchmark State?
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Restores 44 hospital beds, active triage queues, and operational configurations to baseline.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetToInitialData();
                      setShowResetConfirm(false);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-rose-600 text-white rounded hover:bg-rose-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
