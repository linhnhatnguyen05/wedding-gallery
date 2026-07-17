'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import type { AlbumPage } from '@/lib/photos';

interface MasonryGalleryProps {
  pages: AlbumPage[];
  onPhotoClick: (id: number) => void;
}

export default function MasonryGallery({ pages, onPhotoClick }: MasonryGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Simple staggered masonry logic
  const col1 = pages.filter((_, i) => i % 3 === 0);
  const col2 = pages.filter((_, i) => i % 3 === 1);
  const col3 = pages.filter((_, i) => i % 3 === 2);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section ref={containerRef} className="relative w-full py-48 px-4 md:px-12 bg-black/50">
      
      <div className="text-center mb-24 z-10">
        <h2 className="text-4xl md:text-5xl font-serif font-light text-[#F8F4EE] mb-4">Curated Memories</h2>
        <p className="text-xs tracking-[0.3em] uppercase text-white/40">A visual symphony</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-[1400px] mx-auto">
        
        {/* Column 1 */}
        <motion.div style={{ y: y1 }} className="flex flex-col gap-8 md:gap-12 mt-12">
          {col1.map((p) => <GalleryItem key={p.pageNumber} page={p} onClick={onPhotoClick} />)}
        </motion.div>

        {/* Column 2 */}
        <motion.div style={{ y: y2 }} className="flex flex-col gap-8 md:gap-12 md:mt-48">
          {col2.map((p) => <GalleryItem key={p.pageNumber} page={p} onClick={onPhotoClick} />)}
        </motion.div>

        {/* Column 3 */}
        <motion.div style={{ y: y3 }} className="flex flex-col gap-8 md:gap-12 mt-24">
          {col3.map((p) => <GalleryItem key={p.pageNumber} page={p} onClick={onPhotoClick} />)}
        </motion.div>

      </div>
    </section>
  );
}

function GalleryItem({ page, onClick }: { page: AlbumPage; onClick: (id: number) => void }) {
  if (!page.photos?.[0]) return null;
  const photo = page.photos[0];

  return (
    <div 
      className="relative group cursor-pointer overflow-hidden rounded-sm border border-white/10"
      onClick={() => onClick(photo.id)}
    >
      <div className="relative w-full aspect-[3/4] bg-[#111]">
        <Image 
          src={photo.src} 
          alt="" 
          fill 
          sizes="(max-w-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </div>
  );
}
