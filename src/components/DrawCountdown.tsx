'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DrawCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Reference start point (e.g., April 1st, 2026, 12:00 AM BD Time)
    const cycleStart = new Date('2026-04-05T00:00:00+06:00').getTime();
    const cycleDuration = 10 * 24 * 60 * 60 * 1000; // 10 days in ms

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = now - cycleStart;
      
      // Calculate how many cycles have passed
      const cyclesPassed = Math.floor(elapsed / cycleDuration);
      // Next draw is at the end of the current cycle
      const nextDrawTime = cycleStart + (cyclesPassed + 1) * cycleDuration;
      
      const distance = nextDrawTime - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border border-white/20 shadow-xl overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-2xl md:text-3xl font-black text-white"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>
      <span className="text-[10px] md:text-xs font-bold text-indigo-200 mt-2 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
      
      <div className="flex-1 text-center md:text-left relative z-10">
        <h3 className="text-white text-2xl md:text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
          <span className="text-3xl">🎯</span> Next Big Draw
        </h3>
        <p className="text-indigo-100 text-sm md:text-base font-medium max-w-xs opacity-80 leading-relaxed italic">
          Members are selected every 10 days. Ensure your payments are up to date!
        </p>
      </div>

      <div className="flex items-center gap-3 md:gap-5 relative z-10">
        <TimeUnit label="Days" value={timeLeft.days} />
        <TimeUnit label="Hrs" value={timeLeft.hours} />
        <TimeUnit label="Min" value={timeLeft.minutes} />
        <TimeUnit label="Sec" value={timeLeft.seconds} />
      </div>
    </div>
  );
};

export default DrawCountdown;
