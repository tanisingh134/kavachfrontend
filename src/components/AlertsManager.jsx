import React, { useState } from 'react';
import { Megaphone, AlertCircle, MapPin, Send, Navigation, Globe, Sparkles, Volume2 } from 'lucide-react';
import { playHapticTone, speakDeterrentVoice } from '../services/audioSynthesis';

export default function AlertsManager({ userLocation, onSubmitAlert }) {
  const [type, setType] = useState('Suspicious Activity');
  const [riskLevel, setRiskLevel] = useState('High');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('28.6225');
  const [lng, setLng] = useState('77.2215');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  // Delhi Hotspot Presets
  const delhiPresets = [
    { name: 'Janpath Unlit Corridor', lat: 28.6225, lng: 77.2215, type: 'Poorly Lit Area', desc: 'Streetlights malfunctioning for 300m stretch. Dark alley hazard.' },
    { name: 'Shivaji Stadium Alley', lat: 28.6275, lng: 77.2115, type: 'Suspicious Activity', desc: 'Group loitering near unmonitored stadium exit corridor.' },
    { name: 'CP Inner Circle', lat: 28.6320, lng: 77.2185, type: 'Road Blockage', desc: 'Pedestrian pavement barricaded for emergency metro maintenance.' },
    { name: 'Barakhamba Road Blvd', lat: 28.6325, lng: 77.2225, type: 'Active Crime', desc: 'Snatching attempt reported near commercial arcade.' },
    { name: 'Jantar Mantar Backlane', lat: 28.6200, lng: 77.2150, type: 'Harassment', desc: 'Catcalling and stalking reported along unlit perimeter.' }
  ];

  // 1. Real Device GPS Fetch
  const handleUseRealGps = () => {
    setIsAcquiringGps(true);
    setGpsStatus('Acquiring real GPS coordinates...');
    playHapticTone('subtle');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = parseFloat(pos.coords.latitude.toFixed(5));
          const uLng = parseFloat(pos.coords.longitude.toFixed(5));
          setLat(uLat);
          setLng(uLng);
          setIsAcquiringGps(false);
          setGpsStatus(`📍 Live GPS Locked (${uLat}, ${uLng})`);
        },
        (err) => {
          setIsAcquiringGps(false);
          setGpsStatus('⚠️ GPS access denied. Using Delhi preset instead.');
          // Fallback to Delhi
          setLat(28.6225);
          setLng(77.2215);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsAcquiringGps(false);
      setGpsStatus('Geolocation not supported on this browser.');
    }
  };

  // 2. Apply Delhi Preset
  const handleApplyDelhiPreset = (preset) => {
    playHapticTone('subtle');
    setLat(preset.lat);
    setLng(preset.lng);
    setType(preset.type);
    setDescription(preset.desc);
    setGpsStatus(`🏛️ Delhi Preset: ${preset.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || lat === '' || lng === '') return;
    
    setIsSubmitting(true);
    playHapticTone('alert');

    await onSubmitAlert({
      type,
      riskLevel,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      description,
      reportedBy: 'Citizen Guardian (Verified)'
    });
    
    speakDeterrentVoice("Incident alert published. Safety grid and risk routes recalibrated.");

    setIsSubmitting(false);
    setDescription('');
    setGpsStatus('✓ Alert Published to Active Safety Mesh');
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border shadow-xl flex flex-col gap-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40">
            <Megaphone className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-xs uppercase tracking-wider">Crowdsourced Incident Reporter</h3>
            <p className="text-[10px] text-slate-400">Live Hazard Ingestion & Crime Heatmap Recalibration</p>
          </div>
        </div>
      </div>

      {/* Quick Location Mode Switchers: Real GPS vs Delhi Demo */}
      <div className="flex flex-col gap-2 bg-slate-900/80 p-3 rounded-xl border border-safety-border/60">
        <span className="text-[10px] uppercase font-bold text-slate-300">Set Incident Location:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseRealGps}
            disabled={isAcquiringGps}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-violet-950/70 hover:bg-violet-900 border border-violet-500/50 text-violet-200 px-3 py-1.5 rounded-lg transition shadow"
          >
            <Navigation className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
            <span>{isAcquiringGps ? 'Locking GPS...' : '📍 Use Current GPS Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyDelhiPreset(delhiPresets[0])}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-500/50 text-yellow-200 px-3 py-1.5 rounded-lg transition shadow"
          >
            <Globe className="w-3.5 h-3.5 text-yellow-400" />
            <span>🏛️ Demo for Delhi (Janpath)</span>
          </button>
        </div>

        {/* Delhi Preset Pills */}
        <div className="flex flex-wrap gap-1 mt-1">
          {delhiPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyDelhiPreset(preset)}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-yellow-500 transition"
            >
              {preset.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {gpsStatus && (
          <span className="text-[10px] font-mono text-yellow-300 font-bold mt-0.5">{gpsStatus}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Type & Risk Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Incident Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 outline-none cursor-pointer focus:border-yellow-500"
            >
              <option value="Suspicious Activity">Suspicious Activity</option>
              <option value="Active Crime">Active Crime</option>
              <option value="Harassment">Harassment</option>
              <option value="Poorly Lit Area">Poorly Lit Area</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Protest">Protest / Unrest</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Risk Severity</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 outline-none cursor-pointer focus:border-yellow-500"
            >
              <option value="High">High (Red Hazard)</option>
              <option value="Medium">Medium (Amber Caution)</option>
              <option value="Low">Low (Informational)</option>
            </select>
          </div>
        </div>

        {/* GPS Coordinates Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Latitude</label>
            <input
              type="number"
              step="0.00001"
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="bg-slate-900 text-xs text-slate-100 border border-slate-700 focus:border-yellow-500 rounded-lg p-2 outline-none font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Longitude</label>
            <input
              type="number"
              step="0.00001"
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="bg-slate-900 text-xs text-slate-100 border border-slate-700 focus:border-yellow-500 rounded-lg p-2 outline-none font-mono"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Incident Narrative</label>
          <textarea
            required
            placeholder="Describe what is occurring (e.g. Broken streetlights, aggressive harassment, unlit construction zone...)"
            rows={2.5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-900 text-xs text-slate-100 border border-slate-700 focus:border-yellow-500 rounded-lg p-2 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Disseminating Alert...' : 'Publish Live Incident to Kavach Network'}</span>
        </button>
      </form>
    </div>
  );
}
