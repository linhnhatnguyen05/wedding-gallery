'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { COUPLE_NAMES } from '@/lib/photos';

export default function HeroIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <section ref={ref} className="relative w-full min-h-screen flex flex-col items-center justify-center py-8 overflow-hidden">
      
      {/* Cinematic Aura Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#C9A76A]/30 rounded-full blur-[100px] md:blur-[140px]"
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.3, 0.15], rotate: [0, 90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] md:w-[900px] h-[300px] md:h-[400px] bg-[#F8F4EE]/10 rounded-[100%] blur-[100px] md:blur-[120px]"
        />
      </div>
 
      <motion.div style={{ y, opacity, scale }} className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-16">
        
        {/* Circular Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-full overflow-hidden border border-white/20 shadow-2xl mb-6 flex items-center justify-center bg-neutral-900 group shrink-0"
          style={{ width: '250px', height: '250px', boxShadow: '0 0 40px rgba(214,179,106,0.15)' }}
        >
          <img 
            src="/photos/img_018.jpg" 
            alt="Nguyen Thi Hong Avatar" 
            className="transition-transform duration-700 group-hover:scale-110"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono tracking-[0.4em] text-[#D6B36A] mb-2 uppercase"
          style={{ fontSize: '16px' }}
        >
          A Cinematic Exhibition
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-light tracking-tight text-[#F8F4EE] leading-[1.2] mb-6"
          style={{ fontSize: '48px' }}
        >
          {COUPLE_NAMES.combined}
        </motion.h1>

        {/* 1-Line Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="font-serif italic text-white/50 text-sm md:text-base max-w-lg mx-auto mb-10"
        >
          "Every photograph preserves a memory beyond time."
        </motion.p>

        {/* Three Premium Statistic Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.1 }}
          className="flex items-center justify-center gap-8 md:gap-16 mb-16"
        >
          {[
            { value: '188', label: 'Memories' },
            { value: '8', label: 'Collections' },
            { value: '2026', label: 'Edition' }
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-serif font-light text-[#D8B36A] tracking-wider mb-1">
                {stat.value}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Floating 3D Photo Preview Stack ── */}
        <motion.div 
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="relative w-full max-w-2xl h-[300px] md:h-[400px] mt-24 md:mt-32 mb-16 perspective-[1200px] cursor-pointer hover:scale-[1.02] transition-transform duration-700"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {[
            { src: '/photos/img_001.jpg', rot: -8, x: -100, z: -50 },
            { src: '/photos/img_002.jpg', rot: 12, x: 100, z: -30 },
            { src: '/photos/img_023.jpg', rot: 2, x: 0, z: 0 },
          ].map((photo, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900"
              style={{ width: '240px', height: '320px', x: '-50%', y: '-50%', marginLeft: photo.x }}
              animate={{ 
                rotateZ: [photo.rot, photo.rot + (i%2===0?2:-2), photo.rot],
                translateZ: photo.z
              }}
              transition={{ duration: 8 + i*2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
              <img src={photo.src} className="w-full h-full object-cover" alt="" />
            </motion.div>
          ))}
        </motion.div>

        {/* Explore Gallery Button */}
        <motion.button
          data-cursor="ENTER"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="px-10 py-4 rounded-full border border-[#D8B36A] bg-black/40 hover:bg-[#D8B36A]/10 text-[#F8F8F8] hover:text-[#D8B36A] font-mono tracking-widest text-xs uppercase transition-all duration-500 shadow-[0_0_15px_rgba(216,179,106,0.05)] hover:shadow-[0_0_30px_rgba(216,179,106,0.2)] hover:-translate-y-1 hover:scale-105 mb-16 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          Explore Gallery
        </motion.button>

        {/* Animated Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2 }}
          className="flex flex-col items-center gap-2 cursor-pointer mt-8"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase">Scroll</span>
          <motion.span 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs text-[#D8B36A] font-serif"
          >
            ↓
          </motion.span>
        </motion.div>

      </motion.div>
    </section>
  );
}
