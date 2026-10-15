import React from 'react';
import { X, Cpu, ArrowRight, Activity, ShieldAlert, Bed, RefreshCw } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                System Architecture: One Twin. Two Decision Loops.
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Slide 02 & 03 Dual-Loop Decision Engine
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* 3 Step Loop from Slide 02 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-800/50 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">1</span>
                <span>SENSE</span>
              </div>
              <p className="text-slate-300">
                Stream synthetic vital signs and bed-state events into one unified live ward telemetry view.
              </p>
              <div className="text-[10px] font-mono text-cyan-400/80 pt-1 border-t border-slate-800">
                HR, BP, SpO2, RR, Temp, ACVPU
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-orange-800/50 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-orange-950 border border-orange-700 flex items-center justify-center text-xs">2</span>
                <span>ASSESS</span>
              </div>
              <p className="text-slate-300">
                Calculate a transparent NEWS2-inspired score, rate of change, repeated abnormal values, and shock index.
              </p>
              <div className="text-[10px] font-mono text-orange-400/80 pt-1 border-t border-slate-800">
                RCP 7-Param Rubric + Trend Velocity
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-800/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-xs">3</span>
                <span>COORDINATE</span>
              </div>
              <p className="text-slate-300">
                Suggest review priority and feasible bed options based on care level, isolation needs, and specialty constraints.
              </p>
              <div className="text-[10px] font-mono text-emerald-400/80 pt-1 border-t border-slate-800">
                Ranked Options & Cascading Step-Down
              </div>
            </div>

          </div>

          {/* Architecture Pipeline Flow from Slide 03 */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Slide 03 End-to-End Pipeline
            </h4>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-full sm:w-auto">
                <strong className="text-cyan-300 block">SYNTHETIC FEED</strong>
                <span className="text-[10px] text-slate-400">Vitals + Bed Events</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-full sm:w-auto">
                <strong className="text-purple-300 block">PYTHON ENGINE</strong>
                <span className="text-[10px] text-slate-400">Pandas / NumPy</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-full sm:w-auto">
                <strong className="text-orange-300 block">RISK SERVICE</strong>
                <span className="text-[10px] text-slate-400">Score + Trend Flags</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-full sm:w-auto">
                <strong className="text-emerald-300 block">BED OPTIMIZER</strong>
                <span className="text-[10px] text-slate-400">Capacity + Fit</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-full sm:w-auto">
                <strong className="text-blue-300 block">REACT UI</strong>
                <span className="text-[10px] text-slate-400">Live View</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-cyan-400 block mb-0.5">Real-Time Transport:</strong>
                WebSocket pushes each simulated observation update sub-second to the dashboard.
              </div>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">Auditable Output:</strong>
                Every alert displays trigger parameter deltas, score rubric breakdown, and recommendation rationale.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Architecture
          </button>
        </div>

      </div>
    </div>
  );
}
