import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Wind, 
  Droplet, 
  ShieldAlert, 
  Volume2, 
  Eye,
  Shuffle
} from 'lucide-react';
import { getNEWS2RiskColor } from '../utils/clinicalConstants';

export default function CriticalAlertPopup({
  alert,
  patient,
  pendingRecommendation,
  onClose,
  onAcknowledge,
  onExecuteTransfer,
  onInspectPatient,
  theme
}) {
  if (!alert) return null;

  const news2 = patient?.clinical_status?.news2;
  const vitals = patient?.current_vitals;
  const riskColor = getNEWS2RiskColor(news2?.total_score || alert.news2_score, true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
        theme === 'dark' 
          ? 'bg-[#0F172A] border-rose-600/70 shadow-rose-950/50' 
          : 'bg-white border-rose-500 shadow-rose-200'
      }`}>
        
        {/* Pulsing Emergency Top Strip */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="font-extrabold text-sm tracking-wider uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
              <span>CRITICAL PATIENT DECOMPENSATION ALERT</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Patient Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  {patient?.name || alert.patient_name}
                </h3>
                <span className="text-xs font-mono text-cyan-500 font-bold">
                  ({patient?.id || alert.patient_id})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/40 font-mono font-bold">
                  {alert.bed_id} ({alert.ward})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient?.diagnosis || alert.message}
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] uppercase font-bold text-slate-400">NEWS2 Score</div>
              <div className="text-2xl font-black text-rose-500 animate-pulse">
                {news2?.total_score || alert.news2_score}
              </div>
            </div>
          </div>

          {/* Real-Time Parameter Changes Triggering Alert */}
          {vitals && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Trigger Observations:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className={`p-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="text-[10px] text-slate-500">Heart Rate</div>
                  <div className={`text-base font-bold ${vitals.heart_rate > 100 ? 'text-rose-500 animate-pulse' : ''}`}>
                    {Math.round(vitals.heart_rate)} bpm
                  </div>
                </div>

                <div className={`p-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="text-[10px] text-slate-500">Blood Pressure</div>
                  <div className={`text-base font-bold ${vitals.systolic_bp < 95 ? 'text-rose-500' : ''}`}>
                    {Math.round(vitals.systolic_bp)}/{Math.round(vitals.diastolic_bp)}
                  </div>
                </div>

                <div className={`p-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="text-[10px] text-slate-500">Oxygen SpO2</div>
                  <div className={`text-base font-bold ${vitals.spo2 < 93 ? 'text-rose-500 animate-pulse' : ''}`}>
                    {Math.round(vitals.spo2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explainable Contributing Parameters */}
          {news2?.contributions?.length > 0 && (
            <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
              theme === 'dark' ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-rose-500 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Explainable Physiological Triggers:</span>
              </div>
              {news2.contributions.slice(0, 3).map((c, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{c.parameter} ({c.measured_value}):</span>
                  <span className="font-bold text-rose-500">+{c.points} pts ({c.rationale})</span>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Bed Reallocation Proposal Card */}
          {pendingRecommendation && (
            <div className={`p-3.5 rounded-xl border space-y-2.5 ${
              theme === 'dark' 
                ? 'bg-slate-950 border-cyan-800/60 text-slate-200' 
                : 'bg-cyan-50/60 border-cyan-300 text-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Automated Bed Optimization Proposal</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-white font-bold">
                  {pendingRecommendation.urgency}
                </span>
              </div>

              <div className="text-xs">
                <strong>Recommended Care Level:</strong> Urgent transfer to{' '}
                <span className="font-bold text-cyan-600 dark:text-cyan-300">
                  {pendingRecommendation.target_bed_id} ({pendingRecommendation.target_ward})
                </span>
              </div>

              {/* Cascading step-down preview if present */}
              {pendingRecommendation.cascading_stepdown && (
                <div className={`p-2 rounded-lg border text-[11px] font-mono ${
                  theme === 'dark' ? 'bg-purple-950/30 border-purple-800/50 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}>
                  <span className="font-bold flex items-center gap-1 text-purple-600 dark:text-purple-300">
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>ICU Bottleneck Resolution (Cascading Step-Down):</span>
                  </span>
                  <span className="block mt-0.5">
                    Step down stable patient <strong>{pendingRecommendation.cascading_stepdown.source_patient_name}</strong> to{' '}
                    <strong>{pendingRecommendation.cascading_stepdown.recommended_target_bed_id}</strong> to release critical bed.
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Action Buttons */}
        <div className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAcknowledge(alert.id);
                onClose();
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Acknowledge & Silence
            </button>

            {patient && (
              <button
                onClick={() => {
                  onInspectPatient(patient);
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
                    : 'bg-white border-slate-300 text-cyan-700 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Telemetry</span>
              </button>
            )}
          </div>

          {pendingRecommendation && (
            <button
              onClick={() => {
                onExecuteTransfer(pendingRecommendation.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5 transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Bed Reallocation</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
