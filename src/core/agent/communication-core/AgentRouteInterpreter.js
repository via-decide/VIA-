(function (global) {
  'use strict';

  const DEFAULT_ROUTES = [
    { label: 'Alchemist', path: '/alchemist', routeId: 'prompt-alchemy', keywords: ['prompt', 'alchemy', 'rewrite', 'copy', 'messaging', 'brand'] },
    { label: 'App Generator', path: '/app-generator', routeId: 'app-generator', keywords: ['app', 'build', 'prototype', 'generate', 'ui', 'feature'] },
    { label: 'Sales Dashboard', path: '/sales-dashboard', routeId: 'sales-dashboard', keywords: ['sales', 'pipeline', 'crm', 'dashboard', 'revenue'] },
    { label: 'Finance Dashboard', path: '/finance-dashboard-msme', routeId: 'finance-dashboard-msme', keywords: ['finance', 'cashflow', 'budget', 'forecast', 'msme'] },
    { label: 'Decision Brief', path: '/decision-brief', routeId: 'decision-brief', keywords: ['brief', 'policy', 'research', 'summary', 'decision'] },
    { label: 'Student Research', path: '/student-research', routeId: 'student-research', keywords: ['thesis', 'sources', 'research', 'citations'] },
    { label: 'Founder', path: '/founder', routeId: 'founder', keywords: ['founder', 'startup', 'pitch', 'go-to-market'] },
    { label: 'Export Studio', path: '/export-studio', routeId: 'export-studio', keywords: ['export', 'download', 'docx', 'pdf', 'share'] }
  ];

  function scoreRoute(route, text) {
    const haystack = String(text || '').toLowerCase();
    let score = 0;
    (route.keywords || []).forEach((keyword) => {
      if (haystack.includes(String(keyword).toLowerCase())) score += 1;
    });
    if (route.routeId && haystack.includes(String(route.routeId).toLowerCase())) score += 1.5;
    return score;
  }

  class AgentRouteInterpreter {
    constructor(options) {
      const resolved = options && typeof options === 'object' ? options : {};
      this.extraRoutes = Array.isArray(resolved.routes) ? resolved.routes.slice() : [];
    }

    getKnownRoutes() {
      const routerMap = global.Router && global.Router.toolPathStaticMap ? global.Router.toolPathStaticMap : {};
      const dynamicRoutes = Object.keys(routerMap).map((key) => ({
        label: key.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
        path: `/${key}`,
        routeId: key,
        keywords: [key.replace(/-/g, ' '), key]
      }));
      const seen = new Set();
      return DEFAULT_ROUTES.concat(dynamicRoutes, this.extraRoutes).filter((route) => {
        const token = `${route.path}::${route.routeId}`;
        if (seen.has(token)) return false;
        seen.add(token);
        return true;
      });
    }

    analyzeIntent(message, pageContext) {
      const text = [message, pageContext && pageContext.title, pageContext && pageContext.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return {
        raw: String(message || '').trim(),
        wantsSetup: /setup|api key|test key|gemini/.test(text),
        wantsExport: /export|docx|download|share/.test(text),
        wantsTaskHelp: /task|todo|follow up|next step|checklist/.test(text),
        wantsRouting: /where|go to|open|page|tool|dashboard|route/.test(text)
      };
    }

    suggestRoute(message, pageContext) {
      const intent = this.analyzeIntent(message, pageContext);
      const corpus = [message, pageContext && pageContext.pathname, pageContext && pageContext.title, pageContext && pageContext.description]
        .filter(Boolean)
        .join(' ');
      const candidates = this.getKnownRoutes()
        .map((route) => ({ route, score: scoreRoute(route, corpus) }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score);

      const best = candidates[0];
      if (!best) return null;

      const confidence = Math.min(0.99, 0.4 + (best.score * 0.12));
      let reason = 'Matched the request against known ViaDecide tools.';
      if (intent.wantsSetup) reason = 'The request mentions setup or Gemini configuration.';
      else if (intent.wantsExport) reason = 'The request mentions export or document generation.';
      else if (intent.wantsTaskHelp) reason = 'The request mentions tasks or follow-up work.';
      else if (intent.wantsRouting) reason = 'The request asks for a relevant internal page or tool.';

      return {
        label: best.route.label,
        path: best.route.path,
        reason,
        confidence: Number(confidence.toFixed(2)),
        routeId: best.route.routeId
      };
    }
  }

  global.AgentRouteInterpreter = AgentRouteInterpreter;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentRouteInterpreter;
  }
})(typeof window !== 'undefined' ? window : globalThis);
