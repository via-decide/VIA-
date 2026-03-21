#!/bin/bash
# Phase 0: Initialize ViaDécide monorepo structure
# Created by Claude Code for the viadecide organization consolidation project.

echo "🚀 ViaDécide Monorepo Scaffolder"
echo "================================"

# 1. Create directory structure
echo "📁 Creating directory structure..."
mkdir -p shell services shared/{assets,lib} tools/{core,games,productivity,education,experiments}
echo "✅ Directories created."

# 2. Copy core configuration files
echo "📄 Copying configuration templates..."
[ -f "package.json" ] && cp package.json ../package.json_template || echo "⚠️ package.json not found in current dir"
[ -f "vercel.json" ] && cp vercel.json ../vercel.json_template || echo "⚠️ vercel.json not found in current dir"

# In the actual monorepo root:
cat > .gitignore << 'EOF'
node_modules/
.env.local
.DS_Store
*.log
dist/
build/
.vercel/
outputs/
EOF

# 3. Create .github/workflows directory
mkdir -p .github/workflows
[ -f ".github-workflows-deploy.yml" ] && cp .github-workflows-deploy.yml .github/workflows/deploy.yml

echo "✅ Config files initialized."

# 4. Success message
echo ""
echo "✨ Monorepo structure is ready!"
echo "------------------------------"
echo "Next steps:"
echo "1. Review repos-inventory.json"
echo "2. Run 'node init-monorepo.js' to create tool directories"
echo "3. Consult PHASE_0_README.md for the full roadmap"
echo ""
