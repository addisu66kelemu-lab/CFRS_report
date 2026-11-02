import React from 'react';

export type BgTheme = 'emerald' | 'sapphire' | 'golden' | 'slate';

interface VitalEventsBackgroundProps {
  className?: string;
  theme?: BgTheme;
  intensity?: 'subtle' | 'vibrant' | 'minimal';
}

export const VitalEventsBackground: React.FC<VitalEventsBackgroundProps> = ({ 
  className = '',
  theme = 'emerald',
  intensity = 'subtle'
}) => {
  // Theme color schemes tailored for a smart, attractive civic look
  const themeStyles = {
    emerald: {
      canvas: 'bg-[#f5f9f7]',
      orb1: 'from-emerald-400/25 via-teal-300/20 to-transparent',
      orb2: 'from-amber-300/20 via-yellow-200/15 to-transparent',
      orb3: 'from-cyan-400/20 via-sky-300/15 to-transparent',
      orb4: 'from-emerald-300/15 via-teal-200/10 to-transparent',
      patternStroke: '#059669',
      accentGlow: 'bg-emerald-500/10',
    },
    sapphire: {
      canvas: 'bg-[#f4f7fb]',
      orb1: 'from-sky-400/25 via-blue-300/20 to-transparent',
      orb2: 'from-indigo-400/20 via-cyan-300/15 to-transparent',
      orb3: 'from-teal-300/20 via-emerald-200/15 to-transparent',
      orb4: 'from-blue-300/15 via-sky-200/10 to-transparent',
      patternStroke: '#0284c7',
      accentGlow: 'bg-sky-500/10',
    },
    golden: {
      canvas: 'bg-[#faf8f4]',
      orb1: 'from-amber-400/25 via-orange-300/15 to-transparent',
      orb2: 'from-yellow-300/20 via-amber-200/15 to-transparent',
      orb3: 'from-emerald-400/15 via-teal-300/10 to-transparent',
      orb4: 'from-orange-300/15 via-amber-200/10 to-transparent',
      patternStroke: '#d97706',
      accentGlow: 'bg-amber-500/10',
    },
    slate: {
      canvas: 'bg-[#f8fafc]',
      orb1: 'from-slate-400/15 via-teal-300/10 to-transparent',
      orb2: 'from-cyan-300/15 via-slate-200/10 to-transparent',
      orb3: 'from-emerald-300/12 via-teal-200/08 to-transparent',
      orb4: 'from-slate-300/15 via-slate-200/10 to-transparent',
      patternStroke: '#475569',
      accentGlow: 'bg-slate-400/08',
    },
  };

  const current = themeStyles[theme] || themeStyles.emerald;
  const opacityMultiplier = intensity === 'vibrant' ? 1.3 : intensity === 'minimal' ? 0.6 : 1.0;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700 ${current.canvas} ${className}`} 
      aria-hidden="true"
    >
      {/* Smart Layer 1: Multi-Point Ambient Lighting Mesh (Vibrant yet Non-Distracting) */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full bg-gradient-to-br blur-[130px] transition-all duration-1000"
        style={{
          opacity: 0.85 * opacityMultiplier,
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${current.orb1}`} />
      </div>

      <div 
        className="absolute -top-[10%] -right-[15%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] transition-all duration-1000"
        style={{
          opacity: 0.75 * opacityMultiplier,
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-bl ${current.orb2}`} />
      </div>

      <div 
        className="absolute top-[40%] left-[25%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[160px] transition-all duration-1000"
        style={{
          opacity: 0.6 * opacityMultiplier,
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${current.orb3}`} />
      </div>

      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] rounded-full blur-[150px] transition-all duration-1000"
        style={{
          opacity: 0.7 * opacityMultiplier,
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-tl ${current.orb4}`} />
      </div>

      {/* Smart Layer 2: Official Security Guilloche & Civic Watermark Pattern (Delicate & Executive) */}
      <svg 
        className="absolute inset-0 w-full h-full transition-opacity duration-700 pointer-events-none"
        style={{ opacity: 0.045 * opacityMultiplier }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern 
            id="smartCivicSecurityPattern" 
            width="120" 
            height="120" 
            patternUnits="userSpaceOnUse"
          >
            {/* Concentric Guilloche Circles */}
            <circle cx="60" cy="60" r="54" fill="none" stroke={current.patternStroke} strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx="60" cy="60" r="42" fill="none" stroke={current.patternStroke} strokeWidth="0.9" />
            <circle cx="60" cy="60" r="30" fill="none" stroke={current.patternStroke} strokeWidth="0.7" strokeDasharray="2 4" />
            <circle cx="60" cy="60" r="16" fill="none" stroke={current.patternStroke} strokeWidth="1" />
            
            {/* 8-Point Civic Emblem Star Motif */}
            <path 
              d="M 60 16 L 64 50 L 98 50 L 70 70 L 80 102 L 60 82 L 40 102 L 50 70 L 22 50 L 56 50 Z" 
              fill="none" 
              stroke={current.patternStroke} 
              strokeWidth="0.8" 
            />

            {/* Micro grid intersection dots */}
            <circle cx="0" cy="0" r="1.5" fill={current.patternStroke} />
            <circle cx="120" cy="0" r="1.5" fill={current.patternStroke} />
            <circle cx="0" cy="120" r="1.5" fill={current.patternStroke} />
            <circle cx="120" cy="120" r="1.5" fill={current.patternStroke} />
            <circle cx="60" cy="60" r="2" fill={current.patternStroke} />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#smartCivicSecurityPattern)" />
      </svg>

      {/* Smart Layer 3: Subtle Micro-Texture Overlay for Physical Depth (Civic Parchment Feel) */}
      <div 
        className="absolute inset-0 bg-radial-[circle_at_50%_0%] from-white/60 via-transparent to-transparent pointer-events-none"
      />

      {/* Smart Layer 4: Top Luminous Header Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 opacity-90" />
    </div>
  );
};
