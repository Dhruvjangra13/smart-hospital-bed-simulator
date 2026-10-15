import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Flame, 
  Wind, 
  Droplet, 
  Heart, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { wsService } from '../services/websocket';
import { audioAlerts } from '../services/AudioAlertService';
import { getNEWS2RiskColor, getShockIndexColor } from '../utils/clinicalConstants';

export default function DegradationSliderModal({
  isOpen,
  onClose,
  patients,
  initialPatientId,
  hospitalState,
  onExecuteTransfer
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || 'SIM-104');
  const [sliderValue, setSliderValue] = useState(0);
  const [activeScenario, setActiveScenario] = useState('Silent Sepsis');

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  const currentPatient = React.useMemo(() => {
    return patients?.find(p => p.id === selectedPatientId) || patients?.[0] || null;
  }, [patients, selectedPatientId]);

  useEffect(() => {
    if (currentPatient) {
      setSliderValue(currentPatient.degradation_slider_value || 0);
      if (currentPatient.degradation_scenario) {
        setActiveScenario(currentPatient.degradation_scenario);
      }
    }
  }, [currentPatient?.id]);

  if (!isOpen || !currentPatient) return null;

  const vitals = currentPatient.current_vitals;
  const news2 = currentPatient.clinical_status.news2;
  const shockIndex = currentPatient.clinical_status.shock_index;
  const riskColor = getNEWS2RiskColor(news2.total_score, news2.has_red_score);
  const shockColor = getShockIndexColor(shockIndex);

  const pendingRec = hospitalState?.recommendations?.find(
    r => r.patient_id === currentPatient.id && r.status === 'PENDING'
  );

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val);
    wsService.sendSliderUpdate(selectedPatientId, val, activeScenario);

    if (val >= 60) {
      audioAlerts.playEmergencyAlarm();
    } else if (val >= 30) {
      audioAlerts.playWarningChime();
    }
  };

  const handleApplyPreset = (scenarioName, targetSliderVal) => {
    setActiveScenario(scenarioName);
    setSliderValue(targetSliderVal);
    wsService.sendSliderUpdate(selectedPatientId, targetSliderVal, scenarioName);

    if (targetSliderVal >= 60) {
      audioAlerts.playEmergencyAlarm();
    } else if (targetSliderVal === 0) {
      audioAlerts.playSuccessChime();
    }
  };

  const handlePatientSelect = (pId) => {
    setSelectedPatientId(pId);
    const p = patients.find(x => x.id === pId);
    if (p) {
      setSliderValue(p.degradation_slider_value || 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header adhering to Slide 04 */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Zap className="w-5 h-5 text-white fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase font-bold">
                  04 / THE WOW FACTOR
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Deterioration Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                One slider. A visible chain reaction.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Slide 04 3-STEP VISIBLE CHAIN REACTION TRACKER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <div className={`p-2.5 rounded-lg border transition-all ${
              sliderValue > 0 ? 'bg-cyan-950/40 border-cyan-600/50 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-cyan-400">
                <span className="w-4 h-4 rounded-full bg-cyan-900 flex items-center justify-center text-[10px]">1</span>
                <span>VITALS SHIFT</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                HR rises • RR rises • BP / SpO2 trend worsens
              </p>
            </div>

            <div className={`p-2.5 rounded-lg border transition-all ${
              news2.total_score >= 5 ? 'bg-orange-950/40 border-orange-600/50 text-orange-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-orange-400">
                <span className="w-4 h-4 rounded-full bg-orange-950 flex items-center justify-center text-[10px]">2</span>
                <span>ALERT FIRES</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                Risk band changes & reason displayed
              </p>
            </div>

            <div className={`p-2.5 rounded-lg border transition-all ${
              pendingRec ? 'bg-rose-950/40 border-rose-600/50 text-rose-200 animate-pulse' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <span className="w-4 h-4 rounded-full bg-rose-950 flex items-center justify-center text-[10px]">3</span>
                <span>BED PLAN UPDATES</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                Suggested escalation & candidate beds refresh
              </p>
            </div>
          </div>

          {/* Target Patient Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="bg-slate-900 text-slate-100 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                {patients?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.name} ({p.current_ward} • Bed {p.current_bed_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>Diagnosis: <strong className="text-slate-200">{currentPatient.diagnosis}</strong></span>
              <span>•</span>
              <span>Isolation: <strong className="text-cyan-400">{currentPatient.isolation_needed}</strong></span>
            </div>
          </div>

          {/* THE INTERACTIVE SLIDER (STABLE -> DETERIORATING) */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Deterioration Intensity</span>
                </label>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                  <span className="text-emerald-400 font-bold">STABLE</span>
                  <span>────────────────►</span>
                  <span className="text-rose-400 font-bold">DETERIORATING</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className={`text-xl font-extrabold px-3 py-1 rounded-lg border ${
                  sliderValue >= 70 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' :
                  sliderValue >= 35 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {Math.round(sliderValue)}%
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-3.5 rounded-lg appearance-none cursor-pointer accent-white transition-all"
              style={{
                background: 'linear-gradient(to right, #10B981 0%, #F59E0B 35%, #F97316 60%, #EF4444 85%, #991B1B 100%)',
              }}
            />

            {/* Presets */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">One-Click Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleApplyPreset('Silent Sepsis', 75)}
                  className="px-2.5 py-1.5 rounded-lg bg-orange-950/60 border border-orange-700/60 text-orange-200 text-xs font-medium hover:bg-orange-900/60 transition-colors flex items-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Silent Sepsis (75%)</span>
                </button>

                <button
                  onClick={() => handleApplyPreset('Sudden ARDS', 80)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-200 text-xs font-medium hover:bg-cyan-900/60 transition-colors flex items-center gap-1"
                >
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sudden ARDS (80%)</span>
                </button>

                <button
                  onClick={() => handleApplyPreset('Post-Op Hemorrhage', 85)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs font-medium hover:bg-rose-900/60 transition-colors flex items-center gap-1"
                >
                  <Droplet className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hemorrhage (85%)</span>
                </button>

                <button
                  onClick={() => handleApplyPreset('Normal', 0)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs font-medium hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset (0%)</span>
                </button>
              </div>
            </div>
          </div>

          {/* REAL-TIME CHAIN REACTION: LIVE TELEMETRY & EXPLAINABLE CONTRIBUTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Vitals Telemetry Reaction */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Measured Vitals Response
              </span>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Heart Rate</div>
                  <div className={`text-base font-bold ${vitals.heart_rate > 100 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                    {Math.round(vitals.heart_rate)} bpm
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Blood Pressure</div>
                  <div className={`text-base font-bold ${vitals.systolic_bp < 95 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {Math.round(vitals.systolic_bp)}/{Math.round(vitals.diastolic_bp)}
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Oxygen (SpO2)</div>
                  <div className={`text-base font-bold ${vitals.spo2 < 93 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                    {Math.round(vitals.spo2)}%
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Resp Rate</div>
                  <div className={`text-base font-bold ${vitals.respiration_rate > 24 ? 'text-orange-400' : 'text-slate-100'}`}>
                    {Math.round(vitals.respiration_rate)} /m
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Temperature</div>
                  <div className="text-base font-bold text-slate-100">
                    {vitals.temperature.toFixed(1)}°C
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Shock Index</div>
                  <div className={`text-base font-bold ${shockColor.text}`}>
                    {shockIndex.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable Alert Breakdown adhering to Slide 05 */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Explainable Alert & NEWS2 Trigger
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${riskColor.badge}`}>
                  {news2.risk_level}: {news2.total_score} pts
                </span>
              </div>

              {news2.contributions.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">
                  All physiological parameters within baseline reference ranges (0 points).
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {news2.contributions.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
                      <span className="text-slate-300">{c.parameter} ({c.measured_value})</span>
                      <span className="text-rose-400 font-bold">+{c.points} pts</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                Trend: <strong className="text-cyan-300">{currentPatient.clinical_status.trend_signals.trend_symbol}</strong> • Action: <strong className="text-slate-200">{currentPatient.clinical_status.recommended_action}</strong>
              </div>
            </div>

          </div>

          {/* STEP 3: BED PLAN REFRESH & RECOMMENDATION */}
          {pendingRec ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-rose-950/50 border border-rose-500/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    3. Bed Plan Updates & Candidate Beds Refresh
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                  {pendingRec.urgency}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {pendingRec.clinical_rationale}
              </p>

              {/* Ranked Options Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {pendingRec.ranked_options.map((opt) => (
                  <div key={opt.bed_id} className="p-2 rounded bg-slate-900/90 border border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-cyan-300">Option {opt.rank}: Bed {opt.bed_id}</span>
                      <div className="text-[10px] text-slate-400">{opt.fit_rationale}</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">{opt.match_score}% Fit</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] text-slate-400 italic">
                  {pendingRec.human_in_the_loop_disclaimer}
                </div>

                <button
                  onClick={() => {
                    onExecuteTransfer(pendingRec.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Bed Plan with Bed Manager</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-center text-xs text-slate-400">
              Vitals stable. Bed plan steady-state. Slide &gt; 50% to trigger acute bed reallocation proposal.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors">
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
}
