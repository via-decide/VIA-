import Link from 'next/link';

const toolGrid = [
  {
    id: 'logichub',
    name: 'LogicHub v2',
    tag: 'FLAGSHIP ENGINE',
    description: 'Visual node architecture and flow verification powered by the Vibecoder mapping engine.',
    href: '/logichub'
  },
  {
    id: 'skillhex',
    name: 'SkillHex Mission Control',
    tag: 'APPS',
    description: 'Mission-based strategy game for tactical decision-making scenarios.',
    href: '/apps/skillhex/index.html'
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    tag: 'APPS',
    description: 'Standalone swipe-based interaction lab for kinetic experiments.',
    href: '/apps/alchemist/index.html'
  },
  {
    id: 'mars',
    name: 'Mars Survival Lab',
    tag: 'APPS',
    description: 'Narrative decision simulation with environmental constraints.',
    href: '/apps/mars/index.html'
  },
  {
    id: 'decision-matrix',
    name: 'Decision Matrix',
    tag: 'DECIDE.ENGINE-TOOLS',
    description: 'Weighted tradeoff analysis utility for high-stakes choices.',
    href: 'https://via-decide.github.io/decide.engine-tools/tools/decision-matrix/'
  },
  {
    id: 'logic-mapper',
    name: 'Logic Mapper',
    tag: 'DECIDE.ENGINE-TOOLS',
    description: 'Map argument structures and relationships as a visual graph.',
    href: 'https://via-decide.github.io/decide.engine-tools/tools/logic-mapper/'
  }
];

export default function ViaDecidePage() {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem', background: '#030508', color: '#e2e8f0' }}>
      <section style={{ maxWidth: 980, margin: '0 auto 2rem auto' }}>
        <p style={{ color: '#ff671f', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>Kinetic OS</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: 10 }}>ViaDecide Tool Grid</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>
          Unified access layer for LogicHub, World navigation, standalone apps, and decide.engine-tools.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/logichub" className="btn btn-primary">Open LogicHub</Link>
          <Link href="/world" className="btn btn-secondary">Open World</Link>
        </div>
      </section>

      <section style={{ maxWidth: 980, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14
          }}
        >
          {toolGrid.map((tool) => (
            <a
              key={tool.id}
              href={tool.href}
              target={tool.href.startsWith('http') ? '_blank' : undefined}
              rel={tool.href.startsWith('http') ? 'noreferrer' : undefined}
              style={{
                textDecoration: 'none',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '1rem',
                background: 'rgba(18,21,28,0.85)'
              }}
            >
              <div style={{ fontSize: 11, color: '#00e5cc', fontWeight: 700, marginBottom: 8 }}>{tool.tag}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{tool.name}</div>
              <div style={{ color: '#94a3b8', fontSize: 14 }}>{tool.description}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
