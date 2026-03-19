// shared/firebase-config.js
// Initializes Firebase app for VIA social layer.
// Set window.VIA_FIREBASE_CONFIG before this script loads.
// Falls back to local-only mode if config is absent.

(function (global) {
  'use strict';

  function initFirebase() {
    const config = global.VIA_FIREBASE_CONFIG;
    if (!config || !config.projectId) {
      console.warn('VIA Firebase: no config found, running local-only.');
      return;
    }
    try {
      const app = firebase.initializeApp(config);
      global.viaFirebase = {
        db: firebase.firestore(app),
        auth: firebase.auth(app)
      };
    } catch (error) {
      console.warn('VIA Firebase init failed:', error && error.message ? error.message : error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
  } else {
    initFirebase();
  }
})(window);
