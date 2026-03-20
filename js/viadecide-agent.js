// viadecide-agent.js — VIA Agent Integration Bridge
// Exposes window.VIAAgent for slash-command and AI-agent surface calls.
// The full agent surface lives at /agent.html; this file is the lightweight
// bridge loaded on the main feed page.
(function (global) {
  'use strict';

  if (global.VIAAgent) return;

  var ROUTE_LABELS = {
    './agent.html': 'Agent Surface',
    './about.html': 'About VIA',
    './creator-story.html': 'Creator Story',
    './creator-onboarding.html': 'Creator Onboarding',
    './profile.html': 'Profile',
    './decision-brief.html': 'Decision Brief',
    './StudyOS.html': 'StudyOS Classic',
    './app-generator.html': 'App Generator',
    './finance-dashboard-msme.html': 'Finance Dashboard MSME',
    './alchemist.html': 'Alchemist Quiz'
  };

  function navigate(url) {
    if (typeof global.VIATransition !== 'undefined' && global.VIATransition && typeof global.VIATransition.navigate === 'function') {
      global.VIATransition.navigate(url);
      return url;
    }
    global.location.href = url;
    return url;
  }

  function normalizeRoute(route) {
    var value = String(route || '').trim();
    if (!value) return './agent.html';
    if (global.VIANavigation && typeof global.VIANavigation.resolvePage === 'function') {
      return global.VIANavigation.resolvePage(value);
    }
    return value;
  }

  function buildAgentUrl(command, topic, extra) {
    var target = new URL('./agent.html', global.location.href);
    if (command) target.searchParams.set('cmd', command);
    if (topic) target.searchParams.set('topic', topic);
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (key) {
        var value = extra[key];
        if (value === undefined || value === null || value === '') return;
        target.searchParams.set(key, String(value));
      });
    }
    return target.toString();
  }

  global.VIAAgent = {
    version: '1.1.0',
    routes: Object.assign({}, ROUTE_LABELS),

    open: function open() {
      return navigate('./agent.html');
    },

    openRoute: function openRoute(route, params) {
      var destination = normalizeRoute(route);
      if (global.VIANavigation && typeof global.VIANavigation.buildUrl === 'function') {
        return navigate(global.VIANavigation.buildUrl(destination, params));
      }
      var target = new URL(destination, global.location.href);
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(function (key) {
          var value = params[key];
          if (value === undefined || value === null || value === '') return;
          target.searchParams.set(key, String(value));
        });
      }
      return navigate(target.toString());
    },

    openImportedSurface: function openImportedSurface(surfaceId, params) {
      if (typeof global.VIASourceBridge !== 'undefined' && global.VIASourceBridge && typeof global.VIASourceBridge.launchSurface === 'function') {
        return global.VIASourceBridge.launchSurface(surfaceId, params);
      }
      return this.openRoute(surfaceId, params);
    },

    async run(command, topic, extra) {
      if (typeof window.generateContent === 'function') {
        return window.generateContent(command, topic);
      }
      return navigate(buildAgentUrl(command, topic, extra));
    },

    suggestRoutes: function suggestRoutes() {
      return Object.keys(ROUTE_LABELS).map(function (path) {
        return { path: path, label: ROUTE_LABELS[path] };
      });
    },

    track: function track(event, payload) {
      if (typeof window.gtag === 'function') {
        window.gtag('event', event, payload || {});
      }
    }
  };
})(window);
