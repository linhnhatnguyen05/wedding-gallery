'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUPLE_NAMES } from '@/lib/photos';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate asset preloading with a smooth progress counter
    const duration = 2500; // 2.5 seconds cinematic load
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setProgress(nextProgress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => setLoading(false), 500); // Small pause at 100%
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center text-[#F8F4EE]"
        >
          {/* Animated Gold Grain / Gradient Background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(214,179,106,0.05)_0%,transparent_70%)]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <p className="font-mono tracking-[0.4em] text-white/40 text-xs mb-4 uppercase">
              A Cinematic Exhibition
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-widest text-[#D6B36A] mb-12">
              {COUPLE_NAMES.monogram}
            </h1>

            {/* Progress Bar Container */}
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-[#D6B36A]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
            <div className="mt-4 font-mono text-[10px] text-white/30 tracking-widest">
              {progress.toString().padStart(3, '0')}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
