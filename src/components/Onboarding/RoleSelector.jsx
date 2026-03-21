import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelector() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to ViaDedide</h1>
      <p style={styles.subheading}>Who are you?</p>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/learn')}>
          <div style={styles.icon}>📚</div>
          <h2>Learner</h2>
          <p>Go to StudyOS</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/creator')}>
          <div style={styles.icon}>🎬</div>
          <h2>Creator</h2>
          <p>Access Multi-Model Creator Suite</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/feed')}>
          <div style={styles.icon}>🌐</div>
          <h2>User</h2>
          <p>View Structured Feed</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '4rem 2rem',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subheading: {
    fontSize: '1.2rem',
    color: '#6b7280',
    marginBottom: '3rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  card: {
    padding: '2rem',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    border: '1px solid #e5e7eb',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  }
};
