'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { getAllPhotos, savePhotosBulk, getAllAlbums, saveAlbum, deleteAlbum } from '@/lib/db';
import type { DBAlbum } from '@/lib/db';
import { photos as staticPhotos, videos as staticVideos } from '@/lib/photos';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_ITEMS = 188;
const BENTO_CATEGORIES = ['ALL', 'Portraits', 'Muse', 'Travel', 'Commission'];
const CATEGORY_MAP = ['Portraits', 'Muse', 'Travel', 'Commission', 'Portraits', 'Muse'];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  isVideo?: boolean;
  category?: string;
  width?: number;
  height?: number;
}

interface LightboxState {
  open: boolean;
  index: number;
}

// ─────────────────────────────────────────────
// SEED DATA: convert static photos + videos → GalleryItem[]
// ─────────────────────────────────────────────
function buildStaticItems(): GalleryItem[] {
  const photoItems: GalleryItem[] = staticPhotos.map((p, i) => ({
    id: `photo-${p.id}`,
    src: p.src,
    alt: p.alt,
    caption: p.caption,
    isVideo: false,
    category: CATEGORY_MAP[i % CATEGORY_MAP.length],
  }));
  const videoItems: GalleryItem[] = staticVideos.map((v, i) => ({
    id: `video-${i}`,
    src: v,
    alt: `Cinematic Moment ${String(i + 1).padStart(2, '0')}`,
    caption: `Video ${String(i + 1).padStart(2, '0')}`,
    isVideo: true,
    category: 'Travel',
  }));
  const combined = [...photoItems, ...videoItems];
  return combined.slice(0, MAX_ITEMS);
}

// ─────────────────────────────────────────────
// CACHE-BUSTING HELPER FOR VIDEOS (Bypasses Chrome Range Cache Bugs)
// ─────────────────────────────────────────────
const getCacheBustedSrc = (src: string) => {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `${src}?v=1`;
};

// ─────────────────────────────────────────────
// THREE-D TILT CARD
// ─────────────────────────────────────────────
function ThreeDTiltCard({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-8deg', '8deg']);
  const glareX = useTransform(xSpring, [-0.5, 0.5], [100, 0]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], [100, 0]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { setHovered(false); x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        rotateX: hovered ? rotateX : 0,
        rotateY: hovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
      whileHover={{ scale: 1.03, y: -8, transition: { duration: 0.35, ease: 'easeOut' } }}
      className={`relative group cursor-pointer overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.55)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-shadow duration-700 ${className}`}
    >
      <div className="absolute inset-0 border border-white/10 pointer-events-none z-20 rounded-inherit" />
      <div className="w-full h-full relative z-0 overflow-hidden">{children}</div>
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay"
        style={{ background: glareBg }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SHOWCASE VIDEO PLAYER (for 3D carousel active video cards)
// ─────────────────────────────────────────────
function ShowcaseVideo({ src }: { src: string }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
    return () => { v.pause(); };
  }, [src]);
  return (
    <video
      ref={vidRef}
      src={getCacheBustedSrc(src)}
      preload="auto"
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    />
  );
}

// ─────────────────────────────────────────────
// AUTO-PLAY VIDEO (plays when visible in viewport)
// ─────────────────────────────────────────────
function AutoVideo({ src, className = '' }: { src: string; className?: string }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(v);
    return () => observer.disconnect();
  }, [src]);
  return (
    <video
      ref={vidRef}
      src={getCacheBustedSrc(src)}
      preload="auto"
      autoPlay
      muted
      loop
      playsInline
      className={className}
    />
  );
}


// ─────────────────────────────────────────────
function CinematicShowcase({
  items,
  onOpen,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const total = items.length;
  const VISIBLE = 11;

  const goNext = useCallback(() => setActive(p => (p + 1) % total), [total]);
  const goPrev = useCallback(() => setActive(p => (p - 1 + total) % total), [total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  // Build arc: indices centered around `active`
  const arcIndices = useMemo(() => {
    const half = Math.floor(VISIBLE / 2);
    return Array.from({ length: VISIBLE }, (_, i) => {
      const offset = i - half;
      return (active + offset + total) % total;
    });
  }, [active, total]);

  const item = items[active];

  // Leica progress bar segments
  const segmentCount = Math.min(total, 40);
  const segmentStep = total / segmentCount;

  return (
    <div className="gallery-section-bg relative w-full py-20 select-none">
      {/* Flowing light orbs */}
      <div className="orb-1" style={{ top: '10%', left: '-10%' }} />
      <div className="orb-2" style={{ bottom: '5%', right: '5%' }} />

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center mb-10"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#D8B36A]/70">
          Cinematic Showcase — 3D Arc
        </span>
      </motion.div>

      {/* 3D Arc Container */}
      <div className="relative w-full h-[520px] flex items-center justify-center" style={{ perspective: '1800px' }}>
        {arcIndices.map((itemIdx, i) => {
          const circularOffset = i - Math.floor(VISIBLE / 2);
          const isActive = circularOffset === 0;
          const absOffset = Math.abs(circularOffset);
          const zDepth = isActive ? 200 : -absOffset * 60;
          const xPos = circularOffset * 170;
          const yPos = Math.abs(circularOffset) * 12;
          const rotY = circularOffset * -14;
          const scale = isActive ? 1 : Math.max(0.6, 1 - absOffset * 0.12);
          const opacity = isActive ? 1 : Math.max(0.25, 1 - absOffset * 0.18);
          const zIndex = VISIBLE - absOffset;
          const galleryItem = items[itemIdx];

          return (
            <motion.div
              key={`showcase-${itemIdx}`}
              animate={{
                x: xPos,
                y: yPos,
                z: zDepth,
                rotateY: rotY,
                scale,
                opacity,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              style={{ position: 'absolute', zIndex, transformStyle: 'preserve-3d' }}
              className="w-[220px] h-[320px] cursor-pointer"
              onClick={() => {
                setActive(itemIdx);
                onOpen(itemIdx);
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
                {galleryItem.isVideo ? (
                  <ShowcaseVideo src={galleryItem.src} />
                ) : (
                  <img
                    src={galleryItem.src}
                    alt={galleryItem.alt}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                )}
                {/* Gold border on active */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-[#D8B36A]/60 rounded-2xl pointer-events-none" />
                )}
              </div>
              {/* Counter badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-[#D8B36A]/80">
                {String(itemIdx + 1).padStart(3, '0')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Arrow navigation */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={goPrev}
          className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-[#D8B36A] hover:border-[#D8B36A]/50 transition-all duration-300 hover:scale-110"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          onClick={goNext}
          className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-[#D8B36A] hover:border-[#D8B36A]/50 transition-all duration-300 hover:scale-110"
          aria-label="Next"
        >
          →
        </button>
      </div>

      {/* Leica Progress Bar */}
      <div className="mt-6 px-6 flex items-center gap-3 max-w-3xl mx-auto">
        <span className="text-[10px] font-mono text-white/40 w-12 text-right shrink-0">
          {String(active + 1).padStart(3, '0')}
        </span>
        <div className="flex-1 flex items-center gap-[2px] h-6">
          {Array.from({ length: segmentCount }, (_, si) => {
            const segStart = Math.round(si * segmentStep);
            const segEnd = Math.round((si + 1) * segmentStep);
            const isFilledSeg = active >= segStart && active < segEnd;
            const isPastSeg = active >= segEnd;
            return (
              <button
                key={si}
                onClick={() => setActive(Math.round(si * segmentStep))}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  isFilledSeg
                    ? 'bg-[#D8B36A] scale-y-150'
                    : isPastSeg
                    ? 'bg-[#D8B36A]/40'
                    : 'bg-white/10 hover:bg-white/25'
                }`}
                aria-label={`Go to segment ${si + 1}`}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-mono text-white/40 w-12 shrink-0">
          {String(total).padStart(3, '0')}
        </span>
      </div>

      {/* Caption metadata */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`caption-${active}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="mt-6 text-center px-4"
        >
          <p className="text-white/60 text-sm font-light tracking-widest">{item?.caption}</p>
          {item?.isVideo && (
            <span className="text-[#D8B36A] text-[10px] font-mono tracking-[0.3em] uppercase mt-1 block">
              ▶ Video
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// AREA 2 – APPLE BENTO GRID
// ─────────────────────────────────────────────
function BentoGrid({
  items,
  onOpen,
}: {
  items: GalleryItem[];
  onOpen: (globalIndex: number) => void;
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filtered = useMemo(() => {
    if (activeFilter === 'ALL') return items;
    return items.filter(item => item.category === activeFilter);
  }, [items, activeFilter]);

  // Chunk into groups of 5
  const chunks = useMemo(() => {
    const result: GalleryItem[][] = [];
    for (let i = 0; i < filtered.length; i += 5) {
      result.push(filtered.slice(i, i + 5));
    }
    return result;
  }, [filtered]);

  // Map filtered item back to global index
  const globalIndex = useCallback(
    (item: GalleryItem) => items.findIndex(it => it.id === item.id),
    [items]
  );

  return (
    <section className="gallery-section-bg w-full py-24 px-4 md:px-8 lg:px-16">
      {/* Flowing light orbs */}
      <div className="orb-1" style={{ top: '-15%', right: '-10%' }} />
      <div className="orb-2" style={{ bottom: '10%', left: '5%' }} />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="text-center mb-16 relative z-10"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#D8B36A]/80 block mb-4">
          Exhibition — Collection
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight text-white/90 leading-[1.15]">
          Art. Meet Emotion.{' '}
          <span className="shimmer-text">Exquisite</span>
          <span className="text-white/90"> in every frame.</span>
        </h2>
      </motion.div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        {BENTO_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-400 border ${
              activeFilter === cat
                ? 'bg-[#D8B36A] text-black border-[#D8B36A] shadow-[0_0_24px_rgba(216,179,106,0.5)]'
                : 'border-white/15 text-white/50 hover:border-[#D8B36A]/50 hover:text-white bg-white/5 backdrop-blur-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Chunks */}
      <div className="flex flex-col gap-10 max-w-[1400px] mx-auto relative z-10">
        {chunks.map((chunk, chunkIdx) => {
          const layoutType = chunkIdx % 3;
          return (
            <BentoChunk
              key={chunkIdx}
              chunk={chunk}
              layoutType={layoutType}
              chunkIndex={chunkIdx}
              onOpen={item => onOpen(globalIndex(item))}
            />
          );
        })}
      </div>
    </section>
  );
}

function BentoChunk({
  chunk,
  layoutType,
  chunkIndex,
  onOpen,
}: {
  chunk: GalleryItem[];
  layoutType: number;
  chunkIndex: number;
  onOpen: (item: GalleryItem) => void;
}) {
  const delay = (chunkIndex % 3) * 0.1;

  // Layout 2: video interlude
  if (layoutType === 2) {
    const videoItem = chunk.find(i => i.isVideo) || chunk[0];
    const photoItems = chunk.filter(i => !i.isVideo && i.id !== videoItem.id).slice(0, 4);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: delay * 0.5 }}
        className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4"
      >
        {/* Left 2 photos stacked */}
        <div className="flex flex-col gap-4">
          {photoItems.slice(0, 2).map((item, i) => (
            <ThreeDTiltCard
              key={item.id}
              className="rounded-2xl h-[240px]"
              onClick={() => onOpen(item)}
            >
              <img src={item.src} alt={item.alt} className="w-full h-full object-contain" loading="lazy" />
              <BentoOverlay item={item} index={i} />
            </ThreeDTiltCard>
          ))}
        </div>
        {/* Center: video */}
        <ThreeDTiltCard
          className="rounded-2xl h-[500px]"
          onClick={() => onOpen(videoItem)}
        >
          {videoItem.isVideo ? (
            <AutoVideo src={videoItem.src} className="w-full h-full object-cover" />
          ) : (
            <img src={videoItem.src} alt={videoItem.alt} className="w-full h-full object-contain" loading="lazy" />
          )}
          <BentoOverlay item={videoItem} index={0} big />
        </ThreeDTiltCard>
        {/* Right 2 photos stacked */}
        <div className="flex flex-col gap-4">
          {photoItems.slice(2, 4).map((item, i) => (
            <ThreeDTiltCard
              key={item.id}
              className="rounded-2xl h-[240px]"
              onClick={() => onOpen(item)}
            >
              <img src={item.src} alt={item.alt} className="w-full h-full object-contain" loading="lazy" />
              <BentoOverlay item={item} index={i + 2} />
            </ThreeDTiltCard>
          ))}
        </div>
      </motion.div>
    );
  }

  // Layout 0: cover left + scatter right
  if (layoutType === 0) {
    const [cover, ...rest] = chunk;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: delay * 0.5 }}
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4"
      >
        {/* Cover: tall left */}
        <ThreeDTiltCard
          className="rounded-3xl h-[540px]"
          onClick={() => onOpen(cover)}
        >
          <img src={cover.src} alt={cover.alt} className="w-full h-full object-contain" loading="lazy" />
          <BentoOverlay item={cover} index={0} big />
        </ThreeDTiltCard>
        {/* Right scatter: 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          {rest.slice(0, 4).map((item, i) => (
            <ThreeDTiltCard
              key={item.id}
              className="rounded-2xl h-[260px]"
              onClick={() => onOpen(item)}
            >
              <img src={item.src} alt={item.alt} className="w-full h-full object-contain" loading="lazy" />
              <BentoOverlay item={item} index={i + 1} />
            </ThreeDTiltCard>
          ))}
        </div>
      </motion.div>
    );
  }

  // Layout 1: scatter left + cover right
  const [...scatter] = chunk.slice(0, 4);
  const cover2 = chunk[4] || chunk[chunk.length - 1];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay }}
      className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4"
    >
      {/* Left scatter 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {scatter.map((item, i) => (
          <ThreeDTiltCard
            key={item.id}
            className="rounded-2xl h-[260px]"
            onClick={() => onOpen(item)}
          >
            <img src={item.src} alt={item.alt} className="w-full h-full object-contain" loading="lazy" />
            <BentoOverlay item={item} index={i} />
          </ThreeDTiltCard>
        ))}
      </div>
      {/* Cover: tall right */}
      <ThreeDTiltCard
        className="rounded-3xl h-[540px]"
        onClick={() => onOpen(cover2)}
      >
        <img src={cover2.src} alt={cover2.alt} className="w-full h-full object-contain" loading="lazy" />
        <BentoOverlay item={cover2} index={4} big />
      </ThreeDTiltCard>
    </motion.div>
  );
}

function BentoOverlay({ item, index, big = false }: { item: GalleryItem; index: number; big?: boolean }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="text-[#D8B36A] text-[10px] font-mono tracking-[0.3em]">
          {String(index + 1).padStart(3, '0')}
        </span>
        {big && (
          <p className="text-white/80 text-xs mt-0.5 font-light">{item.caption}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AREA 3 – APPLE EDITORIAL EXHIBITION
// ─────────────────────────────────────────────
function AppleEditorialExhibition({
  items,
  onOpen,
}: {
  items: GalleryItem[];
  onOpen: (globalIndex: number) => void;
}) {
  const filmStripItems = items.slice(0, 18);
  const editorialItems = items.slice(18);

  // Group editorial into groups of 5
  const editorialGroups: GalleryItem[][] = [];
  for (let i = 0; i < editorialItems.length; i += 5) {
    editorialGroups.push(editorialItems.slice(i, i + 5));
  }

  const globalIdx = useCallback(
    (item: GalleryItem) => items.findIndex(it => it.id === item.id),
    [items]
  );

  return (
    <section
      id="wave-reel-section"
      className="gallery-section-bg w-full"
    >
      {/* Flowing light orbs */}
      <div className="orb-1" style={{ top: '20%', right: '-5%' }} />
      <div className="orb-2" style={{ top: '60%', left: '10%' }} />
      {/* ── Hero Text ── */}
      <div className="relative z-10 py-32 px-6 md:px-16 text-center overflow-hidden">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="block text-[10px] font-mono uppercase tracking-[0.6em] text-[#D8B36A] mb-8"
        >
          Exhibition — Vol. II
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-9xl font-serif font-light tracking-tight text-white leading-[1.05] mb-8"
        >
          Captured
          <br />
          <span className="shimmer-text">in Light.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-white/50 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed"
        >
          A curated editorial journey through moments of intimacy, light, and eternal love.
        </motion.p>
      </div>

      {/* ── Film Strip ── */}
      <div className="pb-20 relative z-10">
        <div
          className="flex gap-4 px-8 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {filmStripItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="relative shrink-0 w-[260px] h-[340px] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => onOpen(globalIdx(item))}
              whileHover={{ scale: 1.04, transition: { duration: 0.3 } }}
            >
              {item.isVideo ? (
                <AutoVideo src={item.src} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              {/* Gradient + counter on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                <span className="text-[#D8B36A] text-[11px] font-mono tracking-[0.3em]">
                  {String(i + 1).padStart(3, '0')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Editorial Rows ── */}
      <div className="flex flex-col gap-8 px-4 md:px-10 lg:px-16 pb-24 max-w-[1400px] mx-auto relative z-10">
        {editorialGroups.map((group, groupIdx) => (
          <EditorialRow
            key={groupIdx}
            group={group}
            rowType={groupIdx % 4}
            groupIndex={groupIdx}
            onOpen={item => onOpen(globalIdx(item))}
          />
        ))}
      </div>

      {/* ── Closing Quote ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center py-28 px-8 border-t border-[#D8B36A]/15 relative z-10"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-[#D8B36A]/60 text-6xl font-serif mb-4 leading-none">"</div>
          <blockquote className="font-serif italic text-white/45 text-lg md:text-xl leading-relaxed mb-8">
            Photography is not like painting. There is a creative fraction of a second when you are taking a picture. Your eye must see a composition or an expression that life itself offers you, and you must know with intuition when to click the camera.
          </blockquote>
          <cite className="text-[#D8B36A]/70 text-[11px] font-mono uppercase tracking-[0.4em]">
            — Roland Barthes, Camera Lucida
          </cite>
        </div>
      </motion.div>
    </section>
  );
}

function EditorialRow({
  group,
  rowType,
  groupIndex,
  onOpen,
}: {
  group: GalleryItem[];
  rowType: number;
  groupIndex: number;
  onOpen: (item: GalleryItem) => void;
}) {
  const delay = (groupIndex % 4) * 0.1;

  // Type 0: grid-cols-[2fr_1fr] — big left 640px + 2 smalls right 310px each
  if (rowType === 0) {
    const [bigLeft, small1, small2, ...rest] = group;
    const extras = rest.slice(0, 2);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: delay * 0.5 }}
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5"
      >
        {/* Big left */}
        <EditorialCard item={bigLeft} height="h-[640px]" onOpen={onOpen} index={0} />
        {/* Right column: 2 stacked */}
        <div className="flex flex-col gap-5">
          {[small1, small2, ...extras].filter(Boolean).slice(0, 2).map((item, i) => (
            <EditorialCard key={item.id} item={item} height="h-[310px]" onOpen={onOpen} index={i + 1} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Type 1: full-bleed hero 75vh with bold caption overlay
  if (rowType === 1) {
    const heroItem = group[0];
    const restItems = group.slice(1, 3);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: delay * 0.5 }}
        className="flex flex-col gap-5"
      >
        {/* Hero */}
        <div
          className="relative w-full overflow-hidden rounded-3xl cursor-pointer group"
          style={{ height: '75vh' }}
          onClick={() => onOpen(heroItem)}
        >
          <img
            src={heroItem.src}
            alt={heroItem.alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-10">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className="text-white text-4xl md:text-5xl font-serif font-light leading-tight mb-3"
            >
              {heroItem.caption}
            </motion.h3>
            <span className="text-[#D8B36A] text-[10px] font-mono tracking-[0.4em] uppercase">
              {heroItem.category}
            </span>
          </div>
          {/* Gold counter on hover */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-[#D8B36A] text-[10px] font-mono tracking-[0.3em]">
                {String(heroItem.id).slice(-3).padStart(3, '0')}
              </span>
            </div>
          </div>
        </div>
        {/* 2 supporting cards below */}
        {restItems.length > 0 && (
          <div className="grid grid-cols-2 gap-5">
            {restItems.map((item, i) => (
              <EditorialCard key={item.id} item={item} height="h-[360px]" onOpen={onOpen} index={i + 1} />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // Type 2: grid-cols-3, middle card translated up 40px
  if (rowType === 2) {
    const [a, b, c, d, e] = group;
    const topRow = [a, b, c].filter(Boolean);
    const bottomRow = [d, e].filter(Boolean);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: delay * 0.5 }}
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          {topRow.map((item, i) => (
            <div key={item.id} style={{ transform: i === 1 ? 'translateY(-40px)' : 'none' }}>
              <EditorialCard item={item} height="h-[400px]" onOpen={onOpen} index={i} />
            </div>
          ))}
        </div>
        {bottomRow.length > 0 && (
          <div className={`grid gap-5 ${bottomRow.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {bottomRow.map((item, i) => (
              <EditorialCard key={item.id} item={item} height="h-[300px]" onOpen={onOpen} index={i + 3} />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // Type 3: grid-cols-[1fr_2fr] — 2 smalls left + big right
  const [small1, small2, bigRight, ...extra] = group;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay }}
      className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5"
    >
      {/* Left column: 2 stacked */}
      <div className="flex flex-col gap-5">
        {[small1, small2].filter(Boolean).map((item, i) => (
          <EditorialCard key={item.id} item={item} height="h-[310px]" onOpen={onOpen} index={i} />
        ))}
      </div>
      {/* Big right */}
      {bigRight && (
        <EditorialCard item={bigRight} height="h-[640px]" onOpen={onOpen} index={2} />
      )}
      {/* Extra items if any */}
      {extra.length > 0 && (
        <div className="md:col-span-2 grid grid-cols-2 gap-5">
          {extra.map((item, i) => (
            <EditorialCard key={item.id} item={item} height="h-[300px]" onOpen={onOpen} index={i + 3} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function EditorialCard({
  item,
  height,
  onOpen,
  index,
}: {
  item: GalleryItem;
  height: string;
  onOpen: (item: GalleryItem) => void;
  index: number;
}) {
  return (
    <div
      className={`relative ${height} rounded-3xl overflow-hidden cursor-pointer group`}
      onClick={() => onOpen(item)}
    >
      {item.isVideo ? (
        <AutoVideo
          src={item.src}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      )}
      {/* Gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Gold counter on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
        <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span className="text-[#D8B36A] text-[10px] font-mono">{String(index + 1).padStart(3, '0')}</span>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <p className="text-white/80 text-xs font-light">{item.caption}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AREA 4 – MASONRY GALLERY WALL
// ─────────────────────────────────────────────
// Layout pattern: alternating large/small cells
// col/row spans: [2,2], [1,1], [1,2], [1,1], [1,1], [2,1] ...
const MASONRY_SPANS = [
  { col: 2, row: 2 }, // big square
  { col: 1, row: 1 },
  { col: 1, row: 2 }, // tall
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 }, // wide
  { col: 1, row: 1 },
  { col: 1, row: 2 }, // tall
  { col: 2, row: 1 }, // wide
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 2 }, // big
];

function MasonryGallery({
  items,
  onOpen,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
}) {
  const galleryItems = items.slice(0, 24);

  return (
    <section className="gallery-section-bg w-full py-24 px-4 md:px-10">
      {/* Flowing light orbs */}
      <div className="orb-1" style={{ top: '5%', left: '20%' }} />
      <div className="orb-2" style={{ bottom: '15%', right: '15%' }} />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 max-w-3xl mx-auto relative z-10"
      >
        <motion.span
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.6em' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-[10px] font-mono uppercase text-[#D8B36A]/80 block mb-5"
        >
          Gallery — Vol. IV
        </motion.span>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-extralight text-white leading-[1.05] tracking-tight mb-5">
          Mỗi khoảnh khắc{' '}
          <br />
          <span className="italic text-[#D8B36A]">là một tác phẩm.</span>
        </h2>
        <p className="text-white/35 text-sm font-light tracking-widest">
          Bộ sưu tập nghệ thuật — curated by níha studio
        </p>
      </motion.div>

      {/* Masonry Grid */}
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: '200px',
          }}
        >
          {galleryItems.map((item, i) => {
            const span = MASONRY_SPANS[i % MASONRY_SPANS.length];
            const globalIdx = items.findIndex(it => it.id === item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
                className="relative group cursor-pointer overflow-hidden rounded-xl"
                style={{
                  gridColumn: `span ${Math.min(span.col, 4)}`,
                  gridRow: `span ${span.row}`,
                }}
                onClick={() => onOpen(globalIdx)}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                {/* Media */}
                {item.isVideo ? (
                  <AutoVideo src={item.src} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />

                {/* Gold hover tint */}
                <div className="absolute inset-0 group-hover:bg-[#D8B36A]/8 transition-all duration-500" />

                {/* Gold border on hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-[#D8B36A]/40 rounded-xl transition-all duration-500 pointer-events-none" />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                  <span className="text-[#D8B36A] text-[9px] font-mono tracking-[0.4em] uppercase block mb-1">
                    {String(i + 1).padStart(3, '0')}
                  </span>
                  <p className="text-white/80 text-xs font-light truncate">{item.caption}</p>
                </div>

                {/* Expand icon */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/80 text-xs">
                  ⤢
                </div>

                {/* Video badge */}
                {item.isVideo && (
                  <div className="absolute top-3 left-3 bg-[#D8B36A] text-black text-[8px] font-mono px-2 py-0.5 rounded-full tracking-widest uppercase">
                    ▶ Video
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="max-w-[200px] mx-auto mt-20 h-px bg-gradient-to-r from-transparent via-[#D8B36A]/50 to-transparent"
      />
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-center text-white/20 text-[10px] font-mono uppercase tracking-[0.5em] mt-6"
      >
        níha · photography studio
      </motion.p>
    </section>
  );
}

// ─────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────
function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch/swipe
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const item = items[index];
  const total = items.length;

  const goNext = useCallback(() => {
    setZoom(1);
    setDragOffset({ x: 0, y: 0 });
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  const goPrev = useCallback(() => {
    setZoom(1);
    setDragOffset({ x: 0, y: 0 });
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  const zoomIn = () => setZoom(z => Math.min(z + 0.5, 5));
  const zoomOut = () => { setZoom(z => Math.max(z - 0.5, 1)); if (zoom <= 1.5) setDragOffset({ x: 0, y: 0 }); };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = item.src;
    a.download = item.caption || 'photo';
    a.click();
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  // Drag for zoom pan
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setIsDragging(false);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  if (!item) return null;

  return (
    <motion.div
      ref={containerRef}
      key="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 999999, backgroundColor: 'rgba(5, 5, 5, 0.98)', backdropFilter: 'blur(20px)' }}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[#D8B36A] text-[11px] font-mono tracking-[0.3em]">
              {String(index + 1).padStart(3, '0')} / {String(total).padStart(3, '0')}
            </span>
            <span className="text-white/40 text-xs font-light">{item.caption}</span>
          </div>
          <div className="flex items-center gap-2">
            <LightboxBtn onClick={zoomOut} title="Zoom out" disabled={zoom <= 1}>−</LightboxBtn>
            <span className="text-white/50 text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <LightboxBtn onClick={zoomIn} title="Zoom in" disabled={zoom >= 5}>+</LightboxBtn>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <LightboxBtn onClick={handleDownload} title="Download">↓</LightboxBtn>
            <LightboxBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? '⊡' : '⊞'}
            </LightboxBtn>
            <LightboxBtn onClick={onClose} title="Close" accent>✕</LightboxBtn>
          </div>
        </div>

        {/* Media area */}
        <div
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          onMouseDown={onMouseDown}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`lb-${index}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                transform: `scale(${zoom}) translate(${dragOffset.x / zoom}px, ${dragOffset.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="max-w-[90vw] max-h-[80vh] select-none"
            >
              {item.isVideo ? (
                <video
                  src={getCacheBustedSrc(item.src)}
                  preload="auto"
                  className="max-w-[90vw] max-h-[80vh] rounded-xl"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain select-none"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Arrow Left */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/80 hover:text-[#D8B36A] hover:border-[#D8B36A]/50 flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous"
          >
            ←
          </button>
          {/* Arrow Right */}
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/80 hover:text-[#D8B36A] hover:border-[#D8B36A]/50 flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next"
          >
            →
          </button>
        </div>

        {/* Bottom filmstrip thumbnails */}
        <div className="shrink-0 px-4 py-3 bg-black/50 backdrop-blur-sm border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto scrollbar-none justify-center" style={{ scrollbarWidth: 'none' }}>
            {items.slice(Math.max(0, index - 5), Math.min(total, index + 6)).map((thumb, i) => {
              const thumbIdx = Math.max(0, index - 5) + i;
              return (
                <button
                  key={thumb.id}
                  onClick={() => { setZoom(1); setDragOffset({ x: 0, y: 0 }); onNavigate(thumbIdx); }}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-300 border ${
                    thumbIdx === index
                      ? 'border-[#D8B36A] scale-110 shadow-[0_0_12px_rgba(216,179,106,0.5)]'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  {thumb.isVideo ? (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/40 text-lg">▶</div>
                  ) : (
                    <img src={thumb.src} alt={thumb.alt} className="w-full h-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
  );
}

function LightboxBtn({
  onClick,
  title,
  children,
  disabled,
  accent,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all duration-200 ${
        accent
          ? 'border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400'
          : disabled
          ? 'border-white/10 text-white/20 cursor-not-allowed'
          : 'border-white/15 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// ALBUMS TAB
// ─────────────────────────────────────────────
function AlbumsTab({ items }: { items: GalleryItem[] }) {
  const [albums, setAlbums] = useState<DBAlbum[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    getAllAlbums().then(setAlbums).catch(console.error);
  }, []);

  const createAlbum = async () => {
    if (!newTitle.trim()) return;
    const album: DBAlbum = {
      id: `album-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      isPublic: !newPassword,
      password: newPassword || undefined,
      photoIds: [],
      coverId: items[0]?.id,
    };
    await saveAlbum(album);
    setAlbums(prev => [...prev, album]);
    setCreating(false);
    setNewTitle('');
    setNewDesc('');
    setNewPassword('');
  };

  const removeAlbum = async (id: string) => {
    await deleteAlbum(id);
    setAlbums(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="w-full py-16 px-6 md:px-12 bg-[#fdfdfd]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#D8B36A]/70 block mb-2">Collections</span>
            <h2 className="text-3xl font-serif font-light text-white">Albums</h2>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="px-5 py-2.5 bg-[#D8B36A] text-black text-xs font-mono uppercase tracking-widest rounded-full hover:bg-[#e8c97a] transition-colors duration-300"
          >
            + New Album
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
            >
              <h3 className="text-white/80 text-sm font-mono mb-4 uppercase tracking-widest">Create New Album</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Album title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm placeholder-white/30 focus:outline-none focus:border-[#D8B36A]/50 transition-colors"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm placeholder-white/30 focus:outline-none focus:border-[#D8B36A]/50 transition-colors resize-none"
                />
                <input
                  type="password"
                  placeholder="Password (leave blank for public)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm placeholder-white/30 focus:outline-none focus:border-[#D8B36A]/50 transition-colors"
                />
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={createAlbum}
                    className="px-5 py-2 bg-[#D8B36A] text-black text-xs font-mono uppercase tracking-widest rounded-full hover:bg-[#e8c97a] transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setCreating(false)}
                    className="px-5 py-2 border border-white/20 text-white/60 text-xs font-mono uppercase tracking-widest rounded-full hover:border-white/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {albums.length === 0 ? (
          <div className="text-center py-24 text-white/30 font-light">
            <div className="text-5xl mb-4 opacity-20">◻</div>
            <p className="text-sm">No albums yet. Create your first collection.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {albums.map(album => {
              const cover = album.coverId ? items.find(it => it.id === album.coverId) : items[0];
              return (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-[#D8B36A]/40 transition-all duration-500 cursor-pointer" style={{ transform: `rotate(${(Math.random()*4-2)}deg)` }}
                >
                  <div className="h-52 overflow-hidden">
                    {cover && (
                      <img src={cover.src} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    {!cover && <div className="w-full h-full bg-neutral-900" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-serif text-lg mb-1">{album.title}</h3>
                        <p className="text-white/50 text-xs">{album.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${album.isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {album.isPublic ? 'Public' : 'Private'}
                          </span>
                          <span className="text-white/30 text-[9px] font-mono">{album.photoIds.length} photos</span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeAlbum(album.id); }}
                        className="text-white/30 hover:text-red-400 transition-colors text-sm p-1"
                        title="Delete album"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// UPLOAD TAB
// ─────────────────────────────────────────────
function UploadTab({ onUploaded }: { onUploaded: (items: GalleryItem[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<GalleryItem[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setUploading(true);
    setProgress(0);

    const newItems: GalleryItem[] = [];
    const dbPhotos: { id: string; src: string; alt: string; caption: string; width: number; height: number; isVideo: boolean }[] = [];

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      const isVideo = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      const id = `upload-${Date.now()}-${i}`;
      const item: GalleryItem = {
        id,
        src: url,
        alt: file.name,
        caption: file.name.replace(/\.[^.]+$/, ''),
        isVideo,
        category: 'Portraits',
      };
      newItems.push(item);

      // Save to IndexedDB as base64
      const reader = new FileReader();
      await new Promise<void>(resolve => {
        reader.onload = () => {
          dbPhotos.push({
            id,
            src: reader.result as string,
            alt: file.name,
            caption: file.name.replace(/\.[^.]+$/, ''),
            width: 3,
            height: 4,
            isVideo,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });

      setProgress(Math.round(((i + 1) / fileArr.length) * 100));
    }

    await savePhotosBulk(dbPhotos);
    setUploaded(prev => [...prev, ...newItems]);
    onUploaded(newItems);
    setUploading(false);
  }, [onUploaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  return (
    <div className="w-full py-16 px-6 md:px-12 bg-[#fdfdfd]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#D8B36A]/70 block mb-3">Add to Collection</span>
          <h2 className="text-3xl font-serif font-light text-white">Upload Media</h2>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 ${
            dragging
              ? 'border-[#D8B36A] bg-[#D8B36A]/5 scale-[1.01]'
              : 'border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={e => e.target.files && processFiles(e.target.files)}
          />
          <div className={`text-5xl mb-5 transition-all duration-500 ${dragging ? 'scale-125 text-[#D8B36A]' : 'text-white/20'}`}>
            ↑
          </div>
          <p className="text-white/60 text-base font-light mb-2">
            {dragging ? 'Drop files here' : 'Drag & drop photos or videos'}
          </p>
          <p className="text-white/30 text-sm">or click to browse — JPEG, PNG, MP4, MOV supported</p>

          {/* Progress bar */}
          {uploading && (
            <div className="mt-8">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#D8B36A] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[#D8B36A] text-xs font-mono mt-2">{progress}% uploading…</p>
            </div>
          )}
        </div>

        {/* Uploaded preview */}
        {uploaded.length > 0 && (
          <div className="mt-10">
            <h3 className="text-white/60 text-xs font-mono uppercase tracking-widest mb-4">
              Uploaded — {uploaded.length} item{uploaded.length !== 1 ? 's' : ''}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {uploaded.map(item => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden border border-white/10">
                  {item.isVideo ? (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white/30">▶</div>
                  ) : (
                    <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED LINKS TAB
// ─────────────────────────────────────────────
function SharedLinksTab({ items }: { items: GalleryItem[] }) {
  const [links, setLinks] = useState<{ id: string; url: string; label: string; created: string; expires?: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateLink = () => {
    const id = `link-${Date.now()}`;
    const randomItems = items
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 12)
      .map(i => i.id)
      .join(',');
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/shared?ids=${randomItems}&token=${id}`;
    const label = `Gallery Share ${new Date().toLocaleDateString()}`;
    const created = new Date().toISOString();
    setLinks(prev => [...prev, { id, url, label, created }]);
  };

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id));

  return (
    <div className="w-full py-16 px-6 md:px-12 bg-[#060606]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#D8B36A]/70 block mb-2">Sharing</span>
            <h2 className="text-3xl font-serif font-light text-white">Shared Links</h2>
          </div>
          <button
            onClick={generateLink}
            className="px-5 py-2.5 bg-[#D8B36A] text-black text-xs font-mono uppercase tracking-widest rounded-full hover:bg-[#e8c97a] transition-colors duration-300"
          >
            + Generate Link
          </button>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-24 text-white/30 font-light">
            <div className="text-5xl mb-4 opacity-20">⌁</div>
            <p className="text-sm">No shared links yet. Generate one to share your gallery.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {links.map(link => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-light mb-1">{link.label}</p>
                  <p className="text-white/30 text-xs font-mono truncate">{link.url}</p>
                  <p className="text-white/20 text-[10px] font-mono mt-1">
                    Created: {new Date(link.created).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyLink(link.id, link.url)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all duration-300 border ${
                      copiedId === link.id
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'border-white/15 text-white/50 hover:border-white/40 hover:text-white/80'
                    }`}
                  >
                    {copiedId === link.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all duration-200 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
type TabType = 'photos' | 'albums' | 'upload' | 'shared';

export default function AllMediaGallery({
  pages = [],
  onMediaClick,
}: {
  pages?: any[];
  onMediaClick?: (id: number) => void;
} = {}) {
  const [activeTab, setActiveTab] = useState<TabType>('photos');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, index: 0 });
  const [loading, setLoading] = useState(true);

  // ── Load from IndexedDB or seed from static ──
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const dbPhotos = await getAllPhotos();
        if (dbPhotos.length >= 10) {
          // Use IndexedDB data, slice to 188
          const galleryItems: GalleryItem[] = dbPhotos.slice(0, MAX_ITEMS).map(p => {
            let correctSrc = p.src;
            if (correctSrc && !correctSrc.startsWith('/photos/') && !correctSrc.startsWith('data:') && !correctSrc.startsWith('blob:')) {
              correctSrc = `/photos/${correctSrc}`;
            }
            return {
              id: p.id,
              src: correctSrc,
              alt: p.alt,
              caption: p.caption,
              isVideo: p.isVideo ?? false,
              category: 'Portraits',
            };
          });
          if (mounted) { setItems(galleryItems); setLoading(false); }
        } else {
          // Seed from static data
          const staticItems = buildStaticItems();
          // Save to IndexedDB
          const toSave = staticItems.map(item => ({
            id: item.id,
            src: item.src,
            alt: item.alt,
            caption: item.caption,
            width: 3,
            height: 4,
            isVideo: item.isVideo ?? false,
          }));
          await savePhotosBulk(toSave);
          if (mounted) { setItems(staticItems); setLoading(false); }
        }
      } catch {
        // Fallback: use static data without DB
        const staticItems = buildStaticItems();
        if (mounted) { setItems(staticItems); setLoading(false); }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const openLightbox = useCallback((index: number) => {
    const item = items[index];
    if (item && onMediaClick && pages && pages.length > 0) {
      const getFileName = (url: string) => {
        if (!url) return '';
        const cleanUrl = url.split('?')[0].split('#')[0];
        const parts = cleanUrl.split('/');
        return parts[parts.length - 1].toLowerCase();
      };

      const itemFile = getFileName(item.src);

      if (item.isVideo) {
        // Find page by video filename match
        const pageIdx = pages.findIndex(p => p.layout === 'video' && getFileName(p.videos?.[0]) === itemFile);
        if (pageIdx !== -1) {
          onMediaClick(-pages[pageIdx].pageNumber);
          return;
        }
      } else {
        // Try matching by parsing numerical ID
        const numId = Number(item.id.replace(/[^\d]/g, ''));
        if (!isNaN(numId) && numId > 0) {
          const pageIdx = pages.findIndex(p => p.photos?.[0]?.id === numId);
          if (pageIdx !== -1) {
            onMediaClick(numId);
            return;
          }
        }

        // Fallback: match by photo filename
        const pageIdx = pages.findIndex(p => getFileName(p.photos?.[0]?.src) === itemFile);
        if (pageIdx !== -1) {
          const photoId = pages[pageIdx].photos?.[0]?.id;
          if (photoId !== undefined) {
            onMediaClick(Number(photoId));
            return;
          }
        }
      }
    }
    // Fallback: local lightbox
    setLightbox({ open: true, index });
  }, [items, onMediaClick, pages]);

  const closeLightbox = useCallback(() => {
    setLightbox({ open: false, index: 0 });
  }, []);

  const navigateLightbox = useCallback((newIndex: number) => {
    setLightbox(prev => ({ ...prev, index: newIndex }));
  }, []);

  const handleUploaded = useCallback((newItems: GalleryItem[]) => {
    setItems(prev => {
      const combined = [...prev, ...newItems];
      return combined.slice(0, MAX_ITEMS);
    });
  }, []);

  const TABS: { id: TabType; label: string }[] = [
    { id: 'photos', label: 'Photos' },
    { id: 'albums', label: 'Albums' },
    { id: 'upload', label: 'Upload' },
    { id: 'shared', label: 'Shared Links' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#050505]">
      {/* ── Tab Navigation ── */}
      <div className="sticky top-0 z-50 w-full bg-[#050505]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 h-14">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-300 rounded-lg ${
                activeTab === tab.id
                  ? 'text-[#D8B36A]'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-[#D8B36A]/10 border border-[#D8B36A]/20 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white/20 text-[10px] font-mono">{items.length} items</span>
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#D8B36A]/30 border-t-[#D8B36A] rounded-full animate-spin" />
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Loading gallery…</span>
          </div>
        </div>
      )}

      {/* ── Tab Content ── */}
      {!loading && (
        <AnimatePresence mode="wait">
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Area 1: 3D Cinematic Showcase */}
              {items.length > 0 && (
                <CinematicShowcase items={items} onOpen={openLightbox} />
              )}

              {/* Area 2: Bento Grid */}
              {items.length > 0 && (
                <BentoGrid items={items} onOpen={openLightbox} />
              )}

              {/* Area 3: Apple Editorial Exhibition */}
              {items.length > 0 && (
                <AppleEditorialExhibition items={items} onOpen={openLightbox} />
              )}

              {/* Area 4: Masonry Gallery Wall */}
              {items.length > 0 && (
                <MasonryGallery items={items} onOpen={openLightbox} />
              )}
            </motion.div>
          )}

          {activeTab === 'albums' && (
            <motion.div
              key="albums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AlbumsTab items={items} />
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <UploadTab onUploaded={handleUploaded} />
            </motion.div>
          )}

          {activeTab === 'shared' && (
            <motion.div
              key="shared"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SharedLinksTab items={items} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox.open && items.length > 0 && (
          <Lightbox
            items={items}
            index={lightbox.index}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
