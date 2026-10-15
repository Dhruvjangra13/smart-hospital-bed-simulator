import React from 'react';
import { X, Play, RotateCcw, CheckCircle, Clock, Zap, Target, ShieldCheck, Flame, Wind, Droplet } from 'lucide-react';
import { wsService } from '../services/websocket';

export default function ValidationScenarioModal({ isOpen, onClose, hospitalState }) {
  if (!isOpen) return null;

  const handleReplay = (scenarioKey) => {
    wsService.send({
      type: "REPLAY_SCENARIO",
      scenario_key: scenarioKey
    });
  };

  const kpis = hospitalState?.kpis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Impact, Validation & Benchmark Scenario Replay
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Slide 09 Evaluation Framework • Verification Metrics
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* 3 Impact Metrics Cards from Slide 09 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detection</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                &lt; 400 ms
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Time from simulated vitals degradation to visible alert trigger on ward dashboard.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operations</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                100% Fit
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Adherence to care tier, isolation protocol, and required equipment constraints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usability</span>
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                100% Explainable
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Every alert exposes physiological parameter deltas and rationale. Zero black-box outputs.
              </p>
            </div>

          </div>

          {/* Benchmark Scenario Replays */}
          <div className="space-y-3 pt-2">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Benchmark Clinical Scenarios (Slide 09 Validation Replays)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any benchmark to inject repeatable clinical trajectories across the 24-patient cohort.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <button
                onClick={() => handleReplay('sepsis_progression')}
                className="p-3 rounded-xl border border-orange-700/50 bg-gradient-to-r from-orange-950/30 to-slate-900 hover:from-orange-900/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-orange-300 text-xs flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Scenario 1: Sepsis Progression (SIM-104)</span>
                  </span>
                  <Play className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulates post-op decompensation: HR ↑ 124, BP ↓ 88/52, RR ↑ 26. Triggers NEWS2 18 and cascading step-down recommendation.
                </p>
              </button>

              <button
                onClick={() => handleReplay('ards_collapse')}
                className="p-3 rounded-xl border border-cyan-700/50 bg-gradient-to-r from-cyan-950/30 to-slate-900 hover:from-cyan-900/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>Scenario 2: Sudden ARDS (SIM-117)</span>
                  </span>
                  <Play className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Severe hypoxemic collapse in pneumonia patient requiring Airborne Isolation: SpO2 ↓ 84%, RR ↑ 34. Matches isolation bed ICU-04.
                </p>
              </button>

              <button
                onClick={() => handleReplay('hemorrhagic_shock')}
                className="p-3 rounded-xl border border-rose-700/50 bg-gradient-to-r from-rose-950/30 to-slate-900 hover:from-rose-900/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-rose-400" />
                    <span>Scenario 3: Post-Op Hemorrhage (SIM-121)</span>
                  </span>
                  <Play className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Occult bleeding with shock index spike: HR ↑ 135, SBP ↓ 74 mmHg (SI: 1.82). Triggers urgent step-up to HDU.
                </p>
              </button>

              <button
                onClick={() => handleReplay('baseline_stable')}
                className="p-3 rounded-xl border border-emerald-700/50 bg-gradient-to-r from-emerald-950/30 to-slate-900 hover:from-emerald-900/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>Scenario 4: Baseline Steady State</span>
                  </span>
                  <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Resets all 24 patients to stable physiological baselines with normal ward monitoring intervals.
                </p>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>Validation Mode: Real-time telemetry benchmark engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}
