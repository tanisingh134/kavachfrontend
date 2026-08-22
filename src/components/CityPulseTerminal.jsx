import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Navigation, ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

export default function CityPulseTerminal() {
  const [pulseData, setPulseData] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchCityPulse();
    const interval = setInterval(fetchCityPulse, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCityPulse = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/city-pulse`);
      const data = await res.json();
      setPulseData(data);
      if (data.recentLogs) {
        setLogs(data.recentLogs);
      }
    } catch (err) {
      console.error('Failed to load city pulse metrics:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'STABLE': return 'bg-yellow-500/10 text-safety-emerald border-safety-emerald/30';
      case 'CAUTION': return 'bg-amber-500/10 text-safety-amber border-safety-amber/30';
      case 'ALERT': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'VOLATILE': return 'bg-rose-500/10 text-safety-rose border-safety-rose/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getLogColor = (status) => {
    switch (status) {
      case 'success': return 'text-safety-emerald';
      case 'warning': return 'text-safety-amber';
      case 'danger': return 'text-safety-rose';
      case 'info': return 'text-safety-accent';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-safety-rose animate-pulse" />
          <h3 className="font-bold text-slate-100">Safety Pulse of the City</h3>
        </div>
        <span className="text-[9px] bg-slate-900/60 border border-safety-border px-2.5 py-1 rounded-full flex items-center gap-1.5 text-slate-400">
          <Radio className="w-3 h-3 text-safety-rose animate-pulse" /> Live Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector Index Status */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sector Safety Indices</h4>
          
          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {pulseData?.sectorStatus.map((sector, idx) => (
              <div key={idx} className="bg-safety-dark/30 border border-safety-border/45 rounded-xl p-3 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{sector.name}</span>
                    <span className="flex items-center gap-0.5">
                      {sector.safetyIndex}% Safe
                      {sector.trend === 'increasing' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-safety-emerald" />
                      ) : sector.trend === 'decreasing' ? (
                        <ArrowDownRight className="w-3.5 h-3.5 text-safety-rose" />
                      ) : null}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-safety-border h-1 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        sector.safetyIndex >= 80 ? 'bg-safety-emerald' :
                        sector.safetyIndex >= 60 ? 'bg-safety-amber' : 'bg-safety-rose'
                      }`}
                      style={{ width: `${sector.safetyIndex}%` }}
                    ></div>
                  </div>
                </div>
                <div className={`ml-3.5 text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusColor(sector.status)}`}>
                  {sector.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Logs Terminal Ticker */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Community Dispatch Terminal</h4>
          
          <div className="bg-slate-950/80 border border-safety-border rounded-xl p-3 h-56 font-mono text-[10px] flex flex-col gap-2 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2 items-start border-b border-safety-border/20 pb-1.5">
                <span className="text-slate-500 font-bold shrink-0">{log.timestamp}</span>
                <span className="text-slate-400 font-bold shrink-0">[{log.sector}]</span>
                <span className={`leading-normal ${getLogColor(log.status)}`}>
                  {log.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
