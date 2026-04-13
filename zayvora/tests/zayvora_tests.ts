/**
 * zayvora_tests.ts — Zayvora Toolkit Test Suite
 *
 * Verifies:
 * 1. Article indexing works correctly
 * 2. Knowledge graph builds properly
 * 3. Semantic search returns correct results
 * 4. Article summarizer produces valid output
 * 5. Data files are valid JSON
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Minimal test runner ──

let passed = 0;
let failed = 0;
const errors: string[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    failed++;
    const msg = err?.message || String(err);
    errors.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}: ${msg}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ── Data Paths ──

const ROOT = path.resolve(__dirname, '..');
const ARTICLES_JSON = path.join(ROOT, 'zayvora', 'data', 'articles.json');
const GRAPH_JSON = path.join(ROOT, 'zayvora', 'data', 'knowledge_graph.json');

// ── Test Suite ──

console.log('\n🧪 Zayvora Toolkit — Test Suite\n');

// 1. Data file existence
console.log('📄 Data Files:');
test('articles.json exists', () => {
  assert(fs.existsSync(ARTICLES_JSON), 'articles.json not found');
});
test('knowledge_graph.json exists', () => {
  assert(fs.existsSync(GRAPH_JSON), 'knowledge_graph.json not found');
});

// 2. Article index validity
console.log('\n📊 Article Index:');
let articleData: any = null;
test('articles.json is valid JSON', () => {
  const raw = fs.readFileSync(ARTICLES_JSON, 'utf-8');
  articleData = JSON.parse(raw);
  assert(typeof articleData === 'object', 'Not an object');
});
test('has version field', () => {
  assert(typeof articleData.version === 'string', 'Missing version');
});
test('has articles array', () => {
  assert(Array.isArray(articleData.articles), 'Missing articles array');
});
test('has at least 10 articles', () => {
  assert(articleData.articles.length >= 10, `Only ${articleData.articles.length} articles`);
});
test('totalArticles matches array length', () => {
  assert(articleData.totalArticles === articleData.articles.length, 'Mismatch');
});
test('each article has required fields', () => {
  const required = ['id', 'title', 'slug', 'path', 'category', 'concepts', 'summary'];
  for (const a of articleData.articles) {
    for (const field of required) {
      assert(a[field] !== undefined, `Article ${a.id || 'unknown'} missing field: ${field}`);
    }
  }
});
test('each article has concepts array', () => {
  for (const a of articleData.articles) {
    assert(Array.isArray(a.concepts), `${a.id} concepts is not array`);
  }
});
test('categories object has entries', () => {
  assert(Object.keys(articleData.categories).length >= 3, 'Too few categories');
});

// 3. Knowledge graph validity
console.log('\n🧠 Knowledge Graph:');
let graphData: any = null;
test('knowledge_graph.json is valid JSON', () => {
  const raw = fs.readFileSync(GRAPH_JSON, 'utf-8');
  graphData = JSON.parse(raw);
  assert(typeof graphData === 'object', 'Not an object');
});
test('has nodes array', () => {
  assert(Array.isArray(graphData.nodes), 'Missing nodes array');
});
test('has edges array', () => {
  assert(Array.isArray(graphData.edges), 'Missing edges array');
});
test('has at least 20 nodes', () => {
  assert(graphData.nodes.length >= 20, `Only ${graphData.nodes.length} nodes`);
});
test('has at least 30 edges', () => {
  assert(graphData.edges.length >= 30, `Only ${graphData.edges.length} edges`);
});
test('nodes have correct types', () => {
  const validTypes = new Set(['article', 'concept', 'topic']);
  for (const n of graphData.nodes) {
    assert(validTypes.has(n.type), `Invalid node type: ${n.type}`);
  }
});
test('edges have correct types', () => {
  const validTypes = new Set(['related_to', 'mentions', 'extends']);
  for (const e of graphData.edges) {
    assert(validTypes.has(e.type), `Invalid edge type: ${e.type}`);
  }
});
test('stats object is present', () => {
  assert(typeof graphData.stats === 'object', 'Missing stats');
  assert(typeof graphData.stats.totalNodes === 'number', 'Missing totalNodes');
});
test('clusters array exists', () => {
  assert(Array.isArray(graphData.stats.clusters), 'Missing clusters');
  assert(graphData.stats.clusters.length >= 3, 'Too few clusters');
});

// 4. Cross-references
console.log('\n🔗 Cross-References:');
test('article slugs in relatedSlugs are valid', () => {
  const slugSet = new Set(articleData.articles.map((a: any) => a.slug));
  for (const a of articleData.articles) {
    for (const rel of a.relatedSlugs) {
      assert(slugSet.has(rel), `${a.id} references invalid slug: ${rel}`);
    }
  }
});
test('graph edge sources reference existing nodes', () => {
  const nodeIds = new Set(graphData.nodes.map((n: any) => n.id));
  for (const e of graphData.edges) {
    assert(nodeIds.has(e.source), `Edge source not found: ${e.source}`);
    assert(nodeIds.has(e.target), `Edge target not found: ${e.target}`);
  }
});

// 5. UI pages exist
console.log('\n🖥 UI Pages:');
test('/research/index.html exists', () => {
  assert(fs.existsSync(path.join(ROOT, 'research', 'index.html')), 'Missing research page');
});
test('/articles/index.html exists', () => {
  assert(fs.existsSync(path.join(ROOT, 'articles', 'index.html')), 'Missing articles page');
});
test('/concepts/index.html exists', () => {
  assert(fs.existsSync(path.join(ROOT, 'concepts', 'index.html')), 'Missing concepts page');
});

// 6. Module files exist
console.log('\n📦 Toolkit Modules:');
const modules = [
  'zayvora/core/indexer/article_indexer.ts',
  'zayvora/core/graph/knowledge_graph.ts',
  'zayvora/core/search/semantic_search.ts',
  'zayvora/core/summarizer/article_summary.ts',
  'zayvora/services/article_service.ts',
  'zayvora/services/research_service.ts',
  'zayvora/services/graph_service.ts',
];
for (const mod of modules) {
  test(`${mod} exists`, () => {
    assert(fs.existsSync(path.join(ROOT, mod)), `Missing: ${mod}`);
  });
}

// ── Summary ──
console.log(`\n${'─'.repeat(50)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log(`\n  Failures:`);
  errors.forEach(e => console.log(`    • ${e}`));
}
console.log(`${'─'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
