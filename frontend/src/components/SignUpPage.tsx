import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleIcon } from './icons/BrandIcons';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import authBgImage from '../assets/images/736f8c69c57e8174bab610b31793f5cd.jpg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';

interface SignUpPageProps {
  onSignUpSuccess: (method: 'credentials' | 'google') => void;
  onNavigateToLogin: () => void;
  onBackToWelcome?: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
  onBackToWelcome,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username: email.split('@')[0], email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      onSignUpSuccess('credentials');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google') => {
    if (provider === 'google') {
      window.location.href = `${API_BASE}/auth/google`;
    }
  };

  return (
    <div
      id="fittrack-register-screen"
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 py-8 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Raw Background Image without any overlay effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={authBgImage}
          alt="FitTrack Athletic Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Top Back Navigation */}
      {onBackToWelcome && (
        <button
          id="signup-back-to-welcome-btn"
          onClick={onBackToWelcome}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.14] hover:bg-white/[0.24] text-slate-900 font-medium text-xs backdrop-blur-2xl border border-white/30 transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </button>
      )}

      {/* Center Container */}
      <div className="relative w-full max-w-[390px] z-10 flex flex-col items-center my-auto px-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col"
        >
          {/* Headings */}
          <div className="text-center mb-6">
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-[14px] text-slate-800 mt-1 font-normal">
              Start your journey with personalized tracking
            </p>
          </div>

          <form onSubmit={handleSubmitSignUp} className="w-full flex flex-col">
            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-950 text-xs flex items-center gap-2 backdrop-blur-md font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Social Auth Error Toast */}
            {socialError && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-950 text-xs flex items-center gap-2 backdrop-blur-md font-medium animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>{socialError}</span>
              </div>
            )}

            {/* Full Name Field with exact card glassmorphic styling */}
            <div className="w-full mb-3.5">
              <label
                htmlFor="register-name-input"
                className="block text-[13.5px] font-medium text-slate-900 mb-1.5 pl-1"
              >
                Full Name
              </label>
              <input
                id="register-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.22] focus:bg-white/[0.28] border border-white/30 focus:border-white/60 rounded-full px-5 text-[15px] text-slate-950 placeholder:text-slate-700/60 font-normal focus:outline-none transition-all backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
              />
            </div>

            {/* Email Field with exact card glassmorphic styling */}
            <div className="w-full mb-3.5">
              <label
                htmlFor="register-email-input"
                className="block text-[13.5px] font-medium text-slate-900 mb-1.5 pl-1"
              >
                Email
              </label>
              <input
                id="register-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.22] focus:bg-white/[0.28] border border-white/30 focus:border-white/60 rounded-full px-5 text-[15px] text-slate-950 placeholder:text-slate-700/60 font-normal focus:outline-none transition-all backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
              />
            </div>

            {/* Password Field with exact card glassmorphic styling */}
            <div className="w-full mb-4">
              <label
                htmlFor="register-password-input"
                className="block text-[13.5px] font-medium text-slate-900 mb-1.5 pl-1"
              >
                Password
              </label>
              <input
                id="register-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.22] focus:bg-white/[0.28] border border-white/30 focus:border-white/60 rounded-full px-5 text-[15px] text-slate-950 placeholder:text-slate-700/60 font-normal focus:outline-none transition-all backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
              />
            </div>

            {/* Primary Sign Up Button */}
            <button
              id="btn-signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-slate-900 hover:bg-black active:scale-[0.985] text-white font-medium text-[15px] rounded-full shadow-lg shadow-black/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Horizontal Divider with OR */}
          <div className="w-full flex items-center gap-3 my-3">
            <div className="flex-1 border-t border-slate-900/15" />
            <span className="text-[11.5px] font-normal tracking-wider text-slate-700 uppercase select-none">
              OR
            </span>
            <div className="flex-1 border-t border-slate-900/15" />
          </div>

          {/* Social Logins Stack with exact card glassmorphic styling */}
          <div className="w-full flex flex-col gap-3">
            {/* Continue with Google Button */}
            <button
              id="signup-btn-google"
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={isLoading}
              className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.24] active:scale-[0.985] text-slate-900 font-medium text-[15px] rounded-full shadow-[0_16px_48px_rgba(0,0,0,0.2)] border border-white/30 backdrop-blur-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 ring-1 ring-inset ring-white/20"
            >
              <GoogleIcon className="text-lg w-5 h-5 flex-shrink-0" size={18} />
              <span>Continue with Google</span>
            </button>
          </div>
        </motion.div>

        {/* Bottom Switch to Log In text - Plain clean text without glassmorphic effect */}
        <div className="mt-8 text-center text-[13.5px] text-slate-800 font-normal">
          <span>Already have an account? </span>
          <button
            id="signup-switch-login-btn"
            type="button"
            onClick={onNavigateToLogin}
            className="text-slate-950 font-medium hover:underline cursor-pointer transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};