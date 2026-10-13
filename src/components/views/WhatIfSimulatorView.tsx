import React from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';

export const WhatIfSimulatorView: React.FC = () => {
  const {
    simulationParams,
    setSimulationParams,
    simulationResult,
    runSimulation,
    resetSimulation
  } = useHospital();

  const { baseline, projected, deltas, keyDrivers, suggestedMitigations } = simulationResult;

  // Comparison chart data
  const comparisonChartData = [
    {
      metric: 'Overall Occupancy %',
      baseline: baseline.overallOccupancyPercent,
      projected: projected.overallOccupancyPercent
    },
    {
      metric: 'ED Wait Time (m)',
      baseline: baseline.edWaitTimeMinutes,
      projected: projected.edWaitTimeMinutes
    },
    {
      metric: 'ICU Saturation %',
      baseline: baseline.icuOccupancyPercent,
      projected: projected.icuOccupancyPercent
    },
    {
      metric: 'Bottleneck Count',
      baseline: baseline.bottleneckCount * 10, // scaled for chart visualization
      projected: projected.bottleneckCount * 10
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Interactive What-If Scenario Simulator
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Key Differentiator
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Stress-test hospital flow under arrival surges, bed closures, staffing shifts, and discharge bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={runSimulation}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Interactive Sliders Control Panel */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Operational Variable Modifiers
          </h3>
          <span className="text-[11px] text-slate-500">
            Adjust sliders then click Run Simulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Expected Patient Arrivals */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">1. Patient Arrival Surge:</span>
              <span className="font-bold text-blue-700 font-mono">
                {simulationParams.arrivalSurgePercent > 0 ? '+' : ''}{simulationParams.arrivalSurgePercent}%
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={50}
              step={5}
              value={simulationParams.arrivalSurgePercent}
              onChange={(e) => setSimulationParams(p => ({ ...p, arrivalSurgePercent: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-30% Drop</span>
              <span>Baseline (0%)</span>
              <span>+50% Mass Influx</span>
            </div>
          </div>

          {/* 2. Number of Available Beds Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">2. Available Beds Shift:</span>
              <span className="font-bold text-blue-700 font-mono">
                {simulationParams.availableBedsDelta > 0 ? '+' : ''}{simulationParams.availableBedsDelta} beds
              </span>
            </div>
            <input
              type="range"
              min={-8}
              max={8}
              step={1}
              value={simulationParams.availableBedsDelta}
              onChange={(e) => setSimulationParams(p => ({ ...p, availableBedsDelta: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-8 Beds Closed</span>
              <span>Baseline (0)</span>
              <span>+8 Surge Beds</span>
            </div>
          </div>

          {/* 3. Staff Availability Ratio */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">3. Nursing / Staff Coverage:</span>
              <span className="font-bold text-blue-700 font-mono">
                {simulationParams.staffingRatioPercent}%
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={130}
              step={5}
              value={simulationParams.staffingRatioPercent}
              onChange={(e) => setSimulationParams(p => ({ ...p, staffingRatioPercent: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>70% Deficit</span>
              <span>100% Target</span>
              <span>130% Overtime</span>
            </div>
          </div>

          {/* 4. Diagnostic Equipment Uptime */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">4. Diagnostic Scanner Uptime:</span>
              <span className="font-bold text-blue-700 font-mono">
                {simulationParams.equipmentUptimePercent}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={simulationParams.equipmentUptimePercent}
              onChange={(e) => setSimulationParams(p => ({ ...p, equipmentUptimePercent: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50% Degradation</span>
              <span>85% Current</span>
              <span>100% Full Fleet</span>
            </div>
          </div>

          {/* 5. Discharge Throughput Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">5. Discharge Turnover Velocity:</span>
              <span className="font-bold text-blue-700 font-mono">
                {simulationParams.dischargeThroughputMultiplier}x
              </span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.5}
              step={0.1}
              value={simulationParams.dischargeThroughputMultiplier}
              onChange={(e) => setSimulationParams(p => ({ ...p, dischargeThroughputMultiplier: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.7x Discharge Lag</span>
              <span>1.0x Baseline</span>
              <span>1.5x Accelerated</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col justify-end space-y-2">
            <span className="text-[11px] font-medium text-slate-500">Quick Scenario Presets:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSimulationParams({
                    arrivalSurgePercent: 20,
                    availableBedsDelta: -2,
                    staffingRatioPercent: 90,
                    equipmentUptimePercent: 80,
                    dischargeThroughputMultiplier: 0.9
                  });
                  setTimeout(runSimulation, 50);
                }}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors"
              >
                +20% Surge & -2 Beds
              </button>
              <button
                onClick={() => {
                  setSimulationParams({
                    arrivalSurgePercent: 0,
                    availableBedsDelta: 4,
                    staffingRatioPercent: 110,
                    equipmentUptimePercent: 100,
                    dischargeThroughputMultiplier: 1.3
                  });
                  setTimeout(runSimulation, 50);
                }}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors"
              >
                Optimized Discharge
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Occupancy Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Overall Occupancy</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              deltas.occupancyDeltaPercent > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {deltas.occupancyDeltaPercent > 0 ? `+${deltas.occupancyDeltaPercent}%` : `${deltas.occupancyDeltaPercent}%`}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Baseline</span>
              <span className="text-lg font-bold text-slate-700">
                {baseline.overallOccupancyPercent}%
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Projected</span>
              <span className={`text-xl font-bold ${
                projected.overallOccupancyPercent >= 88 ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {projected.overallOccupancyPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* ED Wait Time Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">ED Wait Time</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              deltas.waitTimeDeltaMinutes > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {deltas.waitTimeDeltaMinutes > 0 ? `+${deltas.waitTimeDeltaMinutes}m` : `${deltas.waitTimeDeltaMinutes}m`}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Baseline</span>
              <span className="text-lg font-bold text-slate-700">
                {baseline.edWaitTimeMinutes}m
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Projected</span>
              <span className={`text-xl font-bold ${
                projected.edWaitTimeMinutes >= 45 ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {projected.edWaitTimeMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* ICU Saturation Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">ICU Saturation</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              deltas.icuDeltaPercent > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {deltas.icuDeltaPercent > 0 ? `+${deltas.icuDeltaPercent}%` : `${deltas.icuDeltaPercent}%`}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Baseline</span>
              <span className="text-lg font-bold text-slate-700">
                {baseline.icuOccupancyPercent}%
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Projected</span>
              <span className={`text-xl font-bold ${
                projected.icuOccupancyPercent >= 88 ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {projected.icuOccupancyPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottleneck Count Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Bottlenecks</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
              Severity Score
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-slate-500 block">Baseline</span>
              <span className="text-lg font-bold text-slate-700">
                {baseline.bottleneckCount}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Projected</span>
              <span className={`text-xl font-bold ${
                projected.bottleneckCount > baseline.bottleneckCount ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {projected.bottleneckCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart & Key Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Baseline vs. Simulated Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Baseline vs. Simulated Performance Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Direct visual delta across capacity, dwell time, and chokepoints
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="baseline" name="Current Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projected" name="Simulated Scenario" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Drivers & Suggested Mitigations */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Scenario Attribution & Recommended Interventions
            </h3>
            <p className="text-xs text-slate-500">
              Why the metrics shifted and what clinical administrators should do
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Drivers */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
                Primary Causal Drivers:
              </span>
              {keyDrivers.map((driver, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-blue-600">•</span>
                  <span>{driver}</span>
                </div>
              ))}
            </div>

            {/* Mitigations */}
            <div className="space-y-1.5 pt-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
                Suggested Operational Mitigations:
              </span>
              {suggestedMitigations.map((mit, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-900 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>{mit}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic">
              Notice: Scenario outputs are mathematically projected approximations. Intended for contingency planning.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
