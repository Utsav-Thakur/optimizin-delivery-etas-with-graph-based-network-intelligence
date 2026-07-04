import React, { useEffect, useRef, useState } from 'react';

// Easing function: easeOutExpo
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function CyberKPICard({
  title,
  value,
  sub,
  icon: Icon,
  color = '#b44fff',
  prefix = '',
  suffix = '',
  loading = false,
  delay = 0,
}) {
  const [displayVal, setDisplayVal] = useState(0);
  const [visible, setVisible] = useState(false);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const duration = 1200;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!visible || loading) return;
    startRef.current = null;
    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplayVal(parseFloat((eased * value).toFixed(value % 1 !== 0 ? 1 : 0)));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, value, loading]);

  // Format display value
  const formatted = value % 1 !== 0
    ? displayVal.toFixed(1)
    : Math.round(displayVal).toLocaleString();

  return (
    <div
      className="glass-card border-animated hover-lift relative overflow-hidden flex flex-col justify-between"
      style={{
        padding: '18px 20px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        borderTop: `2px solid ${color}`,
        boxShadow: `0 0 20px ${color}18, 0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Watermark Icon */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          right: '-8px',
          opacity: 0.04,
          color: color,
        }}
      >
        {Icon && <Icon style={{ width: '72px', height: '72px' }} />}
      </div>

      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#6b6b9a',
          fontWeight: 700,
          fontFamily: 'monospace',
          lineHeight: 1.4,
          maxWidth: '130px',
        }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: '8px',
            padding: '6px',
            opacity: 0.85,
          }}>
            <Icon style={{ width: '16px', height: '16px', color: color }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '30px',
        fontWeight: 800,
        lineHeight: 1,
        marginBottom: '8px',
        fontFamily: 'monospace',
        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {prefix}{loading ? '—' : formatted}{suffix}
      </div>

      {/* Sub / trend */}
      <div style={{ fontSize: '10px', color: '#6b6b9a', lineHeight: 1.4 }}>
        {sub}
      </div>
    </div>
  );
}
