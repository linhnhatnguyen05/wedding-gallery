'use client';

import { useEffect, useRef } from 'react';

export default function LuxuryCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLDivElement>(null);
  
  const mouse = useRef({ x: -200, y: -200 });
  const ring  = useRef({ x: -200, y: -200 });
  const raf   = useRef<number>(0);

  useEffect(() => {
    const csr = cursorRef.current;
    const rng = ringRef.current;
    const txt = textRef.current;
    if (!csr || !rng || !txt) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      csr.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look for explicit data-cursor attribute or fallback to 'VIEW' for generic interactives
      const interactive = target.closest('[data-cursor], button, a, [role="button"], input');
      
      if (interactive) {
        document.body.classList.add('cursor-hover');
        const customText = interactive.getAttribute('data-cursor');
        
        if (customText) {
          txt.innerText = customText;
          csr.classList.add('has-text');
        } else {
          txt.innerText = 'VIEW';
          csr.classList.add('has-text');
        }
      } else {
        document.body.classList.remove('cursor-hover');
        csr.classList.remove('has-text');
        txt.innerText = '';
      }
    };

    const onDown = () => document.body.classList.add('cursor-click');
    const onUp   = () => document.body.classList.remove('cursor-click');

    const animate = () => {
      // Spring physics interpolation
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      rng.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="fixed top-0 left-0 w-10 h-10 -ml-5 -mt-5 border border-white/30 rounded-full pointer-events-none z-[9998] transition-transform duration-75 ease-out mix-blend-difference" aria-hidden />
      
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 pointer-events-none z-[9999] transition-all duration-300 flex items-center justify-center mix-blend-difference" 
        aria-hidden
      >
        <div className="w-2 h-2 bg-white rounded-full transition-all duration-300 dot-core" />
        <div ref={textRef} className="absolute font-mono text-[8px] tracking-widest text-black opacity-0 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10" />
      </div>
    </>
  );
}
