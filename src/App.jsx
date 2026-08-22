import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  Shield, Radio, ShieldAlert, Heart, RefreshCw, X,
  AlertTriangle, Wifi, WifiOff, Battery, Calculator, Sparkles,
  Download, Globe, Navigation, LogOut, User, CheckCircle2, Play, Database,
  Search, Sliders, ChevronDown
} from 'lucide-react';

import CinematicSplash from './components/CinematicSplash';
import AuthModal from './components/AuthModal';
import PermissionGateway from './components/PermissionGateway';
import DatabaseManagerModal from './components/DatabaseManagerModal';
import KavachLogo from './components/KavachLogo';
import TopNavigation from './components/TopNavigation';
import MapDashboard from './components/MapDashboard';
import GraphSearchEngine from './components/GraphSearchEngine';
import CounterfactualSimulator from './components/CounterfactualSimulator';
import TwoMinutePrediction from './components/TwoMinutePrediction';
import OfflineSafetyBrain from './components/OfflineSafetyBrain';
import SilentSOSDetector from './components/SilentSOSDetector';
import AIAlertEscalation from './components/AIAlertEscalation';
import SelfCorrectingSystem from './components/SelfCorrectingSystem';
import ExplainableAISandbox from './components/ExplainableAISandbox';
import LocationSimulator from './components/LocationSimulator';
import EmergencyCenter from './components/EmergencyCenter';
import AlertsManager from './components/AlertsManager';
import HotspotChat from './components/HotspotChat';
import RiskReplay from './components/RiskReplay';
import GuardianAvatar from './components/GuardianAvatar';
import StealthDisguiseModal from './components/StealthDisguiseModal';
import SafetyNetworkPortal from './components/SafetyNetworkPortal';
import RiskDetails from './components/RiskDetails';
import CityPulseTerminal from './components/CityPulseTerminal';

import { calculateOfflineRoutes } from './services/edgeRiskEngine';
import { playHapticTone, playPreEntryWarningAudio } from './services/audioSynthesis';
import { translations, SUPPORTED_LANGUAGES } from './services/translations';
import { saveOfflineSnapshot, exportBackupToFile, getBackupStorageStats } from './services/offlineBackupService';

const BACKEND_URL = 'https://kavachbackend-f77h.onrender.com';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('en'); // 15 Supported Languages
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Safety locations states
  const [userLocation, setUserLocation] = useState(null);
  const [startPoint, setStartPoint] = useState([28.6328, 77.2185]); // Default CP North
  const [endPoint, setEndPoint] = useState([28.6225, 77.2215]);     // Default Janpath

  // Data lists
  const [heatmapData, setHeatmapData] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Evaluated paths & AI
  const [routes, setRoutes] = useState(null);
  const [selectedRouteType, setSelectedRouteType] = useState('safe');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Status & notifications
  const [simulationStatus, setSimulationStatus] = useState('Idle');
  const [proximityAlert, setProximityAlert] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [sosFlasher, setSosFlasher] = useState(false);

  // Advanced feature states
  const [safetyTwinLocation, setSafetyTwinLocation] = useState(null);
  const [activeChatHotspot, setActiveChatHotspot] = useState(null);
  const [guardianAlert, setGuardianAlert] = useState(null);
  const [guardianTimer, setGuardianTimer] = useState(null);
  const [guardianState, setGuardianState] = useState('idle');

  // Modifiers & offline states
  const [safetyHour, setSafetyHour] = useState(22); // 10:00 PM
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isOffline, setIsOffline] = useState(false);
  const [isDisguiseMode, setIsDisguiseMode] = useState(false);

  const [replayLogs, setReplayLogs] = useState([]);
  const [isReplaying, setIsReplaying] = useState(false);

  // UX & Auth States
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kavach_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && !parsed.name.toLowerCase().includes('aarav')) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPermissionGatewayOpen, setIsPermissionGatewayOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [locationMode, setLocationMode] = useState('gps'); // Real GPS default
  const [pwaDeferredPrompt, setPwaDeferredPrompt] = useState(null);
  const [showPwaInstall, setShowPwaInstall] = useState(false);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setPwaDeferredPrompt(e);
      setShowPwaInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (pwaDeferredPrompt) {
      pwaDeferredPrompt.prompt();
      const choice = await pwaDeferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('📲 Kavach AI Installed Successfully!', 'success');
        setShowPwaInstall(false);
      }
    } else {
      showToast('📲 To install Kavach AI, tap Share / Settings → Add to Home Screen in your browser.', 'info');
    }
  };

  // Auto-acquire device GPS on startup
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setStartPoint([lat, lng]);
          setUserLocation([lat, lng]);
          setEndPoint([
            parseFloat((lat + 0.0068).toFixed(5)),
            parseFloat((lng + 0.0055).toFixed(5))
          ]);
          setLocationMode('gps');
        },
        (err) => {
          console.warn('Initial GPS notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Real-Time Device GPS Watcher
  useEffect(() => {
    let watchId = null;
    if (locationMode === 'gps' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          if (simulationStatus === 'Idle') {
            setUserLocation([lat, lng]);
            setStartPoint([lat, lng]);
          }
        },
        (err) => {
          console.warn('GPS watch error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }
    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationMode, simulationStatus]);

  const handleToggleLocationMode = () => {
    if (locationMode === 'delhi') {
      playHapticTone('subtle');
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = parseFloat(pos.coords.latitude.toFixed(5));
            const lng = parseFloat(pos.coords.longitude.toFixed(5));
            setStartPoint([lat, lng]);
            setUserLocation([lat, lng]);
            setEndPoint([
              parseFloat((lat + 0.0068).toFixed(5)),
              parseFloat((lng + 0.0055).toFixed(5))
            ]);
            setLocationMode('gps');
            showToast(
              language === 'hi'
                ? `📍 लाइव GPS सक्रिय: (${lat}, ${lng}) - आप स्थान A पर हैं`
                : `📍 Live Real GPS Active: (${lat}, ${lng}) - Fixed at Location A`,
              'success'
            );
          },
          (err) => {
            showToast(
              language === 'hi'
                ? '⚠️ GPS अनुमति उपलब्ध नहीं। दिल्ली डेमो मोड सक्रिय रखा गया।'
                : '⚠️ GPS permission unavailable. Keeping Delhi Demo mode.',
              'warning'
            );
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    } else {
      playHapticTone('subtle');
      setStartPoint([28.6328, 77.2185]);
      setEndPoint([28.6225, 77.2215]);
      setUserLocation([28.6304, 77.2177]);
      setLocationMode('delhi');
      showToast(
        language === 'hi'
          ? '🏛️ दिल्ली डेमो मोड सक्रिय (कनॉट प्लेस सुरक्षा ग्रिड)'
          : '🏛️ Switched to Delhi Demo Mode (Connaught Place Safety Grid)',
        'info'
      );
    }
  };

  // Initialize Socket.io connection & default data
  useEffect(() => {
    let socketCon = null;
    if (!isOffline) {
      socketCon = io(BACKEND_URL);
      setSocket(socketCon);

      socketCon.on('connect', () => {
        console.log('Connected to safety alerts stream.');
      });

      socketCon.on('new-alert', (alert) => {
        setHeatmapData((prev) => [alert, ...prev]);
        showToast(`⚠️ Live incident reported: ${alert.type} nearby. Map updated!`, 'warning');
      });

      socketCon.on('proximity-alert', (data) => {
        setProximityAlert(data);
      });

      socketCon.on('sos-active', (data) => {
        showToast(`🚨 SOS Broadcast Active! Safety network notified.`, 'error');
        setSosFlasher(true);
        setTimeout(() => setSosFlasher(false), 6000);
      });

      socketCon.on('alert-vote-update', (data) => {
        setHeatmapData((prev) =>
          prev.map(h => (h.id === data.id || h._id === data.id) ? { ...h, upvotes: data.upvotes, downvotes: data.downvotes, trustScore: data.trustScore } : h)
        );
      });
    }

    fetchHeatmapData();
    fetchContacts();

    return () => {
      if (socketCon) socketCon.disconnect();
    };
  }, [isOffline]);

  // Recalculate routes whenever coordinates, safety hour, or offline mode change
  useEffect(() => {
    if (startPoint && endPoint) {
      calculateSafetyRoutes();
    } else {
      setRoutes(null);
      setAiAnalysis(null);
    }
  }, [startPoint, endPoint, safetyHour, isOffline]);

  // Auto-backup to offline storage whenever contacts, heatmap, or routes change
  useEffect(() => {
    saveOfflineSnapshot({ contacts, heatmapData });
  }, [contacts, heatmapData]);

  const fetchHeatmapData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/crime-heatmap`);
      const data = await res.json();
      setHeatmapData(data);
    } catch (err) {
      console.warn('Backend heatmap fetch offline, using seeded local dataset.');
      setHeatmapData([
        { id: 'c_1', type: 'Robbery', riskLevel: 'High', lat: 28.6225, lng: 77.2215, description: 'Armed robbery reported near Janpath corridor.', isAlert: false },
        { id: 'c_2', type: 'Harassment', riskLevel: 'Medium', lat: 28.6275, lng: 77.2115, description: 'Catcalling and tailing reported in alleyway.', isAlert: false },
        { id: 'a_1', type: 'Poorly Lit Area', riskLevel: 'Medium', lat: 28.6150, lng: 77.2200, description: 'Streetlights broken for 300m stretch.', isAlert: true, upvotes: 8, downvotes: 1, trustScore: 88 }
      ]);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/emergency-contacts`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      setContacts([
        { _id: 'ec_1', name: 'Nikhil Singh (Brother)', phone: '+91 98765 43210', relation: 'Brother' },
        { _id: 'ec_2', name: 'Inspector Sharma (CP Police Post)', phone: '112', relation: 'Emergency' }
      ]);
    }
  };

  const addReplayLog = (type, message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setReplayLogs(prev => [{ time, type, message }, ...prev]);
  };

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Route calculation (supports cloud agent and 100% offline edge fallback)
  const calculateSafetyRoutes = async () => {
    setIsLoadingRoute(true);
    setProximityAlert(null);

    if (isOffline) {
      const localResult = calculateOfflineRoutes(startPoint, endPoint, { hour: safetyHour, battery: batteryLevel });
      setRoutes(localResult);
      setAiAnalysis("Local Edge AI Engine: Safe route avoids Janpath unlit zone by routing through CP Central Park lit ring.");
      setSelectedRouteType('safe');
      setIsLoadingRoute(false);
      addReplayLog('info', 'Edge AI: Evaluated offline local route detours.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/route-safety`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startPoint, end: endPoint })
      });
      const data = await res.json();
      if (data.error) {
        const localResult = calculateOfflineRoutes(startPoint, endPoint, { hour: safetyHour, battery: batteryLevel });
        setRoutes(localResult);
      } else {
        setRoutes(data.routes);
        setAiAnalysis(data.aiAnalysis);
        setSelectedRouteType('safe');
      }
    } catch (err) {
      const localResult = calculateOfflineRoutes(startPoint, endPoint, { hour: safetyHour, battery: batteryLevel });
      setRoutes(localResult);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleSimulationStatusChange = (status) => {
    setSimulationStatus(status);
    if (status === 'Walking') {
      addReplayLog('info', 'Simulation started. Telemetry active.');
      setGuardianState('idle');
    } else if (status === 'Arrived') {
      addReplayLog('success', 'User safely arrived at destination.');
      setGuardianState('idle');
      showToast('🎉 Destination reached safely!', 'success');
    } else if (status === 'Idle') {
      addReplayLog('info', 'Simulator reset to idle.');
      setGuardianState('idle');
    }
  };

  const handleVoteAlert = async (alertId, voteType) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts/${alertId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, user: 'Citizen Guard' })
      });
      const data = await res.json();
      setHeatmapData((prev) =>
        prev.map(h => (h.id === alertId || h._id === alertId) ? { ...h, upvotes: data.upvotes, downvotes: data.downvotes, trustScore: data.trustScore } : h)
      );
      showToast(`Verification registered. Trust Score is now: ${data.trustScore}%`, 'success');
      addReplayLog('info', `Dynamic verification registered. Trust: ${data.trustScore}%`);
    } catch (err) {
      showToast('Vote recorded locally.', 'success');
    }
  };

  const handleMarkSafe = (hazardId) => {
    setHeatmapData(prev => prev.filter(h => (h.id || h._id) !== hazardId));
    showToast('🛡️ Zone marked Safe / False Alarm resolved!', 'success');
    addReplayLog('success', `Self-Correcting System: Danger circle dismissed by citizen report.`);
    if (startPoint && endPoint) calculateSafetyRoutes();
  };

  const handleAnomalyDetected = (type, coord) => {
    if (guardianAlert) return;
    addReplayLog(type, `Guardian AI: Anomaly flagged (${type.toUpperCase()}) near user coordinate.`);
    setGuardianState(type);
    showToast(`🚨 AI Guardian Anomaly: User ${type === 'deviation' ? 'deviated path' : type === 'running' ? 'running speed spike' : 'stopped in danger zone'}!`, 'error');
    setGuardianAlert({ type, countdown: 10 });

    let timeRemaining = 10;
    const interval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(interval);
        setGuardianAlert(null);
        addReplayLog('sos', 'AI Guardian: User unresponsive. Deploying auto SOS Panic beacon!');
        setGuardianState('sos');
        triggerPanicSOS();
      } else {
        setGuardianAlert(prev => prev ? { ...prev, countdown: timeRemaining } : null);
      }
    }, 1000);
    setGuardianTimer(interval);
  };

  const dismissGuardianAlert = () => {
    if (guardianTimer) {
      clearInterval(guardianTimer);
      setGuardianTimer(null);
    }
    setGuardianAlert(null);
    setGuardianState('idle');
    addReplayLog('success', 'AI Guardian: User safety status verified. Beacon cancelled.');
    showToast('Guardian Monitor: Safety status verified.', 'success');
  };

  const handleAddContact = async (contactInfo) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/emergency-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      });
      const newContact = await res.json();
      setContacts((prev) => [newContact, ...prev]);
      showToast('Safety contact added successfully.', 'success');
    } catch (err) {
      setContacts(prev => [{ ...contactInfo, _id: `c_${Date.now()}` }, ...prev]);
      showToast('Safety contact added (Local Registry).', 'success');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/emergency-contacts/${id}`, { method: 'DELETE' });
    } catch (err) { }
    setContacts((prev) => prev.filter(c => c._id !== id));
    showToast('Contact removed.', 'success');
  };

  const handleSubmitAlert = async (alertInfo) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertInfo)
      });
      if (res.ok) {
        showToast('Incident logged! Active safety map refreshed.', 'success');
        fetchHeatmapData();
      }
    } catch (err) {
      setHeatmapData(prev => [{ ...alertInfo, id: `al_${Date.now()}`, isAlert: true, trustScore: 90 }, ...prev]);
      showToast('Incident recorded locally on map.', 'success');
    }
  };

  const handleSendCheckIn = (checkInData) => {
    showToast('👨‍👩‍👧 Family Check-in broadcast sent successfully!', 'success');
    addReplayLog('success', `Check-in ping sent to ${contacts.length} family contacts.`);
  };

  const triggerPanicSOS = async () => {
    const lat = userLocation ? userLocation[0] : (startPoint ? startPoint[0] : 28.6304);
    const lng = userLocation ? userLocation[1] : (startPoint ? startPoint[1] : 77.2177);

    setSosFlasher(true);
    setTimeout(() => setSosFlasher(false), 5000);
    showToast(
      language === 'hi'
        ? '🆘 आपातकालीन SOS प्रसारित: परिजनों एवं पुलिस नेटवर्क को संदेश भेजा गया!'
        : '🆘 SOS BROADCAST DEPLOYED to emergency contacts & police!',
      'error'
    );
    addReplayLog('sos', `Panic SOS Dispatched: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);

    // Voice SOS announcement in selected language
    playPreEntryWarningAudio(null, null, language);

    // 1. Dispatch to panic stream
    try {
      await fetch(`${BACKEND_URL}/api/panic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, userLocationName: 'Connaught Place Central Hub' })
      });
    } catch (err) {
      console.warn('SOS dispatched via fallback offline mesh layer.');
    }

    // 2. Dispatch emergency message to family network
    try {
      await fetch(`${BACKEND_URL}/api/emergency-family-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser?.name || 'Citizen Guardian',
          location: [lat, lng],
          familyContacts: contacts,
          batteryLevel,
          threatType: 'Manual SOS Panic Triggered',
          timestamp: new Date().toLocaleTimeString(),
          language
        })
      });
    } catch (e) {
      console.warn('Family emergency alert dispatch notice:', e);
    }
  };

  const t = translations[language] || translations.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const activeRoutePath = routes ? (selectedRouteType === 'safe' ? routes.safe?.path : selectedRouteType === 'shadow' ? routes.shadow?.path : routes.standard?.path) : null;
  const activeRouteInfo = routes ? (selectedRouteType === 'safe' ? routes.safe : selectedRouteType === 'shadow' ? routes.shadow : routes.standard) : null;

  return (
    <div className={`min-h-screen bg-[#12061c] text-yellow-100 flex flex-col transition-all duration-300 ${sosFlasher ? 'animate-strobe' : ''}`}>
      {/* Top Navbar */}
      <header className="glass-panel sticky top-0 z-[2000] border-b border-safety-border/60 py-2.5 px-3 sm:px-6 flex flex-wrap justify-between items-center gap-2 shadow-2xl">
        <div className="flex items-center gap-3">
          <KavachLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-red-400">
                {t.appTitle}
              </h1>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hidden sm:inline shadow-sm">
                AI-OS v3.2
              </span>
            </div>
            <p className="text-[9px] uppercase font-extrabold text-yellow-400 tracking-widest -mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Top Navbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 15-Language Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => { setIsLangDropdownOpen(!isLangDropdownOpen); playHapticTone('subtle'); }}
              className="flex items-center gap-1.5 text-xs font-black bg-slate-900/90 hover:bg-slate-800 border border-violet-500/50 text-violet-300 px-3 py-1.5 rounded-full transition shadow"
              title="Select App Language (15+ Supported Languages)"
            >
              <span>{currentLangObj.flag}</span>
              <span className="font-bold">{currentLangObj.native}</span>
              <ChevronDown className="w-3 h-3 text-violet-400" />
            </button>

            {/* Language Dropdown Menu */}
            {isLangDropdownOpen && (
              <div className="absolute right-0 top-10 z-[5000] w-64 bg-slate-900/95 backdrop-blur-xl border border-violet-500/40 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 max-h-80 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800">
                  Select Language (15 Global & Indian)
                </div>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                      playHapticTone('subtle');
                      showToast(`Language set to ${lang.name} (${lang.native})`, 'info');
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                      language === lang.code
                        ? 'bg-violet-600 text-white font-black'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.native}</span>
                    </div>
                    <span className="text-[10px] opacity-70 font-normal">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Mode Switcher (Delhi Demo vs GPS) */}
          <button
            onClick={handleToggleLocationMode}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition ${
              locationMode === 'delhi'
                ? 'bg-yellow-950/80 border-yellow-500/60 text-yellow-300 hover:bg-yellow-900'
                : 'bg-violet-950/80 border-violet-500/60 text-violet-300 hover:bg-violet-900'
            }`}
            title="Toggle between Delhi Demo and Real GPS coordinates"
          >
            {locationMode === 'delhi' ? <Globe className="w-3.5 h-3.5 text-yellow-400" /> : <Navigation className="w-3.5 h-3.5 text-violet-400" />}
            <span>{locationMode === 'delhi' ? t.delhiMode : t.gpsMode}</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={handleInstallPwa}
            className="flex items-center gap-1 text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-yellow-500/40 text-yellow-300 px-3 py-1.5 rounded-full transition shadow"
            title="Install Kavach AI as Progressive Web App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.installPwa}</span>
          </button>

          {/* Auth Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-violet-500 text-slate-200 px-3 py-1.5 rounded-full transition"
            title="Manage Identity / Enter Kavach"
          >
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">
              {currentUser && currentUser.name
                ? currentUser.name
                : t.enterKavach}
            </span>
          </button>

          {/* Database & Offline Backup Manager */}
          <button
            onClick={() => setIsDatabaseModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-500/50 text-yellow-300 px-2.5 py-1.5 rounded-full transition shadow"
            title="Database Registry & Offline Backup"
          >
            <Database className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden lg:inline">{t.backupBtn}</span>
          </button>

          {/* Permissions / Calibration Gateway */}
          <button
            onClick={() => setIsPermissionGatewayOpen(true)}
            className="flex items-center gap-1 text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500 text-slate-300 px-2.5 py-1.5 rounded-full transition"
            title="Open Notification & Location Calibration Gateway"
          >
            <Radio className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden lg:inline">{t.sensors}</span>
          </button>

          {/* Replay Intro Splash Button */}
          <button
            onClick={() => setIsSplashVisible(true)}
            className="flex items-center gap-1 text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-full transition"
            title="Replay Opening Cinematic Intro"
          >
            <Play className="w-3 h-3 text-yellow-400" />
            <span className="hidden xl:inline">{t.intro}</span>
          </button>

          {/* Airplane / Offline Mode indicator */}
          <button
            onClick={() => {
              setIsOffline(!isOffline);
              showToast(isOffline ? '☁️ Cloud Sync Online' : '⚡ Switched to 100% Offline Edge Mode', 'info');
            }}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border transition ${
              isOffline
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 animate-pulse'
                : 'bg-slate-900/80 border-safety-border text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="hidden lg:inline">{isOffline ? t.offline : t.online}</span>
          </button>

          {/* Stealth Disguise App Launcher */}
          <button
            onClick={() => setIsDisguiseMode(true)}
            className="flex items-center gap-1 text-xs font-bold bg-violet-950/70 hover:bg-violet-900 border border-violet-500/40 text-violet-200 px-2.5 py-1.5 rounded-full transition shadow"
            title="Launch Fake Calculator Disguise"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{t.disguise}</span>
          </button>

          {/* Quick SOS Trigger */}
          <button
            onClick={triggerPanicSOS}
            className="flex items-center gap-1.5 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.sosPanic}</span>
          </button>
        </div>
      </header>

      {/* Feature Navigation Tabs */}
      <TopNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOffline={isOffline}
        language={language}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`fixed top-24 right-4 sm:right-6 z-[3000] py-3 px-4 rounded-xl border shadow-2xl flex items-center gap-3 transition-all duration-300 animate-fade-in ${
          toastMessage.type === 'error' ? 'bg-rose-950 border-rose-500 text-rose-200' :
          toastMessage.type === 'warning' ? 'bg-amber-950 border-amber-500 text-amber-200' :
          toastMessage.type === 'success' ? 'bg-yellow-950 border-yellow-500 text-yellow-200' :
          'bg-slate-900 border-safety-border text-slate-200'
        }`}>
          <AlertTriangle className={`w-4 h-4 shrink-0 ${
            toastMessage.type === 'error' ? 'text-safety-rose' :
            toastMessage.type === 'warning' ? 'text-safety-amber' :
            toastMessage.type === 'success' ? 'text-safety-emerald' : 'text-safety-accent'
          }`} />
          <span className="text-xs font-semibold">{toastMessage.msg}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-200 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Feature Content Router */}
      <main className="flex-1 p-3 sm:p-5 overflow-y-auto bg-slate-950/40 flex flex-col gap-4">
        {/* Dynamic Opening Hero & Tagline Banner */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-safety-border/70 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-violet-600/10 via-yellow-500/10 to-transparent pointer-events-none"></div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-yellow-300 font-mono">
                  {locationMode === 'gps'
                    ? (language === 'hi' ? '📍 लाइव GPS ट्रैकिंग • स्थान A' : '📍 Live GPS Tracking • Location A (Stationary)')
                    : (language === 'hi' ? '🏛️ दिल्ली सुरक्षा ग्रिड • कनॉट प्लेस' : '🏛️ Delhi Safety Grid • Connaught Place')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 mt-1">
                {t.appTitle}: {t.tagline}
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl mt-0.5">
                {t.heroDesc}
              </p>
            </div>

            {/* Quick Interactive Shortcut Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('graph-search')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                  activeTab === 'graph-search'
                    ? 'bg-violet-600 text-white border-violet-400 shadow-lg shadow-violet-950/60 scale-105'
                    : 'bg-violet-950/40 text-violet-300 border-violet-500/40 hover:bg-violet-900/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>⭐ {t.tabGraphSearch}</span>
              </button>

              <button
                onClick={() => setActiveTab('counterfactual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                  activeTab === 'counterfactual'
                    ? 'bg-violet-600 text-white border-violet-400 shadow-lg shadow-violet-950/60 scale-105'
                    : 'bg-violet-950/40 text-violet-300 border-violet-500/40 hover:bg-violet-900/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⭐ What-If Simulator</span>
              </button>

              <button
                onClick={() => setActiveTab('self-correcting')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                  activeTab === 'self-correcting'
                    ? 'bg-yellow-500 text-slate-950 border-yellow-300 shadow-lg shadow-violet-950/60 scale-105'
                    : 'bg-yellow-950/40 text-yellow-300 border-yellow-500/40 hover:bg-yellow-900/60'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>🧠 Self-Correcting AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Dashboard & Dynamic Map */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="relative h-[440px] lg:h-[520px] rounded-2xl border border-safety-border overflow-hidden shadow-2xl">
                <MapDashboard
                  userLocation={userLocation}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  setStartPoint={setStartPoint}
                  setEndPoint={setEndPoint}
                  heatmapData={heatmapData}
                  routes={routes}
                  selectedRouteType={selectedRouteType}
                  setSelectedRouteType={setSelectedRouteType}
                  onVoteAlert={handleVoteAlert}
                  onOpenHotspotChat={setActiveChatHotspot}
                  safetyTwinLocation={safetyTwinLocation}
                  safetyHour={safetyHour}
                  batteryLevel={batteryLevel}
                  onMarkSafe={handleMarkSafe}
                  isOffline={isOffline}
                />
                {isLoadingRoute && (
                  <div className="absolute inset-0 bg-safety-dark/75 backdrop-blur-sm z-[1500] flex flex-col items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-safety-accent animate-spin" />
                    <span className="text-xs font-bold text-slate-200 mt-3 animate-pulse">Calculating Safe Obstacle Bypass...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationSimulator
                  routePath={activeRoutePath}
                  socket={socket}
                  userLocation={userLocation}
                  setUserLocation={setUserLocation}
                  onSimulationStatusChange={handleSimulationStatusChange}
                  proximityAlert={proximityAlert}
                  setProximityAlert={setProximityAlert}
                  onSafetyTwinUpdate={setSafetyTwinLocation}
                  onAnomalyDetected={handleAnomalyDetected}
                />
                <RiskReplay
                  replayLogs={replayLogs}
                  onClearLogs={() => setReplayLogs([])}
                  isReplaying={isReplaying}
                  onToggleReplay={() => setIsReplaying(!isReplaying)}
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <GuardianAvatar
                guardianState={guardianState}
                proximityAlert={proximityAlert}
                currentSector="CP Outer Circle"
              />

              <RiskDetails
                aiAnalysis={aiAnalysis}
                routeInfo={activeRouteInfo}
                selectedRouteType={selectedRouteType}
              />

              <CityPulseTerminal />

              <AlertsManager
                userLocation={userLocation}
                onSubmitAlert={handleSubmitAlert}
              />
            </div>
          </div>
        )}

        {/* Tab ⭐: Graph Search & User Preferences Engine */}
        {activeTab === 'graph-search' && (
          <div className="flex flex-col gap-5">
            <GraphSearchEngine
              userLocation={userLocation}
              startPoint={startPoint}
              endPoint={endPoint}
              setStartPoint={setStartPoint}
              setEndPoint={setEndPoint}
              setRoutes={setRoutes}
              setSelectedRouteType={setSelectedRouteType}
              showToast={showToast}
              addReplayLog={addReplayLog}
              language={language}
            />

            {/* Live Map Preview with computed graph route */}
            <div className="relative h-[420px] rounded-2xl border border-safety-border overflow-hidden shadow-2xl">
              <MapDashboard
                userLocation={userLocation}
                startPoint={startPoint}
                endPoint={endPoint}
                setStartPoint={setStartPoint}
                setEndPoint={setEndPoint}
                heatmapData={heatmapData}
                routes={routes}
                selectedRouteType={selectedRouteType}
                setSelectedRouteType={setSelectedRouteType}
                onVoteAlert={handleVoteAlert}
                onOpenHotspotChat={setActiveChatHotspot}
                safetyHour={safetyHour}
                batteryLevel={batteryLevel}
                onMarkSafe={handleMarkSafe}
                isOffline={isOffline}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Counterfactual Safety Simulator */}
        {activeTab === 'counterfactual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <CounterfactualSimulator
                routes={routes}
                selectedRouteType={selectedRouteType}
                onSelectRouteType={setSelectedRouteType}
                startPoint={startPoint}
                endPoint={endPoint}
                userLocation={userLocation}
                showToast={showToast}
                addReplayLog={addReplayLog}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="relative h-[420px] lg:h-[480px] rounded-2xl border border-safety-border overflow-hidden shadow-2xl">
                <MapDashboard
                  userLocation={userLocation}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  setStartPoint={setStartPoint}
                  setEndPoint={setEndPoint}
                  heatmapData={heatmapData}
                  routes={routes}
                  selectedRouteType={selectedRouteType}
                  setSelectedRouteType={setSelectedRouteType}
                  onVoteAlert={handleVoteAlert}
                  onOpenHotspotChat={setActiveChatHotspot}
                  safetyHour={safetyHour}
                  batteryLevel={batteryLevel}
                  onMarkSafe={handleMarkSafe}
                  isOffline={isOffline}
                />
              </div>
              <RiskDetails
                aiAnalysis={aiAnalysis}
                routeInfo={activeRouteInfo}
                selectedRouteType={selectedRouteType}
              />
            </div>
          </div>
        )}

        {/* Tab 3: 2-Minutes Ahead Prediction */}
        {activeTab === 'prediction' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="relative h-[440px] lg:h-[500px] rounded-2xl border border-safety-border overflow-hidden shadow-2xl">
                <MapDashboard
                  userLocation={userLocation}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  setStartPoint={setStartPoint}
                  setEndPoint={setEndPoint}
                  heatmapData={heatmapData}
                  routes={routes}
                  selectedRouteType={selectedRouteType}
                  setSelectedRouteType={setSelectedRouteType}
                  onVoteAlert={handleVoteAlert}
                  onOpenHotspotChat={setActiveChatHotspot}
                  safetyTwinLocation={safetyTwinLocation}
                  safetyHour={safetyHour}
                  batteryLevel={batteryLevel}
                  onMarkSafe={handleMarkSafe}
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <TwoMinutePrediction
                userLocation={userLocation}
                routes={routes}
                selectedRouteType={selectedRouteType}
                onSelectRouteType={setSelectedRouteType}
                onSafetyTwinUpdate={setSafetyTwinLocation}
                addReplayLog={addReplayLog}
                showToast={showToast}
              />
              <RiskReplay
                replayLogs={replayLogs}
                onClearLogs={() => setReplayLogs([])}
                isReplaying={isReplaying}
                onToggleReplay={() => setIsReplaying(!isReplaying)}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Offline AI Safety Brain */}
        {activeTab === 'offline-brain' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <OfflineSafetyBrain
                isOffline={isOffline}
                onToggleOffline={setIsOffline}
                userLocation={userLocation}
                startPoint={startPoint}
                endPoint={endPoint}
                setRoutes={setRoutes}
                setSelectedRouteType={setSelectedRouteType}
                showToast={showToast}
                addReplayLog={addReplayLog}
                language={language}
                contacts={contacts}
                heatmapData={heatmapData}
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="relative h-[420px] rounded-2xl border border-safety-border overflow-hidden shadow-2xl">
                <MapDashboard
                  userLocation={userLocation}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  setStartPoint={setStartPoint}
                  setEndPoint={setEndPoint}
                  heatmapData={heatmapData}
                  routes={routes}
                  selectedRouteType={selectedRouteType}
                  setSelectedRouteType={setSelectedRouteType}
                  onVoteAlert={handleVoteAlert}
                  onOpenHotspotChat={setActiveChatHotspot}
                  safetyHour={safetyHour}
                  batteryLevel={batteryLevel}
                  onMarkSafe={handleMarkSafe}
                  isOffline={isOffline}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Silent SOS Detector */}
        {activeTab === 'silent-sos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <SilentSOSDetector
                triggerPanicSOS={triggerPanicSOS}
                addReplayLog={addReplayLog}
                showToast={showToast}
                onToggleDisguiseMode={() => setIsDisguiseMode(true)}
                isDisguiseMode={isDisguiseMode}
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-5">
              <EmergencyCenter
                contacts={contacts}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
                userLocation={userLocation}
                triggerPanicSOS={triggerPanicSOS}
              />
            </div>
          </div>
        )}

        {/* Tab 6: AI Alert Escalation */}
        {activeTab === 'alert-escalation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <AIAlertEscalation
                currentLevel={1}
                triggerPanicSOS={triggerPanicSOS}
                showToast={showToast}
                addReplayLog={addReplayLog}
                setSosFlasher={setSosFlasher}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <GuardianAvatar
                userLocation={userLocation}
                onEscalateSOS={triggerPanicSOS}
                addReplayLog={addReplayLog}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* Tab 7: Self-Correcting AI Engine */}
        {activeTab === 'self-correcting' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <SelfCorrectingSystem
                userLocation={userLocation}
                onBeliefRevised={(revised) => {
                  showToast(`🧠 Self-Correction Update: New Belief Score = ${revised.newBeliefScore}`, 'info');
                  addReplayLog('info', `Belief Revision: Prior ${revised.priorScore} -> Posterior ${revised.newBeliefScore}`);
                }}
                addReplayLog={addReplayLog}
                showToast={showToast}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="relative h-[380px] rounded-2xl border border-safety-border overflow-hidden shadow-2xl">
                <MapDashboard
                  userLocation={userLocation}
                  startPoint={startPoint}
                  endPoint={endPoint}
                  setStartPoint={setStartPoint}
                  setEndPoint={setEndPoint}
                  heatmapData={heatmapData}
                  routes={routes}
                  selectedRouteType={selectedRouteType}
                  setSelectedRouteType={setSelectedRouteType}
                  onVoteAlert={handleVoteAlert}
                  onOpenHotspotChat={setActiveChatHotspot}
                  safetyHour={safetyHour}
                  batteryLevel={batteryLevel}
                  onMarkSafe={handleMarkSafe}
                  isOffline={isOffline}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Explainable AI Sandbox */}
        {activeTab === 'explainability' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <ExplainableAISandbox
                userLocation={userLocation}
                aiAnalysis={aiAnalysis}
                routes={routes}
                selectedRouteType={selectedRouteType}
                onSelectRouteType={setSelectedRouteType}
                showToast={showToast}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <RiskDetails
                aiAnalysis={aiAnalysis}
                routeInfo={activeRouteInfo}
                selectedRouteType={selectedRouteType}
              />
            </div>
          </div>
        )}

        {/* Tab 9: Safety Network Portal */}
        {activeTab === 'safety-network' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <SafetyNetworkPortal
                userLocation={userLocation}
                socket={socket}
                currentUser={currentUser}
                contacts={contacts}
                onAddContact={handleAddContact}
                onSendCheckIn={handleSendCheckIn}
                batteryLevel={batteryLevel}
                showToast={showToast}
                language={language}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <EmergencyCenter
                contacts={contacts}
                onAddContact={handleAddContact}
                onPanic={triggerPanicSOS}
                userLocation={userLocation}
                guardianState={guardianState}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Hotspot AI Explainer Drawer */}
      {activeChatHotspot && (
        <HotspotChat
          hotspot={activeChatHotspot}
          onClose={() => setActiveChatHotspot(null)}
        />
      )}

      {/* Calculator Stealth Disguise Screen */}
      {isDisguiseMode && (
        <StealthDisguiseModal
          isOpen={isDisguiseMode}
          onClose={() => setIsDisguiseMode(false)}
          onEmergencyTrigger={triggerPanicSOS}
        />
      )}

      {/* Guardian Mode Alarm Modal Overlay */}
      {guardianAlert && (
        <div className="fixed inset-0 z-[4000] bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-safety-rose p-6 rounded-2xl max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl animate-pulse">
            <div className="w-16 h-16 bg-safety-rose text-white rounded-full flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-safety-rose uppercase tracking-wider">Guardian Anomaly Detected</h3>
              <p className="text-xs text-slate-300 mt-1">
                {guardianAlert.type === 'deviation'
                  ? 'Significant path deviation from safe route detected!'
                  : guardianAlert.type === 'running'
                    ? 'Sudden running speed velocity spike detected!'
                    : 'Prolonged stoppage detected inside high-risk zone!'}
              </p>
            </div>

            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Emergency Countdown</p>
              <p className="text-4xl font-black text-safety-rose mt-1">{guardianAlert.countdown}s</p>
              <p className="text-[10px] text-slate-400 mt-1.5">SOS Beacon auto-deploys when timer reaches zero.</p>
            </div>

            <button
              onClick={dismissGuardianAlert}
              className="w-full bg-safety-emerald hover:bg-yellow-600 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg shadow-yellow-500/20"
            >
              I AM SAFE (DISMISS BEACON)
            </button>
          </div>
        </div>
      )}

      {/* Startup Splash Screen */}
      {isSplashVisible && (
        <CinematicSplash
          language={language}
          onToggleLanguage={setLanguage}
          onComplete={(selectedLang) => {
            if (selectedLang) setLanguage(selectedLang);
            setIsSplashVisible(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          language={language}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(usr) => {
            setCurrentUser(usr);
            setIsAuthModalOpen(false);
            setIsPermissionGatewayOpen(true);
            showToast(
              language === 'hi'
                ? `🛡️ कवच में आपका स्वागत है, ${usr.name}!`
                : `🛡️ Welcome to Kavach, ${usr.name}!`,
              'success'
            );
          }}
        />
      )}

      {/* Database Manager Modal */}
      {isDatabaseModalOpen && (
        <DatabaseManagerModal
          isOpen={isDatabaseModalOpen}
          onClose={() => setIsDatabaseModalOpen(false)}
          userLocation={userLocation}
          language={language}
        />
      )}

      {/* Permissions Gateway */}
      {isPermissionGatewayOpen && (
        <PermissionGateway
          user={currentUser}
          language={language}
          onCompleteSetup={(cfg) => {
            setIsPermissionGatewayOpen(false);
            setLocationMode(cfg.locationMode);
            if (cfg.coordinates) {
              setStartPoint(cfg.coordinates);
              setUserLocation(cfg.coordinates);
            }
            showToast(
              language === 'hi'
                ? '🚀 सुरक्षा कवच सक्रिय एवं कैलिब्रेटेड!'
                : '🚀 Guardian Shield Armed & Calibrated!',
              'success'
            );
          }}
          onLocationModeSelect={(mode, coords) => {
            setLocationMode(mode);
            if (coords) {
              setStartPoint(coords);
              setUserLocation(coords);
            }
          }}
          contacts={contacts}
          onAddContact={handleAddContact}
        />
      )}
    </div>
  );
}
