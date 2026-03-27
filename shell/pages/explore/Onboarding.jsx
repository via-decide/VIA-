import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'viaExploreOnboardingV1';

const SCREENS = [
  {
    id: 'what-is-via',
    title: 'What is VIA?',
    subtitle: 'A decision-first platform for discovering tools, creators, and games in one place.',
    body: 'VIA helps people move from idea to action through guided exploration, fast experimentation, and social learning.',
  },
  {
    id: 'choose-path',
    title: 'Choose your path',
    subtitle: 'Pick your default mode. You can change this later anytime.',
    choices: ['Explorer', 'Creator', 'Gamer'],
  },
  {
    id: 'what-you-can-explore',
    title: 'What you can explore',
    subtitle: 'Tool stacks, creator insight posts, and interactive game surfaces.',
    cards: [
      { title: 'Trending Tools', desc: 'Discover high-signal tools by role and use case.' },
      { title: 'Creator Posts', desc: 'Learn from practical frameworks and tactical playbooks.' },
      { title: 'Game Teasers', desc: 'Try strategic simulations and improve decision speed.' },
    ],
  },
  {
    id: 'how-vialogic-works',
    title: 'How ViaLogic works',
    subtitle: 'Map concepts visually to see relationships, tradeoffs, and next-best moves.',
    body: 'Build maps, branch options, and save outcomes. Your maps can become shareable feed items.',
  },
  {
    id: 'first-feed',
    title: 'Your first feed is ready',
    subtitle: 'We pre-populated your Discover tab with a starter mix based on your path.',
    body: 'Jump in now, save anything useful, and unlock your first badge by exploring 5 tools.',
  },
];

export default function Onboarding({ onComplete, onSkip }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [path, setPath] = useState('Explorer');

  const current = SCREENS[stepIndex];
  const progress = useMemo(() => Math.round(((stepIndex + 1) / SCREENS.length) * 100), [stepIndex]);

  const complete = (skipped = false) => {
    const payload = {
      completed: !skipped,
      skipped,
      path,
      completedAt: new Date().toISOString(),
      version: 1,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    if (typeof onComplete === 'function') {
      onComplete(payload);
    }
  };

  const next = () => {
    if (stepIndex >= SCREENS.length - 1) {
      complete(false);
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const back = () => setStepIndex((prev) => Math.max(0, prev - 1));

  const skip = () => {
    complete(true);
    if (typeof onSkip === 'function') onSkip();
  };

  return (
    <section aria-label="VIA Explore onboarding" style={styles.shell}>
      <header style={styles.header}>
        <small style={styles.progressLabel}>Step {stepIndex + 1} / {SCREENS.length}</small>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>{current.title}</h1>
        <p style={styles.subtitle}>{current.subtitle}</p>

        {current.choices && (
          <div style={styles.choiceRow}>
            {current.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setPath(choice)}
                style={{
                  ...styles.choiceButton,
                  ...(path === choice ? styles.choiceActive : {}),
                }}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {current.cards && (
          <div style={styles.cardGrid}>
            {current.cards.map((card) => (
              <article key={card.title} style={styles.card}>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDesc}>{card.desc}</p>
              </article>
            ))}
          </div>
        )}

        {current.body && <p style={styles.body}>{current.body}</p>}
      </main>

      <footer style={styles.footer}>
        <button type="button" onClick={skip} style={styles.ghostButton}>Skip</button>
        <div style={styles.actionGroup}>
          <button type="button" onClick={back} style={styles.ghostButton} disabled={stepIndex === 0}>Back</button>
          <button type="button" onClick={next} style={styles.primaryButton}>
            {stepIndex === SCREENS.length - 1 ? 'Enter Explore' : 'Continue'}
          </button>
        </div>
      </footer>
    </section>
  );
}

const styles = {
  shell: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '24px',
    borderRadius: 20,
    background: '#0f172a',
    color: '#f8fafc',
    border: '1px solid rgba(148,163,184,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  header: { display: 'flex', flexDirection: 'column', gap: 8 },
  progressLabel: { color: '#cbd5e1' },
  progressTrack: { height: 8, borderRadius: 999, background: '#1e293b', overflow: 'hidden' },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg,#22d3ee,#6366f1)',
    transition: 'width 220ms ease',
  },
  main: { display: 'flex', flexDirection: 'column', gap: 14 },
  title: { margin: 0, fontSize: 32, lineHeight: 1.1 },
  subtitle: { margin: 0, color: '#cbd5e1', fontSize: 16 },
  body: { margin: 0, color: '#e2e8f0', fontSize: 15 },
  choiceRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  choiceButton: {
    padding: '10px 14px',
    borderRadius: 999,
    border: '1px solid #334155',
    color: '#e2e8f0',
    background: '#0f172a',
    cursor: 'pointer',
  },
  choiceActive: {
    border: '1px solid #22d3ee',
    boxShadow: '0 0 0 1px rgba(34,211,238,0.4) inset',
  },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 },
  card: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#111827' },
  cardTitle: { margin: 0, fontSize: 15 },
  cardDesc: { margin: '6px 0 0 0', color: '#cbd5e1', fontSize: 13 },
  footer: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  actionGroup: { display: 'flex', gap: 10 },
  ghostButton: {
    border: '1px solid #334155',
    background: '#0b1221',
    color: '#e2e8f0',
    borderRadius: 10,
    padding: '10px 14px',
    cursor: 'pointer',
  },
  primaryButton: {
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    borderRadius: 10,
    padding: '10px 14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
