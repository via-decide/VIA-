export class ToolLoader {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://raw.githubusercontent.com/via-decide/decide.engine-tools/main';
    this.cache = new Map();
    this.cacheTimeout = config.cacheTimeout || 1000 * 60 * 5;
    this.indexCache = null;
  }

  async loadIndex() {
    if (this.indexCache) return this.indexCache;

    try {
      const response = await fetch(`${this.baseUrl}/tools/INDEX.json`);
      if (!response.ok) throw new Error('Failed to load INDEX.json');
      this.indexCache = await response.json();
      return this.indexCache;
    } catch (error) {
      console.error('Index load error:', error);
      return { tools: [], categories: [] };
    }
  }

  async loadTool(toolId) {
    const cacheKey = `tool-${toolId}`;

    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    try {
      const toolPath = `${this.baseUrl}/tools/${toolId}`;

      const readmeResponse = await fetch(`${toolPath}/README.md`);
      if (!readmeResponse.ok) throw new Error('README not found');
      const markdown = await readmeResponse.text();

      const packageResponse = await fetch(`${toolPath}/package.json`);
      if (!packageResponse.ok) throw new Error('package.json not found');
      const metadata = await packageResponse.json();

      const index = await this.loadIndex();
      const toolInfo = (index.tools || []).find((t) => t.id === toolId);

      const tool = {
        id: toolId,
        name: metadata.name || toolInfo?.name || toolId,
        description: metadata.description || toolInfo?.description || '',
        version: metadata.version || '1.0.0',
        author: metadata.author || 'ViaDecide',
        tags: metadata.keywords || toolInfo?.tags || [],
        category: toolInfo?.category || 'Tools',
        difficulty: toolInfo?.difficulty || 'beginner',
        featured: Boolean(toolInfo?.featured),
        markdown,
        metadata,
        sourceUrl: `https://github.com/via-decide/decide.engine-tools/tree/main/tools/${toolId}`,
        rawUrl: toolPath,
        loadedAt: new Date().toISOString()
      };

      this.cache.set(cacheKey, { data: tool, timestamp: Date.now() });
      return tool;
    } catch (error) {
      console.error(`Error loading tool "${toolId}":`, error.message);
      return null;
    }
  }

  async getAllTools() {
    try {
      const index = await this.loadIndex();
      return index.tools || [];
    } catch (error) {
      console.error('Error loading tools:', error);
      return [];
    }
  }

  async getToolsByCategory(category) {
    const tools = await this.getAllTools();
    return tools.filter((t) => t.category === category);
  }

  async searchTools(query) {
    const tools = await this.getAllTools();
    const q = query.toLowerCase();
    return tools.filter((t) =>
      t.name.toLowerCase().includes(q)
      || t.description.toLowerCase().includes(q)
      || (t.tags || []).some((tag) => String(tag).toLowerCase().includes(q))
    );
  }

  async getFeaturedTools() {
    const tools = await this.getAllTools();
    return tools.filter((t) => t.featured).slice(0, 6);
  }

  clearCache() {
    this.cache.clear();
    this.indexCache = null;
  }
}

export default ToolLoader;
