import React from 'react';

export default function CyberTooltip({ active, payload, label, valueLabel = 'Value', prefix = '', suffix = '' }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: 'rgba(13, 13, 26, 0.96)',
        border: '1px solid rgba(180, 79, 255, 0.3)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 0 20px rgba(180, 79, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        fontFamily: 'monospace',
        minWidth: '140px',
      }}
    >
      {label && (
        <p style={{ fontSize: '9px', color: '#6b6b9a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color || '#b44fff', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: '#e8e8ff', fontWeight: 600 }}>
            {entry.name}:&nbsp;
            <span style={{ color: entry.color || '#b44fff' }}>
              {prefix}{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}{suffix}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
