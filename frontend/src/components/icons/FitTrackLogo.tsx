import React from 'react';

interface FitTrackLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  theme?: 'light' | 'dark';
  className?: string;
}

export const FitTrackLogo: React.FC<FitTrackLogoProps> = ({
  size = 'hero',
  theme = 'light',
  className = '',
}) => {
  const isLight = theme === 'light';

  if (size === 'hero') {
    return (
      <div
        id="fittrack-welcome-badge"
        className={`w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] ${
          isLight
            ? 'bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.12)]'
            : 'bg-[#15171c] border border-white/[0.06] shadow-2xl'
        } rounded-[24px] flex flex-col items-center justify-center select-none ${className}`}
      >
        {/* Circular Running + Heartbeat Pulse Icon */}
        <div className="w-[70px] h-[70px] relative flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-full h-full ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            {/* Outer Circular Boundary */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Runner Silhouette + Pulse Waveform Integration */}
            {/* Runner Head */}
            <circle cx="56" cy="30" r="5.5" fill="currentColor" />

            {/* Runner Body & Limbs */}
            {/* Torso leaning forward */}
            <path
              d="M54 37L48 51L58 56"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Front Leg bent */}
            <path
              d="M48 51L44 65L34 68"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Back Leg extending back */}
            <path
              d="M58 56L66 69L76 66"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Front Arm pushing forward */}
            <path
              d="M52 41L63 43L70 37"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Back Arm bent back */}
            <path
              d="M50 41L40 45L34 40"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Horizontal ECG Heartbeat Waveform cutting through left/right */}
            <path
              d="M10 50H28L33 42L38 56L44 46L49 50"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M68 50L73 45L78 54L83 50H90"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* FitTrack Wordmark Text */}
        <span
          className={`${
            isLight ? 'text-slate-900' : 'text-white'
          } font-bold text-[20px] tracking-[-0.02em] mt-1.5 font-['Plus_Jakarta_Sans',sans-serif]`}
        >
          FitTrack
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`w-9 h-9 ${
          isLight
            ? 'bg-white/90 border border-slate-200 shadow-sm'
            : 'bg-[#15171c] border border-white/10 shadow-sm'
        } rounded-xl flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-6 h-6 ${isLight ? 'text-slate-900' : 'text-white'}`}
        >
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
          <circle cx="56" cy="30" r="6" fill="currentColor" />
          <path d="M54 37L48 51L58 56" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M48 51L44 65L34 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M58 56L66 69L76 66" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M52 41L63 43L70 37" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 50H28L33 42L38 56L44 46L49 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M68 50L73 45L78 54L83 50H88" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
        FitTrack
      </span>
    </div>
  );
};
