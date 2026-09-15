import React from 'react';
import { motion } from 'motion/react';

interface FindSessionSectionProps {
  onGetStarted?: () => void;
  onNavClick?: (item: string) => void;
}

interface SessionCardData {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'crown' | 'heart' | 'sun' | 'figure' | 'arrows';
  indicatorLevel: 'Low' | 'Medium' | 'High';
  activeBars: number;
  totalBars: number;
  calorieRange: string;
}

const SESSION_CARDS: SessionCardData[] = [
  {
    id: 'upper-body',
    title: 'Upper Body Pump',
    subtitle: 'Small moves, big impact.',
    iconType: 'crown',
    indicatorLevel: 'Medium',
    activeBars: 18,
    totalBars: 27,
    calorieRange: '130–200',
  },
  {
    id: 'cardio-burst',
    title: 'Quick Cardio Burst',
    subtitle: 'Sweat fast, feel fresh.',
    iconType: 'heart',
    indicatorLevel: 'High',
    activeBars: 23,
    totalBars: 27,
    calorieRange: '200–280',
  },
  {
    id: 'morning-hiit',
    title: 'Morning HIIT',
    subtitle: 'Fast boost for busy days.',
    iconType: 'sun',
    indicatorLevel: 'Medium',
    activeBars: 18,
    totalBars: 27,
    calorieRange: '180–250',
  },
  {
    id: 'easy-stretch',
    title: 'Easy Stretch Flow',
    subtitle: 'Loosen up, stay flexible.',
    iconType: 'figure',
    indicatorLevel: 'Low',
    activeBars: 9,
    totalBars: 27,
    calorieRange: '60–90',
  },
  {
    id: 'lower-body',
    title: 'Lower Body Blast',
    subtitle: 'Short burn for stronger legs.',
    iconType: 'arrows',
    indicatorLevel: 'Medium',
    activeBars: 20,
    totalBars: 27,
    calorieRange: '160–230',
  },
];

const renderCardIcon = (type: SessionCardData['iconType']) => {
  switch (type) {
    case 'crown':
      return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16M5 14l3-8 4 5 4-5 3 8H5z" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 9v4m-2-2h4" />
        </svg>
      );
    case 'sun':
      return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'figure':
      return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="4.5" r="2" />
          <path d="M6 21l3.5-7.5 3.5 3.5 3.5-8.5-5-2-2.5 5.5" />
          <path d="M6 13l3.5-2" />
        </svg>
      );
    case 'arrows':
      return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
          <path d="M14 18l6-6-6-6" />
        </svg>
      );
  }
};

export const FindSessionSection: React.FC<FindSessionSectionProps> = () => {
  return (
    <section
      id="find-session-section"
      className="relative w-full min-h-[820px] md:min-h-[880px] bg-[#1a1c22] text-white overflow-hidden flex flex-col justify-between pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-18 selection:bg-[#B4FA16] selection:text-[#111215]"
    >
      {/* ========================================================================= */}
      {/* Background Environment Image (Home Fitness Studio with equipment) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=2000&auto=format&fit=crop&q=80"
          alt="Home fitness studio background"
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.05] saturate-[0.9]"
        />
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#181a1f]/75 via-[#181a1f]/35 to-[#121417]/85" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#14161b]/20 to-[#0c0e11]/80" />
      </div>

      {/* ========================================================================= */}
      {/* Center Section Title: "Find the Session That Fits Your Day." */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-8 md:mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-[58px] lg:text-[64px] font-bold text-white tracking-[-0.035em] leading-[1.12] max-w-2xl mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
        >
          Find the Session That
          <br />
          Fits Your Day.
        </motion.h2>
      </div>

      {/* ========================================================================= */}
      {/* Cards Carousel Container with Dual-Side Blur & Fade Transitions */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full my-auto">
        {/* Left Side Frosted Blur & Gradient Edge Fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 lg:w-40 z-30 bg-gradient-to-r from-[#181a1f] via-[#181a1f]/65 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_right,black_20%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_20%,transparent_100%)]"
        />

        {/* Right Side Frosted Blur & Gradient Edge Fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 lg:w-40 z-30 bg-gradient-to-l from-[#181a1f] via-[#181a1f]/65 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_left,black_20%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_left,black_20%,transparent_100%)]"
        />

        {/* Scrolling Cards Row */}
        <div
          tabIndex={0}
          aria-label="Workout session choices"
          className="w-full overflow-x-auto no-scrollbar scroll-smooth px-6 sm:px-10 md:px-14 xl:px-16 flex items-center justify-start xl:justify-center gap-4 sm:gap-5 pb-5 pt-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {SESSION_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              /* Substantial, proportional card with balanced padding and typography */
              className="shrink-0 w-[245px] sm:w-[260px] md:w-[272px] lg:w-[280px] rounded-[28px] sm:rounded-[32px] bg-white/[0.16] hover:bg-white/[0.22] backdrop-blur-xl border border-white/30 p-5 sm:p-5.5 md:p-6 shadow-[0_16px_38px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.4)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] select-none"
            >
              {/* Top Header: Circular Icon + Title + Subtitle */}
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 border border-white/35 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                    {renderCardIcon(card.iconType)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white text-[15px] sm:text-[16px] md:text-[16.5px] font-bold tracking-tight leading-snug drop-shadow-xs">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-[11px] sm:text-[11.5px] md:text-[12px] font-normal leading-tight mt-1">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                {/* Indicator Label & Text Level */}
                <div className="mt-6 sm:mt-7 flex items-center justify-between text-xs">
                  <span className="text-white/70 text-[11px] sm:text-[11.5px] md:text-[12px] font-medium tracking-wide">
                    Indicator:
                  </span>
                  <span className="text-white text-[11.5px] sm:text-[12px] md:text-[12.5px] font-semibold">
                    {card.indicatorLevel}
                  </span>
                </div>

                {/* Discrete Vertical Indicator Bars */}
                <div className="mt-2.5 sm:mt-3 flex items-end gap-[2.5px] sm:gap-[3px] h-6 sm:h-7">
                  {Array.from({ length: card.totalBars }).map((_, bIdx) => {
                    const isLit = bIdx < card.activeBars;
                    return (
                      <div
                        key={bIdx}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          isLit
                            ? 'bg-[#B4FA16] shadow-[0_0_8px_rgba(180,250,22,0.7)]'
                            : 'bg-white/25'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Bottom: Calorie Range + "kcal burned" unit */}
              <div className="mt-6 sm:mt-7 flex items-baseline gap-1.5 text-white border-t border-white/15 pt-3.5 sm:pt-4">
                <span className="text-[22px] sm:text-[24px] md:text-[26px] font-bold tracking-tight drop-shadow-xs">
                  {card.calorieRange}
                </span>
                <span className="text-white/75 text-xs sm:text-[13px] font-normal">
                  kcal burned
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Bottom Descriptive Caption Text */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 sm:px-6 text-center mt-6 sm:mt-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs sm:text-[13px] md:text-[13.5px] text-white/85 font-normal leading-relaxed text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        >
          From light boosts to full sweats instantly check intensity levels, calorie ranges, and find the routine that matches your vibe for the day.
        </motion.p>
      </div>
    </section>
  );
};
