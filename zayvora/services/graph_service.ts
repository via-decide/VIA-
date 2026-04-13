/**
 * graph_service.ts — Zayvora Graph Service
 *
 * Provides graph traversal, cluster analysis, and concept exploration
 * on top of the knowledge graph.
 */

import type { KnowledgeGraph, GraphNode, GraphEdge, ClusterInfo } from '../core/graph/knowledge_graph';

// ── Service Interface ──────────────────────────────────────

export interface GraphService {
  getGraph(): KnowledgeGraph;
  getNode(id: string): GraphNode | undefined;
  getNeighbors(nodeId: string): GraphNode[];
  getEdgesFor(nodeId: string): GraphEdge[];
  getClusters(): ClusterInfo[];
  getConceptNodes(): GraphNode[];
  getTopicNodes(): GraphNode[];
  getArticleNodes(): GraphNode[];
  getPathBetween(sourceId: string, targetId: string): GraphNode[];
}

// ── Implementation ─────────────────────────────────────────

export class GraphServiceImpl implements GraphService {
  private graph: KnowledgeGraph;
  private nodeMap: Map<string, GraphNode>;

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
    this.nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  }

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodeMap.get(id);
  }

  getNeighbors(nodeId: string): GraphNode[] {
    const neighborIds = new Set<string>();
    for (const edge of this.graph.edges) {
      if (edge.source === nodeId) neighborIds.add(edge.target);
      if (edge.target === nodeId) neighborIds.add(edge.source);
    }
    return [...neighborIds]
      .map(id => this.nodeMap.get(id))
      .filter((n): n is GraphNode => n !== undefined);
  }

  getEdgesFor(nodeId: string): GraphEdge[] {
    return this.graph.edges.filter(
      e => e.source === nodeId || e.target === nodeId
    );
  }

  getClusters(): ClusterInfo[] {
    return this.graph.stats.clusters;
  }

  getConceptNodes(): GraphNode[] {
    return this.graph.nodes.filter(n => n.type === 'concept');
  }

  getTopicNodes(): GraphNode[] {
    return this.graph.nodes.filter(n => n.type === 'topic');
  }

  getArticleNodes(): GraphNode[] {
    return this.graph.nodes.filter(n => n.type === 'article');
  }

  /**
   * BFS shortest path between two nodes
   */
  getPathBetween(sourceId: string, targetId: string): GraphNode[] {
    if (!this.nodeMap.has(sourceId) || !this.nodeMap.has(targetId)) return [];

    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [
      { id: sourceId, path: [sourceId] },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.id === targetId) {
        return current.path
          .map(id => this.nodeMap.get(id))
          .filter((n): n is GraphNode => n !== undefined);
      }

      if (visited.has(current.id)) continue;
      visited.add(current.id);

      for (const neighbor of this.getNeighbors(current.id)) {
        if (!visited.has(neighbor.id)) {
          queue.push({
            id: neighbor.id,
            path: [...current.path, neighbor.id],
          });
        }
      }
    }
    return [];
  }
}
