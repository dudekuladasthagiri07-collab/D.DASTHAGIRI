import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: string;
  showText?: boolean;
  textSize?: string;
  variant?: 'gold' | 'indigo' | 'light' | 'white';
  onClick?: () => void;
}

export const DocPayLogoIcon: React.FC<{ className?: string; colorMode?: 'gold' | 'indigo' | 'white' }> = ({
  className = 'w-9 h-9',
  colorMode = 'gold',
}) => {
  const isWhite = colorMode === 'white';
  const isIndigo = colorMode === 'indigo';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* 'D' Gradient - Rich Metallic Gold or White */}
        <linearGradient id="dpGradD" x1="0%" y1="0%" x2="100%" y2="100%">
          {isWhite ? (
            <>
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FBBF24" /> {/* Amber 400 */}
              <stop offset="35%" stopColor="#F59E0B" /> {/* Amber 500 */}
              <stop offset="70%" stopColor="#D97706" /> {/* Amber 600 */}
              <stop offset="100%" stopColor="#B45309" /> {/* Amber 700 */}
            </>
          )}
        </linearGradient>

        {/* 'P' Gradient - Electric Cyan / Indigo or White */}
        <linearGradient id="dpGradP" x1="0%" y1="0%" x2="100%" y2="100%">
          {isWhite ? (
            <>
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </>
          ) : isIndigo ? (
            <>
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3730A3" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#38BDF8" /> {/* Sky 400 */}
              <stop offset="50%" stopColor="#6366F1" /> {/* Indigo 500 */}
              <stop offset="100%" stopColor="#4338CA" /> {/* Indigo 700 */}
            </>
          )}
        </linearGradient>

        {/* Gloss Overlay Gradient */}
        <linearGradient id="dpGloss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
        </linearGradient>

        {/* Glow Drop Shadow Filter */}
        <filter id="dpGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComponentTransfer in="blur" result="glow">
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle Shadow for Depth */}
        <filter id="dpShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Subtle Accent Ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#dpGradD)"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeDasharray="4 3"
      />

      {/* ======================================================= */}
      {/* INTERLOCKED 'D' & 'P' LOGO DESIGN                       */}
      {/* ======================================================= */}

      {/* A. LETTER 'D' BACK/OUTER SWEEP (Golden Gradient) */}
      <path
        d="M 24 22 H 52 C 72 22 84 34 84 50 C 84 66 72 78 52 78 H 24 V 22 Z"
        fill="none"
        stroke="url(#dpGradD)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#dpShadow)"
      />

      {/* Translucent Inner Fill inside 'D' */}
      <path
        d="M 33 31 H 50 C 62 31 73 39 73 50 C 73 61 62 69 50 69 H 33 V 31 Z"
        fill="url(#dpGradD)"
        fillOpacity="0.08"
      />

      {/* B. LETTER 'P' INTERLOCKING LOOP & STEM (Electric Indigo/Cyan) */}
      {/* P Stem descending through D */}
      <path
        d="M 44 22 V 86"
        stroke="url(#dpGradP)"
        strokeWidth="9"
        strokeLinecap="round"
        filter="url(#dpGlowFilter)"
      />

      {/* P Upper Interlocking Loop */}
      <path
        d="M 44 22 H 64 C 76 22 82 31 82 42 C 82 53 74 60 62 60 H 44"
        fill="none"
        stroke="url(#dpGradP)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.95"
      />

      {/* C. HIGHLIGHTED INTERLOCKING OVERLAYS & SHADING */}
      {/* Gloss Overlap where P weaves over D */}
      <path
        d="M 44 22 H 58"
        stroke="url(#dpGloss)"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Translucent Gloss Arc on 'D' curve */}
      <path
        d="M 72 34 C 80 42 80 58 72 66"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      {/* D. INTERLOCKING CONNECTOR NODES & GLOW POINTS */}
      <circle cx="24" cy="22" r="4.5" fill={isWhite ? '#FFFFFF' : '#FDE047'} />
      <circle cx="24" cy="22" r="2" fill="#0F172A" />

      <circle cx="44" cy="22" r="5" fill={isWhite ? '#FFFFFF' : '#38BDF8'} filter="url(#dpGlowFilter)" />
      <circle cx="44" cy="22" r="2.5" fill="#0F172A" />

      <circle cx="44" cy="60" r="4.5" fill={isWhite ? '#FFFFFF' : '#F59E0B'} />

      <circle cx="44" cy="86" r="4.5" fill={isWhite ? '#FFFFFF' : '#38BDF8'} />
      <circle cx="44" cy="86" r="2" fill="#0F172A" />
    </svg>
  );
};

export const DocPayLogo: React.FC<LogoProps> = ({
  className = '',
  iconSize = 'w-9 h-9',
  showText = true,
  textSize = 'text-xl',
  variant = 'gold',
  onClick,
}) => {
  const colorMode = variant === 'white' ? 'white' : variant === 'indigo' ? 'indigo' : 'gold';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none transition-all ${
        onClick ? 'cursor-pointer hover:opacity-90 group' : ''
      } ${className}`}
    >
      {/* Interlocking D+P Vector Mark */}
      <div className={`${iconSize} relative shrink-0 transition-transform group-hover:scale-105 drop-shadow-md`}>
        <DocPayLogoIcon className="w-full h-full" colorMode={colorMode} />
      </div>

      {/* DocPay Brand Typography */}
      {showText && (
        <div className={`flex items-center font-black tracking-tight leading-none ${textSize}`}>
          <span className={variant === 'light' ? 'text-slate-900' : 'text-white'}>
            Doc
          </span>
          <span
            className={
              variant === 'white'
                ? 'text-white drop-shadow-xs'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-xs'
            }
          >
            Pay
          </span>
        </div>
      )}
    </div>
  );
};
