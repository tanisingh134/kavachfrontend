import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function SafetyTwinCompare({ routes, selectedRouteType, onSelectRouteType, onHourDelay }) {
  if (!routes) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-safety-border text-center flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <Sparkles className="w-10 h-10 text-violet-400 animate-pulse mb-2" />
        <p className="text-sm font-semibold">No active journey found.</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">Select a start and destination on the map to compare journey simulation scenarios.</p>
      </div>
    );
  }

  // Calculate parameters for standard, safe, and shadow routes
  const standardRisk = 100 - routes.standard.safetyScore;
  const safeRisk = 100 - routes.safe.safetyScore;
  const shadowRisk = 100 - routes.shadow.safetyScore;

  const compareOptions = [
    {
      key: 'standard',
      name: 'Option A: Continue Standard Path',
      score: routes.standard.safetyScore,
      eta: `${routes.standard.durationMins} mins`,
      risk: routes.standard.riskLevel,
      riskColor: 'text-safety-rose bg-rose-500/10 border-rose-500/30',
      factors: `${routes.standard.crimeCount} crime circles, CP Outer Ring robbery sector`,
      actionLabel: 'Select Standard',
      onAction: () => onSelectRouteType('standard'),
      isSelected: selectedRouteType === 'standard'
    },
    {
      key: 'safe',
      name: 'Option B: Take Safe Detour Route',
      score: routes.safe.safetyScore,
      eta: `${routes.safe.durationMins} mins`,
      risk: routes.safe.riskLevel,
      riskColor: 'text-safety-emerald bg-yellow-500/10 border-yellow-500/30',
      factors: 'Bypasses active hazard perimeters perpendicularly',
      actionLabel: 'Select Detour',
      onAction: () => onSelectRouteType('safe'),
      isSelected: selectedRouteType === 'safe'
    },
    {
      key: 'shadow',
      name: 'Option C: Swap to Shadow Route Corridor',
      score: routes.shadow.safetyScore,
      eta: `${routes.shadow.durationMins} mins`,
      risk: routes.shadow.riskLevel,
      riskColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
      factors: 'Routes directly through 👮 CP Police booths and CCTV zones',
      actionLabel: 'Select Shadow',
      onAction: () => onSelectRouteType('shadow'),
      isSelected: selectedRouteType === 'shadow'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-safety-border flex flex-col gap-6">
      <div className="flex justify-between items-center pb-3 border-b border-safety-border/40">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          <h3 className="font-extrabold text-slate-100 text-lg">Digital Safety Twin Compare</h3>
        </div>
        <span className="text-[10px] text-violet-300 font-bold uppercase bg-violet-950 border border-violet-500/30 px-3 py-0.5 rounded-full">
          journey predictive twin
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Contrast ETA, Safety Scores, and contributing hazard factors below. Tap to update active navigation or delay departure.
      </p>

      {/* Comparative cards grid */}
      <div className="flex flex-col gap-4">
        {compareOptions.map((opt) => (
          <div 
            key={opt.key}
            className={`p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              opt.isSelected 
                ? 'bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-900/10' 
                : 'bg-safety-dark/20 border-safety-border hover:bg-safety-dark/40'
            }`}
          >
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${opt.isSelected ? 'text-violet-400' : 'text-slate-200'}`}>
                  {opt.name}
                </span>
                {opt.isSelected && (
                  <span className="text-[8px] uppercase tracking-wider font-extrabold bg-violet-500 text-white px-1.5 py-0.5 rounded shadow">
                    Active Path
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-1">
                <div>
                  <span className="font-medium text-slate-500">Safety Rating:</span>{' '}
                  <span className="font-bold text-slate-200">{opt.score}/100</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">ETA duration:</span>{' '}
                  <span className="font-bold text-slate-200">{opt.eta}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-500">Contributing factors:</span>{' '}
                  <span className="text-slate-300 font-semibold">{opt.factors}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:self-center shrink-0">
              <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded border ${opt.riskColor}`}>
                {opt.risk} Risk
              </span>
              <button
                onClick={opt.onAction}
                disabled={opt.isSelected}
                className={`text-[10px] font-bold py-2 px-3.5 rounded-lg border transition ${
                  opt.isSelected 
                    ? 'bg-slate-900 border-safety-border text-slate-600 cursor-default' 
                    : 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/20'
                }`}
              >
                {opt.actionLabel}
              </button>
            </div>
          </div>
        ))}

        {/* Delay Option Action Card */}
        <div className="bg-safety-dark/30 border border-safety-border/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex gap-3 items-center">
            <Clock className="w-5 h-5 text-safety-amber" />
            <div>
              <p className="text-xs font-bold text-slate-200">Option D: Delay Travel by 1 Hour</p>
              <p className="text-[10px] text-slate-400">Postpones departure to allow midnight threat swell perimeters to shrink.</p>
            </div>
          </div>
          <button
            onClick={onHourDelay}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-safety-amber hover:text-white border border-safety-border font-bold text-[10px] py-2 px-4 rounded-lg transition"
          >
            ⏰ Delay Departure
          </button>
        </div>
      </div>
    </div>
  );
}
