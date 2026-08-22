import React from 'react';
import { Play, Pause, Trash2, ShieldCheck, History } from 'lucide-react';

export default function RiskReplay({ replayLogs, onClearLogs, isReplaying, onToggleReplay }) {
  const getLogIcon = (type) => {
    switch (type) {
      case 'deviation': return '🚨';
      case 'stoppage': return '⚠️';
      case 'running': return '🏃';
      case 'sos': return '🆘';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getLogTextColor = (type) => {
    switch (type) {
      case 'deviation': return 'text-safety-rose font-semibold';
      case 'stoppage': return 'text-safety-amber font-semibold';
      case 'running': return 'text-orange-400 font-semibold';
      case 'sos': return 'text-red-500 font-black animate-pulse';
      case 'success': return 'text-safety-emerald font-semibold';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-safety-accent" />
          <h3 className="font-bold text-slate-100">AI Risk Replay Console</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleReplay}
            className={`p-1.5 rounded-lg border transition ${
              isReplaying 
                ? 'bg-safety-amber/20 border-safety-amber text-safety-amber' 
                : 'bg-slate-900 border-safety-border text-slate-400 hover:text-slate-200'
            }`}
            title={isReplaying ? 'Pause Replay' : 'Play Replay Log'}
          >
            {isReplaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1.5 bg-slate-900 border border-safety-border text-slate-400 hover:text-safety-rose rounded-lg transition"
            title="Clear Logs History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-safety-dark/30 border border-safety-border/50 rounded-xl p-4 h-[120px] overflow-y-auto flex flex-col gap-2.5">
        {replayLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <ShieldCheck className="w-8 h-8 text-slate-600 mb-1" />
            No simulation activity recorded. Start a walk to stream logs.
          </div>
        ) : (
          replayLogs.map((log, index) => (
            <div key={index} className="flex gap-2 text-xs border-b border-safety-border/10 pb-1.5 items-start">
              <span className="text-slate-500 font-mono font-bold shrink-0">{log.time}</span>
              <span className="shrink-0">{getLogIcon(log.type)}</span>
              <p className={`leading-normal flex-1 ${getLogTextColor(log.type)}`}>
                {log.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
