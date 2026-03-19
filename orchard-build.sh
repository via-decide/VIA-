#!/bin/bash
# Cloudflare Pages build script for Orchard subapp
# Set this as the build command in Cloudflare Pages settings:
#   Build command: bash orchard-build.sh
#   Build output directory: orchard/dist
#   Root directory: / (repo root)

set -e

echo "Building Orchard game..."
cd orchard
npm install
npm run build
echo "Build complete. Output at orchard/dist/"
