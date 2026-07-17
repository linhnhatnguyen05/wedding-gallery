import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, DUR } from '@/lib/easings';
import type { AlbumPage } from '@/lib/photos';

/* ── Inline Video for lightbox ─────────────── */
function LightboxVideo({ src, onPlay }: { src: string, onPlay?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    ref.current?.play().catch(() => {});
    if (onPlay) onPlay();
  }, [onPlay]);
  
  const cacheBustedSrc = src && !src.startsWith('data:') && !src.startsWith('blob:') ? `${src}?v=1` : src;
  
  return (
    <video
      ref={ref}
      src={cacheBustedSrc}
      controls
      loop
      autoPlay
      playsInline
      className="max-h-[85vh] w-auto object-contain drop-shadow-2xl"
    />
  );
}

/* ── Photo or Video Media ──────────── */
function LightboxMedia({ page, isCenter }: { page: AlbumPage; isCenter: boolean }) {
  const isVideo = page.layout === 'video';
  const src = isVideo ? page.videos?.[0] : page.photos?.[0]?.src;
  
  if (!src) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center">
        {isVideo ? (
          <LightboxVideo src={src} />
        ) : (
          <Image
            src={src}
            alt="Artwork"
            fill
            className={`object-contain ${isCenter ? 'drop-shadow-2xl' : ''}`}
            priority={isCenter}
          />
        )}
      </div>
      {/* Caption area below image */}
      {isCenter && (
        <div className="mt-4 text-center shrink-0">
          <p className="text-label" style={{ color: 'rgba(201,167,106,0.8)', letterSpacing: '0.45em' }}>
            HỒNG
          </p>
        </div>
      )}
    </div>
  );
}

/* ── MAIN MEDIA VIEWER ─────────────────────── */
interface MediaViewerProps {
  pages:       AlbumPage[];
  currentIndex: number;
  onClose:     () => void;
  onSelect:    (idx: number) => void;
}

export default function MediaViewer({ pages, currentIndex, onClose, onSelect }: MediaViewerProps) {
  const isOpen = currentIndex !== null;
  const total = pages.length;

  /* keyboard */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') onSelect(Math.min(total - 1, currentIndex + 1));
      if (e.key === 'ArrowLeft')  onSelect(Math.max(0, currentIndex - 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onSelect, currentIndex, total]);

  if (!isOpen) return null;

  const currPage = pages[currentIndex];
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex < total - 1 ? pages[currentIndex + 1] : null;

  return (
    <motion.div
      key="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.cinematic, ease: EASE.cinema }}
      className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center overflow-hidden cursor-pointer"
      style={{ background: 'rgba(5, 5, 5, 0.95)', backdropFilter: 'blur(20px)' }}
      onClick={onClose} // "bấm vào màn hình thì ảnh tự xuống"
    >
      {/* Previous Image (Side) */}
      {prevPage && (
        <div 
          className="absolute left-0 top-0 w-[15vw] md:w-[25vw] h-full flex flex-col items-center justify-center px-4 md:px-8 opacity-30 hover:opacity-80 transition-opacity duration-300 z-10 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onSelect(currentIndex - 1); }}
        >
          <div className="relative w-full h-[50vh] md:h-[60vh] scale-75 pointer-events-none">
            <LightboxMedia page={prevPage} isCenter={false} />
          </div>
        </div>
      )}

      {/* Current Image (Center) */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: EASE.outExpo }}
        className="relative z-20 w-[70vw] md:w-[50vw] h-[85vh] flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); onClose(); }} // Ensure clicking the image also closes
      >
         <LightboxMedia page={currPage} isCenter={true} />
      </motion.div>

      {/* Next Image (Side) */}
      {nextPage && (
        <div 
          className="absolute right-0 top-0 w-[15vw] md:w-[25vw] h-full flex flex-col items-center justify-center px-4 md:px-8 opacity-30 hover:opacity-80 transition-opacity duration-300 z-10 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onSelect(currentIndex + 1); }}
        >
          <div className="relative w-full h-[50vh] md:h-[60vh] scale-75 pointer-events-none">
            <LightboxMedia page={nextPage} isCenter={false} />
          </div>
        </div>
      )}

      {/* Counter (Optional, keeping it subtle at the bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-label text-[rgba(201,167,106,0.4)] tracking-[0.5em] text-xs pointer-events-none">
        {String(currentIndex + 1).padStart(3, '0')} / {String(total).padStart(3, '0')}
      </div>
    </motion.div>
  );
}

