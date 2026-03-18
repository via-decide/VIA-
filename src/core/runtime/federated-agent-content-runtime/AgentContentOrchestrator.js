function normalizeMessage(message) {
  return String(message || '').trim();
}

export class AgentContentOrchestrator {
  constructor(options = {}) {
    this.runtime = options.runtime || null;
    this.agentCore = options.agentCore || null;
    this.contentBridge = options.contentBridge || null;
    this.prefetchCoordinator = options.prefetchCoordinator || null;
  }

  async processUserIntent(message, context = {}) {
    const safeMessage = normalizeMessage(message);
    const intent = this.resolveAgentAction(safeMessage, context);
    let routeSuggestion = null;
    let contentResult = null;
    let task = null;

    if (intent.type === 'route_suggestion') {
      routeSuggestion = await this.requestRouteSuggestion(safeMessage, context.pageContext || context);
      if (routeSuggestion && routeSuggestion.prefetched && this.runtime) {
        this.runtime.emit('surface_prefetch', routeSuggestion);
      }
    }

    if (intent.type === 'content_transformation') {
      contentResult = this.requestContentTransformation(intent.input, intent.mode);
    }

    if (intent.type === 'task_create') {
      task = this.createTaskFromInteraction({
        message: safeMessage,
        context,
        linkedRoute: routeSuggestion && (routeSuggestion.surfaceName || routeSuggestion.path)
      });
    }

    if (intent.type === 'compound_creator_flow') {
      task = this.createTaskFromInteraction({
        message: safeMessage,
        context,
        linkedRoute: 'creator_surface'
      });
      contentResult = this.requestContentTransformation(intent.input, 'creator_draft');
    }

    const result = {
      handled: intent.type !== 'fallback',
      intent,
      routeSuggestion,
      contentResult,
      task
    };

    result.agentResponseText = this.buildAgentResponse(result);
    if (this.runtime) {
      this.runtime.emit('agent_reply', result);
    }
    return result;
  }

  resolveAgentAction(intent, context = {}) {
    const message = normalizeMessage(intent).toLowerCase();
    const longformInput = context.longform || context.input || context.story || context.pageContext || context;

    if (/turn this into a post|make this a creator draft/.test(message)) {
      return {
        type: 'compound_creator_flow',
        mode: 'creator_draft',
        input: longformInput,
        label: 'Story → Agent → Creator Draft'
      };
    }

    if (/where should i go next|what tool|what page|route help|which surface|open the best page/.test(message)) {
      return {
        type: 'route_suggestion',
        input: message,
        label: 'Feed → Agent → Route Suggestion'
      };
    }

    if (/save this for later|create task|add task|todo|to-do|follow up/.test(message)) {
      return {
        type: 'task_create',
        input: message,
        label: 'Creator Onboarding → Agent → Task'
      };
    }

    if (/turn this into a post|content transformation|draft generate|creator draft|feed preview|trend stack/.test(message)) {
      return {
        type: 'content_transformation',
        mode: /trend/.test(message) ? 'trend_stack' : /feed|post/.test(message) ? 'feed_units' : 'creator_draft',
        input: longformInput,
        label: 'Agent Widget → Content Awareness'
      };
    }

    return {
      type: 'fallback',
      input: message,
      label: 'Fallback'
    };
  }

  requestContentTransformation(input, mode) {
    if (!this.contentBridge) return null;
    if (mode === 'feed_units') {
      const result = this.contentBridge.buildFeedUnits(input);
      if (this.runtime) this.runtime.telemetry.track('draft_generate', { mode });
      return result;
    }
    if (mode === 'trend_stack') {
      return this.contentBridge.buildTrendStack(input);
    }
    const result = this.contentBridge.buildCreatorDraft(input);
    if (this.runtime) this.runtime.telemetry.track('draft_generate', { mode: mode || 'creator_draft' });
    return result;
  }

  async requestRouteSuggestion(message, pageContext = {}) {
    let suggestion = null;

    if (this.agentCore && this.agentCore.routes && typeof this.agentCore.routes.suggestRoute === 'function') {
      suggestion = this.agentCore.routes.suggestRoute(message, pageContext);
    }

    if (!suggestion) {
      const pathname = String(pageContext.pathname || '');
      suggestion = /creator|draft/.test(message)
        ? { label: 'Creator Setup', path: './creator-onboarding.html', surfaceName: 'creator_surface', confidence: 0.82, reason: 'The request mentions creator or draft work.' }
        : /about|mission/.test(message) || pathname.includes('about')
          ? { label: 'About VIA', path: './index.html?surface=about', surfaceName: 'about_surface', confidence: 0.76, reason: 'The request leans toward product context.' }
          : { label: 'Discover', path: './index.html?surface=discover', surfaceName: 'discover_surface', confidence: 0.75, reason: 'The request needs exploration or next-step discovery.' };
    }

    if (this.prefetchCoordinator && this.prefetchCoordinator.shouldPrefetch(suggestion)) {
      await this.prefetchCoordinator.prefetchSurface(suggestion.surfaceName || 'discover_surface');
      suggestion.prefetched = true;
    }

    if (this.runtime) {
      this.runtime.telemetry.track('route_suggestion', suggestion);
    }

    return suggestion;
  }

  createTaskFromInteraction(interaction = {}) {
    if (!this.agentCore || !this.agentCore.tasks || typeof this.agentCore.tasks.createTask !== 'function') {
      return {
        id: `task-${Date.now()}`,
        title: normalizeMessage(interaction.message) || 'Follow up',
        origin: 'federated-runtime'
      };
    }

    return this.agentCore.tasks.createTask({
      title: normalizeMessage(interaction.message) || 'Follow up',
      origin: interaction.context && interaction.context.surfaceName ? interaction.context.surfaceName : 'federated-runtime',
      linkedRoute: interaction.linkedRoute || '',
      linkedPrompt: normalizeMessage(interaction.message),
      suggestedAction: 'Review in VIA agent tasks'
    });
  }

  buildAgentResponse(result = {}) {
    if (result.contentResult && result.contentResult.draft) {
      return `I turned the current surface context into a creator draft and kept it available for creator onboarding.`;
    }
    if (result.contentResult && result.contentResult.preview) {
      return `I transformed the content into a feed-friendly preview block you can surface in VIA.`;
    }
    if (result.routeSuggestion) {
      return `The best next surface looks like ${result.routeSuggestion.label}. I${result.routeSuggestion.prefetched ? ' already prefetched it and ' : ' '}can open it when you are ready.`;
    }
    if (result.task) {
      return `I saved this as a follow-up task so it stays accessible in the current VIA flow.`;
    }
    return 'I understood the current VIA context, but I did not need to trigger a route, task, or content transformation.';
  }
}
