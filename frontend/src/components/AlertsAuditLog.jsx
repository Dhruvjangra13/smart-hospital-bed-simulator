import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Check, 
  X, 
  Clock,
  ShieldAlert,
  Flame,
  ArrowRight
} from 'lucide-react';
import { wsService } from '../services/websocket';

export default function AlertsAuditLog({ alerts }) {
  const activeAlerts = alerts || [];

  const handleAcknowledge = (id) => {
    wsService.ackAlert(id);
  };

  const handleDismiss = (id) => {
    wsService.dismissAlert(id);
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Live Clinical & Operational Alert Feed</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {activeAlerts.length} Active System Events
        </span>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          No unacknowledged alerts. Telemetry signals within normal operational limits.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {activeAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-600/50 text-rose-200'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300'
                } ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded mt-0.5 ${
                    isCritical
                      ? 'bg-rose-600 text-white animate-pulse'
                      : isWarning
                      ? 'bg-amber-600/40 text-amber-300'
                      : 'bg-slate-800 text-cyan-400'
                  }`}>
                    {isCritical ? (
                      <Flame className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">{alert.bed_id} ({alert.ward})</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold">{alert.patient_name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        isCritical ? 'bg-rose-600 text-white' : isWarning ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {alert.trigger.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs mt-1 leading-snug">
                      {alert.message}
                    </p>

                    <div className="text-[10px] text-slate-500 font-mono mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      {alert.acknowledged && (
                        <span className="text-emerald-400 ml-2">✓ Acknowledged</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs transition-colors"
                      title="Acknowledge alert"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
