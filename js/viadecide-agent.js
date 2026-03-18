(function (global) {
  'use strict';

  if (global.VDAgentLoaded) return;
  global.VDAgentLoaded = true;

  const SCRIPT_URL = (document.currentScript && document.currentScript.src) || new URL('./js/viadecide-agent.js', window.location.href).href;
  const ROOT_URL = new URL('../', SCRIPT_URL);
  const CORE_BASE_URL = new URL('src/core/agent/communication-core/', ROOT_URL);
  const GEMINI_STORAGE_KEY = 'viadecide.agent.gemini.apiKey';
  const DOCX_CDN = 'https://unpkg.com/docx@8.5.0/build/index.umd.js';
  const CORE_SCRIPTS = [
    'AgentMessageBus.js',
    'AgentTaskCoordinator.js',
    'AgentRouteInterpreter.js',
    'AgentSessionState.js',
    'AgentTelemetryTracker.js',
    'index.js'
  ];

  const state = {
    core: null,
    elements: {},
    pageContext: buildPageContext(),
    typing: false
  };

  function buildPageContext() {
    const metaDescription = document.querySelector('meta[name="description"]');
    return {
      pathname: window.location.pathname,
      title: document.title || 'ViaDecide',
      description: metaDescription ? metaDescription.getAttribute('content') || '' : ''
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function relHrefFromRoot(targetPath) {
    const alias = String(targetPath || '').replace(/^\//, '');
    const routerMap = global.Router && global.Router.toolPathStaticMap ? global.Router.toolPathStaticMap : {};
    const routeAliasMap = {
      alchemist: 'prompt-alchemy',
      'finance-dashboard-msme': 'balance-dashboard'
    };
    const routeKey = routeAliasMap[alias] || alias;
    const relativeTarget = routerMap[routeKey] || `${routeKey}/index.html`;
    const currentUrl = new URL(window.location.href);
    const targetUrl = new URL(relativeTarget, ROOT_URL);
    const currentParts = currentUrl.pathname.split('/').filter(Boolean);
    currentParts.pop();
    const targetParts = targetUrl.pathname.split('/').filter(Boolean);
    while (currentParts.length && targetParts.length && currentParts[0] === targetParts[0]) {
      currentParts.shift();
      targetParts.shift();
    }
    const prefix = currentParts.length ? '../'.repeat(currentParts.length) : './';
    return `${prefix}${targetParts.join('/')}`;
  }

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-via-agent-src="${url}"]`);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (existing.dataset.loaded === 'true') resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.dataset.viaAgentSrc = url;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${url}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function ensureCoreLoaded() {
    if (global.VIAAgentCommunicationCore && typeof global.VIAAgentCommunicationCore.createAgentCommunicationCore === 'function') {
      return global.VIAAgentCommunicationCore;
    }
    for (let index = 0; index < CORE_SCRIPTS.length; index += 1) {
      const file = CORE_SCRIPTS[index];
      await loadScript(new URL(file, CORE_BASE_URL).href);
    }
    return global.VIAAgentCommunicationCore;
  }

  function getStoredApiKey() {
    try {
      return localStorage.getItem(GEMINI_STORAGE_KEY) || '';
    } catch (_error) {
      return '';
    }
  }

  function saveApiKey(value) {
    try {
      localStorage.setItem(GEMINI_STORAGE_KEY, String(value || '').trim());
      return true;
    } catch (_error) {
      return false;
    }
  }

  function injectStyles() {
    if (document.getElementById('via-agent-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'via-agent-widget-styles';
    style.textContent = `
      .via-agent-launcher{position:fixed;right:24px;bottom:24px;z-index:9998;width:58px;height:58px;border:none;border-radius:999px;background:linear-gradient(135deg,#22b4a0,#c8932a);color:#0b0e15;box-shadow:0 24px 44px rgba(0,0,0,.28);font:700 24px/1 'Outfit',sans-serif;cursor:pointer}
      .via-agent-panel{position:fixed;right:24px;bottom:96px;z-index:9998;width:min(420px,calc(100vw - 24px));max-height:min(78vh,760px);display:none;flex-direction:column;background:#0f1420;color:#f4efe7;border:1px solid rgba(255,255,255,.09);border-radius:24px;box-shadow:0 28px 80px rgba(0,0,0,.34);overflow:hidden;font:14px/1.55 'Outfit',system-ui,sans-serif}
      .via-agent-panel.is-open{display:flex}
      .via-agent-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
      .via-agent-head strong{font-size:15px}
      .via-agent-tabs{display:flex;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.06);overflow:auto}
      .via-agent-tab{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:#d7d1c6;border-radius:999px;padding:8px 12px;font-size:12px;cursor:pointer;white-space:nowrap}
      .via-agent-tab.is-active{background:#22b4a0;color:#04110f;border-color:#22b4a0}
      .via-agent-view{display:none;padding:14px;overflow:auto}
      .via-agent-view.is-active{display:block}
      .via-agent-chat-log{display:flex;flex-direction:column;gap:10px;min-height:260px;max-height:340px;overflow:auto;padding-right:4px}
      .via-agent-bubble{padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
      .via-agent-bubble.user{background:rgba(34,180,160,.1);border-color:rgba(34,180,160,.22)}
      .via-agent-meta{font-size:11px;color:rgba(244,239,231,.58);margin-bottom:4px;text-transform:uppercase;letter-spacing:.08em}
      .via-agent-row{display:flex;gap:8px;margin-top:12px}
      .via-agent-row input,.via-agent-row textarea,.via-agent-row select{width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:#121927;color:#f4efe7;padding:11px 12px;font:inherit}
      .via-agent-row textarea{min-height:86px;resize:vertical}
      .via-agent-btn{border:none;border-radius:14px;padding:11px 14px;background:#22b4a0;color:#05100f;font-weight:700;cursor:pointer}
      .via-agent-btn.alt{background:rgba(255,255,255,.06);color:#f4efe7}
      .via-agent-btn.warn{background:#c8932a;color:#120d00}
      .via-agent-stack{display:grid;gap:10px}
      .via-agent-task{display:grid;gap:8px;padding:12px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
      .via-agent-task-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      .via-agent-task small,.via-agent-note,.via-agent-status{color:rgba(244,239,231,.64)}
      .via-agent-suggestions{display:grid;gap:8px;margin-top:12px}
      .via-agent-suggestion{padding:11px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}
      .via-agent-suggestion a{color:#7ce6d4;text-decoration:none;font-weight:600}
      .via-agent-hidden{display:none}
      .via-agent-divider{height:1px;background:rgba(255,255,255,.07);margin:12px 0}
      .via-agent-status{margin-top:10px;font-size:12px}
    `;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    injectStyles();
    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'via-agent-launcher';
    launcher.setAttribute('aria-label', 'Open ViaDecide Agent');
    launcher.innerHTML = '&#10022;';

    const panel = document.createElement('section');
    panel.className = 'via-agent-panel';
    panel.innerHTML = `
      <div class="via-agent-head">
        <div>
          <strong>ViaDecide Agent</strong>
          <div class="via-agent-status" data-agent-status>Idle</div>
        </div>
        <button type="button" class="via-agent-btn alt" data-agent-close>Close</button>
      </div>
      <div class="via-agent-tabs">
        <button type="button" class="via-agent-tab is-active" data-agent-tab="chat">Chat</button>
        <button type="button" class="via-agent-tab" data-agent-tab="tasks">Tasks</button>
        <button type="button" class="via-agent-tab" data-agent-tab="setup">Setup</button>
        <button type="button" class="via-agent-tab" data-agent-tab="export">Export</button>
      </div>
      <div class="via-agent-view is-active" data-agent-view="chat">
        <div class="via-agent-chat-log" data-agent-chat-log></div>
        <div class="via-agent-suggestions" data-agent-suggestions></div>
        <div class="via-agent-row">
          <textarea placeholder="Ask VIA for help, route suggestions, tasks, or export guidance..." data-agent-input></textarea>
        </div>
        <div class="via-agent-row">
          <button type="button" class="via-agent-btn" data-agent-send>Send</button>
          <button type="button" class="via-agent-btn alt" data-agent-clear-session>Clear session</button>
        </div>
      </div>
      <div class="via-agent-view" data-agent-view="tasks">
        <div class="via-agent-stack" data-agent-task-list></div>
        <div class="via-agent-divider"></div>
        <div class="via-agent-row">
          <input type="text" placeholder="Add a task" data-agent-task-input />
          <button type="button" class="via-agent-btn" data-agent-task-add>+ Add</button>
        </div>
      </div>
      <div class="via-agent-view" data-agent-view="setup">
        <div class="via-agent-stack">
          <label>
            <div class="via-agent-meta">Gemini API key</div>
            <input type="password" placeholder="Paste Gemini API key" data-agent-api-key />
          </label>
          <div class="via-agent-row">
            <button type="button" class="via-agent-btn" data-agent-save-key>Save key</button>
            <button type="button" class="via-agent-btn warn" data-agent-test-key>Test key</button>
          </div>
          <p class="via-agent-note">The widget keeps page-aware conversation history and uses your saved Gemini key only for chat and test calls.</p>
        </div>
      </div>
      <div class="via-agent-view" data-agent-view="export">
        <div class="via-agent-stack">
          <p class="via-agent-note">Export the current multi-turn session, tasks, and route suggestions as a DOCX file.</p>
          <div class="via-agent-row">
            <button type="button" class="via-agent-btn" data-agent-export-docx>&#11015; Export .docx</button>
            <button type="button" class="via-agent-btn alt" data-agent-export-json>Export JSON</button>
          </div>
          <div class="via-agent-status" data-agent-export-status>No export generated yet.</div>
        </div>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    state.elements = {
      launcher,
      panel,
      close: panel.querySelector('[data-agent-close]'),
      tabs: Array.from(panel.querySelectorAll('[data-agent-tab]')),
      views: Array.from(panel.querySelectorAll('[data-agent-view]')),
      chatLog: panel.querySelector('[data-agent-chat-log]'),
      suggestions: panel.querySelector('[data-agent-suggestions]'),
      input: panel.querySelector('[data-agent-input]'),
      send: panel.querySelector('[data-agent-send]'),
      clearSession: panel.querySelector('[data-agent-clear-session]'),
      taskList: panel.querySelector('[data-agent-task-list]'),
      taskInput: panel.querySelector('[data-agent-task-input]'),
      taskAdd: panel.querySelector('[data-agent-task-add]'),
      apiKey: panel.querySelector('[data-agent-api-key]'),
      saveKey: panel.querySelector('[data-agent-save-key]'),
      testKey: panel.querySelector('[data-agent-test-key]'),
      exportDocx: panel.querySelector('[data-agent-export-docx]'),
      exportJson: panel.querySelector('[data-agent-export-json]'),
      exportStatus: panel.querySelector('[data-agent-export-status]'),
      status: panel.querySelector('[data-agent-status]')
    };
  }

  function setWidgetStatus(text) {
    if (state.elements.status) state.elements.status.textContent = text;
  }

  function openPanel() {
    state.elements.panel.classList.add('is-open');
    setWidgetStatus(state.typing ? 'Thinking…' : 'Ready');
  }

  function closePanel() {
    state.elements.panel.classList.remove('is-open');
    setWidgetStatus('Idle');
  }

  function switchTab(tabName) {
    state.elements.tabs.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.agentTab === tabName);
    });
    state.elements.views.forEach((view) => {
      view.classList.toggle('is-active', view.dataset.agentView === tabName);
    });
  }

  function renderChat() {
    const session = state.core.session.getSession();
    const conversation = session.conversation.length ? session.conversation : [{ role: 'agent', text: 'Hi — I can help with chat, tasks, setup, export, and internal ViaDecide routing.' }];
    state.elements.chatLog.innerHTML = conversation.map((turn) => `
      <div class="via-agent-bubble ${turn.role === 'user' ? 'user' : ''}">
        <div class="via-agent-meta">${escapeHtml(turn.role || 'agent')} · ${escapeHtml((turn.createdAt || '').replace('T', ' ').slice(0, 16))}</div>
        <div>${escapeHtml(turn.text || '')}</div>
      </div>
    `).join('');
    state.elements.chatLog.scrollTop = state.elements.chatLog.scrollHeight;
  }

  function renderSuggestions() {
    const session = state.core.session.getSession();
    const suggestions = session.routeSuggestions || [];
    if (!suggestions.length) {
      state.elements.suggestions.innerHTML = '';
      return;
    }
    state.elements.suggestions.innerHTML = suggestions.slice(-3).reverse().map((suggestion) => {
      const href = relHrefFromRoot(suggestion.path || '/');
      return `
        <div class="via-agent-suggestion">
          <div><strong>${escapeHtml(suggestion.label || 'Suggested page')}</strong> · ${(suggestion.confidence || 0).toFixed(2)} confidence</div>
          <div class="via-agent-note">${escapeHtml(suggestion.reason || '')}</div>
          <div><a href="${escapeHtml(href)}">Open ${escapeHtml(suggestion.path || href)}</a></div>
        </div>
      `;
    }).join('');
  }

  function renderTasks() {
    const tasks = state.core.tasks.listTasks();
    if (!tasks.length) {
      state.elements.taskList.innerHTML = '<div class="via-agent-note">No tasks yet. Add one manually or ask the agent to create follow-ups.</div>';
      return;
    }
    state.elements.taskList.innerHTML = tasks.map((task) => `
      <div class="via-agent-task" data-task-id="${escapeHtml(task.id)}">
        <div class="via-agent-task-top">
          <div>
            <strong>${escapeHtml(task.title)}</strong>
            <div><small>${task.completed ? 'Completed' : 'Open'} · ${escapeHtml(task.origin || 'agent-widget')}</small></div>
            ${task.linkedRoute ? `<div><small>Route: ${escapeHtml(task.linkedRoute)}</small></div>` : ''}
          </div>
          <div class="via-agent-row">
            ${task.completed ? '' : '<button type="button" class="via-agent-btn alt" data-task-complete>Complete</button>'}
            <button type="button" class="via-agent-btn alt" data-task-delete>Delete</button>
          </div>
        </div>
        ${task.suggestedAction ? `<div class="via-agent-note">Suggested action: ${escapeHtml(task.suggestedAction)}</div>` : ''}
      </div>
    `).join('');
  }

  function updateDebugSurface() {
    global.VIAAgentDebug = {
      getCurrentSession: () => state.core.session.getSession(),
      getTaskList: () => state.core.tasks.listTasks(),
      getRecentMessages: (channel) => state.core.bus.getHistory(channel || 'chat_channel'),
      getTelemetrySnapshot: () => state.core.telemetry.getSnapshot(),
      core: state.core
    };
  }

  function syncDerivedState() {
    renderChat();
    renderSuggestions();
    renderTasks();
    if (state.elements.apiKey) state.elements.apiKey.value = getStoredApiKey();
    updateDebugSurface();
  }

  async function generateAgentReply(prompt) {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      return 'Gemini is not configured yet. Open Setup, save an API key, and click Test key.';
    }

    const session = state.core.session.getSession();
    const context = buildPageContext();
    const conversationText = session.conversation.slice(-10).map((turn) => `${turn.role}: ${turn.text}`).join('\n');
    const systemPrompt = [
      'You are the ViaDecide Agent widget.',
      'Stay compatible with the current page-aware multi-turn flow.',
      `Page pathname: ${context.pathname}`,
      `Page title: ${context.title}`,
      `Page description: ${context.description}`,
      'If relevant, mention tasks, setup, export, or internal routes succinctly.',
      '',
      'Conversation so far:',
      conversationText,
      '',
      `Latest user message: ${prompt}`
    ].join('\n');

    const startedAt = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.4 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    const text = payload && payload.candidates && payload.candidates[0] && payload.candidates[0].content && Array.isArray(payload.candidates[0].content.parts)
      ? payload.candidates[0].content.parts.map((part) => part.text || '').join('\n').trim()
      : '';
    state.core.telemetry.track('agent_reply_message', { durationMs: Date.now() - startedAt });
    return text || 'Gemini returned an empty reply. Try a more specific follow-up.';
  }

  function appendRouteSuggestion(suggestion) {
    if (!suggestion) return;
    const session = state.core.session.getSession();
    const routeSuggestions = (session.routeSuggestions || []).concat([{ ...suggestion, createdAt: new Date().toISOString() }]).slice(-12);
    session.routeSuggestions = routeSuggestions;
    state.core.session.session = session;
    state.core.session.persist();
    state.core.telemetry.track('route_suggestion', suggestion);
    state.core.bus.publish('routing_channel', {
      type: 'route_suggestion',
      priority: 'normal',
      payload: suggestion,
      source: 'viadecide-agent',
      target: 'routing_channel'
    });
  }

  function captureTaskReference(task) {
    const session = state.core.session.getSession();
    session.taskReferences = (session.taskReferences || []).concat([{ id: task.id, title: task.title, createdAt: task.createdAt }]).slice(-30);
    state.core.session.session = session;
    state.core.session.persist();
  }

  async function handleSend() {
    const prompt = String(state.elements.input.value || '').trim();
    if (!prompt || state.typing) return;
    state.typing = true;
    setWidgetStatus('Thinking…');
    state.elements.send.disabled = true;
    state.elements.input.value = '';
    state.core.session.appendTurn({ role: 'user', text: prompt, pageContext: buildPageContext() });
    state.core.telemetry.track('user_message', { promptLength: prompt.length });
    await state.core.bus.publish('chat_channel', {
      type: 'user_message',
      priority: 'high',
      payload: { text: prompt, pageContext: buildPageContext() },
      source: 'user',
      target: 'chat_channel'
    });

    const suggestion = state.core.routes.suggestRoute(prompt, buildPageContext());
    appendRouteSuggestion(suggestion);

    if (/create task|add task|follow up|todo|to-do|next step/i.test(prompt)) {
      const task = state.core.tasks.createTask({
        title: prompt.replace(/^(create task|add task)\s*/i, '').trim() || prompt,
        origin: 'agent-chat',
        linkedRoute: suggestion ? suggestion.path : '',
        linkedPrompt: prompt,
        suggestedAction: suggestion ? `Open ${suggestion.label}` : 'Review in Tasks tab'
      });
      captureTaskReference(task);
      state.core.telemetry.track('task_create', { taskId: task.id });
    }

    try {
      const reply = await generateAgentReply(prompt);
      state.core.session.appendTurn({ role: 'agent', text: reply, pageContext: buildPageContext() });
      await state.core.bus.publish('chat_channel', {
        type: 'agent_reply',
        priority: 'normal',
        payload: { text: reply },
        source: 'gemini',
        target: 'chat_channel'
      });
    } catch (error) {
      const fallback = `I hit an error while talking to Gemini: ${error.message}. You can still use Tasks, Setup, Export, and route suggestions.`;
      state.core.session.appendTurn({ role: 'agent', text: fallback, pageContext: buildPageContext() });
      state.core.telemetry.track('system_notice_message', { error: error.message });
      await state.core.bus.publish('chat_channel', {
        type: 'system_notice',
        priority: 'high',
        payload: { text: fallback, error: error.message },
        source: 'viadecide-agent',
        target: 'chat_channel'
      });
    } finally {
      state.typing = false;
      setWidgetStatus('Ready');
      state.elements.send.disabled = false;
      syncDerivedState();
    }
  }

  async function handleTestKey() {
    const apiKey = String(state.elements.apiKey.value || '').trim();
    if (!apiKey) {
      setWidgetStatus('Add an API key first.');
      return;
    }
    saveApiKey(apiKey);
    setWidgetStatus('Testing key…');
    const startedAt = Date.now();
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with: VIA test ok' }] }] })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.core.telemetry.track('setup_event', { durationMs: Date.now() - startedAt, action: 'test_key' });
      await state.core.bus.publish('setup_channel', {
        type: 'setup_event',
        priority: 'high',
        payload: { action: 'test_key', ok: true },
        source: 'setup-tab',
        target: 'setup_channel'
      });
      setWidgetStatus('Gemini key test passed.');
    } catch (error) {
      state.core.telemetry.track('setup_event', { durationMs: Date.now() - startedAt, action: 'test_key', ok: false });
      setWidgetStatus(`Gemini key test failed: ${error.message}`);
    }
  }

  async function ensureDocxLibrary() {
    if (global.docx) return global.docx;
    await loadScript(DOCX_CDN);
    return global.docx;
  }

  function downloadBlob(blob, filename) {
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  async function exportDocx() {
    state.elements.exportStatus.textContent = 'Preparing DOCX export…';
    try {
      const docx = await ensureDocxLibrary();
      const payload = state.core.session.exportSessionData();
      const tasks = state.core.tasks.listTasks();
      const suggestions = state.core.session.getSession().routeSuggestions || [];
      const children = [
        new docx.Paragraph({ text: 'ViaDecide Agent Session Export', heading: docx.HeadingLevel.TITLE }),
        new docx.Paragraph(`Exported: ${payload.exportedAt}`),
        new docx.Paragraph({ text: 'Conversation', heading: docx.HeadingLevel.HEADING_1 })
      ];
      payload.session.conversation.forEach((turn) => {
        children.push(new docx.Paragraph(`${turn.role || 'agent'}: ${turn.text || ''}`));
      });
      children.push(new docx.Paragraph({ text: 'Tasks', heading: docx.HeadingLevel.HEADING_1 }));
      tasks.forEach((task) => {
        children.push(new docx.Paragraph(`${task.completed ? '[x]' : '[ ]'} ${task.title}`));
      });
      children.push(new docx.Paragraph({ text: 'Route Suggestions', heading: docx.HeadingLevel.HEADING_1 }));
      suggestions.forEach((suggestion) => {
        children.push(new docx.Paragraph(`${suggestion.label} — ${suggestion.path} (${suggestion.reason})`));
      });
      const documentFile = new docx.Document({ sections: [{ children }] });
      const blob = await docx.Packer.toBlob(documentFile);
      downloadBlob(blob, `viadecide-agent-session-${Date.now()}.docx`);
      state.core.telemetry.track('export_event', { kind: 'docx' });
      await state.core.bus.publish('export_channel', {
        type: 'export_event',
        priority: 'normal',
        payload: { kind: 'docx' },
        source: 'export-tab',
        target: 'export_channel'
      });
      state.elements.exportStatus.textContent = 'DOCX export downloaded.';
    } catch (error) {
      state.elements.exportStatus.textContent = `DOCX export failed: ${error.message}`;
    }
  }

  function exportJson() {
    const payload = {
      session: state.core.session.exportSessionData(),
      tasks: state.core.tasks.listTasks(),
      telemetry: state.core.telemetry.getSnapshot(),
      messages: state.core.bus.getHistory()
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `viadecide-agent-session-${Date.now()}.json`);
    state.core.telemetry.track('export_event', { kind: 'json' });
    state.core.bus.publish('export_channel', {
      type: 'export_event',
      priority: 'background',
      payload: { kind: 'json' },
      source: 'export-tab',
      target: 'export_channel'
    });
    state.elements.exportStatus.textContent = 'JSON export downloaded.';
  }

  function bindEvents() {
    state.elements.launcher.addEventListener('click', openPanel);
    state.elements.close.addEventListener('click', closePanel);
    state.elements.tabs.forEach((button) => {
      button.addEventListener('click', () => switchTab(button.dataset.agentTab));
    });
    state.elements.send.addEventListener('click', handleSend);
    state.elements.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    });
    state.elements.clearSession.addEventListener('click', () => {
      state.core.session.clearSession();
      state.core.session.startSession({ pageContext: buildPageContext(), setupState: { hasGeminiKey: Boolean(getStoredApiKey()) } });
      syncDerivedState();
    });
    state.elements.taskAdd.addEventListener('click', () => {
      const title = String(state.elements.taskInput.value || '').trim();
      if (!title) return;
      const task = state.core.tasks.createTask({ title, origin: 'tasks-tab', linkedPrompt: title, suggestedAction: 'Review in Tasks tab' });
      captureTaskReference(task);
      state.core.telemetry.track('task_create', { taskId: task.id });
      state.elements.taskInput.value = '';
      syncDerivedState();
    });
    state.elements.taskList.addEventListener('click', (event) => {
      const container = event.target.closest('[data-task-id]');
      if (!container) return;
      const taskId = container.dataset.taskId;
      if (event.target.matches('[data-task-complete]')) {
        state.core.tasks.completeTask(taskId);
        state.core.telemetry.track('task_complete', { taskId });
        syncDerivedState();
      }
      if (event.target.matches('[data-task-delete]')) {
        state.core.tasks.deleteTask(taskId);
        state.core.telemetry.track('task_delete', { taskId });
        syncDerivedState();
      }
    });
    state.elements.saveKey.addEventListener('click', async () => {
      saveApiKey(state.elements.apiKey.value);
      state.core.telemetry.track('setup_event', { action: 'save_key' });
      await state.core.bus.publish('setup_channel', {
        type: 'setup_event',
        priority: 'normal',
        payload: { action: 'save_key', hasKey: Boolean(getStoredApiKey()) },
        source: 'setup-tab',
        target: 'setup_channel'
      });
      setWidgetStatus('Gemini key saved locally.');
    });
    state.elements.testKey.addEventListener('click', handleTestKey);
    state.elements.exportDocx.addEventListener('click', exportDocx);
    state.elements.exportJson.addEventListener('click', exportJson);
  }

  async function init() {
    injectMarkup();
    const comms = await ensureCoreLoaded();
    state.core = await comms.createAgentCommunicationCore({
      configUrl: new URL('agent-communication-config.json', CORE_BASE_URL).href
    });
    if (!state.core.session.getSession().id) {
      state.core.session.startSession({
        pageContext: buildPageContext(),
        setupState: { hasGeminiKey: Boolean(getStoredApiKey()) },
        state: 'listening'
      });
    }
    state.core.bus.subscribe('chat_channel', (message) => {
      state.core.telemetry.track(message.type || 'chat_event', { channel: message.channel });
    });
    state.core.bus.subscribe('task_channel', (message) => {
      state.core.telemetry.track(message.type || 'task_event', { channel: message.channel });
    });
    state.core.bus.subscribe('setup_channel', (message) => {
      state.core.telemetry.track(message.type || 'setup_event', { channel: message.channel });
    });
    state.core.bus.subscribe('export_channel', (message) => {
      state.core.telemetry.track(message.type || 'export_event', { channel: message.channel });
    });
    bindEvents();
    syncDerivedState();
    setWidgetStatus('Ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window);
