'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/easings';
import { COUPLE_NAMES } from '@/lib/photos';

const WEATHER = [
  { id: 'off',       label: 'None',      icon: '—'  },
  { id: 'fireflies', label: 'Fireflies', icon: '✦'  },
  { id: 'petals',    label: 'Blossoms',  icon: '🌸' },
  { id: 'snow',      label: 'Snow',      icon: '❄'  },
  { id: 'leaves',    label: 'Autumn',    icon: '🍂' },
  { id: 'rain',      label: 'Rain',      icon: '🌧' },
] as const;

type WeatherId = typeof WEATHER[number]['id'];

interface HUDProps {
  currentPage?: number;
  total?:       number;
  isOpen?:      boolean;
  weather:     WeatherId;
  onGoTo?:      (i: number) => void;
  onNext?:      () => void;
  onPrev?:      () => void;
  onWeather:   (w: string) => void;
}

export default function HUD({ currentPage, total, isOpen, weather, onGoTo, onNext, onPrev, onWeather }: HUDProps) {
  const [weatherOpen, setWeatherOpen] = useState(false);

  const progress = (currentPage !== undefined && total !== undefined) 
    ? ((currentPage + (isOpen ? 1 : 0)) / total) * 100 
    : 0;

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isOpen || !onGoTo || total === undefined) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    onGoTo(Math.round(pct * (total - 1)));
  }, [total, onGoTo, isOpen]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-8 md:p-12">
      
      {/* ── TOP BAR ── */}
      <header className="flex justify-between items-start">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE.luxury }}
          className="flex flex-col gap-1 drop-shadow-xl"
        >
          <h1 className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase text-[#F8F4EE]">
            {COUPLE_NAMES.combined}
          </h1>
          <p className="text-xs tracking-[0.4em] text-white/60">THE WEDDING ALBUM</p>
        </motion.div>

        {/* ── TOP RIGHT: Weather Toggle ── */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <AnimatePresence>
            {weatherOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-2 bg-black/40 backdrop-blur-xl px-3 py-2 rounded-full border border-white/10"
              >
                {WEATHER.map(w => (
                  <button
                    key={w.id}
                    onClick={() => { onWeather(w.id); setWeatherOpen(false); }}
                    className={`text-sm w-8 h-8 rounded-full transition-colors flex items-center justify-center ${
                      weather === w.id ? 'bg-white/90 text-black' : 'text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                    title={w.label}
                  >
                    {w.icon}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className={`w-12 h-12 rounded-full border border-white/10 backdrop-blur-xl transition-all flex items-center justify-center text-lg ${
              weatherOpen ? 'bg-white/20 text-white' : 'bg-black/30 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
            onClick={() => setWeatherOpen(!weatherOpen)}
            title="Atmosphere"
          >
            ✦
          </button>
        </div>
      </header>

      {/* ── BOOK NAVIGATION ── */}
      {isOpen !== undefined && total !== undefined && currentPage !== undefined && (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
          
          {/* Pagination Info */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="text-xs font-mono tracking-[0.3em] text-white/50 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/5"
          >
            {String(currentPage).padStart(3, '0')} — {String(total).padStart(3, '0')}
          </motion.div>

          {/* Progress Bar & Buttons */}
          <div className="flex items-center w-full gap-6">
            
            <button 
              onClick={onPrev} 
              disabled={!isOpen}
              className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-black/30"
            >
              ←
            </button>

            <div 
              className={`flex-1 h-1.5 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/5 transition-opacity duration-1000 ${isOpen ? 'opacity-100 pointer-events-auto cursor-pointer' : 'opacity-30 pointer-events-none'}`}
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: EASE.luxury, duration: 1.2 }}
              />
            </div>

            <button 
              onClick={onNext} 
              disabled={currentPage >= total - 1}
              className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-black/30"
            >
              →
            </button>
            
          </div>
        </div>
      )}
      
    </div>
  );
}
