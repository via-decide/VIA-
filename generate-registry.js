#!/usr/bin/env node
/**
 * generate-registry.js
 * ====================
 * Scans /tools/**/config.json and generates nav-registry.json
 * Run: node generate-registry.js
 * Phase 1 deliverable — keeps registry in sync with tools
 */

const fs = require('fs');
const path = require('path');
const glob = require('path');

const TOOLS_DIR = path.join(__dirname, 'tools');
const OUTPUT = path.join(__dirname, 'nav-registry.json');

const CATEGORY_META = {
  coders:      { label: 'Coder Tools',        icon: '💻', priority: 1 },
  creators:    { label: 'Creator Tools',       icon: '🎨', priority: 2 },
  operators:   { label: 'Operator Tools',      icon: '⚙️', priority: 3 },
  researchers: { label: 'Research Tools',       icon: '🔬', priority: 4 },
  system:      { label: 'System Tools',        icon: '🖥️', priority: 5 },
  education:   { label: 'Education',           icon: '📚', priority: 6 },
  games:       { label: 'Games & Simulations', icon: '🎮', priority: 7 },
  business:    { label: 'Business',            icon: '💼', priority: 8 },
  founders:    { label: 'Founder Tools',       icon: '🚀', priority: 9 },
  engine:      { label: 'Engine Tools',        icon: '⚡', priority: 3 },
  simulations: { label: 'Simulations',         icon: '🧪', priority: 10 },
  misc:        { label: 'Miscellaneous',       icon: '🔧', priority: 99 },
};

function findConfigs(dir, results) {
  results = results || [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findConfigs(full, results);
    } else if (entry.name === 'config.json') {
      results.push(full);
    }
  }
  return results;
}

function run() {
  console.log('🔍 Scanning tools directory...');
  const configs = findConfigs(TOOLS_DIR);
  console.log(`   Found ${configs.length} tool configs`);

  const tools = [];
  const catCounts = {};

  for (const cfgPath of configs) {
    try {
      const raw = fs.readFileSync(cfgPath, 'utf8');
      const cfg = JSON.parse(raw);
      const toolDir = path.relative(__dirname, path.dirname(cfgPath)).replace(/\\/g, '/');
      const cat = cfg.category || 'misc';

      tools.push({
        id: cfg.id || path.basename(path.dirname(cfgPath)),
        title: cfg.title || cfg.name || path.basename(path.dirname(cfgPath)),
        description: cfg.description || '',
        category: cat,
        path: '/' + toolDir + '/',
        entry: (cfg.entry || toolDir + '/index.html'),
        tags: cfg.tags || [],
        audience: Array.isArray(cfg.audience) ? cfg.audience : [cfg.audience || 'general'],
        inputs: cfg.inputs || [],
        outputs: cfg.outputs || [],
        relatedTools: cfg.relatedTools || [],
        status: 'active',
        icon: (CATEGORY_META[cat] || {}).icon || '🔧',
      });

      catCounts[cat] = (catCounts[cat] || 0) + 1;
    } catch (err) {
      console.warn(`   ⚠️ Skipped ${cfgPath}: ${err.message}`);
    }
  }

  // Build categories
  const categories = {};
  for (const cat of Object.keys(catCounts).sort()) {
    const meta = CATEGORY_META[cat] || { label: cat.charAt(0).toUpperCase() + cat.slice(1), icon: '📂', priority: 50 };
    categories[cat] = { ...meta, count: catCounts[cat] };
  }

  // Sort tools by category priority then title
  tools.sort((a, b) => {
    const pa = (categories[a.category] || {}).priority || 99;
    const pb = (categories[b.category] || {}).priority || 99;
    if (pa !== pb) return pa - pb;
    return (a.title || '').localeCompare(b.title || '');
  });

  const registry = {
    $schema: 'nav-registry-v1',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    organization: 'via-decide',
    totalTools: tools.length,
    categories,
    tools,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(registry, null, 2));
  console.log(`\n✅ Generated ${OUTPUT}`);
  console.log(`   ${tools.length} tools across ${Object.keys(categories).length} categories`);
  for (const [cat, info] of Object.entries(categories).sort((a, b) => a[1].priority - b[1].priority)) {
    console.log(`   ${info.icon} ${info.label}: ${info.count}`);
  }
}

run();
