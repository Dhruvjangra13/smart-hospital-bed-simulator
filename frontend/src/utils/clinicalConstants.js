export const getNEWS2RiskColor = (totalScore, hasRedScore) => {
  if (totalScore >= 7) {
    return {
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      text: 'text-red-400',
      badge: 'bg-red-600 text-white animate-pulse',
      label: 'HIGH RISK (NEWS2 ≥ 7)'
    };
  }
  if (totalScore >= 5) {
    return {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500',
      text: 'text-orange-400',
      badge: 'bg-orange-500 text-white',
      label: 'MEDIUM RISK (NEWS2 5-6)'
    };
  }
  if (hasRedScore) {
    return {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500',
      text: 'text-amber-400',
      badge: 'bg-amber-500 text-slate-900 font-bold',
      label: 'LOW-MED (RED SCORE 3)'
    };
  }
  if (totalScore >= 1) {
    return {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-600/80 text-emerald-100',
      label: 'LOW RISK (NEWS2 1-4)'
    };
  }
  return {
    bg: 'bg-slate-800/40',
    border: 'border-slate-700',
    text: 'text-slate-400',
    badge: 'bg-slate-700 text-slate-300',
    label: 'BASELINE (NEWS2 0)'
  };
};

export const getShockIndexColor = (shockIndex) => {
  if (shockIndex > 0.9) {
    return { text: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-600/50', label: 'Shock / Occult Hypoperfusion' };
  }
  if (shockIndex >= 0.7) {
    return { text: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-600/50', label: 'Borderline' };
  }
  return { text: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-600/50', label: 'Normal Perfusion' };
};

export const getBedStatusBadge = (status) => {
  switch (status) {
    case 'occupied':
      return { label: 'Occupied', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    case 'available':
      return { label: 'Available', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
    case 'reserved':
      return { label: 'Reserved', color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' };
    case 'cleaning':
      return { label: 'Sanitizing', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
    default:
      return { label: status, color: 'bg-slate-800 text-slate-400' };
  }
};
