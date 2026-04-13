/**
 * knowledge_graph.ts — Zayvora Knowledge Graph Engine
 *
 * Analyzes article relationships, builds a concept network,
 * and connects related ideas across the platform.
 *
 * Node types: article, concept, topic
 * Edge types: related_to, mentions, extends
 */

// ── Types ──────────────────────────────────────────────────

export type NodeType = 'article' | 'concept' | 'topic';
export type EdgeType = 'related_to' | 'mentions' | 'extends';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  metadata: Record<string, unknown>;
  weight: number; // connectivity score
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeGraph {
  version: string;
  generated: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  articleNodes: number;
  conceptNodes: number;
  topicNodes: number;
  avgConnections: number;
  clusters: ClusterInfo[];
}

export interface ClusterInfo {
  concept: string;
  articleCount: number;
  articles: string[];
}

// ── Graph Builder ──────────────────────────────────────────

export class KnowledgeGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  /**
   * Add an article node to the graph
   */
  addArticle(id: string, title: string, meta: Record<string, unknown> = {}): void {
    this.nodes.set(`article:${id}`, {
      id: `article:${id}`,
      type: 'article',
      label: title,
      metadata: meta,
      weight: 1,
    });
  }

  /**
   * Add a concept node to the graph
   */
  addConcept(name: string): void {
    const id = `concept:${this.slugify(name)}`;
    if (this.nodes.has(id)) {
      // Increase weight for existing concepts
      const node = this.nodes.get(id)!;
      node.weight += 1;
      return;
    }
    this.nodes.set(id, {
      id,
      type: 'concept',
      label: name,
      metadata: {},
      weight: 1,
    });
  }

  /**
   * Add a topic node to the graph
   */
  addTopic(category: string): void {
    const id = `topic:${this.slugify(category)}`;
    if (this.nodes.has(id)) return;
    this.nodes.set(id, {
      id,
      type: 'topic',
      label: category.charAt(0).toUpperCase() + category.slice(1),
      metadata: {},
      weight: 1,
    });
  }

  /**
   * Create an edge between two nodes
   */
  connect(sourceId: string, targetId: string, type: EdgeType, weight: number = 1): void {
    // Avoid duplicate edges
    const exists = this.edges.some(
      e => e.source === sourceId && e.target === targetId && e.type === type
    );
    if (exists) return;

    this.edges.push({ source: sourceId, target: targetId, type, weight });
  }

  /**
   * Connect an article to a concept
   */
  articleMentionsConcept(articleSlug: string, conceptName: string): void {
    const articleId = `article:${articleSlug}`;
    const conceptId = `concept:${this.slugify(conceptName)}`;

    this.addConcept(conceptName);
    this.connect(articleId, conceptId, 'mentions');
  }

  /**
   * Connect an article to a topic/category
   */
  articleBelongsToTopic(articleSlug: string, category: string): void {
    const articleId = `article:${articleSlug}`;
    const topicId = `topic:${this.slugify(category)}`;

    this.addTopic(category);
    this.connect(articleId, topicId, 'extends');
  }

  /**
   * Connect two related articles
   */
  articlesRelated(slugA: string, slugB: string, weight: number = 1): void {
    this.connect(`article:${slugA}`, `article:${slugB}`, 'related_to', weight);
  }

  /**
   * Build the final knowledge graph with stats
   */
  build(): KnowledgeGraph {
    const nodesArray = Array.from(this.nodes.values());

    // Calculate connectivity weight for each node
    for (const node of nodesArray) {
      node.weight = this.edges.filter(
        e => e.source === node.id || e.target === node.id
      ).length;
    }

    // Build cluster info
    const conceptNodes = nodesArray.filter(n => n.type === 'concept');
    const clusters: ClusterInfo[] = conceptNodes.map(concept => {
      const connectedArticles = this.edges
        .filter(e => e.target === concept.id && e.type === 'mentions')
        .map(e => e.source.replace('article:', ''));
      return {
        concept: concept.label,
        articleCount: connectedArticles.length,
        articles: connectedArticles,
      };
    }).filter(c => c.articleCount > 0)
      .sort((a, b) => b.articleCount - a.articleCount);

    const stats: GraphStats = {
      totalNodes: nodesArray.length,
      totalEdges: this.edges.length,
      articleNodes: nodesArray.filter(n => n.type === 'article').length,
      conceptNodes: conceptNodes.length,
      topicNodes: nodesArray.filter(n => n.type === 'topic').length,
      avgConnections: nodesArray.length > 0
        ? Math.round((this.edges.length * 2 / nodesArray.length) * 100) / 100
        : 0,
      clusters,
    };

    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      nodes: nodesArray,
      edges: this.edges,
      stats,
    };
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
