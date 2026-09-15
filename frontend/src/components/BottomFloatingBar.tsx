import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

interface BottomFloatingBarProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  onOpenQuickLog?: () => void;
  isDarkMode?: boolean;
}

// Custom crisp SVG Icons styled exactly as the reference image
const HomeNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.5 10.5L12 3.5L20.5 10.5V19.5C20.5 20.3 19.8 21 19 21H5C4.2 21 3.5 20.3 3.5 19.5V10.5Z" />
    <path d="M11.8 17.2H12.2" strokeWidth="2.8" />
  </svg>
);

const GridNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="2.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="2.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="2.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2.5" />
  </svg>
);

const NutritionNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20.5C7.5 20.5 4.5 17.5 4.5 12.5C4.5 8.5 7.2 6.5 9.8 6.5C11.3 6.5 12 7.2 12 7.2C12 7.2 12.7 6.5 14.2 6.5C16.8 6.5 19.5 8.5 19.5 12.5C19.5 17.5 16.5 20.5 12 20.5Z" />
    <path d="M12 6.5V3.5C12 3.5 13.5 3.5 14.5 4.5" />
  </svg>
);

// Exact Chart in a Rounded Square Box as shown in reference image item 3
const ChartBoxNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" />
    <path d="M8 15.5V12" strokeWidth="2.4" />
    <path d="M12 15.5V8.5" strokeWidth="2.4" />
    <path d="M16 15.5V10.5" strokeWidth="2.4" />
  </svg>
);

const UserNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M4.5 19.5C4.5 16.2 7.8 14.8 12 14.8C16.2 14.8 19.5 16.2 19.5 19.5" />
  </svg>
);

export const BottomFloatingBar: React.FC<BottomFloatingBarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
}) => {
  const handleSelect = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    if (onTabChange) onTabChange(id);
  };

  const tabs = [
    { 
      id: 'dashboard', 
      altIds: ['dashboard', 'home', 'activity'], 
      label: 'Home', 
      icon: HomeNavIcon,
    },
    { 
      id: 'workouts', 
      altIds: ['workouts', 'workout', 'plans', 'routines'], 
      label: 'Workouts', 
      icon: GridNavIcon,
    },
    { 
      id: 'nutrition', 
      altIds: ['nutrition', 'food', 'meals', 'macros'], 
      label: 'Nutrition', 
      icon: NutritionNavIcon,
    },
    { 
      id: 'progress', 
      altIds: ['progress', 'analytics', 'trending', 'stats', 'goals'], 
      label: 'Progress', 
      icon: ChartBoxNavIcon,
    },
    { 
      id: 'settings', 
      altIds: ['settings', 'profile', 'community', 'reports'], 
      label: 'Profile', 
      icon: UserNavIcon,
    },
  ];

  const content = (
    <div
      id="bottom-floating-pill-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: 0,
        right: 0,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
      className="fixed bottom-5 inset-x-0 z-50 flex items-center justify-center pointer-events-none px-4 md:hidden"
    >
      <nav
        id="bottom-floating-nav-pill"
        role="navigation"
        aria-label="Bottom Navigation"
        style={{ pointerEvents: 'auto' }}
        className="pointer-events-auto bg-[#08090C] border border-white/10 rounded-full p-[2px] flex items-center h-[54px] shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between w-full h-full relative gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.altIds.includes(activeTab) || activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => handleSelect(tab.id)}
                className="relative h-full aspect-square flex items-center justify-center cursor-pointer select-none outline-none transition-transform active:scale-95"
                title={tab.label}
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFloatingTabCircle"
                    className="absolute inset-0 rounded-full bg-[#C4FA2A] flex items-center justify-center"
                    transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                  />
                )}
                
                <Icon
                  className={`w-[18px] h-[18px] relative z-10 shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-[#08090C]' : 'text-white/80 hover:text-white'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};





