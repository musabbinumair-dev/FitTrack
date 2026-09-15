import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'strict-schedule',
    question: 'Do I need a strict schedule to follow the program?',
    answer:
      "Not at all. The routines are designed to flex around your real life, not force you into a rigid timetable. You can jump in whenever you have a pocket of time morning, lunch break, or late at night and each session still helps you stay on track. The goal isn't perfection; it's steady progress that actually fits your daily rhythm.",
  },
  {
    id: 'small-space',
    question: 'Can I do these workouts in a small space?',
    answer:
      'Yes! Every routine is engineered to be performed in a compact area—roughly the size of a standard yoga mat. You never need a full gym or a large clearing to get the full benefit.',
  },
  {
    id: 'miss-a-day',
    question: 'What if I miss a day?',
    answer:
      'Life happens, and guilt has no place in sustainable fitness. If you miss a session, simply pick up where you left off or do a quick 5-minute recovery stretch to keep your streak and momentum going.',
  },
  {
    id: 'workout-length',
    question: 'How long is each workout?',
    answer:
      'Sessions range between 10 to 30 minutes. You can easily pick the duration that matches your availability for the day while maintaining maximum metabolic and strength benefits.',
  },
  {
    id: 'beginner-friendly',
    question: 'Are the sessions beginner-friendly?',
    answer:
      'Absolutely. Every single exercise offers clear low-impact modifications and form instructions, making it welcoming and safe whether you are brand new or returning after a break.',
  },
  {
    id: 'calorie-tracking',
    question: 'Can I track my calorie burn accurately?',
    answer:
      'Yes! Our session dashboard calculates estimated calorie expenditure based on tempo, movement type, and heart-rate intensity bands, giving you clear and realistic feedback.',
  },
  {
    id: 'no-equipment',
    question: "What if I don't have equipment?",
    answer:
      'Zero equipment required! Most of our core library utilizes functional bodyweight movements, and any session with dumbbells always includes a zero-equipment variation.',
  },
];

export const FaqSection: React.FC = () => {
  // First item open by default matching reference image
  const [openId, setOpenId] = useState<string | null>('strict-schedule');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative w-full bg-white text-[#111215] py-20 sm:py-24 md:py-28 select-none"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* ========================================================================= */}
        {/* Section Heading: "Have Questions? We Got You." */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl md:text-[54px] lg:text-[60px] font-bold text-[#111215] tracking-[-0.035em] leading-[1.12]">
            Have Questions?
            <br />
            We Got You.
          </h2>
          <p className="mt-4 text-xs sm:text-[14px] md:text-[14.5px] text-[#52525B] max-w-lg mx-auto font-normal leading-relaxed">
            Clear, straightforward answers to help you start strong and keep
            your progress moving forward every single day.
          </p>
        </motion.div>

        {/* ========================================================================= */}
        {/* FAQ Accordion List */}
        {/* ========================================================================= */}
        <div className="w-full max-w-[620px] mx-auto mt-12 sm:mt-14 space-y-3 sm:space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-[22px] sm:rounded-[24px] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-gray-100 shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
                    : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center justify-between text-left p-5 sm:px-6 transition-colors ${
                    isOpen ? 'pb-2 sm:pb-2.5' : 'py-4.5 sm:py-5'
                  }`}
                >
                  <span className="text-[13.5px] sm:text-[14px] md:text-[14.5px] font-bold text-[#18181B] tracking-tight pr-4">
                    {item.question}
                  </span>
                  <div
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isOpen ? 'text-[#18181B]' : 'text-gray-400'
                    }`}
                  >
                    {isOpen ? (
                      <X className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2]" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-[12px] sm:text-[12.5px] md:text-[13px] text-[#52525B] leading-relaxed font-normal">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
