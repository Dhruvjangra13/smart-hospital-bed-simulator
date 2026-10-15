import React from 'react';
import { Zap, Eye, AlertTriangle } from 'lucide-react';
import { getNEWS2RiskColor } from '../utils/clinicalConstants';

export default function CensusTableView({
  patients,
  onSelectPatient,
  onOpenDegradeModal
}) {
  if (!patients) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xl transition-colors duration-200">
      {/* Header bar matching Slide 07 */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-white tracking-wider uppercase">
            Ward Overview / Simulation Live
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/50">
            Slide 07 Census Table
          </span>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Total Cohort: {patients.length} Monitored Patients
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-3">Risk Band</th>
              <th className="py-3 px-3">Trend Signal</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-3">Location / Bed</th>
              <th className="py-3 px-4">Live Telemetry</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
            {patients.map((p) => {
              const news2 = p.clinical_status.news2;
              const riskColor = getNEWS2RiskColor(news2.total_score, news2.has_red_score);
              const trend = p.clinical_status.trend_signals.trend_symbol;
              const action = p.clinical_status.recommended_action;
              const vitals = p.current_vitals;

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
                    news2.risk_level === 'HIGH' ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''
                  }`}
                >
                  {/* Patient ID & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{p.id}</span>
                      <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[150px]">{p.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{p.diagnosis}</div>
                  </td>

                  {/* Risk Band */}
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${riskColor.badge}`}>
                      {news2.risk_level} ({news2.total_score})
                    </span>
                  </td>

                  {/* Trend Signal */}
                  <td className="py-3 px-3 font-mono">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      trend.includes('worsening') ? 'text-rose-600 dark:text-rose-400' :
                      trend.includes('rising') ? 'text-amber-600 dark:text-amber-400' :
                      trend.includes('improving') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {trend}
                    </span>
                  </td>

                  {/* Recommended Action */}
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      action === 'Urgent clinical review' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 animate-pulse' :
                      action === 'Repeat observations' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60' :
                      'text-slate-700 dark:text-slate-300'
                    }`}>
                      {action}
                    </span>
                  </td>

                  {/* Location / Bed */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="font-bold">{p.current_bed_id}</div>
                    <div className="text-[10px] text-slate-500">{p.current_ward}</div>
                  </td>

                  {/* Live Telemetry */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span>HR: <strong className={vitals.heart_rate > 100 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}>{Math.round(vitals.heart_rate)}</strong></span>
                      <span>BP: <strong>{Math.round(vitals.systolic_bp)}/{Math.round(vitals.diastolic_bp)}</strong></span>
                      <span>SpO2: <strong className={vitals.spo2 < 93 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}>{Math.round(vitals.spo2)}%</strong></span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenDegradeModal(p.id)}
                        className="p-1 px-2 rounded bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm"
                        title="Simulate vitals degradation"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Degrade</span>
                      </button>

                      <button
                        onClick={() => onSelectPatient(p)}
                        className="p-1 px-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-colors"
                        title="Inspect telemetry"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
