/**
 * article_indexer.ts — Zayvora Article Indexer
 *
 * Scans the repository for article-type content, extracts metadata,
 * and generates a structured articles.json index.
 *
 * Scan directories: /articles, /Viadecide-blogs, /research, root tool pages
 * Supported formats: .md, .mdx, .html
 */

// ── Types ──────────────────────────────────────────────────

export interface ArticleMeta {
  id: string;
  title: string;
  slug: string;
  path: string;
  format: 'html' | 'md' | 'mdx';
  category: string;
  tags: string[];
  concepts: string[];
  summary: string;
  author: string;
  date: string;
  readTime: string;
  wordCount: number;
  relatedSlugs: string[];
}

export interface ArticleIndex {
  version: string;
  generated: string;
  totalArticles: number;
  categories: Record<string, number>;
  articles: ArticleMeta[];
}

// ── Category Detection ─────────────────────────────────────

const CATEGORY_RULES: Record<string, RegExp[]> = {
  policy: [/decision-infrastructure/i, /indiaai/i, /policy/i],
  commerce: [/ondc/i, /commerce/i, /msme/i, /small-business/i, /saas/i, /fintrack/i, /finance/i, /sales/i, /payment/i],
  ai: [/ai/i, /alchemist/i, /prompt/i, /machine-learning/i, /llm/i],
  research: [/research/i, /multi-source/i, /wiki/i],
  guide: [/guide/i, /how-to/i, /brief/i, /tutorial/i],
  product: [/decision-matrix/i, /opportunity-radar/i, /reality-check/i, /swipe/i, /study/i],
  interactive: [/decision-stack/i, /hex/i, /game/i, /simulator/i, /quiz/i],
};

export function detectCategory(slug: string, title: string): string {
  const combined = `${slug} ${title}`.toLowerCase();
  for (const [category, patterns] of Object.entries(CATEGORY_RULES)) {
    if (patterns.some(p => p.test(combined))) return category;
  }
  return 'general';
}

// ── Concept Extraction ─────────────────────────────────────

const CONCEPT_KEYWORDS: Record<string, string[]> = {
  'AI': ['ai', 'artificial intelligence', 'machine learning', 'llm', 'neural', 'model'],
  'Zayvora': ['zayvora', 'zayvero', 'agent'],
  'ViaDecide': ['viadecide', 'via decide', 'decision engine', 'decide.engine'],
  'Commerce': ['commerce', 'ondc', 'e-commerce', 'marketplace', 'business'],
  'Knowledge Systems': ['knowledge', 'research', 'wiki', 'index', 'graph', 'semantic'],
  'Decision Science': ['decision', 'matrix', 'tradeoff', 'scoring', 'framework'],
  'India/Bharat': ['india', 'bharat', 'indiaai', 'rupee', 'inr', 'kutch'],
  'MSME': ['msme', 'small business', 'sme', 'startup', 'entrepreneur'],
  'Policy': ['policy', 'government', 'infrastructure', 'regulation'],
  'Open Source': ['open source', 'github', 'apache', 'license'],
};

export function extractConcepts(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [concept, keywords] of Object.entries(CONCEPT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(concept);
    }
  }
  return found;
}

// ── Tag Extraction from HTML ───────────────────────────────

export function extractTitleFromHTML(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].replace(/\s*[—–|·]\s*ViaDecide.*/i, '').trim();

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();

  return 'Untitled';
}

export function extractDateFromHTML(html: string): string {
  // Look for date patterns in meta tags or content
  const metaDate = html.match(/content="(\d{4}-\d{2}-\d{2})"/);
  if (metaDate) return metaDate[1];

  // Look for human-readable dates like "5 Jul 2025"
  const humanDate = html.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})/i);
  if (humanDate) return humanDate[1];

  return new Date().toISOString().split('T')[0];
}

export function extractSummaryFromHTML(html: string): string {
  // Try meta description first
  const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (metaDesc) return metaDesc[1];

  // Try first paragraph
  const pMatch = html.match(/<p[^>]*>([^<]{50,300})<\/p>/i);
  if (pMatch) return pMatch[1].trim();

  return '';
}

export function estimateReadTime(html: string): string {
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = textContent.split(' ').filter(w => w.length > 1).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min read`;
}

export function countWords(html: string): number {
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  return textContent.split(' ').filter(w => w.length > 1).length;
}

// ── Relationship Detection ─────────────────────────────────

export function detectRelated(article: ArticleMeta, allArticles: ArticleMeta[]): string[] {
  const related: string[] = [];
  for (const other of allArticles) {
    if (other.id === article.id) continue;

    // Same category
    const sameCategory = other.category === article.category;

    // Shared concepts
    const sharedConcepts = article.concepts.filter(c => other.concepts.includes(c));

    // Shared tags
    const sharedTags = article.tags.filter(t => other.tags.includes(t));

    const score = (sameCategory ? 2 : 0) + sharedConcepts.length * 3 + sharedTags.length;
    if (score >= 3) {
      related.push(other.slug);
    }
  }
  return related.slice(0, 5);
}

// ── Main Indexer ───────────────────────────────────────────

export function buildArticleIndex(articles: ArticleMeta[]): ArticleIndex {
  // Calculate category counts
  const categories: Record<string, number> = {};
  for (const article of articles) {
    categories[article.category] = (categories[article.category] || 0) + 1;
  }

  // Detect related articles
  for (const article of articles) {
    article.relatedSlugs = detectRelated(article, articles);
  }

  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalArticles: articles.length,
    categories,
    articles,
  };
}
