import React, { useState } from 'react';
import { 
  Bot, ShieldAlert, PhoneCall, Volume2, Radio, EyeOff, 
  CheckCircle2, Play, Flame, PhoneOff, Camera, Zap, AlertTriangle 
} from 'lucide-react';
import { 
  startPanicSiren, stopPanicSiren, playHapticTone, 
  startFakeCallRingtone, stopFakeCallRingtone, speakDeterrentVoice, stopSpeechDeterrent 
} from '../services/audioSynthesis';

export default function AIAlertEscalation({
  currentLevel = 1,
  onEscalate,
  triggerPanicSOS,
  showToast,
  addReplayLog,
  setSosFlasher
}) {
  const [activeTier, setActiveTier] = useState(currentLevel);
  const [incomingCallActive, setIncomingCallActive] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [callerName, setCallerName] = useState('Inspector Sharma (CP Police)');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [simulatedScenario, setSimulatedScenario] = useState(null);

  // Trigger Tier 1: Stealth Guidance
  const triggerTier1 = () => {
    setActiveTier(1);
    playHapticTone('subtle');
    if (showToast) showToast('🔕 Level 1 Activated: Stealth Guidance. Screen dimmed, silent reroute active.', 'info');
    if (addReplayLog) addReplayLog('info', 'AI Escalation: Level 1 (Stealth Guidance) engaged. Aggressor alert suppressed.');
  };

  // Trigger Tier 2: Fake Incoming Call Deterrent
  const triggerTier2 = (name = 'Inspector Sharma (CP Police)') => {
    setActiveTier(2);
    setCallerName(name);
    setIncomingCallActive(true);
    setCallAnswered(false);
    startFakeCallRingtone();
    if (showToast) showToast('📞 Level 2 Activated: Incoming Fake Call deterrent initiated!', 'warning');
    if (addReplayLog) addReplayLog('warning', 'AI Escalation: Level 2 (Fake Incoming Call) deployed to deter potential stalkers.');
  };

  // Answer Fake Call
  const handleAnswerCall = () => {
    stopFakeCallRingtone();
    setCallAnswered(true);
    speakDeterrentVoice(`Hey! I see you on the corner near Janpath, I'm right outside with Officer Sharma from CP Police. Come over to the vehicle now!`);
    if (showToast) showToast('🗣️ Playing loud deterrent audio over loudspeaker...', 'warning');
  };

  // Hangup Fake Call
  const handleHangupCall = () => {
    stopFakeCallRingtone();
    stopSpeechDeterrent();
    setIncomingCallActive(false);
    setCallAnswered(false);
  };

  // Trigger Tier 3: Silent Mesh SOS
  const triggerTier3 = () => {
    setActiveTier(3);
    playHapticTone('warning');
    triggerPanicSOS();
    if (showToast) showToast('📡 Level 3 Activated: Silent encrypted beacon dispatched to trusted network.', 'error');
    if (addReplayLog) addReplayLog('sos', 'AI Escalation: Level 3 (Silent Mesh Beacon) deployed to Emergency Contacts & Police.');
  };

  // Trigger Tier 4: Full Panic Alarm & Strobe
  const triggerTier4 = () => {
    setActiveTier(4);
    setIsSirenActive(true);
    startPanicSiren();
    setSosFlasher(true);
    triggerPanicSOS();
    if (showToast) showToast('🚨 Level 4 Activated: Full Strobe + 105dB Siren + Evidence Burst!', 'error');
    if (addReplayLog) addReplayLog('sos', 'AI Escalation: Level 4 (FULL PANIC ALARM) engaged. Siren & Strobe active.');

    setTimeout(() => {
      stopPanicSiren();
      setIsSirenActive(false);
      setSosFlasher(false);
    }, 8000);
  };

  // AI Autonomous Decision Scenario Simulator
  const simulateScenario = (type) => {
    setSimulatedScenario(type);
    if (type === 'tailing') {
      triggerTier2('Dad (Emergency Alert)');
    } else if (type === 'unresponsive') {
      triggerTier3();
    } else if (type === 'attack') {
      triggerTier4();
    } else if (type === 'dark_alley') {
      triggerTier1();
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/40">
            <Bot className="w-5 h-5 text-safety-accent animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">AI Autonomous Alert Escalation</h3>
            <p className="text-[10px] text-violet-300 font-semibold">Tiered Response: Stealth to Full Panic</p>
          </div>
        </div>

        <span className="text-[9px] uppercase font-extrabold bg-violet-500/20 border border-violet-500/40 text-violet-300 px-2.5 py-1 rounded-full">
          Tier {activeTier}/4 Active
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        The AI assesses danger context and chooses the optimal defense tier. A wrong turn gets silent guidance; an overt threat triggers fake calls or blinding strobes.
      </p>

      {/* 4-Tier Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Tier 1 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
          activeTier === 1 ? 'bg-violet-950/40 border-violet-500 shadow-md shadow-violet-900/20' : 'bg-safety-dark/30 border-safety-border/40'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-violet-300">
              <span className="flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" /> Tier 1: Stealth Guidance</span>
              {activeTier === 1 && <span className="text-[8px] bg-violet-500 text-white px-1.5 py-0.2 rounded font-black">ACTIVE</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Silent haptic vibration & covert detour. Does not draw aggressor attention.</p>
          </div>
          <button
            onClick={triggerTier1}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold py-1.5 px-2 rounded-lg border border-slate-700 transition"
          >
            Simulate Tier 1
          </button>
        </div>

        {/* Tier 2 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
          activeTier === 2 ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-900/20' : 'bg-safety-dark/30 border-safety-border/40'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-safety-amber">
              <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> Tier 2: Fake Call Deterrent</span>
              {activeTier === 2 && <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">ACTIVE</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">High-fidelity incoming call & loud police voice deterrent script.</p>
          </div>
          <button
            onClick={() => triggerTier2()}
            className="w-full bg-amber-950/60 hover:bg-amber-900 text-amber-200 text-[10px] font-bold py-1.5 px-2 rounded-lg border border-amber-500/40 transition"
          >
            Launch Fake Call
          </button>
        </div>

        {/* Tier 3 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
          activeTier === 3 ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-900/20' : 'bg-safety-dark/30 border-safety-border/40'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-safety-rose">
              <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> Tier 3: Silent Mesh SOS</span>
              {activeTier === 3 && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black">ACTIVE</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Encrypted GPS coordinate broadcast to emergency contacts & police dispatch.</p>
          </div>
          <button
            onClick={triggerTier3}
            className="w-full bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-[10px] font-bold py-1.5 px-2 rounded-lg border border-rose-500/40 transition"
          >
            Dispatch Silent Mesh
          </button>
        </div>

        {/* Tier 4 */}
        <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
          activeTier === 4 ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-900/30' : 'bg-safety-dark/30 border-safety-border/40'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-red-400">
              <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Tier 4: Full Panic Alarm</span>
              {activeTier === 4 && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black animate-pulse">SIREN ON</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">105dB synthesized siren + high-frequency screen strobe + camera evidence burst.</p>
          </div>
          <button
            onClick={triggerTier4}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-black py-1.5 px-2 rounded-lg transition shadow-lg shadow-red-600/30"
          >
            {isSirenActive ? '🚨 Siren Sounding...' : 'Sound Panic Siren'}
          </button>
        </div>
      </div>

      {/* Autonomous AI Scenario Playground */}
      <div className="bg-slate-950/60 border border-safety-border/40 rounded-xl p-3.5 flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-violet-400" /> Test AI Escalation Scenarios
        </span>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <button
            onClick={() => simulateScenario('dark_alley')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-left font-medium transition"
          >
            🌙 Turn into Unlit Alley &rarr; <span className="text-violet-400 font-bold">Pick Tier 1</span>
          </button>
          <button
            onClick={() => simulateScenario('tailing')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-left font-medium transition"
          >
            👣 Suspicious Person Following &rarr; <span className="text-amber-400 font-bold">Pick Tier 2</span>
          </button>
          <button
            onClick={() => simulateScenario('unresponsive')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-left font-medium transition"
          >
            ⏱️ Stoppage in Red Zone &rarr; <span className="text-rose-400 font-bold">Pick Tier 3</span>
          </button>
          <button
            onClick={() => simulateScenario('attack')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-left font-medium transition"
          >
            💥 Scream Spike / Struggle &rarr; <span className="text-red-400 font-bold">Pick Tier 4</span>
          </button>
        </div>
      </div>

      {/* 📱 Interactive Tier 2 Fake Incoming Call Modal Overlay */}
      {incomingCallActive && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-xs w-full p-6 text-center flex flex-col items-center gap-6 shadow-2xl animate-fade-in">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                👮
              </div>
              <h3 className="text-base font-black text-slate-100">{callerName}</h3>
              <p className="text-xs text-safety-amber font-mono font-bold animate-pulse">
                {callAnswered ? '00:06 (Connected - Speaker On)' : 'Incoming Emergency Call...'}
              </p>
            </div>

            {callAnswered ? (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 italic flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-safety-amber animate-pulse shrink-0" />
                <span>"Hey! I'm right outside at the corner with Officer Sharma from CP Police..."</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Answer call to play loud synthesized voice deterrent over loudspeaker.
              </p>
            )}

            <div className="flex items-center justify-center gap-8 w-full">
              {!callAnswered ? (
                <>
                  <button
                    onClick={handleHangupCall}
                    className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition transform hover:scale-110"
                    title="Decline"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handleAnswerCall}
                    className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-yellow-500/30 transition transform hover:scale-110 animate-pulse"
                    title="Answer & Play Deterrent"
                  >
                    <PhoneCall className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleHangupCall}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" /> End Deterrent Call
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
