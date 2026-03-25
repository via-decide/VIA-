import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Suite() {
  const navigate = useNavigate();
  const platforms = [
    { id: 'instagram', icon: '📸', label: 'Instagram' },
    { id: 'linkedin', icon: '💼', label: 'LinkedIn' },
    { id: 'youtube', icon: '🎥', label: 'YouTube' },
    { id: 'x', icon: '🐦', label: 'X / Twitter' }
  ];

  return (
    <div className="min-h-screen bg-via-dark font-sans p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 animate-float">
          <div className="inline-block py-1 px-3 rounded-full bg-via-accent/10 border border-via-accent/20 text-via-accent text-[10px] font-bold tracking-widest uppercase mb-4">
            Creator Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-syne font-extrabold tracking-tight mb-4">
            Optimize Your <span className="text-via-gold italic font-playfair">Voice.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl">
            Select a platform to launch Prompt Alchemy and transform raw ideas into professional, high-engagement content.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/creator/tool/prompt-alchemy/${p.id}`)}
              className="glass-panel group relative overflow-hidden p-8 rounded-2xl text-left transition-all hover:border-via-gold/40 hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-via-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{p.icon}</div>
              <h3 className="text-xl font-bold mb-1">{p.label}</h3>
              <p className="text-white/40 text-xs">Alchemy Ready</p>
            </button>
          ))}
        </div>
        
        <div className="glass-panel p-8 rounded-2xl border-via-gold/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-via-gold">✨</span> Platform Analytics
          </h2>
          <p className="text-white/50 text-sm mb-6">Unified dashboard coming soon. Your generated content metrics from Prompt Alchemy will appear here.</p>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-via-accent w-1/3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
