import React, { useState } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  ShieldAlert,
  Target,
  Cpu,
  Sun,
  Moon,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { wsService } from '../services/websocket';
import { audioAlerts } from '../services/AudioAlertService';

export default function Navbar({ 
  isConnected, 
  simulationRunning, 
  simulationSpeed, 
  hospitalState,
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
  onOpenDegradationModal,
  onOpenSafetyModal,
  onOpenValidationModal,
  onOpenArchitectureModal,
  onTriggerTestAlert
}) {
  const [isMuted, setIsMuted] = useState(false);
  const kpis = hospitalState?.kpis;

  const handleToggleMute = () => {
    const muted = audioAlerts.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioAlerts.playBeep(880, 0.1);
    }
  };

  const handleToggleSim = () => {
    wsService.toggleSim();
  };

  const handleResetAll = () => {
    if (window.confirm("Reset all patient vitals to baseline steady-state?")) {
      wsService.resetAll();
    }
  };

  return (
    <header className={`border-b sticky top-0 z-40 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#0D1322] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      
      {/* Top Persistent Educational Safety Banner from Slide 10 */}
      <div className={`border-b px-4 py-1 text-center text-[11px] flex items-center justify-between ${
        theme === 'dark' ? 'bg-amber-950/40 border-amber-600/30 text-amber-200/90' : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-1.5 mx-auto">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            <strong>EDUCATIONAL SIMULATION ONLY:</strong> Synthetic vitals only. Alerts and bed suggestions support—not replace—professional judgment.
          </span>
        </div>

        <button
          onClick={onOpenSafetyModal}
          className="underline hover:opacity-80 font-medium text-[10px] ml-2 shrink-0 hidden sm:inline"
        >
          View Governance Guardrails
        </button>
      </div>

      <div className="px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight flex items-center gap-1.5">
                PULSE-TWIN
                <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                  theme === 'dark' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                }`}>
                  CLINICAL + OPS TWIN
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>NEWS2 Sepsis & Dynamic Bed Allocator</span>
              <span className="text-slate-400">•</span>
              <span className={`text-[11px] font-mono ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isConnected ? 'LIVE FEED ACTIVE' : 'CONNECTING...'}
              </span>
            </p>
          </div>
        </div>

        {/* EXACT SLIDE 07 METRIC CHIPS: PATIENTS: 24 | HIGH RISK: 03 | BEDS AVAILABLE: 05 | ALERTS TODAY: 07 */}
        <div className={`hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl border font-mono text-xs ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="px-2.5 py-0.5 text-center border-r border-slate-700/30">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">PATIENTS</div>
            <div className="text-sm font-bold">
              {String(kpis?.total_patients || 24).padStart(2, '0')}
            </div>
          </div>

          <div className="px-2.5 py-0.5 text-center border-r border-slate-700/30">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">HIGH RISK</div>
            <div className="text-sm font-bold text-rose-500 animate-pulse">
              {String(kpis?.high_risk_count || 3).padStart(2, '0')}
            </div>
          </div>

          <div className="px-2.5 py-0.5 text-center border-r border-slate-700/30">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">BEDS AVAILABLE</div>
            <div className="text-sm font-bold text-emerald-500">
              {String(kpis?.beds_available || 5).padStart(2, '0')}
            </div>
          </div>

          <div className="px-2.5 py-0.5 text-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">ALERTS TODAY</div>
            <div className="text-sm font-bold text-amber-500">
              {String(kpis?.alerts_today || 7).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation Pills */}
        <div className="flex items-center space-x-2">
          
          {/* Pop-up Test Trigger */}
          <button
            onClick={onTriggerTestAlert}
            className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              theme === 'dark' 
                ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/40' 
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="Trigger Alert Pop-up Demo"
          >
            <Bell className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
            <span>Alert Pop-up</span>
          </button>

          {/* Slide 04: The Wow Factor Button */}
          <button
            onClick={onOpenDegradationModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-950/30 transition-all transform active:scale-95"
            title="Slide 04: Deterioration Simulator"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Wow Slider</span>
          </button>

          {/* Architecture (Slide 02/03) */}
          <button
            onClick={onOpenArchitectureModal}
            className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-colors ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="System Architecture"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden xl:inline">Architecture</span>
          </button>

          {/* Validation & Replay (Slide 09) */}
          <button
            onClick={onOpenValidationModal}
            className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-colors ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Impact & Benchmark Replays"
          >
            <Target className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden xl:inline">Validation</span>
          </button>

          {/* Safety & Governance (Slide 10) */}
          <button
            onClick={onOpenSafetyModal}
            className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-colors ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Safety & Guardrails"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xl:inline">Safety</span>
          </button>

          {/* Simulation Controls */}
          <button
            onClick={handleToggleSim}
            className={`p-1.5 rounded-lg border transition-colors ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
            title={simulationRunning ? "Pause simulation feed" : "Resume simulation feed"}
          >
            {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={handleResetAll}
            className={`p-1.5 rounded-lg border transition-colors ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
            title="Reset baseline steady-state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isMuted 
                ? 'bg-slate-800 border-slate-700 text-slate-500' 
                : theme === 'dark' ? 'bg-cyan-950 border-cyan-700 text-cyan-400' : 'bg-cyan-50 border-cyan-300 text-cyan-700'
            }`}
            title={isMuted ? "Unmute alarms" : "Mute alarms"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* THEME TOGGLE (DARK / LIGHT) */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* USER PROFILE & LOGOUT */}
          {currentUser && (
            <div className={`flex items-center space-x-2 pl-2 border-l ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-cyan-600 to-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="text-left font-medium">
                  <div className="text-xs truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{currentUser.badge || currentUser.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-rose-400 hover:bg-rose-950/40 hover:border-rose-700'
                    : 'bg-slate-100 border-slate-300 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                }`}
                title="Log Out of Dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-semibold">Log Out</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
