import React from 'react';
import { Sparkles, Clock, ShieldAlert } from 'lucide-react';

export default function SafetyTwinProjection({ safetyHour, onHourChange, routeInfo }) {
  // Convert hour number to readable string (e.g. 18 -> 6 PM, 24 -> 12 AM, 28 -> 4 AM)
  const formatHour = (h) => {
    const hour24 = h % 24;
    const period = hour24 >= 12 && hour24 < 24 ? 'PM' : 'AM';
    const displayHour = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
  };

  // Mock safety forecast coordinates timeline based on temporal multipliers
  const timelineForecasts = [
    { hour: 18, timeLabel: '06:00 PM', riskPct: 18, status: 'Safe' },
    { hour: 20, timeLabel: '08:00 PM', riskPct: 32, status: 'Low Risk' },
    { hour: 22, timeLabel: '10:00 PM', riskPct: 54, status: 'Moderate' },
    { hour: 24, timeLabel: '12:00 AM', riskPct: 78, status: 'High Risk' },
    { hour: 26, timeLabel: '02:00 AM', riskPct: 91, status: 'Critical' },
    { hour: 28, timeLabel: '04:00 AM', riskPct: 65, status: 'High Risk' },
    { hour: 30, timeLabel: '06:00 AM', riskPct: 22, status: 'Safe' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border">
      {/* Title */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          <h3 className="font-bold text-slate-100">Digital Safety Twin</h3>
        </div>
        <span className="text-[10px] text-violet-300 font-bold uppercase bg-violet-950 border border-violet-500/30 px-2.5 py-0.5 rounded-full">
          Temporal Predictor
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        Your safety profile twin runs prospective models. Slide the departure timer to simulate how time-of-day dynamics expand threat perimeters.
      </p>

      {/* Slider Control */}
      <div className="bg-safety-dark/30 border border-safety-border/50 rounded-xl p-4 flex flex-col gap-2 mb-4">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-safety-accent" /> Departure Time:</span>
          <span className="text-violet-400 font-bold">{formatHour(safetyHour)}</span>
        </div>
        
        <input 
          type="range"
          min="18" // 6 PM
          max="30" // 6 AM next day
          step="1"
          value={safetyHour}
          onChange={(e) => onHourChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-safety-border rounded-lg appearance-none cursor-pointer accent-violet-500 mt-2"
        />
        
        <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1">
          <span>06:00 PM</span>
          <span>12:00 AM</span>
          <span>06:00 AM</span>
        </div>
      </div>

      {/* Risk Index Timeline Chart */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safety Twin Forecast (12-Hour Outlook)</h4>
        
        <div className="flex flex-col gap-2">
          {timelineForecasts.map((item) => {
            const isSelected = item.hour === safetyHour || (safetyHour >= item.hour && safetyHour < item.hour + 2);
            return (
              <div 
                key={item.hour}
                className={`transition-all duration-300 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isSelected 
                    ? 'bg-violet-950/40 border-violet-500 text-slate-100 shadow-lg shadow-violet-900/10' 
                    : 'bg-safety-dark/20 border-safety-border/40 text-slate-400 hover:bg-safety-dark/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-violet-400 animate-ping' : 'bg-slate-600'}`}></span>
                  <span className="font-bold">{item.timeLabel}</span>
                </div>

                {/* Progress bar timeline */}
                <div className="flex-1 max-w-[140px] mx-4">
                  <div className="w-full bg-safety-border h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        item.riskPct >= 75 ? 'bg-safety-rose' :
                        item.riskPct >= 45 ? 'bg-safety-amber' : 'bg-safety-emerald'
                      }`}
                      style={{ width: `${item.riskPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-right w-20 justify-end">
                  <span className="font-semibold text-[10px]">{item.riskPct}% Risk</span>
                  <span className={`text-[9px] font-bold uppercase ${
                    item.riskPct >= 75 ? 'text-safety-rose' :
                    item.riskPct >= 45 ? 'text-safety-amber' : 'text-safety-emerald'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
