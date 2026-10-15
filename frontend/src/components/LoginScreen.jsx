import React, { useState } from 'react';
import { 
  Activity, 
  Lock, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Sun, 
  Moon, 
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  BedDouble
} from 'lucide-react';

export default function LoginScreen({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState('rachel.adams@pulsetwin.health');
  const [password, setPassword] = useState('••••••••••••');
  const [department, setDepartment] = useState('ICU & Rapid Response');
  const [isLoading, setIsLoading] = useState(false);

  const demoRoles = [
    {
      id: 'dr_adams',
      name: 'Dr. Rachel Adams, MD',
      email: 'rachel.adams@pulsetwin.health',
      role: 'Lead Critical Care & ICU Outreach',
      department: 'ICU & Rapid Response',
      badge: 'Attending Physician',
      avatarColor: 'from-blue-600 to-cyan-600',
      icon: Stethoscope
    },
    {
      id: 'nurse_sarah',
      name: 'Sarah Miller, RN, BSN',
      email: 's.miller@pulsetwin.health',
      role: 'Charge Nurse & Acute Ward Manager',
      department: 'Ward-A Post-Op',
      badge: 'Charge Nurse',
      avatarColor: 'from-emerald-600 to-teal-600',
      icon: HeartPulse
    },
    {
      id: 'marcus_ops',
      name: 'Marcus Thorne, MHA',
      email: 'm.thorne@pulsetwin.health',
      role: 'Director of Hospital Bed Operations',
      department: 'Patient Flow & Logistics',
      badge: 'Operations Director',
      avatarColor: 'from-purple-600 to-indigo-600',
      icon: BedDouble
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: 'Clinical Staff',
        department: department,
        badge: 'Staff Member',
        avatarColor: 'from-blue-600 to-indigo-600'
      });
      setIsLoading(false);
    }, 400);
  };

  const handleSelectRole = (role) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(role);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#080C14] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Bar with Branding & Theme Switcher */}
      <header className={`px-6 py-4 border-b flex items-center justify-between ${
        theme === 'dark' ? 'bg-[#0D1322] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              <span>PULSE-TWIN</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                theme === 'dark' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              }`}>
                HEALTH SYSTEM
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Clinical Operations & Patient Deterioration Digital Twin
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            <span className="hidden sm:inline font-medium">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Left Column: Traditional Credentials Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Single Sign-On (SSO) Portal</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Sign In to Command Center
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your hospital credentials or select a verified clinical role.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                  Staff Email / Identifier
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-950 border-slate-800 text-slate-100' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                  Primary Ward / Duty Station
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-950 border-slate-800 text-slate-100' 
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="ICU & Rapid Response">Intensive Care Unit (ICU) & Rapid Response</option>
                    <option value="HDU Step-Down">High Dependency Unit (HDU)</option>
                    <option value="Ward-A Post-Op">Ward A (Surgical Post-Op)</option>
                    <option value="Ward-B Acute Medical">Ward B (Acute Medical & Pulmonary)</option>
                    <option value="Patient Flow Operations">Hospital Bed Flow & Logistics</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-98"
              >
                {isLoading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Enter Clinical Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-[11px] text-slate-500 border-t pt-3 flex items-center gap-1.5 border-slate-800/40">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>TLS 1.3 Encrypted • Audit-Logged Session</span>
            </div>
          </div>

          {/* Right Column: 1-Click Clinical Persona Quick Access */}
          <div className={`lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>1-Click Role Login</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/40 text-slate-400">
                  Hackathon Ready
                </span>
              </div>
              <h3 className="text-base font-bold">
                Select a Clinical Persona
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Instantly explore the twin with role-based decision permissions.
              </p>

              <div className="space-y-3 mt-4">
                {demoRoles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] group flex items-start gap-3.5 ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850'
                          : 'bg-white border-slate-200 hover:border-cyan-500 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${role.avatarColor} text-white flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate group-hover:text-cyan-500 transition-colors">
                            {role.name}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                            theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {role.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {role.role}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
                          <span>Ward: {role.department}</span>
                          <span className="text-slate-500">•</span>
                          <span>1-Click Sign In →</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-[11px] mt-4 flex items-start gap-2 ${
              theme === 'dark' ? 'bg-amber-950/20 border-amber-600/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong>Simulation Environment:</strong> All user accounts interact with the real-time continuous physiological telemetry simulator and dynamic bed reallocation engine.
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className={`px-6 py-3 border-t text-center text-xs text-slate-500 ${
        theme === 'dark' ? 'bg-[#0D1322] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        PULSE-TWIN Health System • Role-Based Clinical Decision Support Prototype
      </footer>

    </div>
  );
}
