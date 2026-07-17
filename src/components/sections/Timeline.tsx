'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const MILESTONES = [
  { year: '2019', title: 'The First Glance', desc: 'A chance meeting that sparked a lifetime of memories.' },
  { year: '2021', title: 'The Promise', desc: 'A commitment made under the stars.' },
  { year: '2023', title: 'Building Dreams', desc: 'Moving in and creating our own little world.' },
  { year: '2026', title: 'Forever Begins', desc: 'The day we say I do, surrounded by love.' }
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="relative w-full py-48 flex flex-col items-center justify-center">
      
      <div className="text-center mb-32 z-10">
        <h2 className="text-4xl md:text-6xl font-serif font-light text-[#F8F4EE] mb-6">Our Journey</h2>
        <p className="text-sm tracking-[0.2em] uppercase text-white/50">The chapters of our love story.</p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-32 px-4 md:px-0">
        
        {/* Animated Center Line */}
        <div className="absolute left-12 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
        <motion.div 
          style={{ height: lineHeight }}
          className="absolute left-12 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-transparent via-[#C9A76A] to-transparent -translate-x-1/2 shadow-[0_0_15px_#C9A76A]" 
        />

        {MILESTONES.map((m, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} className={`relative flex items-center w-full ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
              
              {/* Dot */}
              <div className="absolute left-12 md:left-1/2 w-3 h-3 bg-[#C9A76A] rounded-full -translate-x-1/2 shadow-[0_0_10px_#C9A76A]" />

              <motion.div 
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full md:w-5/12 pl-24 md:pl-0 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16 text-left'}`}
              >
                <div className="text-[#C9A76A] font-mono tracking-[0.2em] text-sm mb-2">{m.year}</div>
                <h3 className="text-2xl md:text-3xl font-serif text-[#F8F4EE] mb-4">{m.title}</h3>
                <p className="text-white/60 leading-relaxed font-light">{m.desc}</p>
              </motion.div>

            </div>
          );
        })}
      </div>
      
    </section>
  );
}
