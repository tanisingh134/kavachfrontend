import React, { useState, useMemo } from 'react';
import { 
  GitBranch, Sparkles, Shield, Clock, AlertTriangle, CheckCircle2, 
  ArrowRight, Sliders, Zap, MapPin, Eye, Compass, Volume2, 
  ChevronRight, ShieldAlert, TrendingDown, RefreshCw
} from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';

export default function CounterfactualSimulator({
  routes,
  selectedRouteType,
  onSelectRouteType,
  startPoint,
  endPoint,
  userLocation,
  showToast,
  addReplayLog
}) {
  // What-If Simulation parameters
  const [timeHour, setTimeHour] = useState(22); // 10 PM
  const [lightGrid, setLightGrid] = useState(65); // 65% lit
  const [crowdDensity, setCrowdDensity] = useState(40); // 40% crowd
  const [policeUnits, setPoliceUnits] = useState(2); // 2 patrols
  const [selectedBranch, setSelectedBranch] = useState('safe'); // 'standard' (A), 'safe' (B), 'fast' (C), 'shadow' (D)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Dynamic counterfactual model recalculation
  const counterfactualData = useMemo(() => {
    // Baseline multipliers
    let nightFactor = 1.0;
    if (timeHour >= 22 && timeHour < 26) nightFactor = 1.25;
    else if (timeHour >= 26 || timeHour < 5) nightFactor = 1.55;
    else if (timeHour >= 6 && timeHour < 18) nightFactor = 0.65;

    const lightDeficit = (100 - lightGrid) * 0.25;
    const crowdDeficit = (100 - crowdDensity) * 0.20;
    const patrolShield = policeUnits * 9;

    // Route A (Current Direct Path)
    const baseA = 58 + lightDeficit + crowdDeficit;
    const riskA = Math.min(96, Math.max(25, Math.round(baseA * nightFactor - (patrolShield * 0.4))));
    const timeA = 14;

    // Route B (Safe Protected Perimeter - CP Ring)
    const baseB = 26 + (lightDeficit * 0.3) + (crowdDeficit * 0.4);
    const riskB = Math.min(85, Math.max(12, Math.round(baseB * (nightFactor * 0.85) - patrolShield)));
    const timeB = 17; // +3 min
    const deltaRiskB = Math.round(((riskA - riskB) / riskA) * 100);

    // Route C (Fast Transit Connector)
    const baseC = 42 + (lightDeficit * 0.6) + (crowdDeficit * 0.5);
    const riskC = Math.min(90, Math.max(18, Math.round(baseC * (nightFactor * 0.95) - (patrolShield * 0.6))));
    const timeC = 13; // -1 min
    const deltaRiskC = Math.round(((riskA - riskC) / riskA) * 100);

    // Route D (Maximum Haven Escort - Shadow Corridor)
    const baseD = 18 + (lightDeficit * 0.15) + (crowdDeficit * 0.2);
    const riskD = Math.min(75, Math.max(8, Math.round(baseD * (nightFactor * 0.75) - (patrolShield * 1.3))));
    const timeD = 19; // +5 min
    const deltaRiskD = Math.round(((riskA - riskD) / riskA) * 100);

    return {
      routeA: {
        id: 'standard',
        name: 'Route A: Direct Transit (Current)',
        code: 'Route A',
        risk: riskA,
        time: timeA,
        timeDelta: 0,
        riskDeltaPct: 0,
        lighting: Math.max(15, lightGrid - 30),
        patrols: Math.max(0, policeUnits - 1),
        description: 'Direct cut through Janpath unlit alley. High vulnerability at late hours.',
        zone: 'Janpath Unlit Corridor',
        color: riskA > 65 ? 'rose' : riskA > 40 ? 'amber' : 'teal'
      },
      routeB: {
        id: 'safe',
        name: 'Route B: Protected CP Ring (Recommended)',
        code: 'Route B',
        risk: riskB,
        time: timeB,
        timeDelta: +3,
        riskDeltaPct: deltaRiskB,
        lighting: Math.min(98, lightGrid + 25),
        patrols: policeUnits,
        description: 'Routes via lit outer ring and 24/7 commercial storefronts.',
        zone: 'CP Central Outer Boulevard',
        color: 'teal'
      },
      routeC: {
        id: 'fast',
        name: 'Route C: Fast Metro Arterial',
        code: 'Route C',
        risk: riskC,
        time: timeC,
        timeDelta: -1,
        riskDeltaPct: deltaRiskC,
        lighting: lightGrid,
        patrols: Math.max(0, policeUnits - 1),
        description: 'Bypasses pedestrian alley via fast vehicular arterial road.',
        zone: 'Barakhamba Road Blvd',
        color: riskC > 50 ? 'amber' : 'teal'
      },
      routeD: {
        id: 'shadow',
        name: 'Route D: Guardian Shadow Corridor',
        code: 'Route D',
        risk: riskD,
        time: timeD,
        timeDelta: +5,
        riskDeltaPct: deltaRiskD,
        lighting: Math.min(99, lightGrid + 35),
        patrols: policeUnits + 1,
        description: 'Intersects 3 police outposts & 24/7 emergency medical kiosks.',
        zone: 'Police Haven Secured Line',
        color: 'teal'
      }
    };
  }, [timeHour, lightGrid, crowdDensity, policeUnits]);

  const activeBranchData = counterfactualData[
    selectedBranch === 'standard' ? 'routeA' : 
    selectedBranch === 'safe' ? 'routeB' : 
    selectedBranch === 'fast' ? 'routeC' : 'routeD'
  ];

  // Natural Language AI Synthesis
  const aiVerdict = useMemo(() => {
    if (selectedBranch === 'safe') {
      return `Changing to Route B adds 3 minutes (+21% travel time) but reduces predicted exposure by ${counterfactualData.routeB.riskDeltaPct}% (Risk ${counterfactualData.routeA.risk} → ${counterfactualData.routeB.risk}) while boosting streetlight coverage to ${counterfactualData.routeB.lighting}%.`;
    } else if (selectedBranch === 'fast') {
      return `Route C saves 1 minute (-7% travel time) with a ${counterfactualData.routeC.riskDeltaPct}% risk reduction (Risk ${counterfactualData.routeA.risk} → ${counterfactualData.routeC.risk}), but crosses a moderate blindspot near Barakhamba.`;
    } else if (selectedBranch === 'shadow') {
      return `Changing to Route D adds 5 minutes for maximum armor, reducing risk by ${counterfactualData.routeD.riskDeltaPct}% (Risk ${counterfactualData.routeA.risk} → ${counterfactualData.routeD.risk}) with direct line-of-sight to ${counterfactualData.routeD.patrols} active police stations.`;
    } else {
      return `Route A is your current baseline: shortest route (14 min) but carries elevated risk (${counterfactualData.routeA.risk}/100) due to unmonitored Janpath corridor exposure.`;
    }
  }, [selectedBranch, counterfactualData]);

  const handleApplyRoute = (routeId) => {
    playHapticTone('success');
    if (onSelectRouteType) onSelectRouteType(routeId === 'fast' ? 'safe' : routeId);
    if (showToast) showToast(`⭐ Counterfactual Detour Applied: Switched navigation to ${activeBranchData.code}!`, 'success');
    if (addReplayLog) addReplayLog('success', `Counterfactual Engine: Adopted ${activeBranchData.name}. Predicted risk reduced.`);
  };

  const handleSpeakVerdict = () => {
    if (!('speechSynthesis' in window)) {
      if (showToast) showToast('Speech synthesis not supported on this browser.', 'warning');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(aiVerdict);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Flagship Header Card */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-violet-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-safety-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-950/70 border border-violet-500/50 shadow-lg shadow-violet-900/30">
              <GitBranch className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100 tracking-tight">Counterfactual Safety Simulator</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  What-If AI
                </span>
              </div>
              <p className="text-xs text-slate-300">Simultaneous Multi-Route Evaluation & Exposure Trade-Off Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              Origin A → Destination B
            </span>
          </div>
        </div>

        {/* Natural Language AI Synthesis Hero Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-950/70 via-slate-900/80 to-yellow-950/50 border border-violet-500/30 shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-black uppercase text-violet-300 tracking-wider">AI Counterfactual Synthesis</span>
            </div>
            <button
              onClick={handleSpeakVerdict}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                isSpeaking 
                  ? 'bg-violet-600 text-white border-violet-400 animate-pulse' 
                  : 'bg-slate-900/80 text-violet-300 hover:text-white border-violet-500/40'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" /> {isSpeaking ? 'Speaking...' : 'Read Aloud'}
            </button>
          </div>

          <p className="text-sm font-semibold text-slate-100 leading-relaxed font-sans">
            “{aiVerdict}”
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Selected Path:</span>
              <span className="font-bold text-slate-100 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {activeBranchData.name}
              </span>
              <span className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded ${
                activeBranchData.risk <= 35 ? 'text-yellow-300 bg-yellow-950/60 border border-yellow-500/30' :
                activeBranchData.risk <= 60 ? 'text-amber-300 bg-amber-950/60 border border-amber-500/30' :
                'text-rose-300 bg-rose-950/60 border border-rose-500/30'
              }`}>
                Risk: {activeBranchData.risk}/100
              </span>
            </div>

            <button
              onClick={() => handleApplyRoute(activeBranchData.id)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-yellow-500/25 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Adopt Counterfactual Route ({activeBranchData.code})
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Branching Tree + What-If Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Visual Branching Tree Diagram */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-safety-border shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-safety-border/40">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-violet-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">Simultaneous Route Branching Graph</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Click a branch node to simulate</span>
            </div>

            {/* Visual ASCII / SVG Enhanced Branching Diagram */}
            <div className="my-4 bg-slate-950/80 rounded-2xl p-5 border border-safety-border/60 relative flex flex-col items-center">
              
              {/* Root Node: Route A */}
              <div 
                onClick={() => setSelectedBranch('standard')}
                className={`cursor-pointer transition-all duration-300 w-full max-w-sm rounded-xl p-3.5 border text-center relative ${
                  selectedBranch === 'standard'
                    ? 'bg-slate-900 border-rose-500 shadow-lg shadow-rose-900/30 scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="font-extrabold text-sm text-slate-100">Route A (Current Baseline)</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                    Direct
                  </span>
                </div>
                <div className="mt-2 flex justify-around text-xs font-mono">
                  <span className="text-rose-400 font-bold">Risk: {counterfactualData.routeA.risk} (High)</span>
                  <span className="text-slate-400">⏱️ {counterfactualData.routeA.time} min</span>
                  <span className="text-slate-400">💡 {counterfactualData.routeA.lighting}% Lit</span>
                </div>
              </div>

              {/* Glowing Branching Stem Connectors */}
              <div className="w-full flex justify-center py-2 relative">
                <div className="w-0.5 h-6 bg-gradient-to-b from-rose-500 via-violet-500 to-yellow-500"></div>
              </div>
              
              <div className="w-full max-w-md border-t-2 border-dashed border-violet-500/50 relative mb-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-900 text-violet-200 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-violet-400">
                  Counterfactual Alternatives Evaluated
                </div>
              </div>

              {/* Sub-Branches Grid (Route B, Route C, Route D) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                
                {/* Branch B: Safe Perimeter */}
                <div
                  onClick={() => setSelectedBranch('safe')}
                  className={`cursor-pointer transition-all duration-300 rounded-xl p-3 border flex flex-col justify-between ${
                    selectedBranch === 'safe'
                      ? 'bg-yellow-950/40 border-yellow-400 shadow-lg shadow-yellow-900/40 scale-[1.03] ring-1 ring-yellow-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-yellow-600/60'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-yellow-300">Route B</span>
                      <span className="text-[8px] uppercase font-black px-1.5 py-0.2 rounded bg-yellow-500 text-slate-950">
                        ⭐ AI Pick
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Safe CP Ring</p>
                  </div>
                  
                  <div className="mt-3 flex flex-col gap-1 border-t border-slate-800 pt-2 font-mono text-[11px]">
                    <div className="flex justify-between font-bold text-yellow-300">
                      <span>Risk: {counterfactualData.routeB.risk}</span>
                      <span className="text-yellow-400">-{counterfactualData.routeB.riskDeltaPct}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Time: {counterfactualData.routeB.time} min</span>
                      <span className="text-amber-400 font-bold">+3 min</span>
                    </div>
                  </div>
                </div>

                {/* Branch C: Fast Arterial */}
                <div
                  onClick={() => setSelectedBranch('fast')}
                  className={`cursor-pointer transition-all duration-300 rounded-xl p-3 border flex flex-col justify-between ${
                    selectedBranch === 'fast'
                      ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/40 scale-[1.03] ring-1 ring-amber-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-amber-600/60'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-amber-300">Route C</span>
                      <span className="text-[8px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ Faster
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Barakhamba Blvd</p>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 border-t border-slate-800 pt-2 font-mono text-[11px]">
                    <div className="flex justify-between font-bold text-amber-300">
                      <span>Risk: {counterfactualData.routeC.risk}</span>
                      <span className="text-yellow-400">-{counterfactualData.routeC.riskDeltaPct}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Time: {counterfactualData.routeC.time} min</span>
                      <span className="text-yellow-400 font-bold">-1 min</span>
                    </div>
                  </div>
                </div>

                {/* Branch D: Shadow Escort */}
                <div
                  onClick={() => setSelectedBranch('shadow')}
                  className={`cursor-pointer transition-all duration-300 rounded-xl p-3 border flex flex-col justify-between ${
                    selectedBranch === 'shadow'
                      ? 'bg-violet-950/40 border-violet-400 shadow-lg shadow-violet-900/40 scale-[1.03] ring-1 ring-violet-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-violet-600/60'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-violet-300">Route D</span>
                      <span className="text-[8px] uppercase font-black px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                        🛡️ Fortified
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Police Haven Line</p>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 border-t border-slate-800 pt-2 font-mono text-[11px]">
                    <div className="flex justify-between font-bold text-violet-300">
                      <span>Risk: {counterfactualData.routeD.risk}</span>
                      <span className="text-yellow-400">-{counterfactualData.routeD.riskDeltaPct}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Time: {counterfactualData.routeD.time} min</span>
                      <span className="text-slate-400">+5 min</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Selected Branch Detail Snapshot */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-safety-border/60 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-violet-400" /> {activeBranchData.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Passing through: {activeBranchData.zone}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeBranchData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: What-If Parameter Sandbox & Pareto Matrix */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* What-If Sliders Sandbox */}
          <div className="glass-panel rounded-2xl p-5 border border-safety-border shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-yellow-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">What-If Parameter Sandbox</h3>
              </div>
              <span className="text-[9px] uppercase font-bold text-yellow-300 bg-yellow-950/60 border border-yellow-500/30 px-2 py-0.5 rounded-md">
                Live Recalibration
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Adjust environmental variables to simulate how counterfactual trade-offs shift under different urban conditions:
            </p>

            {/* Slider 1: Time of Night */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-violet-400" /> Time of Journey:
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {timeHour % 24}:00 {timeHour >= 12 && timeHour < 24 ? 'PM' : 'AM'}
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="28"
                step="1"
                value={timeHour}
                onChange={(e) => setTimeHour(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>6:00 PM (Dusk)</span>
                <span>10:00 PM (Late)</span>
                <span>4:00 AM (Graveyard)</span>
              </div>
            </div>

            {/* Slider 2: Streetlight Grid */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Streetlight Grid Integrity:
                </span>
                <span className="font-mono font-bold text-amber-400">{lightGrid}% Lit</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={lightGrid}
                onChange={(e) => setLightGrid(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10% (Blackout)</span>
                <span>50% (Partial)</span>
                <span>100% (High Lux)</span>
              </div>
            </div>

            {/* Slider 3: Crowd Density */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-yellow-400" /> Crowd Footfall Density:
                </span>
                <span className="font-mono font-bold text-yellow-400">{crowdDensity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={crowdDensity}
                onChange={(e) => setCrowdDensity(Number(e.target.value))}
                className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Deserted Alley</span>
                <span>Moderate Flow</span>
                <span>Dense Bazaar</span>
              </div>
            </div>

            {/* Slider 4: Police Outposts */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-violet-400" /> Active Security Patrols:
                </span>
                <span className="font-mono font-bold text-violet-400">{policeUnits} Units Active</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={policeUnits}
                onChange={(e) => setPoliceUnits(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Pareto Trade-Off Matrix Table */}
          <div className="glass-panel rounded-2xl p-5 border border-safety-border shadow-xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-100 text-xs uppercase tracking-wider">
                Pareto Risk-Time Trade-Off Matrix
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Multi-Objective Frontier</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Risk</th>
                    <th className="pb-2 text-right">Exposure Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr className={`cursor-pointer hover:bg-slate-900/50 ${selectedBranch === 'standard' ? 'bg-rose-950/20 font-bold' : ''}`} onClick={() => setSelectedBranch('standard')}>
                    <td className="py-2 text-rose-300">Route A</td>
                    <td className="py-2 text-slate-300">{counterfactualData.routeA.time}m</td>
                    <td className="py-2 text-rose-400">{counterfactualData.routeA.risk}</td>
                    <td className="py-2 text-right text-slate-500">Baseline</td>
                  </tr>
                  <tr className={`cursor-pointer hover:bg-slate-900/50 ${selectedBranch === 'safe' ? 'bg-yellow-950/20 font-bold' : ''}`} onClick={() => setSelectedBranch('safe')}>
                    <td className="py-2 text-yellow-300">Route B ⭐</td>
                    <td className="py-2 text-amber-300">17m (+3)</td>
                    <td className="py-2 text-yellow-400">{counterfactualData.routeB.risk}</td>
                    <td className="py-2 text-right text-yellow-400 font-bold">-{counterfactualData.routeB.riskDeltaPct}%</td>
                  </tr>
                  <tr className={`cursor-pointer hover:bg-slate-900/50 ${selectedBranch === 'fast' ? 'bg-amber-950/20 font-bold' : ''}`} onClick={() => setSelectedBranch('fast')}>
                    <td className="py-2 text-amber-300">Route C</td>
                    <td className="py-2 text-yellow-300">13m (-1)</td>
                    <td className="py-2 text-amber-400">{counterfactualData.routeC.risk}</td>
                    <td className="py-2 text-right text-yellow-400">-{counterfactualData.routeC.riskDeltaPct}%</td>
                  </tr>
                  <tr className={`cursor-pointer hover:bg-slate-900/50 ${selectedBranch === 'shadow' ? 'bg-violet-950/20 font-bold' : ''}`} onClick={() => setSelectedBranch('shadow')}>
                    <td className="py-2 text-violet-300">Route D</td>
                    <td className="py-2 text-slate-400">19m (+5)</td>
                    <td className="py-2 text-violet-400">{counterfactualData.routeD.risk}</td>
                    <td className="py-2 text-right text-yellow-400 font-bold">-{counterfactualData.routeD.riskDeltaPct}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Pareto Efficiency: <strong>Route B</strong> dominates for risk reduction per minute.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
