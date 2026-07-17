'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

interface CameraRigProps {
  isOpen:      boolean;
  currentPage: number;
  total:       number;
  isTurning:   boolean;
  phase:       'intro' | 'album' | 'end';
}

export default function CameraRig({ isOpen, currentPage, total, isTurning, phase }: CameraRigProps) {
  const { camera } = useThree();
  const mouse      = useRef({ x: 0, y: 0 });
  const targetPos  = useRef({ x: 0, y: 0.6, z: 9 });

  /* ── Track mouse for parallax ── */
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  /* ── React to page / open changes ── */
  useEffect(() => {
    if (!isOpen) return;
    // Shift camera to center the open spread (hinge is at -1.6, center of spread is -1.6)
    // Add a very subtle shift based on page progression to feel dynamic
    const targetX = isOpen ? -1.6 + ((currentPage / Math.max(total - 1, 1)) - 0.5) * 0.8 : 0;
    gsap.to(targetPos.current, {
      x: targetX,
      duration: 1.4,
      ease: 'power2.out'});
  }, [currentPage, isOpen, total]);

  /* ── React to album open/close ── */
  useEffect(() => {
    if (isOpen) {
      gsap.to(targetPos.current, { z: 8, y: 0.2, duration: 2.0, ease: 'power3.out' });
    } else {
      gsap.to(targetPos.current, { z: 11, y: 0.6, duration: 1.8, ease: 'power2.inOut' });
    }
  }, [isOpen]);

  /* ── Page turn pull-back ── */
  useEffect(() => {
    if (isTurning) {
      gsap.to(targetPos.current, { z: targetPos.current.z + 0.8, duration: 0.5, ease: 'power2.out' });
    } else {
      gsap.to(targetPos.current, { z: isOpen ? 8 : 11, duration: 0.8, ease: 'power2.out' });
    }
  }, [isTurning, isOpen]);

  /* ── Per-frame smooth lerp + mouse parallax ── */
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;

    if (!isOpen) {
      // Orbit / breathe when closed
      const orbitX = Math.sin(t * 0.14) * 1.2;
      const orbitY = 0.6 + Math.sin(t * 0.09) * 0.25;
      const orbitZ = 9 + Math.cos(t * 0.1) * 0.4;

      cam.position.x += (orbitX - cam.position.x) * 0.018;
      cam.position.y += (orbitY - cam.position.y) * 0.018;
      cam.position.z += (orbitZ - cam.position.z) * 0.018;
    } else {
      // Subtle mouse parallax when open
      const px = targetPos.current.x + mouse.current.x * 0.18;
      const py = targetPos.current.y - mouse.current.y * 0.10;
      const pz = targetPos.current.z;

      cam.position.x += (px - cam.position.x) * 0.04;
      cam.position.y += (py - cam.position.y) * 0.04;
      cam.position.z += (pz - cam.position.z) * 0.04;
    }

    // Always look at album center
    cam.lookAt(0, 0, 0);
  });

  return null;
}

