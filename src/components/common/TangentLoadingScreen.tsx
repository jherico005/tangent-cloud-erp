import React, { useState, useEffect } from 'react';

export const TangentLogoSVG: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-28 h-28", 
  size = 120 
}) => (
  <svg 
    viewBox="0 0 200 200" 
    width={size} 
    height={size} 
    className={`${className} filter drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="tangentCircleClip">
        <circle cx="100" cy="100" r="96" />
      </clipPath>
      <linearGradient id="tangentTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#088c93" />
        <stop offset="100%" stopColor="#055e63" />
      </linearGradient>
      <linearGradient id="tangentSwooshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    
    <g clipPath="url(#tangentCircleClip)">
      {/* Background Teal Circle */}
      <circle cx="100" cy="100" r="96" fill="url(#tangentTealGrad)" />
      
      {/* Center Dark Curved Swoosh */}
      <path 
        d="M 84 2 C 76 32, 70 85, 26 182 C 60 198, 90 186, 96 150 C 103 110, 97 42, 84 2 Z" 
        fill="url(#tangentSwooshGrad)" 
      />

      {/* White Gap Line Left of Swoosh */}
      <path 
        d="M 78 -2 C 68 30, 62 85, 20 185" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="7" 
      />

      {/* White Gap Line Right of Swoosh */}
      <path 
        d="M 90 -2 C 103 40, 108 112, 86 202" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="7" 
      />

      {/* 3 Horizontal White Lines on Right side */}
      <line x1="98" y1="52" x2="202" y2="52" stroke="#ffffff" strokeWidth="7" />
      <line x1="94" y1="100" x2="202" y2="100" stroke="#ffffff" strokeWidth="7" />
      <line x1="97" y1="148" x2="202" y2="148" stroke="#ffffff" strokeWidth="7" />
    </g>
    
    {/* Crisp Outer Ring */}
    <circle cx="100" cy="100" r="96" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
  </svg>
);

interface TangentLoadingScreenProps {
  progress?: number;
  statusMessage?: string;
  onFinished?: () => void;
  fullscreen?: boolean;
  isDarkMode?: boolean;
  transparent?: boolean;
}

export const TangentLoadingScreen: React.FC<TangentLoadingScreenProps> = ({
  progress: externalProgress,
  statusMessage: externalStatus,
  onFinished,
  fullscreen = true,
  isDarkMode: propIsDarkMode,
  transparent = true
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Tangent Core Engine...');

  // Theme detection logic (prop > html class > localStorage)
  const isDark = propIsDarkMode !== undefined 
    ? propIsDarkMode 
    : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('tangent_theme_mode') !== 'light');

  const activeProgress = externalProgress !== undefined ? externalProgress : internalProgress;
  const activeStatus = externalStatus || statusText;

  // Auto increment if self-managed
  useEffect(() => {
    if (externalProgress !== undefined) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onFinished) setTimeout(onFinished, 300);
          return 100;
        }
        
        // Update messages at key milestones
        if (prev === 20) setStatusText('Connecting Azure SQL Cloud Gateway...');
        if (prev === 50) setStatusText('Loading Telemetry & Field Service Modules...');
        if (prev === 80) setStatusText('Verifying Encrypted Credentials...');
        if (prev === 95) setStatusText('System Ready! Launching Workspace...');

        return prev + 2;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [externalProgress, onFinished]);

  return (
    <div className={`flex flex-col items-center justify-center font-sans select-none overflow-hidden transition-all duration-300 ${
      fullscreen 
        ? transparent
          ? isDark 
            ? 'fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md text-white' 
            : 'fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md text-slate-100'
          : isDark 
            ? 'fixed inset-0 z-50 bg-slate-950 text-white' 
            : 'fixed inset-0 z-50 bg-slate-100 text-slate-800'
        : isDark
          ? 'w-full h-full min-h-[380px] bg-slate-950/80 backdrop-blur-md text-white rounded-2xl p-6 border border-slate-800/80 shadow-2xl'
          : 'w-full h-full min-h-[380px] bg-slate-900/70 backdrop-blur-md text-slate-100 rounded-2xl p-6 border border-slate-700 shadow-xl'
    }`}>
      
      {/* Eye-Safe Two-Tone Background Glow */}
      <div className={`absolute w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none animate-pulse ${
        isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'
      }`}></div>
      <div className={`absolute w-[350px] h-[350px] rounded-full blur-3xl pointer-events-none animate-pulse ${
        isDark ? 'bg-teal-600/10' : 'bg-teal-400/20'
      }`} style={{ animationDelay: '1.5s' }}></div>

      {/* SATELLITE CIRCLES LOADING ANIMATION (Compact & Theme-aware) */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
        
        {/* Rotating Container for the Satellite Orbs */}
        <div className="absolute inset-0 flex items-center justify-center animate-[spin_4s_linear_infinite]">
          {/* 8 Radial Satellite Dots at 45° Increments */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const radius = 38; // distance from center
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <div
                key={deg}
                className={`absolute w-2.5 h-2.5 rounded-full animate-pulse ${
                  isDark
                    ? 'bg-[#2a8ba8] shadow-[0_0_6px_rgba(42,139,168,0.8)]'
                    : 'bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  animationDelay: `${idx * 0.12}s`,
                  animationDuration: '1.5s'
                }}
              />
            );
          })}
        </div>

        {/* Central Teal Orb (Clean Solid Compact Sphere - Theme aware) */}
        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-10 ${
          isDark
            ? 'bg-gradient-to-br from-[#309bb9] to-[#20758e] shadow-[0_0_12px_rgba(42,139,168,0.6)] border border-teal-300/30'
            : 'bg-gradient-to-br from-[#0284c7] to-[#0f766e] shadow-[0_0_12px_rgba(2,132,199,0.5)] border border-teal-400/40'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-ping ${isDark ? 'bg-cyan-200/90' : 'bg-white'}`}></div>
        </div>

      </div>

      {/* Status & Clean Compact Percentage Section */}
      <div className="mt-4 space-y-2 text-center max-w-sm w-full px-4 relative z-10">
        <p className="text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 text-white">
          <span className="w-1.5 h-1.5 rounded-full animate-ping bg-white"></span>
          <span className="text-white drop-shadow-sm">{activeStatus}</span>
        </p>

        {/* Compact Percentage Badge */}
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-600/80 text-white text-xs sm:text-sm font-mono font-extrabold shadow-md tracking-widest">
          {Math.min(100, Math.round(activeProgress))}% COMPLETE
        </div>
      </div>

    </div>
  );
};

