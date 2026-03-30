import Link from 'next/link';

export default function WorldPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#030508', color: '#00ff88' }}>
      <section style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>[ WORLD MAP ]</h1>
        <p style={{ letterSpacing: 1.2, color: '#64748b' }}>COMING SOON — SPATIAL ENGINE LOADING</p>
        <Link href="/viadecide" style={{ color: '#00ff88', display: 'inline-block', marginTop: 14 }}>
          ← BACK TO OS
        </Link>
      </section>
    </main>
  );
}
