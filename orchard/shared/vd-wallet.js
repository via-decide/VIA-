(function(global) {
  'use strict';
  const KEY = 'vd_wallet';
  const VDWallet = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)) || this._def(); }
      catch { return this._def(); }
    },
    _def() {
      return { focusDrops:0, lumina:0, hexTokens:0, missionXP:0,
               snakeCoins:0, quizStars:0, totalEarned:0, lastUpdated:'' };
    },
    save(w) {
      w.lastUpdated = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(w));
      global.dispatchEvent(new CustomEvent('vdwallet:updated', { detail: w }));
    },
    earn(field, amount, source) {
      if (amount <= 0) return this.get();
      const w = this.get();
      w[field] = (w[field] || 0) + amount;
      w.totalEarned = (w.totalEarned || 0) + amount;
      this.save(w);
      return w;
    },
    balance(field) {
      const w = this.get();
      return field ? (w[field] || 0) : w;
    }
  };
  global.VDWallet = VDWallet;
})(window);
