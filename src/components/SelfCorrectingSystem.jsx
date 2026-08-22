import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, Send, MapPin, Activity, Zap, Users, ShieldAlert,
  TrendingUp, TrendingDown, ArrowRight, Gauge, Radio, Play, Pause,
  CornerDownRight, Eye, Shield, Sliders
} from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';

export default function SelfCorrectingSystem({
  heatmapData,
  setHeatmapData,
  onVoteAlert,
  onMarkSafe,
  showToast,
  addReplayLog,
  userLocation
}) {
  // Flagship Self-Correction State
  const [previousRisk, setPreviousRisk] = useState(35);
  const [currentRisk, setCurrentRisk] = useState(67);
  const [confidenceScore, setConfidenceScore] = useState(81);
  const [lastEventDescription, setLastEventDescription] = useState('Observed context changed: Telemetry anomaly detected');
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);

  // Active causal factors breakdown
  const [causalReasons, setCausalReasons] = useState([
    { id: 'crowd', text: 'Crowd density decreased', detail: '-42% footfall drop', weight: '+12' },
    { id: 'isolated', text: 'User entered isolated segment', detail: 'Lux dropped to 18%', weight: '+10' },
    { id: 'historical', text: 'Historical risk increased', detail: 'Night crime modifier active', weight: '+6' },
    { id: 'deviation', text: 'Route deviation detected', detail: '85m off verified path', weight: '+4' }
  ]);

  // Telemetry Telemetry Sensor Signals (Live Values)
  const [telemetryState, setTelemetryState] = useState({
    crowdFlow: 28,          // 28%
    walkingSpeed: 0.4,       // 0.4 m/s (slow/stoppage)
    pathDeviationMeters: 85, // 85 meters
    ambientLux: 18,          // 18% light
    nearbyAlertsCount: 2,    // 2 active alerts
    batteryPct: 62           // 62%
  });

  // Neighborhood and calibration stats
  const [safePassageNotes, setSafePassageNotes] = useState('');
  const [selectedSector, setSelectedSector] = useState('Janpath Corridor');
  const [neighborhoodStats, setNeighborhoodStats] = useState([
    { name: 'Connaught Place Central', safetyScore: 94, status: 'STABLE', verifications: 142 },
    { name: 'Janpath Corridor', safetyScore: 68, status: 'CAUTION', verifications: 58 },
    { name: 'Shivaji Stadium Area', safetyScore: 54, status: 'ELEVATED RISK', verifications: 34 },
    { name: 'Jantar Mantar Lane', safetyScore: 46, status: 'VOLATILE', verifications: 19 }
  ]);

  const [calibrationFeed, setCalibrationFeed] = useState([
    { time: '22:04', user: 'Kavach AI Engine', sector: 'Janpath Corridor', action: 'Telemetry anomaly recalibration applied (Risk: 35 → 67)', delta: '+32 Delta' },
    { time: '21:50', user: 'Priya S. (Verified)', sector: 'Janpath Corridor', action: 'Safe Passage Confirmed', delta: '+4% Safety' },
    { time: '21:42', user: 'Aarav M. (Citizen)', sector: 'CP Inner Circle', action: 'IoT Streetlight #12 Verified Fixed', delta: '+2% Safety' },
    { time: '21:25', user: 'Community Guard', sector: 'Shivaji Stadium', action: 'Police Patrol Unit Active', delta: '+6% Safety' }
  ]);

  // Telemetry Trigger Injectors
  const handleInjectScenario = (scenarioType) => {
    playHapticTone('alert');
    let prev = currentRisk;
    let nextRisk = 67;
    let nextConf = 81;
    let desc = '';
    let reasons = [];
    let tel = { ...telemetryState };

    if (scenarioType === 'crowd_drop') {
      nextRisk = 58;
      nextConf = 86;
      desc = 'Observed context changed: Severe crowd dispersal in Janpath alley';
      tel.crowdFlow = 12;
      reasons = [
        { id: 'crowd', text: 'Crowd density decreased', detail: 'Footfall plummeted to 12%', weight: '+15' },
        { id: 'isolated', text: 'Isolation index heightened', detail: 'No bystander density within 150m', weight: '+8' }
      ];
    } else if (scenarioType === 'stoppage') {
      nextRisk = 74;
      nextConf = 88;
      desc = 'Observed context changed: Prolonged user pace deceleration & stoppage detected';
      tel.walkingSpeed = 0.1;
      reasons = [
        { id: 'pace', text: 'User walking speed dropped', detail: '1.4 m/s → 0.1 m/s (stationary in unlit zone)', weight: '+18' },
        { id: 'isolated', text: 'User entered isolated segment', detail: 'Prolonged pause at blind junction', weight: '+12' },
        { id: 'historical', text: 'Sector risk coefficient high', detail: 'Historical evening incident cluster', weight: '+9' }
      ];
    } else if (scenarioType === 'route_deviation') {
      nextRisk = 67;
      nextConf = 81;
      desc = 'Observed context changed: Route deviation & dark corridor ingress';
      tel.pathDeviationMeters = 110;
      reasons = [
        { id: 'crowd', text: 'Crowd density decreased', detail: 'Footfall dropped below nominal threshold', weight: '+12' },
        { id: 'isolated', text: 'User entered isolated segment', detail: 'Ambient lighting dropped to 18 Lux', weight: '+10' },
        { id: 'historical', text: 'Historical risk increased', detail: 'Late night danger multiplier applied', weight: '+6' },
        { id: 'deviation', text: 'Route deviation detected', detail: '110m away from verified safe corridor', weight: '+4' }
      ];
    } else if (scenarioType === 'light_failure') {
      nextRisk = 79;
      nextConf = 91;
      desc = 'Observed context changed: Streetlight grid failure detected on sector telemetry';
      tel.ambientLux = 8;
      reasons = [
        { id: 'light', text: 'Streetlight infrastructure blacked out', detail: 'Photocell lux dropped to 8%', weight: '+22' },
        { id: 'isolated', text: 'Zero visual range corridor', detail: 'Shadow zone extends 250m ahead', weight: '+14' },
        { id: 'cctv', text: 'Optical CCTV blindspot active', detail: 'Camera obstruction confirmed', weight: '+8' }
      ];
    } else if (scenarioType === 'incident_alert') {
      nextRisk = 88;
      nextConf = 94;
      desc = 'Observed context changed: Real-time harassment alert broadcast in current quadrant';
      tel.nearbyAlertsCount = 4;
      reasons = [
        { id: 'alert', text: 'Verified live incident broadcast', detail: 'Reported <180m from current coordinate', weight: '+26' },
        { id: 'crowd', text: 'Crowd density decreased', detail: 'Bystander evacuation observed', weight: '+14' },
        { id: 'historical', text: 'Historical risk escalated', detail: 'Quadrant status flipped to CRITICAL', weight: '+13' }
      ];
    } else if (scenarioType === 'safe_checkpoint') {
      nextRisk = 22;
      nextConf = 96;
      desc = 'Observed context changed: User arrived at Connaught Place Police Haven Checkpoint';
      tel.crowdFlow = 75;
      tel.ambientLux = 95;
      tel.pathDeviationMeters = 0;
      tel.walkingSpeed = 1.3;
      reasons = [
        { id: 'safe_haven', text: 'Safe Haven entry verified', detail: 'Officer stationed & CCTV active', weight: '-38' },
        { id: 'lights', text: 'High Lux lighting verified', detail: 'Photocell lux at 95%', weight: '-15' }
      ];
    } else {
      // Reset to initial baseline
      prev = 67;
      nextRisk = 35;
      nextConf = 85;
      desc = 'Observed context changed: Standard nominal corridor conditions restored';
      tel.crowdFlow = 60;
      tel.ambientLux = 70;
      tel.pathDeviationMeters = 0;
      tel.walkingSpeed = 1.2;
      reasons = [
        { id: 'normal', text: 'Corridor footfall normalized', detail: 'Continuous bystander presence', weight: '-18' },
        { id: 'light', text: 'Standard illumination active', detail: 'Streetlights operational', weight: '-14' }
      ];
    }

    setPreviousRisk(prev);
    setCurrentRisk(nextRisk);
    setConfidenceScore(nextConf);
    setLastEventDescription(desc);
    setCausalReasons(reasons);
    setTelemetryState(tel);

    const deltaSign = nextRisk >= prev ? `+${nextRisk - prev}` : `${nextRisk - prev}`;
    const logMsg = `Self-Correcting AI: Prediction updated from ${prev} to ${nextRisk} (${deltaSign}). Reason: ${reasons[0]?.text}`;
    
    if (showToast) {
      showToast(`🔄 AI Self-Corrected: Risk ${prev} → ${nextRisk} (${deltaSign})!`, nextRisk > 60 ? 'warning' : 'success');
    }
    if (addReplayLog) {
      addReplayLog(nextRisk > 60 ? 'warning' : 'info', logMsg);
    }

    // Add to calibration event stream
    const newLog = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: 'Kavach Belief Engine',
      sector: 'Active Sector',
      action: `${desc} (Risk: ${prev} → ${nextRisk})`,
      delta: `${deltaSign} Risk`
    };
    setCalibrationFeed(prevLogs => [newLog, ...prevLogs.slice(0, 15)]);
  };

  // Auto-Streaming Simulation
  useEffect(() => {
    let interval = null;
    if (isLiveStreaming) {
      const scenarios = ['crowd_drop', 'stoppage', 'route_deviation', 'light_failure', 'safe_checkpoint'];
      let idx = 0;
      interval = setInterval(() => {
        const nextScenario = scenarios[idx % scenarios.length];
        idx++;
        handleInjectScenario(nextScenario);
      }, 4500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveStreaming, currentRisk]);

  // Submit Safe Passage Calibration from Citizen
  const handleSubmitSafePassage = () => {
    setNeighborhoodStats(prev => prev.map(sec => {
      if (sec.name === selectedSector) {
        const newScore = Math.min(99, sec.safetyScore + 5);
        return {
          ...sec,
          safetyScore: newScore,
          verifications: sec.verifications + 1,
          status: newScore > 75 ? 'STABLE' : newScore > 55 ? 'CAUTION' : 'VOLATILE'
        };
      }
      return sec;
    }));

    const newEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'You (Verified Citizen)',
      sector: selectedSector,
      action: safePassageNotes || 'Safe Passage Confirmed & Streetlights Lit',
      delta: '+5% Safety'
    };
    setCalibrationFeed(prev => [newEntry, ...prev]);

    if (showToast) showToast(`🔄 Self-Correction Applied: ${selectedSector} safety score recalibrated (+5%)!`, 'success');
    if (addReplayLog) addReplayLog('success', `Self-Correcting System: Real-time user calibration applied to ${selectedSector}.`);
    setSafePassageNotes('');
  };

  const riskDelta = currentRisk - previousRisk;
  const isElevated = currentRisk > previousRisk;

  return (
    <div className="flex flex-col gap-5">
      {/* Header Banner */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-yellow-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-safety-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-950/70 border border-yellow-500/50 shadow-lg shadow-yellow-900/30">
              <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100 tracking-tight">Real-Time Self-Correcting AI Engine</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  Dynamic Belief Revision
                </span>
              </div>
              <p className="text-xs text-slate-300">Continuous Bayesian Recalibration upon New Telemetry Signals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                isLiveStreaming
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-900/40'
                  : 'bg-slate-900/80 text-yellow-300 border-yellow-500/40 hover:bg-slate-800'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveStreaming ? 'Streaming Telemetry...' : 'Auto-Stream Telemetry'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          Static risk numbers fail in living cities. When new telemetry streams in (crowd flow changes, pace deceleration, route deviations, broken lights), Kavach AI instantly updates its internal safety belief state and proves <strong>exactly WHY</strong>.
        </p>
      </div>

      {/* Flagship "Prediction Update" Showcase Card (Exactly as requested!) */}
      <div className="glass-panel rounded-2xl p-5 border border-safety-border shadow-2xl relative overflow-hidden flex flex-col gap-4">
        
        {/* Card Header */}
        <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-violet-400 animate-pulse" />
            <h3 className="font-extrabold text-slate-100 text-sm tracking-wide uppercase">
              Prediction Update
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Bayesian Belief Recalibration
          </span>
        </div>

        {/* Observed Context Changed Alert Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
          isElevated 
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' 
            : 'bg-yellow-950/40 border-yellow-500/50 text-yellow-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Activity className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{lastEventDescription}</span>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-950/80 border border-current shrink-0">
            {isElevated ? 'Elevated Delta' : 'Risk Normalized'}
          </span>
        </div>

        {/* Score Comparison Display Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Previous Risk */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Previous Risk</span>
            <span className="text-3xl font-black text-slate-300 font-mono mt-1">{previousRisk}</span>
            <span className="text-[10px] text-slate-500 mt-1">Nominal Corridor Prior</span>
          </div>

          {/* Current Risk */}
          <div className={`border p-4 rounded-xl flex flex-col items-center justify-center text-center relative ${
            currentRisk > 60 
              ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-900/20' 
              : currentRisk > 35 
                ? 'bg-amber-950/30 border-amber-500/60' 
                : 'bg-yellow-950/30 border-yellow-500/60'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Current Risk</span>
            <span className={`text-4xl font-black font-mono mt-1 ${
              currentRisk > 60 ? 'text-rose-400' : currentRisk > 35 ? 'text-amber-400' : 'text-yellow-400'
            }`}>
              {currentRisk}
            </span>
            <span className="text-[10px] font-bold text-slate-300 mt-1">Updated Posterior State</span>
          </div>

          {/* Change Delta */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Change</span>
            <span className={`text-3xl font-black font-mono mt-1 ${
              riskDelta > 0 ? 'text-rose-400' : riskDelta < 0 ? 'text-yellow-400' : 'text-slate-300'
            }`}>
              {riskDelta > 0 ? `+${riskDelta}` : riskDelta}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              {riskDelta > 0 ? '⚠️ Risk Escalated' : riskDelta < 0 ? '🛡️ Risk Mitigated' : 'Steady State'}
            </span>
          </div>

        </div>

        {/* Reason ("Show WHY") Checklist */}
        <div className="bg-slate-950/90 border border-safety-border/60 rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase text-violet-300 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Reason (Causal Telemetry Attribution):
            </span>
            <span className="text-[10px] font-mono text-slate-400">Multi-Factor Decomposition</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {causalReasons.map((reason, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100">{reason.text}</span>
                    <p className="text-[10px] text-slate-400">{reason.detail}</p>
                  </div>
                </div>

                <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                  reason.weight.startsWith('+') 
                    ? 'text-amber-300 bg-amber-950/50 border border-amber-500/30' 
                    : 'text-yellow-300 bg-yellow-950/50 border border-yellow-500/30'
                }`}>
                  {reason.weight}
                </span>
              </div>
            ))}
          </div>

          {/* Confidence Meter Bar */}
          <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-violet-400" /> Confidence:
              </span>
              <span className="font-mono font-extrabold text-violet-300">{confidenceScore}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-yellow-400 transition-all duration-700"
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Telemetry Injector Controls */}
      <div className="glass-panel rounded-2xl p-5 border border-safety-border shadow-xl flex flex-col gap-3">
        <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">Interactive Telemetry Ingestion Suite</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Click to test live AI belief shifts</span>
        </div>

        <p className="text-xs text-slate-300">
          Trigger real-world sensor shifts to observe how the AI dynamically revises its risk coefficients:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
          <button
            onClick={() => handleInjectScenario('crowd_drop')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
              <Users className="w-3.5 h-3.5" /> Crowd Density Drop
            </div>
            <span className="text-[10px] text-slate-400">Simulate -45% footfall</span>
          </button>

          <button
            onClick={() => handleInjectScenario('stoppage')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
              <Activity className="w-3.5 h-3.5" /> User Stoppage
            </div>
            <span className="text-[10px] text-slate-400">Pace drops to 0.1 m/s</span>
          </button>

          <button
            onClick={() => handleInjectScenario('route_deviation')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-violet-500 text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-violet-400 font-extrabold text-xs">
              <CornerDownRight className="w-3.5 h-3.5" /> Route Deviation
            </div>
            <span className="text-[10px] text-slate-400">+85m into unlit alley</span>
          </button>

          <button
            onClick={() => handleInjectScenario('light_failure')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs">
              <Zap className="w-3.5 h-3.5" /> Streetlight Outage
            </div>
            <span className="text-[10px] text-slate-400">Lux drops to 8%</span>
          </button>

          <button
            onClick={() => handleInjectScenario('incident_alert')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs">
              <ShieldAlert className="w-3.5 h-3.5" /> Incident Broadcast
            </div>
            <span className="text-[10px] text-slate-400">Nearby alert active</span>
          </button>

          <button
            onClick={() => handleInjectScenario('safe_checkpoint')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500 text-left transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-yellow-400 font-extrabold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Haven Checkpoint
            </div>
            <span className="text-[10px] text-slate-400">Police station entry</span>
          </button>
        </div>

        <div className="flex justify-end mt-1">
          <button
            onClick={() => handleInjectScenario('reset')}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono"
          >
            Reset to Baseline (Risk 35)
          </button>
        </div>
      </div>

      {/* Citizen Feedback Loop & Sector Barometer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Neighborhood Live Barometer */}
        <div className="bg-slate-950/70 border border-safety-border/60 rounded-xl p-4 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-yellow-400" /> Dynamic Sector Safety Indices
          </span>

          <div className="flex flex-col gap-2.5">
            {neighborhoodStats.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300 text-[11px]">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                      item.safetyScore >= 75 ? 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30' :
                      item.safetyScore >= 55 ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' :
                      'text-rose-300 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {item.status}
                    </span>
                    <span className="font-mono font-bold text-slate-100">{item.safetyScore}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      item.safetyScore >= 75 ? 'bg-yellow-400' :
                      item.safetyScore >= 55 ? 'bg-amber-400' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${item.safetyScore}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Safe Passage Form */}
        <div className="bg-slate-950/70 border border-safety-border/60 rounded-xl p-4 flex flex-col gap-2.5 justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" /> Submit Citizen Passage Calibration
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Verify sector status to inject ground-truth observations into the AI model.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-yellow-500"
            >
              {neighborhoodStats.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="e.g. 'Streetlights repaired, guard on duty'"
              value={safePassageNotes}
              onChange={(e) => setSafePassageNotes(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-yellow-500"
            />

            <button
              onClick={handleSubmitSafePassage}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/20"
            >
              <Send className="w-3.5 h-3.5" /> Submit Calibration (+5% Sector Safety)
            </button>
          </div>
        </div>

      </div>

      {/* Real-time Community Calibration Feed */}
      <div className="glass-panel rounded-2xl p-4 border border-safety-border flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Live Telemetry & Belief Revision Stream
        </span>
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto font-mono text-[10px]">
          {calibrationFeed.map((entry, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center text-slate-300">
              <div className="truncate mr-2">
                <span className="text-slate-500 font-bold">{entry.time}</span> · <span className="font-bold text-violet-300">{entry.user}</span>: {entry.action}
              </div>
              <span className="text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-500/30 px-1.5 py-0.5 rounded shrink-0">
                {entry.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
