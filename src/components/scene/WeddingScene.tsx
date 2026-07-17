'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PresentationControls, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import AlbumBook from './AlbumBook';
import CameraRig from './CameraRig';
import type { AlbumPage } from '@/lib/photos';

interface WeddingSceneProps {
  pages:       AlbumPage[];
  currentPage: number;
  isOpen:      boolean;
  isTurning:   boolean;
  onPageClick: (id: number) => void;
}

export default function WeddingScene({ pages, currentPage, isOpen, isTurning, onPageClick }: WeddingSceneProps) {
  const PresentationControlsAny = PresentationControls as any;

  return (
    <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.5, 6], fov: 45 }}>
        
        {/* ── Environment & Lighting ── */}
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight 
          position={[5, 10, -5]} 
          intensity={1.5} 
          color="#F0E0B0" 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#A0B0F0" />
        <Environment preset="city" blur={0.8} />
        
        {/* Atmospheric Sparkles */}
        <Sparkles count={80} scale={12} size={3} speed={0.4} opacity={0.15} color="#C9A76A" />

        {/* ── Scene Interaction ── */}
        <PresentationControlsAny 
          global 
          config={{ mass: 2, tension: 500 }} 
          snap={{ mass: 4, tension: 1500 }} 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 6, Math.PI / 6]} 
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <group position={[0, -0.5, 0]}>
            {/* Soft ground shadow for realism */}
            <ContactShadows 
              position={[0, -1.2, 0]} 
              opacity={0.6} 
              scale={20} 
              blur={2} 
              far={4.5} 
              resolution={1024} 
              color="#000000" 
            />
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

        {/* Dynamic camera rig that responds to book state */}
        <CameraRig 
          isOpen={isOpen} 
          currentPage={currentPage} 
          total={pages.length} 
          isTurning={isTurning} 
          phase="album" 
        />
        
      </Canvas>
    </div>
  );
}
