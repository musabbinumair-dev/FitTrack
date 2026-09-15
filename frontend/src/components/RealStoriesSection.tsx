import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryItem {
  id: string;
  name: string;
  age: number;
  role: string;
  quote: string;
  imageUrl: string;
  imageAlt: string;
}

const STORIES: StoryItem[] = [
  {
    id: 'elena',
    name: 'Elena',
    age: 31,
    role: 'Employees',
    quote:
      "I'm so glad I found this program! The workouts are quick, effective, and fit perfectly into my busy schedule. I feel stronger and more energized than ever before. Highly recommend!",
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Elena during active routine',
  },
  {
    id: 'avery',
    name: 'Avery',
    age: 35,
    role: 'Employees',
    quote:
      'I was skeptical about online fitness programs, but this one exceeded my expectations! The trainers are motivating, the community is supportive, and the workouts are actually fun. Sign me up!',
    imageUrl:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Avery stretching before training',
  },
  {
    id: 'willow',
    name: 'Willow',
    age: 29,
    role: 'Employees',
    quote:
      "As a busy mom, I struggled to find time for myself, but this program made it easy! The workouts are short, effective, and require no equipment. I finally feel like I'm taking care of myself.",
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Willow stretching arms overhead',
  },
  {
    id: 'naomi',
    name: 'Naomi',
    age: 28,
    role: 'Employees',
    quote:
      "This program has been a game changer for me! The workouts are challenging but doable, and I love that I can do them from home. I've seen real results in just a few weeks!",
    imageUrl:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Naomi post-workout portrait',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    age: 33,
    role: 'Employees',
    quote:
      'Finding consistency was always my biggest challenge. The bite-sized format and clear progress tracking kept me accountable week after week. Truly transformative!',
    imageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Sophia yoga stretching session',
  },
];

export const RealStoriesSection: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const cardWidth = 310;
    const scrollOffset = direction === 'left' ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    setTimeout(checkScrollState, 350);
  };

  return (
    <section
      id="stories"
      className="relative w-full bg-white text-[#111215] py-20 sm:py-24 md:py-28 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* ========================================================================= */}
        {/* Section Heading: "Real Stories. Real Progress." */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl md:text-[54px] lg:text-[60px] font-bold text-[#111215] tracking-[-0.035em] leading-[1.12]">
            Real Stories. Real
            <br />
            Progress.
          </h2>
          <p className="mt-4 text-sm sm:text-[15px] text-[#4B5563] max-w-md mx-auto font-normal leading-relaxed">
            See how simple routines are helping them feel stronger every day.
          </p>
        </motion.div>

        {/* ========================================================================= */}
        {/* Carousel / Cards Grid */}
        {/* ========================================================================= */}
        <div className="relative w-full mt-12 sm:mt-16">
          <div
            ref={carouselRef}
            onScroll={checkScrollState}
            tabIndex={0}
            aria-label="Real member stories and reviews"
            className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center justify-start xl:justify-center gap-5 sm:gap-6 px-4 sm:px-6 lg:px-8 pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {STORIES.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative shrink-0 w-[260px] sm:w-[275px] md:w-[285px] h-[430px] sm:h-[460px] rounded-[32px] sm:rounded-[36px] bg-[#D7E8F7] overflow-hidden p-3.5 sm:p-4 flex flex-col justify-center shadow-[0_12px_32px_rgba(15,23,42,0.08)] group select-none"
              >
                {/* Background Photo of the Member inside the card */}
                <img
                  src={story.imageUrl}
                  alt={story.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.08] contrast-[1.04] transition-transform duration-500 group-hover:scale-105"
                />

                {/* Ambient vignette gradient inside the card */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />

                {/* Frosted Glassmorphism Testimonial Overlay Card */}
                <div className="relative z-10 w-full rounded-[24px] sm:rounded-[26px] bg-slate-950/35 hover:bg-slate-950/45 backdrop-blur-xl border border-white/30 p-4 sm:p-4.5 text-white shadow-[0_10px_28px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all duration-300">
                  {/* Quote text */}
                  <p className="text-[11.5px] sm:text-[12px] md:text-[12.5px] text-white font-normal leading-[1.5] tracking-[-0.01em]">
                    {story.quote}
                  </p>

                  {/* Member Name & Role */}
                  <div className="mt-4 sm:mt-5 pt-2.5">
                    <h3 className="text-white text-[13px] sm:text-[13.5px] font-bold tracking-tight">
                      {story.name}, {story.age}
                    </h3>
                    <p className="text-white/75 text-[11px] font-normal mt-0.5">
                      {story.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Navigation Arrows: Left & Right Pill / Circles (< and >) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center gap-3 mt-8 sm:mt-10">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Previous story"
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
              canScrollLeft
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-95'
                : 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Next story"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#111215] text-white hover:bg-black active:scale-95 transition-all duration-200 shadow-sm"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </section>
  );
};
