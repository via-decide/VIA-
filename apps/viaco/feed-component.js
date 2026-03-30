/**
 * ─────────────────────────────────────────────────────────────
 * VIADECIDE FEED COMPONENT - JavaScript Engine
 * Loads and displays activity feed with filtering and pagination
 * ─────────────────────────────────────────────────────────────
 */

class ViaDecideFeed {
  constructor(options = {}) {
    this.feedUrl = options.feedUrl || 'https://raw.githubusercontent.com/via-decide/VIA-/main/feed-data.json';
    this.container = document.getElementById('viadecide-feed') || document.querySelector('.viadecide-feed-container');
    this.currentFilter = 'all';
    this.currentPage = 0;
    this.itemsPerPage = 15;
    this.allItems = [];
    this.filteredItems = [];

    if (!this.container) {
      console.error('Feed container not found');
      return;
    }

    this.init();
  }

  /**
   * Initialize feed
   */
  async init() {
    this.setupEventListeners();
    await this.loadFeedData();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-pressed', 'true');
        this.currentFilter = e.target.dataset.filter;
        this.currentPage = 0;
        this.applyFilter();
        this.renderFeed();
      });
    });

    // Pagination buttons
    document.getElementById('prevBtn')?.addEventListener('click', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderFeed();
        this.scrollToFeed();
      }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
      const maxPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
      if (this.currentPage < maxPages - 1) {
        this.currentPage++;
        this.renderFeed();
        this.scrollToFeed();
      }
    });
  }

  /**
   * Load feed data from GitHub
   */
  async loadFeedData() {
    try {
      // Show loading skeleton
      this.renderSkeleton();

      const response = await fetch(this.feedUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.allItems = data.recentActivity || data.items || [];

      // Cache data for offline access
      localStorage.setItem('viaDecideFeedCache', JSON.stringify({
        items: this.allItems,
        stats: data.stats || {},
        timestamp: Date.now()
      }));

      // Update stats
      this.updateStats(data.stats || {});

      // Apply initial filter
      this.applyFilter();
      this.renderFeed();

      console.log('✅ Feed data loaded:', this.allItems.length, 'items');
    } catch (error) {
      console.error('Error loading feed:', error);

      // Try to load from cache
      const cached = localStorage.getItem('viaDecideFeedCache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.allItems = cacheData.items || [];
        this.updateStats(cacheData.stats || {});
        this.applyFilter();
        this.renderFeed();
        this.showError(`Failed to refresh feed (showing cached data from ${new Date(cacheData.timestamp).toLocaleString()}). ${error.message}`);
      } else {
        this.showError(`Failed to load feed: ${error.message}`);
      }
    }
  }

  /**
   * Update statistics display
   */
  updateStats(stats) {
    document.getElementById('statCommits').textContent = stats.totalCommits || 0;
    document.getElementById('statTools').textContent = stats.totalTools || 0;
    document.getElementById('statContributors').textContent = stats.contributors?.length || 0;
  }

  /**
   * Apply current filter
   */
  applyFilter() {
    if (this.currentFilter === 'all') {
      this.filteredItems = [...this.allItems];
    } else {
      this.filteredItems = this.allItems.filter((item) => item.type === this.currentFilter);
    }

    // Sort by timestamp (newest first)
    this.filteredItems.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Render loading skeleton
   */
  renderSkeleton() {
    const feedContent = document.getElementById('feedContent');
    const skeletons = Array(5)
      .fill('')
      .map(
        () => `
        <li class="feed-item skeleton">
          <div class="feed-icon" aria-hidden="true">⋮</div>
          <div class="feed-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-meta"></div>
          </div>
        </li>
      `
      )
      .join('');

    feedContent.innerHTML = `<ul class="feed-list" aria-busy="true">${skeletons}</ul>`;
  }

  /**
   * Render feed items
   */
  renderFeed() {
    const feedContent = document.getElementById('feedContent');

    if (this.filteredItems.length === 0) {
      const filterLabel = this.currentFilter === 'commit' ? 'commits' : this.currentFilter === 'tool' ? 'tools' : 'activity';
      feedContent.innerHTML = `<div class="feed-empty">No ${filterLabel} found. Try a different filter.</div>`;
      this.updatePagination();
      return;
    }

    // Calculate pagination
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageItems = this.filteredItems.slice(start, end);

    // Render items
    const itemsHTML = pageItems
      .map((item) => this.renderItem(item))
      .join('');

    feedContent.innerHTML = `<ul class="feed-list" aria-busy="false">${itemsHTML}</ul>`;

    // Update pagination
    this.updatePagination();

    // Announce to screen readers
    const feedList = feedContent.querySelector('.feed-list');
    if (feedList) {
      feedList.setAttribute('role', 'region');
      feedList.setAttribute('aria-live', 'polite');
    }
  }

  /**
   * Render single feed item
   */
  renderItem(item) {
    const typeClass = item.type || 'unknown';
    const title = this.escapeHtml(item.subject || item.name || 'Activity');
    const description = item.body || item.description || '';
    const author = this.escapeHtml(item.author || 'System');
    const dateInfo = this.formatDate(item.dateISO || item.timestamp);
    const date = dateInfo.relative;
    const absoluteDate = dateInfo.absolute;
    const category = item.category ? `<span class="feed-category">${this.escapeHtml(item.category)}</span>` : '';
    const description_html = description ? `<div class="feed-description">${this.escapeHtml(description)}</div>` : '';
    const link = item.url
      ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="feed-link" title="Opens GitHub in new window">View on GitHub →</a>`
      : '';
    const typeLabel = typeClass === 'commit' ? 'Commit' : typeClass === 'tool' ? 'Tool' : 'Activity';

    return `
      <li class="feed-item ${typeClass}" role="article" aria-label="${typeLabel} by ${author}">
        <div class="feed-icon" aria-hidden="true">${item.icon || '📌'}</div>
        <div class="feed-content">
          <h3 class="feed-title">${title}</h3>
          <div class="feed-meta">
            <span class="feed-author" title="Contributor">👤 ${author}</span>
            <span class="feed-date" title="${absoluteDate}">📅 ${date}</span>
            ${category}
          </div>
          ${description_html}
          ${link}
        </div>
      </li>
    `;
  }

  /**
   * Update pagination UI
   */
  updatePagination() {
    const maxPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (pageInfo) {
      pageInfo.textContent = maxPages > 0 ? `Page ${this.currentPage + 1} of ${maxPages}` : 'No items';
    }

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= maxPages - 1;
    }
  }

  /**
   * Format date for display (returns both relative and absolute)
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let relative = 'Unknown date';
      if (diffMins < 1) relative = 'just now';
      else if (diffMins < 60) relative = `${diffMins}m ago`;
      else if (diffHours < 24) relative = `${diffHours}h ago`;
      else if (diffDays < 7) relative = `${diffDays}d ago`;
      else {
        relative = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }

      // Absolute date with timezone
      const absolute = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      return { relative, absolute };
    } catch {
      return { relative: 'Unknown date', absolute: 'Unknown date' };
    }
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Show error message with retry button
   */
  showError(message) {
    const feedContent = document.getElementById('feedContent');
    feedContent.innerHTML = `
      <div class="feed-empty" style="color: #e74c3c;">
        <div>❌ ${message}</div>
        <p style="margin-top: 10px; font-size: 12px; color: #999;">
          Make sure the feed URL is correct and GitHub is accessible.
        </p>
        <button id="retryBtn" style="
          margin-top: 15px;
          padding: 8px 16px;
          background: #ff9933;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        "
        onmouseover="this.style.opacity='0.9'"
        onmouseout="this.style.opacity='1'"
        aria-label="Retry loading the feed">
          🔄 Retry
        </button>
      </div>
    `;

    document.getElementById('retryBtn').addEventListener('click', () => {
      this.loadFeedData();
    });
  }

  /**
   * Scroll to feed
   */
  scrollToFeed() {
    const feedContent = document.getElementById('feedContent');
    if (feedContent) {
      feedContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ViaDecideFeed();
  });
} else {
  new ViaDecideFeed();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViaDecideFeed;
}
