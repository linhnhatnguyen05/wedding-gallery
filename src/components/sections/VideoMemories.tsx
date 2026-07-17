'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const VIDEOS = [
  { id: 1, title: 'The Vows', src: '/videos/video1.mp4' },
  { id: 2, title: 'First Dance', src: '/videos/video2.mp4' },
];

export default function VideoMemories() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative w-full py-48 px-4 md:px-12 flex flex-col items-center">
      
      <div className="text-center mb-24 z-10">
        <h2 className="text-4xl md:text-5xl font-serif font-light text-[#F8F4EE] mb-4">Moving Memories</h2>
        <p className="text-xs tracking-[0.3em] uppercase text-white/40">Moments in motion</p>
      </div>

      <motion.div style={{ y }} className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {VIDEOS.map((video) => (
          <div key={video.id} className="relative group flex flex-col items-center">
            
            <div className="relative w-full aspect-video border-[4px] border-[#FAF7F0] p-1 bg-[#FAF7F0] shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="relative w-full h-full bg-black overflow-hidden cursor-pointer flex items-center justify-center">
                
                <video 
                  src={video.src} 
                  muted 
                  loop 
                  playsInline 
                  onMouseOver={e => e.currentTarget.play()} 
                  onMouseOut={e => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-100"
                />
                
                {/* Play Button Icon */}
                <div className="w-16 h-16 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500 z-10">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                </div>

              </div>
            </div>

            <p className="mt-8 text-[#C9A76A] tracking-[0.3em] font-mono text-xs uppercase opacity-80 group-hover:opacity-100 transition-opacity">
              {video.title}
            </p>
            
          </div>
        ))}
        
      </motion.div>
      
    </section>
  );
}
