/**
 * VIA Orchard Game Component v1.0.0
 * Self-contained farming game with Phase 1 (core) and Phase 2 (advanced) features
 * WCAG AA Accessible, Responsive (375px-4K), Zero Dependencies
 */

class ViaOrchardGame {
  constructor(options = {}) {
    this.containerId = options.containerId || 'orchard-container';
    this.storageKey = options.storageKey || 'via_orchard_state';
    this.autoSave = options.autoSave !== false;
    this.autoSaveInterval = options.autoSaveInterval || 30000;

    // Game state
    this.gameState = null;
    this.growthIntervals = new Map();
    this.initialized = false;
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  async init() {
    try {
      this.showSkeleton();
      this.initializeGameState();
      this.setupEventListeners();
      this.render();
      this.startAutoSave();
      this.startDayTickTimer();
      this.initialized = true;
      this.hideSkeleton();
      this.announce('Orchard game loaded successfully');
    } catch (error) {
      console.error('Orchard init error:', error);
      this.showError('Failed to load orchard game. Please refresh.');
    }
  }

  initializeGameState() {
    const saved = this.loadFromStorage();

    if (saved && saved.version === 1) {
      this.gameState = saved;
    } else {
      this.gameState = this.getDefaultState();
    }
  }

  getDefaultState() {
    return {
      version: 1,
      day: 1,
      credits: 100,
      seeds: 0,
      totalHarvests: 0,
      weather: 'clear',
      weatherChangeDay: 3,
      orchards: [
        {
          id: 'orchard-1',
          name: 'Primary Orchard',
          emoji: '🌾',
          unlocked: true,
          unlockCost: 0,
          plants: Array(9).fill(null),
          maxPlants: 9
        },
        {
          id: 'orchard-2',
          name: 'Highland Ridge',
          emoji: '⛰️',
          unlocked: false,
          unlockCost: 250,
          plants: Array(12).fill(null),
          maxPlants: 12
        },
        {
          id: 'orchard-3',
          name: 'Deep Valley',
          emoji: '🏔️',
          unlocked: false,
          unlockCost: 750,
          plants: Array(15).fill(null),
          maxPlants: 15
        }
      ],
      inventory: {
        fertilizer: 0,
        pesticide: 0,
        seeds: 0
      },
      tools: this.getDefaultTools(),
      stats: {
        totalPlanted: 0,
        totalHarvested: 0,
        totalCreditsEarned: 0,
        rareHarvests: 0
      }
    };
  }

  getDefaultTools() {
    return [
      { id: 'watering', name: 'Watering Can', emoji: '💧', level: 0, maxLevel: 5, cost: 100, multiplier: 1.5, efficiency: 1.15, desc: 'Boost plant hydration +15% per level' },
      { id: 'soil', name: 'Soil Tester', emoji: '🔬', level: 0, maxLevel: 5, cost: 150, multiplier: 1.6, efficiency: 0.9, desc: 'Reduce nutrient drain -10% per level' },
      { id: 'pest', name: 'Pest Control', emoji: '🐛', level: 0, maxLevel: 5, cost: 200, multiplier: 1.8, efficiency: 0.8, desc: 'Reduce pests -20% per level' },
      { id: 'speed', name: 'Growth Accelerator', emoji: '⚡', level: 0, maxLevel: 5, cost: 180, multiplier: 1.7, efficiency: 1.2, desc: 'Speed up growth +20% per level' }
    ];
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load from storage:', error);
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.gameState));
      return true;
    } catch (error) {
      console.warn('Failed to save to storage:', error);
      this.announce('Warning: Could not save progress');
      return false;
    }
  }

  startAutoSave() {
    if (this.autoSave) {
      setInterval(() => this.saveToStorage(), this.autoSaveInterval);
    }
  }

  startDayTickTimer() {
    // Advance day every 60 seconds (can be adjusted)
    setInterval(() => {
      this.gameState.day++;
      if (this.gameState.day % 3 === 0) {
        this.changeWeather();
      }
      this.render();
      this.saveToStorage();
    }, 60000);
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT LISTENERS & KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  setupEventListeners() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container #${this.containerId} not found`);
    }

    // Tab navigation
    container.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) {
        this.switchTab(tab.dataset.tab);
      }
    });

    // Tab keyboard navigation (Arrow keys)
    container.addEventListener('keydown', (e) => {
      if (e.target.getAttribute('role') === 'tab') {
        const tabs = container.querySelectorAll('[role="tab"]');
        const currentIndex = Array.from(tabs).indexOf(e.target);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = tabs[(currentIndex + 1) % tabs.length];
          next.focus();
          this.switchTab(next.dataset.tab);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
          prev.focus();
          this.switchTab(prev.dataset.tab);
        } else if (e.key === 'Home') {
          e.preventDefault();
          tabs[0].focus();
          this.switchTab(tabs[0].dataset.tab);
        } else if (e.key === 'End') {
          e.preventDefault();
          tabs[tabs.length - 1].focus();
          this.switchTab(tabs[tabs.length - 1].dataset.tab);
        }
      }
    });

    // Plant slot clicks
    container.addEventListener('click', (e) => {
      const slot = e.target.closest('[data-orchard-id][data-plant-idx]');
      if (slot) {
        const orchardId = slot.dataset.orchardId;
        const plantIdx = parseInt(slot.dataset.plantIdx);
        this.handlePlantSlotClick(orchardId, plantIdx);
      }
    });

    // Plant slot keyboard (Enter/Space)
    container.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-orchard-id][data-plant-idx]')) {
        e.preventDefault();
        const slot = e.target;
        const orchardId = slot.dataset.orchardId;
        const plantIdx = parseInt(slot.dataset.plantIdx);
        this.handlePlantSlotClick(orchardId, plantIdx);
      }
    });

    // Unlock orchard
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-unlock-orchard]');
      if (btn) {
        this.unlockOrchard(btn.dataset.unlockOrchard);
      }
    });

    // Shop buy
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-buy-item]');
      if (btn) {
        this.buyShopItem(btn.dataset.buyItem);
      }
    });

    // Tool upgrade
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-upgrade-tool]');
      if (btn) {
        this.upgradeTool(btn.dataset.upgradeTool);
      }
    });

    // Error retry
    container.addEventListener('click', (e) => {
      if (e.target.id === 'orchard-error-retry') {
        this.init();
      }
    });
  }

  switchTab(tabName) {
    const container = document.getElementById(this.containerId);

    // Update tab buttons
    container.querySelectorAll('[role="tab"]').forEach(tab => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Update panels
    container.querySelectorAll('[role="tabpanel"]').forEach(panel => {
      const isActive = panel.id === `${tabName}-panel`;
      panel.classList.toggle('active', isActive);
    });

    this.announce(`Switched to ${tabName} tab`);
  }

  // ═══════════════════════════════════════════════════════════════
  // PLANT MECHANICS (Phase 1 Core)
  // ═══════════════════════════════════════════════════════════════

  getPlantTypes() {
    return [
      { name: 'Basic', emoji: '🌱', color: '#388E3C', growthTime: 8, yield: 10, rarity: 'common' },
      { name: 'Xero-Cactus', emoji: '🌵', color: '#827717', growthTime: 12, yield: 15, rarity: 'common' },
      { name: 'Neon-Vine', emoji: '🟢', color: '#00E676', growthTime: 5, yield: 8, rarity: 'uncommon' },
      { name: 'Quartz-Fern', emoji: '❄️', color: '#B2EBF2', growthTime: 15, yield: 25, rarity: 'rare' },
      { name: 'Solar-Bloom', emoji: '🌻', color: '#FFD600', growthTime: 7, yield: 12, rarity: 'uncommon' },
      { name: 'Shadow-Fungi', emoji: '🍄', color: '#4527A0', growthTime: 9, yield: 11, rarity: 'uncommon' },
      { name: 'Cryo-Lily', emoji: '❄️', color: '#E1F5FE', growthTime: 14, yield: 22, rarity: 'rare' },
      { name: 'Void-Willow', emoji: '🌳', color: '#212121', growthTime: 10, yield: 18, rarity: 'uncommon' }
    ];
  }

  handlePlantSlotClick(orchardId, plantIdx) {
    const orchard = this.gameState.orchards.find(o => o.id === orchardId);
    if (!orchard) return;

    const plant = orchard.plants[plantIdx];

    if (!plant) {
      // Plant seed
      this.plantSeed(orchardId, plantIdx);
    } else if (plant.growth < 100) {
      // Still growing
      this.announce(`${plant.type} is still growing - ${plant.growth.toFixed(0)}% ready`);
      this.showToast(`Growing... ${plant.growth.toFixed(0)}%`);
    } else {
      // Harvest
      this.harvestPlant(orchardId, plantIdx);
    }
  }

  plantSeed(orchardId, plantIdx) {
    const orchard = this.gameState.orchards.find(o => o.id === orchardId);
    const plantTypes = this.getPlantTypes();
    const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];

    const newPlant = {
      type: plantType.name,
      emoji: plantType.emoji,
      color: plantType.color,
      growthTime: plantType.growthTime,
      yield: plantType.yield,
      rarity: Math.random() > 0.85 ? 'rare' : 'common',
      growth: 0,
      health: 100,
      water: 50,
      planted: Date.now(),
      growthSpeed: 1 + (this.getTool('speed')?.level || 0) * 0.2
    };

    orchard.plants[plantIdx] = newPlant;
    this.gameState.stats.totalPlanted++;

    this.animate(orchardId, plantIdx, 'plant');
    this.simulatePlantGrowth(orchardId, plantIdx);
    this.saveToStorage();
    this.render();

    this.announce(`Planted ${newPlant.type}`);
    this.showToast(`🌱 Planted ${newPlant.type}`);
  }

  simulatePlantGrowth(orchardId, plantIdx) {
    const key = `${orchardId}-${plantIdx}`;

    // Clear any existing interval
    if (this.growthIntervals.has(key)) {
      clearInterval(this.growthIntervals.get(key));
    }

    const orchard = this.gameState.orchards.find(o => o.id === orchardId);
    const plant = orchard.plants[plantIdx];

    const interval = setInterval(() => {
      if (!plant || plant.growth >= 100) {
        clearInterval(interval);
        this.growthIntervals.delete(key);
        return;
      }

      const growthRate = 2 * plant.growthSpeed;
      plant.growth += growthRate + Math.random();
      plant.water -= 1;
      plant.health = Math.max(0, plant.health - 0.5);

      if (plant.growth >= 100) {
        plant.growth = 100;
        plant.water = Math.min(100, plant.water + 20);
        clearInterval(interval);
        this.growthIntervals.delete(key);
        this.announce(`${plant.type} is ready to harvest`);
        this.render();
        this.saveToStorage();
      } else {
        this.render();
      }
    }, 500);

    this.growthIntervals.set(key, interval);
  }

  harvestPlant(orchardId, plantIdx) {
    const orchard = this.gameState.orchards.find(o => o.id === orchardId);
    const plant = orchard.plants[plantIdx];

    if (!plant || plant.growth < 100) return;

    const baseYield = plant.yield;
    const rarityBonus = plant.rarity === 'rare' ? 1.5 : 1;
    const healthMultiplier = plant.health / 100;
    const toolBonus = 1 + (this.getTool('soil')?.level || 0) * 0.1;

    const harvestAmount = Math.round(baseYield * rarityBonus * healthMultiplier * toolBonus);
    const credits = harvestAmount * 10;

    this.gameState.credits += credits;
    this.gameState.stats.totalHarvested++;
    this.gameState.stats.totalCreditsEarned += credits;
    if (plant.rarity === 'rare') {
      this.gameState.stats.rareHarvests++;
    }

    this.animate(orchardId, plantIdx, 'harvest');
    orchard.plants[plantIdx] = null;

    this.saveToStorage();
    this.render();

    this.announce(`Harvested ${plant.type} for ${credits} credits`);
    this.showToast(`✨ Harvested! +${credits}🪙`);
  }

  animate(orchardId, plantIdx, action) {
    // Add visual feedback animation (expand in CSS with @keyframes)
    const slot = document.querySelector(`[data-orchard-id="${orchardId}"][data-plant-idx="${plantIdx}"]`);
    if (slot) {
      slot.style.animation = `plantBob 0.6s ease-out`;
      setTimeout(() => {
        slot.style.animation = '';
      }, 600);
    }
  }

  getTool(toolId) {
    return this.gameState.tools.find(t => t.id === toolId);
  }

  // ═══════════════════════════════════════════════════════════════
  // SHOP MECHANICS (Phase 2)
  // ═══════════════════════════════════════════════════════════════

  getShopItems() {
    return [
      { id: 'compost', name: 'Compost', emoji: '🪨', cost: 15, effect: 'fertilizer', amount: 5, desc: 'Boost plant nutrients' },
      { id: 'synthetic', name: 'Synthetic Nutrients', emoji: '⚗️', cost: 30, effect: 'fertilizer', amount: 15, desc: 'Advanced plant food' },
      { id: 'organic', name: 'Organic Premium', emoji: '🌿', cost: 50, effect: 'fertilizer', amount: 30, desc: 'Highest quality nutrients' },
      { id: 'neem', name: 'Neem Oil', emoji: '🛡️', cost: 15, effect: 'pesticide', amount: 1, desc: 'Organic pest defense' },
      { id: 'chemical', name: 'Chemical Spray', emoji: '☠️', cost: 25, effect: 'pesticide', amount: 3, desc: 'Powerful pest killer' }
    ];
  }

  buyShopItem(itemId) {
    const item = this.getShopItems().find(i => i.id === itemId);
    if (!item) return;

    if (this.gameState.credits < item.cost) {
      this.announce(`Insufficient credits. Need ${item.cost - this.gameState.credits} more`);
      this.showToast(`Need ${item.cost}🪙`);
      return;
    }

    this.gameState.credits -= item.cost;
    this.gameState.inventory[item.effect] += item.amount;

    this.saveToStorage();
    this.render();

    this.announce(`Purchased ${item.name}`);
    this.showToast(`✓ Bought ${item.name}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TOOLS & UPGRADES (Phase 2)
  // ═══════════════════════════════════════════════════════════════

  upgradeTool(toolId) {
    const tool = this.getTool(toolId);
    if (!tool || tool.level >= tool.maxLevel) return;

    const cost = Math.round(tool.cost * Math.pow(tool.multiplier, tool.level));

    if (this.gameState.credits < cost) {
      this.announce(`Insufficient credits for upgrade`);
      this.showToast(`Need ${cost}🪙`);
      return;
    }

    this.gameState.credits -= cost;
    tool.level++;

    this.saveToStorage();
    this.render();

    this.announce(`Upgraded ${tool.name} to level ${tool.level}`);
    this.showToast(`⬆️ ${tool.name} → Level ${tool.level}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // ORCHARD MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  unlockOrchard(orchardId) {
    const orchard = this.gameState.orchards.find(o => o.id === orchardId);
    if (!orchard || orchard.unlocked) return;

    if (this.gameState.credits < orchard.unlockCost) {
      this.announce(`Insufficient credits to unlock ${orchard.name}`);
      this.showToast(`Need ${orchard.unlockCost}🪙`);
      return;
    }

    this.gameState.credits -= orchard.unlockCost;
    orchard.unlocked = true;

    this.saveToStorage();
    this.render();

    this.announce(`Unlocked ${orchard.name}`);
    this.showToast(`🔓 Unlocked ${orchard.name}`);
  }

  changeWeather() {
    const weathers = ['clear', 'rain', 'storm', 'sunny'];
    this.gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
    this.render();
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════

  render() {
    this.updateHUD();
    this.renderFarmingView();
    this.renderShopView();
    this.renderToolsView();
    this.renderStatsView();
  }

  updateHUD() {
    const container = document.getElementById(this.containerId);
    document.getElementById('orchard-day').textContent = this.gameState.day;
    document.getElementById('orchard-credits').textContent = this.gameState.credits;
    document.getElementById('orchard-seeds').textContent = this.gameState.stats.totalHarvested;
    document.getElementById('orchard-weather').textContent = this.capitalizeFirst(this.gameState.weather);
  }

  renderFarmingView() {
    const container = document.getElementById('orchard-farming');
    if (!container) return;

    container.innerHTML = '';
    const orchardsList = document.createElement('div');
    orchardsList.className = 'orchards-list';

    this.gameState.orchards.forEach(orchard => {
      const section = document.createElement('div');
      section.className = 'orchard-section';

      const title = document.createElement('div');
      title.className = 'orchard-title';

      const name = document.createElement('h3');
      name.className = 'orchard-name';
      name.textContent = `${orchard.emoji} ${orchard.name}`;

      title.appendChild(name);

      if (!orchard.unlocked) {
        const unlockBtn = document.createElement('button');
        unlockBtn.className = 'orchard-unlock-btn';
        unlockBtn.textContent = `Unlock (${orchard.unlockCost}🪙)`;
        unlockBtn.setAttribute('data-unlock-orchard', orchard.id);
        unlockBtn.setAttribute('aria-label', `Unlock ${orchard.name} for ${orchard.unlockCost} credits`);
        title.appendChild(unlockBtn);
      }

      section.appendChild(title);

      if (orchard.unlocked) {
        const grid = document.createElement('div');
        grid.className = 'orchard-grid';

        orchard.plants.forEach((plant, idx) => {
          const slot = document.createElement('button');
          slot.className = `plant-slot ${plant ? (plant.growth < 100 ? 'growing' : 'ready') : 'empty'}`;
          slot.setAttribute('data-orchard-id', orchard.id);
          slot.setAttribute('data-plant-idx', idx);
          slot.setAttribute('role', 'button');
          slot.setAttribute('tabindex', '0');
          slot.setAttribute('aria-label', this.getPlantSlotLabel(plant));

          if (plant) {
            const progress = Math.round(plant.growth);
            slot.innerHTML = `
              <div class="plant-icon">${plant.emoji}</div>
              <div class="plant-info">${plant.type} <br>${progress}%</div>
              <div class="plant-progress"><span style="width: ${progress}%"></span></div>
            `;
            if (progress === 100) {
              slot.innerHTML += '<div style="position: absolute; top: 4px; right: 4px; font-size: 0.75rem; background: #ffd700; color: #030508; padding: 2px 6px; border-radius: 3px; font-weight: 700;">Ready ✓</div>';
            }
          } else {
            slot.innerHTML = `
              <div class="plant-icon">🌫️</div>
              <div class="plant-info">Empty Soil</div>
            `;
          }

          grid.appendChild(slot);
        });

        section.appendChild(grid);
      } else {
        const locked = document.createElement('div');
        locked.className = 'plant-info';
        locked.textContent = '🔒 Locked - Unlock to farm';
        section.appendChild(locked);
      }

      orchardsList.appendChild(section);
    });

    container.appendChild(orchardsList);
  }

  renderShopView() {
    const container = document.getElementById('orchard-shop');
    if (!container) return;

    container.innerHTML = '';
    const items = this.getShopItems();

    // Fertilizers
    const fertSection = document.createElement('div');
    fertSection.className = 'shop-category';
    const fertTitle = document.createElement('div');
    fertTitle.className = 'shop-category-title';
    fertTitle.textContent = '🧪 Fertilizers';
    fertSection.appendChild(fertTitle);

    const fertGrid = document.createElement('div');
    fertGrid.className = 'shop-grid';
    items.filter(i => i.effect === 'fertilizer').forEach(item => {
      fertGrid.appendChild(this.createShopItemElement(item));
    });
    fertSection.appendChild(fertGrid);
    container.appendChild(fertSection);

    // Pesticides
    const pestSection = document.createElement('div');
    pestSection.className = 'shop-category';
    const pestTitle = document.createElement('div');
    pestTitle.className = 'shop-category-title';
    pestTitle.textContent = '🐛 Pest Control';
    pestSection.appendChild(pestTitle);

    const pestGrid = document.createElement('div');
    pestGrid.className = 'shop-grid';
    items.filter(i => i.effect === 'pesticide').forEach(item => {
      pestGrid.appendChild(this.createShopItemElement(item));
    });
    pestSection.appendChild(pestGrid);
    container.appendChild(pestSection);
  }

  createShopItemElement(item) {
    const el = document.createElement('div');
    el.className = 'shop-item';

    const icon = document.createElement('div');
    icon.className = 'shop-item-icon';
    icon.textContent = item.emoji;

    const details = document.createElement('div');
    details.className = 'shop-item-details';

    const name = document.createElement('div');
    name.className = 'shop-item-name';
    name.textContent = item.name;

    const cost = document.createElement('div');
    cost.className = 'shop-item-cost';
    cost.textContent = `${item.cost}🪙`;

    details.appendChild(name);
    details.appendChild(cost);

    const btn = document.createElement('button');
    btn.className = 'shop-item-buy-btn';
    btn.textContent = 'Buy';
    btn.setAttribute('data-buy-item', item.id);
    btn.setAttribute('aria-label', `Buy ${item.name} for ${item.cost} credits`);
    btn.disabled = this.gameState.credits < item.cost;

    el.appendChild(icon);
    el.appendChild(details);
    el.appendChild(btn);

    return el;
  }

  renderToolsView() {
    const container = document.getElementById('orchard-tools');
    if (!container) return;

    container.innerHTML = '';

    this.gameState.tools.forEach(tool => {
      const el = document.createElement('div');
      el.className = 'tool-item';

      const icon = document.createElement('div');
      icon.className = 'tool-icon';
      icon.textContent = tool.emoji;

      const details = document.createElement('div');
      details.className = 'tool-details';

      const name = document.createElement('div');
      name.className = 'tool-name';
      name.textContent = tool.name;

      const desc = document.createElement('div');
      desc.className = 'tool-desc';
      desc.textContent = tool.desc;

      const level = document.createElement('div');
      level.className = 'tool-level';
      level.textContent = `Level: ${tool.level} / ${tool.maxLevel}`;

      details.appendChild(name);
      details.appendChild(desc);
      details.appendChild(level);

      const nextCost = Math.round(tool.cost * Math.pow(tool.multiplier, tool.level));
      const btn = document.createElement('button');
      btn.className = 'tool-upgrade-btn';
      btn.textContent = tool.level < tool.maxLevel ? `Upgrade (${nextCost}🪙)` : 'Max Level';
      btn.setAttribute('data-upgrade-tool', tool.id);
      btn.setAttribute('aria-label', `Upgrade ${tool.name} for ${nextCost} credits`);
      btn.disabled = tool.level >= tool.maxLevel || this.gameState.credits < nextCost;

      el.appendChild(icon);
      el.appendChild(details);
      el.appendChild(btn);

      container.appendChild(el);
    });
  }

  renderStatsView() {
    const container = document.getElementById('orchard-stats');
    if (!container) return;

    container.innerHTML = '';
    const stats = this.gameState.stats;

    const sections = [
      {
        title: '🌾 Farming Stats',
        rows: [
          { label: 'Total Planted', value: stats.totalPlanted },
          { label: 'Total Harvested', value: stats.totalHarvested },
          { label: 'Rare Harvests', value: stats.rareHarvests },
          { label: 'Avg Yield', value: stats.totalHarvested > 0 ? Math.round(stats.totalCreditsEarned / stats.totalHarvested) : 0 }
        ]
      },
      {
        title: '💰 Economy',
        rows: [
          { label: 'Current Credits', value: `${this.gameState.credits}🪙` },
          { label: 'Total Earned', value: `${stats.totalCreditsEarned}🪙` },
          { label: 'Avg Per Harvest', value: `${stats.totalHarvested > 0 ? Math.round(stats.totalCreditsEarned / stats.totalHarvested) : 0}🪙` }
        ]
      }
    ];

    sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'stats-section';

      const title = document.createElement('div');
      title.className = 'stats-section-title';
      title.textContent = section.title;
      sectionEl.appendChild(title);

      section.rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'stat-row';

        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = row.label;

        const value = document.createElement('div');
        value.className = 'stat-value';
        value.textContent = row.value;

        rowEl.appendChild(label);
        rowEl.appendChild(value);
        sectionEl.appendChild(rowEl);
      });

      container.appendChild(sectionEl);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // UI HELPERS
  // ═══════════════════════════════════════════════════════════════

  showSkeleton() {
    const skeleton = document.getElementById('orchard-skeleton');
    if (skeleton) skeleton.style.display = 'flex';
  }

  hideSkeleton() {
    const skeleton = document.getElementById('orchard-skeleton');
    if (skeleton) skeleton.style.display = 'none';
  }

  showError(message) {
    const error = document.getElementById('orchard-error');
    const errorMsg = document.getElementById('orchard-error-msg');
    if (error && errorMsg) {
      errorMsg.textContent = message;
      error.style.display = 'flex';
    }
  }

  showToast(message) {
    const toast = document.getElementById('orchard-toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }
  }

  announce(message) {
    const status = document.querySelector('[role="status"]');
    if (status) {
      status.textContent = message;
    }
  }

  getPlantSlotLabel(plant) {
    if (!plant) return 'Empty soil slot. Click to plant a seed.';
    const progress = Math.round(plant.growth);
    if (progress < 100) return `${plant.type} growing - ${progress}% complete`;
    return `${plant.type} ready to harvest. Click to collect.`;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  destroy() {
    this.growthIntervals.forEach(interval => clearInterval(interval));
    this.growthIntervals.clear();
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTO-INITIALIZATION
// ═══════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.viaOrchardGame = new ViaOrchardGame();
    window.viaOrchardGame.init();
  });
} else {
  window.viaOrchardGame = new ViaOrchardGame();
  window.viaOrchardGame.init();
}
