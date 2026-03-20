// viadecide-agent.js — VIA Agent Integration Bridge
// Exposes window.VIAAgent for slash-command and AI-agent surface calls.
// The full agent surface lives at /agent.html; this file is the lightweight
// bridge loaded on the main feed page.
(function (global) {
  'use strict';

  if (global.VIAAgent) return; // already loaded

  function navigate(url) {
    if (typeof global.VIATransition !== 'undefined' && global.VIATransition && typeof global.VIATransition.navigate === 'function') {
      global.VIATransition.navigate(url);
      return;
    }
    global.location.href = url;
  }

  global.VIAAgent = {
    version: '1.0.0',

    /**
     * Open the full agent surface.
     */
    open() {
      navigate('./agent.html');
    },

    /**
     * Run a slash command via the agent service if available,
     * otherwise open agent.html with the command pre-filled.
     * @param {string} command  e.g. '/post', '/linkedin', '/youtube', '/task'
     * @param {string} topic
     */
    async run(command, topic) {
      if (typeof window.generateContent === 'function') {
        return window.generateContent(command, topic);
      }
      navigate(`./agent.html?cmd=${encodeURIComponent(command)}&topic=${encodeURIComponent(topic || '')}`);
    },

    /**
     * Log a lightweight event (no-op if analytics not loaded).
     */
    track(event, payload) {
      if (typeof window.gtag === 'function') {
        window.gtag('event', event, payload || {});
      }
    },
  };
})(window);
