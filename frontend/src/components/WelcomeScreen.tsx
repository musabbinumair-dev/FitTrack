import React from 'react';
import { HeroLandingSection } from './HeroLandingSection';
import { ScrollTransitionSection } from './ScrollTransitionSection';
import { FindSessionSection } from './FindSessionSection';
import { RealStoriesSection } from './RealStoriesSection';
import { FaqSection } from './FaqSection';
import { FooterCtaSection } from './FooterCtaSection';

interface WelcomeScreenProps {
  onContinue: (method: 'apple' | 'google' | 'email' | 'guest') => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignUp?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
  onNavigateToLogin,
  onNavigateToSignUp,
}) => {
  const handleAuthAction = () => {
    if (onNavigateToSignUp) {
      onNavigateToSignUp();
    } else {
      onContinue('guest');
    }
  };

  const handleLoginAction = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      onContinue('guest');
    }
  };

  const handleNavClick = (item: string) => {
    if ((item === 'Pricing' || item === 'Sign Up') && onNavigateToSignUp) {
      onNavigateToSignUp();
    } else if ((item === 'Login' || item === 'Sign In') && onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      // Smooth scroll to sections if available or trigger signup
      const sectionMap: Record<string, string> = {
        'Programs': 'find-session-section',
        'Features': 'scroll-transition-section',
        'Community': 'real-stories-section',
      };
      const targetId = sectionMap[item];
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      handleAuthAction();
    }
  };

  return (
    <div id="fittrack-landing-page" className="w-full bg-white flex flex-col min-h-screen selection:bg-[#B4FA16] selection:text-[#111215]">
      {/* 1. Hero Section (with full cloud atmosphere, auth navigation, & 3 feature cards) */}
      <HeroLandingSection
        onGetStarted={handleAuthAction}
        onTryNow={handleAuthAction}
        onSignUp={handleAuthAction}
        onLogin={handleLoginAction}
        onContactUs={handleLoginAction}
        onNavClick={handleNavClick}
      />

      {/* 2. Scroll-Triggered Transition Section (Inline photo narrative + "Smarter Training, Stronger Results" cards) */}
      <ScrollTransitionSection
        onGetStarted={handleAuthAction}
        onTryNow={handleAuthAction}
        onContactUs={handleLoginAction}
        onNavClick={handleNavClick}
      />

      {/* 3. "Find the Session That Fits Your Day" section with workout studio background, glass nav, 5 session indicator cards */}
      <FindSessionSection
        onGetStarted={handleAuthAction}
        onNavClick={handleNavClick}
      />

      {/* 4. "Real Stories. Real Progress." section with member story cards and carousel controls */}
      <RealStoriesSection />

      {/* 5. "Have Questions? We Got You." FAQ section */}
      <FaqSection />

      {/* 6. "Start Today, Feel the Difference." CTA and FitTrack Glassmorphic Footer */}
      <FooterCtaSection
        onGetStarted={handleAuthAction}
        onJoinNow={handleAuthAction}
        onLinkClick={(link) => {
          if (link === 'Contact Us' || link === 'Help Support' || link === 'Newsletter') {
            handleLoginAction();
          } else {
            handleAuthAction();
          }
        }}
      />
    </div>
  );
};