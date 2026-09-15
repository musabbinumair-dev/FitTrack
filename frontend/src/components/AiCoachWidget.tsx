import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ExternalLink,
  PlusCircle,
  Dumbbell,
  Apple,
  Droplets,
  TrendingUp,
  Settings,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { coachApi, CoachAction } from '../services/coachApi';

interface AiCoachWidgetProps {
  onNavigateTab: (tabId: string) => void;
  onOpenQuickLog: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
  onQuickAddWater?: () => void;
  isDarkMode?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  actions?: CoachAction[];
}

const QUICK_PROMPT_CHIPS = [
  { label: "🏋️ Today's Workout", query: "What workout routine should I do today?" },
  { label: '🥗 How to log meals?', query: "How do I log a meal and track protein?" },
  { label: '💧 Water Target', query: "How much water should I drink today?" },
  { label: '📈 Check Progress', query: "Where can I see my workout progress and charts?" },
  { label: '🎯 Adjust Goals', query: "Where do I update my calorie and target weight goals?" },
];

export const AiCoachWidget: React.FC<AiCoachWidgetProps> = ({
  onNavigateTab,
  onOpenQuickLog,
  onQuickAddWater,
  isDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadGreeting, setHasUnreadGreeting] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting-1',
      sender: 'coach',
      text: "Hey Athlete! 👋 I'm your dedicated FitTrack AI Coach.\n\nI can guide you on workouts, nutrition targets, hydration, and direct you straight to any section of the platform. How can I help with your training today?",
      timestamp: 'Just now',
      actions: [
        { type: 'navigate', target: 'workouts', label: 'Go to Workouts →' },
        { type: 'quick-log', target: 'workout', label: '+ Log Workout' },
        { type: 'navigate', target: 'nutrition', label: 'Nutrition Tracker →' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on drawer open
  useEffect(() => {
    if (isOpen) {
      setHasUnreadGreeting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await coachApi.sendMessage(query);
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actions: res.actions,
      };
      setMessages((prev) => [...prev, coachMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-err-${Date.now()}`,
          sender: 'coach',
          text: "I'm having a little trouble connecting right now, but you can always navigate directly to your Workouts, Nutrition, or Analytics tabs!",
          timestamp: 'Just now',
          actions: [
            { type: 'navigate', target: 'workouts', label: 'Go to Workouts' },
            { type: 'navigate', target: 'nutrition', label: 'Go to Nutrition' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: CoachAction) => {
    if (action.type === 'navigate') {
      onNavigateTab(action.target);
    } else if (action.type === 'quick-log') {
      if (action.target === 'water' && onQuickAddWater) {
        onQuickAddWater();
      } else {
        onOpenQuickLog(action.target as any);
      }
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'coach',
        text: "Conversation cleared! How can I assist with your workouts, diet, or app guidance today?",
        timestamp: 'Just now',
        actions: [
          { type: 'navigate', target: 'workouts', label: 'Explore Workouts' },
          { type: 'quick-log', target: 'workout', label: '+ Log Workout' },
        ],
      },
    ]);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING BOTTOM RIGHT AI COACH LAUNCHER BUTTON */}
      {/* ========================================================================= */}
      <div
        id="ai-coach-launcher-container"
        className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 select-none"
      >
        {/* Optional Proactive Speech Callout Bubble when closed */}
        {!isOpen && hasUnreadGreeting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer hover:border-[#C4FA2A] transition-all group"
          >
            <span className="w-2 h-2 rounded-full bg-[#C4FA2A] animate-ping" />
            <span>Need advice or guidance? Ask Coach!</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>
        )}

        {/* Circular Trigger Button */}
        <button
          id="btn-open-ai-coach"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_28px_rgba(0,0,0,0.25)] border transition-all duration-200 active:scale-95 group focus:outline-none ${
            isOpen
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200 rotate-90'
              : 'bg-[#121318] hover:bg-[#181920] text-white border-white/15 hover:border-[#C4FA2A]/60'
          }`}
          title={isOpen ? 'Close AI Coach' : 'Chat with FitTrack AI Coach'}
          aria-label="FitTrack AI Coach"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <>
              {/* Pulsing Active Ring */}
              <div className="absolute inset-0 rounded-full border border-[#C4FA2A]/30 group-hover:border-[#C4FA2A]/80 transition-colors animate-pulse" />
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#C4FA2A] stroke-[2.3] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C4FA2A] border-2 border-[#121318]" />
              </div>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT DRAWER / POPUP WINDOW */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-coach-chat-window"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-36 md:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[410px] h-[550px] max-h-[82vh] rounded-[28px] border shadow-[0_24px_60px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] ${
              isDarkMode
                ? 'bg-[#111317]/95 border-slate-800 text-white backdrop-blur-2xl'
                : 'bg-white/95 border-slate-200/90 text-slate-900 backdrop-blur-2xl'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#131418] text-[#C4FA2A] flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5 text-[#C4FA2A]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                      FitTrack AI Coach
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#C4FA2A]/20 text-[#131418] dark:text-[#C4FA2A] text-[10px] font-bold">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Personal Trainer & Guide
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 border-b border-slate-100/90 dark:border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 bg-slate-50/40 dark:bg-black/20 shrink-0">
              {QUICK_PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#C4FA2A] hover:bg-[#C4FA2A]/10 transition-colors cursor-pointer shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs whitespace-pre-line ${
                        isUser
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-br-xs font-medium'
                          : 'bg-slate-100/90 dark:bg-[#1C1E26] text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-800/80'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Interactive Action Deep-Link Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#C4FA2A] text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white text-[11px] font-bold shadow-2xs hover:bg-[#C4FA2A]/15 active:scale-95 transition-all cursor-pointer"
                          >
                            {act.type === 'quick-log' ? (
                              <PlusCircle className="w-3 h-3 text-[#C4FA2A]" />
                            ) : (
                              <ExternalLink className="w-3 h-3 text-[#C4FA2A]" />
                            )}
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-[#1C1E26] w-fit border border-slate-200/60 dark:border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4FA2A] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4FA2A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4FA2A] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Coach is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-black/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask coach (e.g., 'How to log bench press?')..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4FA2A] shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-slate-900 dark:bg-[#C4FA2A] hover:bg-black text-white dark:text-slate-950 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 shadow-xs"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[9.5px] text-center text-slate-400 dark:text-slate-500 mt-1.5">
                FitTrack Coach specializes in workouts, nutrition & app navigation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
