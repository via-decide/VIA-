# Monorepo Setup Guide

## Overview
This guide explains how to initialize the ViaDécide monorepo locally using the Phase 0 automation scripts.

## Prerequisites
- Node.js (v18+)
- Bash (Linux/macOS)
- Git (handled by Telegram bot, but required for local dev)

## Setup Steps

### 1. Initialize Directory Structure
Run the following command from your local target monorepo root:
```bash
bash outputs/setup-monorepo.sh
```
This will create the `/shell`, `/tools`, `/services`, and `/shared` directories and copy the base configuration files (`package.json`, `vercel.json`, etc.).

### 2. Populate Tool Directories
The setup script creates the folders, but `init-monorepo.js` creates the actual subdirectories for all 44 tools based on the inventory data.
```bash
node outputs/init-monorepo.js
```
Each tool directory (e.g., `tools/games/robo-os/`) will be populated with a `tool-manifest.json` file.

### 3. Verify Local Setup
Check that your directory structure matches the blueprint:
- `shell/` (Platform UI)
- `tools/core/`, `tools/games/`, etc.
- `services/` (Shared logic)
- `shared/` (Assets/Libs)

## Next: Migration
Once the structure is initialized, you can begin migrating code from the individual repositories by following the Phase 2 instructions in the `migration-checklist.html`.
