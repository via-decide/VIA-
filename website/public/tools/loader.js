/**
 * Dynamic Tool Loader - Fetches tools from GitHub without storing in repo
 */

export class ToolLoader {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://raw.githubusercontent.com/via-decide/decide.engine-tools/main';
    this.cache = new Map();
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

      // Cache result
      this.cache.set(cacheKey, { data: tool, timestamp: Date.now() });

      return tool;
    } catch (error) {
      console.error(`Failed to load tool "${toolName}":`, error.message);
      return null;
    }
  }

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
