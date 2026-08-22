import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Compass, AlertTriangle, ShieldCheck, ArrowRight, 
  RotateCcw, Play, Pause, Zap, Clock, ShieldAlert, Eye, Volume2 
} from 'lucide-react';
import { evaluatePointRiskOffline, getDistanceMeters } from '../services/edgeRiskEngine';
import { playHapticTone, playPreEntryWarningAudio } from '../services/audioSynthesis';

export default function TwoMinutePrediction({
  userLocation,
  routes,
  selectedRouteType,
  onSelectRouteType,
  onSafetyTwinUpdate,
  addReplayLog,
  showToast,
  language = 'en'
}) {
  const [lookaheadSeconds, setLookaheadSeconds] = useState(120);
  const [isPlayingLookahead, setIsPlayingLookahead] = useState(false);
  const [preemptiveWarning, setPreemptiveWarning] = useState(null);

  const isHindi = language === 'hi';
  const voiceLineEn = "Warning: Don't go through this route, it is not safe! Kavach AI advises an immediate detour to the verified safe corridor.";
  const voiceLineHi = "चेतावनी: इस मार्ग से मत जाओ, यह सुरक्षित नहीं है! कवच AI आपको तुरंत सुरक्षित मार्ग पर जाने की सलाह देता है।";

  const activeRoute = routes ? (selectedRouteType === 'safe' ? routes.safe : selectedRouteType === 'shadow' ? routes.shadow : routes.standard) : null;
  const pathCoordinates = activeRoute ? activeRoute.path : [];

  // Calculate coordinates ahead along the path
  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) {
      setPreemptiveWarning(null);
      return;
    }

    const distanceAheadMeters = lookaheadSeconds * 1.3;
    let accumulatedDist = 0;
    let targetCoord = pathCoordinates[0];

    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      const p1 = pathCoordinates[i];
      const p2 = pathCoordinates[i + 1];
      const segDist = getDistanceMeters(p1[0], p1[1], p2[0], p2[1]);

      if (accumulatedDist + segDist >= distanceAheadMeters) {
        const segRatio = (distanceAheadMeters - accumulatedDist) / Math.max(segDist, 1);
        targetCoord = [
          p1[0] + (p2[0] - p1[0]) * segRatio,
          p1[1] + (p2[1] - p1[1]) * segRatio
        ];
        break;
      }
      accumulatedDist += segDist;
      if (i === pathCoordinates.length - 2) {
        targetCoord = pathCoordinates[pathCoordinates.length - 1];
      }
    }

    if (onSafetyTwinUpdate) {
      onSafetyTwinUpdate(targetCoord);
    }
  }, [lookaheadSeconds, pathCoordinates, onSafetyTwinUpdate]);

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length === 0) {
      setPreemptiveWarning(null);
      return;
    }

    const totalSteps = pathCoordinates.length;
    const targetIdx = Math.min(
      Math.floor((lookaheadSeconds / 120) * (totalSteps - 1)),
      totalSteps - 1
    );
    const targetCoord = pathCoordinates[targetIdx];

    if (!targetCoord) {
      setPreemptiveWarning(null);
      return;
    }

    if (onSafetyTwinUpdate) {
      onSafetyTwinUpdate(targetCoord);
    }

    // Evaluate prospective danger at the lookahead coordinate
    const evalResult = evaluatePointRiskOffline(targetCoord[0], targetCoord[1]);

    if (evalResult.riskScore >= 65) {
      const warningObj = {
        secondsAhead: lookaheadSeconds,
        dangerType: evalResult.riskScore > 75 ? 'Critical Danger Corridor' : 'High Theft & Poor Visibility Zone',
        riskPct: evalResult.riskScore,
        locationName: evalResult.nearestNode,
        recommendedAction: isHindi ? 'सुरक्षित गलियारे की ओर तुरंत डायवर्ट करें' : 'Preemptive Detour to Protected Corridor'
      };
      setPreemptiveWarning(warningObj);
    } else {
      setPreemptiveWarning(null);
    }
  }, [lookaheadSeconds, pathCoordinates, selectedRouteType, isHindi]);

  // Automated scrubbing simulation
  useEffect(() => {
    let interval = null;
    if (isPlayingLookahead) {
      interval = setInterval(() => {
        setLookaheadSeconds(prev => {
          if (prev >= 120) return 0;
          return prev + 15;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingLookahead]);

  const handlePreemptiveDivert = () => {
    playHapticTone('subtle');
    onSelectRouteType('safe');
    if (showToast) showToast(isHindi ? '🔮 2-मिनट अग्रिम सुरक्षा डायवर्जन सक्रिय!' : '🔮 2-Min Preemptive Detour Activated: Danger zone bypassed!', 'success');
    if (addReplayLog) addReplayLog('success', '2-Min Lookahead: Preemptive detour accepted. Danger zone bypassed.');
  };

  const steps = [
    { sec: 0, label: 'Now (0s)' },
    { sec: 30, label: '+30s (~40m)' },
    { sec: 60, label: '+60s (~80m)' },
    { sec: 90, label: '+90s (~120m)' },
    { sec: 120, label: '+120s (~160m)' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/40">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">
              {isHindi ? '2-मिनट अग्रिम खतरा पूर्वानुमान' : '2-Minutes Ahead Safety Prediction'}
            </h3>
            <p className="text-[10px] text-violet-300 font-semibold">
              {isHindi ? 'खतरनाक मार्ग में प्रवेश से पहले अग्रिम चेतावनी' : 'Predicts and diverts before physical entry'}
            </p>
          </div>
        </div>
        <span className="text-[9px] uppercase font-extrabold tracking-wider bg-violet-500/10 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Compass className="w-3 h-3 text-violet-400 animate-spin-slow" /> Forward Radar
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {isHindi 
          ? 'कवच AI आपके आगे के 120 सेकंड के मार्ग को स्कैन करता है ताकि खतरे में प्रवेश करने से पहले ही आपको चेतावनी दी जा सके।' 
          : 'Kavach AI scans your heading 120 seconds into the future. Drag the scrubber or press play to preview future hazard intersections before you step into them.'}
      </p>

      {/* Pre-Entry Warning Banner (Triggered before entry!) */}
      {preemptiveWarning ? (
        <div className="bg-rose-950/30 border border-rose-500/60 rounded-xl p-3.5 flex flex-col gap-2.5 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-safety-rose shrink-0" />
              <span className="text-xs font-black text-rose-300 uppercase tracking-wide">
                {isHindi ? `अग्रिम चेतावनी (+${preemptiveWarning.secondsAhead}s आगे)` : `Pre-Entry Warning (+${preemptiveWarning.secondsAhead}s Ahead)`}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
              {preemptiveWarning.riskPct}% Risk
            </span>
          </div>

          <p className="text-xs text-slate-200">
            {isHindi 
              ? `अगले ${preemptiveWarning.secondsAhead} सेकंड में आपका मार्ग ${preemptiveWarning.locationName} (${preemptiveWarning.dangerType}) से होकर गुजरता है।`
              : `In ${preemptiveWarning.secondsAhead} seconds, your current path intersects ${preemptiveWarning.locationName} (${preemptiveWarning.dangerType}).`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => playPreEntryWarningAudio(isHindi ? voiceLineHi : voiceLineEn, null, language)}
              className="flex items-center gap-1 text-[11px] font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 px-3 py-1.5 rounded-xl transition shadow"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>🔊 {isHindi ? '2-लाइन आवाज चेतावनी सुनें' : '🔊 Play 2-Line Voice Warning ("Don\'t go this route")'}</span>
            </button>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-rose-500/30 flex items-center justify-between gap-3 mt-1">
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-safety-amber shrink-0" />
              <span>{isHindi ? 'सलाह: सुरक्षित मार्ग अपनाएं' : `Recommended: ${preemptiveWarning.recommendedAction}`}</span>
            </div>
            <button
              onClick={handlePreemptiveDivert}
              className="bg-safety-emerald hover:bg-yellow-600 text-slate-950 font-black text-xs py-1.5 px-3 rounded-lg transition shrink-0 flex items-center gap-1 shadow-lg shadow-yellow-500/20"
            >
              <ArrowRight className="w-3.5 h-3.5" /> {isHindi ? 'तुरंत डायवर्ट करें' : 'Divert Now'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-950/20 border border-yellow-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-yellow-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-safety-emerald" />
            <span>{isHindi ? 'आगे का मार्ग सुरक्षित है (+120s तक कोई खतरा नहीं)।' : 'Forward lookahead corridor is clear (Safe trajectory for +120s).'}</span>
          </div>
          <button
            onClick={() => playPreEntryWarningAudio(isHindi ? voiceLineHi : voiceLineEn, null, language)}
            className="flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-slate-300 hover:text-yellow-300 border border-slate-700 px-2.5 py-1 rounded-lg transition shrink-0"
          >
            <Volume2 className="w-3 h-3 text-yellow-400" />
            <span>{isHindi ? 'आवाज अलर्ट टेस्ट करें' : 'Test Pre-Entry Voice Alert'}</span>
          </button>
        </div>
      )}

      {/* Interactive Lookahead Scrubber Bar */}
      <div className="bg-safety-dark/30 border border-safety-border/60 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" /> Prospective Time Horizon:
          </span>
          <span className="text-violet-400 font-mono font-bold text-sm">
            +{lookaheadSeconds} Seconds Ahead (~{Math.round(lookaheadSeconds * 1.3)}m)
          </span>
        </div>

        {/* Range Slider */}
        <input 
          type="range"
          min="0"
          max="120"
          step="5"
          value={lookaheadSeconds}
          onChange={(e) => setLookaheadSeconds(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />

        {/* Step ticks */}
        <div className="flex justify-between text-[9px] text-slate-500 font-bold">
          {steps.map(s => (
            <button
              key={s.sec}
              onClick={() => setLookaheadSeconds(s.sec)}
              className={`hover:text-violet-300 transition ${lookaheadSeconds === s.sec ? 'text-violet-400 underline font-black' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-safety-border/30 gap-2">
          <button
            onClick={() => setIsPlayingLookahead(!isPlayingLookahead)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isPlayingLookahead ? 'bg-amber-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {isPlayingLookahead ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlayingLookahead ? 'Pause Simulation' : 'Auto-Scout Horizon'}
          </button>

          <button
            onClick={() => { setLookaheadSeconds(0); setIsPlayingLookahead(false); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-safety-border"
            title="Reset Scrubber"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
