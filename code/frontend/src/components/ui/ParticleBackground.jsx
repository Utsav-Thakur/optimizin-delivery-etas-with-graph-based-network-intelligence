import React, { useState, useEffect } from 'react';

export default function ParticleBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#b44fff', '#00d4ff', '#ff2d78'];
    const generated = Array.from({ length: 40 }).map((_, i) => {
      const size = Math.floor(Math.random() * 3) + 1; // 1-3px
      const left = Math.random() * 100; // 0-100%
      const top = Math.random() * 100; // 0-100%
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = Math.floor(Math.random() * 17) + 8; // 8-25s
      const delay = Math.random() * -20; // negative delay so they start immediately at different points

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          top: `${top}%`,
          background: color,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          boxShadow: `0 0 8px ${color}`,
        }
      };
    });
    setParticles(generated);
  }, []);

  return (
    <div id="particle-bg" className="pointer-events-none select-none">
      {particles.map((p) => (
        <div key={p.id} className="particle" style={p.style} />
      ))}
    </div>
  );
}
