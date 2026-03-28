#!/usr/bin/env node
/**
 * scripts/geo_ingest.js — VIA Geographic Data Ingest
 *
 * Downloads and normalises GeoJSON map data into data/maps/.
 * Each output file is a trimmed FeatureCollection ready for the
 * VIA world-map viewer (pages/directory/index.html).
 *
 * Usage:
 *   node scripts/geo_ingest.js [--region <name>] [--all]
 *
 * Output:
 *   data/maps/<region>.geojson   — trimmed FeatureCollection
 *   data/maps/index.json         — manifest { regions: [...] }
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const OUT_DIR = path.join(__dirname, '..', 'data', 'maps');

const SOURCES = [
  {
    name: 'india-states',
    label: 'India States',
    url: 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson',
    keepProps: ['NAME_1', 'ID_1'],
    rename: { NAME_1: 'name', ID_1: 'id' }
  },
  {
    name: 'india-districts',
    label: 'India Districts',
    url: 'https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson',
    keepProps: ['NAME_1', 'NAME_2', 'ID_2'],
    rename: { NAME_1: 'state', NAME_2: 'name', ID_2: 'id' }
  },
  {
    name: 'world-countries',
    label: 'World Countries',
    url: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
    keepProps: ['ADMIN', 'ISO_A3'],
    rename: { ADMIN: 'name', ISO_A3: 'iso3' }
  }
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function trimFeature(feature, keepProps, rename) {
  const props = feature.properties || {};
  const trimmed = {};
  (keepProps || []).forEach((key) => {
    const outKey = (rename && rename[key]) ? rename[key] : key;
    trimmed[outKey] = props[key] !== undefined ? props[key] : null;
  });
  return {
    type: 'Feature',
    properties: trimmed,
    geometry: feature.geometry
  };
}

function trimCollection(geoJSON, keepProps, rename) {
  if (geoJSON.type !== 'FeatureCollection') {
    throw new Error('Expected FeatureCollection, got: ' + geoJSON.type);
  }
  return {
    type: 'FeatureCollection',
    features: (geoJSON.features || []).map((f) => trimFeature(f, keepProps, rename))
  };
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
  console.log(`  wrote ${path.basename(filePath)} (${kb} KB)`);
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function ingestRegion(source) {
  console.log(`\n[geo_ingest] ${source.label} — fetching…`);
  const raw = await fetchJSON(source.url);
  const trimmed = trimCollection(raw, source.keepProps, source.rename);
  const outPath = path.join(OUT_DIR, source.name + '.geojson');
  writeJSON(outPath, trimmed);
  return { name: source.name, label: source.label, file: source.name + '.geojson', count: trimmed.features.length };
}

async function run() {
  const args = process.argv.slice(2);
  const regionArg = args.indexOf('--region') !== -1 ? args[args.indexOf('--region') + 1] : null;
  const doAll = args.includes('--all') || (!regionArg);

  const targets = doAll ? SOURCES : SOURCES.filter((s) => s.name === regionArg);
  if (!targets.length) {
    console.error('No matching region. Available:', SOURCES.map((s) => s.name).join(', '));
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const results = [];
  for (const src of targets) {
    try {
      const meta = await ingestRegion(src);
      results.push(meta);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }

  // Update manifest
  const indexPath = path.join(OUT_DIR, 'index.json');
  let manifest = { regions: [] };
  if (fs.existsSync(indexPath)) {
    try { manifest = JSON.parse(fs.readFileSync(indexPath, 'utf8')); } catch (_) {}
  }
  results.forEach((r) => {
    const existing = manifest.regions.findIndex((m) => m.name === r.name);
    if (existing !== -1) manifest.regions[existing] = r;
    else manifest.regions.push(r);
  });
  writeJSON(indexPath, manifest);
  console.log('\n[geo_ingest] Done.');
}

run().catch((e) => { console.error(e); process.exit(1); });
