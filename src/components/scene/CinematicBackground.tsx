'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Sparkles } from '@react-three/drei';

export default function CinematicBackground() {
  return (
    <div className="relative w-full h-full bg-[#050505]">
      {/* ── Film Grain Overlay ── */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-20 mix-blend-overlay"
        style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")', backgroundSize: '200px', animation: 'grain 8s steps(10) infinite' }}
      />
      
      {/* ── Vignette ── */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_120%)]" />

      {/* ── Golden Radial Gradients ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D6B36A] opacity-[0.03] blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#D6B36A] opacity-[0.04] blur-[150px] mix-blend-screen pointer-events-none" />

      {/* ── 3D Particles ── */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.2} color="#ffffff" />
          <directionalLight position={[5, 10, -5]} intensity={0.8} color="#D6B36A" />
          <directionalLight position={[-5, 5, 5]} intensity={0.2} color="#ffffff" />
          <Environment preset="night" blur={1} />
          
          <Sparkles count={100} scale={20} size={1.5} speed={0.1} opacity={0.1} color="#D6B36A" />
          <Sparkles count={50} scale={15} size={3} speed={0.05} opacity={0.05} color="#FFFFFF" />
        </Canvas>
      </div>
    </div>
  );
}
