import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Radio, Volume2, AlertCircle, EyeOff, Smartphone, 
  Sparkles, CheckCircle2, ShieldAlert, Key, Play, Square, Calculator
} from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';

export default function SilentSOSDetector({ 
  triggerPanicSOS, 
  addReplayLog,
  showToast,
  onToggleDisguiseMode,
  isDisguiseMode
}) {
  const [decibels, setDecibels] = useState(42);
  const [soundStatus, setSoundStatus] = useState('Normal Ambient Noise');
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [micError, setMicError] = useState(null);
  
  // Stealth Tap Detector States (3 taps within 1.5s)
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [stealthTriggered, setStealthTriggered] = useState(false);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Live Web Audio API Visualizer & Decibel Meter
  const startLiveMicrophone = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsLiveListening(true);
      if (showToast) showToast('🎙️ Live Acoustic Monitor active: Listening for distress frequencies...', 'info');

      // Loop to render canvas waveform and measure volume
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute approximate decibels
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const currentDb = Math.min(110, Math.round(35 + (avg / 255) * 65));
        setDecibels(currentDb);

        // Check trigger threshold
        if (currentDb > 85) {
          setSoundStatus('CRITICAL: High Decibel Spike (>85dB)!');
          if (addReplayLog) addReplayLog('sos', `Acoustic Spike (${currentDb}dB) captured via Live Microphone.`);
          triggerPanicSOS();
        } else if (currentDb > 65) {
          setSoundStatus('Moderate voice activity');
        } else {
          setSoundStatus('Normal Ambient Background');
        }

        // Draw on canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            ctx.fillStyle = currentDb > 85 ? '#F43F5E' : currentDb > 65 ? '#F59E0B' : '#10B981';
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.warn('Microphone access not available or denied:', err);
      setMicError('Microphone not available (Use simulation buttons below).');
      setIsLiveListening(false);
    }
  };

  const stopLiveMicrophone = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setIsLiveListening(false);
    setDecibels(42);
    setSoundStatus('Standby');
  };

  useEffect(() => {
    return () => {
      stopLiveMicrophone();
    };
  }, []);

  // Stealth Rhythm Tap Handler (Triple tap within 1500ms)
  const handleStealthTap = () => {
    playHapticTone('subtle');
    const now = Date.now();
    if (now - lastTapTime > 1500) {
      setTapCount(1);
    } else {
      const nextCount = tapCount + 1;
      setTapCount(nextCount);
      if (nextCount === 3) {
        setStealthTriggered(true);
        if (showToast) showToast('🤫 Stealth Triple-Tap SOS Triggered! Dispatching covert beacon...', 'error');
        if (addReplayLog) addReplayLog('sos', 'Multimodal SOS: 3-Tap Power Gesture rhythm recognized. Stealth beacon deployed.');
        triggerPanicSOS();
        setTimeout(() => {
          setStealthTriggered(false);
          setTapCount(0);
        }, 3000);
      }
    }
    setLastTapTime(now);
  };

  // Simulators
  const simulateScream = () => {
    setSoundStatus('CRITICAL: Screaming Spike (94dB) detected!');
    setDecibels(94);
    if (addReplayLog) addReplayLog('sos', 'Silent SOS: Screaming threshold spike (94dB) detected.');
    if (showToast) showToast('🚨 Decibel Spike >85dB Detected! Auto SOS activated.', 'error');
    
    setTimeout(() => {
      triggerPanicSOS();
      setDecibels(45);
      setSoundStatus('Normal Ambient Noise');
    }, 1000);
  };

  const simulateDuressPhrase = (phrase) => {
    setSoundStatus(`CRITICAL: Duress Trigger Phrase "${phrase}" matched!`);
    setDecibels(72);
    if (addReplayLog) addReplayLog('sos', `Silent SOS: Vocal trigger codeword ("${phrase}") matched via NLP engine.`);
    if (showToast) showToast(`🎙️ Duress Codeword "${phrase}" recognized!`, 'error');
    
    setTimeout(() => {
      triggerPanicSOS();
      setDecibels(42);
      setSoundStatus('Normal Ambient Noise');
    }, 1000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4 shadow-xl">
      {/* Title */}
      <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40">
            <Mic className="w-5 h-5 text-safety-rose animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">Multimodal Silent SOS Suite</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Audio, Gesture, & Covert Triggers</p>
          </div>
        </div>

        <span className="text-[9px] bg-slate-900 border border-safety-border px-2.5 py-1 rounded-full flex items-center gap-1.5 text-slate-300 font-bold">
          <Radio className="w-3 h-3 text-safety-rose animate-pulse" /> Live Acoustic NLP
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Detect distress without taking the phone out or making noise. Uses real-time decibel analysis, whisper duress phrases, stealth tap rhythms, and app disguise.
      </p>

      {/* Live Audio Visualizer Canvas & Decibel Display */}
      <div className="bg-safety-dark/40 border border-safety-border/60 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Volume2 className={`w-4 h-4 ${decibels > 80 ? 'text-safety-rose animate-bounce' : 'text-safety-accent'}`} />
            Decibel Level:
          </span>
          <span className={`font-mono text-sm ${decibels > 80 ? 'text-safety-rose font-black animate-pulse' : 'text-violet-400'}`}>
            {decibels} dB
          </span>
        </div>

        {/* Visualizer Canvas */}
        <div className="w-full bg-slate-950 h-10 rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center">
          <canvas ref={canvasRef} width="280" height="40" className="w-full h-full" />
          {!isLiveListening && (
            <span className="absolute text-[10px] text-slate-500 font-mono">Live Waveform Standby (Click Start Mic)</span>
          )}
        </div>

        {/* Decibel Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              decibels > 80 ? 'bg-safety-rose' : decibels > 60 ? 'bg-safety-amber' : 'bg-safety-emerald'
            }`}
            style={{ width: `${Math.min(100, (decibels / 110) * 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[10px]">
          <span className={`font-medium ${decibels > 80 ? 'text-safety-rose font-bold' : 'text-slate-400'}`}>
            Status: {soundStatus}
          </span>
          <button
            onClick={isLiveListening ? stopLiveMicrophone : startLiveMicrophone}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              isLiveListening ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {isLiveListening ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isLiveListening ? 'Stop Mic' : 'Start Live Mic'}
          </button>
        </div>
        {micError && <p className="text-[9px] text-amber-400 font-mono">{micError}</p>}
      </div>

      {/* 🤫 Stealth 3-Tap Gesture Power Button Simulator */}
      <div className="bg-slate-950/60 border border-safety-border/60 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-safety-accent" />
            <span className="text-xs font-bold text-slate-200">Stealth Power Tap Rhythm</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">Taps: {tapCount}/3</span>
        </div>

        <p className="text-[10px] text-slate-400">
          Tap 3 times in 1.5 seconds to secretly trigger SOS while phone is in pocket.
        </p>

        <button
          onClick={handleStealthTap}
          className={`w-full py-2.5 rounded-xl border font-black text-xs transition flex items-center justify-center gap-2 ${
            stealthTriggered 
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
          }`}
        >
          {stealthTriggered ? '🚨 SILENT SOS DISPATCHED!' : `📱 Press Power/Screen Tap (${tapCount}/3)`}
        </button>
      </div>

      {/* 🎭 Stealth Disguise Screen Toggle */}
      <div className="bg-safety-dark/30 border border-safety-border/60 rounded-xl p-3 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-4 h-4 text-violet-400" />
          <div>
            <p className="text-xs font-bold text-slate-200">Stealth Disguise Mode</p>
            <p className="text-[10px] text-slate-400">Disguise screen as Calculator while running in background</p>
          </div>
        </div>

        <button
          onClick={onToggleDisguiseMode}
          className="bg-violet-950 hover:bg-violet-900 border border-violet-500/40 text-violet-200 font-bold text-xs py-1.5 px-3 rounded-lg transition"
        >
          {isDisguiseMode ? 'Exit Disguise' : 'Launch Disguise'}
        </button>
      </div>

      {/* Simulation Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={simulateScream}
          className="bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-safety-border hover:border-rose-500/50 font-bold text-[10px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <Volume2 className="w-3.5 h-3.5 text-safety-rose" /> Simulate Scream (94dB)
        </button>
        <button
          onClick={() => simulateDuressPhrase('Cancel Pizza Order')}
          className="bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-safety-border hover:border-rose-500/50 font-bold text-[10px] py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5 text-safety-amber" /> Duress "Cancel Pizza"
        </button>
      </div>
    </div>
  );
}
