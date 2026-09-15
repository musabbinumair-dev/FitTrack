import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Plus,
  Mic,
  MicOff,
  MessageSquare,
  Dumbbell,
  ExternalLink,
  PlusCircle,
  Apple,
  Droplets,
  TrendingUp,
  Zap,
  Target,
  HeartPulse,
  Activity,
} from 'lucide-react';
import { coachApi, CoachAction } from '../services/coachApi';

export interface AiCoachUserData {
  name?: string;
  fitnessGoal?: string;
  weight?: string | number;
  targetWeight?: string | number;
  weightUnit?: string;
  calorieGoal?: number;
  currentCalories?: number;
  waterGoalMl?: number;
  currentWaterMl?: number;
  workoutsCount?: number;
}

interface AiCoachWidgetProps {
  onNavigateTab: (tabId: string) => void;
  onOpenQuickLog: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
  onQuickAddWater?: () => void;
  isDarkMode?: boolean;
  userData?: AiCoachUserData;
  onOpenChange?: (isOpen: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  actions?: CoachAction[];
}

interface CoachPersona {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  badgeColor: string;
  icon: React.ReactNode;
  welcomeGreeting: (name: string, goal: string) => string;
  suggestedPrompts: string[];
}

const COACH_PERSONAS: CoachPersona[] = [
  {
    id: 'workout',
    title: 'Workout & Strength Coach',
    subtitle: 'Routines, splits & progressive overload',
    bgColor: 'bg-[#FED4CF]',
    badgeColor: 'bg-[#FBAEA5]',
    icon: <Dumbbell className="w-5 h-5 text-neutral-900" />,
    welcomeGreeting: (name, goal) =>
      `Hey ${name}! I'm your Workout & Strength Coach. Whether you want to crush today's training, tweak your routine for ${goal || 'hypertrophy'}, or need exercise form advice, I've got your back. What are we training today?`,
    suggestedPrompts: ["Today's Workout Plan", "Quick 15-Min Workout", "Plan my weekly split"],
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Macro Coach',
    subtitle: 'Calorie targets, protein & meal ideas',
    bgColor: 'bg-[#EFFCA7]',
    badgeColor: 'bg-[#DCEB7A]',
    icon: <Apple className="w-5 h-5 text-neutral-900" />,
    welcomeGreeting: (name, goal) =>
      `Hello ${name}! I'm your Nutrition & Macro Coach. Fueling your body is key to ${goal || 'peak performance'}. Ask me about hitting your daily calories, high-protein recipes, or pre-workout fuel!`,
    suggestedPrompts: ["What should I eat today?", "High-Protein Snacks", "Calculate my daily protein"],
  },
  {
    id: 'hydration',
    title: 'Hydration & Recovery Coach',
    subtitle: 'Water intake, sleep & sore muscles',
    bgColor: 'bg-[#D2EEFF]',
    badgeColor: 'bg-[#B2E0FD]',
    icon: <Droplets className="w-5 h-5 text-neutral-900" />,
    welcomeGreeting: (name) =>
      `Hi ${name}! I'm your Hydration & Recovery Coach. Muscle growth happens when you recover. Let's make sure you hit your daily hydration target and keep DOMS and fatigue under control!`,
    suggestedPrompts: ["Quick +250ml Water", "Recovery & Soreness Tips", "How much water do I need?"],
  },
  {
    id: 'goals',
    title: 'Weight & Progress Coach',
    subtitle: 'Bodyweight goals & milestone analytics',
    bgColor: 'bg-[#EAD5FB]',
    badgeColor: 'bg-[#D6B5F9]',
    icon: <TrendingUp className="w-5 h-5 text-neutral-900" />,
    welcomeGreeting: (name, goal) =>
      `Welcome ${name}! I'm your Progress & Goal Coach. Consistency is what turns effort into results for ${goal || 'your fitness journey'}. Let's look at your numbers and celebrate your progress!`,
    suggestedPrompts: ["My Daily Progress", "Check Weight Goal", "Review Weekly Consistency"],
  },
];

interface QuickPromptItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
}

const QUICK_PROMPTS: QuickPromptItem[] = [
  {
    id: 'progress',
    label: 'My Daily Progress',
    icon: <Activity className="w-3.5 h-3.5 text-purple-600" />,
    query: 'How is my daily progress looking across calories, water, and workouts today?',
  },
  {
    id: 'water-add',
    label: 'Quick +250ml Water',
    icon: <Droplets className="w-3.5 h-3.5 text-sky-500" />,
    query: 'Add 250ml of water to my hydration log and tell me my remaining goal.',
  },
  {
    id: 'workout-plan',
    label: "Today's Workout Plan",
    icon: <Dumbbell className="w-3.5 h-3.5 text-[#FF5500]" />,
    query: "What is an optimal workout routine I can do today based on my fitness goal?",
  },
  {
    id: 'protein-snack',
    label: 'High-Protein Snacks',
    icon: <Apple className="w-3.5 h-3.5 text-emerald-600" />,
    query: 'Give me 3 quick, delicious high-protein snack ideas with at least 20g of protein.',
  },
  {
    id: 'weight-goal',
    label: 'Check Weight Goal',
    icon: <Target className="w-3.5 h-3.5 text-amber-600" />,
    query: 'Where do I stand relative to my target body weight and what is a realistic timeline?',
  },
  {
    id: 'quick-hiit',
    label: 'Quick 15-Min Workout',
    icon: <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />,
    query: 'Give me a fast 15-minute high-efficiency workout I can do right now with minimal equipment.',
  },
  {
    id: 'what-to-eat',
    label: 'What Should I Eat Today?',
    icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />,
    query: 'What should I eat today to hit my calorie and macronutrient targets?',
  },
  {
    id: 'recovery',
    label: 'Recovery & Soreness Tips',
    icon: <HeartPulse className="w-3.5 h-3.5 text-rose-500" />,
    query: 'What are the most effective ways to recover from muscle soreness and prepare for my next workout?',
  },
];

export const AiCoachWidget: React.FC<AiCoachWidgetProps> = ({
  onNavigateTab,
  onOpenQuickLog,
  onQuickAddWater,
  isDarkMode = false,
  userData,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('workout');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'chat'>('home');

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active persona object
  const currentPersona = useMemo(() => {
    return COACH_PERSONAS.find((p) => p.id === selectedPersonaId) || COACH_PERSONAS[0];
  }, [selectedPersonaId]);

  // Derived user values
  const userName = userData?.name || 'Athlete';
  const userGoal = userData?.fitnessGoal || 'Strength & Muscle Building';
  const userWeight = userData?.weight ? Number(userData.weight) : null;
  const userTargetWeight = userData?.targetWeight ? Number(userData.targetWeight) : null;
  const unit = userData?.weightUnit || 'kg';
  const calGoal = userData?.calorieGoal || 2400;
  const calCurrent = userData?.currentCalories || 0;
  const waterGoal = userData?.waterGoalMl || 3000;
  const waterCurrent = userData?.currentWaterMl || 0;
  const workoutsCount = userData?.workoutsCount ?? 0;

  // Auto-scroll messages to bottom when in chat mode
  useEffect(() => {
    if (viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  /**
   * Generates intelligent, data-aware responses directly grounded in the user's
   * current fitness metrics (calories, water, workout routine, target weight).
   */
  const generateDataGroundedReply = (query: string): { reply: string; actions?: CoachAction[] } => {
    const q = query.toLowerCase();

    // 1. Water / Hydration request or action
    if (q.includes('250ml') || q.includes('water') || q.includes('hydration') || q.includes('drink')) {
      const isLogging = q.includes('add') || q.includes('log') || q.includes('+250');
      if (isLogging && onQuickAddWater) {
        onQuickAddWater();
      }
      const newWater = isLogging ? waterCurrent + 250 : waterCurrent;
      const percent = Math.min(Math.round((newWater / waterGoal) * 100), 100);
      const remaining = Math.max(waterGoal - newWater, 0);

      return {
        reply: `💧 ${isLogging ? '+250 ml logged successfully to your daily tracker!\n\n' : ''}• Today's Water: ${newWater.toLocaleString()} ml / ${waterGoal.toLocaleString()} ml (${percent}% achieved)\n• Remaining to Goal: ${remaining.toLocaleString()} ml\n\nStaying hydrated maintains optimal joint lubrication, muscle contractile force, and energy metabolism!`,
        actions: [
          { type: 'quick-log', target: 'water', label: '+ Log Another 250ml' },
          { type: 'navigate', target: 'nutrition', label: 'View Nutrition & Hydration' },
        ],
      };
    }

    // 2. Daily progress snapshot
    if (q.includes('progress') || q.includes('daily') || q.includes('snapshot') || q.includes('how is my') || q.includes('stats')) {
      const calPercent = Math.min(Math.round((calCurrent / calGoal) * 100), 100);
      const waterPercent = Math.min(Math.round((waterCurrent / waterGoal) * 100), 100);
      const remainingCal = calGoal - calCurrent;

      return {
        reply: `📊 Here is your live FitTrack snapshot for today, ${userName}:\n\n` +
          `• Calories: ${calCurrent.toLocaleString()} / ${calGoal.toLocaleString()} kcal (${calPercent}% — ${remainingCal > 0 ? `${remainingCal.toLocaleString()} kcal remaining` : 'Goal met!'})\n` +
          `• Hydration: ${waterCurrent.toLocaleString()} / ${waterGoal.toLocaleString()} ml (${waterPercent}% completed)\n` +
          `• Workouts Completed: ${workoutsCount} session${workoutsCount === 1 ? '' : 's'}\n` +
          (userWeight ? `• Body Weight: ${userWeight} ${unit} ${userTargetWeight ? `(Target: ${userTargetWeight} ${unit})` : ''}\n` : '') +
          `• Primary Focus: ${userGoal}\n\n` +
          `What action would you like to take next?`,
        actions: [
          { type: 'quick-log', target: 'workout', label: '+ Log Workout' },
          { type: 'quick-log', target: 'meal', label: '+ Log Meal' },
          { type: 'quick-log', target: 'water', label: '+ Log 250ml Water' },
          { type: 'navigate', target: 'analytics', label: 'View Detailed Analytics' },
        ],
      };
    }

    // 3. Today's Workout plan / recommendations
    if (q.includes('workout plan') || (q.includes('workout') && (q.includes('today') || q.includes('routine') || q.includes('what')))) {
      return {
        reply: `🏋️ Here is a targeted strength routine recommended for your goal of "${userGoal}":\n\n` +
          `1. Barbell / Dumbbell Bench Press or Overhead Press: 4 sets × 8–10 reps\n` +
          `2. Bent-Over Barbell Rows / Pull-ups: 4 sets × 10–12 reps\n` +
          `3. Romanian Deadlifts or Goblet Squats: 3 sets × 10 reps\n` +
          `4. Core Plank or Hanging Knee Raises: 3 sets × 45 seconds\n\n` +
          `💡 Tip: Focus on progressive overload — log your weight and reps so we can track weekly volume!`,
        actions: [
          { type: 'quick-log', target: 'workout', label: '+ Log This Workout' },
          { type: 'navigate', target: 'workouts', label: 'Explore Workout Library' },
        ],
      };
    }

    // 4. Quick 15-Minute Workout
    if (q.includes('15-min') || q.includes('quick workout') || q.includes('hiit') || q.includes('busy')) {
      return {
        reply: `⚡ Quick 15-Minute High-Efficiency Express Circuit:\n\n` +
          `Perform each exercise for 45s, rest 15s. Complete 3 total rounds:\n` +
          `• Minute 1: Bodyweight Tempo Squats (3s down, explode up)\n` +
          `• Minute 2: Push-Ups (elevated or strict flat)\n` +
          `• Minute 3: Reverse Lunges (alternating legs)\n` +
          `• Minute 4: Mountain Climbers or Jumping Jacks\n` +
          `• Minute 5: Rest 60 seconds, then repeat!\n\n` +
          `Ready to start? Log it when you finish!`,
        actions: [
          { type: 'quick-log', target: 'workout', label: '+ Log 15-Min Session' },
          { type: 'navigate', target: 'workouts', label: 'Open Workouts' },
        ],
      };
    }

    // 5. High-Protein Snacks / Meal Ideas
    if (q.includes('snack') || q.includes('high-protein') || q.includes('protein idea')) {
      return {
        reply: `🥑 Here are 3 quick high-protein snacks (20g+ protein) to keep your metabolism elevated and support muscle synthesis:\n\n` +
          `1. Greek Yogurt Parfait (22g protein): 200g 0% Greek yogurt, 1 tbsp chia seeds, mixed berries, dash of honey.\n` +
          `2. Savory Cottage Cheese Toast (24g protein): 1 cup low-fat cottage cheese on sprouted whole grain bread with sliced cucumber & everything seasoning.\n` +
          `3. Power Shake (30g protein): 1 scoop whey/plant protein, 1 cup almond milk, 1/2 frozen banana, 1 tbsp peanut butter.`,
        actions: [
          { type: 'quick-log', target: 'meal', label: '+ Log a Meal' },
          { type: 'navigate', target: 'nutrition', label: 'Go to Nutrition Tracker' },
        ],
      };
    }

    // 6. What should I eat today?
    if (q.includes('what should i eat') || q.includes('eat today') || q.includes('meal plan') || q.includes('diet')) {
      const remainingCal = Math.max(calGoal - calCurrent, 0);
      return {
        reply: `🥗 Based on your ${calGoal.toLocaleString()} kcal target and ${calCurrent.toLocaleString()} kcal logged so far, you have approximately ${remainingCal.toLocaleString()} kcal remaining today.\n\n` +
          `Recommended Macro Structure for ${userGoal}:\n` +
          `• Protein: 30–35% (aim for ~${userWeight ? Math.round(userWeight * 2) : '150'}g daily)\n` +
          `• Complex Carbohydrates: 40–45% (brown rice, sweet potato, oats, fruits)\n` +
          `• Healthy Fats: 25–30% (olive oil, avocados, nuts)\n\n` +
          `Keep meals spaced 3-4 hours apart for continuous amino acid delivery!`,
        actions: [
          { type: 'quick-log', target: 'meal', label: '+ Log Meal Entry' },
          { type: 'navigate', target: 'nutrition', label: 'Open Nutrition Page' },
        ],
      };
    }

    // 7. Check weight goal
    if (q.includes('weight') || q.includes('goal') || q.includes('target weight') || q.includes('timeline')) {
      if (userWeight && userTargetWeight) {
        const diff = Math.abs(userWeight - userTargetWeight);
        const direction = userTargetWeight < userWeight ? 'loss' : 'gain';
        const weeksEstimate = Math.ceil(diff / 0.5); // 0.5kg / week healthy pace

        return {
          reply: `🎯 Weight Goal Status for ${userName}:\n\n` +
            `• Current Weight: ${userWeight} ${unit}\n` +
            `• Target Goal: ${userTargetWeight} ${unit}\n` +
            `• Difference to Goal: ${diff.toFixed(1)} ${unit} of steady weight ${direction}\n` +
            `• Estimated Pace: At a safe and sustainable rate of ~0.5 ${unit}/week, you can reach this target in approximately ${weeksEstimate} weeks.\n\n` +
            `Remember that day-to-day weight fluctuates with water retention and sodium. Trend lines over weeks are what matter!`,
          actions: [
            { type: 'quick-log', target: 'weight', label: '+ Log Current Weight' },
            { type: 'navigate', target: 'analytics', label: 'View Weight Trends' },
          ],
        };
      } else {
        return {
          reply: `🎯 You haven't set both your current and target weight yet! Log your current weight to unlock accurate trajectory forecasting and personalized calorie burn estimates.`,
          actions: [
            { type: 'quick-log', target: 'weight', label: '+ Log Weight Now' },
            { type: 'navigate', target: 'profile', label: 'Update Profile Goals' },
          ],
        };
      }
    }

    // 8. Recovery & Soreness
    if (q.includes('recovery') || q.includes('sore') || q.includes('doms') || q.includes('sleep') || q.includes('stretch')) {
      return {
        reply: `💤 Actionable Protocol for Muscle Recovery & Soreness (DOMS):\n\n` +
          `1. Active Recovery: A 20-minute brisk walk or light cycling increases blood flow and flushes metabolic waste without stressing joints.\n` +
          `2. Hydration & Electrolytes: Dehydrated muscles remain tight longer. Ensure you've hit your ${waterGoal.toLocaleString()} ml water goal today.\n` +
          `3. Sleep Quality: Over 80% of human growth hormone (HGH) is secreted during deep sleep. Aim for 7.5–9 hours tonight.\n` +
          `4. Protein Timing: Consume 25-30g of slow-digesting protein (like casein or greek yogurt) before sleep to support overnight muscle repair.`,
        actions: [
          { type: 'quick-log', target: 'water', label: '+ Quick Add Water' },
          { type: 'navigate', target: 'workouts', label: 'View Mobility Routines' },
        ],
      };
    }

    // General fallback
    return {
      reply: `I'm your FitTrack ${currentPersona.title}! I'm connected to your real fitness data (Calories: ${calCurrent}/${calGoal} kcal, Water: ${waterCurrent}/${waterGoal} ml, Workouts: ${workoutsCount}).\n\nHow can I support your training, nutrition, or recovery right now?`,
      actions: [
        { type: 'navigate', target: 'workouts', label: 'Workouts Page' },
        { type: 'navigate', target: 'nutrition', label: 'Nutrition & Macros' },
        { type: 'navigate', target: 'analytics', label: 'Progress Analytics' },
      ],
    };
  };

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
    setViewMode('chat');
    setIsLoading(true);
    setShowPlusMenu(false);

    try {
      // First attempt backend call; if it succeeds, use it
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
      // Offline/preview environment fallback: generate dynamic data-grounded response
      const fallback = generateDataGroundedReply(query);
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: fallback.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actions: fallback.actions,
      };
      setMessages((prev) => [...prev, coachMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: CoachAction) => {
    if (action.type === 'navigate') {
      onNavigateTab(action.target);
    } else if (action.type === 'quick-log') {
      if (action.target === 'water') {
        if (onQuickAddWater) onQuickAddWater();
        // Give immediate coach confirmation
        const ackMessage: ChatMessage = {
          id: `coach-ack-${Date.now()}`,
          sender: 'coach',
          text: `💧 Added 250ml water to your tracker! You're now at ${(waterCurrent + 250).toLocaleString()} ml / ${waterGoal.toLocaleString()} ml.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'quick-log', target: 'water', label: '+250ml More' },
            { type: 'navigate', target: 'nutrition', label: 'View Nutrition Log' },
          ],
        };
        setMessages((prev) => [...prev, ackMessage]);
      } else {
        onOpenQuickLog(action.target as any);
      }
    }
  };

  /**
   * "NEW CHAT" Button Handler:
   * Clears old messages, starts a fresh conversation with the selected coach persona,
   * generates a personalized greeting with quick recommendation pills, and opens chat view.
   */
  const handleNewChat = () => {
    const greetingText = currentPersona.welcomeGreeting(userName, userGoal);
    const welcomeMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'coach',
      text: greetingText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actions: currentPersona.suggestedPrompts.map((p) => ({
        type: 'quick-log',
        target: p.toLowerCase().includes('water') ? 'water' : 'workout',
        label: p,
      })),
    };

    setMessages([welcomeMsg]);
    setViewMode('chat');
    setInputValue('');
    setShowPlusMenu(false);
  };

  /**
   * Coach Persona Selection:
   * Switches persona and starts an instant tailored session.
   */
  const handlePersonaClick = (persona: CoachPersona) => {
    setSelectedPersonaId(persona.id);
    const greetingText = persona.welcomeGreeting(userName, userGoal);
    const initialMsg: ChatMessage = {
      id: `coach-init-${Date.now()}`,
      sender: 'coach',
      text: greetingText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actions: persona.suggestedPrompts.map((prompt) => ({
        type: prompt.toLowerCase().includes('water') ? 'quick-log' : 'navigate',
        target: prompt.toLowerCase().includes('water') ? 'water' : 'workouts',
        label: prompt,
      })),
    };
    setMessages([initialMsg]);
    setViewMode('chat');
  };

  // Voice recording toggle via Web Speech API
  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setInputValue('How should I structure my weekly workouts?');
      inputRef.current?.focus();
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isListening) {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsListening(false);
        recognition.stop();
      }
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING LAUNCHER BUTTON (Bottom-Right, Clean & No Blinking Dots)       */}
      {/* ========================================================================= */}
      {!isOpen && (
        <div
          id="ai-coach-launcher-container"
          className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg text-xs font-semibold text-neutral-800 dark:text-neutral-100 cursor-pointer hover:border-black dark:hover:border-white transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-900 dark:text-white fill-current" />
            <span>Ask Your AI Coach</span>
          </motion.div>

          <button
            id="btn-open-ai-coach"
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-black dark:text-white transition-all duration-200 active:scale-95 group focus:outline-none"
            title="Ask Your AI Coach"
            aria-label="FitTrack AI Coach"
          >
            <Sparkles className="w-6 h-6 text-neutral-900 dark:text-white fill-neutral-900 dark:fill-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHATBOT WINDOW (POPUP ON DESKTOP, NATIVE FULL PAGE ON MOBILE)          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-coach-chat-window"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-0 w-full h-full sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[660px] sm:max-h-[88vh] rounded-none sm:rounded-[38px] border-0 sm:border shadow-none sm:shadow-[0_24px_64px_rgba(0,0,0,0.28)] z-50 flex flex-col overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] ${
              isDarkMode
                ? 'bg-[#141519] sm:border-neutral-800 text-white'
                : 'bg-[#F8F9FA] sm:border-neutral-200/90 text-neutral-900'
            }`}
          >
            {/* Top Bar: Back button (if in chat) + Cross icon strictly on Top Right */}
            <div className="flex items-center justify-between px-5 pt-4 sm:pt-5 pb-1">
              {viewMode === 'chat' ? (
                <button
                  type="button"
                  onClick={() => setViewMode('home')}
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAECEF] dark:bg-neutral-800 transition-colors cursor-pointer"
                  title="Back to Prompts"
                >
                  <span>← Coaches &amp; Prompts</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    FitTrack AI
                  </span>
                </div>
              )}

              {/* Close Button strictly Top-Right */}
              <button
                id="btn-close-ai-coach-popup"
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-[#EAECEF] dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center transition-transform active:scale-95 hover:bg-[#dfe2e6] dark:hover:bg-neutral-700 cursor-pointer shadow-2xs shrink-0"
                title="Close AI Coach"
                aria-label="Close AI Coach"
              >
                <X className="w-5 h-5 text-neutral-900 dark:text-white stroke-[2.2]" />
              </button>
            </div>

            {/* Main Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-5 no-scrollbar">
              {/* Heading Section: "Ask Your AI Coach" + Sparkle Circle + Dashed "NEW CHAT" Pill */}
              <div className="flex items-end justify-between gap-2 pt-1">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.08]">
                    Ask Your AI<br />Coach
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 pb-0.5 shrink-0">
                  {/* Lime Sparkle Circle Badge */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 fill-neutral-900" />
                  </div>

                  {/* Working NEW CHAT Pill */}
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="border border-dashed border-neutral-900 dark:border-neutral-400 rounded-full py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-2xs group"
                    title="Start a fresh conversation with your coach"
                  >
                    <div className="w-5 h-5 rounded-md bg-[#F9C3C8] text-neutral-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-3 h-3 fill-neutral-900 text-neutral-900" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-neutral-900 dark:text-white uppercase">
                      NEW CHAT
                    </span>
                  </button>
                </div>
              </div>

              {/* VIEW MODE: HOME (Fitness Coaches Carousel & Working Daily Prompts) */}
              {viewMode === 'home' ? (
                <>
                  {/* Specialized Fitness Coaches Cards Carousel */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Select a Fitness Specialist
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        4 Coaches
                      </span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
                      {COACH_PERSONAS.map((coach) => {
                        const isSelected = selectedPersonaId === coach.id;
                        return (
                          <div
                            key={coach.id}
                            onClick={() => handlePersonaClick(coach)}
                            className={`${coach.bgColor} w-[156px] h-[190px] rounded-[28px] p-4 flex flex-col justify-between shrink-0 cursor-pointer shadow-2xs hover:shadow-md transition-all active:scale-96 border border-black/5 select-none relative group`}
                          >
                            {/* Top-left Badge Icon */}
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-10 h-10 rounded-full ${coach.badgeColor} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                                {coach.icon}
                              </div>
                              {isSelected && (
                                <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Active
                                </span>
                              )}
                            </div>

                            {/* Bottom Card Titles */}
                            <div>
                              <div className="text-sm font-extrabold text-neutral-900 leading-tight">
                                {coach.title}
                              </div>
                              <div className="text-[10px] text-neutral-700/80 font-medium line-clamp-2 mt-1 leading-snug">
                                {coach.subtitle}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trending Daily Prompts Section */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        Trending Prompt
                      </h3>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Tap for instant action
                      </span>
                    </div>

                    {/* Chips wrapping with clean spacing */}
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            if (chip.id === 'water-add' && onQuickAddWater) {
                              onQuickAddWater();
                            }
                            handleSendMessage(chip.query);
                          }}
                          className="px-3.5 py-2.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="shrink-0">{chip.icon}</span>
                          <span className="whitespace-nowrap">{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* VIEW MODE: ACTIVE CONVERSATION */
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${currentPersona.badgeColor}`} />
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        {currentPersona.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {messages.length} messages
                    </span>
                  </div>

                  {/* Messages list */}
                  <div className="space-y-3.5">
                    {messages.map((msg) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[88%] rounded-[22px] px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-line ${
                              isUser
                                ? 'bg-black text-white font-medium rounded-br-xs'
                                : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-bl-xs'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {/* Action Buttons if returned by coach */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                              {msg.actions.map((act, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    if (act.label === "Today's Workout Plan" || act.label === "Quick 15-Min Workout" || act.label === "Plan my weekly split" || act.label === "What should I eat today?" || act.label === "High-Protein Snacks" || act.label === "My Daily Progress" || act.label === "Check Weight Goal") {
                                      handleSendMessage(act.label);
                                    } else {
                                      handleActionClick(act);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-[#EFFCA7] hover:text-black hover:border-black text-[11px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                                >
                                  {act.type === 'quick-log' ? (
                                    <PlusCircle className="w-3.5 h-3.5 text-[#FF5500]" />
                                  ) : (
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                                  )}
                                  <span>{act.label}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          <span className="text-[10px] text-neutral-400 mt-1 px-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      );
                    })}

                    {/* Thinking indicator without ping/blinking dots */}
                    {isLoading && (
                      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-[20px] bg-white dark:bg-neutral-800 w-fit border border-neutral-200 dark:border-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-300" />
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-300" />
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-300" />
                        <span className="text-[11px] text-neutral-500 font-medium ml-1">Coach is analyzing your stats...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Popup (opened via '+' inside the black pill) */}
            {showPlusMenu && (
              <div className="mx-5 mb-2 p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  <span>Quick Fitness Shortcuts</span>
                  <button onClick={() => setShowPlusMenu(false)} className="text-neutral-400 hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenQuickLog('workout');
                      setShowPlusMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/70 hover:bg-[#EFFCA7] hover:text-black transition-colors flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Dumbbell className="w-4 h-4 text-[#FF5500]" />
                    <span>Log Workout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenQuickLog('meal');
                      setShowPlusMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/70 hover:bg-[#EFFCA7] hover:text-black transition-colors flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Apple className="w-4 h-4 text-emerald-500" />
                    <span>Log Meal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onQuickAddWater) onQuickAddWater();
                      setShowPlusMenu(false);
                      handleSendMessage('Add 250ml of water to my hydration log and tell me my remaining goal.');
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/70 hover:bg-[#EFFCA7] hover:text-black transition-colors flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span>+250ml Water</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenQuickLog('weight');
                      setShowPlusMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/70 hover:bg-[#EFFCA7] hover:text-black transition-colors flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-amber-500" />
                    <span>Log Weight</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('workouts');
                      setShowPlusMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/70 hover:bg-[#EFFCA7] hover:text-black transition-colors flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Dumbbell className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    <span>Go to Workouts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('analytics');
                      setShowPlusMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/70 hover:bg-[#EFFCA7] hover:text-black transition-colors flex items-center gap-2 text-left cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Bar: Black Capsule Pill Input with '+' & Mic Button */}
            <div className="p-4 pt-2 pb-6 sm:pb-5 flex items-center gap-2.5 bg-transparent">
              {/* Black Capsule Pill Input */}
              <div className="bg-black text-white h-13 sm:h-14 rounded-full px-2 flex items-center flex-1 shadow-md">
                {/* White Circle Button with Plus '+' Icon */}
                <button
                  type="button"
                  onClick={() => setShowPlusMenu((prev) => !prev)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 shadow-xs"
                  title="Fitness Actions & Shortcuts"
                >
                  <Plus className="w-5 h-5 text-black stroke-[2.8]" />
                </button>

                {/* Input Text Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center flex-1 px-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask ${currentPersona.title}...`}
                    className="w-full bg-transparent text-white placeholder:text-neutral-400 text-xs sm:text-sm font-medium focus:outline-none"
                  />
                </form>

                {/* Send button when input has text */}
                {inputValue.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="w-8 h-8 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center mr-1 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    title="Send"
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>

              {/* White Circle Microphone Button */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-neutral-900 dark:text-white" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
