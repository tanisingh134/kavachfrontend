import React from 'react';
import { Shield, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

export default function GuardianAvatar({ guardianState, proximityAlert, currentSector }) {
  // Determine state parameters
  const getStateConfig = () => {
    switch (guardianState) {
      case 'deviation':
        return {
          bg: 'bg-rose-950/40 border-rose-500/80',
          text: 'ANOMALY DETECTED',
          textColor: 'text-safety-rose',
          speech: 'Path deviation detected. Verify your safety now, or I will alert your emergency network!',
          avatarClass: 'bg-safety-rose border-rose-400 animate-ping'
        };
      case 'running':
        return {
          bg: 'bg-rose-950/40 border-rose-500/80',
          text: 'VELOCITY ANOMALY',
          textColor: 'text-safety-rose',
          speech: 'Sudden high-velocity movement detected! Confirm your safety immediately!',
          avatarClass: 'bg-safety-rose border-rose-400 animate-pulse'
        };
      case 'stoppage':
        return {
          bg: 'bg-amber-950/40 border-amber-500/80',
          text: 'STOPPAGE ANOMALY',
          textColor: 'text-safety-amber',
          speech: 'You have stopped in a high-hazard perimeter. Please verify you are safe.',
          avatarClass: 'bg-safety-amber border-amber-400 animate-pulse'
        };
      case 'sos':
        return {
          bg: 'bg-red-950/60 border-red-500/90',
          text: 'BEACON ACTIVE',
          textColor: 'text-red-500',
          speech: 'Emergency dispatched. GPS telemetry and safety streams broadcasting to your net.',
          avatarClass: 'bg-red-600 border-white animate-bounce'
        };
      default:
        if (proximityAlert) {
          return {
            bg: 'bg-amber-950/30 border-amber-500/50',
            text: 'CAUTION ZONE',
            textColor: 'text-safety-amber',
            speech: `Caution. Approaching ${proximityAlert.message} nearby. Recommend safe detour.`,
            avatarClass: 'bg-safety-amber border-amber-300 animate-pulse'
          };
        }
        return {
          bg: 'bg-slate-900/60 border-safety-border',
          text: 'MONITOR ACTIVE',
          textColor: 'text-safety-emerald',
          speech: 'Telemetry links synced. I am monitoring your walking velocity and coordinate vectors.',
          avatarClass: 'bg-safety-emerald border-yellow-300'
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className={`glass-panel rounded-2xl p-5 border transition-all duration-500 ${config.bg}`}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-safety-accent" />
          <h3 className="font-bold text-slate-100">AI Guardian Avatar</h3>
        </div>
        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${config.textColor} border-current bg-slate-950/80`}>
          {config.text}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Animated Avatar Icon */}
        <div className="relative shrink-0">
          <div className={`absolute -inset-1 rounded-full opacity-35 ${config.avatarClass}`}></div>
          <div className="relative w-14 h-14 rounded-full bg-slate-950 border border-safety-border flex items-center justify-center shadow-inner">
            {guardianState && guardianState !== 'idle' ? (
              <ShieldAlert className={`w-7 h-7 ${config.textColor}`} />
            ) : (
              <Shield className={`w-7 h-7 ${config.textColor}`} />
            )}
          </div>
        </div>

        {/* Speech bubble */}
        <div className="flex-1 bg-slate-950/60 border border-safety-border/60 rounded-xl p-3.5 relative">
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-safety-border/60 border-b-[6px] border-b-transparent"></div>
          
          <div className="flex items-start gap-1 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Guardian AI Advice</span>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed italic">
            "{config.speech}"
          </p>
        </div>
      </div>
    </div>
  );
}
