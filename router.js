(() => {
  'use strict';

  const routeAliases = { research: 'researchers' };
  const canonicalRoute = (route = '') => routeAliases[route] || route;

  const toolPathStaticMap = {
    'student-research': 'student-research/index.html',
    'multi-source-research': 'multi-source-research-explained/index.html',
    'interview-prep': 'interview-prep/index.html',
    'prompt-alchemy': 'prompt-alchemy/index.html',
    'sales-dashboard': 'sales-dashboard/index.html',
    founder: 'founder/index.html',
    'decision-brief': 'decision-brief-guide/index.html',
    'wings-of-fire-quiz': 'wings-of-fire-quiz/index.html',
    'agent-builder': 'agent/index.html',
    'app-generator': 'app-generator/index.html',
    'mars-colony': 'mars.html',
    'orchard-sim': 'tools/eco-engine-test/index.html',
    'context-packager': 'tools/context-packager/index.html',
    'spec-builder': 'tools/spec-builder/index.html',
    'code-generator': 'tools/code-generator/index.html',
    'code-reviewer': 'tools/code-reviewer/index.html',
    'output-evaluator': 'tools/output-evaluator/index.html',
    'task-splitter': 'tools/task-splitter/index.html',
    'workflow-template-gallery': 'tools/workflow-template-gallery/index.html',
    'tool-search-discovery': 'tools/tool-search-discovery/index.html',
    'prompt-compare': 'tools/prompt-compare/index.html',
    'repo-improvement-brief': 'tools/repo-improvement-brief/index.html',
    'idea-remixer': 'tools/idea-remixer/index.html',
    'template-vault': 'tools/template-vault/index.html',
    'export-studio': 'tools/export-studio/index.html',
    'tool-router': 'tools/tool-router/index.html',
    'script-generator': 'tools/script-generator/index.html',
    promptalchemy: 'tools/promptalchemy/index.html',
    'json-formatter': 'tools/json-formatter/index.html',
    'regex-tester': 'tools/regex-tester/index.html',
    pomodoro: 'tools/pomodoro/index.html',
    'color-palette': 'tools/color-palette/index.html',
    'revenue-forecaster': 'tools/revenue-forecaster/index.html',
    'meeting-cost-calculator': 'tools/engine/meeting-cost-calculator/index.html',
    'typography-scale-calculator': 'tools/engine/typography-scale-calculator/index.html',
    'grid-evolution': 'tools/engine/grid-evolution/index.html',
    'market-dynamics': 'tools/engine/market-dynamics/index.html',
    'traffic-router': 'tools/engine/traffic-router/index.html',
    'player-signup': 'tools/engine/player-signup/index.html',
    'orchard-profile-builder': 'tools/engine/orchard-profile-builder/index.html',
    'starter-farm-generator': 'tools/engine/starter-farm-generator/index.html',
    'root-strength-calculator': 'tools/engine/root-strength-calculator/index.html',
    'trunk-growth-calculator': 'tools/engine/trunk-growth-calculator/index.html',
    'fruit-yield-engine': 'tools/engine/fruit-yield-engine/index.html',
    'daily-quest-generator': 'tools/engine/daily-quest-generator/index.html',
    'weekly-harvest-engine': 'tools/engine/weekly-harvest-engine/index.html',
    'fair-ranking-engine': 'tools/engine/fair-ranking-engine/index.html',
    'seed-exchange': 'tools/engine/seed-exchange/index.html',
    'fruit-sharing': 'tools/engine/fruit-sharing/index.html',
    'circle-builder': 'tools/engine/circle-builder/index.html',
    'peer-validation-engine': 'tools/engine/peer-validation-engine/index.html',
    'trust-score-engine': 'tools/engine/trust-score-engine/index.html',
    'recruiter-dashboard': 'tools/engine/recruiter-dashboard/index.html',
    'orchard-discovery-search': 'tools/engine/orchard-discovery-search/index.html',
    'hire-readiness-scorer': 'tools/engine/hire-readiness-scorer/index.html',
    'ai-coach-console': 'tools/engine/ai-coach-console/index.html',
    'growth-path-recommender': 'tools/engine/growth-path-recommender/index.html',
    'synthetic-player-generator': 'tools/engine/synthetic-player-generator/index.html',
    'wave1-simulation-runner': 'tools/engine/wave1-simulation-runner/index.html',
    'balance-dashboard': 'tools/engine/balance-dashboard/index.html',
    'simulation-runner': 'tools/engine/simulation-runner/index.html'
    'task-splitter': 'tools/task-splitter/index.html'
  };

  const navLinks = [...document.querySelectorAll('.nl[data-s]')];
  const sections = [...document.querySelectorAll('main section[id]')];

  if (!navLinks.length || !sections.length) {
    window.Router = { canonicalRoute, routeAliases, toolPathStaticMap };
    return;
  }

  const setActive = (routeId) => {
    navLinks.forEach((link) => {
      link.classList.toggle('on', link.dataset.s === routeId);
    });
  };

  const goToRoute = (routeId, { smooth = true, updateHash = true } = {}) => {
    const id = canonicalRoute(routeId);
    const section = document.getElementById(id);
    if (!section) return;

    if (updateHash) {
      history.replaceState(null, '', `#${id}`);
    }

    section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    setActive(id);
  };

  const routeFromHash = () => canonicalRoute(window.location.hash.replace(/^#/, ''));

  const syncFromHash = () => {
    const route = routeFromHash();
    if (route && document.getElementById(route)) {
      goToRoute(route, { smooth: false, updateHash: false });
      return;
    }
    setActive('home');
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      goToRoute(link.dataset.s);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, { threshold: 0.35 });

  sections.forEach((section) => observer.observe(section));

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();

  window.Router = { canonicalRoute, routeAliases, goToRoute, syncFromHash, toolPathStaticMap };
})();
