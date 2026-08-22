import React, { useState } from 'react';
import { 
  ShieldCheck, HelpCircle, Sliders, Battery, Clock, 
  Lightbulb, Users, Shield, Cpu, ChevronRight, CheckCircle2 
} from 'lucide-react';

export default function ExplainableAISandbox({
  batteryLevel = 85,
  onBatteryChange,
  safetyHour = 22,
  onHourChange
}) {
  // Sandbox Interactive Simulation States
  const [sandboxLight, setSandboxLight] = useState(35); // 35% Lux
  const [sandboxCrowd, setSandboxCrowd] = useState(25); // 25% Crowd footfall
  const [sandboxPatrols, setSandboxPatrols] = useState(1); // 1 active patrol
  const [sandboxHour, setSandboxHour] = useState(safetyHour);
  const [sandboxBattery, setSandboxBattery] = useState(batteryLevel);

  // Dynamic Risk Formula Simulation
  const computeRiskScore = () => {
    const lightRisk = (100 - sandboxLight) * 0.30;
    const crimeBase = 45 * 0.25;
    const crowdRisk = (100 - sandboxCrowd) * 0.20;
    
    let hourMult = 1.0;
    if (sandboxHour >= 22 && sandboxHour < 26) hourMult = 1.25;
    else if (sandboxHour >= 26 && sandboxHour < 29) hourMult = 1.55;
    else if (sandboxHour >= 6 && sandboxHour < 18) hourMult = 0.65;

    let batMult = 1.0;
    if (sandboxBattery < 20) batMult = 1.35;
    else if (sandboxBattery < 40) batMult = 1.15;

    const patrolDeduction = sandboxPatrols * 8;

    const raw = ((lightRisk + crimeBase + crowdRisk) * hourMult * batMult) - patrolDeduction;
    const finalScore = Math.min(98, Math.max(8, Math.round(raw)));
    
    // Compute AI Confidence
    let conf = 94;
    if (sandboxBattery < 25) conf -= 10;
    if (sandboxCrowd < 15) conf -= 8;
    return { score: finalScore, conf: Math.max(60, conf), hourMult, batMult };
  };

  const { score, conf, hourMult, batMult } = computeRiskScore();

  const getRiskColor = (s) => {
    if (s >= 70) return 'text-safety-rose bg-rose-500/10 border-rose-500/30';
    if (s >= 40) return 'text-safety-amber bg-amber-500/10 border-amber-500/30';
    return 'text-safety-emerald bg-yellow-500/10 border-yellow-500/30';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4 shadow-xl">
      {/* Title */}
      <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/40">
            <Cpu className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">AI Confidence & Explainability (XAI)</h3>
            <p className="text-[10px] text-violet-300 font-semibold">Transparent Multi-Factor Risk Breakdown</p>
          </div>
        </div>

        <span className="text-[9px] uppercase font-extrabold bg-violet-500/20 border border-violet-500/40 text-violet-300 px-2.5 py-1 rounded-full">
          Explainable AI
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Kavach AI never gives a "black-box" risk number without a reason. Interact with the sandbox sliders below to see how environmental variables directly calibrate the safety model.
      </p>

      {/* Dynamic Model Output Card */}
      <div className="bg-slate-950/70 border border-safety-border/60 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300">Composite Risk Prediction:</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${getRiskColor(score)}`}>
              {score >= 70 ? 'High Risk' : score >= 40 ? 'Moderate Risk' : 'Low Risk'} ({score}%)
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2 font-semibold">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-violet-400" /> AI Prediction Confidence:
          </span>
          <span className="text-violet-400 font-mono font-bold">{conf}% Certainty</span>
        </div>

        {/* Dynamic Natural Language Reasoning Rationale */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
          <p className="font-bold text-violet-300 mb-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> AI Decision Rationale:
          </p>
          <p>
            {score >= 70 
              ? `Elevated threat detected primarily due to low ambient lighting (${sandboxLight}%) combined with late-night temporal multiplier (${hourMult.toFixed(2)}x) and low crowd presence. Bypassing unlit alleys recommended.`
              : score >= 40
                ? `Moderate risk environment. Streetlights at ${sandboxLight} Lux provide partial visibility; active police patrols (${sandboxPatrols}) mitigate corridor threats.`
                : `Safe corridor conditions. Well-lit area (${sandboxLight}%) with active footfall and low historical incident velocity.`}
          </p>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="flex flex-col gap-2 bg-safety-dark/30 border border-safety-border/40 rounded-xl p-3.5 text-xs">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          Multi-Factor Weight Distribution
        </span>

        <div className="space-y-2 text-[10px]">
          <div>
            <div className="flex justify-between text-slate-400 font-semibold mb-0.5">
              <span className="flex items-center gap-1"><Lightbulb className="w-3 h-3 text-amber-400" /> Lighting & Visibility (30% Weight)</span>
              <span className="text-slate-200">{sandboxLight}% Lux</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${sandboxLight}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 font-semibold mb-0.5">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-400" /> Real-Time Crowd Density (20% Weight)</span>
              <span className="text-slate-200">{sandboxCrowd}% Footfall</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full" style={{ width: `${sandboxCrowd}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 font-semibold mb-0.5">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-violet-400" /> Time of Day Multiplier (15% Weight)</span>
              <span className="text-violet-300">{hourMult.toFixed(2)}x Multiplier</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-violet-400 h-full" style={{ width: `${(hourMult / 1.6) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 font-semibold mb-0.5">
              <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-rose-400" /> Battery Risk Multiplier (10% Weight)</span>
              <span className="text-rose-300">{batMult.toFixed(2)}x Multiplier</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-400 h-full" style={{ width: `${sandboxBattery}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Sandbox Sliders */}
      <div className="bg-slate-950/60 border border-safety-border/60 rounded-xl p-3.5 flex flex-col gap-3">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-violet-400" /> Interactive Factor Sandbox
        </span>

        {/* Lighting Slider */}
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Ambient Streetlight Lux:</span>
            <span className="text-violet-300 font-mono font-bold">{sandboxLight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sandboxLight}
            onChange={(e) => setSandboxLight(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* Crowd Density Slider */}
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Pedestrian Crowd Density:</span>
            <span className="text-violet-300 font-mono font-bold">{sandboxCrowd}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sandboxCrowd}
            onChange={(e) => setSandboxCrowd(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* Police Patrols Slider */}
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Active Police Patrol Units:</span>
            <span className="text-violet-300 font-mono font-bold">{sandboxPatrols} Units</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            value={sandboxPatrols}
            onChange={(e) => setSandboxPatrols(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>
    </div>
  );
}
