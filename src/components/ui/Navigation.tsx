'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  onScrollToSection: (sectionId: string) => void;
  onShareClick: () => void;
  onMusicToggle: () => void;
  isMusicPlaying: boolean;
}

export default function Navigation({ onScrollToSection, onShareClick, onMusicToggle, isMusicPlaying }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) return; // Keep visible if menu is open
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isOpen]);

  const navItems = [
    { label: 'Top / Intro', target: 'hero' },
    { label: 'Exhibition Gallery', target: 'photo-sharing-gallery' },
    { label: 'Exhibition Chapters', target: 'timeline-section' },
    { label: 'About Nguyễn Thị Hồng', target: 'about-section' },
  ];

  const handleItemClick = (target: string) => {
    setIsOpen(false);
    // Slight delay to allow menu close animation to play out
    setTimeout(() => {
      onScrollToSection(target);
    }, 300);
  };

  return (
    <>
      {/* Floating Hamburger Trigger Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(!isOpen)}
            className="fixed top-8 right-8 z-[110] w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 hover:border-[#D8B36A] flex flex-col items-center justify-center gap-[5px] cursor-pointer shadow-2xl transition-all"
            data-cursor="ENTER"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-5 h-[1.5px] bg-[#F8F8F8] block origin-center rounded-full"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-[1.5px] bg-[#F8F8F8] block rounded-full"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-5 h-[1.5px] bg-[#F8F8F8] block origin-center rounded-full"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-12 md:p-24 select-none"
          >
            {/* Background luxury soft glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D8B36A] opacity-[0.03] blur-[150px] pointer-events-none" />

            {/* Menu Header info */}
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg tracking-[0.25em] text-[#D8B36A] uppercase">
                Níha Share
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
                Exhibition Menu
              </span>
            </div>

            {/* Navigation items list */}
            <div className="flex flex-col gap-6 md:gap-8 items-start my-auto">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleItemClick(item.target)}
                  className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-[#F8F8F8] hover:text-[#D8B36A] tracking-wide transition-all cursor-pointer text-left hover:translate-x-4 duration-500"
                  data-cursor="VIEW"
                >
                  <span className="font-mono text-xs md:text-sm mr-4 md:mr-6 text-[#D8B36A]/50">
                    0{idx + 1}
                  </span>
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Menu Footer controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onShareClick();
                  }}
                  className="text-xs font-mono tracking-widest text-[#F8F8F8] opacity-60 hover:opacity-100 hover:text-[#D8B36A] transition-colors cursor-pointer"
                >
                  Copy Share Link
                </button>
                <button
                  onClick={onMusicToggle}
                  className="text-xs font-mono tracking-widest text-[#F8F8F8] opacity-60 hover:opacity-100 hover:text-[#D8B36A] transition-colors cursor-pointer"
                >
                  Ambience: {isMusicPlaying ? 'On' : 'Off'}
                </button>
              </div>

              <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
                © 2026 Digital Portrait Exhibition
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
