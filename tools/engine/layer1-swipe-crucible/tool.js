(() => {
  const MASTER_STATE_KEY = 'orchard_engine_player_state';

  function hydrateState() {
    const defaults = {
      day: 1,
      credits: 60,
      rootStrength: 0,
      water: 30,
      maxWater: 30,
      nutrients: 100,
      stress: 0,
      pests: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalFruits: 0,
      totalXP: 0,
      spamCount: 0,
      totalSwipes: 0,
      lastSessionDate: null,
      avgQualityMultiplier: 0.7
    };
    try {
      const raw = localStorage.getItem(MASTER_STATE_KEY);
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  }

  function syncState(state) {
    localStorage.setItem(MASTER_STATE_KEY, JSON.stringify(state));
  }

  function emitEvent(name, data) {
    window.dispatchEvent(new CustomEvent(name, { detail: data }));
  }

  const el = {
    meta: document.getElementById('meta'),
    rootPct: document.getElementById('rootPct'),
    rootBar: document.getElementById('rootBar'),
    gamePanel: document.getElementById('gamePanel'),
    alreadyPanel: document.getElementById('alreadyPanel'),
    completePanel: document.getElementById('completePanel'),
    countdown: document.getElementById('countdown'),
    cardHost: document.getElementById('cardHost'),
    cardProgress: document.getElementById('cardProgress'),
    xpLine: document.getElementById('result-xp') || document.getElementById('xpLine'),
    rootLine: document.getElementById('rootLine'),
    accLine: document.getElementById('accLine'),
    streakLine: document.getElementById('result-streak') || document.getElementById('streakLine')
  };

  const CARD_POOL = {
    water: ['Absorb the rain', 'Morning dew collected', 'Irrigation time'],
    pest: ['Clear the aphids', 'Root grub detected', 'Pest on leaf 3'],
    logic: ['Plan tomorrow\'s task', 'Reflect on growth', 'Log your progress'],
    rest: ['Recovery day', 'The roots need quiet', 'Rest is growth']
  };

  const TYPE_META = {
    water: { icon: '💧', correctDirection: 'right' },
    pest: { icon: '🐛', correctDirection: 'left' },
    logic: { icon: '🧠', correctDirection: 'right' },
    rest: { icon: '😴', correctDirection: 'either' }
  };

  let state = hydrateState();
  let deck = [];
  let currentIndex = 0;
  let sessionCorrect = 0;
  let sessionTotal = 0;
  let waterCorrectCount = 0;
  let pestCorrectCount = 0;

  let startX = 0;
  let dragX = 0;
  let isDragging = false;

  function todayString() {
    return new Date().toDateString();
  }

  function yesterdayString() {
    return new Date(Date.now() - 86400000).toDateString();
  }

  function updateHeader() {
    const streak = state.currentStreak || 0;
    const xp = state.totalXP || 0;
    const rootPct = Math.max(0, Math.min(100, Math.round(state.rootStrength % 100)));
    el.meta.textContent = `Day ${state.day} · Streak 🔥 ${streak} · ⭐ ${xp} XP`;
    el.rootPct.textContent = `${rootPct}%`;
    el.rootBar.style.width = `${rootPct}%`;
  }

  function weightedType() {
    const r = Math.random();
    if (r < 0.35) return 'water';
    if (r < 0.60) return 'pest';
    if (r < 0.85) return 'logic';
    return 'rest';
  }

  function fisherYates(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  function generateDeck() {
    if (cards.length) {
      return cards.map((card, i) => ({
        id: `${card.type}-${i}-${Date.now()}`,
        type: card.type,
        icon: TYPE_META[card.type]?.icon || '🌿',
        text: card.text,
        xp: card.xp,
        correctDirection: TYPE_META[card.type]?.correctDirection || 'either'
      }));
    }

    const count = 5 + Math.floor(Math.random() * 4);
    const cards = [];
    for (let i = 0; i < count; i += 1) {
      const type = weightedType();
      const texts = CARD_POOL[type];
      const text = texts[Math.floor(Math.random() * texts.length)];
      cards.push({
        id: `${type}-${i}-${Date.now()}`,
        type,
        icon: TYPE_META[type].icon,
        text,
        correctDirection: TYPE_META[type].correctDirection
      });
    }
    fisherYates(cards);
    return cards;
  }

  function showAlreadyPlayed() {
    el.gamePanel.classList.add('hide');
    el.completePanel.classList.add('hide');
    el.alreadyPanel.classList.remove('hide');

    function tick() {
      const now = new Date();
      const next = new Date();
      next.setHours(24, 0, 0, 0);
      const ms = Math.max(0, next - now);
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      el.countdown.textContent = `Next session in ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  function buildCardElement(card) {
    const node = document.createElement('article');
    node.className = `card ${card.type}`;
    node.dataset.id = card.id;
    node.innerHTML = `
      <div class="card-title">${card.icon} ${card.type[0].toUpperCase() + card.type.slice(1)} Card</div>
      <div class="card-text">${card.text}</div>
      <div class="card-actions"><span>← SKIP</span><span>COMPLETE →</span></div>
      <div class="overlay left">✗</div>
      <div class="overlay right">✓</div>
    `;

    node.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      dragX = 0;
      isDragging = true;
      node.style.transition = 'none';
      node.setPointerCapture(e.pointerId);
    });

    node.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      dragX = e.clientX - startX;
      node.style.transform = `translateX(${dragX}px) rotate(${dragX * 0.08}deg)`;
      const rightOverlay = node.querySelector('.overlay.right');
      const leftOverlay = node.querySelector('.overlay.left');
      if (dragX > 40) {
        rightOverlay.style.display = 'flex';
        leftOverlay.style.display = 'none';
      } else if (dragX < -40) {
        leftOverlay.style.display = 'flex';
        rightOverlay.style.display = 'none';
      } else {
        leftOverlay.style.display = 'none';
        rightOverlay.style.display = 'none';
      }
    });

    node.addEventListener('pointerup', () => {
      if (!isDragging) return;
      isDragging = false;
      const thresholdMet = Math.abs(dragX) >= 80;
      if (!thresholdMet) {
        node.style.transition = 'transform 0.3s ease';
        node.style.transform = 'translateX(0) rotate(0deg)';
        node.querySelector('.overlay.left').style.display = 'none';
        node.querySelector('.overlay.right').style.display = 'none';
        return;
      }
      const direction = dragX > 0 ? 'right' : 'left';
      commitSwipe(node, deck[currentIndex], direction);
    });

    node.addEventListener('pointercancel', () => {
      isDragging = false;
      node.style.transition = 'transform 0.3s ease';
      node.style.transform = 'translateX(0) rotate(0deg)';
      node.querySelector('.overlay.left').style.display = 'none';
      node.querySelector('.overlay.right').style.display = 'none';
    });

    return node;
  }

  function isCorrect(card, direction) {
    if (card.correctDirection === 'either') return true;
    return card.correctDirection === direction;
  }

  function commitSwipe(node, card, direction) {
    const correct = isCorrect(card, direction);
    if (direction === 'right') {
      if (window.SwipeEngine) window.SwipeEngine.swipeCard('right');
    }
    if (direction === 'left') {
      if (window.SwipeEngine) window.SwipeEngine.swipeCard('left');
    }
    sessionTotal += 1;
    if (correct) {
      sessionCorrect += 1;
      if (card.type === 'water') waterCorrectCount += 1;
      if (card.type === 'pest') pestCorrectCount += 1;
    }

    node.style.transition = 'transform 0.3s ease';
    const outX = direction === 'right' ? 500 : -500;
    const outR = direction === 'right' ? 30 : -30;
    node.style.transform = `translateX(${outX}px) rotate(${outR}deg)`;

    setTimeout(() => {
      currentIndex += 1;
      renderCurrentCard();
    }, 300);
  }

  function renderCurrentCard() {
    if (currentIndex >= deck.length) {
      finishSession();
      return;
    }
    el.cardHost.innerHTML = '';
    el.cardHost.appendChild(buildCardElement(deck[currentIndex]));
    el.cardProgress.textContent = `Card ${currentIndex + 1} of ${deck.length}`;
  }

  function finishSession() {
    const accuracy = sessionTotal > 0 ? sessionCorrect / sessionTotal : 0;
    const qualityMultiplier = 0.5 + (accuracy * 0.5);
    const streakBonus = Math.min(2.0, 1 + (state.currentStreak * 0.05));
    const dailyXP = Math.round(sessionTotal * 10 * qualityMultiplier * streakBonus);
    const rootGrowth = +(dailyXP / 100).toFixed(3);

    state.rootStrength += rootGrowth;
    state.totalXP += dailyXP;
    state.totalSwipes += sessionTotal;
    state.spamCount += (sessionCorrect === 0) ? 1 : 0;
    state.avgQualityMultiplier = ((state.avgQualityMultiplier * (state.totalSwipes - sessionTotal)) + (qualityMultiplier * sessionTotal)) / Math.max(1, state.totalSwipes);

    if (waterCorrectCount > 0) {
      state.water = Math.min(state.maxWater, state.water + 5);
    }
    if (pestCorrectCount > 0) {
      state.pests = Math.max(0, state.pests - 1);
    }

    state.day += 1;
    syncState(state);
    updateHeader();

    emitEvent('engine:session_complete', {
      dailyXP,
      rootGrowth,
      accuracy,
      streak: state.currentStreak,
      cardsCompleted: sessionCorrect,
      cardsTotal: sessionTotal
    });
    // wallet sync
    if (typeof window.VDWallet !== 'undefined') {
      window.VDWallet.earn('focusDrops', Math.floor(dailyXP / 5), 'swipe-session');
      if (state.currentStreak >= 3) {
        window.VDWallet.earn('lumina', 1, 'swipe-streak');
      }
    }
    emitEvent('engine:day_advanced', { currentDay: state.day });

    el.gamePanel.classList.add('hide');
    el.completePanel.classList.remove('hide');
    el.xpLine.textContent = `XP Earned: +${dailyXP}`;
    el.rootLine.textContent = `Root Growth: +${rootGrowth}`;
    el.accLine.textContent = `Accuracy: ${Math.round(accuracy * 100)}%`;
    el.streakLine.textContent = `Streak: ${state.currentStreak} days 🔥`;
    if (window.VDWallet) {
      VDWallet.earn('focusDrops', Math.floor(dailyXP / 5), 'swipe-session');
      if (state.currentStreak >= 3) VDWallet.earn('lumina', 1, 'swipe-streak');
    }
    if (window.GrowthStageEngine) window.GrowthStageEngine.addXP(dailyXP);
    if (window.GrowthStageEngine) GrowthStageEngine.addXP(dailyXP);
    if (window.ToolBridge) {
      ToolBridge.sendContext('layer1-swipe-crucible', 'growth-milestone-engine', {
        xpEarned: dailyXP, streak: state.currentStreak, completed: true
      });
    }
  }

  function startSessionIfEligible() {
    const today = todayString();
    if (state.lastSessionDate === today) {
      updateHeader();
      showAlreadyPlayed();
      return;
    }

    const yesterday = yesterdayString();
    if (state.lastSessionDate === yesterday) state.currentStreak += 1;
    else state.currentStreak = 1;

    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastSessionDate = today;
    syncState(state);

    deck = generateDeck();
    currentIndex = 0;
    sessionCorrect = 0;
    sessionTotal = 0;
    waterCorrectCount = 0;
    pestCorrectCount = 0;

    updateHeader();
    renderCurrentCard();
  }

  window.addEventListener('swipe:session_completed', (e) => {
    const xp = e.detail.xpEarned;
    const streak = e.detail.streak;
    // inject into existing results UI if elements exist
    const xpEl = document.getElementById('result-xp');
    const streakEl = document.getElementById('result-streak');
    if (xpEl) xpEl.textContent = '+' + xp + ' XP';
    if (streakEl) streakEl.textContent = '🔥 ' + streak + ' day streak';
    if (window.RewardWallet) window.RewardWallet.earn('drops', Math.floor(xp / 5), 'swipe_session');
  });

  startSessionIfEligible();
})();
