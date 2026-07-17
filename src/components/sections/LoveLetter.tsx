'use client';

import { motion } from 'framer-motion';

export default function LoveLetter() {
  return (
    <section className="relative w-full py-48 md:py-64 flex flex-col items-center justify-center">
      
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl lg:text-5xl font-serif font-light leading-[1.6] md:leading-[1.8] text-[#F8F4EE]"
        >
          &quot;In all the world, there is no heart for me like yours. <br className="hidden md:block" /> 
          In all the world, there is no love for you like mine.&quot;
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 text-[#C9A76A] tracking-[0.4em] font-mono text-sm uppercase"
        >
          — Maya Angelou
        </motion.div>
      </div>
      
      {/* Footer / End of Exhibition Marker */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute bottom-12 flex flex-col items-center gap-4"
      >
        <div className="w-px h-16 bg-gradient-to-t from-white/30 to-transparent" />
        <p className="text-xs tracking-[0.3em] font-mono text-white/40 uppercase">End of Exhibition</p>
      </motion.div>
      
    </section>
  );
}
