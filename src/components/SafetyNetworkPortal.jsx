import React, { useEffect, useState } from 'react';
import {
  Shield, MapPin, Radio, BellRing, PhoneCall, AlertTriangle,
  AlertCircle, Send, CheckCircle2, User, Battery, Phone
} from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';
import { translations } from '../services/translations';

export default function SafetyNetworkPortal({
  userLocation,
  socket,
  currentUser,
  contacts = [],
  onAddContact,
  onSendCheckIn,
  batteryLevel = 85,
  showToast,
  language = 'en'
}) {
  const t = translations[language] || translations.en;
  const [networkAlerts, setNetworkAlerts] = useState([
    { timestamp: '17:02', text: 'Telemetry sync completed. Device monitoring active.', level: 0 },
    { timestamp: '16:45', text: 'Weekly check-in logged: safe arrival at home CP Block A.', level: 0 }
  ]);

  // Listen to Socket.io events for Level 2/3 Guardian escalations in real-time
  useEffect(() => {
    if (!socket) return;

    socket.on('guardian-dispatch-alert', (data) => {
      const newAlert = {
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ [Escalation Level ${data.escalationLevel}] Anomaly alert: ${data.flagReason}. Coords: [${data.location[0].toFixed(4)}, ${data.location[1].toFixed(4)}].`,
        level: data.escalationLevel,
        explainableAI: data.explainableAI
      };
      setNetworkAlerts((prev) => [newAlert, ...prev]);
    });

    socket.on('sos-active', (data) => {
      const sosAlert = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '🆘 [EMERGENCY ALARM] Panic SOS Beacon deployed! Citizen in critical danger!',
        level: 3
      };
      setNetworkAlerts((prev) => [sosAlert, ...prev]);
    });

    return () => {
      socket.off('guardian-dispatch-alert');
      socket.off('sos-active');
    };
  }, [socket]);

  const handleManualCheckIn = () => {
    playHapticTone('success');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lat = userLocation ? userLocation[0].toFixed(4) : '28.6304';
    const lng = userLocation ? userLocation[1].toFixed(4) : '77.2177';

    const checkInMsg = {
      timestamp: time,
      text: `✓ I AM SAFE: Check-in ping broadcasted to family contacts. Location: (${lat}, ${lng})`,
      level: 0
    };
    setNetworkAlerts(prev => [checkInMsg, ...prev]);

    if (onSendCheckIn) {
      onSendCheckIn(checkInMsg);
    } else if (showToast) {
      showToast('👨‍👩‍👧 Family Check-in broadcast sent successfully!', 'success');
    }
  };

  const getAlertStyle = (level) => {
    if (level === 3) return 'bg-red-950/40 border-red-500/50 text-red-200 animate-pulse';
    if (level === 2) return 'bg-rose-950/30 border-rose-500/40 text-rose-200';
    if (level === 1) return 'bg-amber-950/30 border-amber-500/40 text-amber-200';
    return 'bg-safety-dark/30 border-safety-border/60 text-slate-300';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-safety-border flex flex-col gap-6 max-w-2xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center pb-3 border-b border-safety-border/40">
        <div className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-safety-emerald animate-pulse" />
          <div>
            <h3 className="font-extrabold text-slate-100 text-lg">{t.tabSafetyNetwork}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Parent & Guardian Viewport</p>
          </div>
        </div>
        <span className="text-[10px] text-safety-emerald font-bold uppercase bg-yellow-950 border border-yellow-500/30 px-3 py-0.5 rounded-full flex items-center gap-1">
          <Radio className="w-3 h-3 text-safety-emerald animate-pulse" /> Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Live coordinates telemetry */}
        <div className="flex flex-col gap-3.5 bg-safety-dark/30 p-4 rounded-xl border border-safety-border/60">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Citizen Telemetry</h4>

          <div className="flex flex-col gap-2.5">
            <div>
              <span className="text-slate-400 text-xs block">Active User:</span>
              <span className="font-bold text-xs text-slate-200">
                {currentUser && currentUser.name ? currentUser.name : 'Citizen Guardian'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Live Coordinates:</span>
              <span className="font-mono text-xs text-violet-400 font-bold flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {userLocation
                  ? `${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}`
                  : '28.63040, 77.21770 (CP Delhi Grid)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Battery & Signal:</span>
              <span className="font-mono text-xs text-yellow-400 font-bold flex items-center gap-1 mt-0.5">
                <Battery className="w-3.5 h-3.5" />
                {batteryLevel}% Battery • 5G Full Signal
              </span>
            </div>
          </div>

          {/* Quick Check-In Broadcast Button */}
          <button
            onClick={handleManualCheckIn}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send "I am Safe" Check-In Ping</span>
          </button>
        </div>

        {/* Right column: Safety Dispatch Logs */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Guardian Alert Dispatch Logs</h4>

          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {networkAlerts.map((alert, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex gap-2.5 items-start text-xs transition ${getAlertStyle(alert.level)}`}>
                {alert.level >= 2 ? (
                  <AlertTriangle className="w-4 h-4 text-safety-rose shrink-0 mt-0.5" />
                ) : (
                  <BellRing className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex gap-2 items-center text-[10px] text-slate-400 font-semibold mb-0.5">
                    <span>{alert.timestamp}</span>
                    {alert.level >= 2 && <span className="text-safety-rose font-black">CRITICAL</span>}
                  </div>
                  <p className="leading-relaxed">{alert.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
