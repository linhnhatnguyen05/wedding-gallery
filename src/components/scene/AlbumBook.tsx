'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import gsap from 'gsap';
import type { AlbumPage } from '@/lib/photos';

/* ─────────────────────────────────────────
   VIDEO MESH — plays mp4 texture in 3D
───────────────────────────────────────── */
function VideoMesh({
  src, position, size, onClick}: {
  src: string;
  position: [number, number, number];
  size: [number, number];
  onClick: () => void;
}) {
  const [vid] = useState(() => {
    if (typeof document === 'undefined') return null;
    const v = document.createElement('video');
    v.src = src; v.loop = true; v.muted = true; v.playsInline = true;
    v.crossOrigin = 'anonymous';
    return v;
  });

  useEffect(() => {
    vid?.play().catch(() => {});
    return () => void vid?.pause();
  }, [vid]);

  if (!vid) return null;

  return (
    <group position={position}>
      {/* Ivory mat border */}
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, 0.005]} />
        <meshStandardMaterial color="#FAF7F0" roughness={0.85} metalness={0} />
      </mesh>
      {/* Video plane */}
      <mesh position={[0, 0, 0.004]} onClick={onClick} castShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial roughness={0.25} metalness={0.05} envMapIntensity={0.4}>
          <videoTexture attach="map" args={[vid]} colorSpace={THREE.SRGBColorSpace} />
        </meshStandardMaterial>
      </mesh>
      {/* Glass reflection */}
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial transparent opacity={0.06} roughness={0} metalness={0.1} color="#fff" />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   PHOTO MESH — displays image with premium hover effects
───────────────────────────────────────── */
function PhotoMesh({ src, position, size, onClick }: {
  src: string;
  position: [number, number, number];
  size: [number, number];
  onClick: () => void;
}) {
  const tex = useLoader(TextureLoader, src);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetZ = hovered ? position[2] + 0.08 : position[2];
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 8);
    const scale = hovered ? 1.02 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, 1), delta * 8);
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Ivory mat border with drop shadow casting */}
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, 0.005]} />
        <meshStandardMaterial color="#FAF7F0" roughness={0.85} metalness={0} />
      </mesh>
      
      {/* Image Plane */}
      <mesh position={[0, 0, 0.003]} castShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial map={tex} roughness={0.2} metalness={0.1} color={hovered ? '#ffffff' : '#f0f0f0'} />
      </mesh>
      
      {/* Glass / Glossy reflection layer */}
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial transparent opacity={0.06} roughness={0.0} metalness={0.2} color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   SINGLE ALBUM PAGE
───────────────────────────────────────── */
interface PageProps {
  page:        AlbumPage;
  index:       number;
  total:       number;
  zPos:        number;
  rotY:        number;
  isNear:      boolean;
  isTurned:    boolean;
  W: number; H: number; D: number;
  onPhotoClick: (id: number) => void;
}

function AlbumPage({ page, index, total, zPos, rotY, isNear, isTurned, W, H, D, onPhotoClick }: PageProps) {
  const { rotationY } = useSpring({
    rotationY: rotY,
    config: { tension: 55, friction: 22, mass: 1.2 }});

  if (!isNear) return null;

  return (
    <animated.group
      position-x={-W / 2}
      position-z={zPos}
      rotation-y={rotationY}
    >
      <group position={[W / 2, 0, 0]}>
        {/* Paper page body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[W, H, D]} />
          <meshStandardMaterial color="#FAF7F0" roughness={0.95} metalness={0} />
        </mesh>

        {/* Spine shadow line */}
        <mesh position={[-W / 2 + 0.025, 0, D / 2 + 0.001]}>
          <planeGeometry args={[0.05, H]} />
          <meshStandardMaterial color="#000" transparent opacity={0.04} roughness={1} />
        </mesh>

        {/* Back shadow when turned */}
        {isTurned && (
          <mesh position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[W, H]} />
            <meshStandardMaterial color="#000" transparent opacity={0.10} roughness={1} />
          </mesh>
        )}

        {/* Media */}
        {page.layout === 'video' && page.videos?.[0] ? (
          <VideoMesh
            src={page.videos[0]}
            position={[0, 0, D * 0.5 + 0.006]}
            size={[W - 0.45, H - 0.55]}
            onClick={() => onPhotoClick(-page.pageNumber)}
          />
        ) : page.photos?.[0] ? (
          <PhotoMesh
            src={page.photos[0].src}
            position={[0, 0, D * 0.5 + 0.006]}
            size={[W - 0.45, H - 0.55]}
            onClick={() => onPhotoClick(page.photos[0].id)}
          />
        ) : null}
      </group>
    </animated.group>
  );
}

/* ─────────────────────────────────────────
   ALBUM BOOK (covers + all pages)
───────────────────────────────────────── */
interface AlbumBookProps {
  pages:       AlbumPage[];
  currentPage: number;
  isOpen:      boolean;
  onPageClick: (id: number) => void;
  isTurning:   boolean;
}

export default function AlbumBook({ pages, currentPage, isOpen, onPageClick, isTurning }: AlbumBookProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Album dimensions
  const W     = 3.2;
  const H     = 4.2;
  const D     = 0.003;
  const TOTAL = pages.length;
  const THICK = Math.max(0.2, TOTAL * D);

  // Breathe animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    if (!isOpen) {
      groupRef.current.position.y = Math.sin(t * 0.38) * 0.055;
      groupRef.current.rotation.y = Math.sin(t * 0.22) * 0.028 - 0.06;
    } else {
      groupRef.current.position.y = Math.sin(t * 0.28) * 0.012;
    }
  });

  return (
    <group ref={groupRef}>

      {/* ── Back cover (dark leather, fixed underneath) ── */}
      <group position={[-W / 2, 0, -THICK / 2 - 0.03]}>
        <RoundedBox
          args={[W, H, 0.06]}
          radius={0.015}
          position={[W / 2, 0, 0]}
          castShadow receiveShadow
        >
          <meshStandardMaterial color="#1C1208" roughness={0.86} metalness={0.04} />
        </RoundedBox>
      </group>

      {/* ── Pages ── */}
      {pages.map((page, i) => {
        const turned   = i < currentPage;
        const isCurrent= i === currentPage;
        const isNear   = Math.abs(i - currentPage) <= 2;
        const zPos     = -THICK / 2 + i * D;
        const rotY     = turned ? Math.PI : (isCurrent && isTurning) ? Math.PI * 0.48 : 0;

        return (
          <AlbumPage
            key={page.pageNumber}
            page={page}
            index={i}
            total={TOTAL}
            zPos={zPos}
            rotY={rotY}
            isNear={isNear}
            isTurned={turned}
            W={W} H={H} D={D}
            onPhotoClick={onPageClick}
          />
        );
      })}

      {/* ── Front cover (leather, opens) ── */}
      <group
        rotation={[0, isOpen ? Math.PI * 0.97 : 0, 0]}
        position={[-W / 2, 0, THICK / 2 + 0.03]}
      >
        <group position={[W / 2, 0, 0]}>
          <RoundedBox args={[W, H, 0.06]} radius={0.015} castShadow receiveShadow>
            <meshStandardMaterial color="#28190E" roughness={0.84} metalness={0.05} envMapIntensity={0.5} />
          </RoundedBox>

          {/* Gold outer frame */}
          <mesh position={[0, 0, 0.032]}>
          <boxGeometry args={[W - 0.14, H - 0.14, 0.002]} />
          <meshStandardMaterial color="#C9A76A" roughness={0.10} metalness={0.96} envMapIntensity={2} />
        </mesh>
        {/* Inner leather inset */}
        <mesh position={[0, 0, 0.033]}>
          <boxGeometry args={[W - 0.22, H - 0.22, 0.001]} />
          <meshStandardMaterial color="#28190E" roughness={0.84} metalness={0.05} />
        </mesh>
        {/* Thin inner gold line */}
        <mesh position={[0, 0, 0.0335]}>
          <boxGeometry args={[W - 0.30, H - 0.30, 0.001]} />
          <meshStandardMaterial color="#B08D57" roughness={0.14} metalness={0.9} envMapIntensity={1.6} />
        </mesh>

        {/* Corner ornament rings */}
        {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy], ci) => (
          <mesh key={ci} position={[sx * (W/2 - 0.22), sy * (H/2 - 0.22), 0.035]}>
            <torusGeometry args={[0.072, 0.014, 8, 24, Math.PI / 2]} />
            <meshStandardMaterial color="#E8D090" roughness={0.07} metalness={1} envMapIntensity={2.2} />
          </mesh>
        ))}

        {/* Embossed name plaque */}
        <mesh position={[0, 0.45, 0.034]}>
          <boxGeometry args={[1.4, 0.13, 0.003]} />
          <meshStandardMaterial color="#C9A76A" roughness={0.09} metalness={0.95} envMapIntensity={2} />
        </mesh>
        <mesh position={[0, 0.18, 0.034]}>
          <boxGeometry args={[0.55, 0.065, 0.002]} />
          <meshStandardMaterial color="#C9A76A" roughness={0.12} metalness={0.90} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[0, -0.08, 0.034]}>
          <boxGeometry args={[1.1, 0.085, 0.002]} />
          <meshStandardMaterial color="#C9A76A" roughness={0.14} metalness={0.95} envMapIntensity={1.8} />
        </mesh>

        {/* Stitching */}
        {[-1, 1].map(side => (
          <group key={side}>
            {Array.from({ length: 30 }).map((_, si) => (
              <mesh
                key={si}
                position={[side * (W / 2 - 0.055), -H / 2 + 0.22 + si * ((H - 0.44) / 30), 0.031]}
              >
                <boxGeometry args={[0.007, 0.038, 0.001]} />
                <meshStandardMaterial color="#B8961E" roughness={0.28} metalness={0.5} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ── Inner Lining (Ivory Paper) ── */}
        <mesh position={[0, 0, -0.031]}>
          <boxGeometry args={[W - 0.08, H - 0.08, 0.002]} />
          <meshStandardMaterial color="#FAF7F0" roughness={0.9} metalness={0} />
        </mesh>
        {/* Inner lining gold border */}
        <mesh position={[0, 0, -0.0321]}>
          <boxGeometry args={[W - 0.2, H - 0.2, 0.001]} />
          <meshStandardMaterial color="#C9A76A" roughness={0.2} metalness={0.8} />
        </mesh>
        </group>
      </group>

      {/* ── Spine ── */}
      <mesh position={[-W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[THICK + 0.12, H, 0.06]} />
        <meshStandardMaterial color="#180E07" roughness={0.9} metalness={0.03} />
      </mesh>
      {/* Spine gold stripe */}
      <mesh position={[-W / 2 + 0.025, 0, 0]}>
        <boxGeometry args={[0.003, H, THICK + 0.12]} />
        <meshStandardMaterial color="#C9A76A" roughness={0.09} metalness={0.96} />
      </mesh>
    </group>
  );
}

