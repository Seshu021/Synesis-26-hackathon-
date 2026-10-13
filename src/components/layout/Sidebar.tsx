import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  Bed,
  TrendingUp,
  Layers,
  BellRing,
  Settings,
  ChevronRight,
  Clock,
  Radio,
  Building2
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  code: string;
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    userRole, 
    activeAlertsCount, 
    patientsWaitingCount,
    occupiedBedsCount,
    totalBedsCount
  } = useHospital();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Command Overview', code: 'CMD-01', icon: LayoutDashboard },
    { 
      id: 'patient_flow', 
      label: 'Patient Flow & Queues', 
      code: 'FLOW-02',
      icon: GitFork,
      badge: patientsWaitingCount > 0 ? `${patientsWaitingCount} IN QUEUE` : undefined,
      badgeColor: 'text-amber-300 bg-amber-950/60 border border-amber-800/60'
    },
    { id: 'bed_management', label: 'Bed Inventory & Board', code: 'BEDS-03', icon: Bed },
    { id: 'arrival_forecasts', label: 'Demand Forecasting', code: 'FCST-04', icon: TrendingUp },
    { id: 'resource_utilization', label: 'Fleet & Staff Utilization', code: 'UTIL-05', icon: Layers },
    { 
      id: 'alerts_recommendations', 
      label: 'Clinical Alerts & Actions', 
      code: 'ALRT-06',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} ACTIVE` : undefined,
      badgeColor: 'text-rose-300 bg-rose-950/60 border border-rose-800/60'
    },
    { id: 'settings', label: 'System Configuration', code: 'SYS-07', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-53px)] select-none">
      {/* Station Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          <span>OPERATIONS DESK</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-200 mt-0.5 tracking-tight flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Acute Hospital Pod 4</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-widest text-slate-400 uppercase">
          MODULE DIRECTORY
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all group text-left ${
                isActive
                  ? 'bg-slate-800 text-white font-medium shadow-xs border-l-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                {item.badge ? (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-300">
                    {item.code.split('-')[1]}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Hospital Shift & Resource Telemetry Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>DAY SHIFT</span>
          </span>
          <span className="text-slate-300 font-semibold">14:00 - 22:00</span>
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between text-slate-400">
            <span>BED UTILIZATION:</span>
            <span className="text-slate-200 font-bold">{occupiedBedsCount}/{totalBedsCount}</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500 rounded-full" 
              style={{ width: `${Math.round((occupiedBedsCount / totalBedsCount) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>ROLE CONTEXT:</span>
          <span className="font-semibold text-slate-200 uppercase">{userRole.replace('_', ' ')}</span>
        </div>
      </div>
    </aside>
  );
};
