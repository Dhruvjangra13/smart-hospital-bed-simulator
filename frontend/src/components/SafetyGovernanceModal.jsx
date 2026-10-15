import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, FileText, Lock, Users } from 'lucide-react';

export default function SafetyGovernanceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Safety, Guardrails & Responsible Clinical Use
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Slide 10 Governance Framework • Educational Prototype
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/50 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-amber-300 mb-1">
                Important Regulatory Notice
              </strong>
              Educational simulation prototype; not a validated clinical decision support tool. Demonstrates conceptual architecture for operations and early warning triage.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>1. Synthetic Data Only</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Zero real patient identifiers (PHI) or live clinical EHR feeds are used. All observations are procedurally generated with physiologically authentic parameters.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Users className="w-4 h-4" />
                <span>2. Human Oversight by Design</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                The system recommends; clinical and bed-management teams decide. No autonomous transfer, discharge, or medication decisions are permitted.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>3. Model Limitations</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                NEWS2 is a structured early warning score, not a definitive sepsis diagnosis. Must be integrated alongside clinician judgment, lactate labs, and full physical assessment.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>4. Pre-Deployment Validation</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Requires formal clinical governance, local hospital protocol alignment, retrospective telemetry validation, cybersecurity review, and regulatory clearance prior to clinical deployment.
              </p>
            </div>

          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px] text-center">
            "See risk sooner. Plan capacity smarter. Keep clinicians in control."
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
