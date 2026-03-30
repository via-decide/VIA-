/**
 * Dynamic Tool Loader - fetches tools from decide.engine-tools.
 */
export class ToolLoader {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://raw.githubusercontent.com/via-decide/decide.engine-tools/main';
    this.cacheTimeout = config.cacheTimeout || 1000 * 60 * 5;
    this.cache = new Map();
    this.indexCache = null;
  }

  async loadIndex() {
    if (this.indexCache) {
      return this.indexCache;
    }

    try {
      const response = await fetch(`${this.baseUrl}/tools/INDEX.json`);
      if (!response.ok) {
        throw new Error('Failed to load INDEX.json');
      }

      const index = await response.json();
      this.indexCache = Array.isArray(index.tools) ? index : { tools: index, categories: [] };
      return this.indexCache;
    } catch (error) {
      console.error('[ToolLoader] Index load error:', error);
      return { tools: [], categories: [] };
    }
  }

  async loadTool(toolId) {
    const cacheKey = `tool-${toolId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const toolPath = `${this.baseUrl}/tools/${toolId}`;

      const [readmeResponse, packageResponse, index] = await Promise.all([
        fetch(`${toolPath}/README.md`),
        fetch(`${toolPath}/package.json`),
        this.loadIndex()
      ]);

      if (!readmeResponse.ok) {
        throw new Error(`README not found for ${toolId}`);
      }

      if (!packageResponse.ok) {
        throw new Error(`package.json not found for ${toolId}`);
      }

      const markdown = await readmeResponse.text();
      const metadata = await packageResponse.json();
      const toolInfo = (index.tools || []).find((tool) => tool.id === toolId) || {};

      const tool = {
        id: toolId,
        name: metadata.name || toolInfo.name || toolId,
        description: metadata.description || toolInfo.description || '',
        version: metadata.version || '1.0.0',
        author: metadata.author || 'ViaDecide',
        tags: metadata.keywords || toolInfo.tags || [],
        category: toolInfo.category || 'Tools',
        difficulty: toolInfo.difficulty || 'beginner',
        featured: Boolean(toolInfo.featured),
        markdown,
        metadata,
        sourceUrl: `https://github.com/via-decide/decide.engine-tools/tree/main/tools/${toolId}`,
        rawUrl: toolPath,
        loadedAt: new Date().toISOString()
      };

      this.cache.set(cacheKey, { data: tool, timestamp: Date.now() });
      return tool;
    } catch (error) {
      console.error(`[ToolLoader] Failed to load tool ${toolId}:`, error);
      return null;
    }
  }

  async loadAllTools() {
    const index = await this.loadIndex();
    const tools = await Promise.all((index.tools || []).map((tool) => this.loadTool(tool.id)));
    return tools.filter(Boolean);
  }

  async getAllTools() {
    const index = await this.loadIndex();
    return index.tools || [];
  }

  async getToolsByCategory(category) {
    const tools = await this.getAllTools();
    return tools.filter((tool) => tool.category === category);
  }

  async searchTools(query) {
    const tools = await this.getAllTools();
    const normalized = String(query || '').toLowerCase();

    return tools.filter((tool) => {
      const inName = (tool.name || '').toLowerCase().includes(normalized);
      const inDescription = (tool.description || '').toLowerCase().includes(normalized);
      const inTags = (tool.tags || []).some((tag) => String(tag).toLowerCase().includes(normalized));
      return inName || inDescription || inTags;
    });
  }

  async getFeaturedTools(limit = 6) {
    const tools = await this.getAllTools();
    return tools.filter((tool) => tool.featured).slice(0, limit);
  }

  async markdownToHtml(markdown) {
    if (typeof marked !== 'undefined') {
      return marked.parse(markdown);
    }

    return `<pre>${markdown}</pre>`;
  }

  clearCache() {
    this.cache.clear();
    this.indexCache = null;
  }
}

export default ToolLoader;
