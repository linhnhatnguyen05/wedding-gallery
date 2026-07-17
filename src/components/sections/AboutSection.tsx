'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section id="about-section" className="relative w-full py-32 bg-[#050505] overflow-hidden border-t border-white/5">
      {/* Decorative subtle background aura */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-[#D8B36A] opacity-[0.02] blur-[150px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* Portrait Photo (Left or Right depending on screens) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 relative group"
            data-cursor="OPEN"
          >
            <div className="absolute inset-0 border border-[#D8B36A]/20 rounded-2xl -m-3 pointer-events-none group-hover:m-0 transition-all duration-700" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4] bg-neutral-900">
              <img 
                src="/photos/img_018.jpg" 
                alt="Nguyen Thi Hong Portrait" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Editorial Content */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#D8B36A] mb-4"
            >
              The Artist & Muse
            </motion.span>

            <motion.h2 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight text-[#F8F8F8] mb-8 leading-[1.15]"
            >
              Nguyễn Thị Hồng
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-sm md:text-base text-white/70 font-light leading-relaxed flex flex-col gap-6"
            >
              <p>
                Born with a deep appreciation for the transient beauty of light and shadow, Nguyễn Thị Hồng views photography not merely as a technical skill, but as an act of memory preservation. Every portrait is a quiet dialogue between the lens and the soul, capturing a singular presence in time.
              </p>
              <p>
                This digital exhibition represents a curated journey through intimate chapters of expression—combining clean cinematic geometry with raw natural emotions, celebrating the intersection of luxury digital art and classic portraiture.
              </p>
            </motion.div>

            {/* Quote block */}
            <motion.blockquote 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.4 }}
              className="border-l-2 border-[#D8B36A]/50 pl-6 mt-10"
            >
              <p className="font-serif italic text-white/50 text-sm md:text-base leading-relaxed">
                &quot;To photograph is to hold one&apos;s breath, when all faculties converge to capture fleeting reality. It&apos;s a grand physical and intellectual joy.&quot;
              </p>
            </motion.blockquote>
          </div>

        </div>
      </div>
    </section>
  );
}
