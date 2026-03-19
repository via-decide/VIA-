// VIANavBar.tsx — persistent nav bar linking Orchard back to VIA
import React from 'react';

const links = [
  { label: '← VIA', href: '/', primary: true },
  { label: '🌱 Orchard', href: '/orchard/', color: '#4CAF50' },
  { label: '🎤 Interview', href: '/interview-prep/', color: '#39ff88' },
  { label: '📚 Research', href: '/student-research/', color: '#6C63FF' },
  { label: '🎬 Create', href: '/creator-onboarding.html', color: '#FF6B00' },
];

export const VIANavBar: React.FC = () => (
  <nav style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    background: 'rgba(10,10,10,0.92)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontFamily: "'DM Sans', sans-serif",
    overflowX: 'auto',
  }}>
    {links.map((link, i) => (
      <a
        key={i}
        href={link.href}
        style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          padding: '0.28rem 0.65rem',
          borderRadius: '8px',
          color: link.primary ? 'rgba(255,255,255,0.7)' : (link.color || '#fff'),
          background: link.primary
            ? 'transparent'
            : `${link.color}15`,
          border: link.primary
            ? '1px solid rgba(255,255,255,0.1)'
            : `1px solid ${link.color}25`,
        }}
      >
        {link.label}
      </a>
    ))}
  </nav>
);

export default VIANavBar;
