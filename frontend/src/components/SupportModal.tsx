import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Bug,
  Lightbulb,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  LifeBuoy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supportApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  defaultCategory?: 'bug' | 'feedback' | 'contact' | 'other';
}

interface SupportTicket {
  _id: string;
  subject: string;
  message: string;
  category: 'bug' | 'feedback' | 'contact' | 'other';
  status?: string;
  createdAt: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = false,
  defaultCategory = 'feedback',
}) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<'bug' | 'feedback' | 'contact' | 'other'>(defaultCategory);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeView, setActiveView] = useState<'form' | 'tickets'>('form');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      setStatusMessage(null);
      if (activeView === 'tickets') {
        loadTickets();
      }
    }
  }, [isOpen, defaultCategory, activeView]);

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await supportApi.getMyTickets();
      if (res && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err: any) {
      console.error('Failed to load support tickets', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both a subject and a message.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await supportApi.createTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
      });

      setStatusMessage({
        type: 'success',
        text: res.message || 'Your support ticket has been submitted. Our team will review it shortly!',
      });
      setSubject('');
      setMessage('');
      // Reload tickets if in background
      loadTickets();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to submit support request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    {
      id: 'feedback' as const,
      label: 'Provide Feedback',
      icon: Lightbulb,
      desc: 'Suggest improvements or new features',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    },
    {
      id: 'bug' as const,
      label: 'Report a Bug',
      icon: Bug,
      desc: 'Report unexpected behavior or glitches',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    },
    {
      id: 'contact' as const,
      label: 'Contact Support',
      icon: Mail,
      desc: 'Questions about account, units, or setup',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-['Outfit',sans-serif]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white font-['Outfit']">
                  Support & Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contact our support team, report issues, or suggest features
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* View Switcher Tabs */}
          <div className="px-6 sm:px-7 pt-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeView === 'form'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('tickets');
                loadTickets();
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'tickets'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>My Requests ({tickets.length})</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7 max-h-[70vh] overflow-y-auto space-y-5">
            {statusMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {activeView === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection Pills */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2 font-['Outfit']">
                    Select Request Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-slate-950 dark:border-white bg-slate-50 dark:bg-slate-800/90 ring-1 ring-slate-950 dark:ring-white'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`p-1.5 rounded-xl ${cat.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {cat.label}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {cat.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5 font-['Outfit']">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={
                      category === 'bug'
                        ? 'e.g. Issue logging water intake on mobile'
                        : category === 'feedback'
                        ? 'e.g. Suggestion for custom workout rest timer'
                        : 'e.g. Question regarding unit conversion'
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5 font-['Outfit']">
                    Detailed Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide as much detail as possible so our support team can assist you quickly..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all resize-none"
                  />
                </div>

                {/* User email badge */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-[11px]">Submitting as:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {user?.email || 'Logged In Athlete'}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </form>
            ) : (
              /* MY REQUESTS HISTORY VIEW */
              <div className="space-y-3">
                {isLoadingTickets ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading your tickets...</div>
                ) : tickets.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No support tickets yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Any reports or feedback you submit will be tracked here.
                    </p>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t._id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.category === 'bug'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : t.category === 'feedback'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {t.category}
                        </span>
                        <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(t.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {t.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
