import React from 'react';
import {
  Bed,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity,
  Radio,
  Building2,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { KpiCard } from '../common/KpiCard';

export const OverviewDashboard: React.FC = () => {
  const {
    totalBedsCount,
    occupiedBedsCount,
    availableBedsCount,
    cleaningBedsCount,
    reservedBedsCount,
    overallOccupancyPercent,
    patientsWaitingCount,
    avgWaitTimeMinutes,
    activeAlertsCount,
    departments,
    beds,
    patients,
    activeBottlenecks,
    currentForecast,
    auditLog,
    setActiveTab
  } = useHospital();

  // Next 4 hours predicted arrival sum
  const predictedNext4Hours = currentForecast.forecastPoints
    .slice(1, 5)
    .reduce((sum, p) => sum + p.predictedArrivals, 0);

  // Department-wise occupancy data with exact unit capacity
  const deptOccupancyData = departments
    .filter(d => d.totalBeds > 0)
    .map(d => {
      const deptBeds = beds.filter(b => b.departmentId === d.id);
      const occupied = deptBeds.filter(b => b.status === 'occupied').length;
      const rate = deptBeds.length > 0 ? Math.round((occupied / deptBeds.length) * 100) : 0;
      return {
        name: `${d.shortName} (${deptBeds.length})`,
        short: d.shortName,
        total: deptBeds.length,
        occupied,
        available: deptBeds.length - occupied,
        occupancyRate: rate,
        targetRate: d.targetMaxOccupancy
      };
    });

  // Actual vs Predicted line chart data
  const arrivalsChartData = [
    ...currentForecast.historicalPoints.slice(-5).map(h => ({
      time: h.timeLabel,
      actual: h.actualArrivals,
      predicted: undefined
    })),
    ...currentForecast.forecastPoints.slice(0, 7).map(f => ({
      time: f.timeLabel,
      actual: f.actualArrivals,
      predicted: f.predictedArrivals
    }))
  ];

  // Stage Dwell Time Benchmarks
  const stageDwellTimes = [
    { stage: 'Triage Intake', measured: avgWaitTimeMinutes, benchmark: 20, unit: 'ED' },
    { stage: 'Diagnostic CT Scan', measured: 38, benchmark: 25, unit: 'RAD' },
    { stage: 'Inpatient Boarding', measured: 65, benchmark: 45, unit: 'MED' },
    { stage: 'PACU Recovery', measured: 18, benchmark: 25, unit: 'SURG' },
    { stage: 'Discharge Turnover', measured: 55, benchmark: 40, unit: 'EVS' }
  ];

  return (
    <div className="space-y-5">
      {/* Station Control Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Resource & Capacity Command Center
            </h1>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              ZONE-A LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inpatient census, emergency queue dwell telemetry, and forecasted surge indicators
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">CLEANING: <span className="font-bold text-amber-700">{cleaningBedsCount}</span></span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">RESERVED: <span className="font-bold text-purple-700">{reservedBedsCount}</span></span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">TURNOVER RATE: <span className="font-bold text-slate-800">42m</span></span>
        </div>
      </div>

      {/* Surge Advisory Callout */}
      {overallOccupancyPercent >= 80 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/70 border border-amber-200/90 text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-amber-900">Surge Advisory:</span>{' '}
              Facility census is at <span className="font-bold font-mono">{overallOccupancyPercent}%</span> ({occupiedBedsCount}/{totalBedsCount} licensed beds occupied). Medical-Surgical and Critical Care units are nearing capacity threshold.
            </div>
          </div>
          <button
            onClick={() => setActiveTab('alerts_recommendations')}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded transition-colors shrink-0 font-mono text-[11px]"
          >
            <span>REVIEW ACTIONS</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 8 Clinical KPI Metric Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Licensed Beds"
          value={totalBedsCount}
          subtitle="4 acute & inpatient wards"
          icon={Building2}
          status="neutral"
          benchmark="100% capacity base"
        />
        <KpiCard
          title="Occupied Census"
          value={occupiedBedsCount}
          subtitle={`${Math.round((occupiedBedsCount / totalBedsCount) * 100)}% hospital-wide load`}
          icon={Users}
          status={overallOccupancyPercent >= 85 ? 'warning' : 'normal'}
          benchmark="Max target: 37 beds"
        />
        <KpiCard
          title="Available Inventory"
          value={availableBedsCount}
          subtitle="Sanitized and immediately ready"
          icon={CheckCircle2}
          status={availableBedsCount <= 6 ? 'warning' : 'normal'}
          trend={{ value: `${cleaningBedsCount} in cleaning`, isUpward: false, isPositive: true }}
          onClick={() => setActiveTab('bed_management')}
        />
        <KpiCard
          title="Overall Occupancy"
          value={`${overallOccupancyPercent}%`}
          subtitle="Target ceiling: 85.0%"
          icon={Layers}
          status={overallOccupancyPercent >= 85 ? 'warning' : 'normal'}
          benchmark="Threshold: 85%"
        />
        <KpiCard
          title="Waiting Queue"
          value={patientsWaitingCount}
          subtitle="Triage & boarding intake"
          icon={Activity}
          status={patientsWaitingCount > 6 ? 'warning' : 'normal'}
          onClick={() => setActiveTab('patient_flow')}
          benchmark="ESI benchmark: <5"
        />
        <KpiCard
          title="Avg Intake Dwell"
          value={`${avgWaitTimeMinutes}m`}
          subtitle="Time to initial clinician exam"
          icon={Clock}
          status={avgWaitTimeMinutes > 35 ? 'warning' : 'normal'}
          benchmark="Target: <30 mins"
        />
        <KpiCard
          title="Predicted Inflow (4h)"
          value={Math.round(predictedNext4Hours)}
          subtitle="Diurnal moving-average forecast"
          icon={TrendingUp}
          status="neutral"
          onClick={() => setActiveTab('arrival_forecasts')}
          benchmark="Peak at 16:00"
        />
        <KpiCard
          title="Active Alerts"
          value={activeAlertsCount}
          subtitle="Requiring administrative review"
          icon={AlertTriangle}
          status={activeAlertsCount > 0 ? 'critical' : 'normal'}
          onClick={() => setActiveTab('alerts_recommendations')}
          benchmark="Zero target"
        />
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department-wise Occupancy Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Unit Bed Utilization vs. Licensed Headroom
              </h3>
              <p className="text-[11px] text-slate-500">
                Occupied patient census (solid dark) vs sanitized available beds (light slate)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bed_management')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 font-mono text-[11px]"
            >
              <span>MANAGE BEDS</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any, name?: any) => [
                    `${val} beds`,
                    name === 'occupied' ? 'Occupied Census' : 'Available Inventory'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="occupied" name="Occupied Census" fill="#1e293b" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="available" name="Available Inventory" fill="#94a3b8" radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actual vs. Predicted Patient Arrivals Line Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Emergency & Inpatient Influx: Historical vs. Projected
              </h3>
              <p className="text-[11px] text-slate-500">
                Prior 5 hours actual admissions + 7-hour moving-average forecast trajectory
              </p>
            </div>
            <button
              onClick={() => setActiveTab('arrival_forecasts')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 font-mono text-[11px]"
            >
              <span>EXPAND FORECAST</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={arrivalsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Recorded Actuals"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0f172a' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Forecasted Inflow"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#d97706' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Stage Dwell Time Benchmarks & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage Dwell Times */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Workflow Stage Cycle Times vs. Clinical Benchmark
              </h3>
              <p className="text-[11px] text-slate-500">
                Departmental cycle delays compared against standard operational targets
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">MINUTES</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {stageDwellTimes.map((stg, idx) => {
              const isOver = stg.measured > stg.benchmark;
              const barWidth = Math.min(100, (stg.measured / 80) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                        {stg.unit}
                      </span>
                      <span className="font-medium text-slate-800">{stg.stage}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className={`font-bold ${isOver ? 'text-amber-700' : 'text-slate-800'}`}>
                        {stg.measured}m
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        / target {stg.benchmark}m
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-amber-600' : 'bg-slate-700'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Ledger & Audit Activity */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Central Operations Event Log
              </h3>
              <p className="text-[11px] text-slate-500">
                Real-time bed reallocations, alert sign-offs, and triage actions
              </p>
            </div>
            <button
              onClick={() => setActiveTab('alerts_recommendations')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 font-mono text-[11px]"
            >
              VIEW ALL
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLog.slice(0, 4).map((entry) => (
              <div key={entry.id} className="py-2 flex items-start gap-2.5 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 leading-snug truncate">
                    {entry.details}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span className="uppercase">{entry.userRole.replace('_', ' ')}</span>
                    <span>·</span>
                    <span>{entry.timestamp}</span>
                    {entry.targetEntityId && (
                      <>
                        <span>·</span>
                        <span className="text-slate-600 font-bold">{entry.targetEntityId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
