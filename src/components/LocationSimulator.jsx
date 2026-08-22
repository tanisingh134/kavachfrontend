import React, { useEffect, useState, useRef } from 'react';
import { Play, Square, Navigation, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export default function LocationSimulator({ 
  routePath, 
  socket, 
  userLocation, 
  setUserLocation, 
  onSimulationStatusChange,
  proximityAlert,
  setProximityAlert,
  onSafetyTwinUpdate,
  onAnomalyDetected
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(5.2); // km/h walking speed
  
  // Advanced feature toggles
  const [isTwinEnabled, setIsTwinEnabled] = useState(false);
  const [isGuardianEnabled, setIsGuardianEnabled] = useState(false);
  
  // Anomaly simulation states
  const [isDeviated, setIsDeviated] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const stopDurationCount = useRef(0);
  const timerRef = useRef(null);

  // Reset simulator if route path changes
  useEffect(() => {
    stopSimulation();
  }, [routePath]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startSimulation = () => {
    if (!routePath || routePath.length === 0) return;
    
    setIsPlaying(true);
    setHasArrived(false);
    setCurrentIndex(0);
    setUserLocation(routePath[0]);
    onSimulationStatusChange('Walking');
    setProximityAlert(null);
    setIsDeviated(false);
    setIsStopped(false);
    setIsRunning(false);
    setSpeed(5.2);
    stopDurationCount.current = 0;

    let index = 0;
    timerRef.current = setInterval(() => {
      // 1. Stoppage Anomaly Handler
      if (isStopped) {
        stopDurationCount.current += 1;
        if (isGuardianEnabled && stopDurationCount.current >= 2) {
          onAnomalyDetected('stoppage', routePath[index]);
        }
        
        // Broadcast location ping (still pinging but speed is 0)
        if (socket && socket.connected) {
          socket.emit('update-location', {
            location: routePath[index],
            user: 'Citizen Guard Demo',
            speedKmH: 0
          });
        }
        return; // Don't advance coordinates
      }

      // 2. Normal coordinate advance
      index++;
      if (index < routePath.length) {
        setCurrentIndex(index);
        let nextCoord = routePath[index];

        // 3. Safety Twin projection calculation (renders 2 steps ahead of user)
        if (isTwinEnabled) {
          const twinIndex = Math.min(index + 2, routePath.length - 1);
          onSafetyTwinUpdate(routePath[twinIndex]);
        } else {
          onSafetyTwinUpdate(null);
        }

        // 4. Deviation Anomaly Handler
        if (isDeviated) {
          // Offsets coordinate perpendicularly to mock taking a dangerous detour
          nextCoord = [nextCoord[0] + 0.0035, nextCoord[1] - 0.0035];
          if (isGuardianEnabled) {
            onAnomalyDetected('deviation', nextCoord);
          }
        }

        setUserLocation(nextCoord);
        
        // Push GPS coordinate to backend Socket.io monitor
        if (socket && socket.connected) {
          socket.emit('update-location', {
            location: nextCoord,
            user: 'Citizen Guard Demo',
            speedKmH: isStopped ? 0 : isRunning ? 15.4 : isDeviated ? 6.5 : parseFloat((speed + (Math.random() - 0.5)).toFixed(1))
          });
        }
      } else {
        // Arrived at destination
        setIsPlaying(false);
        setHasArrived(true);
        clearInterval(timerRef.current);
        onSimulationStatusChange('Arrived');
        onSafetyTwinUpdate(null);
      }
    }, 1800); // Step every 1.8 seconds
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    setHasArrived(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentIndex(0);
    if (routePath && routePath.length > 0) {
      setUserLocation(routePath[0]);
    }
    onSimulationStatusChange('Idle');
    setProximityAlert(null);
    onSafetyTwinUpdate(null);
    setIsDeviated(false);
    setIsStopped(false);
    setIsRunning(false);
    setSpeed(5.2);
    stopDurationCount.current = 0;
  };

  const handleDeviationToggle = () => {
    setIsDeviated((prev) => !prev);
  };

  const handleStoppageToggle = () => {
    if (!isStopped) {
      setIsStopped(true);
      stopDurationCount.current = 0;
    } else {
      setIsStopped(false);
      stopDurationCount.current = 0;
    }
  };

  const handleRunningToggle = () => {
    if (!isRunning) {
      setIsRunning(true);
      setSpeed(15.4);
      if (isGuardianEnabled) {
        onAnomalyDetected('running', userLocation || routePath[currentIndex]);
      }
    } else {
      setIsRunning(false);
      setSpeed(5.2);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3.5 pb-2 border-b border-safety-border/40">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-safety-accent rotate-45" />
          <h3 className="font-bold text-slate-100">Live Navigation Simulator</h3>
        </div>

        {/* Dynamic Telemetry Flags */}
        <div className="flex gap-2">
          {isTwinEnabled && (
            <span className="text-[9px] bg-violet-950 border border-violet-500/30 text-violet-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Twin Active
            </span>
          )}
          {isGuardianEnabled && (
            <span className="text-[9px] bg-yellow-950 border border-yellow-500/30 text-yellow-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5" /> Guardian Monitor
            </span>
          )}
        </div>
      </div>

      {!routePath ? (
        <p className="text-xs text-slate-400">
          Please select a start and destination point on the map to unlock location simulation.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-300">
            Simulate walking along your chosen route. This verifies live safety alerting and perimeter triggers.
          </p>

          {/* Configuration Toggles Grid */}
          <div className="grid grid-cols-2 gap-3.5 bg-safety-dark/30 p-3 rounded-xl border border-safety-border/60">
            {/* Safety Twin Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input 
                type="checkbox"
                checked={isTwinEnabled}
                onChange={(e) => {
                  setIsTwinEnabled(e.target.checked);
                  if (!e.target.checked) onSafetyTwinUpdate(null);
                }}
                className="w-4 h-4 rounded text-safety-accent border-safety-border focus:ring-0 cursor-pointer"
              />
              <div>
                <p className="font-bold text-slate-200">Safety Twin</p>
                <p className="text-[9px] text-slate-400">Project projected conditions</p>
              </div>
            </label>

            {/* AI Guardian Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input 
                type="checkbox"
                checked={isGuardianEnabled}
                onChange={(e) => setIsGuardianEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-safety-accent border-safety-border focus:ring-0 cursor-pointer"
              />
              <div>
                <p className="font-bold text-slate-200">AI Guardian</p>
                <p className="text-[9px] text-slate-400">Ambient anomaly response</p>
              </div>
            </label>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={startSimulation}
                className="flex items-center justify-center gap-2 bg-safety-accent hover:bg-violet-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition w-full shadow-lg shadow-violet-600/20"
              >
                <Play className="w-4 h-4 fill-current" /> Start Walk
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2">
                  <button
                    onClick={stopSimulation}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition flex-1 border border-safety-border"
                  >
                    <Square className="w-4 h-4 fill-current" /> Cancel Walk
                  </button>
                  <button
                    onClick={handleRunningToggle}
                    className={`text-xs py-2.5 px-3 rounded-xl font-bold transition flex-1 border ${
                      isRunning 
                        ? 'bg-safety-rose border-rose-400 text-white shadow-lg shadow-rose-900/30' 
                        : 'bg-safety-card border-safety-border hover:bg-slate-800 text-rose-300'
                    }`}
                    title="Simulate user running away from threat"
                  >
                    {isRunning ? 'Speed: Running' : 'Simulate Run'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeviationToggle}
                    className={`text-xs py-2.5 px-3 rounded-xl font-bold transition flex-1 border ${
                      isDeviated 
                        ? 'bg-safety-rose border-rose-400 text-white shadow-lg shadow-rose-900/30' 
                        : 'bg-safety-card border-safety-border hover:bg-slate-800 text-rose-300'
                    }`}
                    title="Simulate user wandering off-track"
                  >
                    {isDeviated ? 'Cancel Deviation' : 'Deviate Route'}
                  </button>

                  <button
                    onClick={handleStoppageToggle}
                    className={`text-xs py-2.5 px-3 rounded-xl font-bold transition flex-1 border ${
                      isStopped 
                        ? 'bg-safety-amber border-amber-400 text-slate-950 shadow-lg shadow-amber-900/30' 
                        : 'bg-safety-card border-safety-border hover:bg-slate-800 text-amber-300'
                    }`}
                    title="Simulate user stopping in danger zone"
                  >
                    {isStopped ? 'Resume Walk' : 'Stoppage Incident'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Telemetry info */}
          {isPlaying && (
            <div className="bg-safety-dark/50 border border-safety-border rounded-xl p-3.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Status:</span>
                <span className={`font-semibold block ${isStopped ? 'text-safety-amber animate-pulse' : 'text-safety-emerald'}`}>
                  {isStopped ? 'Sudden Stop Anomaly' : isDeviated ? 'Route Deviation Alert' : 'Walking...'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">GPS Progress:</span>
                <span className="font-semibold block text-slate-200">
                  {currentIndex + 1} / {routePath.length} nodes
                </span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400">Avg Speed:</span>
                <span className="font-semibold block text-slate-200">{isStopped ? 0 : speed} km/h</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400">Est. Time:</span>
                <span className="font-semibold block text-slate-200">
                  {Math.round(((routePath.length - currentIndex) * 1.8))}s left
                </span>
              </div>
            </div>
          )}

          {/* Proximity Alarm display */}
          {proximityAlert && (
            <div className="border border-safety-rose/50 bg-rose-950/40 p-3.5 rounded-xl flex gap-2.5 items-start animate-bounce">
              <div className="bg-safety-rose text-white p-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-safety-rose uppercase tracking-wider text-[10px]">Real-Time Incident Threat</p>
                <p className="font-semibold text-slate-200 mt-0.5">{proximityAlert.message}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{proximityAlert.description}</p>
                <p className="text-[10px] text-safety-rose font-bold mt-1.5">
                  Proximity: {proximityAlert.distanceMeters} meters away
                </p>
              </div>
            </div>
          )}

          {/* Arrived Card - ONLY shown when journey is actually completed */}
          {hasArrived && (
            <div className="bg-safety-emerald/10 border border-safety-emerald/40 p-3 rounded-xl flex gap-2 items-center text-xs text-yellow-300">
              <CheckCircle2 className="w-5 h-5 text-safety-emerald" />
              <div>
                <span className="font-bold">Destination Reached!</span>
                <span className="block text-[10px] text-slate-400">Simulation completed safely.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
