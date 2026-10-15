import React from 'react';
import { 
  Radar, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Flame
} from 'lucide-react';
import { getNEWS2RiskColor, getShockIndexColor } from '../utils/clinicalConstants';

export default function DeteriorationRadar({
  patients,
  onSelectPatient,
  onOpenDegradeModal
}) {
  if (!patients) return null;

  // Find top at-risk patients
  const sortedPatients = [...patients].sort((a, b) => {
    return b.clinical_status.news2.total_score - a.clinical_status.news2.total_score;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Clinical Deterioration Matrix & Sepsis Anomaly Radar</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Multi-dimensional risk mapping combining Royal College NEWS2 severity against occult Shock Index and NumPy anomaly momentum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2D RISK MATRIX PLOT */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2D Clinical Risk Matrix (NEWS2 vs Shock Index)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Interactive Patient Scatter Map
            </span>
          </div>

          {/* Scatter Plot Box */}
          <div className="relative w-full h-80 bg-slate-950/80 rounded-xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden">
            
            {/* Quadrant Background Shading */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-25 pointer-events-none">
              <div className="border-r border-b border-slate-800 bg-amber-950/20"></div>
              <div className="border-b border-slate-800 bg-rose-950/40"></div>
              <div className="border-r border-slate-800 bg-emerald-950/10"></div>
              <div className="bg-orange-950/20"></div>
            </div>

            {/* Labels for Quadrants */}
            <div className="absolute top-3 left-4 text-[10px] font-mono text-amber-400/80 uppercase">
              Occult Hypoperfusion / Shock
            </div>
            <div className="absolute top-3 right-4 text-[10px] font-mono text-rose-400 font-bold uppercase animate-pulse">
              🚨 Danger Zone (ICU Step-Up)
            </div>
            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-emerald-400/70 uppercase">
              Stable Ward Care
            </div>
            <div className="absolute bottom-3 right-4 text-[10px] font-mono text-orange-400/80 uppercase">
              Elevated Respiratory Risk
            </div>

            {/* Center Grid Lines */}
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-700/50"></div>
            <div className="absolute inset-y-0 left-1/2 border-r border-slate-700/50"></div>

            {/* Patients Plotted as Points */}
            <div className="relative w-full h-full">
              {patients.map((p) => {
                const score = p.clinical_status.news2.total_score;
                const si = p.clinical_status.shock_index;

                // Normalize:
                // NEWS2 range: 0 to 18 (X axis: 5% to 95%)
                // Shock index: 0.4 to 1.5 (Y axis: bottom to top)
                const xPercent = Math.min(92, Math.max(8, (score / 15) * 85 + 8));
                const yPercent = Math.min(92, Math.max(8, ((si - 0.4) / 1.1) * 85 + 8));

                const isCritical = score >= 7 || si > 1.0;
                const isMedium = score >= 5 || si > 0.85;

                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPatient(p)}
                    style={{
                      left: `${xPercent}%`,
                      bottom: `${yPercent}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                    className={`absolute group p-1.5 rounded-full transition-transform hover:scale-125 focus:outline-none z-10 ${
                      isCritical
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 ring-2 ring-rose-400 animate-pulse'
                        : isMedium
                        ? 'bg-orange-500 text-slate-900 shadow-md ring-1 ring-orange-300'
                        : 'bg-emerald-600 text-white shadow-sm'
                    }`}
                    title={`${p.name}: NEWS2 ${score}, SI ${si.toFixed(2)}`}
                  >
                    <span className="text-[10px] font-bold font-mono px-1">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </span>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-white text-[10px] p-2 rounded-lg shadow-xl w-36 pointer-events-none z-30 font-mono">
                      <span className="font-bold truncate text-cyan-300">{p.name}</span>
                      <span>Bed: {p.current_bed_id} ({p.current_ward})</span>
                      <span>NEWS2: {score} • SI: {si.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Axis Titles */}
            <div className="absolute -bottom-1 right-2 text-[10px] text-slate-500 font-mono">
              NEWS2 Score →
            </div>
            <div className="absolute top-2 -left-1 text-[10px] text-slate-500 font-mono rotate-90 origin-bottom-left">
              Shock Index (HR/SBP) →
            </div>
          </div>
        </div>

        {/* PRIORITY CLINICAL TRIAGE QUEUE */}
        <div className="lg:col-span-5 bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Acute Deterioration Triage Stack
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Sorted by Decompensation Risk
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Patients exhibiting acute decompensation velocity requiring clinical intervention.
            </p>

            <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
              {sortedPatients.slice(0, 6).map((patient) => {
                const score = patient.clinical_status.news2.total_score;
                const hasRed = patient.clinical_status.news2.has_red_score;
                const riskColor = getNEWS2RiskColor(score, hasRed);
                const si = patient.clinical_status.shock_index;
                const isDegraded = patient.is_synthetic_degraded;

                return (
                  <div
                    key={patient.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {patient.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {patient.current_bed_id}
                        </span>
                        {isDegraded && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                            Degraded
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {patient.diagnosis}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right font-mono">
                        <div className={`text-xs font-bold ${riskColor.text}`}>
                          NEWS2: {score}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          SI: {si.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Inspect telemetry"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onOpenDegradeModal('P-101')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Simulate Sepsis Decompensation on Top Ward Patient</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
