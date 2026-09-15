import React from 'react';
import { motion } from 'motion/react';

interface FooterCtaSectionProps {
  onGetStarted?: () => void;
  onJoinNow?: () => void;
  onLinkClick?: (link: string) => void;
}

export const FooterCtaSection: React.FC<FooterCtaSectionProps> = ({
  onGetStarted,
  onJoinNow,
  onLinkClick,
}) => {
  const companyLinks = [
    'About',
    'Our Story',
    'Careers',
    'Meet the Trainers',
    'Press & Media',
  ];

  const resourcesLinks = [
    'The Blog',
    'Nutrition Guides',
    'Community Forum',
    'Success Stories',
  ];

  const supportLinks = ['Help Center', 'Newsletter', 'Contact Us'];

  const connectLinks = ['X', 'Instagram', 'Tiktok', 'Youtube'];

  const legalLinks = ['Privacy Policy', 'Terms & Condition', 'Help Support'];

  return (
    <div
      id="footer-cta-wrapper"
      className="relative w-full bg-[#0c0d11] text-white selection:bg-[#B4FA16] selection:text-[#111215] select-none"
    >
      {/* Deep atmospheric ambient lighting under both sections */}
      <div className="absolute inset-0 bg-radial from-[#1C1E26] via-[#101115] to-[#07080A] pointer-events-none" />
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/[0.07] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[45%] left-1/3 w-[500px] h-[280px] bg-[#B4FA16]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. CALL-TO-ACTION SECTION ("Start Today, Feel the Difference.") */}
      {/* Sticks in place so the glassmorphic footer glides smoothly up over it */}
      {/* ========================================================================= */}
      <section
        id="cta-section"
        className="sticky top-0 z-10 w-full min-h-[60vh] sm:min-h-[68vh] md:min-h-[72vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-[56px] lg:text-[62px] font-bold text-white tracking-[-0.035em] leading-[1.12] max-w-2xl mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
        >
          Start Today, Feel the
          <br />
          Difference.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3.5 sm:mt-4 text-xs sm:text-[14px] md:text-[14.5px] text-white/70 max-w-md mx-auto font-normal leading-relaxed"
        >
          Join short, effective workouts built to fit your real life.
        </motion.p>

        {/* Glossy dark capsule CTA button: "Get Started Now" */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-7"
        >
          <button
            type="button"
            onClick={onGetStarted}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#1C1E24] hover:bg-[#252830] text-white text-xs sm:text-[13px] font-medium tracking-tight border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Get Started Now</span>
          </button>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 2. GLASSMORPHIC FOOTER SECTION */}
      {/* Appears OVER the CTA section as you scroll with frosted glass backdrop blur */}
      {/* Top border divider is invisible as requested */}
      {/* ========================================================================= */}
      <footer
        id="fittrack-footer"
        className="relative z-20 w-full backdrop-blur-2xl bg-[#0c0d12]/80 sm:bg-[#0c0d12]/75 border-t-0 border-transparent shadow-[0_-25px_60px_rgba(0,0,0,0.7)] text-white"
      >
        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 items-start">
            {/* Left Column: Heading, Subtitle, Join Now CTA */}
            <div className="lg:col-span-4 flex flex-col items-start">
              <h3 className="text-2xl sm:text-[28px] md:text-[30px] font-bold text-white tracking-[-0.03em] leading-tight drop-shadow-xs">
                Your Fitness,
                <br />
                Reimagined.
              </h3>
              <p className="mt-2.5 text-xs sm:text-[13px] text-white/65 max-w-[270px] font-normal leading-relaxed">
                Join the FitTrack community and discover a sustainable way to stay
                fit.
              </p>

              {/* Join Now Capsule Button */}
              <button
                type="button"
                onClick={onJoinNow || onGetStarted}
                className="mt-5 inline-flex items-center justify-center px-5 py-1.5 rounded-full bg-[#1C1E24] hover:bg-[#252830] text-white text-xs font-semibold tracking-tight border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Join Now
              </button>
            </div>

            {/* Right Columns: 4 Navigation Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
              {/* Column 1: Company */}
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-white/95 tracking-tight mb-3 sm:mb-4">
                  Company
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => onLinkClick?.(link)}
                        className="text-xs sm:text-[12.5px] text-white/50 hover:text-white transition-colors duration-150 text-left cursor-pointer"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Resources */}
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-white/95 tracking-tight mb-3 sm:mb-4">
                  Resources
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {resourcesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => onLinkClick?.(link)}
                        className="text-xs sm:text-[12.5px] text-white/50 hover:text-white transition-colors duration-150 text-left cursor-pointer"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Support */}
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-white/95 tracking-tight mb-3 sm:mb-4">
                  Support
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {supportLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => onLinkClick?.(link)}
                        className="text-xs sm:text-[12.5px] text-white/50 hover:text-white transition-colors duration-150 text-left cursor-pointer"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Connect */}
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-white/95 tracking-tight mb-3 sm:mb-4">
                  Connect
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {connectLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => onLinkClick?.(link)}
                        className="text-xs sm:text-[12.5px] text-white/50 hover:text-white transition-colors duration-150 text-left cursor-pointer"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Giant Outline Brand Watermark: "FitTrack" */}
          <div className="relative w-full pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 overflow-hidden flex items-center justify-center select-none pointer-events-none">
            <span
              className="font-bold tracking-tight text-transparent leading-none select-none text-center"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.12)',
                fontSize: 'clamp(72px, 17vw, 210px)',
                letterSpacing: '-0.04em',
              }}
            >
              FitTrack
            </span>
          </div>

          {/* Bottom Copyright & Legal Bar */}
          <div className="w-full border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-[11.5px] text-white/40">
            <div>
              © 2024 FitTrack All Right reserved
            </div>

            <div className="flex items-center gap-5 sm:gap-6">
              {legalLinks.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onLinkClick?.(item)}
                  className="hover:text-white/70 transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
