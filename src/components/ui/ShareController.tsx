'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShareController() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({
        title: 'Níha Share - Cinematic Exhibition',
        text: 'Walk through this luxury digital photography exhibition.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[100] pointer-events-auto flex flex-col items-end gap-3 select-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-black/85 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[200px]"
          >
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#D8B36A] opacity-60">
              Share Exhibition
            </span>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyLink}
                className="text-left text-xs px-3 py-2 rounded-lg font-mono hover:bg-white/5 text-white/70 hover:text-white border border-transparent transition-all cursor-pointer flex items-center justify-between"
              >
                <span>{copied ? 'Copied! ✓' : 'Copy Link'}</span>
                <span className="text-xs">🔗</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="text-left text-xs px-3 py-2 rounded-lg font-mono hover:bg-white/5 text-white/70 hover:text-white border border-transparent transition-all cursor-pointer flex items-center justify-between"
              >
                <span>System Share</span>
                <span className="text-xs">📤</span>
              </button>

              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-left text-xs px-3 py-2 rounded-lg font-mono hover:bg-white/5 text-white/70 hover:text-white border border-transparent transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Get QR Code</span>
                <span className="text-xs">📱</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#D8B36A] shadow-2xl flex items-center justify-center text-white/80 hover:text-[#D8B36A] transition-all cursor-pointer"
        title="Share Collection"
      >
        <span className="text-sm font-serif">✉</span>
      </button>
    </div>
  );
}
