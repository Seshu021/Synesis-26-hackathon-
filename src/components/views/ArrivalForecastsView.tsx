import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  Info,
  Clock,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { DepartmentId } from '../../types';

export const ArrivalForecastsView: React.FC = () => {
  const {
    currentForecast,
    selectedForecastDept,
    setSelectedForecastDept,
    departments,
    capacityThresholdPercent,
    setCapacityThresholdPercent,
    beds
  } = useHospital();

  const [forecastHorizon, setForecastHorizon] = useState<number>(12);

  // Selected department details
  const currentDeptInfo = departments.find(d => d.id === selectedForecastDept);
  const deptBeds = beds.filter(b => b.departmentId === selectedForecastDept);
  const occupiedBeds = deptBeds.filter(b => b.status === 'occupied').length;

  // Chart data: Merge historical 6h + forecast points
  const combinedChartData = [
    ...currentForecast.historicalPoints.map(h => ({
      time: h.timeLabel,
      actual: h.actualArrivals,
      forecast: undefined,
      upperBound: undefined,
      lowerBound: undefined,
      occupancy: undefined,
      isHistorical: true
    })),
    ...currentForecast.forecastPoints.slice(0, forecastHorizon + 1).map(f => ({
      time: f.timeLabel,
      actual: f.actualArrivals,
      forecast: f.predictedArrivals,
      upperBound: f.upperBound,
      lowerBound: f.lowerBound,
      occupancy: f.projectedOccupancyPercent,
      isHistorical: false
    }))
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Patient Arrival Demand Forecasting
            </h1>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              STATISTICAL MODEL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            14-day rolling moving-average diurnal kernel with day-of-week seasonality coefficients
          </p>
        </div>

        {currentForecast.exceedsThreshold && (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-rose-50 border border-rose-200 text-xs font-mono font-bold text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>CAPACITY BREACH AT {currentForecast.projectedOccupancyExceedanceHour}</span>
          </div>
        )}
      </div>

      {/* Control Bar: Department Selector, Horizon, Threshold */}
      <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Department Switcher */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 uppercase">
            UNIT:
          </span>
          {departments.filter(d => d.totalBeds > 0).map((dept) => {
            const isSelected = selectedForecastDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedForecastDept(dept.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept.shortName}
              </button>
            );
          })}
        </div>

        {/* Forecast Horizon Selector & Threshold */}
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">HORIZON:</span>
            <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 font-bold">
              <button
                onClick={() => setForecastHorizon(6)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  forecastHorizon === 6 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                6H
              </button>
              <button
                onClick={() => setForecastHorizon(12)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  forecastHorizon === 12 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                12H
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">LIMIT:</span>
            <select
              value={capacityThresholdPercent}
              onChange={(e) => setCapacityThresholdPercent(Number(e.target.value))}
              className="px-2 py-1 rounded border border-slate-200 bg-white font-bold text-slate-800"
            >
              <option value={80}>80% BUFFER</option>
              <option value={85}>85% STANDARD</option>
              <option value={90}>90% SURGE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Forecasting Composed Chart */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-start justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              INFLOW PROJECTION CURVE: {currentDeptInfo?.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              Contiguous recorded arrivals + statistical forecast with 90% confidence interval
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">PROJECTED PEAK</span>
            <span className="text-xs font-bold text-slate-900">
              {currentForecast.peakArrivalCount} PTS/HR @ {currentForecast.peakArrivalHour}
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Arrivals / hr', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Occupancy %', angle: 90, position: 'insideRight', offset: 20, fontSize: 10, fill: '#94a3b8' }}
              />
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

              {/* Upper bound confidence envelope */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="upperBound"
                fill="#cbd5e1"
                fillOpacity={0.4}
                stroke="transparent"
                name="90% Confidence Band"
              />

              {/* Historical actuals */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="actual"
                name="Historical Actuals"
                stroke="#0f172a"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0f172a' }}
                connectNulls
              />

              {/* Predicted forecast line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="forecast"
                name="Forecasted Influx"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#d97706' }}
                connectNulls
              />

              {/* Projected unit occupancy % */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="occupancy"
                name="Projected Occupancy %"
                stroke="#475569"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />

              {/* Threshold line */}
              <ReferenceLine
                yAxisId="right"
                y={capacityThresholdPercent}
                stroke="#e11d48"
                strokeDasharray="3 3"
                label={{
                  value: `${capacityThresholdPercent}% Threshold`,
                  position: 'insideTopRight',
                  fill: '#e11d48',
                  fontSize: 10
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Forecast Breakdown Table & Algorithm Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Table */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between font-mono text-xs">
            <h4 className="font-bold text-slate-900 uppercase">
              HOURLY PREDICTION SCHEDULE (T+1 TO T+{forecastHorizon})
            </h4>
            <span className="text-slate-500">
              LICENSED BEDS: {deptBeds.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-3.5 py-2">HOUR</th>
                  <th className="px-3.5 py-2">PREDICTED</th>
                  <th className="px-3.5 py-2">90% INTERVAL</th>
                  <th className="px-3.5 py-2">PROJECTED OCCUPANCY</th>
                  <th className="px-3.5 py-2 text-right">CAPACITY BUFFER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {currentForecast.forecastPoints.slice(0, forecastHorizon).map((f) => (
                  <tr key={f.timeLabel} className="hover:bg-slate-50/60 font-mono text-xs">
                    <td className="px-3.5 py-2 font-bold text-slate-800">
                      {f.timeLabel}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-amber-800">
                      {f.predictedArrivals} pts
                    </td>
                    <td className="px-3.5 py-2 text-slate-500 text-[11px]">
                      {f.lowerBound} – {f.upperBound}
                    </td>
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {f.projectedOccupancyPercent}%
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              f.riskOfCapacityExceedance ? 'bg-rose-600' : 'bg-slate-700'
                            }`}
                            style={{ width: `${Math.min(100, f.projectedOccupancyPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      {f.riskOfCapacityExceedance ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          BREACH RISK
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Algorithm Factors Card */}
        <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs space-y-3 font-sans">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              MODEL WEIGHT ATTRIBUTIONS
            </h4>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <div className="font-mono text-[11px] text-slate-700">
              METHOD: <span className="font-bold text-slate-900">{currentForecast.algorithmExplanation.baseMethod}</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {currentForecast.algorithmExplanation.contributingFactors.map((factor, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700">
                  {factor}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
              Notice: Operational estimate based on synthetic hospital dataset for administrative resource planning.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
