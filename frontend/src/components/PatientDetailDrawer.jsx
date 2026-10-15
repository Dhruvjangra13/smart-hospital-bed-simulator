import React from 'react';
import { 
  X, 
  Activity, 
  Heart, 
  Droplet, 
  Wind, 
  Thermometer, 
  Zap, 
  ShieldAlert, 
  Clock, 
  User, 
  FileText,
  AlertTriangle,
  TrendingUp,
  Brain
} from 'lucide-react';
import { getNEWS2RiskColor, getShockIndexColor } from '../utils/clinicalConstants';

export default function PatientDetailDrawer({
  patient,
  onClose,
  onOpenDegradeModal
}) {
  if (!patient) return null;

  const vitals = patient.current_vitals;
  const history = patient.vitals_history || [];
  const news2 = patient.clinical_status.news2;
  const shockIndex = patient.clinical_status.shock_index;
  const qsofa = patient.clinical_status.qsofa_score;
  const anomalyScore = patient.clinical_status.anomaly_score;
  const trend = patient.clinical_status.deterioration_trend;
  const prob1h = patient.clinical_status.deterioration_probability_1h;

  const riskColor = getNEWS2RiskColor(news2.total_score, news2.has_red_score);
  const shockColor = getShockIndexColor(shockIndex);

  // Simple SVG Trend Line Generator for vitals history
  const renderTrendSvg = (dataKey, minVal, maxVal, strokeColor) => {
    if (history.length < 2) return null;
    const width = 280;
    const height = 48;
    const points = history.map((item, idx) => {
      const val = item[dataKey] || minVal;
      const x = (idx / (history.length - 1)) * width;
      const normalized = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
      const y = height - (normalized * (height - 10) + 5);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-12 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Draw subtle end pulse dot */}
        {points && (
          <circle
            cx={points.split(' ').pop().split(',')[0]}
            cy={points.split(' ').pop().split(',')[1]}
            r="3.5"
            fill={strokeColor}
            className="animate-ping"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0F172A] border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{patient.name}</h3>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${riskColor.badge}`}>
                  NEWS2: {news2.total_score}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {patient.gender}, {patient.age}y • MRN: {patient.mrn} • {patient.current_ward} ({patient.current_bed_id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Clinical Admission Banner */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <strong>Admission Diagnosis:</strong>
              </span>
              <span className="text-slate-500 font-mono">Admitted: {patient.admission_date}</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">
              {patient.diagnosis}
            </p>
            {patient.comorbidities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {patient.comorbidities.map((c, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* REAL-TIME TELEMETRY WAVEFORM GRAPHS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Continuous Telemetry Waveforms (Last 30 Readings)</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● Live Stream</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HR Graph */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Heart Rate</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(vitals.heart_rate)} bpm</span>
                </div>
                {renderTrendSvg('heart_rate', 40, 160, '#F43F5E')}
              </div>

              {/* SBP Graph */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-400" />
                    <span>Systolic BP</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(vitals.systolic_bp)} mmHg</span>
                </div>
                {renderTrendSvg('systolic_bp', 60, 180, '#38BDF8')}
              </div>

              {/* SpO2 Graph */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SpO2 Oxygen</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(vitals.spo2)}%</span>
                </div>
                {renderTrendSvg('spo2', 75, 100, '#2DD4BF')}
              </div>

              {/* RR Graph */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Resp Rate</span>
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(vitals.respiration_rate)} /m</span>
                </div>
                {renderTrendSvg('respiration_rate', 8, 40, '#F59E0B')}
              </div>
            </div>
          </div>

          {/* ADVANCED SEPSIS & ANOMALY RADAR */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>NumPy Decompensation Analytics & Sepsis Risk</span>
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Shock Index</div>
                <div className={`text-base font-bold ${shockColor.text}`}>
                  {shockIndex.toFixed(2)}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">{shockColor.label}</div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">qSOFA Sepsis</div>
                <div className={`text-base font-bold ${qsofa >= 2 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {qsofa} / 3
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  {qsofa >= 2 ? 'High Sepsis Risk' : 'Low Sepsis Risk'}
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">1-Hr Decomp. Prob</div>
                <div className="text-base font-bold text-amber-400">
                  {Math.round(prob1h * 100)}%
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">{trend}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <strong className="text-slate-200">Trajectory Momentum:</strong> Telemetry anomaly velocity index is {anomalyScore.toFixed(3)}. Patient is classified as <strong className="text-cyan-300">{trend}</strong>.
            </div>
          </div>

          {/* NEWS2 RUBRIC BREAKDOWN TABLE */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Full NEWS2 Parameter Breakdown
              </h4>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${riskColor.badge}`}>
                {riskColor.label}
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Respiration Rate ({Math.round(vitals.respiration_rate)}/min)</span>
                <span className="font-mono font-bold text-slate-200">+{news2.rr_score}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">SpO2 Oxygen Saturation ({Math.round(vitals.spo2)}%)</span>
                <span className="font-mono font-bold text-slate-200">+{news2.spo2_score}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Supplemental Oxygen ({vitals.on_supplemental_oxygen ? 'Yes' : 'Air'})</span>
                <span className="font-mono font-bold text-slate-200">+{news2.o2_score}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Systolic Blood Pressure ({Math.round(vitals.systolic_bp)} mmHg)</span>
                <span className="font-mono font-bold text-slate-200">+{news2.sbp_score}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Pulse Heart Rate ({Math.round(vitals.heart_rate)} bpm)</span>
                <span className="font-mono font-bold text-slate-200">+{news2.hr_score}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Consciousness Level ({vitals.consciousness})</span>
                <span className="font-mono font-bold text-slate-200">+{news2.consciousness_score}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Body Temperature ({vitals.temperature.toFixed(1)}°C)</span>
                <span className="font-mono font-bold text-slate-200">+{news2.temp_score}</span>
              </div>
              <div className="pt-2 flex justify-between text-sm font-bold">
                <span className="text-slate-200">Cumulative Total Score:</span>
                <span className="text-cyan-400 font-mono">{news2.total_score}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={() => onOpenDegradeModal(patient.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Launch Degradation Slider for {patient.name.split(' ')[0]}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
