'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { AlbumPage } from '@/lib/photos';
import Image from 'next/image';

interface FloatingStoryProps {
  pages: AlbumPage[];
  onPhotoClick: (id: number) => void;
}

export default function FloatingStory({ pages, onPhotoClick }: FloatingStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section ref={containerRef} className="relative w-full py-32 md:py-64 flex flex-col items-center">
      
      <div className="text-center mb-32 z-10">
        <h2 className="text-4xl md:text-6xl font-serif font-light text-[#F8F4EE] mb-6">Fragments of Time</h2>
        <p className="text-sm tracking-[0.2em] uppercase text-white/50 max-w-md mx-auto">Every moment captured, suspended in eternity.</p>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-32">
        {pages.map((page, i) => {
          if (!page.photos?.[0]) return null;
          
          // Alternating layout and parallax speeds
          const isLeft = i % 2 === 0;
          const yOffset = useTransform(scrollYProgress, [0, 1], [0, isLeft ? -150 : 150]);
          
          return (
            <motion.div 
              key={page.pageNumber}
              style={{ y: yOffset }}
              className={`relative flex flex-col ${isLeft ? 'items-end' : 'items-start md:mt-48'}`}
            >
              <div 
                className="relative group cursor-pointer perspective-[1200px]"
                onClick={() => onPhotoClick(page.photos![0].id)}
              >
                <div className="relative border-[4px] border-[#FAF7F0] p-1 bg-[#FAF7F0] shadow-2xl transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-[1.03] group-hover:-translate-y-4 group-hover:rotate-x-[5deg] group-hover:-rotate-y-[2deg] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                  
                  <div className="relative overflow-hidden bg-black aspect-[3/4] w-[80vw] md:w-[35vw] max-w-[450px]">
                    <Image 
                      src={page.photos[0].src} 
                      alt="" 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-w-width: 768px) 80vw, 35vw"
                    />
                    
                    {/* Glass Glare Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </div>
                  
                </div>
                
                <div className="absolute -bottom-12 flex flex-col text-[#C9A76A] tracking-[0.2em] text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>MOMENT</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
    </section>
  );
}
