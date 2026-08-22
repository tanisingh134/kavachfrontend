import React from 'react';

export default function KavachLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center ${currentSize} ${className} group cursor-pointer`}>
      {/* Dynamic Ambient Amber Neon Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/50 via-amber-400/40 to-yellow-500/30 rounded-2xl blur-md opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse"></div>

      {/* Cyber Aegis Custom SVG Badge */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_0_14px_rgba(245,158,11,0.7)] transform group-hover:rotate-6 transition-transform duration-500"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="shieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="coreGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagonal Shield Armor Frame in Slate 950 with Amber Edge */}
        <polygon
          points="50,4 88,22 88,66 50,96 12,66 12,22"
          fill="#1a0b2e"
          stroke="url(#shieldGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Futuristic Cyber Plates */}
        <polygon
          points="50,14 80,29 80,62 50,86 20,62 20,29"
          fill="rgba(15, 23, 42, 0.92)"
          stroke="#F59E0B"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          opacity="0.85"
        />

        {/* Rotating Orbital Gyro Ring (Upper & Lower Wings) */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="url(#shieldGrad)"
          strokeWidth="1.5"
          strokeDasharray="16 8 4 8"
          className="origin-center animate-spin-slow"
          opacity="0.9"
        />

        {/* Core Quantum AI Nucleus (Diamond Crystal) */}
        <polygon
          points="50,30 66,50 50,70 34,50"
          fill="url(#coreGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          filter="url(#neonGlow)"
        />

        {/* Central Luminous Node */}
        <circle
          cx="50"
          cy="50"
          r="4.5"
          fill="#FFFFFF"
          className="animate-ping origin-center"
        />
        <circle
          cx="50"
          cy="50"
          r="3"
          fill="#030712"
        />

        {/* Tech Corner Radar Crosshairs */}
        <line x1="50" y1="18" x2="50" y2="24" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="76" x2="50" y2="82" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="50" x2="32" y2="50" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="68" y1="50" x2="74" y2="50" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
