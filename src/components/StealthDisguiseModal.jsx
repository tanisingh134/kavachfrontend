import React, { useState } from 'react';
import { X, Shield, Check, Lock } from 'lucide-react';
import { playHapticTone } from '../services/audioSynthesis';

export default function StealthDisguiseModal({ 
  isOpen, 
  onClose, 
  triggerPanicSOS,
  showToast,
  addReplayLog 
}) {
  const [display, setDisplay] = useState('0');
  const [isCovertSosActive, setIsCovertSosActive] = useState(false);

  if (!isOpen) return null;

  const handleBtnClick = (val) => {
    playHapticTone('subtle');

    if (val === 'C') {
      setDisplay('0');
    } else if (val === '=') {
      if (display === '911' || display === '112') {
        // Trigger stealth panic!
        setIsCovertSosActive(true);
        triggerPanicSOS();
        if (showToast) showToast('🤫 Secret Duress Code Recognized! Covert SOS Beacon active.', 'error');
        if (addReplayLog) addReplayLog('sos', 'Stealth Disguise Calculator: Secret PIN code (911=) entered.');
        setTimeout(() => setIsCovertSosActive(false), 3000);
        setDisplay('0');
        return;
      }
      try {
        // Safe evaluation without direct eval
        const sanitized = display.replace(/[^0-9+\-*/.]/g, '');
        // Safe arithmetic calculation
        const result = new Function(`"use strict"; return (${sanitized})`)();
        setDisplay(String(result));
      } catch (err) {
        setDisplay('Error');
      }
    } else {
      setDisplay(prev => prev === '0' || prev === 'Error' ? val : prev + val);
    }
  };

  const handleSecretLogoClick = () => {
    setIsCovertSosActive(true);
    triggerPanicSOS();
    if (showToast) showToast('🤫 Covert SOS Dispatched via Stealth Disguise Logo tap!', 'error');
    if (addReplayLog) addReplayLog('sos', 'Stealth Calculator: Covert header tap triggered emergency dispatch.');
    setTimeout(() => setIsCovertSosActive(false), 3000);
  };

  const buttons = [
    ['C', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className="fixed inset-0 z-[6000] bg-black/95 flex flex-col items-center justify-center p-4 select-none">
      {/* Top subtle controls */}
      <div className="w-full max-w-xs flex justify-between items-center px-4 py-2 text-slate-700">
        <button 
          onClick={handleSecretLogoClick}
          className="flex items-center gap-1 text-[10px] text-slate-800 hover:text-slate-600 transition"
          title="Secret SOS Trigger"
        >
          <Lock className="w-3 h-3" />
          <span>v2.4 Calc Engine</span>
        </button>

        <button 
          onClick={onClose}
          className="text-slate-600 hover:text-slate-400 text-xs px-2 py-1 rounded bg-slate-900"
        >
          Exit Disguise
        </button>
      </div>

      {/* Calculator Body */}
      <div className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
        {/* Covert Status Indicator (only visible when secret SOS triggered) */}
        {isCovertSosActive && (
          <div className="text-[10px] text-yellow-500 font-mono text-center font-bold animate-pulse">
            ● Silent Telemetry Stream Dispatched (Encrypted)
          </div>
        )}

        {/* Display Screen */}
        <div className="bg-slate-900 rounded-2xl p-4 text-right min-h-[70px] flex items-end justify-end border border-slate-800">
          <span className="font-mono text-3xl text-slate-100 font-light truncate">
            {display}
          </span>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2.5">
          {buttons.flat().map((btn, idx) => {
            const isOperator = ['/', '*', '-', '+', '='].includes(btn);
            const isClear = ['C', '+/-', '%'].includes(btn);
            const isZero = btn === '0';

            return (
              <button
                key={idx}
                onClick={() => handleBtnClick(btn)}
                className={`h-14 rounded-2xl font-bold text-lg transition-transform active:scale-95 flex items-center justify-center shadow ${
                  isZero ? 'col-span-2' : ''
                } ${
                  isOperator 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : isClear 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-100'
                }`}
              >
                {btn}
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-slate-600 text-center font-mono">
          Tip: Type <strong>911=</strong> or tap top logo to secretly trigger SOS
        </p>
      </div>
    </div>
  );
}
