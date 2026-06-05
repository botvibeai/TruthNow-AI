import React from 'react';

interface TruthNowLogoProps {
  className?: string;
  height?: number;
}

export const TruthNowLogo: React.FC<TruthNowLogoProps> = ({ 
  className = "h-9", 
  height 
}) => {
  return (
    <svg 
      viewBox="0 0 520 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height: `${height}px`, width: 'auto' } : undefined}
    >
      <defs>
        {/* Glow filters for neon green line */}
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feColorMatrix type="matrix" values="
            0 0 0 0 0.13
            0 0 0 0 0.77
            0 0 0 0 0.36
            0 0 0 1 0
          " />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="cyanGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <linearGradient id="leftFaceGrad" x1="15" y1="25" x2="60" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0b172a" />
          <stop offset="60%" stopColor="#0a2540" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        <linearGradient id="textCyanGradient" x1="115" y1="60" x2="330" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>

        <linearGradient id="textGreenGradient" x1="345" y1="60" x2="385" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>

        <linearGradient id="lineGreenGrad" x1="60" y1="18" x2="60" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="hairCyanGrad" x1="50" y1="25" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* ========================================================= */}
      {/* LEFT SYMBOL: STYLIZED CYBERNETIC HEAD                     */}
      {/* ========================================================= */}
      
      {/* Left side: Shaded futuristic humanoid face */}
      {/* Hair / Back Head Band contour */}
      <path 
        d="M 60,25 C 45,25 35,32 30,42 C 28,40 25,40 22,42 C 18,45 18,52 20,58 C 18,62 18,66 21,70 C 23,72 26,71 28,73 C 33,83 45,95 60,100 Z" 
        fill="url(#hairCyanGrad)" 
        opacity="0.35"
      />

      {/* Headset/Visor strap on left boundary */}
      <path 
        d="M 28,32 C 22,42 18,55 22,70 L 26,82 L 31,88" 
        stroke="#0284c7" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.8"
      />
      <path 
        d="M 18,48 L 22,48 L 24,62 L 20,62 Z" 
        fill="#0ea5e9" 
        stroke="#38bdf8" 
        strokeWidth="1"
      />

      {/* Face polygon silhouettes (Teal / Deep Blue theme) */}
      {/* Forehead / Brow block */}
      <path 
        d="M 60,25 L 49,29 L 45,39 L 52,39 L 60,35 Z" 
        fill="#0ea5e9" 
      />
      {/* Temple / Eye shadow */}
      <path 
        d="M 45,39 L 52,39 L 48,50 L 38,50 Z" 
        fill="#0369a1" 
      />
      {/* Eye glow shape */}
      <polygon 
        points="48,46 51,46 49,50 46,50" 
        fill="#a3e635" 
        opacity="0.9" 
      />
      {/* Nose / Bridge */}
      <path 
        d="M 60,35 L 52,39 L 48,50 L 53,62 L 60,62 Z" 
        fill="url(#leftFaceGrad)" 
      />
      <path 
        d="M 53,62 L 40,64 L 41,68 L 53,68 Z" 
        fill="#0c4a6e" 
      />
      {/* Cheekbone bevel */}
      <path 
        d="M 48,50 L 38,50 L 42,75 L 53,62 Z" 
        fill="#075985" 
      />
      {/* Jaw / Mouth sector */}
      <path 
        d="M 60,62 L 53,68 L 52,78 L 46,84 L 49,89 L 60,86 Z" 
        fill="#0077b6" 
      />
      {/* Bottom Chin */}
      <path 
        d="M 60,86 L 49,89 L 52,98 L 60,95 Z" 
        fill="#0096c7" 
      />
      
      {/* Neck base */}
      <path 
        d="M 60,95 L 48,107 L 52,112 L 60,110 Z" 
        fill="#030712" 
      />
      <path 
        d="M 60,110 L 52,112 L 54,120 L 60,120 Z" 
        fill="#020617" 
      />

      {/* Right side: Hollow Cybernetic brain structure with nodes */}
      {/* Main skull curve */}
      <path 
        d="M 60,25 A 38,38 0 0 1 60,101" 
        fill="none" 
        stroke="#0284c7" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        opacity="0.8"
      />
      <path 
        d="M 60,18 A 45,45 0 0 1 60,108" 
        fill="none" 
        stroke="#38bdf8" 
        strokeWidth="1.2" 
        strokeDasharray="4 4"
        opacity="0.6"
      />

      {/* Horizontal grid cables and electronic micro-modules */}
      <line x1="60" y1="36" x2="94" y2="36" stroke="#0284c7" strokeWidth="1.5" opacity="0.7" />
      <line x1="60" y1="52" x2="98" y2="52" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.8" />
      <line x1="60" y1="68" x2="98" y2="68" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
      <line x1="60" y1="84" x2="92" y2="84" stroke="#0077b6" strokeWidth="1.5" opacity="0.7" />

      {/* Dynamic diagonal connection connectors */}
      <path d="M 72,36 L 82,48 L 94,48" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M 66,68 L 74,80 L 88,80" stroke="#00b4d8" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Small rectangular terminal chips/nodes */}
      <rect x="70" y="32" width="8" height="8" fill="#0284c7" rx="1" />
      <rect x="85" y="48" width="8" height="8" fill="#00b4d8" rx="1" />
      <rect x="72" y="64" width="10" height="8" fill="#a3e635" rx="1" opacity="0.9" />
      <rect x="80" y="80" width="8" height="8" fill="#0369a1" rx="1" />

      {/* Dot indicators */}
      <circle cx="94" cy="36" r="2.5" fill="#38bdf8" />
      <circle cx="98" cy="52" r="2.5" fill="#4ade80" />
      <circle cx="98" cy="68" r="2.5" fill="#38bdf8" />
      <circle cx="92" cy="84" r="2.5" fill="#0284c7" />

      {/* Glowing neon green/lime vertical dividing separator line */}
      <line 
        x1="60" 
        y1="13" 
        x2="60" 
        y2="111" 
        stroke="url(#lineGreenGrad)" 
        strokeWidth="3.2" 
        filter="url(#neonGlow)" 
        strokeLinecap="round" 
      />
      {/* Inner white glow line for extra brightness */}
      <line 
        x1="60" 
        y1="13" 
        x2="60" 
        y2="111" 
        stroke="#f0fdf4" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
      />

      {/* ========================================================= */}
      {/* RIGHT DISPLAY TEXT: FUTURISTIC CUSTOM WORDMARK            */}
      {/* ========================================================= */}
      
      {/* "TruthNow" Text Node (skewed style using Orbitron / custom letter spacing) */}
      <text 
        x="115" 
        y="74" 
        fill="url(#textCyanGradient)" 
        style={{ 
          fontFamily: '"Orbitron", "Space Grotesk", "Inter", sans-serif', 
          fontSize: '44px', 
          fontWeight: '900',
          fontStyle: 'italic',
          letterSpacing: '-2px'
        }}
      >
        {"TruthNow".toUpperCase()}
      </text>

      {/* "AI" in bright green/lime with custom glow matching logo */}
      <text 
        x="420" 
        y="74" 
        fill="url(#textGreenGradient)" 
        filter="url(#cyanGlow)"
        style={{ 
          fontFamily: '"Orbitron", "Space Grotesk", "Inter", sans-serif', 
          fontSize: '44px', 
          fontWeight: '950',
          fontStyle: 'italic',
          letterSpacing: '-1.5px'
        }}
      >
        {"AI".toUpperCase()}
      </text>

      {/* Elegant tagline accent lines */}
      <line x1="115" y1="88" x2="480" y2="88" stroke="#1e293b" strokeWidth="1" />
      <line x1="115" y1="88" x2="220" y2="88" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
      <line x1="450" y1="88" x2="480" y2="88" stroke="#4ade80" strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
};
