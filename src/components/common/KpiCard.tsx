import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  status?: 'normal' | 'warning' | 'critical' | 'neutral';
  trend?: {
    value: string;
    isUpward: boolean;
    isPositive: boolean;
  };
  onClick?: () => void;
  benchmark?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  status = 'neutral',
  trend,
  onClick,
  benchmark
}) => {
  const getStatusIndicator = () => {
    switch (status) {
      case 'critical':
        return {
          bar: 'bg-rose-500',
          dot: 'bg-rose-500',
          text: 'text-rose-700',
          iconColor: 'text-rose-600',
          border: 'border-rose-200/80 hover:border-rose-300'
        };
      case 'warning':
        return {
          bar: 'bg-amber-500',
          dot: 'bg-amber-500',
          text: 'text-amber-700',
          iconColor: 'text-amber-600',
          border: 'border-amber-200/80 hover:border-amber-300'
        };
      case 'normal':
        return {
          bar: 'bg-emerald-600',
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          iconColor: 'text-emerald-600',
          border: 'border-slate-200/90 hover:border-slate-300'
        };
      default:
        return {
          bar: 'bg-slate-400',
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          iconColor: 'text-slate-500',
          border: 'border-slate-200/90 hover:border-slate-300'
        };
    }
  };

  const st = getStatusIndicator();

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-lg border p-3.5 transition-all duration-100 ${st.border} ${
        onClick ? 'cursor-pointer hover:bg-slate-50/50' : ''
      }`}
    >
      {/* Top micro-line indicator */}
      <div className={`absolute top-0 left-3 right-3 h-[2px] rounded-full ${st.bar} opacity-80`} />

      <div className="pt-1 flex items-start justify-between gap-2.5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} shrink-0`} />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase truncate">
              {title}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-medium font-mono ${
                  trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {trend.isUpward ? '▲' : '▼'} {trend.value}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-[11px] text-slate-500 truncate leading-tight">
              {subtitle}
            </p>
          )}

          {benchmark && (
            <div className="text-[10px] text-slate-400 font-mono">
              Ref: {benchmark}
            </div>
          )}
        </div>

        <div className={`p-2 rounded border border-slate-100 bg-slate-50/80 shrink-0 ${st.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
