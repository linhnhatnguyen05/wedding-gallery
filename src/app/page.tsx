'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { AnimatePresence } from 'framer-motion';
import { albumPages } from '@/lib/photos';

/* ── Components ── */
import CinematicBackground from '@/components/scene/CinematicBackground';
import HeroIntro         from '@/components/sections/HeroIntro';
import AllMediaGallery   from '@/components/sections/AllMediaGallery';
import CinematicGallery  from '@/components/sections/CinematicGallery';
import TimelineSection   from '@/components/sections/TimelineSection';
import AboutSection      from '@/components/sections/AboutSection';
import LoveLetter        from '@/components/sections/LoveLetter';
import ThankYouScreen    from '@/components/effects/ThankYouScreen';
import LoadingScreen     from '@/components/effects/LoadingScreen';

import Navigation        from '@/components/ui/Navigation';
import ShareController   from '@/components/ui/ShareController';
import MusicPlayer       from '@/components/ui/MusicPlayer';
import ExhibitionFooter  from '@/components/sections/ExhibitionFooter';
import LuxuryCursor      from '@/components/ui/LuxuryCursor';
import HUD               from '@/components/ui/HUD';
import MediaViewer       from '@/components/viewer/MediaViewer';
import WeatherOverlay    from '@/components/effects/WeatherOverlay';
import ScrollProgress    from '@/components/ui/ScrollProgress';

type Phase     = 'album' | 'end';
type WeatherId = 'off' | 'petals' | 'snow' | 'fireflies' | 'leaves' | 'rain';

export default function WeddingAlbumPage() {
  const [mounted,      setMounted]      = useState(false);
  const [phase,        setPhase]        = useState<Phase>('album');
  const [weather,      setWeather]      = useState<WeatherId>('petals');
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  /* Mount guard & scroll enablement */
  useEffect(() => { 
    setMounted(true); 
    window.history.scrollRestoration = 'manual';

    // Enable page scrolling by overriding globals.css body overflow lock
    document.body.style.setProperty('overflow', 'unset', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');

    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
      document.body.style.removeProperty('overflow-x');
    };
  }, []);

  const handleRestart = useCallback(() => {
    setPhase('album');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* Photo click opens lightbox */
  const handlePhotoClick = useCallback((id: number) => {
    const idx = id < 0
      ? albumPages.findIndex(p => p.pageNumber === -id)
      : albumPages.findIndex(p => p.photos?.[0]?.id === id);
    if (idx !== -1) setLightboxIdx(idx);
  }, []);

  const handleScrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleShareClick = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Níha Share - Cinematic Exhibition',
        text: 'Walk through this luxury digital photography exhibition.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <LuxuryCursor />
      
      <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
        <div className="relative w-full min-h-screen bg-[#050505] text-[#F8F8F8] selection:bg-[#D8B36A] selection:text-black">
          
          {/* Floating Glass Navigation */}
          <Navigation 
            onScrollToSection={handleScrollToSection} 
            onShareClick={handleShareClick}
            onMusicToggle={() => setIsMusicPlaying(prev => !prev)}
            isMusicPlaying={isMusicPlaying}
          />

          {/* Floating Left Side Section Selector */}
          <div className="fixed left-6 md:left-10 top-1/2 -translate-y-1/2 z-[90] hidden md:flex flex-col gap-6 items-center select-none">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-white/20 mb-2" />
            {[
              { id: 'hero', label: '01 / Hero Intro' },
              { id: 'showcase-section', label: '02 / 3D Showcase' },
              { id: 'bento-section', label: '03 / Bento Grid' },
              { id: 'wave-reel-section', label: '04 / Wave Reel' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleScrollToSection(sec.id)}
                className="group flex items-center justify-center w-6 h-6 relative cursor-pointer focus:outline-none"
                data-cursor="ENTER"
              >
                {/* Dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-white/25 group-hover:bg-[#D8B36A] group-hover:scale-125 transition-all duration-300" />
                
                {/* Label Plate */}
                <span className="absolute left-8 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 pointer-events-none transition-all duration-300 font-mono text-[9px] uppercase tracking-widest text-[#D8B36A] whitespace-nowrap bg-[#0a0a0a]/90 px-2.5 py-1 rounded border border-white/5 backdrop-blur-md">
                  {sec.label}
                </span>
              </button>
            ))}
            <div className="w-px h-16 bg-gradient-to-t from-transparent to-white/20 mt-2" />
          </div>

          {/* ── Foreground Weather Effects ── */}
          <div className="fixed inset-0 z-30 pointer-events-none">
            <WeatherOverlay active={true} type={weather === 'off' ? 'fireflies' : weather} />
          </div>
          
          {/* The 3D Ambient Canvas runs persistently in the background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <CinematicBackground />
          </div>
 
          {/* ── Foreground Scrolling Content ── */}
          <main className="relative z-10 flex flex-col items-center w-full">
            
            <div id="hero" className="w-full">
              <HeroIntro />
            </div>

            {/* Dense Gallery with All Photos & Videos */}
            <AllMediaGallery pages={albumPages} onMediaClick={handlePhotoClick} />

            {/* Premium Cinematic Scrolling Gallery */}
            <CinematicGallery pages={albumPages} onMediaClick={handlePhotoClick} />

            {/* Timeline Sections / Chapters */}
            <TimelineSection />

            {/* Editorial Biography / Muse */}
            <AboutSection />
            
            {/* Typography Focused Love Letter */}
            <LoveLetter />

            {/* Minimal Footer */}
            <ExhibitionFooter />
            
          </main>
 
          {/* ── Overlays ── */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            <HUD weather={weather} onWeather={w => setWeather(w as WeatherId)} />
          </div>

          <div className="relative z-50">
            <AnimatePresence>
              {lightboxIdx !== null && (
                <MediaViewer
                  pages={albumPages}
                  currentIndex={lightboxIdx}
                  onClose={() => setLightboxIdx(null)}
                  onSelect={(idx) => setLightboxIdx(idx)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Music and Share Floating Widgets */}
          <MusicPlayer playing={isMusicPlaying} onToggle={() => setIsMusicPlaying(prev => !prev)} />
          <ShareController />

          <ThankYouScreen visible={phase === 'end'} onRestart={handleRestart} />
        </div>
      </ReactLenis>
    </>
  );
}
