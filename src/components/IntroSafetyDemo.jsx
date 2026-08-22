import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, Navigation, MapPin } from 'lucide-react';

export default function IntroSafetyDemo({ language = 'en' }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const isHi = language === 'hi';
  const showAlert = phase >= 2;

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-slate-950/80 shadow-[0_0_40px_rgba(244,63,94,0.15)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
          {isHi ? 'लाइव डेमो • असुरक्षित मार्ग चेतावनी' : 'Live Demo • Unsafe Route Warning'}
        </span>
        <span className="text-[9px] font-mono text-rose-300 animate-pulse">REC ●</span>
      </div>

      <div className="relative h-44 sm:h-48">
        <svg viewBox="0 0 360 180" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="safePath" x1="0" x2="1">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <radialGradient id="dangerGlow" cx="70%" cy="45%" r="35%">
              <stop offset="0%" stopColor="rgba(239,68,68,0.55)" />
              <stop offset="100%" stopColor="rgba(239,68,68,0)" />
            </radialGradient>
          </defs>

          <rect width="360" height="180" fill="#070b16" />
          <circle cx="250" cy="80" r="70" fill="url(#dangerGlow)" />

          <path d="M20 150 C 80 140, 110 90, 160 85 S 240 110, 330 40" fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M20 150 C 80 140, 90 120, 140 155 S 210 170, 330 160"
            fill="none"
            stroke="url(#safePath)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className={phase === 3 ? 'opacity-100' : 'opacity-30'}
          />

          <rect x="210" y="48" width="86" height="52" rx="8" fill="#7f1d1d" opacity="0.85" />
          <text x="253" y="70" textAnchor="middle" fill="#fecaca" fontSize="8" fontWeight="700">UNSAFE ZONE</text>
          <text x="253" y="84" textAnchor="middle" fill="#fda4af" fontSize="7">High crime risk</text>

          <g className={phase === 3 ? 'intro-walker-detour' : 'intro-walker'}>
            <circle r="8" fill="#14b8a6" stroke="#99f6e4" strokeWidth="2" />
            <text y="3" textAnchor="middle" fontSize="8">👤</text>
          </g>
        </svg>

        {showAlert && (
          <div className="absolute top-3 right-3 left-16 sm:left-24 intro-notify">
            <div className="rounded-xl border border-rose-400/70 bg-slate-900/95 px-3 py-2 shadow-xl shadow-rose-950/50">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-lg bg-rose-500/20 p-1.5 text-rose-300">
                  {phase === 3 ? <Navigation className="w-4 h-4" /> : <Bell className="w-4 h-4 animate-bounce" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-rose-300 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    {isHi ? 'कवच अलर्ट' : 'Kavach Alert'}
                  </p>
                  <p className="text-[11px] font-bold text-slate-100 leading-snug mt-0.5">
                    {phase === 3
                      ? (isHi ? 'प्रवेश न करें। सुरक्षित वैकल्पिक मार्ग सक्रिय।' : 'Do not enter. Safer detour is now active.')
                      : (isHi ? 'इस मार्ग में प्रवेश न करें — यह असुरक्षित है।' : 'Do not enter this route — it is unsafe.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-800 text-[10px] text-slate-400">
        <MapPin className="w-3 h-3 text-yellow-400" />
        <span>
          {isHi
            ? 'उपयोगकर्ता खतरनाक क्षेत्र में घुसने लगता है → नोटिफिकेशन रोकता है → सुरक्षित मार्ग दिखाता है।'
            : 'User starts entering a danger zone → notification blocks entry → safer route is shown.'}
        </span>
      </div>
    </div>
  );
}
