# Repository Inventory Tool Guide

## Introduction
The `inventory-dashboard.html` is a self-contained tool designed to provide a "Mission Control" view of all 44 repositories in the ViaDécide organization.

## How to Use
1. **Open the File**: Open `outputs/inventory-dashboard.html` in any modern web browser.
2. **Filter & Search**: Use the sidebar to filter repos by Category (Core, Games, etc.) or Status (Active, Archived). Use the search bar to find specific repos by name or description.
3. **Sort**: Click on any table header to sort the inventory.
4. **Prioritize**: The "Priority" column indicates the suggested migration order (P1-P3).
5. **Export**: Use the "Export CSV" or "Export JSON" buttons to save the current filtered data for use in other tools or spreadsheets.

## Data Source
The dashboard is powered by `repos-inventory.json`. If you need to add or update repository metadata:
1. Edit `outputs/repos-inventory.json`.
2. Refresh the dashboard in your browser.

## Success Criteria for Phase 0 Inventory
- [ ] All 44 repositories are catalogued.
- [ ] Categories reflect the target monorepo structure.
- [ ] High-impact tools (e.g., `decide.engine-tools`) are marked as P1 Priority.
