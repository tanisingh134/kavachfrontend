import React, { useState, useMemo } from 'react';
import {
  Search, Shield, MapPin, Sparkles, Sliders, Zap, Eye,
  Navigation, CheckCircle2, AlertTriangle, Radio, RefreshCw,
  Compass, ArrowRight, Lightbulb, Users, ShieldAlert, Cpu
} from 'lucide-react';
import {
  KAVACH_GRAPH_NODES,
  searchGraphNodes,
  calculateGraphRouteWithPreferences
} from '../services/graphEngine';
import { translations } from '../services/translations';
import { playHapticTone } from '../services/audioSynthesis';

export default function GraphSearchEngine({
  userLocation,
  startPoint,
  endPoint,
  setStartPoint,
  setEndPoint,
  setRoutes,
  setSelectedRouteType,
  showToast,
  addReplayLog,
  language = 'en'
}) {
  const t = translations[language] || translations.en;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedNode, setSelectedNode] = useState(KAVACH_GRAPH_NODES[0]);

  // Preference Presets: 'max_shield', 'fast_direct', 'lit_arterial', 'high_crowd', 'haven_escort', 'custom'
  const [activePreset, setActivePreset] = useState('max_shield');

  // Multi-Objective Sliders & Weights (0 - 100)
  const [safetyWeight, setSafetyWeight] = useState(85);
  const [speedWeight, setSpeedWeight] = useState(40);
  const [minLightingLux, setMinLightingLux] = useState(75);
  const [crowdWeight, setCrowdWeight] = useState(65);
  const [cctvPoliceBonus, setCctvPoliceBonus] = useState(80);

  // Safety Toggles
  const [avoidAlleys, setAvoidAlleys] = useState(true);
  const [avoidUnverified, setAvoidUnverified] = useState(true);
  const [prioritizeHavens, setPrioritizeHavens] = useState(true);

  // Commuter Profile
  const [commuterProfile, setCommuterProfile] = useState('solo_night');

  // Filtered nodes list
  const filteredNodes = useMemo(() => {
    return searchGraphNodes(searchQuery, activeCategory, userLocation);
  }, [searchQuery, activeCategory, userLocation]);

  // Preset configuration handler
  const handleSelectPreset = (presetKey) => {
    setActivePreset(presetKey);
    playHapticTone('subtle');

    if (presetKey === 'max_shield') {
      setSafetyWeight(95);
      setSpeedWeight(30);
      setMinLightingLux(85);
      setCrowdWeight(70);
      setCctvPoliceBonus(95);
      setAvoidAlleys(true);
      setPrioritizeHavens(true);
      setCommuterProfile('solo_night');
    } else if (presetKey === 'fast_direct') {
      setSafetyWeight(45);
      setSpeedWeight(95);
      setMinLightingLux(40);
      setCrowdWeight(30);
      setCctvPoliceBonus(35);
      setAvoidAlleys(false);
      setPrioritizeHavens(false);
      setCommuterProfile('rapid_transit');
    } else if (presetKey === 'lit_arterial') {
      setSafetyWeight(80);
      setSpeedWeight(50);
      setMinLightingLux(90);
      setCrowdWeight(60);
      setCctvPoliceBonus(70);
      setAvoidAlleys(true);
      setPrioritizeHavens(true);
      setCommuterProfile('student');
    } else if (presetKey === 'high_crowd') {
      setSafetyWeight(75);
      setSpeedWeight(45);
      setMinLightingLux(70);
      setCrowdWeight(95);
      setCctvPoliceBonus(65);
      setAvoidAlleys(true);
      setPrioritizeHavens(true);
      setCommuterProfile('student');
    } else if (presetKey === 'haven_escort') {
      setSafetyWeight(90);
      setSpeedWeight(35);
      setMinLightingLux(80);
      setCrowdWeight(75);
      setCctvPoliceBonus(100);
      setAvoidAlleys(true);
      setPrioritizeHavens(true);
      setCommuterProfile('senior');
    }
  };

  // Live Graph Computation
  const calculatedGraphRoute = useMemo(() => {
    const origin = startPoint || [28.6328, 77.2185];
    const destination = endPoint || [28.6225, 77.2215];

    return calculateGraphRouteWithPreferences(origin, destination, {
      safetyWeight,
      speedWeight,
      minLightingLux,
      crowdWeight,
      cctvPoliceBonus,
      avoidAlleys,
      avoidUnverified,
      prioritizeHavens,
      commuterProfile
    });
  }, [
    startPoint, endPoint, safetyWeight, speedWeight,
    minLightingLux, crowdWeight, cctvPoliceBonus,
    avoidAlleys, avoidUnverified, prioritizeHavens, commuterProfile
  ]);

  // Apply Calculated Custom Graph Route into App's active routing engine
  const handleApplyToMainMap = () => {
    if (!calculatedGraphRoute) return;
    playHapticTone('success');

    if (setRoutes) {
      setRoutes(prev => ({
        ...(prev || {}),
        standard: prev?.standard || { path: calculatedGraphRoute.path, safetyScore: 60, riskLevel: 'Medium', durationMins: 11, distanceKm: 1.0 },
        safe: {
          path: calculatedGraphRoute.path,
          safetyScore: calculatedGraphRoute.safetyScore,
          riskLevel: calculatedGraphRoute.riskLevel,
          durationMins: calculatedGraphRoute.durationMins,
          distanceKm: calculatedGraphRoute.totalDistanceKm,
          crimeCount: 0,
          isGraphEngine: true,
          avgLux: calculatedGraphRoute.avgLux,
          cctvCount: calculatedGraphRoute.cctvCount,
          havensCount: calculatedGraphRoute.havensCount
        },
        shadow: prev?.shadow || { path: calculatedGraphRoute.path, safetyScore: 95, riskLevel: 'Low', durationMins: 15, distanceKm: 1.2 }
      }));
    }
    if (setSelectedRouteType) setSelectedRouteType('safe');

    if (showToast) {
      showToast(
        language === 'hi'
          ? `✓ ग्राफ मार्ग लागू: सुरक्षा स्कोर ${calculatedGraphRoute.safetyScore}% (${calculatedGraphRoute.totalDistanceKm} किमी)`
          : `✓ Graph Route Armed: Safety Score ${calculatedGraphRoute.safetyScore}% (${calculatedGraphRoute.totalDistanceKm} km)`,
        'success'
      );
    }
    if (addReplayLog) {
      addReplayLog('info', `Graph Search AI: Evaluated route with ${activePreset} profile.`);
    }
  };

  const handleSetStart = (node) => {
    playHapticTone('subtle');
    if (setStartPoint) setStartPoint([node.lat, node.lng]);
    if (showToast) showToast(`📍 Start Point (A) set to: ${node.name}`, 'info');
  };

  const handleSetEnd = (node) => {
    playHapticTone('subtle');
    if (setEndPoint) setEndPoint([node.lat, node.lng]);
    if (showToast) showToast(`🏁 Destination (B) set to: ${node.name}`, 'info');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-safety-border/70 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-950/80 border border-violet-500/50 text-violet-300 shadow-lg">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              {t.graphSearchTitle}
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Multi-Objective Dijkstra
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {t.graphSearchSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleApplyToMainMap}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.calculateGraphRouteBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Search & Node Explorer */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Search Input Card */}
          <div className="glass-panel rounded-2xl p-4 border border-safety-border flex flex-col gap-3 shadow-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-violet-400 transition font-medium"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: t.allCategories },
                { id: 'police', label: t.catPolice },
                { id: 'metro', label: t.catMetro },
                { id: 'lit_road', label: t.catLit },
                { id: 'danger_zone', label: t.catDanger }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); playHapticTone('subtle'); }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap transition border ${
                    activeCategory === cat.id
                      ? 'bg-violet-600 text-white border-violet-400 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Nodes Results List */}
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => { setSelectedNode(node); playHapticTone('subtle'); }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-violet-950/60 border-violet-500/70 text-slate-100 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0 mt-0.5">{node.icon || '📍'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-100">{node.name}</h4>
                          {node.haven && (
                            <span className="text-[8px] uppercase font-mono px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              24/7 Haven
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{node.description}</p>
                        <div className="flex items-center gap-3 text-[9px] font-mono text-slate-400 mt-1">
                          <span className="text-amber-400">💡 {node.lights} Lux</span>
                          <span className="text-yellow-400">👥 {node.crowd}% Crowd</span>
                          {node.cctv && <span className="text-violet-400">📹 {node.cctvCount} CCTVs</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${
                        node.baseRisk > 60 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        node.baseRisk > 30 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                      }`}>
                        {100 - node.baseRisk}% Safe
                      </span>
                      {node.distanceFromUserMeters && (
                        <span className="text-[9px] text-slate-500 font-mono">
                          {node.distanceFromUserMeters}m away
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Intelligence Inspector Card */}
          {selectedNode && (
            <div className="glass-panel-glow rounded-2xl p-4 border border-violet-500/40 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-safety-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedNode.icon || '📍'}</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-100">{selectedNode.name}</h3>
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{selectedNode.id}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-500/40">
                  {selectedNode.type}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.baseRisk}</span>
                  <span className={`font-black ${selectedNode.baseRisk > 50 ? 'text-rose-400' : 'text-yellow-400'}`}>
                    {selectedNode.baseRisk}%
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.lightingLux}</span>
                  <span className="font-black text-amber-400">{selectedNode.lights} Lux</span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.crowdFootfall}</span>
                  <span className="font-black text-yellow-400">{selectedNode.crowd}%</span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.cctvCoverage}</span>
                  <span className="font-black text-violet-400">{selectedNode.cctvCount || 0} Units</span>
                </div>
              </div>

              {/* Set Origin / Destination Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleSetStart(selectedNode)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.setStartNode}</span>
                </button>

                <button
                  onClick={() => handleSetEnd(selectedNode)}
                  className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/60 text-rose-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.setEndNode}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: User Preferences Matrix & Route Optimization Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Commuter Persona & Presets */}
          <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-yellow-400" />
                {t.prefPresetsTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a tuned safety strategy or customize mathematical weights</p>
            </div>

            {/* Preset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { id: 'max_shield', title: t.presetMaxShield, desc: t.presetMaxShieldDesc, color: 'border-yellow-500/50 bg-yellow-950/30' },
                { id: 'fast_direct', title: t.presetFastDirect, desc: t.presetFastDirectDesc, color: 'border-violet-500/50 bg-violet-950/30' },
                { id: 'lit_arterial', title: t.presetLitArterial, desc: t.presetLitArterialDesc, color: 'border-amber-500/50 bg-amber-950/30' },
                { id: 'high_crowd', title: t.presetHighCrowd, desc: t.presetHighCrowdDesc, color: 'border-violet-500/50 bg-violet-950/30' },
                { id: 'haven_escort', title: t.presetHavenEscort, desc: t.presetHavenEscortDesc, color: 'border-yellow-500/50 bg-yellow-950/30' },
                { id: 'custom', title: t.presetCustom, desc: t.presetCustomDesc, color: 'border-violet-500/50 bg-violet-950/30' }
              ].map(preset => {
                const isActive = activePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                      isActive
                        ? `${preset.color} ring-2 ring-violet-400/60 shadow-lg scale-[1.02]`
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-100">{preset.title}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{preset.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Commuter Persona Mode */}
            <div className="border-t border-safety-border/60 pt-3 flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t.commuterProfileTitle}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'solo_night', label: t.profileSoloNight },
                  { id: 'student', label: t.profileStudent },
                  { id: 'senior', label: t.profileSenior },
                  { id: 'two_wheeler', label: t.profileTwoWheeler },
                  { id: 'cyclist', label: t.profileCyclist },
                  { id: 'rapid_transit', label: t.profileRapidTransit }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setCommuterProfile(p.id); setActivePreset('custom'); playHapticTone('subtle'); }}
                    className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold text-left transition ${
                      commuterProfile === p.id
                        ? 'bg-violet-600 text-white border-violet-400 shadow'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preference Tuning Sliders */}
            <div className="border-t border-safety-border/60 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">{t.safetyWeightLabel}</span>
                  <span className="text-yellow-400 font-mono">{safetyWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={safetyWeight}
                  onChange={(e) => { setSafetyWeight(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">{t.speedWeightLabel}</span>
                  <span className="text-violet-400 font-mono">{speedWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={speedWeight}
                  onChange={(e) => { setSpeedWeight(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">{t.minLightingLabel}</span>
                  <span className="text-amber-400 font-mono">{minLightingLux} Lux</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={minLightingLux}
                  onChange={(e) => { setMinLightingLux(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">{t.crowdWeightLabel}</span>
                  <span className="text-violet-400 font-mono">{crowdWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={crowdWeight}
                  onChange={(e) => { setCrowdWeight(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Safety Constraint Toggles */}
            <div className="border-t border-safety-border/60 pt-3 flex flex-col gap-2">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <span className="text-xs font-bold text-slate-300">{t.toggleAvoidAlleys}</span>
                <input
                  type="checkbox"
                  checked={avoidAlleys}
                  onChange={(e) => { setAvoidAlleys(e.target.checked); setActivePreset('custom'); }}
                  className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <span className="text-xs font-bold text-slate-300">{t.togglePrioritizeHavens}</span>
                <input
                  type="checkbox"
                  checked={prioritizeHavens}
                  onChange={(e) => { setPrioritizeHavens(e.target.checked); setActivePreset('custom'); }}
                  className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Graph Route Optimization Result Matrix */}
          {calculatedGraphRoute && (
            <div className="glass-panel-glow rounded-2xl p-5 border border-yellow-500/40 flex flex-col gap-3 shadow-xl">
              <div className="flex justify-between items-center border-b border-safety-border/60 pb-2">
                <h3 className="text-xs font-black text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  {t.graphComparisonTitle}
                </h3>
                <span className="text-[10px] font-bold text-yellow-300 font-mono">
                  {calculatedGraphRoute.pathNodes.length} Graph Waypoints
                </span>
              </div>

              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.colDistance}</span>
                  <span className="font-black text-slate-100">{calculatedGraphRoute.totalDistanceKm} km</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.colDuration}</span>
                  <span className="font-black text-violet-300">{calculatedGraphRoute.durationMins} min</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.colSafetyScore}</span>
                  <span className="font-black text-yellow-400">{calculatedGraphRoute.safetyScore}%</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.colAvgLux}</span>
                  <span className="font-black text-amber-400">{calculatedGraphRoute.avgLux} Lux</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.colCctvNodes}</span>
                  <span className="font-black text-violet-400">{calculatedGraphRoute.cctvCount}</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[8px] uppercase">{t.colHazardsAvoided}</span>
                  <span className="font-black text-rose-400">{calculatedGraphRoute.hazardsAvoided}</span>
                </div>
              </div>

              {/* Explanation statement */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-yellow-300">Graph AI Analysis: </span>
                {calculatedGraphRoute.aiExplanation}
              </div>

              {/* Apply Route CTA Button */}
              <button
                onClick={handleApplyToMainMap}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Graph Route to Live Map & Telemetry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
