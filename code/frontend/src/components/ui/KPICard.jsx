import React, { useState, useEffect } from 'react';

export default function KPICard({ 
  title, 
  value, 
  prefix = "", 
  suffix = "", 
  icon: Icon, 
  trend, 
  delta, 
  subLabel, 
  color = "purple", 
  index = 0 
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const rawVal = value.toString().replace(/,/g, '').replace(/%/g, '').replace(/₹/g, '');
    const end = parseFloat(rawVal);
    
    if (isNaN(end)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1200; // 1.2 seconds
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + easeProgress * (end - start);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatDisplay = (val) => {
    if (typeof val !== 'number') return val;
    
    const originalStr = value.toString();
    const hasDecimal = originalStr.includes('.');
    const decimalPlaces = hasDecimal ? originalStr.split('.')[1].replace(/%/g, '').length : 0;
    
    let formatted = val.toFixed(decimalPlaces);
    // Add commas
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  // Color classes map
  const colorMaps = {
    purple: {
      text: 'text-purple',
      glow: 'glow-purple',
      gradient: 'gradient-text-purple',
      badge: 'badge-purple'
    },
    blue: {
      text: 'text-blue',
      glow: 'glow-blue',
      gradient: 'gradient-text-purple', // will use text-blue or purple->blue
      badge: 'badge-blue'
    },
    pink: {
      text: 'text-pink',
      glow: 'glow-pink',
      gradient: 'gradient-text-pink',
      badge: 'badge-pink'
    },
    gold: {
      text: 'text-gold',
      glow: 'glow-pink', // warm glow
      gradient: 'gradient-text-pink',
      badge: 'badge-gold'
    },
    green: {
      text: 'text-green',
      glow: 'glow-green',
      gradient: 'text-green',
      badge: 'badge-green'
    }
  };

  const scheme = colorMaps[color] || colorMaps.purple;

  return (
    <div 
      className={`glass-card border-animated p-5 relative overflow-hidden hover-lift transition-all duration-300 ${scheme.glow}`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both',
        animationName: 'countUp',
        animationDuration: '0.6s'
      }}
    >
      {/* Background Watermark Icon */}
      {Icon && (
        <Icon className="absolute right-[-10px] bottom-[-10px] h-[70px] w-[70px] text-text-primary opacity-[0.03] pointer-events-none select-none" />
      )}

      {/* Top Section: Icon & Title */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          {title}
        </span>
        {Icon && <Icon className={`h-4.5 w-4.5 ${scheme.text}`} style={{ filter: `drop-shadow(0 0 4px currentColor)` }} />}
      </div>

      {/* Middle Section: Big Value */}
      <div className="my-2">
        <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight`}>
          <span className={color === 'green' ? 'text-green' : scheme.gradient}>
            {prefix}
            {typeof displayValue === 'number' ? formatDisplay(displayValue) : displayValue}
            {suffix}
          </span>
        </h2>
      </div>

      {/* Bottom Section: Trend info */}
      {(trend || delta || subLabel) && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold">
          {trend === 'up' ? (
            <span className="text-green flex items-center">▲</span>
          ) : trend === 'down' ? (
            <span className="text-pink flex items-center">▼</span>
          ) : null}
          
          {delta && (
            <span className={trend === 'up' ? 'text-green' : 'text-pink'}>
              {delta}
            </span>
          )}
          
          {subLabel && (
            <span className="text-text-secondary">
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
