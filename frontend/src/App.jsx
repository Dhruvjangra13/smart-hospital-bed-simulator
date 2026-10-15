import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import CensusTableView from './components/CensusTableView';
import HospitalTwinWardMap from './components/HospitalTwinWardMap';
import BedAllocationPanel from './components/BedAllocationPanel';
import DeteriorationRadar from './components/DeteriorationRadar';
import AlertsAuditLog from './components/AlertsAuditLog';
import DegradationSliderModal from './components/DegradationSliderModal';
import PatientDetailDrawer from './components/PatientDetailDrawer';
import SafetyGovernanceModal from './components/SafetyGovernanceModal';
import ValidationScenarioModal from './components/ValidationScenarioModal';
import ArchitectureModal from './components/ArchitectureModal';
import CriticalAlertPopup from './components/CriticalAlertPopup';

import { wsService } from './services/websocket';
import { audioAlerts } from './services/AudioAlertService';

import { 
  Table, 
  Bed, 
  ShieldAlert, 
  Radar, 
  Bell, 
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pulsetwin_theme') || 'dark';
  });

  // User Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pulsetwin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default logged in as Lead Physician so the dashboard is immediately accessible,
    // with easy "Log Out" button in the Navbar!
    return {
      name: 'Dr. Rachel Adams, MD',
      email: 'rachel.adams@pulsetwin.health',
      role: 'Lead Critical Care & ICU Outreach',
      department: 'ICU & Rapid Response',
      badge: 'Attending Physician',
      avatarColor: 'from-blue-600 to-cyan-600'
    };
  });

  // Connection & Data
  const [isConnected, setIsConnected] = useState(false);
  const [hospitalState, setHospitalState] = useState(null);
  const [activeTab, setActiveTab] = useState('census-table');
  
  // Modals state
  const [isDegradeModalOpen, setIsDegradeModalOpen] = useState(false);
  const [degradeModalPatientId, setDegradeModalPatientId] = useState('SIM-104');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Critical Alert Pop-up state
  const [activePopupAlert, setActivePopupAlert] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pulsetwin_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('pulsetwin_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pulsetwin_user');
  };

  // WebSocket connection & alert trigger detection
  useEffect(() => {
    wsService.connect();

    const unsubStatus = wsService.subscribeStatus((status) => {
      setIsConnected(status);
    });

    const unsubMessages = wsService.subscribe((msg) => {
      if (msg.type === 'INITIAL_STATE' || msg.type === 'TELEMETRY_UPDATE') {
        setHospitalState(msg.data);
        if (selectedPatient) {
          const updated = msg.data.patients?.find(p => p.id === selectedPatient.id);
          if (updated) setSelectedPatient(updated);
        }

        // Check if there is an unacknowledged critical alert to display as pop-up
        const criticalAlert = msg.data.active_alerts?.find(
          a => a.severity === 'CRITICAL' && !a.acknowledged
        );
        if (criticalAlert && !activePopupAlert) {
          // Play emergency sound and show popup
          audioAlerts.playEmergencyAlarm();
          setActivePopupAlert(criticalAlert);
        }

      } else if (msg.type === 'TRANSFER_EXECUTED') {
        if (msg.hospital_state) {
          setHospitalState(msg.hospital_state);
        }
        audioAlerts.playSuccessChime();
        setActivePopupAlert(null);
        setToastMessage(`Transfer confirmed with bed manager for ${msg.data?.patient_id || 'patient'}!`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    });

    return () => {
      unsubStatus();
      unsubMessages();
    };
  }, [selectedPatient?.id, activePopupAlert]);

  const handleOpenDegradation = (patientId = 'SIM-104') => {
    setDegradeModalPatientId(patientId);
    setIsDegradeModalOpen(true);
  };

  const handleExecuteTransfer = (recommendationId) => {
    wsService.sendTransferExecute(recommendationId);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleTriggerTestAlert = () => {
    const sim104 = hospitalState?.patients?.find(p => p.id === 'SIM-104');
    const rec = hospitalState?.recommendations?.find(r => r.patient_id === 'SIM-104');
    const testAlert = {
      id: 'ALT-DEMO-01',
      timestamp: new Date().toISOString(),
      patient_id: 'SIM-104',
      patient_name: 'Arthur Pendelton',
      bed_id: 'WA-04',
      ward: 'Ward-A',
      severity: 'CRITICAL',
      risk_band: 'HIGH',
      message: 'Acute septic shock decompensation detected! Vitals collapsing: HR 128 bpm, SBP 86 mmHg, SpO2 88%. Urgent bed reallocation required.',
      trigger: 'NEWS2_DECOMPENSATION',
      news2_score: 18,
      acknowledged: false
    };
    audioAlerts.playEmergencyAlarm();
    setActivePopupAlert(testAlert);
  };

  const handleAcknowledgeAlert = (alertId) => {
    wsService.ackAlert(alertId);
    setActivePopupAlert(null);
  };

  // If user is logged out, render the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Find patient & recommendation for the critical popup if active
  const popupPatient = activePopupAlert 
    ? hospitalState?.patients?.find(p => p.id === activePopupAlert.patient_id) 
    : null;
  const popupRecommendation = activePopupAlert 
    ? hospitalState?.recommendations?.find(r => r.patient_id === activePopupAlert.patient_id) 
    : null;

  const urgentRec = hospitalState?.recommendations?.find(
    r => r.urgency === 'CRITICAL_IMMEDIATE' && r.status === 'PENDING'
  );

  return (
    <div className={`min-h-screen flex flex-col ecg-grid transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#080C14] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Navbar */}
      <Navbar
        isConnected={isConnected}
        simulationRunning={hospitalState?.simulation_running ?? true}
        simulationSpeed={hospitalState?.simulation_speed ?? 1.0}
        hospitalState={hospitalState}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenDegradationModal={() => handleOpenDegradation('SIM-104')}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        onOpenValidationModal={() => setIsValidationModalOpen(true)}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* CRITICAL DETERIORATION ALERT BANNER */}
      {urgentRec && (
        <div className={`border-b px-4 py-2.5 shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-rose-500/60 text-rose-100'
            : 'bg-gradient-to-r from-rose-100 via-red-50 to-rose-100 border-rose-300 text-rose-900'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <strong className="font-bold uppercase tracking-wider">
                CRITICAL DETERIORATION:
              </strong>
              <span>
                {urgentRec.patient_name} in {urgentRec.current_bed_id} deteriorated. Suggested escalation pathway ready.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('allocation')}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1"
              >
                <span>Review Bed Options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleExecuteTransfer(urgentRec.id)}
                className="px-3 py-1 rounded bg-white text-rose-900 hover:bg-rose-50 font-extrabold text-xs transition-colors shadow-sm"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('census-table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'census-table'
                  ? theme === 'dark' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Ward Overview Table (Slide 07)</span>
            </button>

            <button
              onClick={() => setActiveTab('ward-map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ward-map'
                  ? theme === 'dark' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Ward Bed Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('allocation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'allocation'
                  ? theme === 'dark' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Operations Engine (Slide 06)</span>
              {hospitalState?.recommendations?.length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {hospitalState.recommendations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'radar'
                  ? theme === 'dark' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span>Deterioration Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'alerts'
                  ? theme === 'dark' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts Feed</span>
              {hospitalState?.active_alerts?.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {hospitalState.active_alerts.length}
                </span>
              )}
            </button>
          </nav>

          <button
            onClick={() => handleOpenDegradation('SIM-104')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border font-semibold ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-orange-600/30 to-rose-600/30 border-orange-500/50 text-orange-200 hover:text-white'
                : 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
            <span>Launch Slide 04 Simulator</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'census-table' && (
          <CensusTableView
            patients={hospitalState?.patients}
            onSelectPatient={handleSelectPatient}
            onOpenDegradeModal={handleOpenDegradation}
          />
        )}

        {activeTab === 'ward-map' && (
          <HospitalTwinWardMap
            beds={hospitalState?.beds}
            patients={hospitalState?.patients}
            onSelectPatient={handleSelectPatient}
            onOpenDegradeModalForPatient={handleOpenDegradation}
          />
        )}

        {activeTab === 'allocation' && (
          <BedAllocationPanel
            recommendations={hospitalState?.recommendations}
            bottleneckForecast={hospitalState?.bottleneck_forecast}
            onExecuteTransfer={handleExecuteTransfer}
          />
        )}

        {activeTab === 'radar' && (
          <DeteriorationRadar
            patients={hospitalState?.patients}
            onSelectPatient={handleSelectPatient}
            onOpenDegradeModal={handleOpenDegradation}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsAuditLog alerts={hospitalState?.active_alerts} />
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-4 px-6 text-center text-xs text-slate-500 ${
        theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <p className="font-semibold text-slate-400">
          Smart Hospital Bed & Patient Deterioration Simulator • Operations & Clinical Digital Twin
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Logged in as <strong>{currentUser.name}</strong> ({currentUser.role} • {currentUser.department})
        </p>
      </footer>

      {/* CRITICAL ALERT POP-UP (UNMISSABLE POP-UP) */}
      <CriticalAlertPopup
        alert={activePopupAlert}
        patient={popupPatient}
        pendingRecommendation={popupRecommendation}
        onClose={() => setActivePopupAlert(null)}
        onAcknowledge={handleAcknowledgeAlert}
        onExecuteTransfer={handleExecuteTransfer}
        onInspectPatient={handleSelectPatient}
        theme={theme}
      />

      {/* Slide 04 Wow Factor Simulator Modal */}
      <DegradationSliderModal
        isOpen={isDegradeModalOpen}
        onClose={() => setIsDegradeModalOpen(false)}
        patients={hospitalState?.patients}
        initialPatientId={degradeModalPatientId}
        hospitalState={hospitalState}
        onExecuteTransfer={handleExecuteTransfer}
      />

      {/* Patient Detailed Telemetry Drawer */}
      <PatientDetailDrawer
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onOpenDegradeModal={(pId) => {
          setSelectedPatient(null);
          handleOpenDegradation(pId);
        }}
      />

      {/* Slide 10 Safety & Governance Modal */}
      <SafetyGovernanceModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      {/* Slide 09 Validation & Benchmark Scenario Modal */}
      <ValidationScenarioModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        hospitalState={hospitalState}
      />

      {/* Slide 02/03 Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
