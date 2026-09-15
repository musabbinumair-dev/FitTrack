import React, { useState } from 'react';
import { X, GlassWater, Coffee, Plus, Droplets, CupSoda } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HydrationLogItem {
  id: string;
  title: string;
  time: string;
  amountMls: number;
  type: 'glass' | 'bottle' | 'coffee' | 'tea' | 'custom';
}

interface HydrationTrackerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  waterMls: number;
  waterGoalMls: number;
  onUpdateWater: (amountMls: number) => void;
}

export const HydrationTrackerDrawer: React.FC<HydrationTrackerDrawerProps> = ({
  isOpen,
  onClose,
  waterMls,
  waterGoalMls,
  onUpdateWater,
}) => {
  // Local Log State initialized with realistic entries matching screenshot
  const [logs, setLogs] = useState<HydrationLogItem[]>([
    {
      id: 'log-1',
      title: 'Bottle of Water',
      time: '2:30 PM',
      amountMls: 500,
      type: 'bottle',
    },
    {
      id: 'log-2',
      title: 'Glass of Water',
      time: '12:15 PM',
      amountMls: 250,
      type: 'glass',
    },
    {
      id: 'log-3',
      title: 'Morning Coffee',
      time: '8:00 AM',
      amountMls: 300,
      type: 'coffee',
    },
  ]);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const currentLiters = (waterMls / 1000).toFixed(1);
  const goalLiters = (waterGoalMls / 1000).toFixed(1);

  // Today's intake cup calculation (10 cups = goal)
  const totalCups = 10;
  const filledCupsCount = Math.min(Math.floor((waterMls / waterGoalMls) * totalCups), totalCups);

  // Quick Add Action
  const handleQuickAdd = (title: string, amountMls: number, type: HydrationLogItem['type']) => {
    onUpdateWater(amountMls);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: HydrationLogItem = {
      id: `log-${Date.now()}`,
      title,
      time: timeString,
      amountMls,
      type,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // Custom Entry Submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (!amount || amount <= 0) return;

    const title = customTitle.trim() || 'Hydration Entry';
    handleQuickAdd(title, amount, 'custom');
    setCustomAmount('');
    setCustomTitle('');
    setShowCustomInput(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden font-['Outfit',sans-serif]">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Slide-over Panel with safe right offset and breathing space */}
          <div className="fixed inset-y-0 right-0 sm:right-3 md:right-4 max-w-full flex pl-4 sm:pl-10 my-0 sm:my-3">
            <motion.div
              initial={{ x: '100%', opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-[calc(100vw-16px)] sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between rounded-l-3xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
            >
              {/* 1. Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Hydration Tracker
                </h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  aria-label="Close hydration tracker"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Card Hero Display */}
            <div className="rounded-3xl bg-[#EBF7FC] dark:bg-[#1A3342] p-6 text-center space-y-4 border border-[#D5EEF8] dark:border-sky-900/40">
              <div>
                <div className="text-3xl font-bold text-[#008CC8] dark:text-sky-300 font-['Outfit'] tracking-tight">
                  {currentLiters}L <span className="text-lg font-normal text-slate-400 dark:text-slate-400">/ {goalLiters}L</span>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily Goal
                </div>
              </div>

              {/* Center Water Wave Graphic Illustration */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Outer Ripple Rings */}
                <div className="absolute inset-0 rounded-full bg-sky-200/40 dark:bg-sky-800/20 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-sky-300/50 dark:bg-sky-700/30" />
                
                {/* Core Circle */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#00A8E8] to-[#0077B6] flex items-center justify-center shadow-md">
                  <Droplets className="w-9 h-9 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Today's Intake Cups Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today's Intake
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  (250ml per cup)
                </span>
              </div>

              {/* 10 Cups Container (2 Rows of 5) */}
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#FAFBFB] dark:bg-slate-800/40 grid grid-cols-5 gap-3 justify-items-center">
                {Array.from({ length: totalCups }).map((_, idx) => {
                  const isFilled = idx < filledCupsCount;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center transition-all"
                    >
                      <svg
                        viewBox="0 0 24 28"
                        className={`w-6 h-7 transition-colors duration-300 ${
                          isFilled
                            ? 'text-[#008CC8] dark:text-sky-400 fill-[#008CC8] dark:fill-sky-400'
                            : 'text-slate-200 dark:text-slate-700 fill-none'
                        }`}
                      >
                        <path
                          d="M4 2 L20 2 L18 24 C18 25.5 16.5 26 15 26 L9 26 C7.5 26 6 25.5 6 24 Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Quick Add
              </h3>

              <div className="grid grid-cols-4 gap-2.5">
                {/* 1. Glass */}
                <button
                  onClick={() => handleQuickAdd('Glass of Water', 250, 'glass')}
                  className="p-3 rounded-2xl bg-[#EFF8FF] dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex flex-col items-center justify-center text-center hover:bg-sky-100/80 active:scale-95 transition-all cursor-pointer"
                >
                  <GlassWater className="w-5 h-5 text-[#008CC8] dark:text-sky-300 mb-1" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Glass</span>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400">250ml</span>
                </button>

                {/* 2. Bottle */}
                <button
                  onClick={() => handleQuickAdd('Bottle of Water', 500, 'bottle')}
                  className="p-3 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center justify-center text-center hover:bg-emerald-100/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Droplets className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Bottle</span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">500ml</span>
                </button>

                {/* 3. Coffee */}
                <button
                  onClick={() => handleQuickAdd('Morning Coffee', 300, 'coffee')}
                  className="p-3 rounded-2xl bg-[#FEFCE8] dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col items-center justify-center text-center hover:bg-amber-100/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Coffee</span>
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">300ml</span>
                </button>

                {/* 4. Tea */}
                <button
                  onClick={() => handleQuickAdd('Herbal Tea', 250, 'tea')}
                  className="p-3 rounded-2xl bg-[#FDF2F8] dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60 flex flex-col items-center justify-center text-center hover:bg-pink-100/80 active:scale-95 transition-all cursor-pointer"
                >
                  <CupSoda className="w-5 h-5 text-pink-600 dark:text-pink-400 mb-1" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Tea</span>
                  <span className="text-[10px] font-medium text-pink-600 dark:text-pink-400">250ml</span>
                </button>
              </div>
            </div>

            {/* Custom Entry Form (Toggleable) */}
            {showCustomInput && (
              <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Log Custom Hydration
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Drink Title (e.g., Coconut Water)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Amount in ml (e.g. 350)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Today's Log Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Today's Log
              </h3>

              <div className="space-y-3 relative pl-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="relative flex items-center justify-between gap-3 text-xs"
                  >
                    {/* Timeline Bullet Dot */}
                    <div className="absolute -left-3 w-2.5 h-2.5 rounded-full bg-[#008CC8] dark:bg-sky-400 ring-4 ring-white dark:ring-slate-900" />

                    <div className="pl-2">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {log.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {log.time}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-200 text-xs">
                      +{log.amountMls}ml
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Sticky Footer Button - lifted with pb-28 sm:pb-6 so mobile bottom bar never obscures Custom Entry */}
          <div className="p-6 pb-28 sm:pb-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            {!showCustomInput && (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full py-3.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-md active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Custom Entry</span>
              </button>
            )}
          </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
