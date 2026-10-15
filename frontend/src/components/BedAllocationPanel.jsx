import React from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Shuffle,
  Users,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function BedAllocationPanel({
  recommendations,
  bottleneckForecast,
  onExecuteTransfer
}) {
  const pendingRecs = recommendations?.filter(r => r.status === 'PENDING') || [];

  return (
    <div className="space-y-6">
      
      {/* Slide 06 Engine Header Card */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold uppercase">
              06 / OPERATIONS ENGINE
            </span>
            <h3 className="text-sm font-bold text-white">Bed Allocation with Constraints</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Care level matching • Isolation protocol checks • Equipment fit • Human-in-the-loop decision loop
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
          <span className="text-amber-400 font-bold">Rule:</span> No autonomous transfer, discharge or treatment decisions.
        </div>
      </div>

      {/* Bottleneck Forecaster Alert Banner */}
      {bottleneckForecast && (
        <div className={`rounded-xl border p-4 shadow-lg backdrop-blur-sm ${
          bottleneckForecast.bottleneck_risk === 'CRITICAL_BOTTLENECK'
            ? 'bg-rose-950/30 border-rose-600/70 text-rose-200'
            : bottleneckForecast.bottleneck_risk === 'MODERATE_WARNING'
            ? 'bg-amber-950/20 border-amber-600/50 text-amber-200'
            : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 ${
                bottleneckForecast.bottleneck_risk === 'CRITICAL_BOTTLENECK'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-600/30 text-amber-400'
              }`}>
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight">
                    Ward Manager Bottleneck Prediction
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    bottleneckForecast.bottleneck_risk === 'CRITICAL_BOTTLENECK'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {bottleneckForecast.bottleneck_risk.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                  {bottleneckForecast.headline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800/80 shrink-0">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">ICU Occupancy</div>
                <div className={`font-bold ${bottleneckForecast.icu_occupancy_pct >= 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {bottleneckForecast.icu_occupancy_pct}%
                </div>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <div className="text-[10px] text-slate-400 uppercase">Gridlock ETA</div>
                <div className="font-bold text-amber-400">
                  {bottleneckForecast.estimated_time_to_gridlock}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS WITH CONSTRAINTS & RANKED OPTIONS */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Ranked Bed Options & Next Best Actions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritizes urgent clinical review without moving patients autonomously.
            </p>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
            {pendingRecs.length} Actionable Proposals
          </span>
        </div>

        {pendingRecs.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/70 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">All Ward Beds & Care Tiers are Balanced</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Use the Deterioration Slider to simulate acute changes and generate constraint-ranked proposals.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRecs.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-4 space-y-3.5 hover:border-cyan-500/50 transition-all shadow-md"
              >
                {/* Proposal Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-400">{rec.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      rec.urgency === 'CRITICAL_IMMEDIATE'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-500 text-slate-900 font-bold'
                    }`}>
                      {rec.urgency}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      Isolation: <strong className="text-cyan-300">{rec.isolation_needed}</strong>
                    </span>
                  </div>
                </div>

                {/* Patient Summary & Transfer Vector */}
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{rec.patient_name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">({rec.patient_id})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Current: {rec.current_bed_id} ({rec.current_ward})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400 px-3">
                    <ArrowRight className="w-5 h-5 animate-pulse" />
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-cyan-300">Target Option 1: {rec.target_bed_id}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Target Care Level: {rec.target_ward}</div>
                  </div>
                </div>

                {/* Example Output Box adhering to Slide 06 */}
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                    Example Output (Slide 06 Format):
                  </div>
                  <div className="text-xs font-semibold text-rose-300">
                    "{rec.clinical_rationale}"
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Trigger Breakdown: {rec.explainable_trigger}
                  </div>
                </div>

                {/* RANKED CANDIDATE BED OPTIONS */}
                {rec.ranked_options?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ranked Candidate Beds (Constraint Matched):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {rec.ranked_options.map((opt) => (
                        <div key={opt.bed_id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-300">Option {opt.rank}: Bed {opt.bed_id}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                              {opt.match_score}% Match
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-tight">
                            {opt.fit_rationale}
                          </p>
                          <div className="text-[9px] text-slate-400 font-mono pt-0.5 border-t border-slate-800">
                            Est. Turnover: {opt.estimated_turnover_minutes}m
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEXT BEST ACTION BOX adhering to Slide 06 */}
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-600/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="block text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      NEXT BEST ACTION:
                    </strong>
                    <span className="text-xs text-slate-200">
                      {rec.next_best_action}
                    </span>
                    <div className="text-[10px] text-slate-400 italic mt-0.5">
                      {rec.human_in_the_loop_disclaimer}
                    </div>
                  </div>

                  <button
                    onClick={() => onExecuteTransfer(rec.id)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Execute with Bed Manager</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
