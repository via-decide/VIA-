export class SurfaceAgentBridge {
  constructor(options = {}) {
    this.runtime = options.runtime || null;
    this.agentCore = options.agentCore || null;
    this.navigation = options.navigation || null;
  }

  async handleSurfaceIntent(surfaceName, payload = {}) {
    const message = payload.message || payload.intent || payload.text || '';
    const context = {
      ...(payload.context || {}),
      surfaceName
    };

    this.sendPageContextToAgent(surfaceName, context.pageContext || context);
    if (this.runtime && this.runtime.orchestrator) {
      return this.runtime.orchestrator.processUserIntent(message, context);
    }
    return {
      handled: false,
      surfaceName,
      message
    };
  }

  openSuggestedSurface(routeSuggestion) {
    if (!routeSuggestion) return '';
    if (this.navigation && routeSuggestion.surfaceName && typeof this.navigation.openSurface === 'function') {
      return this.navigation.openSurface(routeSuggestion.surfaceName, routeSuggestion.params || {});
    }
    if (this.navigation && routeSuggestion.path && typeof this.navigation.openSubpage === 'function') {
      return this.navigation.openSubpage(routeSuggestion.path);
    }
    return '';
  }

  sendPageContextToAgent(surfaceName, pageContext = {}) {
    const safeContext = {
      ...pageContext,
      surfaceName
    };

    if (this.agentCore && this.agentCore.session && typeof this.agentCore.session.persist === 'function') {
      this.agentCore.session.session = {
        ...this.agentCore.session.getSession(),
        pageContext: safeContext
      };
      this.agentCore.session.persist();
    }

    if (this.agentCore && this.agentCore.bus && typeof this.agentCore.bus.publish === 'function') {
      this.agentCore.bus.publish('chat_channel', {
        type: 'surface_open',
        priority: 'background',
        payload: safeContext,
        source: 'SurfaceAgentBridge',
        target: 'chat_channel'
      });
    }

    if (this.runtime) {
      this.runtime.emit('surface_context', safeContext);
    }

    return safeContext;
  }

  attachAgentToSurface(surfaceName) {
    return {
      sendPageContext: (pageContext) => this.sendPageContextToAgent(surfaceName, pageContext),
      requestRouteHelp: (payload) => this.handleSurfaceIntent(surfaceName, {
        ...payload,
        message: payload && payload.message ? payload.message : 'where should I go next?'
      }),
      openSuggestedSurface: (routeSuggestion) => this.openSuggestedSurface(routeSuggestion)
    };
  }
}
