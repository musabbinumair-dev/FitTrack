import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import authBgImage from '../assets/images/736f8c69c57e8174bab610b31793f5cd.jpg';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onBackToWelcome?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onBackToWelcome,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setIsSubmitting(false);
      setIsSent(true);
    } catch {
      setIsSubmitting(false);
      // Still show success for security (don't reveal if email exists)
      setIsSent(true);
    }
  };

  return (
    <div
      id="fittrack-forgot-password-screen"
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

      {/* Top Back to Login Button */}
      {(onNavigateToLogin || onBackToWelcome) && (
        <button
          id="forgot-back-to-welcome-btn"
          onClick={onNavigateToLogin || onBackToWelcome}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.14] hover:bg-white/[0.24] text-slate-900 font-medium text-xs backdrop-blur-2xl border border-white/30 transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </button>
      )}

      {/* Center Content Wrapper */}
      <div className="relative w-full max-w-[390px] z-10 flex flex-col items-center my-auto px-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          <div className="text-center mb-6">
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-[14px] text-slate-800 mt-1 font-normal leading-relaxed">
              Enter your email to receive a recovery link
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isSent ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full flex flex-col items-center text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-950 flex items-center justify-center backdrop-blur-md">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Check your email</p>
                  <p className="text-xs text-slate-800 mt-1 max-w-xs font-normal">
                    We've sent a password reset link to <span className="text-slate-950 font-medium">{email}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-xs text-slate-800 hover:text-black underline pt-2 cursor-pointer transition-colors font-medium"
                >
                  Send another link
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col">
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-950 text-xs flex items-center gap-2 backdrop-blur-md font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email Address Field with exact card glassmorphic styling */}
                <div className="w-full mb-5 text-left">
                  <label
                    htmlFor="reset-email-input"
                    className="block text-[13.5px] font-medium text-slate-900 mb-1.5 pl-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="reset-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-[52px] bg-white/[0.14] hover:bg-white/[0.22] focus:bg-white/[0.28] border border-white/30 focus:border-white/60 rounded-full px-5 text-[15px] text-slate-950 placeholder:text-slate-700/60 font-normal focus:outline-none transition-all backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/20"
                  />
                </div>

                {/* Reset Password Button */}
                <button
                  id="btn-reset-password-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] bg-slate-900 hover:bg-black active:scale-[0.985] text-white font-medium text-[15px] rounded-full shadow-lg shadow-black/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};