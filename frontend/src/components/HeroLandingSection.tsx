import React from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import heroSkyBg from '../assets/images/hero_sky_clouds_1789374322335.jpg';
import appLogo from '../assets/images/app_logo.svg';

interface HeroLandingSectionProps {
  onGetStarted?: () => void;
  onTryNow?: () => void;
  onContactUs?: () => void;
  onLogin?: () => void;
  onSignUp?: () => void;
  onNavClick?: (item: string) => void;
}

export const HeroLandingSection: React.FC<HeroLandingSectionProps> = ({
  onGetStarted,
  onTryNow,
  onContactUs,
  onLogin,
  onSignUp,
  onNavClick,
}) => {
  const navItems = ['Programs', 'Features', 'Pricing', 'Community'];

  // Total 28 discrete progress bars matching the reference image's density
  const totalBars = 28;
  const activeBars = 23; // ~82% filled with bright neon green

  return (
    <section
      id="hero-landing-section"
      className="relative w-full min-h-screen bg-white text-[#111215] overflow-hidden flex flex-col justify-between selection:bg-[#B4FA16] selection:text-[#111215] font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC CLOUD & CERULEAN SKY GRADIENT (Reaches through headline) */}
      {/* ========================================================================= */}
      <div className="absolute inset-x-0 top-0 h-[680px] sm:h-[780px] md:h-[860px] pointer-events-none overflow-hidden z-0 select-none">
        {/* Sky-blue base radial atmospheric glow pools extending down behind the entire heading */}
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background: `
              radial-gradient(ellipse 75% 75% at 18% 0%, #88C5EA 0%, #AFDAF4 40%, #DCEFFA 68%, transparent 95%),
              radial-gradient(ellipse 75% 75% at 82% 0%, #95CEF1 0%, #BEE2F7 42%, #E2F2FC 70%, transparent 95%),
              radial-gradient(ellipse 90% 70% at 50% 0%, #A4D7F3 0%, #CAE8FA 48%, #E9F5FD 76%, transparent 100%)
            `,
          }}
        />

        {/* Photorealistic High-Key Cumulus Clouds Image Overlay with deep reach past the heading */}
        <img
          src={heroSkyBg}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-x-0 top-0 w-full h-[620px] sm:h-[720px] md:h-[800px] object-cover object-top opacity-90 mix-blend-multiply"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Organic billowy cumulus cloud puffs framing the sides of the heading */}
        {/* Left side puffy cloud bank */}
        <div className="absolute top-52 sm:top-60 -left-16 w-[480px] h-[340px] bg-white/80 rounded-full blur-[50px]" />
        <div className="absolute top-72 sm:top-80 left-[4%] w-[380px] h-[280px] bg-white/90 rounded-full blur-[45px]" />

        {/* Right side puffy cloud bank */}
        <div className="absolute top-48 sm:top-56 -right-16 w-[520px] h-[360px] bg-white/80 rounded-full blur-[55px]" />
        <div className="absolute top-68 sm:top-76 right-[6%] w-[420px] h-[300px] bg-white/90 rounded-full blur-[45px]" />

        {/* Gentle cloud floor billowing below the heading and subtext */}
        <div className="absolute top-[440px] sm:top-[500px] left-1/2 -translate-x-1/2 w-[880px] h-[320px] bg-white/75 rounded-full blur-[65px]" />

        {/* Smooth horizontal gradient fade into pure white #FFFFFF right before cards */}
        <div className="absolute bottom-0 inset-x-0 h-48 sm:h-56 bg-gradient-to-t from-white via-white/95 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP FLOATING NAVIGATION PILL BAR */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-[1180px] mx-auto px-4 sm:px-8 lg:px-12 pt-7 sm:pt-9 flex items-center justify-between">
        {/* Left Floating Pill Container - translucent pale blue glass matching reference */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-1.5 sm:gap-2.5 bg-[#B8DDF2]/70 hover:bg-[#ADD6ED]/80 border border-white/70 backdrop-blur-md rounded-full pl-1.5 pr-4 sm:pr-5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all"
        >
          {/* Circular Brand Logo Icon Badge */}
          <button
            onClick={() => onNavClick?.('Programs')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-[#111215] shadow-xs hover:scale-105 active:scale-95 transition-transform shrink-0 p-1"
            aria-label="FitTrack Logo"
          >
            <img
              src={appLogo}
              alt="FitTrack Logo"
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            />
          </button>

          {/* Nav Links */}
          <nav className="flex items-center gap-2 sm:gap-3.5">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onNavClick?.(item)}
                className="px-1.5 sm:px-2 py-1 text-xs sm:text-[13px] font-medium text-[#1E293B] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Right Floating Nav Actions: "Log In" + "Get Started / Sign Up" */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <button
            id="hero-nav-login-btn"
            onClick={onLogin || onContactUs}
            className="px-3 sm:px-4 py-2 text-xs sm:text-[13px] font-semibold text-[#17191E] hover:text-black transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            id="hero-nav-get-started-btn"
            onClick={onSignUp || onGetStarted}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#17191E] hover:bg-black text-white text-xs sm:text-[13px] font-semibold rounded-full shadow-[0_6px_22px_rgba(0,0,0,0.22)] active:scale-95 transition-all cursor-pointer"
          >
            Sign Up
          </button>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HERO CENTER CONTENT (Headline, Subtext, Action Buttons) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-6 text-center flex flex-col items-center">
        {/* Main Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] font-bold text-[#14161A] tracking-[-0.035em] leading-[1.12] sm:leading-[1.14] max-w-2xl"
        >
          Stronger Every Day, Right Where You Are.
        </motion.h1>

        {/* Descriptive Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 sm:mt-5 text-xs sm:text-[13.5px] md:text-[14px] text-[#64748B] font-normal leading-relaxed max-w-[490px] text-center"
        >
          A flexible fitness program designed for busy working women. Quick workouts, real results, zero commute. Because your wellbeing deserves a calendar slot too.
        </motion.p>

        {/* Dual Pill CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-7 flex items-center gap-3"
        >
          {/* Primary "Get Started" Pill Button */}
          <button
            id="hero-cta-try-now-btn"
            onClick={onSignUp || onTryNow || onGetStarted}
            className="px-6 sm:px-7 py-2.5 bg-[#17191E] hover:bg-black text-white text-xs sm:text-[13px] font-semibold rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.22)] active:scale-95 transition-all cursor-pointer"
          >
            Start Free
          </button>

          {/* Secondary "Log In" Pill Button */}
          <button
            id="hero-cta-contact-us-btn"
            onClick={onLogin || onContactUs}
            className="px-6 sm:px-7 py-2.5 bg-white hover:bg-slate-50 text-[#14161A] text-xs sm:text-[13px] font-semibold rounded-full border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 transition-all cursor-pointer"
          >
            Log In
          </button>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 4. THREE FEATURE PREVIEW CARDS (Exact 1:1 Layout from Reference) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1060px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch"
        >
          {/* ------------------------------------------------------------- */}
          {/* CARD 1: Woman working out + Dark Glassmorphic Calories Widget */}
          {/* ------------------------------------------------------------- */}
          <div
            id="hero-feature-card-1"
            className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden aspect-[4/4.8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1"
          >
            {/* Background Image of woman working out */}
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80"
              alt="Woman fitness training"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Subtle natural dark gradient */}
            <div className="absolute inset-0 bg-black/15" />

            {/* Floating Glassmorphic Calories Card matching reference */}
            <div className="absolute inset-x-5 top-5 bg-[#1F2228]/60 hover:bg-[#1F2228]/70 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 sm:p-5 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-all">
              {/* Flame Icon + "Calories" / "Count your calories dose" */}
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
                    // Varied heights
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
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 2: Triumphant Smiling Woman with Raised Arms (Exact Lifestyle Tone) */}
          {/* ------------------------------------------------------------- */}
          <div
            id="hero-feature-card-2"
            className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden aspect-[4/4.8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-[#D5EBF9] transition-transform duration-300 hover:-translate-y-1 flex items-end justify-center"
          >
            {/* Organic Soft White Bubble Pattern matching reference card background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[8%] left-[8%] w-28 h-28 rounded-full bg-white/75 blur-xs" />
              <div className="absolute top-[26%] right-[4%] w-36 h-36 rounded-full bg-white/70 blur-xs" />
              <div className="absolute top-[55%] left-[2%] w-28 h-28 rounded-full bg-white/65 blur-xs" />
            </div>

            {/* Bright, joyful model in triumphant / arms-raised athletic pose with airiness */}
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80"
              alt="Triumphant energetic active lifestyle"
              className="relative z-10 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 3: Clean White "Wellness habits that actually fit..." */}
          {/* ------------------------------------------------------------- */}
          <div
            id="hero-feature-card-3"
            className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden aspect-[4/4.8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white p-6 sm:p-7 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 text-left border border-slate-100"
          >
            {/* Top: Pill Badge + Heading */}
            <div>
              {/* "Healthy Tips" Light Pill */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F3F5F7] text-[#475569] text-[11px] font-medium tracking-normal mb-3.5">
                Healthy Tips
              </div>

              {/* Bold Title */}
              <h3 className="text-xl sm:text-[22px] font-semibold text-[#14161A] leading-[1.25] tracking-tight">
                Wellness habits that actually fit your schedule.
              </h3>
            </div>

            {/* Bottom: Stacked Avatars + "2k+ clients" + Description */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Client 1"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Client 2"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                    alt="Client 3"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                    alt="Client 4"
                  />
                </div>
                <span className="text-[12px] text-[#64748B] font-medium">
                  2k+ clients
                </span>
              </div>

              <p className="text-[11.5px] text-[#64748B] leading-relaxed">
                Quick routines and easy meal tips help you stay fit and balanced on busy days. Small steps lead to a big glow.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM BRAND LOGOS (Hinge Health, prompt, Syneos Health, Sutter Health) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-12 sm:mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-40 select-none"
        >
          {/* Hinge Health */}
          <div className="flex items-center gap-2 font-medium text-xs sm:text-[13px] text-[#475569]">
            <div className="flex -space-x-1">
              <span className="w-3.5 h-3.5 rounded-full border border-[#475569] inline-block" />
              <span className="w-3.5 h-3.5 rounded-full border border-[#475569] inline-block" />
            </div>
            <span>Hinge Health</span>
          </div>

          {/* prompt */}
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#475569]">
            <span className="text-base leading-none">❋</span>
            <span>prompt</span>
          </div>

          {/* Syneos Health */}
          <div className="flex items-center gap-1.5 font-medium text-xs sm:text-[13px] text-[#475569]">
            <span className="text-sm">◗</span>
            <span>Syneos Health</span>
          </div>

          {/* Sutter Health */}
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#475569]">
            <span className="text-sm font-black">+</span>
            <span>Sutter Health</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
