'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useScroll } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function TiltCard({ children, className = '', onClick }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  // Brightness based on mouse position
  const brightness = useTransform(mouseYSpring, [-0.5, 0.5], [1.1, 0.9]);
  const filterTemplate = useMotionTemplate`brightness(${brightness})`;
  
  // Calculate glare position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [100, 0]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [100, 0]);
  const backgroundTemplate = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        filter: isHovered ? filterTemplate : 'brightness(1)',
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
      initial={{ scale: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -10, 
        transition: { duration: 0.4, ease: "easeOut" } 
      }}
      className={`relative group cursor-pointer rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)] transition-shadow duration-700 ${className}`}
    >
      {/* Thin glass border */}
      <div className="absolute inset-0 border border-white/20 rounded-[24px] md:rounded-[32px] pointer-events-none z-20" />
      
      {/* Content (Image/Video) */}
      <div className="w-full h-full relative z-0 overflow-hidden">
        <motion.div style={{ scale: 1.15 }} className="w-full h-full relative origin-center">
          {children}
        </motion.div>
      </div>

      {/* Dynamic Glare Reflection */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay"
        style={{
          background: backgroundTemplate
        }}
      />
      
      {/* Subtle edge highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
}
