'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRACKS = [
  { id: 'piano', label: 'Ambient Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'rain', label: 'Soft Rain', url: 'https://www.soundjay.com/nature/sounds/rain-07.mp3' },
  { id: 'nature', label: 'Nature Stream', url: 'https://www.soundjay.com/nature/sounds/river-1.mp3' }
];

interface MusicPlayerProps {
  playing: boolean;
  onToggle: () => void;
}

export default function MusicPlayer({ playing, onToggle }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load preference
    const savedTrackIndex = localStorage.getItem('music_track_index');
    const savedMuted = localStorage.getItem('music_muted') === 'true';

    if (savedTrackIndex !== null) {
      setCurrentTrackIndex(parseInt(savedTrackIndex, 10));
    }
    setMuted(savedMuted);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      audioRef.current = new Audio(TRACKS[currentTrackIndex].url);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = TRACKS[currentTrackIndex].url;
    }

    audioRef.current.muted = muted || !playing;

    if (playing && !muted) {
      audioRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentTrackIndex, playing, muted]);

  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
    setMuted(false);
    localStorage.setItem('music_track_index', String(index));
    localStorage.setItem('music_muted', 'false');
  };

  const handleMuteToggle = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    localStorage.setItem('music_muted', String(nextMuted));
    if (nextMuted && playing) {
      onToggle(); // turn off playing state globally
    } else if (!nextMuted && !playing) {
      onToggle(); // turn on playing state globally
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] pointer-events-auto flex flex-col items-end gap-3 select-none">
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-black/85 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[200px]"
          >
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#D8B36A] opacity-60">
              Select Ambience
            </span>
            
            <div className="flex flex-col gap-2">
              {TRACKS.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(i)}
                  className={`text-left text-xs px-3 py-2 rounded-lg font-mono transition-all flex items-center justify-between cursor-pointer ${
                    currentTrackIndex === i && !muted && playing
                      ? 'bg-[#D8B36A]/10 text-[#D8B36A] border border-[#D8B36A]/20'
                      : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{track.label}</span>
                  {currentTrackIndex === i && !muted && playing && (
                    <span className="w-1.5 h-1.5 bg-[#D8B36A] rounded-full animate-ping" />
                  )}
                </button>
              ))}
              
              <button
                onClick={handleMuteToggle}
                className={`text-left text-xs px-3 py-2 rounded-lg font-mono transition-all flex items-center justify-between cursor-pointer ${
                  muted
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                }`}
              >
                <span>Mute Sounds</span>
                {muted && <span className="text-xs">🔇</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#D8B36A] shadow-2xl flex items-center justify-center text-white/80 hover:text-[#D8B36A] transition-all cursor-pointer"
        title="Background Music"
      >
        <span className="text-sm font-serif">♫</span>
      </button>
      
    </div>
  );
}
