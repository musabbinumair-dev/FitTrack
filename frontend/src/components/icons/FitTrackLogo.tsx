import React from 'react';
import appLogo from '../../assets/images/app_logo.svg';

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
        } rounded-[24px] flex flex-col items-center justify-center select-none p-4 ${className}`}
      >
        <div className="w-[72px] h-[72px] relative flex items-center justify-center">
          <img
            src={appLogo}
            alt="FitTrack Logo"
            className="w-full h-full object-contain drop-shadow-md"
          />
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
        } rounded-xl flex items-center justify-center p-1.5`}
      >
        <img
          src={appLogo}
          alt="FitTrack Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
        FitTrack
      </span>
    </div>
  );
};
