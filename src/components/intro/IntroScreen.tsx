'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, DUR } from '@/lib/easings';
import { COUPLE_NAMES } from '@/lib/photos';

/* ── Pre-computed dust particle data ──────── */
const DUST = Array.from({ length: 32 }, (_, i) => ({
  x:     (i * 31 + 7)  % 100,
  delay: (i * 0.18) % 3.5,
  dur:   3.5 + (i % 5) * 0.4,
  size:  1.5 + (i % 3),
  dx:    ((i * 23) % 80) - 40}));

interface IntroScreenProps {
  onEnter: () => void;
}

export default function IntroScreen({ onEnter }: IntroScreenProps) {
  const [showButton, setShowButton] = useState(false);
  const [phase, setPhase]           = useState<'loading' | 'ready'>('loading');
  const [exiting, setExiting]       = useState(false);


  useEffect(() => {
    // Show enter button after loading animation completes
    const t1 = setTimeout(() => setPhase('ready'), 3400);
    const t2 = setTimeout(() => setShowButton(true), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 1400);
  };

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="intro-screen"
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden pointer-events-auto"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: EASE.outExpo }}
        >
          {/* ── Floating Dust Particles ── */}
          {DUST.map((d, i) => (
            <span
              key={i}
              className="intro-dust"
              style={{
                left:  `${d.x}%`,
                bottom: '5%',
                width:  `${d.size}px`,
                height: `${d.size}px`,
                animationDuration:  `${d.dur}s`,
                animationDelay:     `${d.delay}s`,
                '--dx': `${d.dx}px`} as React.CSSProperties}
            />
          ))}

          {/* ── Gold corner marks ── */}
          {(['tl','tr','bl','br'] as const).map(pos => (
            <motion.div
              key={pos}
              className={`absolute ${pos.includes('t') ? 'top-8' : 'bottom-8'} ${pos.includes('l') ? 'left-8' : 'right-8'}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: EASE.outExpo }}
            >
              <div className={`w-6 h-6 ${pos.includes('b') ? 'border-b' : 'border-t'} ${pos.includes('r') ? 'border-r' : 'border-l'} border-[rgba(201,167,106,0.5)]`} />
            </motion.div>
          ))}

          {/* ── Main content ── */}
          <div className="relative text-center flex flex-col items-center gap-0 max-w-lg px-8">

            {/* Small glyph top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.5, ease: EASE.outExpo }}
              className="text-[rgba(201,167,106,0.6)] text-2xl mb-10 tracking-[0.5em]"
            >
              ✦
            </motion.div>

            {/* Main Name */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.5, duration: 2.2, ease: EASE.outExpo }}
              className="font-display font-light text-5xl md:text-7xl lg:text-[6rem] text-[#F8F4EE] leading-[1.1] mb-10 text-center"
              style={{
                background: 'linear-gradient(135deg, #F8F4EE 0%, #F0E0B0 30%, #C9A76A 70%, #B08D57 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {COUPLE_NAMES.combined}
            </motion.div>

            {/* Caption / Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1.2 }}
              className="text-label text-[rgba(201,167,106,0.6)] mb-10 tracking-[0.4em] uppercase text-sm"
            >
              Photography Portfolio · The Visual Journey
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="mb-6 flex flex-col items-center gap-3"
            >
              <div className="intro-loading-bar">
                <div className="intro-loading-fill" />
              </div>
              <AnimatePresence mode="wait">
                {phase === 'loading' ? (
                  <motion.p
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-label text-[rgba(201,167,106,0.45)] tracking-[0.45em]"
                  >
                    Preparing Your Memories...
                  </motion.p>
                ) : (
                  <motion.p
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-label text-[rgba(201,167,106,0.45)] tracking-[0.45em]"
                  >
                    {COUPLE_NAMES.date}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Enter button */}
            <AnimatePresence>
              {showButton && (
                <motion.button
                  key="enter-btn"
                  onClick={handleEnter}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE.elastic }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-luxury"
                  style={{  }}
                >
                  <span style={{ letterSpacing: '0.1em', fontSize: '0.9em' }}>♦</span>
                  Open the Album
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Thin line at bottom ── */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-[rgba(201,167,106,0.3)] to-transparent"
            initial={{ width: 0 }}
            animate={{ width: '240px' }}
            transition={{ delay: 1.5, duration: 2, ease: EASE.luxury }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

