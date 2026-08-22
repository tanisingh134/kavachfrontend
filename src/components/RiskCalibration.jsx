import React from 'react';
import { Settings, Battery, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RiskCalibration({ 
  batteryLevel, 
  onBatteryChange, 
  guardianState, 
  proximityAlert,
  routes
}) {
  // Determine if criteria is active
  const isLevel1Active = guardianState === 'deviation' || guardianState === 'running' || proximityAlert;
  const isLevel2Active = guardianState === 'stoppage';
  const isLevel3Active = guardianState === 'sos';

  // Calculate dynamic confidence score based on telemetry variables
  const calculateConfidence = () => {
    let baseConf = 92;
    if (batteryLevel < 30) baseConf -= 12; // Lower confidence if phone might die
    if (guardianState === 'deviation') baseConf -= 15; // Lower confidence due to unexpected routing behavior
    return Math.max(50, baseConf);
  };

  const confidence = calculateConfidence();

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-safety-accent" />
          <h3 className="font-bold text-slate-100">AI Risk Calibration & Explainability</h3>
        </div>
        <span className="text-[10px] text-violet-300 font-bold uppercase bg-violet-950 border border-violet-500/30 px-2.5 py-0.5 rounded-full">
          Explainable AI
        </span>
      </div>

      {/* Battery Risk Modifier Slider */}
      <div className="bg-safety-dark/30 border border-safety-border/50 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1">
            <Battery className={`w-4 h-4 ${batteryLevel < 20 ? 'text-safety-rose animate-pulse' : 'text-safety-accent'}`} /> 
            Phone Battery Modifier:
          </span>
          <span className={batteryLevel < 20 ? 'text-safety-rose font-bold animate-pulse' : 'text-violet-400 font-bold'}>
            {batteryLevel}% {batteryLevel < 20 && '(Risk multiplier 1.4x active)'}
          </span>
        </div>
        
        <input 
          type="range"
          min="10"
          max="100"
          step="5"
          value={batteryLevel}
          onChange={(e) => onBatteryChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-safety-border rounded-lg appearance-none cursor-pointer accent-violet-500 mt-1"
        />
      </div>

      {/* Explainable AI Decision Tree Audit Grid */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Escalation Audit Criteria</h4>
        
        <div className="flex flex-col gap-2 font-mono text-[10px]">
          {/* Level 1 Criteria */}
          <div className={`p-2.5 border rounded-lg flex justify-between items-center transition ${
            isLevel1Active 
              ? 'bg-rose-950/20 border-rose-500/60 text-safety-rose' 
              : 'bg-safety-dark/20 border-safety-border/40 text-slate-400'
          }`}>
            <div>
              <p className="font-bold">LEVEL 1: WARNING NOTIFICATION</p>
              <p className="text-[8px] mt-0.5">Trigger: Risk Score &gt; 65% OR Path Deviation OR Speed Spike</p>
            </div>
            <span className="font-bold uppercase tracking-wider text-[9px]">
              {isLevel1Active ? '● Triggered' : '○ Standby'}
            </span>
          </div>

          {/* Level 2 Criteria */}
          <div className={`p-2.5 border rounded-lg flex justify-between items-center transition ${
            isLevel2Active 
              ? 'bg-amber-950/20 border-amber-500/60 text-safety-amber' 
              : 'bg-safety-dark/20 border-safety-border/40 text-slate-400'
          }`}>
            <div>
              <p className="font-bold">LEVEL 2: EMERGENCY CONTACT BEACON</p>
              <p className="text-[8px] mt-0.5">Trigger: Stoppage &gt; 12s inside hazard zone OR ignoring Level 1 warning</p>
            </div>
            <span className="font-bold uppercase tracking-wider text-[9px]">
              {isLevel2Active ? '● Triggered' : '○ Standby'}
            </span>
          </div>

          {/* Level 3 Criteria */}
          <div className={`p-2.5 border rounded-lg flex justify-between items-center transition ${
            isLevel3Active 
              ? 'bg-red-950/30 border-red-500/70 text-red-400' 
              : 'bg-safety-dark/20 border-safety-border/40 text-slate-400'
          }`}>
            <div>
              <p className="font-bold">LEVEL 3: HELPLINES DIRECTORY VIEW</p>
              <p className="text-[8px] mt-0.5">Trigger: Emergency countdown expires OR screamed decibel spike</p>
            </div>
            <span className="font-bold uppercase tracking-wider text-[9px]">
              {isLevel3Active ? '● Triggered' : '○ Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Confidence gauge */}
      <div className="flex justify-between items-center text-xs font-semibold bg-safety-dark/40 border border-safety-border/40 p-3 rounded-xl mt-1">
        <span className="text-slate-400 flex items-center gap-1">
          <Compass className="w-4 h-4 text-safety-accent animate-spin-slow" /> AI Prediction Confidence:
        </span>
        <span className="text-violet-400 font-bold text-sm">
          {confidence}%
        </span>
      </div>
    </div>
  );
}
