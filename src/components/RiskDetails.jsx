import React from 'react';
import { Shield, Sparkles, AlertOctagon, HelpCircle, CheckCircle, Lightbulb } from 'lucide-react';

export default function RiskDetails({ aiAnalysis, routeInfo, selectedRouteType }) {
  if (!routeInfo) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-safety-border/30 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-safety-accent opacity-50" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No Route Evaluated</h3>
        <p className="text-sm text-slate-400 max-w-xs mt-1">
          Select starting and destination points on the map to trigger safety scoring and AI risk factor explanations.
        </p>
      </div>
    );
  }

  const score = routeInfo.safetyScore;
  const isSafeRoute = selectedRouteType === 'safe';

  // Determine score color palettes
  const getScoreColor = (val) => {
    if (val >= 80) return { ring: 'stroke-safety-emerald', text: 'text-safety-emerald', bg: 'bg-safety-emerald/10' };
    if (val >= 50) return { ring: 'stroke-safety-amber', text: 'text-safety-amber', bg: 'bg-safety-amber/10' };
    return { ring: 'stroke-safety-rose', text: 'text-safety-rose', bg: 'bg-safety-rose/10' };
  };

  const colors = getScoreColor(score);
  
  // Calculate SVG stroke offset for radial gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-safety-border pb-3">
        <Sparkles className="w-5 h-5 text-safety-accent animate-pulse" />
        <h2 className="text-lg font-bold tracking-wide text-slate-100">AI Safety Intelligence</h2>
      </div>

      {/* Top Section: Score Dial & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-safety-dark/40 p-4 rounded-xl border border-safety-border/60">
        {/* Radial Safety Score Dial */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-safety-border"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`transition-all duration-1000 ${colors.ring}`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold tracking-tight ${colors.text}`}>{score}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Safety Index</span>
            </div>
          </div>
          <div className={`mt-2 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
            {routeInfo.riskLevel} Risk Route
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between border-b border-safety-border pb-1">
            <span className="text-slate-400">Route Type:</span>
            <span className={`font-semibold ${isSafeRoute ? 'text-safety-emerald' : 'text-safety-rose'}`}>
              {isSafeRoute ? 'Kavach Safe Detour' : 'Standard Direct'}
            </span>
          </div>
          <div className="flex justify-between border-b border-safety-border pb-1">
            <span className="text-slate-400">Distance:</span>
            <span className="font-semibold text-slate-200">{routeInfo.distanceKm} km</span>
          </div>
          <div className="flex justify-between border-b border-safety-border pb-1">
            <span className="text-slate-400">Est. Time:</span>
            <span className="font-semibold text-slate-200">{routeInfo.durationMins} mins</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Hazards Nearby:</span>
            <span className="font-semibold text-slate-200">{routeInfo.crimeCount + routeInfo.alertCount}</span>
          </div>
        </div>
      </div>

      {/* AI Confidence Meter */}
      {aiAnalysis && (
        <div className="bg-safety-dark/30 p-3 rounded-lg border border-safety-border/40 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-safety-accent" />
              AI Confidence Score:
            </span>
            <span className="text-safety-accent font-bold">{aiAnalysis.confidenceScore}%</span>
          </div>
          <div className="w-full bg-safety-border h-1.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-safety-accent h-full transition-all duration-1000" 
              style={{ width: `${aiAnalysis.confidenceScore}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "{aiAnalysis.confidenceExplanation}"
          </p>
        </div>
      )}

      {/* AI Comparative Summary */}
      {aiAnalysis && (
        <div className="bg-violet-950/20 border border-safety-accent/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-200 leading-relaxed">
            {aiAnalysis.summary}
          </p>
        </div>
      )}

      {/* Route Risks or Benefits Accordion/Card */}
      {aiAnalysis && (
        <div className="flex flex-col gap-4">
          {/* Unsafe Path Hazards (Standard) */}
          {!isSafeRoute && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-safety-rose flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" /> Identified Risk Factors
              </h4>
              <div className="flex flex-col gap-2">
                {aiAnalysis.standardRouteRisks.map((risk, index) => (
                  <div key={index} className="bg-safety-rose/10 border border-safety-rose/30 p-3 rounded-lg text-xs leading-relaxed text-rose-200">
                    {risk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe Path Safeguards (Safe) */}
          {isSafeRoute && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-safety-emerald flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Safety Optimization Details
              </h4>
              <div className="flex flex-col gap-2">
                {aiAnalysis.safeRouteBenefits.map((benefit, index) => (
                  <div key={index} className="bg-safety-emerald/10 border border-safety-emerald/30 p-3 rounded-lg text-xs leading-relaxed text-yellow-200">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Tips */}
          <div className="flex flex-col gap-2 mt-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-safety-amber" /> Live Safety Advice
            </h4>
            <div className="bg-safety-dark/60 border border-safety-border p-3.5 rounded-lg flex flex-col gap-2 text-xs text-slate-300">
              {aiAnalysis.actionableTips.map((tip, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-safety-accent font-bold mt-0.5">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
