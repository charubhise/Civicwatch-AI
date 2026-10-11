import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'blue', badgeText }) {
  const variantStyles = {
    blue: {
      accent: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.1)',
      border: '#1e3a5f'
    },
    emerald: {
      accent: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.1)',
      border: '#144e3d'
    },
    amber: {
      accent: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.1)',
      border: '#533c16'
    },
    rose: {
      accent: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.12)',
      border: '#541c29'
    }
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div className="civic-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.01em' }}>{title}</span>
        {Icon && (
          <div style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '8px', 
            backgroundColor: style.bgGlow, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: style.accent
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
          {badgeText && (
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              color: style.accent, 
              backgroundColor: style.bgGlow, 
              padding: '0.15rem 0.45rem', 
              borderRadius: '4px' 
            }}>
              {badgeText}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
