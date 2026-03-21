import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Suite() {
  const navigate = useNavigate();
  const platforms = ['instagram', 'linkedin', 'youtube', 'x'];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Creator Suite</h1>
      <p>Select a platform to launch Prompt Alchemy:</p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {platforms.map(p => (
          <button 
            key={p} 
            onClick={() => navigate(`/creator/tool/prompt-alchemy/${p}`)}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
