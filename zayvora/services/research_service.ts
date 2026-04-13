/**
 * research_service.ts — Zayvora Research Engine API
 *
 * Exposes the Zayvora toolkit via a service layer.
 * In production, this maps to HTTP endpoints or module imports.
 *
 * Endpoints:
 *   GET /research/search?q=<query>     — semantic search
 *   GET /research/articles             — all articles
 *   GET /research/articles/:slug       — single article
 *   GET /research/graph                — knowledge graph
 *   GET /research/concepts             — concept list
 *   GET /research/concepts/:name       — articles for concept
 */

import type { ArticleMeta, ArticleIndex } from '../core/indexer/article_indexer';
import type { KnowledgeGraph } from '../core/graph/knowledge_graph';
import type { SearchResult, SearchOptions } from '../core/search/semantic_search';

// ── Service Interface ──────────────────────────────────────

export interface ResearchService {
  search(query: string, options?: SearchOptions): SearchResult[];
  getAllArticles(): ArticleMeta[];
  getArticle(slug: string): ArticleMeta | undefined;
  getArticlesByCategory(category: string): ArticleMeta[];
  getGraph(): KnowledgeGraph;
  getConcepts(): string[];
  getArticlesForConcept(concept: string): ArticleMeta[];
  getRelatedArticles(slug: string): ArticleMeta[];
  getStats(): ResearchStats;
}

export interface ResearchStats {
  totalArticles: number;
  totalConcepts: number;
  totalCategories: number;
  graphNodes: number;
  graphEdges: number;
  topConcepts: Array<{ name: string; count: number }>;
}

// ── Implementation ─────────────────────────────────────────

export class ResearchServiceImpl implements ResearchService {
  private articleIndex: ArticleIndex;
  private knowledgeGraph: KnowledgeGraph;
  private searchFn: (q: string, articles: ArticleMeta[], opts?: SearchOptions) => SearchResult[];

  constructor(
    articleIndex: ArticleIndex,
    knowledgeGraph: KnowledgeGraph,
    searchFn: (q: string, articles: ArticleMeta[], opts?: SearchOptions) => SearchResult[]
  ) {
    this.articleIndex = articleIndex;
    this.knowledgeGraph = knowledgeGraph;
    this.searchFn = searchFn;
  }

  search(query: string, options?: SearchOptions): SearchResult[] {
    return this.searchFn(query, this.articleIndex.articles, options);
  }

  getAllArticles(): ArticleMeta[] {
    return this.articleIndex.articles;
  }

  getArticle(slug: string): ArticleMeta | undefined {
    return this.articleIndex.articles.find(a => a.slug === slug);
  }

  getArticlesByCategory(category: string): ArticleMeta[] {
    return this.articleIndex.articles.filter(a => a.category === category);
  }

  getGraph(): KnowledgeGraph {
    return this.knowledgeGraph;
  }

  getConcepts(): string[] {
    const concepts = new Set<string>();
    for (const a of this.articleIndex.articles) {
      for (const c of a.concepts) concepts.add(c);
    }
    return [...concepts].sort();
  }

  getArticlesForConcept(concept: string): ArticleMeta[] {
    return this.articleIndex.articles.filter(a =>
      a.concepts.some(c => c.toLowerCase() === concept.toLowerCase())
    );
  }

  getRelatedArticles(slug: string): ArticleMeta[] {
    const article = this.articleIndex.articles.find(a => a.slug === slug);
    if (!article) return [];
    return article.relatedSlugs
      .map(s => this.articleIndex.articles.find(a => a.slug === s))
      .filter((a): a is ArticleMeta => a !== undefined);
  }

  getStats(): ResearchStats {
    const concepts = this.getConcepts();
    const conceptCounts = concepts.map(c => ({
      name: c,
      count: this.getArticlesForConcept(c).length,
    })).sort((a, b) => b.count - a.count);

    return {
      totalArticles: this.articleIndex.totalArticles,
      totalConcepts: concepts.length,
      totalCategories: Object.keys(this.articleIndex.categories).length,
      graphNodes: this.knowledgeGraph.stats.totalNodes,
      graphEdges: this.knowledgeGraph.stats.totalEdges,
      topConcepts: conceptCounts.slice(0, 10),
    };
  }
}
