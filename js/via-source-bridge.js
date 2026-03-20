(function (global) {
  'use strict';

  if (global.VIASourceBridge) return;

  var IMPORTED_SURFACES = [
    {
      id: 'decision_brief',
      name: 'Decision Brief',
      sourceRepo: 'via-decide/decide.engine',
      sourcePath: 'decision-brief.html',
      entry: './decision-brief.html',
      status: 'adapted',
      category: 'surface',
      description: 'Constraint-first decision brief surface adapted for VIA subpage navigation.'
    },
    {
      id: 'studyos',
      name: 'StudyOS Classic',
      sourceRepo: 'via-decide/decide.engine',
      sourcePath: 'StudyOS.html',
      entry: './StudyOS.html',
      status: 'adapted',
      category: 'surface',
      description: 'Direct launcher for the StudyOS workspace using decide.engine’s standalone surface pattern.'
    },
    {
      id: 'app_generator',
      name: 'App Generator',
      sourceRepo: 'via-decide/decide.engine',
      sourcePath: 'app-generator.html',
      entry: './app-generator.html',
      status: 'adapted',
      category: 'surface',
      description: 'Imported generator shell normalized to VIA tool paths and creator-friendly launch actions.'
    },
    {
      id: 'finance_dashboard_msme',
      name: 'Finance Dashboard MSME',
      sourceRepo: 'via-decide/decide.engine',
      sourcePath: 'finance-dashboard-msme.html',
      entry: './finance-dashboard-msme.html',
      status: 'adapted',
      category: 'surface',
      description: 'MSME planning dashboard migrated into a static-friendly VIA workspace with local persistence.'
    },
    {
      id: 'alchemist',
      name: 'Alchemist Quiz',
      sourceRepo: 'via-decide/decide.engine',
      sourcePath: 'alchemist.html',
      entry: './alchemist.html',
      status: 'adapted',
      category: 'surface',
      description: 'Quiz surface imported from decide.engine and given a VIA-safe fallback dataset.'
    }
  ];

  var TOOL_SOURCES = [
    {
      id: 'tool-bridge',
      name: 'Tool Bridge',
      sourceRepo: 'via-decide/decide.engine-tools',
      sourcePath: 'shared/tool-bridge.js',
      entry: './shared/tool-bridge.js',
      status: 'keep_as_is',
      description: 'Cross-tool context handoff for localStorage-based workflows.'
    },
    {
      id: 'tool-registry',
      name: 'Tool Registry',
      sourceRepo: 'via-decide/decide.engine-tools',
      sourcePath: 'shared/tool-registry.js',
      entry: './shared/tool-registry.js',
      status: 'keep_as_is',
      description: 'Manifest + plugin registry used to discover imported engine tools.'
    },
    {
      id: 'tool-storage',
      name: 'Tool Storage',
      sourceRepo: 'via-decide/decide.engine-tools',
      sourcePath: 'shared/tool-storage.js',
      entry: './shared/tool-storage.js',
      status: 'keep_as_is',
      description: 'Browser + optional Supabase storage helpers reused by VIA and tool surfaces.'
    },
    {
      id: 'workflow-ui',
      name: 'Workflow UI',
      sourceRepo: 'via-decide/decide.engine-tools',
      sourcePath: 'shared/workflow-ui.js',
      entry: './shared/workflow-ui.js',
      status: 'tool_source_only',
      description: 'UI scaffolding for multi-step pipeline tools already living under tools/.'
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function findSurface(id) {
    var key = String(id || '').trim();
    return IMPORTED_SURFACES.find(function (surface) {
      return surface.id === key || surface.entry === key;
    }) || null;
  }

  function toUrl(entry, params) {
    if (global.VIANavigation && typeof global.VIANavigation.buildUrl === 'function') {
      return global.VIANavigation.buildUrl(entry, params);
    }
    var target = new URL(entry, global.location.href);
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(function (key) {
        var value = params[key];
        if (value === undefined || value === null || value === '') return;
        target.searchParams.set(key, String(value));
      });
    }
    return target.toString();
  }

  function navigate(entry, params) {
    var url = toUrl(entry, params);
    if (global.VIATransition && typeof global.VIATransition.navigate === 'function') {
      global.VIATransition.navigate(url);
      return url;
    }
    global.location.href = url;
    return url;
  }

  function launchSurface(id, params) {
    var surface = findSurface(id);
    if (!surface) return null;
    return navigate(surface.entry, params);
  }

  function openTool(entry) {
    if (!entry) return null;
    if (global.ToolBridge && typeof global.ToolBridge.openTool === 'function') {
      global.ToolBridge.openTool(entry);
      return entry;
    }
    global.location.href = entry;
    return entry;
  }

  function getDiscoverItems() {
    return IMPORTED_SURFACES.map(function (surface) {
      return {
        emoji: surface.id === 'alchemist' ? '🧪' : surface.id === 'finance_dashboard_msme' ? '💰' : surface.id === 'app_generator' ? '🛠️' : surface.id === 'studyos' ? '📚' : '🧭',
        cat: 'Imported',
        name: surface.name,
        desc: surface.description,
        path: surface.entry
      };
    });
  }

  function renderList(target, items, mode) {
    if (!target) return;
    target.innerHTML = items.map(function (item) {
      var destination = item.entry || item.path || '#';
      var meta = item.sourceRepo + ' · ' + item.sourcePath;
      var action = mode === 'tool' ? 'Open file' : 'Open surface';
      return '' +
        '<article>' +
          '<div class="via-tag">' + item.status.replace(/_/g, ' ') + '</div>' +
          '<h3>' + item.name + '</h3>' +
          '<p>' + item.description + '</p>' +
          '<div class="via-inline-meta"><span>' + meta + '</span></div>' +
          '<a class="via-link-button" href="' + destination + '">' + action + '</a>' +
        '</article>';
    }).join('');
  }

  function enhanceDom() {
    var surfacesTarget = document.querySelector('[data-via-import-list="surfaces"]');
    var toolsTarget = document.querySelector('[data-via-import-list="tools"]');
    renderList(surfacesTarget, IMPORTED_SURFACES, 'surface');
    renderList(toolsTarget, TOOL_SOURCES, 'tool');
  }

  global.VIASourceBridge = {
    version: '1.0.0',
    listImportedSurfaces: function () { return clone(IMPORTED_SURFACES); },
    listToolSources: function () { return clone(TOOL_SOURCES); },
    getDiscoverItems: getDiscoverItems,
    findSurface: findSurface,
    launchSurface: launchSurface,
    openTool: openTool,
    toUrl: toUrl,
    enhanceDom: enhanceDom
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceDom, { once: true });
  } else {
    enhanceDom();
  }
})(window);
