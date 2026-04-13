/**
 * article_service.ts — Zayvora Article Service
 *
 * Provides article CRUD operations, retrieval by slug/category/concept,
 * and article metadata management.
 */

import type { ArticleMeta, ArticleIndex } from '../core/indexer/article_indexer';

// ── Service Interface ──────────────────────────────────────

export interface ArticleService {
  getAll(): ArticleMeta[];
  getBySlug(slug: string): ArticleMeta | undefined;
  getByCategory(category: string): ArticleMeta[];
  getByConcept(concept: string): ArticleMeta[];
  getRelated(slug: string): ArticleMeta[];
  getRecent(count: number): ArticleMeta[];
  getCategories(): Record<string, number>;
  getConcepts(): string[];
  getTotalCount(): number;
}

// ── Implementation ─────────────────────────────────────────

export class ArticleServiceImpl implements ArticleService {
  private articles: ArticleMeta[];
  private index: ArticleIndex;

  constructor(index: ArticleIndex) {
    this.index = index;
    this.articles = index.articles;
  }

  getAll(): ArticleMeta[] {
    return [...this.articles];
  }

  getBySlug(slug: string): ArticleMeta | undefined {
    return this.articles.find(a => a.slug === slug);
  }

  getByCategory(category: string): ArticleMeta[] {
    return this.articles.filter(a => a.category === category);
  }

  getByConcept(concept: string): ArticleMeta[] {
    return this.articles.filter(a =>
      a.concepts.some(c => c.toLowerCase() === concept.toLowerCase())
    );
  }

  getRelated(slug: string): ArticleMeta[] {
    const article = this.getBySlug(slug);
    if (!article) return [];
    return article.relatedSlugs
      .map(s => this.getBySlug(s))
      .filter((a): a is ArticleMeta => a !== undefined);
  }

  getRecent(count: number = 5): ArticleMeta[] {
    return [...this.articles]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  }

  getCategories(): Record<string, number> {
    return { ...this.index.categories };
  }

  getConcepts(): string[] {
    const concepts = new Set<string>();
    for (const article of this.articles) {
      for (const c of article.concepts) {
        concepts.add(c);
      }
    }
    return [...concepts].sort();
  }

  getTotalCount(): number {
    return this.index.totalArticles;
  }
}
