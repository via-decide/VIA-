/**
 * semantic_search.ts — Zayvora Semantic Search Engine
 *
 * Provides keyword search, semantic similarity, and concept search
 * across the article index. Works client-side with no external dependencies.
 *
 * Input: query string
 * Output: ranked article list with relevance scores
 */

import type { ArticleMeta } from '../indexer/article_indexer';

// ── Types ──────────────────────────────────────────────────

export interface SearchResult {
  article: ArticleMeta;
  score: number;
  matchType: 'title' | 'concept' | 'tag' | 'category' | 'content';
  highlights: string[];
}

export interface SearchOptions {
  maxResults?: number;
  category?: string;
  concept?: string;
  minScore?: number;
}

// ── Text Processing ────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
  'how', 'when', 'where', 'why', 'it', 'its', 'he', 'she', 'they',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Calculate TF-IDF-like relevance between query and document
 */
export function calculateRelevance(queryTokens: string[], docTokens: string[]): number {
  if (queryTokens.length === 0 || docTokens.length === 0) return 0;

  const docSet = new Set(docTokens);
  let matchCount = 0;
  let exactBonus = 0;

  for (const qt of queryTokens) {
    if (docSet.has(qt)) {
      matchCount++;
    }
    // Partial match bonus
    for (const dt of docTokens) {
      if (dt.includes(qt) || qt.includes(dt)) {
        exactBonus += 0.3;
      }
    }
  }

  const coverage = matchCount / queryTokens.length;
  const density = matchCount / Math.max(docTokens.length, 1);

  return (coverage * 0.6) + (density * 0.2) + Math.min(exactBonus * 0.2, 0.2);
}

// ── Search Engine ──────────────────────────────────────────

export function searchArticles(
  query: string,
  articles: ArticleMeta[],
  options: SearchOptions = {}
): SearchResult[] {
  const { maxResults = 10, category, concept, minScore = 0.05 } = options;
  const queryTokens = tokenize(query);
  const queryLower = query.toLowerCase();

  if (queryTokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const article of articles) {
    // Apply filters
    if (category && article.category !== category) continue;
    if (concept && !article.concepts.includes(concept)) continue;

    let bestScore = 0;
    let bestType: SearchResult['matchType'] = 'content';
    const highlights: string[] = [];

    // 1. Title match (highest weight)
    const titleScore = calculateRelevance(queryTokens, tokenize(article.title));
    if (titleScore > 0) {
      bestScore = Math.max(bestScore, titleScore * 1.5);
      bestType = 'title';
      highlights.push(`Title: ${article.title}`);
    }

    // 2. Exact title substring
    if (article.title.toLowerCase().includes(queryLower)) {
      bestScore = Math.max(bestScore, 0.9);
      bestType = 'title';
    }

    // 3. Concept match (high weight)
    for (const c of article.concepts) {
      const conceptScore = calculateRelevance(queryTokens, tokenize(c));
      if (conceptScore > 0) {
        bestScore = Math.max(bestScore, conceptScore * 1.2);
        bestType = 'concept';
        highlights.push(`Concept: ${c}`);
      }
      // Direct concept name match
      if (c.toLowerCase().includes(queryLower)) {
        bestScore = Math.max(bestScore, 0.8);
        bestType = 'concept';
        highlights.push(`Concept: ${c}`);
      }
    }

    // 4. Tag match
    for (const tag of article.tags) {
      if (tag.toLowerCase().includes(queryLower) || queryLower.includes(tag.toLowerCase())) {
        bestScore = Math.max(bestScore, 0.6);
        bestType = 'tag';
        highlights.push(`Tag: ${tag}`);
      }
    }

    // 5. Category match
    if (article.category.toLowerCase().includes(queryLower)) {
      bestScore = Math.max(bestScore, 0.5);
      bestType = 'category';
      highlights.push(`Category: ${article.category}`);
    }

    // 6. Summary/content match
    const summaryScore = calculateRelevance(queryTokens, tokenize(article.summary));
    if (summaryScore > 0) {
      bestScore = Math.max(bestScore, summaryScore * 0.8);
      if (bestType === 'content') highlights.push('Matched in summary');
    }

    // 7. Slug match bonus
    const slugScore = calculateRelevance(queryTokens, article.slug.split('-'));
    if (slugScore > 0) {
      bestScore = Math.max(bestScore, slugScore * 0.7);
    }

    if (bestScore >= minScore) {
      results.push({
        article,
        score: Math.round(bestScore * 1000) / 1000,
        matchType: bestType,
        highlights: [...new Set(highlights)].slice(0, 3),
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

/**
 * Search by concept — returns all articles connected to a concept
 */
export function searchByConcept(concept: string, articles: ArticleMeta[]): ArticleMeta[] {
  return articles.filter(a =>
    a.concepts.some(c => c.toLowerCase() === concept.toLowerCase())
  );
}

/**
 * Get related articles for a given article
 */
export function getRelatedArticles(slug: string, articles: ArticleMeta[]): ArticleMeta[] {
  const article = articles.find(a => a.slug === slug);
  if (!article) return [];

  return article.relatedSlugs
    .map(s => articles.find(a => a.slug === s))
    .filter((a): a is ArticleMeta => a !== undefined);
}
