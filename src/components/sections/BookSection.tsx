'use client';

import { Suspense, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, ContactShadows } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import AlbumBook from '@/components/scene/AlbumBook';
import CameraRig from '@/components/scene/CameraRig';
import type { AlbumPage } from '@/lib/photos';

interface BookSectionProps {
  pages: AlbumPage[];
  onPageClick: (id: number) => void;
}

export default function BookSection({ pages, onPageClick }: BookSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isTurning, setIsTurning] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });
  
  // Parallax the 3D canvas slightly as we scroll past it
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const handleNext = useCallback(() => {
    if (isTurning || currentPage >= pages.length - 1) return;
    setIsTurning(true);
    setCurrentPage(p => p + 1);
    if (!isOpen) setIsOpen(true);
    setTimeout(() => setIsTurning(false), 1200);
  }, [isTurning, currentPage, isOpen, pages.length]);

  const handlePrev = useCallback(() => {
    if (isTurning || currentPage === 0) {
      if (currentPage === 0) setIsOpen(false);
      return;
    }
    setIsTurning(true);
    setCurrentPage(p => p - 1);
    setTimeout(() => setIsTurning(false), 1200);
  }, [isTurning, currentPage]);

  return (
    <section ref={containerRef} className="relative w-full h-[150vh] flex flex-col items-center justify-center">
      
      {/* Sticky container for the 3D Book */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        
        <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.5, 6], fov: 45 }}>
            <ambientLight intensity={0.4} color="#ffffff" />
            <directionalLight position={[5, 10, -5]} intensity={1.5} color="#F0E0B0" castShadow />
            
            {(() => {
              const PresentationControlsAny = PresentationControls as any;
              return (
                <PresentationControlsAny 
                  global 
                  config={{ mass: 2, tension: 500 }} 
                  snap={{ mass: 4, tension: 1500 }} 
                  rotation={[0, 0, 0]} 
                  polar={[-Math.PI / 8, Math.PI / 8]} 
                  azimuth={[-Math.PI / 6, Math.PI / 6]}
                >
                  <group position={[0, -0.5, 0]}>
                    <ContactShadows position={[0, -1.2, 0]} opacity={0.6} scale={20} blur={2} far={4.5} resolution={1024} color="#000000" />
                    <Suspense fallback={null}>
                      <AlbumBook
                        pages={pages}
                        currentPage={currentPage}
                        isOpen={isOpen}
                        isTurning={isTurning}
                        onPageClick={onPageClick}
                      />
                    </Suspense>
                  </group>
                </PresentationControlsAny>
              );
            })()}

            <CameraRig isOpen={isOpen} currentPage={currentPage} total={pages.length} isTurning={isTurning} phase="album" />
          </Canvas>
        </motion.div>

      </div>
    </section>
  );
}
