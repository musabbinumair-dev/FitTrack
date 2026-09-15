import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleIcon } from './icons/BrandIcons';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import authBgImage from '../assets/images/736f8c69c57e8174bab610b31793f5cd.jpg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';

interface LoginPageProps {
  onLoginSuccess: (method: 'credentials' | 'google') => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword?: () => void;
  onBackToWelcome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onBackToWelcome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setErrorMessage(decodeURIComponent(err));
    }
  }, []);

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || 'Invalid credentials');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      onLoginSuccess('credentials');
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSent(false);
        setForgotEmail('');
      }, 2000);
    } catch {
      setForgotSent(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSent(false);
        setForgotEmail('');
      }, 2000);
    }
  };

  return (
    <div
      id="fittrack-login-screen"
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
          id="login-back-to-welcome-btn"
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
              Welcome Back
            </h1>
            <p className="text-[14px] text-slate-800 mt-1 font-normal">
              Log in to continue your fitness journey
            </p>
          </div>

          <form onSubmit={handleSubmitLogin} className="w-full flex flex-col">
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

            {/* Email Field with exact card glassmorphic styling */}
            <div className="w-full mb-3.5">
              <label
                htmlFor="login-email-input"
                className="block text-[13.5px] font-medium text-slate-900 mb-1.5 pl-1"
              >
                Email
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.22] focus:bg-white/[0.28] border border-white/30 focus:border-white/60 rounded-full px-5 text-[15px] text-slate-950 placeholder:text-slate-700/60 font-normal focus:outline-none transition-all backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
              />
            </div>

            {/* Password Field with exact card glassmorphic styling */}
            <div className="w-full mb-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-[13.5px] font-medium text-slate-900 mb-1.5 pl-1"
              >
                Password
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.22] focus:bg-white/[0.28] border border-white/30 focus:border-white/60 rounded-full px-5 text-[15px] text-slate-950 placeholder:text-slate-700/60 font-normal focus:outline-none transition-all backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
              />
            </div>

            {/* Forgot Password Link - Clean text */}
            <div className="w-full flex justify-end mb-4">
              <button
                type="button"
                id="forgot-password-link"
                onClick={() => {
                  if (onNavigateToForgotPassword) {
                    onNavigateToForgotPassword();
                  } else {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }
                }}
                className="text-[13px] text-slate-800 hover:text-black font-medium transition-colors cursor-pointer hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Log In Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-slate-900 hover:bg-black active:scale-[0.985] text-white font-medium text-[15px] rounded-full shadow-lg shadow-black/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Log In'
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
              id="login-btn-google"
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

        {/* Bottom Switch to Sign Up text - Plain clean text without glassmorphic effect */}
        <div className="mt-8 text-center text-[13.5px] text-slate-800 font-normal">
          <span>Don't have an account? </span>
          <button
            id="login-switch-signup-btn"
            type="button"
            onClick={onNavigateToSignUp}
            className="text-slate-950 font-medium hover:underline cursor-pointer transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 relative"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Reset Password</h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {forgotSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>Password reset instructions sent to {forgotEmail}!</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="alex.morgan@example.com"
                      className="w-full bg-slate-100 text-slate-900 rounded-full px-4 py-3 text-sm border border-slate-200 focus:border-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-11 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-all cursor-pointer shadow-md shadow-slate-900/20"
                    >
                      Send Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};