/**
 * article_summary.ts — Zayvora Article Summarizer
 *
 * Generates summaries for articles using:
 * 1. Meta description extraction (preferred)
 * 2. First paragraph fallback
 * 3. Content truncation fallback
 *
 * Summaries are stored in articles.json
 */

// ── Types ──────────────────────────────────────────────────

export interface SummaryResult {
  summary: string;
  method: 'meta' | 'paragraph' | 'truncation' | 'manual';
  confidence: number;
}

// ── Summary Generation ─────────────────────────────────────

/**
 * Extract summary from HTML content using multiple strategies
 */
export function generateSummary(html: string, maxLength: number = 200): SummaryResult {
  // Strategy 1: Meta description
  const metaDesc = extractMetaDescription(html);
  if (metaDesc && metaDesc.length >= 30) {
    return {
      summary: truncate(metaDesc, maxLength),
      method: 'meta',
      confidence: 0.95,
    };
  }

  // Strategy 2: First meaningful paragraph
  const paragraph = extractFirstParagraph(html);
  if (paragraph && paragraph.length >= 30) {
    return {
      summary: truncate(paragraph, maxLength),
      method: 'paragraph',
      confidence: 0.75,
    };
  }

  // Strategy 3: Content truncation
  const textContent = stripHTML(html);
  if (textContent.length >= 30) {
    return {
      summary: truncate(textContent, maxLength),
      method: 'truncation',
      confidence: 0.4,
    };
  }

  return {
    summary: '',
    method: 'truncation',
    confidence: 0,
  };
}

// ── Helper Functions ───────────────────────────────────────

function extractMetaDescription(html: string): string | null {
  const match = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  );
  return match ? match[1].trim() : null;
}

function extractFirstParagraph(html: string): string | null {
  // Skip nav/header paragraphs, look for content paragraphs
  const paragraphs = html.match(/<p[^>]*>(.+?)<\/p>/gis);
  if (!paragraphs) return null;

  for (const p of paragraphs) {
    const text = stripHTML(p).trim();
    // Skip very short paragraphs (likely UI text)
    if (text.length >= 40 && !text.startsWith('©') && !text.startsWith('Back to')) {
      return text;
    }
  }
  return null;
}

function stripHTML(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.5 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

/**
 * Generate reading time estimate from HTML content
 */
export function estimateReadingTime(html: string): number {
  const words = stripHTML(html).split(/\s+/).filter(w => w.length > 1).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Extract key sentences from content for enhanced summary
 */
export function extractKeySentences(html: string, count: number = 3): string[] {
  const text = stripHTML(html);
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 30 && s.length <= 200);

  // Score sentences by keyword density
  const keywords = ['decision', 'india', 'ai', 'commerce', 'tool', 'research', 'build', 'system'];
  const scored = sentences.map(s => ({
    text: s,
    score: keywords.filter(k => s.toLowerCase().includes(k)).length,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.text);
}
