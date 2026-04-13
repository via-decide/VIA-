/**
 * build_research_index.ts — Zayvora Auto-Indexing Pipeline
 *
 * This script scans the repository for article content, builds the article
 * index and knowledge graph, and writes the output to zayvora/data/.
 *
 * Run during build:
 *   npx ts-node scripts/build_research_index.ts
 *   or: node --loader ts-node/esm scripts/build_research_index.ts
 *
 * What it does:
 *   1. Scans known article directories for .html / .md / .mdx files
 *   2. Extracts: title, summary, date, category, concepts, tags
 *   3. Detects relationships between articles
 *   4. Builds knowledge graph with article/concept/topic nodes
 *   5. Writes articles.json and knowledge_graph.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Import Zayvora modules ──
import {
  type ArticleMeta,
  detectCategory,
  extractConcepts,
  extractTitleFromHTML,
  extractDateFromHTML,
  extractSummaryFromHTML,
  estimateReadTime,
  countWords,
  buildArticleIndex,
} from '../zayvora/core/indexer/article_indexer';

import { KnowledgeGraphBuilder } from '../zayvora/core/graph/knowledge_graph';
import { generateSummary } from '../zayvora/core/summarizer/article_summary';

// ── Configuration ──

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'zayvora', 'data');

// Directories to scan for articles (folder/index.html pattern)
const SCAN_DIRS = [
  '', // root-level folders
];

// Known article slugs to index (these have content pages)
const ARTICLE_SLUGS = [
  'decision-infrastructure-india',
  'ondc-for-bharat',
  'indiaai-mission-2025',
  'multi-source-research-explained',
  'decision-brief-guide',
  'decision-brief',
  'why-small-businesses-dont-need-saas',
  'the-decision-stack',
  'viadecide-decision-matrix',
  'viadecide-opportunity-radar',
  'viadecide-reality-check',
  'laptops-under-50000',
  'finance-dashboard-msme',
  'student-research',
  'prompt-alchemy',
  'alchemist',
  'HexWars',
  'mars-rover-simulator-game',
  'brief',
  'interview-prep',
  'sales-dashboard',
];

// ── Main Pipeline ──

function main(): void {
  console.log('🔍 Zayvora Build Pipeline — Starting...\n');

  const articles: ArticleMeta[] = [];
  const graphBuilder = new KnowledgeGraphBuilder();

  for (const slug of ARTICLE_SLUGS) {
    const filePath = path.join(ROOT, slug, 'index.html');
    if (!fs.existsSync(filePath)) {
      console.log(`  ⏭ Skipping ${slug} (no index.html)`);
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitleFromHTML(html);
    const category = detectCategory(slug, title);
    const concepts = extractConcepts(`${slug} ${title} ${html.slice(0, 2000)}`);
    const summary = generateSummary(html);
    const tags = slug.split('-').filter(t => t.length > 2);

    const article: ArticleMeta = {
      id: slug,
      title,
      slug,
      path: `/${slug}/`,
      format: 'html',
      category,
      tags,
      concepts,
      summary: summary.summary,
      author: 'ViaDecide',
      date: extractDateFromHTML(html),
      readTime: estimateReadTime(html),
      wordCount: countWords(html),
      relatedSlugs: [],
    };

    articles.push(article);

    // Add to knowledge graph
    graphBuilder.addArticle(slug, title, { category, wordCount: article.wordCount });
    graphBuilder.addTopic(category);
    graphBuilder.articleBelongsToTopic(slug, category);

    for (const concept of concepts) {
      graphBuilder.articleMentionsConcept(slug, concept);
    }

    console.log(`  ✓ Indexed: ${title} [${category}] (${concepts.length} concepts)`);
  }

  // Build final index with relationships
  const articleIndex = buildArticleIndex(articles);

  // Connect related articles in graph
  for (const article of articleIndex.articles) {
    for (const relatedSlug of article.relatedSlugs) {
      graphBuilder.articlesRelated(article.slug, relatedSlug);
    }
  }

  const knowledgeGraph = graphBuilder.build();

  // ── Write output ──
  fs.mkdirSync(DATA_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(DATA_DIR, 'articles.json'),
    JSON.stringify(articleIndex, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(DATA_DIR, 'knowledge_graph.json'),
    JSON.stringify(knowledgeGraph, null, 2),
    'utf-8'
  );

  // ── Summary ──
  console.log(`\n✅ Build complete!`);
  console.log(`   Articles:   ${articleIndex.totalArticles}`);
  console.log(`   Categories: ${Object.keys(articleIndex.categories).length}`);
  console.log(`   Concepts:   ${knowledgeGraph.stats.conceptNodes}`);
  console.log(`   Graph:      ${knowledgeGraph.stats.totalNodes} nodes, ${knowledgeGraph.stats.totalEdges} edges`);
  console.log(`   Output:     zayvora/data/articles.json`);
  console.log(`               zayvora/data/knowledge_graph.json`);
}

main();
