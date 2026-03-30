/**
 * Dynamic Tool Loader - Fetches tools from GitHub without storing in repo
 */

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
    this.cacheTimeout = config.cacheTimeout || 1000 * 60 * 5; // 5 min
  }

  /**
   * Load single tool by name
   */
  async loadTool(toolName) {
    const cacheKey = `tool-${toolName}`;

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
      const toolPath = `${this.baseUrl}/tools/${toolName}`;

      // Fetch markdown
      const readmeResponse = await fetch(`${toolPath}/README.md`);
      if (!readmeResponse.ok) throw new Error(`README not found for ${toolName}`);
      const markdown = await readmeResponse.text();

      // Fetch package.json
      const packageResponse = await fetch(`${toolPath}/package.json`);
      if (!packageResponse.ok) throw new Error(`package.json not found for ${toolName}`);
      const metadata = await packageResponse.json();

      const tool = {
        id: toolName,
        name: metadata.name || toolName,
        description: metadata.description || '',
        version: metadata.version || '1.0.0',
        author: metadata.author || 'ViaDecide',
        keywords: metadata.keywords || [],
        markdown,
        metadata,
        sourceUrl: `https://github.com/via-decide/decide.engine-tools/tree/main/tools/${toolName}`,
        rawUrl: toolPath,
        loadedAt: new Date().toISOString()
      };

      this.cache.set(cacheKey, { data: tool, timestamp: Date.now() });
      return tool;
    } catch (error) {
      console.error(`Error loading tool "${toolId}":`, error.message);
      // Cache result
      this.cache.set(cacheKey, { data: tool, timestamp: Date.now() });

      return tool;
    } catch (error) {
      console.error(`Failed to load tool "${toolName}":`, error.message);
      return null;
    }
  }

  async getAllTools() {
    try {
      const index = await this.loadIndex();
      return index.tools || [];
    } catch (error) {
      console.error('Error loading tools:', error);
  /**
   * Load all tools from INDEX
   */
  async loadAllTools() {
    try {
      const indexUrl = `${this.baseUrl}/tools/INDEX.json`;
      const response = await fetch(indexUrl);
      if (!response.ok) throw new Error('INDEX.json not found');

      const index = await response.json();

      // Fetch full details for each tool
      const tools = await Promise.all(
        index.map((toolInfo) => this.loadTool(toolInfo.id))
      );

      return tools.filter((tool) => tool !== null);
    } catch (error) {
      console.error('Failed to load tool index:', error.message);
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
  /**
   * Get tool metadata only (fast)
   */
  async loadToolIndex() {
    try {
      const indexUrl = `${this.baseUrl}/tools/INDEX.json`;
      const response = await fetch(indexUrl);
      if (!response.ok) throw new Error('INDEX.json not found');
      return await response.json();
    } catch (error) {
      console.error('Failed to load tool index:', error.message);
      return [];
    }
  }

  /**
   * Convert markdown to HTML
   */
  async markdownToHtml(markdown) {
    if (typeof marked !== 'undefined') {
      return marked.parse(markdown);
    }

    return `<pre>${markdown}</pre>`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default ToolLoader;
