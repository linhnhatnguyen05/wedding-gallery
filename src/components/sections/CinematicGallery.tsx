'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface CinematicGalleryProps {
  pages: any[];
  onMediaClick: (id: number) => void;
}

export default function CinematicGallery({ pages, onMediaClick }: CinematicGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Flatten all photos for the layout
  const allPhotos = pages.flatMap(p => p.photos || []).filter(p => p && p.src);
  
  // Limit to first 20 for the cinematic exhibition performance (can be lazy-loaded later)
  const exhibitionPhotos = allPhotos.slice(0, 20);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-transparent">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center perspective-[2000px]">
        {exhibitionPhotos.map((photo, i) => {
          // Calculate strictly bounded staggering scroll positions [0.0, 1.0]
          const duration = 0.25;
          const rangeStart = (i / (exhibitionPhotos.length - 1)) * (1 - duration);
          const rangeEnd = rangeStart + duration;

          const zIndex = exhibitionPhotos.length - i;
          
          const z = useTransform(scrollYProgress, [rangeStart, rangeEnd], [-2000, 1000]);
          const opacity = useTransform(scrollYProgress, [rangeStart, rangeStart + 0.05, rangeEnd - 0.05, rangeEnd], [0, 1, 1, 0]);
          
          const xOffset = i % 2 === 0 ? 150 : -150;
          const x = useTransform(scrollYProgress, [rangeStart, rangeEnd], [xOffset * 1.5, -xOffset]);
          
          const yOffset = i % 3 === 0 ? 100 : (i % 3 === 1 ? -100 : 0);
          const y = useTransform(scrollYProgress, [rangeStart, rangeEnd], [yOffset * 1.5, -yOffset]);

          const rotateY = useTransform(scrollYProgress, [rangeStart, rangeEnd], [i % 2 === 0 ? 15 : -15, i % 2 === 0 ? -15 : 15]);
          const rotateX = useTransform(scrollYProgress, [rangeStart, rangeEnd], [5, -5]);

          return (
            <motion.div
              key={photo.id || i}
              onClick={() => onMediaClick(Number(photo.id))}
              className="absolute cursor-none rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900 group"
              style={{
                width: i % 4 === 0 ? '400px' : '300px',
                height: i % 4 === 0 ? '600px' : '450px',
                z,
                x,
                y,
                rotateY,
                rotateX,
                opacity,
                zIndex
              }}
              data-cursor="VIEW"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10 pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              <img 
                src={photo.src} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                loading="lazy"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
