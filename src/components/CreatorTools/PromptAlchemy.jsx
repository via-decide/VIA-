/**
 * PROMPT ALCHEMY — First Creator Tool for ViaDedide
 * Multi-model support (Claude, Gemini, ChatGPT)
 * Works standalone or as part of Creator Suite
 */

import React, { useState, useCallback } from 'react';

const PromptAlchemy = ({ platform = 'instagram', onGenerate }) => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('balanced');
  const [modelProvider, setModelProvider] = useState('claude');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // MOCK ANALYTICS (Day 3 Feature)
  const sendAnalytics = (data) => {
    console.log('[Analytics Event sent]:', data);
    // In production, this would go to Mixpanel/PostHog
  };


  const toneOptions = {
    instagram: [
      { value: 'casual', label: 'Casual & Fun' },
      { value: 'professional', label: 'Professional' },
      { value: 'viral', label: 'Viral-Focused' },
      { value: 'educational', label: 'Educational' },
    ],
    linkedin: [
      { value: 'professional', label: 'Executive' },
      { value: 'thought-leader', label: 'Thought Leader' },
      { value: 'storyteller', label: 'Story-Driven' },
      { value: 'data-driven', label: 'Data-Focused' },
    ],
    youtube: [
      { value: 'engaging', label: 'Engaging' },
      { value: 'educational', label: 'Educational' },
      { value: 'entertaining', label: 'Entertaining' },
      { value: 'urgent', label: 'Urgent' },
    ],
    x: [
      { value: 'witty', label: 'Witty & Quick' },
      { value: 'thought-provoking', label: 'Thought-Provoking' },
      { value: 'viral', label: 'Viral-Focused' },
      { value: 'data-driven', label: 'Data-Backed' },
    ],
  };

  const modelOptions = [
    { value: 'claude', label: 'Claude (Fastest)', icon: '🤖' },
    { value: 'gemini', label: 'Gemini 2.0', icon: '✨' },
    { value: 'openai', label: 'ChatGPT-4', icon: '⚡' },
  ];

  const contentTypes = {
    instagram: 'caption',
    linkedin: 'article',
    youtube: 'title',
    x: 'thread',
  };

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      setError('Please paste or type your content first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          contentType: contentTypes[platform],
          content: input,
          tone,
          modelProvider,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Callback for parent component
      if (onGenerate) {
        onGenerate({
          platform,
          modelProvider,
          contentType: contentTypes[platform],
          characterCount: data.metadata.characterCount,
        });
      }

      // Day 3 built-in analytics push
      sendAnalytics({
        event: 'content_generated',
        platform,
        model: modelProvider,
        contentLength: data.metadata.characterCount,
        engagementScore: data.metadata.engagementScore,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err.message || 'Failed to generate content. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [input, tone, modelProvider, platform, onGenerate]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentToneOptions = toneOptions[platform] || toneOptions.instagram;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>✨ Prompt Alchemy</h1>
        <p style={styles.subtitle}>
          Optimize your content for {platform}. Works with Claude, Gemini, ChatGPT.
        </p>
      </div>

      {/* Input Section */}
      <div style={styles.section}>
        <label style={styles.label}>Your Content</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your ${contentTypes[platform]} draft here...`}
          style={styles.textarea}
        />
        <span style={styles.characterCount}>
          {input.length} characters
        </span>
      </div>

      {/* Controls */}
      <div style={styles.controlsGrid}>
        {/* Tone Selector */}
        <div style={styles.controlGroup}>
          <label style={styles.label}>Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={styles.select}
          >
            {currentToneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selector */}
        <div style={styles.controlGroup}>
          <label style={styles.label}>AI Model</label>
          <select
            value={modelProvider}
            onChange={(e) => setModelProvider(e.target.value)}
            style={styles.select}
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        style={{
          ...styles.button,
          opacity: loading || !input.trim() ? 0.5 : 1,
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <span style={styles.spinner}>⟳</span> Optimizing...
          </>
        ) : (
          '→ Optimize & Generate'
        )}
      </button>

      {/* Results */}
      {result && (
        <div style={styles.resultsSection}>
          <h2 style={styles.resultsTitle}>Generated Content</h2>

          {/* Primary Output */}
          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <span style={styles.outputLabel}>Primary Version</span>
              <span style={styles.badge}>
                {result.metadata.characterCount} chars
              </span>
            </div>
            <p style={styles.outputText}>{result.generated}</p>
            <div style={styles.outputFooter}>
              {result.metadata.hashtags.length > 0 && (
                <div style={styles.hashtags}>
                  {result.metadata.hashtags.map((tag) => (
                    <span key={tag} style={styles.hashtag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleCopy(result.generated, 'primary')}
                style={{
                  ...styles.copyButton,
                  background:
                    copiedIndex === 'primary' ? '#10b981' : 'transparent',
                }}
              >
                {copiedIndex === 'primary' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Variants */}
          {result.variants && result.variants.length > 0 && (
            <div style={styles.variantsSection}>
              <h3 style={styles.variantsTitle}>Alternative Versions</h3>
              {result.variants.map((variant, index) => (
                <div key={index} style={styles.variantCard}>
                  <div style={styles.variantLabel}>Variant {index + 1}</div>
                  <p style={styles.variantText}>{variant}</p>
                  <button
                    onClick={() => handleCopy(variant, `variant-${index}`)}
                    style={{
                      ...styles.copyButton,
                      background:
                        copiedIndex === `variant-${index}`
                          ? '#10b981'
                          : 'transparent',
                    }}
                  >
                    {copiedIndex === `variant-${index}` ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div style={styles.metadataSection}>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Model Used</span>
              <span style={styles.metadataValue}>
                {modelOptions.find((m) => m.value === modelProvider)?.label}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Engagement Score</span>
              <span style={styles.metadataValue}>
                {result.metadata.engagementScore}/100
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Status</span>
              <span style={styles.metadataValue}>Ready to post</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={styles.infoBox}>
        💡 Generated content optimized for {platform}. Safe to edit. Use any version above.
      </div>
    </div>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1f2937',
    background: '#ffffff',
  },
  header: {
    marginBottom: '2.5rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  section: {
    marginBottom: '2rem',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '0.5rem',
    color: '#374151',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px',
    boxSizing: 'border-box',
  },
  characterCount: {
    display: 'block',
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '0.5rem',
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: '#ffffff',
  },
  error: {
    padding: '12px',
    marginBottom: '1.5rem',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#991b1b',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 500,
    background: '#1f2937',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  resultsSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 1rem 0',
  },
  outputCard: {
    background: '#ffffff',
    padding: '1.25rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '1rem',
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  outputLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  badge: {
    fontSize: '12px',
    background: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  outputText: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#1f2937',
    margin: '0 0 1rem 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  outputFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  hashtags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
  },
  hashtag: {
    fontSize: '12px',
    color: '#0891b2',
    background: '#ecf0f1',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  copyButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  variantsSection: {
    marginTop: '1.5rem',
  },
  variantsTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 1rem 0',
    color: '#374151',
  },
  variantCard: {
    background: '#ffffff',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '0.75rem',
  },
  variantLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  variantText: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#1f2937',
    margin: '0 0 0.75rem 0',
  },
  metadataSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  metadataItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metadataLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
  metadataValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
  },
  infoBox: {
    padding: '12px',
    background: '#dbeafe',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#1e40af',
  },
};

export default PromptAlchemy;
