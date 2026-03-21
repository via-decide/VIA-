#!/usr/bin/env node

/**
 * Phase 0: Initialize ViaDécide Monorepo
 * Populates the local structure with tool directories and manifests
 * based on the repository inventory metadata.
 */

const fs = require('fs');
const path = require('path');

const INVENTORY_PATH = './repos-inventory.json';
const TOOLS_ROOT = './tools';

console.log('🚀 ViaDécide Monorepo Initializer\n');

if (!fs.existsSync(INVENTORY_PATH)) {
    console.error('❌ Error: repos-inventory.json not found.');
    process.exit(1);
}

try {
    const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
    console.log(`📋 Found ${inventory.totalRepositories} repositories in inventory.\n`);

    inventory.repositories.forEach(repo => {
        if (repo.status === 'delete') {
            console.log(`⏩ Skipping ${repo.name} (Status: delete)`);
            return;
        }

        const category = repo.category;
        const toolId = repo.id;
        const destPath = path.join(TOOLS_ROOT, category, toolId);

        // Create directory
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
            console.log(`✅ Created ${destPath}`);
        } else {
            console.log(`ℹ️  Path already exists: ${destPath}`);
        }

        // Create tool-manifest.json
        const manifest = {
            id: toolId,
            name: repo.name,
            category: category,
            version: '1.0.0',
            entry: 'index.html',
            description: repo.description,
            status: 'pending-migration',
            migrationDate: null,
            dependencies: repo.dependencies || [],
            externalApis: repo.externalApis || [],
            notes: `Auto-generated from ${repo.githubUrl}`
        };

        fs.writeFileSync(
            path.join(destPath, 'tool-manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        console.log(`   └─ Manifest generated.`);
    });

    console.log('\n✨ Initialization complete!');
    console.log(`📂 ${inventory.totalRepositories} tools processed.`);

} catch (err) {
    console.error('❌ Error during initialization:', err.message);
    process.exit(1);
}
