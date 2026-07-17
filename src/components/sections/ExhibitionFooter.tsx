'use client';

import { motion } from 'framer-motion';

export default function ExhibitionFooter() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-20 bg-[#050505] overflow-hidden border-t border-white/5 select-none">
      
      {/* Decorative background gradients */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D8B36A] opacity-[0.03] blur-[120px] rounded-t-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
        
        {/* Logo and Copyright Info */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <h3 className="font-serif text-lg tracking-[0.25em] text-[#D8B36A] uppercase">
            Níha
          </h3>
          <p className="text-[10px] font-mono tracking-wider text-white/40 uppercase">
            © 2026 Digital Exhibition. Designed with ❤️
          </p>
        </div>

        {/* Back to top scroll button */}
        <motion.button
          onClick={handleScrollToTop}
          whileHover={{ scale: 1.05, y: -4 }}
          className="px-6 py-2.5 rounded-full border border-white/10 hover:border-[#D8B36A] text-[10px] font-mono tracking-widest uppercase text-[#F8F8F8] hover:text-[#D8B36A] transition-all cursor-pointer bg-white/[0.02]"
          data-cursor="ENTER"
        >
          Back to Top ↑
        </motion.button>

        {/* Outer Social Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono tracking-widest text-white/50 hover:text-[#D8B36A] transition-colors"
          >
            Instagram
          </a>
          <a
            href="#"
            className="text-xs font-mono tracking-widest text-white/50 hover:text-[#D8B36A] transition-colors"
          >
            Download QR
          </a>
        </div>

      </div>
    </footer>
  );
}
