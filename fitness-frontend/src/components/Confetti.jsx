import React, { useEffect, useRef } from 'react';

const COLORS = ['#3D6EFF', '#39FF14', '#FF6B1A', '#FFD23D', '#FF4ECD', '#00E5FF'];

/**
 * Confetti — fires a burst of particles when `active` becomes true.
 * Renders absolutely-positioned particles via DOM manipulation for performance.
 */
export default function Confetti({ active }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!active || fired.current) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    fired.current = true;
    const container = document.body;
    const count = 60;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const x = Math.random() * 100; // vw
      const delay = Math.random() * 0.5;
      const duration = 1.8 + Math.random() * 1.2;
      const size = 6 + Math.random() * 8;
      const isCircle = Math.random() > 0.6;

      Object.assign(el.style, {
        left: `${x}vw`,
        top: '0',
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: isCircle ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      });

      container.appendChild(el);

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, (delay + duration) * 1000 + 100);
    }

    // Reset fired flag after animation window
    setTimeout(() => { fired.current = false; }, 3000);
  }, [active]);

  return null;
}
