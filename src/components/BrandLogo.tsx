import React, { useState } from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping for the icon mark
  const iconSizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const textSizes = {
    sm: {
      brand: 'text-base',
      badge: 'text-[9px] px-1.5 py-0.5',
      sub: 'text-[8px]',
      gap: 'gap-2',
    },
    md: {
      brand: 'text-xl',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-[9.5px]',
      gap: 'gap-2.5',
    },
    lg: {
      brand: 'text-2xl',
      badge: 'text-[11px] px-2.5 py-0.5',
      sub: 'text-[11px]',
      gap: 'gap-3',
    },
    xl: {
      brand: 'text-3xl',
      badge: 'text-xs px-3 py-1',
      sub: 'text-xs',
      gap: 'gap-3.5',
    },
  };

  const currentTextSize = textSizes[size];

  // Distinctive differential brand mark:
  // 3D spiral chromatic paint ribbons (Emerald green, Royal blue, Amber orange)
  const renderIconMark = () => (
    <div
      className={`relative ${iconSizeClasses[size]} shrink-0 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md ${
        theme === 'dark'
          ? 'bg-slate-900 border border-emerald-400/30 shadow-indigo-950/60'
          : 'bg-[#121c47] border border-[#2FAE6D]/30 shadow-blue-900/20'
      }`}
    >
      {/* Dynamic ambient color glow behind icon */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#2FAE6D]/25 via-[#38BDF8]/20 to-[#F59E0B]/15 blur-xs pointer-events-none" />

      {!imageError ? (
        <img
          src="/images/pintuco_colorlink_logo.jpg"
          alt="Pintuco ColorLink Emblem"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-top scale-110 relative z-10 transition-transform duration-500 group-hover:scale-120"
        />
      ) : (
        /* Crisp Vector SVG Fallback */
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 p-1.5 drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id="pintuco-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <linearGradient id="pintuco-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1B2A6B" />
            </linearGradient>

            <linearGradient id="pintuco-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            <linearGradient id="pintuco-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Architectural Solid Pillar of the "P" */}
          <path
            d="M 24 16 C 24 13 27 11 30 11 L 38 11 C 41 11 43 13 43 16 L 43 84 C 43 87 41 89 38 89 L 30 89 C 27 89 24 87 24 84 Z"
            fill="url(#pintuco-green)"
          />

          {/* Fluid Upper Loop of the "P" flowing into a dynamic color loop */}
          <path
            d="M 38 13 C 60 13 80 20 80 42 C 80 60 62 67 40 67 L 38 67"
            stroke="url(#pintuco-blue)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vibrant ColorLink Ribbon (Warm coral / solar amber accent loop) */}
          <path
            d="M 46 32 C 62 32 76 39 76 49 C 76 63 58 70 44 78 C 38 81 32 85 26 89"
            stroke="url(#pintuco-amber)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Glossy highlight sheen */}
          <path
            d="M 44 19 C 58 19 70 24 74 34"
            stroke="url(#pintuco-sheen)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Precision core dot */}
          <circle cx="52" cy="40" r="4.5" fill="#FFFFFF" />
          <circle cx="52" cy="40" r="2.5" fill="#10B981" />
        </svg>
      )}
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {renderIconMark()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentTextSize.gap} ${className}`}>
      {renderIconMark()}

      <div className="flex flex-col select-none text-left">
        {/* Brand Row: PINTUCO + ColorLink badge */}
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-[-0.03em] ${currentTextSize.brand} ${
              theme === 'dark' ? 'text-white' : 'text-[#121c47]'
            }`}
          >
            PINTUCO
          </span>

          {/* Distinctive ColorLink Pill Badge */}
          <span
            className={`font-extrabold uppercase tracking-wider rounded-md inline-flex items-center gap-1 shadow-xs border transition-all ${
              currentTextSize.badge
            } ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-300/40 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-[#1B2A6B] to-[#0f172a] text-emerald-400 border-[#2FAE6D]/30 shadow-indigo-900/15'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-xs" />
            <span className={theme === 'dark' ? 'text-slate-950 font-black' : 'text-white font-extrabold'}>
              Color<span className="text-emerald-400 font-black">Link</span>
            </span>
          </span>
        </div>

        {/* Subtitle / Positioning Statement */}
        {showSubtitle && variant === 'full' && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`font-semibold tracking-wide uppercase ${currentTextSize.sub} ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Tecnología en Color & Recubrimientos
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#2FAE6D]" />
            <span className="hidden sm:inline-block text-[9px] font-bold text-[#2FAE6D] tracking-wider">
              OFICIAL
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
