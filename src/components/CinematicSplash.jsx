import React, { useEffect, useState } from 'react';
import { Shield, Activity, ArrowRight } from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';
import { translations } from '../services/translations';
import IntroSafetyDemo from './IntroSafetyDemo';

export default function CinematicSplash({ onComplete, language = 'en', onToggleLanguage }) {
  const [currentLang, setCurrentLang] = useState(language);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    playHapticTone('subtle');

    const lineInterval = setInterval(() => {
      setActiveLineIndex((prev) => (prev + 1) % t.splashLines.length);
    }, 4200);

    return () => clearInterval(lineInterval);
  }, [currentLang, t.splashLines.length]);

  const handleFinish = () => {
    setIsZoomingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete(currentLang);
    }, 550);
  };

  const handleSwitchLanguage = (lang) => {
    setCurrentLang(lang);
    if (onToggleLanguage) onToggleLanguage(lang);
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#12061c] flex flex-col items-center justify-start p-4 sm:p-6 select-none overflow-y-auto transition-all duration-700 ${
        isZoomingOut ? 'scale-125 opacity-0 blur-md pointer-events-none' : 'scale-100 opacity-100'
      }`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-violet-700/20 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-yellow-500/30 p-1 rounded-full shadow-lg">
        <button
          onClick={() => handleSwitchLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
            currentLang === 'en'
              ? 'bg-yellow-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          English
        </button>
        <button
          onClick={() => handleSwitchLanguage('hi')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
            currentLang === 'hi'
              ? 'bg-violet-600 text-white shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          हिंदी
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-4 mt-10">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-yellow-500/30 animate-spin-slow absolute"></div>
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-dashed border-violet-500/40 animate-spin-slow absolute" style={{ animationDirection: 'reverse', animationDuration: '14s' }}></div>
        <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-950 border-2 border-yellow-400/80 p-3 flex items-center justify-center shadow-[0_0_60px_rgba(20,184,166,0.4)]">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 drop-shadow-[0_0_15px_rgba(20,184,166,0.9)]" />
        </div>
      </div>

      <div className="text-center flex flex-col items-center gap-1.5 max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/80 border border-yellow-500/40 text-yellow-300 text-[10px] font-black uppercase tracking-widest shadow-inner">
          <Activity className="w-3 h-3 text-yellow-400 animate-ping" />
          <span>{currentLang === 'hi' ? 'स्वायत्त सुरक्षा प्रणाली v2.4' : 'Autonomous Defense OS v2.4'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-red-400 mt-1">
          {t.splashTitle}
        </h1>

        <p className="text-xs sm:text-sm font-bold text-yellow-300 tracking-wide">
          {t.splashSubtitle}
        </p>
      </div>

      <div className="mt-5 max-w-2xl w-full bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-yellow-500/30 shadow-2xl relative z-10 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {currentLang === 'hi' ? 'कवच AI मिशन' : 'Kavach AI Mission'}
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/30">
            {activeLineIndex + 1}/{t.splashLines.length}
          </span>
        </div>

        <div key={`${currentLang}-${activeLineIndex}`} className="moving-words min-h-[88px] flex items-center py-3">
          <p className="text-sm sm:text-base leading-relaxed text-yellow-50 font-medium">
            {t.splashLines[activeLineIndex]}
          </p>
        </div>

        <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-violet-400 transition-all duration-500"
            style={{ width: `${((activeLineIndex + 1) / t.splashLines.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 w-full max-w-md relative z-10">
        <IntroSafetyDemo language={currentLang} />
      </div>

      <div className="mt-5 mb-6 relative z-10 flex flex-col items-center gap-2">
        <button
          onClick={handleFinish}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-sm py-3.5 px-8 rounded-2xl transition shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <span>{currentLang === 'hi' ? 'कवच में प्रवेश करें (Enter Kavach)' : 'Proceed to Enter Kavach'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-slate-500 font-mono">
          {currentLang === 'hi' ? 'नेक्स्ट-जेन नागरिक सुरक्षा नेटवर्क' : 'Next-Gen Autonomous Safety Network'}
        </span>
      </div>
    </div>
  );
}
