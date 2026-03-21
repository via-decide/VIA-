/**
 * shared/via-credits.js
 * VIA Universal Credit Wallet — works across all VIA games.
 *
 * Games: SkillHex · Mars Terminal · Orchard Engine
 *
 * Usage (from any game page):
 *   await window.VIACredits.add(50, 'skillhex', 'Mission complete: Oxygen Crisis')
 *   await window.VIACredits.transfer(recipientUid, 25)
 *   const bal = await window.VIACredits.getBalance()
 *   window.VIACredits.onBalance(cb)   // live updates
 *
 * The wallet lives in VIA's main Firestore at:
 *   users/{uid}/viaCredits          (number, canonical balance)
 *   creditHistory/{auto-id}         (audit log)
 */
(function (global) {
  'use strict';

  const LOCAL_KEY  = 'via-credits-local-v1';
  const CACHE_KEY  = 'via-credits-uid';

  /* ─── Firebase config (same as main VIA site) ─── */
  const VIA_FIREBASE_CONFIG = {
    apiKey:            'AIzaSyCQMIvNgKJPZmxVHRC8lKL79k6n0wh0EKo',
    authDomain:        'gen-lang-client-0662689801.firebaseapp.com',
    projectId:         'gen-lang-client-0662689801',
    storageBucket:     'gen-lang-client-0662689801.firebasestorage.app',
    messagingSenderId: '899475982419',
    appId:             '1:899475982419:web:fc93af4d97e6a578b31ea6',
  };

  let _db   = null;
  let _auth = null;
  let _uid  = null;
  let _balanceListeners = [];
  let _unsubscribe = null;
  let _localBalance = 0;

  /* ─── Local-only fallback (no Firebase / not logged in) ─── */
  function _loadLocal() {
    try { _localBalance = parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10) || 0; } catch (_) {}
    return _localBalance;
  }
  function _saveLocal(bal) {
    _localBalance = Math.max(0, bal);
    try { localStorage.setItem(LOCAL_KEY, String(_localBalance)); } catch (_) {}
  }

  /* ─── Firebase init ─── */
  function _initFirebase() {
    try {
      /* Reuse already-initialised VIA Firebase app if present */
      if (global.viaFirebase && global.viaFirebase.db) {
        _db   = global.viaFirebase.db;
        _auth = global.viaFirebase.auth;
        return true;
      }
      /* Otherwise init our own compat instance */
      if (!global.firebase) return false;
      const existingApp = global.firebase.apps && global.firebase.apps.find(a => a.name === 'via-credits');
      const app = existingApp || global.firebase.initializeApp(VIA_FIREBASE_CONFIG, 'via-credits');
      _db   = global.firebase.firestore(app);
      _auth = global.firebase.auth(app);
      return true;
    } catch (e) {
      console.warn('[VIACredits] Firebase init failed:', e && e.message);
      return false;
    }
  }

  function _userRef(uid) {
    return _db.collection('users').doc(uid);
  }
  function _historyRef() {
    return _db.collection('creditHistory');
  }

  /* ─── Auth helpers ─── */
  function _currentUid() {
    if (_uid) return _uid;
    try {
      if (_auth && _auth.currentUser) return _auth.currentUser.uid;
      /* Cached uid from last login */
      return localStorage.getItem(CACHE_KEY) || null;
    } catch (_) { return null; }
  }

  function _watchAuth() {
    if (!_auth) return;
    _auth.onAuthStateChanged((user) => {
      if (user) {
        _uid = user.uid;
        try { localStorage.setItem(CACHE_KEY, user.uid); } catch (_) {}
        _attachBalanceListener(user.uid);
      } else {
        _uid = null;
        if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
        _notify(_loadLocal());
      }
    });
  }

  /* ─── Live balance listener ─── */
  function _attachBalanceListener(uid) {
    if (_unsubscribe) _unsubscribe();
    _unsubscribe = _userRef(uid).onSnapshot((snap) => {
      if (snap.exists) {
        const bal = Number(snap.data().viaCredits || 0);
        _notify(bal);
      }
    }, (err) => console.warn('[VIACredits] snapshot error:', err));
  }

  function _notify(balance) {
    _balanceListeners.forEach((cb) => { try { cb(balance); } catch (_) {} });
  }

  /* ─── Core API ─── */
  async function getBalance() {
    const uid = _currentUid();
    if (!uid || !_db) return _loadLocal();
    try {
      const snap = await _userRef(uid).get();
      return snap.exists ? Number(snap.data().viaCredits || 0) : 0;
    } catch (e) {
      console.warn('[VIACredits] getBalance failed:', e);
      return _loadLocal();
    }
  }

  /**
   * Award credits to the signed-in user.
   * @param {number} amount   Positive integer.
   * @param {string} source   Game id: 'skillhex' | 'mars-terminal' | 'orchard' | 'platform'
   * @param {string} reason   Human-readable log entry.
   */
  async function add(amount, source, reason) {
    amount = Math.max(0, Math.round(amount));
    if (!amount) return;
    const uid = _currentUid();

    /* Local fallback */
    if (!uid || !_db) {
      _saveLocal(_loadLocal() + amount);
      _notify(_localBalance);
      return;
    }

    try {
      const increment = global.firebase
        ? global.firebase.firestore.FieldValue.increment(amount)
        : amount;   // best-effort if FieldValue unavailable

      await _userRef(uid).set(
        { viaCredits: increment, uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      await _historyRef().add({
        uid, amount, source, reason,
        type: 'earn',
        ts: (global.firebase && global.firebase.firestore.FieldValue.serverTimestamp) ? global.firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
      });
    } catch (e) {
      console.warn('[VIACredits] add failed — falling back to local:', e);
      _saveLocal(_loadLocal() + amount);
    }
  }

  /**
   * Transfer credits from current user to another user (by UID).
   */
  async function transfer(toUid, amount) {
    amount = Math.max(0, Math.round(amount));
    const fromUid = _currentUid();
    if (!fromUid || !toUid || !amount || fromUid === toUid || !_db) {
      return { ok: false, reason: 'invalid' };
    }
    try {
      const currentBal = await getBalance();
      if (currentBal < amount) return { ok: false, reason: 'insufficient' };

      const batch = _db.batch();
      const inc = global.firebase.firestore.FieldValue.increment;

      batch.set(_userRef(fromUid), { viaCredits: inc(-amount) }, { merge: true });
      batch.set(_userRef(toUid),   { viaCredits: inc(amount)  }, { merge: true });
      batch.set(_historyRef().doc(), {
        from: fromUid, to: toUid, amount,
        type: 'transfer', source: 'cross-game',
        ts: global.firebase.firestore.FieldValue.serverTimestamp()
      });
      await batch.commit();
      return { ok: true };
    } catch (e) {
      console.warn('[VIACredits] transfer failed:', e);
      return { ok: false, reason: e.message };
    }
  }

  /**
   * Subscribe to live balance updates.
   * @param {function} cb  Called with (balance: number) whenever balance changes.
   * @returns {function}   Unsubscribe function.
   */
  function onBalance(cb) {
    _balanceListeners.push(cb);
    /* Fire immediately with cached/current value */
    getBalance().then(cb);
    return () => { _balanceListeners = _balanceListeners.filter(l => l !== cb); };
  }

  /* ─── Bootstrap ─── */
  function _boot() {
    _loadLocal();
    if (_initFirebase()) {
      _watchAuth();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }

  /* ─── Public API ─── */
  global.VIACredits = { getBalance, add, transfer, onBalance };

})(window);
