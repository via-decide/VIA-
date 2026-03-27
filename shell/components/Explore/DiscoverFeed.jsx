import React, { useMemo, useState } from 'react';

const STARTER_ITEMS = [
  {
    id: 'tool_1',
    type: 'tool',
    title: 'PromptAlchemy',
    summary: 'Refine rough ideas into clear prompts with structured alternatives.',
    cta: 'Open tool',
    points: 8,
  },
  {
    id: 'post_1',
    type: 'post',
    title: 'Incentives Beat Intelligence',
    summary: 'A creator note on why system design incentives often outperform raw model quality.',
    cta: 'Read post',
    points: 5,
  },
  {
    id: 'game_1',
    type: 'game',
    title: 'Orchade Teaser',
    summary: 'Prototype strategic choices with fast rounds and score feedback loops.',
    cta: 'Play teaser',
    points: 10,
  },
  {
    id: 'tool_2',
    type: 'tool',
    title: 'SkillHex',
    summary: 'Map operator capabilities and spot gaps across teams and missions.',
    cta: 'Explore map',
    points: 7,
  },
];

const ENGAGEMENT_KEY = 'viaExploreEngagementV1';

function feedTypeColor(type) {
  if (type === 'tool') return '#22d3ee';
  if (type === 'post') return '#f97316';
  return '#a78bfa';
}

export default function DiscoverFeed({ initialItems = STARTER_ITEMS }) {
  const [savedIds, setSavedIds] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  const engagement = useMemo(() => ({
    likes: likedIds.length,
    saves: savedIds.length,
    actions: likedIds.length + savedIds.length,
  }), [likedIds.length, savedIds.length]);

  const syncStorage = (nextLiked, nextSaved) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify({
      liked: nextLiked,
      saved: nextSaved,
      updatedAt: new Date().toISOString(),
    }));
  };

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((v) => v !== id) : [...prev, id];
      syncStorage(next, savedIds);
      return next;
    });
  };

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((v) => v !== id) : [...prev, id];
      syncStorage(likedIds, next);
      return next;
    });
  };

  return (
    <section aria-label="VIA Explore discover feed" style={styles.shell}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Discover</h2>
          <p style={styles.subtitle}>A starter mix of tools, creator ideas, and game surfaces.</p>
        </div>
        <aside style={styles.stats}>
          <small>Session actions: {engagement.actions}</small>
          <small>Likes: {engagement.likes} · Saves: {engagement.saves}</small>
        </aside>
      </header>

      <div style={styles.stack}>
        {initialItems.map((item) => {
          const liked = likedIds.includes(item.id);
          const saved = savedIds.includes(item.id);
          return (
            <article key={item.id} style={styles.card}>
              <span style={{ ...styles.badge, color: feedTypeColor(item.type), borderColor: feedTypeColor(item.type) }}>
                {item.type.toUpperCase()}
              </span>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardSummary}>{item.summary}</p>
              <p style={styles.cardPoints}>+{item.points} points if opened</p>
              <div style={styles.actions}>
                <button type="button" style={styles.primary}>{item.cta}</button>
                <button type="button" onClick={() => toggleLike(item.id)} style={styles.secondary}>
                  {liked ? 'Unlike' : 'Like'}
                </button>
                <button type="button" onClick={() => toggleSave(item.id)} style={styles.secondary}>
                  {saved ? 'Unsave' : 'Save'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  shell: {
    maxWidth: 760,
    margin: '0 auto',
    padding: 24,
    color: '#e2e8f0',
    background: '#0f172a',
    border: '1px solid rgba(148,163,184,0.3)',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  title: { margin: 0, fontSize: 28 },
  subtitle: { margin: '6px 0 0 0', color: '#cbd5e1' },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '10px 12px',
    background: '#111827',
  },
  stack: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    background: '#111827',
    border: '1px solid #334155',
    borderRadius: 14,
    padding: 14,
  },
  badge: {
    display: 'inline-flex',
    fontSize: 11,
    border: '1px solid',
    borderRadius: 999,
    padding: '3px 8px',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  cardTitle: { margin: 0, fontSize: 18 },
  cardSummary: { margin: '8px 0', color: '#cbd5e1' },
  cardPoints: { margin: 0, color: '#93c5fd', fontSize: 13 },
  actions: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  primary: {
    border: 'none',
    borderRadius: 10,
    padding: '9px 12px',
    background: '#6366f1',
    color: '#fff',
    cursor: 'pointer',
  },
  secondary: {
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '9px 12px',
    background: '#0b1221',
    color: '#e2e8f0',
    cursor: 'pointer',
  },
};
