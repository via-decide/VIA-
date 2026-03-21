/**
 * skillhex/js/via-bridge.js
 * Bridges SkillHex tokens/XP to the VIA universal credit wallet.
 *
 * Conversion rate: 10 SkillHex tokens = 1 VIA Credit
 * (tokens are earned faster, credits are the cross-game currency)
 *
 * Hooks into SkillHex's pushReward() and save() to detect token gains
 * and mirror them as VIA Credits.
 */
(function () {
  'use strict';

  const TOKEN_TO_CREDIT_RATE = 0.1;   // 10 tokens → 1 credit
  const BRIDGE_KEY = 'skillhex-via-bridge-v1';

  let _lastSyncedTokens = 0;

  function _load() {
    try {
      const d = JSON.parse(localStorage.getItem(BRIDGE_KEY) || '{}');
      _lastSyncedTokens = d.lastSyncedTokens || 0;
    } catch (_) {}
  }

  function _save(tokens) {
    _lastSyncedTokens = tokens;
    try { localStorage.setItem(BRIDGE_KEY, JSON.stringify({ lastSyncedTokens: tokens })); } catch (_) {}
  }

  /**
   * Called after every token change. Calculates delta and awards VIA Credits.
   */
  function syncCredits(currentTokens) {
    if (!window.VIACredits) return;
    if (currentTokens <= _lastSyncedTokens) return;

    const earned = currentTokens - _lastSyncedTokens;
    const credits = Math.floor(earned * TOKEN_TO_CREDIT_RATE);
    if (credits <= 0) return;

    _save(currentTokens);
    window.VIACredits.add(credits, 'skillhex', `Earned ${earned} SkillHex tokens → ${credits} VIA Credits`);
    showCreditToast(credits);
  }

  function showCreditToast(amount) {
    const existing = document.getElementById('via-credit-toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'via-credit-toast';
    el.innerHTML = `<span style="font-size:1.1em">🪙</span> +${amount} VIA Credits earned`;
    Object.assign(el.style, {
      position: 'fixed', bottom: '80px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg,#1a2a4a,#0c1224)',
      border: '1px solid #00e5ff44',
      color: '#00e5ff',
      padding: '10px 20px',
      borderRadius: '999px',
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '.75rem',
      letterSpacing: '.1em',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity .3s',
      pointerEvents: 'none',
      boxShadow: '0 0 20px #00e5ff22',
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 3000);
  }

  /**
   * Patch SkillHex's save() function to trigger credit sync after every save.
   * SkillHex defines save() globally — we wrap it.
   */
  function patchSkillHexSave() {
    const interval = setInterval(() => {
      if (typeof window.save !== 'function' || typeof window.STATE === 'undefined') return;
      clearInterval(interval);

      _load();
      /* Sync on boot with existing tokens */
      if (window.STATE.tokens > _lastSyncedTokens) syncCredits(window.STATE.tokens);

      /* Wrap save() */
      const originalSave = window.save;
      window.save = function (...args) {
        const result = originalSave.apply(this, args);
        if (window.STATE) syncCredits(window.STATE.tokens);
        return result;
      };
    }, 300);
  }

  /* Show VIA balance in SkillHex HUD when VIACredits is ready */
  function injectBalanceBadge() {
    if (!window.VIACredits) return;
    window.VIACredits.onBalance((bal) => {
      let badge = document.getElementById('via-credit-badge');
      if (!badge) {
        const hud = document.querySelector('.hud-stats');
        if (!hud) return;
        badge = document.createElement('div');
        badge.id = 'via-credit-badge';
        badge.className = 'hud-stat';
        badge.innerHTML = '<span class="hud-lbl">VIA</span><span class="hud-val" id="via-credit-val" style="color:#f59e0b">0🪙</span>';
        hud.appendChild(badge);
      }
      const el = document.getElementById('via-credit-val');
      if (el) el.textContent = bal + '🪙';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { patchSkillHexSave(); injectBalanceBadge(); });
  } else {
    patchSkillHexSave();
    injectBalanceBadge();
  }
})();
