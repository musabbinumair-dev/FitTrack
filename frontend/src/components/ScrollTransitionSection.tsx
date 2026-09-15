import React from 'react';
import { motion } from 'motion/react';
import { Flame, Check, X } from 'lucide-react';

interface ScrollTransitionSectionProps {
  onGetStarted?: () => void;
  onTryNow?: () => void;
  onContactUs?: () => void;
  onNavClick?: (item: string) => void;
}

export const ScrollTransitionSection: React.FC<ScrollTransitionSectionProps> = ({
  onGetStarted,
  onTryNow,
  onContactUs,
}) => {
  // Discrete progress bars for Calories card
  const totalBars = 28;
  const activeBars = 23;

  return (
    <div
      id="scroll-transition-section"
      className="relative w-full bg-white text-[#111215] overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#B4FA16] selection:text-[#111215]"
    >
      {/* ========================================================================= */}
      {/* CONTINUATION SECTION: EXACT REPLICA OF USER REFERENCE IMAGE */}
      {/* "Built for anyone [pill-photo-1] balancing career [pill-photo-2] and health. Smarter workouts, right from home." */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-20 sm:pt-28 md:pt-36 pb-16 sm:pb-24">
        <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          
          {/* Main Display Headline (3-line layout matching exact reference image typography & line breaks) */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[34px] sm:text-[46px] md:text-[54px] lg:text-[58px] font-bold text-[#14161A] tracking-[-0.035em] leading-[1.22] sm:leading-[1.18] text-center"
          >
            <span className="inline-block">Built for anyone</span>{' '}
            {/* Inline Thumbnail 1: Hands tied with workout straps / gym wrist wrap */}
            <span className="inline-block align-middle mx-1 sm:mx-1.5 -translate-y-1 sm:-translate-y-1.5">
              <span className="relative inline-block w-[48px] h-[34px] sm:w-[64px] sm:h-[44px] md:w-[72px] md:h-[48px] rounded-[14px] sm:rounded-[18px] md:rounded-[20px] bg-white p-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80"
                  alt="Fitness straps wrist wrap"
                  className="w-full h-full object-cover rounded-[11px] sm:rounded-[15px] md:rounded-[17px]"
                />
              </span>
            </span>{' '}
            <span className="inline-block">balancing</span>
            <br className="hidden sm:inline" />
            <span className="inline-block">career</span>{' '}
            {/* Inline Thumbnail 2: Woman holding fitness tracker / home workout in light room */}
            <span className="inline-block align-middle mx-1 sm:mx-1.5 -translate-y-1 sm:-translate-y-1.5">
              <span className="relative inline-block w-[48px] h-[34px] sm:w-[64px] sm:h-[44px] md:w-[72px] md:h-[48px] rounded-[14px] sm:rounded-[18px] md:rounded-[20px] bg-white p-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&auto=format&fit=crop&q=80"
                  alt="Woman working out"
                  className="w-full h-full object-cover rounded-[11px] sm:rounded-[15px] md:rounded-[17px]"
                />
              </span>
            </span>{' '}
            <span className="inline-block">and health. Smarter</span>
            <br />
            <span className="inline-block">workouts, right from home.</span>
          </motion.h2>

          {/* Subtext: "A flexible fitness program designed for busy working women." */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 sm:mt-6 text-xs sm:text-[13px] md:text-[13.5px] text-[#64748B] font-normal leading-relaxed max-w-md text-center"
          >
            A flexible fitness program designed for busy working women.
          </motion.p>

          {/* Dual Pill Action Buttons (Solid Black "Try Now" with prominent soft shadow + Light Outlined "Contact Us") */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 sm:mt-8 flex items-center justify-center gap-3 sm:gap-3.5"
          >
            {/* Primary "Try Now" Pill Button with distinctive dark drop shadow */}
            <button
              id="continue-try-now-btn"
              onClick={onTryNow || onGetStarted}
              className="px-6 sm:px-7 py-2.5 sm:py-2.5 bg-[#17191E] hover:bg-black text-white text-xs sm:text-[13px] font-semibold rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.28)] active:scale-95 transition-all cursor-pointer"
            >
              Try Now
            </button>

            {/* Secondary "Contact Us" Pill Button with white background & subtle border */}
            <button
              id="continue-contact-us-btn"
              onClick={onContactUs}
              className="px-5 sm:px-6 py-2.5 sm:py-2.5 bg-white hover:bg-slate-50 text-[#14161A] text-xs sm:text-[13px] font-medium rounded-full border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-all cursor-pointer"
            >
              Contact Us
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FULL FEATURE SECTION: "Smarter Training, Stronger Results" + 3 FULL CARDS */}
      {/* ========================================================================= */}
      <section
        id="smarter-training-results-section"
        className="relative w-full pt-8 sm:pt-14 md:pt-18 pb-20 sm:pb-28 bg-white overflow-hidden"
      >
        {/* Bold 2-Line Headline */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] font-bold text-[#14161A] tracking-[-0.035em] leading-[1.12] sm:leading-[1.14] max-w-xl text-center"
          >
            Smarter Training,
            <br />
            Stronger Results
          </motion.h2>

          {/* Centered Gray Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 sm:mt-5 text-xs sm:text-[13px] md:text-[14px] text-[#64748B] font-normal leading-relaxed max-w-lg text-center"
          >
            Gain clarity, consistency, and control with features built for high-performance fitness journeys.
          </motion.p>
        </div>

        {/* 3 FULL CARDS GRID */}
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
            
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: Build Momentum, Start Small. (Workout Routine Checklist Widget) */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden aspect-[4/5.2] shadow-[0_10px_35px_rgba(0,0,0,0.05)] bg-[#212429] flex flex-col justify-between p-6 sm:p-7 text-white select-none"
            >
              {/* Background Photo */}
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80"
                alt="Fitness workouts"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/75" />

              {/* Top: Floating Glassmorphic Routine Widget */}
              <div className="relative z-10 w-full bg-[#23272F]/70 hover:bg-[#23272F]/80 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 sm:p-5 shadow-[0_16px_36px_rgba(0,0,0,0.35)] transition-all">
                <div className="space-y-3.5">
                  {/* Item 1: 5x Push Up */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] overflow-hidden shrink-0 border border-white/20 bg-slate-800">
                      <img
                        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&auto=format&fit=crop&q=80"
                        alt="Push up exercise"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-xs sm:text-[13px] font-semibold leading-tight">
                        5x Push Up
                      </h4>
                      <p className="text-white/65 text-[11px] leading-tight mt-0.5 font-normal">
                        Simple upper-body boost.
                      </p>
                    </div>
                  </div>

                  {/* Item 2: 30s Plank */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] overflow-hidden shrink-0 border border-white/20 bg-slate-800">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
                        alt="Plank exercise"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-xs sm:text-[13px] font-semibold leading-tight">
                        30s Plank
                      </h4>
                      <p className="text-white/65 text-[11px] leading-tight mt-0.5 font-normal">
                        Quick core activation.
                      </p>
                    </div>
                  </div>

                  {/* Item 3: 5x Squats */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] overflow-hidden shrink-0 border border-white/20 bg-slate-800">
                      <img
                        src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=120&auto=format&fit=crop&q=80"
                        alt="Squats exercise"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-xs sm:text-[13px] font-semibold leading-tight">
                        5x Squats
                      </h4>
                      <p className="text-white/65 text-[11px] leading-tight mt-0.5 font-normal">
                        Smooth waist-shaping move.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Title & Subtitle */}
              <div className="relative z-10 pt-6 text-left">
                <h3 className="text-lg sm:text-[20px] font-bold text-white tracking-tight leading-snug">
                  Build Momentum, Start Small.
                </h3>
                <p className="text-white/70 text-xs sm:text-[12.5px] leading-relaxed mt-1 font-normal">
                  Easy routines that help you stay consistent day by day.
                </p>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: Know Your Burn, Own Your Day. (Calories Tracker Card) */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden aspect-[4/5.2] shadow-[0_10px_35px_rgba(0,0,0,0.05)] bg-[#1F2228] flex flex-col justify-between p-6 sm:p-7 text-white select-none"
            >
              {/* Background Photo */}
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80"
                alt="Woman wellness training"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/75" />

              {/* Top: Floating Glassmorphic Calories Widget */}
              <div className="relative z-10 w-full bg-[#23272F]/70 hover:bg-[#23272F]/80 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 sm:p-5 shadow-[0_16px_36px_rgba(0,0,0,0.35)] transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                    <Flame className="w-4 h-4 text-white/90" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs sm:text-[13px] font-semibold leading-tight">
                      Calories
                    </h4>
                    <p className="text-white/60 text-[10.5px] leading-tight mt-0.5 font-normal">
                      Count your calories dose
                    </p>
                  </div>
                </div>

                {/* Progress Bar with 0 and 2,530 labels */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] text-white/50 font-mono mb-1.5">
                    <span>0</span>
                    <span>2,530</span>
                  </div>

                  {/* Discrete Neon Green/Lime Bars */}
                  <div className="flex items-end gap-[3px] h-5 sm:h-6">
                    {Array.from({ length: totalBars }).map((_, i) => {
                      const isLit = i < activeBars;
                      const barHeightPercent = 70 + ((i * 11) % 30);
                      return (
                        <div
                          key={i}
                          style={{ height: `${barHeightPercent}%` }}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            isLit
                              ? 'bg-[#B4FA16] shadow-[0_0_8px_rgba(180,250,22,0.5)]'
                              : 'bg-white/20'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Large Value Display: 2.102 /Kcal */}
                <div className="mt-3 flex items-baseline gap-1 text-white">
                  <span className="text-2xl sm:text-[25px] font-bold tracking-tight">
                    2.102
                  </span>
                  <span className="text-[11px] text-white/60 font-medium">/Kcal</span>
                </div>
              </div>

              {/* Bottom: Title & Subtitle */}
              <div className="relative z-10 pt-6 text-left">
                <h3 className="text-lg sm:text-[20px] font-bold text-white tracking-tight leading-snug">
                  Know Your Burn, Own Your Day.
                </h3>
                <p className="text-white/70 text-xs sm:text-[12.5px] leading-relaxed mt-1 font-normal">
                  Small insights that help you stay mindful and in control.
                </p>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 3: Progress Without the Pressure. (Indoor Walk Active Workout Widget) */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden aspect-[4/5.2] shadow-[0_10px_35px_rgba(0,0,0,0.05)] bg-[#212429] flex flex-col justify-between p-6 sm:p-7 text-white select-none"
            >
              {/* Background Photo */}
              <img
                src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&auto=format&fit=crop&q=80"
                alt="Indoor walk active workout"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/75" />

              {/* Top: Floating Glassmorphic "Indoor Walk" Active Tracker Card */}
              <div className="relative z-10 w-full bg-[#23272F]/70 hover:bg-[#23272F]/80 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 sm:p-5 shadow-[0_16px_36px_rgba(0,0,0,0.35)] transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                    <svg
                      className="w-4 h-4 text-white/90"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 17l6-6-6-6M12 19h8" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white text-xs sm:text-[13px] font-semibold leading-tight">
                      Indoor Walk
                    </h4>
                    <p className="text-white/60 text-[10.5px] leading-tight mt-0.5 font-normal">
                      Log your indoor workout time
                    </p>
                  </div>
                </div>

                {/* Big Digital Timer Display: 00:02:56 */}
                <div className="mt-3.5 text-center">
                  <span className="text-3xl sm:text-[34px] font-bold text-white tracking-tight font-mono">
                    00:02:56
                  </span>
                </div>

                {/* Metrics 3-Col: Heart Rate 120, Steps 251, Calories 120 */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center border-t border-white/10 pt-2.5">
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-white">120</div>
                    <div className="text-[10px] text-white/50 font-normal mt-0.5">Heart Rate</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-white">251</div>
                    <div className="text-[10px] text-white/50 font-normal mt-0.5">Steps</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-white">120</div>
                    <div className="text-[10px] text-white/50 font-normal mt-0.5">Calories</div>
                  </div>
                </div>

                {/* Dual Pill Control Buttons: Red 'X' & Bright Green Check */}
                <div className="mt-4 flex items-center gap-2.5">
                  <button
                    className="flex-1 py-2 bg-[#C23934]/85 hover:bg-[#C23934] text-white rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    aria-label="Stop workout"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    className="flex-1 py-2 bg-[#70B92C] hover:bg-[#7bc732] text-white rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    aria-label="Confirm workout"
                  >
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Bottom: Title & Subtitle */}
              <div className="relative z-10 pt-6 text-left">
                <h3 className="text-lg sm:text-[20px] font-bold text-white tracking-tight leading-snug">
                  Progress Without the Pressure.
                </h3>
                <p className="text-white/70 text-xs sm:text-[12.5px] leading-relaxed mt-1 font-normal">
                  Simple, sustainable habits that keep you balanced and feeling good.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};
