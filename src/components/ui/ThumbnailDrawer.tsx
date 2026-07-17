'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/easings';
import type { AlbumPage } from '@/lib/photos';

interface ThumbnailDrawerProps {
  pages:       AlbumPage[];
  currentPage: number;
  isOpen:      boolean;
  onSelect:    (i: number) => void;
  onClose:     () => void;
}

export default function ThumbnailDrawer({ pages, currentPage, isOpen, onSelect, onClose }: ThumbnailDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.55, ease: EASE.inOutCirc }}
          className="thumb-drawer fixed bottom-0 left-0 right-0 z-[400]"
          style={{ maxHeight: '55vh' }}
        >
          <div className="px-6 md:px-10 pt-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif italic text-lg text-[var(--gold-light)]">All Memories</span>
              <button
                onClick={onClose}
                className="text-label text-[rgba(248,244,238,0.45)] hover:text-white transition tracking-[0.45em]"
                style={{ background: 'none', border: 'none' }}
              >
                Close [ESC]
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {pages.map((page, i) => (
                <div
                  key={page.pageNumber}
                  onClick={() => onSelect(i)}
                  className={`thumb-item ${i === currentPage ? 'active' : ''}`}
                >
                  {page.layout === 'video' && page.videos?.[0] ? (
                    <>
                      <video src={page.videos[0]} muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs text-[var(--gold)]">▶</div>
                    </>
                  ) : page.photos?.[0] ? (
                    <Image src={page.photos[0].src} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-[rgba(201,167,106,0.06)] flex items-center justify-center">
                      <span className="text-[10px] text-[rgba(201,167,106,0.3)]">—</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 text-[8px] text-white bg-black/60 px-1 rounded font-sans leading-tight">
                    {String(i + 1).padStart(3,'0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

