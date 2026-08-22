import React, { useState, useEffect } from 'react';
import { 
  Bell, MapPin, Shield, CheckCircle2, AlertTriangle, ArrowRight, 
  Volume2, Compass, Radio, Users, Sparkles, Navigation, Globe
} from 'lucide-react';
import { playHapticTone, playPreEntryWarningAudio } from '../services/audioSynthesis';
import { translations } from '../services/translations';

export default function PermissionGateway({
  user,
  onCompleteSetup,
  onLocationModeSelect,
  contacts,
  onAddContact,
  language = 'en'
}) {
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedLocationMode, setSelectedLocationMode] = useState('gps'); // Default to Real GPS per user requirement!
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [audioTestPassed, setAudioTestPassed] = useState(false);

  const t = translations[language] || translations.en;

  // Check initial browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationGranted(true);
    }
  }, []);

  // Automatically attempt real GPS acquisition on load
  useEffect(() => {
    handleEnableGps();
  }, []);

  const handleRequestNotifications = async () => {
    playHapticTone('subtle');
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationGranted(true);
      }
    } else {
      setNotificationGranted(true);
    }

    // Play test pre-entry audio warning in selected language
    playPreEntryWarningAudio(
      language === 'hi' 
        ? "चेतावनी अलर्ट और आवाज मार्गदर्शन सक्रिय। कवच AI अब लाइव है।"
        : "Notification and voice hazard alerts armed. Kavach AI is now active.",
      () => setAudioTestPassed(true),
      language
    );
  };

  const handleEnableGps = () => {
    setIsLocating(true);
    setLocationError(null);
    playHapticTone('subtle');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setGpsCoordinates([lat, lng]);
          setIsLocating(false);
          setLocationGranted(true);
          setSelectedLocationMode('gps');
          if (onLocationModeSelect) {
            onLocationModeSelect('gps', [lat, lng]);
          }
        },
        (err) => {
          setIsLocating(false);
          setLocationError(
            language === 'hi'
              ? 'GPS अनुमति अस्वीकृत या उपलब्ध नहीं। आप दिल्ली डेमो मोड का उपयोग कर सकते हैं।'
              : 'GPS permission denied or unavailable. You can use Delhi Demo Mode instead.'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setLocationError('Geolocation not supported on this device.');
    }
  };

  const handleSelectDelhiDemo = () => {
    playHapticTone('subtle');
    setSelectedLocationMode('delhi');
    setLocationGranted(true);
    setLocationError(null);
    if (onLocationModeSelect) {
      onLocationModeSelect('delhi', [28.6304, 77.2177]);
    }
  };

  const handleFinishGateway = () => {
    playHapticTone('success');
    if (onCompleteSetup) {
      onCompleteSetup({
        locationMode: selectedLocationMode,
        coordinates: selectedLocationMode === 'gps' && gpsCoordinates ? gpsCoordinates : [28.6304, 77.2177],
        notificationsEnabled: notificationGranted
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-[#12061c]/95 backdrop-blur-xl text-slate-100 flex items-center justify-center p-4 select-none overflow-y-auto">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel-glow max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-yellow-500/40 shadow-2xl relative flex flex-col gap-5 my-auto">
        
        {/* Welcome Header */}
        <div className="flex items-center justify-between pb-4 border-b border-safety-border/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-950/80 border border-yellow-500/50 p-2.5 flex items-center justify-center shadow-lg shadow-violet-950/50">
              <Shield className="w-7 h-7 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  {language === 'hi' ? 'चरण 1 • डिवाइस सेंसर एवं लोकेशन सक्रिय करें' : 'Step 1 • Sensory & Location Calibration'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100 mt-1">
                {language === 'hi' ? `स्वागत है, ${user?.name || 'नागरिक अभिभावक'}` : `Welcome, ${user?.name || 'Citizen Guardian'}`}
              </h2>
              <p className="text-xs text-slate-300">
                {t.permSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Notifications & Voice Pre-Entry Hazard Alerts */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-safety-border/60 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-xl border ${notificationGranted ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                  {t.permNotifications}
                  {notificationGranted && <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {t.permNotificationsDesc}
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestNotifications}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                notificationGranted 
                  ? 'bg-yellow-950/60 border border-yellow-500/40 text-yellow-300 font-bold' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/20 font-black'
              }`}
            >
              {notificationGranted ? t.permEnabledBtn : t.permEnableBtn}
            </button>
          </div>

          {audioTestPassed && (
            <div className="p-2 rounded-lg bg-yellow-950/40 border border-yellow-500/30 text-[10px] text-yellow-300 flex items-center gap-1.5 font-mono">
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
              <span>{t.voiceTestAlert}</span>
            </div>
          )}
        </div>

        {/* 2. Geospatial Location Configuration */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-safety-border/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide">
              {t.permLocationMode}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A: Use Real Device GPS Location (Primary) */}
            <div
              onClick={handleEnableGps}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                selectedLocationMode === 'gps'
                  ? 'bg-violet-950/40 border-violet-400 shadow-lg shadow-violet-950/40 ring-1 ring-violet-400/50'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-violet-300 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> {t.permRealGps}
                  </span>
                  {gpsCoordinates && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-violet-500 text-white">
                      GPS Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {t.permRealGpsDesc}
                </p>
              </div>

              <div className="mt-2 text-[10px] font-mono text-violet-400">
                {isLocating ? 'Acquiring GPS fix...' : gpsCoordinates ? `${gpsCoordinates[0]}° N, ${gpsCoordinates[1]}° E` : 'Tap to acquire live GPS'}
              </div>
            </div>

            {/* Option B: Demo for Delhi (Connaught Place) */}
            <div
              onClick={handleSelectDelhiDemo}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                selectedLocationMode === 'delhi'
                  ? 'bg-yellow-950/40 border-yellow-400 shadow-lg shadow-violet-950/40 ring-1 ring-yellow-400/50'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-yellow-300 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> {t.permDelhiDemo}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-yellow-500 text-slate-950">
                    Delhi Preset
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {t.permDelhiDemoDesc}
                </p>
              </div>
              <div className="mt-2 text-[10px] font-mono text-yellow-400">
                Coordinates: 28.6304° N, 77.2177° E
              </div>
            </div>
          </div>

          {locationError && (
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[10px] text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Enter Dashboard Action */}
        <button
          onClick={handleFinishGateway}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-sm py-3.5 px-6 rounded-2xl transition shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 mt-2 transform hover:scale-[1.01]"
        >
          <Shield className="w-4 h-4" />
          <span>{t.permEnterAppBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
