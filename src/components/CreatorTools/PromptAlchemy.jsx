/**
 * PROMPT ALCHEMY — Premium Creator Tool for ViaDedide
 * Unified with VIA Agent Service & Gemini API
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PromptAlchemy = ({ platform = 'instagram' }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('balanced');
  const [activeModel, setActiveModel] = useState('gemini'); // Default to Gemini in VIA
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Platform Map
  const platformData = {
    instagram: { icon: '📸', color: '#E1306C', label: 'Instagram', detail: 'Engagement & Visual Focus' },
    linkedin: { icon: '💼', color: '#0077B5', label: 'LinkedIn', detail: 'Professional Authority' },
    youtube: { icon: '🎥', color: '#FF0000', label: 'YouTube', detail: 'High Conversation titles' },
    x: { icon: '🐦', color: '#1DA1F2', label: 'X / Twitter', detail: 'Viral Hooks & Threads' }
  };

  const current = platformData[platform] || platformData.instagram;

  const toneOptions = {
    instagram: [
      { value: 'casual', label: 'Casual & Fun' },
      { value: 'viral', label: 'Viral Hook' },
      { value: 'educational', label: 'Value-First' }
    ],
    linkedin: [
      { value: 'professional', label: 'Executive' },
      { value: 'thought-leader', label: 'Thought Leader' },
      { value: 'storyteller', label: 'Story-Driven' }
    ],
    youtube: [
      { value: 'engaging', label: 'High Click-Rate' },
      { value: 'educational', label: 'How-To Logic' }
    ],
    x: [
      { value: 'witty', label: 'Witty & Sharp' },
      { value: 'viral', label: 'Viral Thread' }
    ],
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);

    // Prompt Engineering for VIA
    const prompt = `Platform: ${platform.toUpperCase()}\nTone: ${tone}\nTopic/Context: ${input}\n\nPlease generate a high-engagement post version and 2 variants. Make it India-centric and professional. Use emojis sparingly but effectively. Format as JSON: { "primary": "...", "variants": ["...", "..."], "metrics": { "engagement": 85, "readability": 90 } }`;

    try {
      // Direct Gemini Call (Syncing with AgentService pattern)
      const apiKey = localStorage.getItem('via_gemini_key') || '';
      if (!apiKey) throw new Error('Gemini API Key missing. Please set in Profile.');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (!response.ok) throw new Error('AI Engine failed to respond.');

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Alchemy process failed. Check your API key.');
      
      // Fallback result for demo if key is missing
      if (err.message.includes('missing')) {
        setResult({
          primary: `🚀 Designing the future of Bharat! Just optimized my creator flow for ${platform}. Always be building. #VIA #BuildInPublic`,
          variants: [
            "Structure beats raw prompts every time. Using VIA to architect my next pivot.",
            "If you're still using basic AI for content, you're falling behind the synthesis curve."
          ],
          metrics: { engagement: 74, readability: 88 }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-via-dark text-white font-sans p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/creator')}
            className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold tracking-tighter"
          >
            ← BEYOND THE SUITE
          </button>
          <div className="px-3 py-1 rounded-full bg-via-gold/10 border border-via-gold/20 text-via-gold text-[10px] font-bold uppercase tracking-widest">
            Prompt Alchemy v1.2
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-8 mb-8 border-via-accent/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${current.color}22`, border: `1px solid ${current.color}44` }}>
              {current.icon}
            </div>
            <div>
              <h1 className="text-2xl font-syne font-extrabold">{current.label} Optimizer</h1>
              <p className="text-white/40 text-xs">{current.detail}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3 ml-1">Input Concept / Hook</label>
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-via-accent transition-colors min-h-[120px] outline-none"
                placeholder="Paste your raw idea or a draft that needs 'alchemy'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3 ml-1">Tone Profile</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-via-accent transition-colors outline-none appearance-none"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {(toneOptions[platform] || toneOptions.instagram).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="w-full h-[46px] bg-via-accent hover:bg-via-accent/80 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-via-accent/20"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✨ ALCHEMIZE'}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}
        </section>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <article className="glass-panel rounded-2xl p-6 border-via-gold/20 shadow-xl shadow-via-gold/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-via-gold">Primary Output</span>
                <button onClick={() => copyToClipboard(result.primary)} className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                  {copied ? '✓ COPIED' : 'COPY CONTEXT'}
                </button>
              </div>
              <p className="text-white/90 leading-relaxed text-sm">{result.primary}</p>
              
              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Engagement Est.</div>
                  <div className="text-xl font-syne font-bold text-via-accent">{result.metrics.engagement}%</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Readability</div>
                  <div className="text-xl font-syne font-bold text-via-gold">{result.metrics.readability}</div>
                </div>
              </div>
            </article>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.variants.map((v, i) => (
                <div key={i} className="glass-panel rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => copyToClipboard(v)}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Variant {i+1}</span>
                    <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-via-gold">CLICK TO COPY</span>
                  </div>
                  <p className="text-white/70 text-xs line-clamp-3">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PromptAlchemy;
