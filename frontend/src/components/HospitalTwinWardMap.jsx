import React from 'react';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Droplet, 
  Zap, 
  Eye, 
  Bed as BedIcon, 
  Flame, 
  CheckCircle, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getNEWS2RiskColor, getShockIndexColor, getBedStatusBadge } from '../utils/clinicalConstants';

export default function HospitalTwinWardMap({
  beds,
  patients,
  onSelectPatient,
  onOpenDegradeModalForPatient
}) {
  const patientMap = React.useMemo(() => {
    const map = {};
    if (patients) {
      patients.forEach(p => { map[p.id] = p; });
    }
    return map;
  }, [patients]);

  const wards = [
    {
      id: 'ICU',
      name: 'Intensive Care Unit (ICU)',
      tierBadge: 'Tier 3 - Critical Care',
      color: 'border-purple-300 dark:border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/10',
      headerBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
      beds: beds?.filter(b => b.ward === 'ICU') || []
    },
    {
      id: 'HDU',
      name: 'High Dependency Unit (HDU)',
      tierBadge: 'Tier 2 - Step-Down / Acute',
      color: 'border-blue-300 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/10',
      headerBg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
      beds: beds?.filter(b => b.ward === 'HDU') || []
    },
    {
      id: 'Ward-A',
      name: 'Ward A - General Post-Op & Surgical',
      tierBadge: 'Tier 1 - Ward Care',
      color: 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/5',
      headerBg: 'bg-emerald-100 dark:bg-slate-900 text-emerald-900 dark:text-emerald-400 border-emerald-200 dark:border-slate-800',
      beds: beds?.filter(b => b.ward === 'Ward-A') || []
    },
    {
      id: 'Ward-B',
      name: 'Ward B - Acute Medical & Respiratory',
      tierBadge: 'Tier 1 - Ward Care',
      color: 'border-cyan-300 dark:border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/5',
      headerBg: 'bg-cyan-100 dark:bg-slate-900 text-cyan-900 dark:text-cyan-400 border-cyan-200 dark:border-slate-800',
      beds: beds?.filter(b => b.ward === 'Ward-B') || []
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Hospital Operations & Clinical Twin Ward Matrix</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              (Live Telemetry & Bed Status Grid)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any patient to inspect telemetry waveforms or launch synthetic degradation injection.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">NEWS2 Low (0-4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-600 dark:text-slate-400">NEWS2 Med (5-6)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-600 dark:text-red-400 font-semibold">NEWS2 High (≥7)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {wards.map((ward) => (
          <div 
            key={ward.id} 
            className={`rounded-xl border ${ward.color} overflow-hidden bg-white dark:bg-slate-950/40 shadow-lg transition-colors`}
          >
            {/* Ward Header */}
            <div className={`px-4 py-2.5 border-b flex items-center justify-between ${ward.headerBg}`}>
              <div className="flex items-center gap-2.5">
                <BedIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{ward.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 font-mono">
                  {ward.tierBadge}
                </span>
              </div>
              <div className="text-xs font-mono font-medium">
                {ward.beds.filter(b => b.status === 'occupied').length}/{ward.beds.length} Occupied
              </div>
            </div>

            {/* Beds Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ward.beds.map((bed) => {
                const patient = bed.current_patient_id ? patientMap[bed.current_patient_id] : null;
                const statusBadge = getBedStatusBadge(bed.status);

                if (!patient) {
                  return (
                    <div 
                      key={bed.id}
                      className="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 flex flex-col justify-between min-h-[175px] hover:border-slate-400 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{bed.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="my-auto text-center py-4">
                        <div className="w-8 h-8 mx-auto rounded-full bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {bed.status === 'available' ? 'Available for Allocation' : 'Bed Sanitization in Progress'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {bed.has_ventilator ? 'Equipped with Ventilator' : 'Standard Telemetry'}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 font-mono">
                        <span>ID: {bed.id}</span>
                        <span>{bed.tier} Tier</span>
                      </div>
                    </div>
                  );
                }

                const news2 = patient.clinical_status.news2;
                const riskColor = getNEWS2RiskColor(news2.total_score, news2.has_red_score);
                const shockIndex = patient.clinical_status.shock_index;
                const shockColor = getShockIndexColor(shockIndex);
                const vitals = patient.current_vitals;
                const trend = patient.clinical_status.trend_signals.trend_symbol;
                const isDegraded = patient.is_synthetic_degraded;

                return (
                  <div
                    key={bed.id}
                    className={`rounded-lg border transition-all duration-200 relative overflow-hidden flex flex-col justify-between p-3.5 bg-white dark:bg-slate-900/90 shadow-sm ${riskColor.border} ${
                      news2.total_score >= 7 ? 'shadow-lg ring-1 ring-red-500/50' : 'hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {isDegraded && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 animate-pulse"></div>
                    )}

                    {/* Bed & Patient Header */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 truncate">
                          {bed.name}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isDegraded && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 font-semibold flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 fill-current text-rose-500" />
                              {Math.round(patient.degradation_slider_value)}%
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono tracking-wider ${riskColor.badge}`}>
                            NEWS2: {news2.total_score}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[170px]" title={patient.name}>
                          {patient.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {patient.id} • {patient.age}y {patient.gender.charAt(0)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2.5" title={patient.diagnosis}>
                        {patient.diagnosis}
                      </p>

                      {/* Live Vitals Matrix */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-950/70 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Heart className={`w-3.5 h-3.5 ${vitals.heart_rate > 100 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
                          <div>
                            <div className="text-[9px] text-slate-400">HR</div>
                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              {Math.round(vitals.heart_rate)} <span className="text-[9px] font-normal text-slate-400">bpm</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Droplet className={`w-3.5 h-3.5 ${vitals.systolic_bp < 95 ? 'text-amber-500' : 'text-blue-500'}`} />
                          <div>
                            <div className="text-[9px] text-slate-400">BP</div>
                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              {Math.round(vitals.systolic_bp)}/{Math.round(vitals.diastolic_bp)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Wind className={`w-3.5 h-3.5 ${vitals.spo2 < 93 ? 'text-rose-500 animate-pulse' : 'text-cyan-500'}`} />
                          <div>
                            <div className="text-[9px] text-slate-400">SpO2</div>
                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              {Math.round(vitals.spo2)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                          <span className="text-[10px] font-mono text-slate-500 font-bold">RR</span>
                          <div>
                            <div className="text-[9px] text-slate-400">Resp</div>
                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              {Math.round(vitals.respiration_rate)} <span className="text-[9px] font-normal text-slate-400">/m</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                          <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                          <div>
                            <div className="text-[9px] text-slate-400">Temp</div>
                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                              {vitals.temperature.toFixed(1)}°C
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                          <span className="text-[10px] font-mono text-slate-500 font-bold">CNS</span>
                          <div>
                            <div className="text-[9px] text-slate-400">ACVPU</div>
                            <div className={`text-xs font-mono font-bold ${vitals.consciousness !== 'A' ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {vitals.consciousness}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Indices */}
                      <div className="flex items-center justify-between text-[10px] font-mono px-1 mb-2.5 text-slate-500">
                        <span className={`px-1.5 py-0.5 rounded ${shockColor.bg} ${shockColor.text}`}>
                          SI: {shockIndex.toFixed(2)}
                        </span>

                        <span className="flex items-center gap-1 font-semibold">
                          <span>{trend}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <button
                        onClick={() => onOpenDegradeModalForPatient(patient.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white text-[11px] font-semibold transition-all shadow-sm"
                        title="Open interactive deterioration slider"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Degrade Slider</span>
                      </button>

                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="flex items-center justify-center gap-1 py-1 px-2.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors border border-slate-300 dark:border-slate-700"
                        title="View comprehensive telemetry and waveforms"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Telemetry</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
