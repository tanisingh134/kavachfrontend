import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Polyline, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, Shield, AlertTriangle, Flag, MapPin, Eye, CloudRain, 
  Sun, Wind, Lightbulb, Users, ShieldCheck, Zap, Compass, ArrowRight 
} from 'lucide-react';
import { SAFE_HAVENS } from '../services/edgeRiskEngine';

// Custom Map Controller to programmatically center/pan the map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// Map Click Handler for selecting start and destination coordinates
function MapClickEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function MapDashboard({ 
  userLocation, 
  startPoint, 
  endPoint, 
  setStartPoint, 
  setEndPoint, 
  heatmapData, 
  routes,
  selectedRouteType,
  setSelectedRouteType,
  onVoteAlert,
  onOpenHotspotChat,
  safetyTwinLocation,
  safetyHour,
  batteryLevel = 85,
  onMarkSafe,
  isOffline = false,
  lookaheadPrediction = null,
  onSelectSafeHaven = null
}) {
  const [zoom, setZoom] = useState(14);
  const defaultCenter = [28.6304, 77.2177]; // Connaught Place, New Delhi

  // Interactive Layer Toggles
  const [showStreetlights, setShowStreetlights] = useState(true);
  const [showCrowdDensity, setShowCrowdDensity] = useState(true);
  const [showSafeHavens, setShowSafeHavens] = useState(true);
  const [showSensorCone, setShowSensorCone] = useState(true);
  const [weatherType, setWeatherType] = useState('clear'); // 'clear', 'rain', 'smog'

  // Dynamic Streetlight Status State (interactive toggling)
  const [streetlights, setStreetlights] = useState([
    { id: 'sl_1', name: 'Inner Circle Post #12', lat: 28.6322, lng: 77.2188, status: 'active', lux: 98 },
    { id: 'sl_2', name: 'Janpath Entry Pole #04', lat: 28.6235, lng: 77.2212, status: 'broken', lux: 8 },
    { id: 'sl_3', name: 'Shivaji Lane Light #09', lat: 28.6270, lng: 77.2120, status: 'broken', lux: 12 },
    { id: 'sl_4', name: 'Barakhamba Central Lamp', lat: 28.6315, lng: 77.2230, status: 'active', lux: 92 },
    { id: 'sl_5', name: 'KG Marg Intersection Light', lat: 28.6255, lng: 77.2275, status: 'active', lux: 85 }
  ]);

  // Dynamic Crowd Density nodes
  const crowdNodes = [
    { id: 'c_1', name: 'CP Central Park Footfall', lat: 28.6304, lng: 77.2177, density: 'High (Safer)', count: 240, color: '#3B82F6' },
    { id: 'c_2', name: 'Rajiv Chowk Metro Gate 2', lat: 28.6318, lng: 77.2185, density: 'High (Safer)', count: 310, color: '#3B82F6' },
    { id: 'c_3', name: 'Janpath Back Alley', lat: 28.6215, lng: 77.2218, density: 'Isolated (High Risk)', count: 3, color: '#A855F7' },
    { id: 'c_4', name: 'Shivaji Dark Corridor', lat: 28.6280, lng: 77.2110, density: 'Deserted (High Risk)', count: 2, color: '#A855F7' }
  ];

  // Calculate dynamic temporal hazard swelling based on departure hour, weather, and battery
  let temporalMultiplier = 1.0;
  if (safetyHour >= 22 && safetyHour < 26) {
    temporalMultiplier = 1.35; // Late night swell
  } else if (safetyHour >= 26 && safetyHour < 29) {
    temporalMultiplier = 1.65; // 2 AM - 5 AM peak swell
  } else if (safetyHour >= 6 && safetyHour < 18) {
    temporalMultiplier = 0.8; // Daytime shrink
  }

  if (weatherType === 'rain') temporalMultiplier += 0.25;
  if (weatherType === 'smog') temporalMultiplier += 0.35;
  if (batteryLevel < 20) temporalMultiplier += 0.35;

  const toggleStreetlight = (id) => {
    setStreetlights(prev => prev.map(sl => {
      if (sl.id === id) {
        const nextStatus = sl.status === 'active' ? 'broken' : 'active';
        return {
          ...sl,
          status: nextStatus,
          lux: nextStatus === 'active' ? 95 : 10
        };
      }
      return sl;
    }));
  };

  // Custom Leaflet Icons (Amber #F59E0B & Slate #0F172A)
  const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute w-9 h-9 bg-amber-500 rounded-full opacity-40 animate-ping"></div>
             <div class="relative w-6 h-6 bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-slate-950 rounded-full shadow-2xl flex items-center justify-center text-xs text-slate-950 font-black">📍</div>
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const safetyTwinIcon = L.divIcon({
    className: 'custom-twin-icon',
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute w-8 h-8 bg-amber-500 rounded-full opacity-50 animate-ping"></div>
             <div class="relative w-5 h-5 bg-slate-900 border-2 border-amber-400 rounded-full shadow-lg flex items-center justify-center text-[9px] text-amber-300 font-black">🔮</div>
             <span class="absolute -top-7 text-[9px] bg-slate-900 border border-amber-400 text-amber-300 font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">2-Min Scout</span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const startIcon = L.divIcon({
    className: 'custom-start-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-slate-950 border-2 border-slate-900 shadow-xl font-black text-xs">
             A
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const endIcon = L.divIcon({
    className: 'custom-end-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white border-2 border-slate-900 shadow-xl font-black text-xs">
             B
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const alertIcon = L.divIcon({
    className: 'custom-alert-icon',
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-slate-950 border-2 border-slate-900 shadow-lg text-xs font-black animate-pulse">
             ⚠️
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const crimeIcon = L.divIcon({
    className: 'custom-crime-icon',
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-700 text-white border-2 border-slate-900 shadow-lg text-xs font-black">
             🛡️
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const havenIcon = (icon) => L.divIcon({
    className: 'custom-haven-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-950 border-2 border-violet-400 text-violet-200 text-sm shadow-xl hover:scale-125 transition-transform">
             ${icon}
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const lightIcon = (status) => L.divIcon({
    className: 'custom-light-icon',
    html: `<div class="flex items-center justify-center w-6 h-6 rounded-full ${
      status === 'active' ? 'bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300' : 'bg-rose-500/20 border-2 border-rose-500 text-rose-400'
    } text-xs font-black shadow-md cursor-pointer hover:scale-125 transition">
             💡
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Calculate Forward Sensor Cone Coordinates (2-Minutes Ahead View)
  const currentPos = userLocation || startPoint || defaultCenter;
  const coneLength = 0.0035; // ~350m forward
  const coneWidth = 0.0018;
  const sensorConeCoords = [
    [currentPos[0], currentPos[1]], // Apex at user
    [currentPos[0] - coneLength, currentPos[1] - coneWidth],
    [currentPos[0] - coneLength * 1.2, currentPos[1]],
    [currentPos[0] - coneLength, currentPos[1] + coneWidth]
  ];

  // Handle map click
  const handleMapClick = (latlng) => {
    if (!startPoint) {
      setStartPoint(latlng);
    } else if (!endPoint) {
      setEndPoint(latlng);
    } else {
      setStartPoint(latlng);
      setEndPoint(null);
    }
  };

  const mapCenter = userLocation || startPoint || defaultCenter;

  // Preset Route Shortcuts
  const loadPresetRoute = (type) => {
    if (type === 'janpath-threat') {
      setStartPoint([28.6328, 77.2185]); // CP Block A
      setEndPoint([28.6185, 77.2315]);   // National Stadium approach (via Janpath high-risk corridor)
    } else if (type === 'inner-safe') {
      setStartPoint([28.6335, 77.2190]); // CP North
      setEndPoint([28.6280, 77.2175]);   // CP South (well-lit inner circle corridor)
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-safety-border shadow-2xl bg-slate-950 flex flex-col">
      {/* Top Interactive Banner Guide & Presets */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap gap-2 items-center justify-between pointer-events-auto">
        <div className="glass-panel py-2 px-3.5 rounded-xl border border-safety-border/60 flex items-center gap-2 shadow-lg">
          <Shield className="w-4 h-4 text-safety-accent animate-pulse-slow shrink-0" />
          <span className="text-xs font-semibold text-slate-100">
            {!startPoint 
              ? 'Click map to set Origin (A)' 
              : !endPoint 
                ? 'Now click Destination (B)' 
                : 'Interactive Dynamic Map Active'}
          </span>
          {(startPoint || endPoint) && (
            <button 
              onClick={() => { setStartPoint(null); setEndPoint(null); }}
              className="text-[10px] bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 px-2 py-0.5 rounded border border-slate-700 ml-2 transition"
            >
              Clear Route
            </button>
          )}
        </div>

        {/* Quick Route Preset Simulations */}
        <div className="glass-panel py-1 px-2 rounded-xl border border-safety-border/60 flex items-center gap-1.5 shadow-lg">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Presets:</span>
          <button
            onClick={() => loadPresetRoute('janpath-threat')}
            className="text-[10px] font-bold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 px-2 py-1 rounded-lg transition flex items-center gap-1"
          >
            ⚠️ Threat Corridor
          </button>
          <button
            onClick={() => loadPresetRoute('inner-safe')}
            className="text-[10px] font-bold bg-yellow-950/60 hover:bg-yellow-900 border border-yellow-500/40 text-yellow-200 px-2 py-1 rounded-lg transition flex items-center gap-1"
          >
            🛡️ Safe Inner Ring
          </button>
        </div>
      </div>

      {/* Layer Control Floating HUD (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel p-2.5 rounded-xl border border-safety-border/70 flex flex-col gap-2 shadow-2xl pointer-events-auto max-w-[280px]">
        <div className="flex justify-between items-center pb-1.5 border-b border-safety-border/40">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-300 flex items-center gap-1">
            <Eye className="w-3 h-3 text-safety-accent" /> Dynamic Map Layers
          </span>
          <span className="text-[9px] font-bold text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded">
            {temporalMultiplier.toFixed(2)}x Threat Swell
          </span>
        </div>

        {/* Layer Checkboxes */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <button 
            onClick={() => setShowStreetlights(!showStreetlights)}
            className={`px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 transition ${
              showStreetlights ? 'bg-yellow-950/50 border-yellow-500/40 text-yellow-300 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <Lightbulb className="w-3 h-3" /> Streetlights
          </button>

          <button 
            onClick={() => setShowCrowdDensity(!showCrowdDensity)}
            className={`px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 transition ${
              showCrowdDensity ? 'bg-blue-950/50 border-blue-500/40 text-blue-300 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <Users className="w-3 h-3" /> Crowd Flow
          </button>

          <button 
            onClick={() => setShowSafeHavens(!showSafeHavens)}
            className={`px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 transition ${
              showSafeHavens ? 'bg-violet-950/50 border-violet-500/40 text-violet-300 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Safe Havens
          </button>

          <button 
            onClick={() => setShowSensorCone(!showSensorCone)}
            className={`px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 transition ${
              showSensorCone ? 'bg-violet-950/50 border-violet-500/40 text-violet-300 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <Compass className="w-3 h-3" /> 2-Min Cone
          </button>
        </div>

        {/* Atmospheric / Weather Switcher */}
        <div className="pt-1.5 border-t border-safety-border/30 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-semibold">Weather Impact:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setWeatherType('clear')}
              title="Clear Night (Normal)"
              className={`p-1 rounded ${weatherType === 'clear' ? 'bg-violet-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setWeatherType('rain')}
              title="Heavy Monsoon Rain (+25% Threat Radius)"
              className={`p-1 rounded ${weatherType === 'rain' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
            >
              <CloudRain className="w-3 h-3" />
            </button>
            <button
              onClick={() => setWeatherType('smog')}
              title="Dense Winter Smog / Low Visibility (+35% Threat Radius)"
              className={`p-1 rounded ${weatherType === 'smog' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-400'}`}
            >
              <Wind className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
        />

        <MapController center={mapCenter} />
        <MapClickEvents onMapClick={handleMapClick} />

        {/* 🔮 2-Minutes Ahead Forward Sensor Cone Polygon */}
        {showSensorCone && (
          <Polygon
            positions={sensorConeCoords}
            pathOptions={{
              color: '#6366F1',
              fillColor: '#818CF8',
              fillOpacity: 0.18,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          />
        )}

        {/* 💡 IoT Streetlights Layer with Interactive Toggling */}
        {showStreetlights && streetlights.map((sl) => (
          <Marker
            key={sl.id}
            position={[sl.lat, sl.lng]}
            icon={lightIcon(sl.status)}
          >
            <Popup>
              <div className="p-1 text-slate-900 w-44">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{sl.name}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                    sl.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {sl.status === 'active' ? 'Lit 98%' : 'OUT 0%'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  IoT telemetry: {sl.lux} Lux illuminance detected.
                </p>
                <button
                  onClick={() => toggleStreetlight(sl.id)}
                  className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] py-1 px-2 rounded transition"
                >
                  {sl.status === 'active' ? '⚠️ Report Light Broken' : '✅ Mark Light Fixed'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 👥 Crowd Footfall Density Circles */}
        {showCrowdDensity && crowdNodes.map((crowd) => (
          <Circle
            key={crowd.id}
            center={[crowd.lat, crowd.lng]}
            radius={180}
            pathOptions={{
              color: crowd.color,
              fillColor: crowd.color,
              fillOpacity: 0.12,
              weight: 1,
              dashArray: '3, 3'
            }}
          >
            <Popup>
              <div className="p-1 text-slate-900 w-44">
                <div className="font-bold text-xs">{crowd.name}</div>
                <p className="text-[10px] text-slate-700 mt-0.5">Footfall: {crowd.density} (~{crowd.count} active pedestrians)</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* 🛡️ 24/7 Verified Safe Havens Layer */}
        {showSafeHavens && SAFE_HAVENS.map((haven) => (
          <Marker
            key={haven.id}
            position={[haven.lat, haven.lng]}
            icon={havenIcon(haven.icon)}
          >
            <Popup>
              <div className="p-1 text-slate-900 w-48">
                <div className="font-bold text-xs text-slate-950 flex items-center gap-1">
                  <span>{haven.icon}</span> {haven.name}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-yellow-700 font-bold">
                  <ShieldCheck className="w-3 h-3" /> 24/7 Verified Safe Haven
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Direct Help Line: {haven.phone}</p>
                <button
                  onClick={() => {
                    setEndPoint([haven.lat, haven.lng]);
                    if (onSelectSafeHaven) onSelectSafeHaven(haven);
                  }}
                  className="mt-2 w-full bg-violet-800 hover:bg-violet-700 text-white font-bold text-[9px] py-1 px-2 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" /> Route to Safe Haven
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 📍 Danger Zones & Heatmap Data (Dynamic Temporal Radius) */}
        {heatmapData.map((hazard) => {
          const color = hazard.riskLevel === 'High' 
            ? '#F43F5E' 
            : hazard.riskLevel === 'Medium' 
              ? '#F59E0B' 
              : '#10B981';
          return (
            <React.Fragment key={hazard.id || hazard._id}>
              <Circle
                center={[hazard.lat, hazard.lng]}
                radius={320 * temporalMultiplier}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.16,
                  weight: 1.5,
                  dashArray: hazard.isAlert ? '5, 5' : 'none'
                }}
              />
              <Marker 
                position={[hazard.lat, hazard.lng]} 
                icon={hazard.isAlert ? alertIcon : crimeIcon}
              >
                <Popup>
                  <div className="text-slate-900 p-1 w-52">
                    <div className="flex items-center gap-1 font-bold text-xs text-slate-950">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {hazard.isAlert ? 'Live Citizen Alert: ' : 'Crime Zone: '}{hazard.type}
                    </div>
                    <p className="text-[11px] mt-1 text-slate-700 font-medium">{hazard.description}</p>

                    {hazard.isAlert && (
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 text-[10px]">
                        <span className="text-slate-500 font-bold">
                          Trust: <span className="text-violet-600">{hazard.trustScore || 75}%</span>
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onVoteAlert(hazard.id || hazard._id, 'upvote')}
                            className="bg-slate-100 hover:bg-yellow-100 hover:text-yellow-700 text-slate-600 px-1.5 py-0.5 rounded font-bold transition"
                            title="Verify Incident"
                          >
                            👍 {hazard.upvotes || 0}
                          </button>
                          <button
                            onClick={() => onVoteAlert(hazard.id || hazard._id, 'downvote')}
                            className="bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 px-1.5 py-0.5 rounded font-bold transition"
                            title="Downvote Incident"
                          >
                            👎 {hazard.downvotes || 0}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => onOpenHotspotChat(hazard)}
                      className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      💬 Ask AI Explanation
                    </button>

                    <button
                      onClick={() => onMarkSafe(hazard.id || hazard._id)}
                      className="mt-1 w-full bg-yellow-600/15 hover:bg-yellow-600/25 text-yellow-800 border border-yellow-500/30 font-bold text-[9px] py-1 px-2 rounded-lg transition"
                    >
                      🛡️ Mark Safe / False Alarm
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 🛣️ Route Paths */}
        {routes && (
          <>
            {/* Standard Route (Route A - Baseline) */}
            <Polyline
              positions={routes.standard.path}
              pathOptions={{
                color: '#EF4444',
                weight: selectedRouteType === 'standard' ? 6 : 3,
                opacity: selectedRouteType === 'standard' ? 0.95 : 0.4,
                dashArray: '8, 8'
              }}
              eventHandlers={{ click: () => setSelectedRouteType('standard') }}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs font-bold">
                  <span className="text-rose-600">⚠️ Route A: Direct Path</span>
                  <div className="text-[10px] text-slate-600 font-normal mt-0.5">
                    Risk: 72/100 · Duration: 14 min · Unlit Alley Exposure
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* Safe Route (Route B - Safe Ring) */}
            <Polyline
              positions={routes.safe.path}
              pathOptions={{
                color: '#14B8A6',
                weight: selectedRouteType === 'safe' ? 6 : 3,
                opacity: selectedRouteType === 'safe' ? 0.98 : 0.45
              }}
              eventHandlers={{ click: () => setSelectedRouteType('safe') }}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs font-bold">
                  <span className="text-yellow-600">⭐ Route B: Safe CP Ring</span>
                  <div className="text-[10px] text-slate-600 font-normal mt-0.5">
                    Risk: 31/100 (-57% Exposure) · Duration: 17 min · 98% Lit
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* Shadow Protected Corridor (Route D - Fortified Line) */}
            {routes.shadow && (
              <Polyline
                positions={routes.shadow.path}
                pathOptions={{
                  color: '#8B5CF6',
                  weight: selectedRouteType === 'shadow' ? 6 : 3,
                  opacity: selectedRouteType === 'shadow' ? 0.95 : 0.45,
                  dashArray: '4, 4'
                }}
                eventHandlers={{ click: () => setSelectedRouteType('shadow') }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs font-bold">
                    <span className="text-violet-600">🛡️ Route D: Shadow Haven Line</span>
                    <div className="text-[10px] text-slate-600 font-normal mt-0.5">
                      Risk: 18/100 (-75% Exposure) · Duration: 19 min · 3 Police Havens
                    </div>
                  </div>
                </Popup>
              </Polyline>
            )}
          </>
        )}

        {/* Start & End Destination Markers */}
        {startPoint && <Marker position={startPoint} icon={startIcon} />}
        {endPoint && <Marker position={endPoint} icon={endIcon} />}

        {/* Live User Walk Location */}
        {userLocation && <Marker position={userLocation} icon={userIcon} />}

        {/* 🔮 2-Min Digital Safety Twin Ahead Location */}
        {safetyTwinLocation && <Marker position={safetyTwinLocation} icon={safetyTwinIcon} />}
      </MapContainer>
    </div>
  );
}
