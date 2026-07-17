'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

const CHAPTERS = [
  {
    title: 'Morning',
    time: '08:00 AM',
    image: '/photos/img_002.jpg',
    description: 'Awakening under the soft, diffused morning light.',
    glow: 'rgba(216, 179, 106, 0.15)',
    animation: { rotate: -2, y: -10 }
  },
  {
    title: 'Coffee',
    time: '11:30 AM',
    image: '/photos/img_005.jpg',
    description: 'Intimate moments captured in quiet conversation.',
    glow: 'rgba(255, 255, 255, 0.08)',
    animation: { rotate: 3, y: 15 }
  },
  {
    title: 'Travel',
    time: '02:00 PM',
    image: '/photos/img_006.jpg',
    description: 'Exploring scenic horizons and wandering footprints.',
    glow: 'rgba(216, 179, 106, 0.12)',
    animation: { rotate: -1, y: -20 }
  },
  {
    title: 'Beach',
    time: '04:30 PM',
    image: '/photos/img_023.jpg',
    description: 'Where the sea meets soft wind and matching steps.',
    glow: 'rgba(255, 255, 255, 0.1)',
    animation: { rotate: 2, y: 5 }
  },
  {
    title: 'Sunset',
    time: '06:00 PM',
    image: '/photos/img_013.jpg',
    description: 'Basking in the fleeting gold of golden hour.',
    glow: 'rgba(216, 179, 106, 0.2)',
    animation: { rotate: -3, y: 25 }
  },
  {
    title: 'Night',
    time: '09:30 PM',
    image: '/photos/img_018.jpg',
    description: 'Cinematic reflections under the stars.',
    glow: 'rgba(0, 0, 0, 0.5)',
    animation: { rotate: 1, y: -5 }
  }
];

export default function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="timeline-section" className="relative w-full py-32 bg-[#050505] overflow-hidden border-t border-white/5">
      {/* Background visual helpers */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#D8B36A]/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10000ms]" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-16">
        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#D8B36A] block mb-3">
          Chronicles of Time
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-[#F8F8F8] mb-4">
          Exhibition Chapters
        </h2>
        <p className="text-sm text-white/50 font-light max-w-xl">
          Following the journey through varying light, moods, and settings. Hover each chapter card to reveal its depth.
        </p>
      </div>

      {/* Chapters Container */}
      <div ref={containerRef} className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {CHAPTERS.map((chap, idx) => (
            <motion.div
              key={chap.title}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ 
                y: chap.animation.y,
                rotateZ: chap.animation.rotate,
                scale: 1.03,
                boxShadow: `0 20px 40px ${chap.glow}`
              }}
              className="relative rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:border-[#D8B36A]/30 transition-all duration-500 cursor-pointer flex flex-col justify-between h-[420px] group overflow-hidden"
              data-cursor="VIEW"
            >
              {/* Glass reflection glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-out pointer-events-none" />

              {/* Time Badge */}
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono tracking-widest text-[#D8B36A] uppercase bg-[#D8B36A]/5 border border-[#D8B36A]/20 rounded-full px-3 py-1">
                  {chap.time}
                </span>
                <span className="text-[10px] font-mono opacity-30 text-white">
                  0{idx + 1}
                </span>
              </div>

              {/* Chapter Image Panel */}
              <div className="relative w-full h-[220px] rounded-xl overflow-hidden my-4 border border-white/5 bg-neutral-900">
                <img 
                  src={chap.image} 
                  alt={chap.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
              </div>

              {/* Chapter Meta */}
              <div className="z-10">
                <h3 className="text-xl font-serif tracking-wide text-[#F8F8F8] group-hover:text-[#D8B36A] transition-colors mb-2">
                  {chap.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all duration-300">
                  {chap.description}
                </p>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
