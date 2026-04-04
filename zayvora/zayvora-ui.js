/**
 * zayvora-ui.js — Frontend UI for Zayvora Agent Console
 *
 * Features:
 * - Session authentication check
 * - Agent prompt submission
 * - Real-time output streaming
 * - Task execution logs
 * - PR creation display
 */

const ZAYVORA_API = 'http://localhost:3000';
const SESSION_CHECK_INTERVAL = 5000; // 5 seconds

class ZayvoraUI {
  constructor() {
    this.sessionId = null;
    this.isAuthenticated = false;
    this.outputBuffer = [];
    this.init();
  }

  async init() {
    this.cacheElements();
    this.attachEventListeners();
    await this.checkAuthentication();
    this.startSessionMonitoring();
  }

  cacheElements() {
    this.authBadge = document.getElementById('authBadge');
    this.launchBtn = document.getElementById('launchBtn');
    this.loginPrompt = document.getElementById('loginPrompt');
    this.consoleSection = document.getElementById('consoleSection');
    this.examplesSection = document.getElementById('examplesSection');
    this.architectureSection = document.getElementById('architectureSection');
    this.promptInput = document.getElementById('promptInput');
    this.runBtn = document.getElementById('runBtn');
    this.outputArea = document.getElementById('outputArea');
  }

  attachEventListeners() {
    this.launchBtn.addEventListener('click', () => this.toggleConsole());
    this.runBtn.addEventListener('click', () => this.executePrompt());
    this.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.executePrompt();
      }
    });
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthentication() {
    try {
      // Try to get session from cookie
      const sessionId = this.getCookie('session_id');

      if (!sessionId) {
        this.showLoginPrompt();
        return;
      }

      // Validate session with backend
      const response = await fetch(`${ZAYVORA_API}/auth/validate`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
      });

      if (!response.ok) {
        this.showLoginPrompt();
        return;
      }

      const data = await response.json();
      if (data.valid) {
        this.sessionId = sessionId;
        this.isAuthenticated = true;
        this.showConsole();
        this.updateAuthBadge(`✅ Logged in (ID: ${data.user_id})`);
      } else {
        this.showLoginPrompt();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      this.showLoginPrompt();
    }
  }

  /**
   * Monitor session validity
   */
  startSessionMonitoring() {
    setInterval(async () => {
      if (!this.isAuthenticated) return;

      try {
        const response = await fetch(`${ZAYVORA_API}/auth/validate`, {
          method: 'POST',
          headers: { 'x-session-id': this.sessionId },
        });

        if (!response.ok) {
          this.isAuthenticated = false;
          this.showLoginPrompt();
          this.appendOutput('Session expired. Please log in again.', 'error');
        }
      } catch (err) {
        console.error('Session monitor error:', err);
      }
    }, SESSION_CHECK_INTERVAL);
  }

  /**
   * Show login prompt
   */
  showLoginPrompt() {
    this.isAuthenticated = false;
    this.loginPrompt.classList.remove('hidden');
    this.consoleSection.classList.add('hidden');
    this.examplesSection.classList.add('hidden');
    this.architectureSection.classList.add('hidden');
    this.launchBtn.disabled = true;
    this.updateAuthBadge('🔒 Not logged in');
  }

  /**
   * Show console after authentication
   */
  showConsole() {
    this.loginPrompt.classList.add('hidden');
    this.launchBtn.disabled = false;
  }

  /**
   * Toggle console visibility
   */
  toggleConsole() {
    const isHidden = this.consoleSection.classList.contains('hidden');

    if (isHidden) {
      this.consoleSection.classList.remove('hidden');
      this.examplesSection.classList.remove('hidden');
      this.architectureSection.classList.remove('hidden');
      this.promptInput.focus();
      this.appendOutput('Console opened. Ready for input.', 'info');
    } else {
      this.consoleSection.classList.add('hidden');
      this.examplesSection.classList.add('hidden');
      this.architectureSection.classList.add('hidden');
    }
  }

  /**
   * Execute agent prompt
   */
  async executePrompt() {
    const prompt = this.promptInput.value.trim();

    if (!prompt) {
      this.appendOutput('Error: Please enter a prompt', 'error');
      return;
    }

    if (!this.isAuthenticated) {
      this.appendOutput('Error: Not authenticated', 'error');
      this.showLoginPrompt();
      return;
    }

    // Clear input
    this.promptInput.value = '';

    // Show execution
    this.appendOutput(`→ User: ${prompt}`, 'info');
    this.appendOutput('⏳ Processing...', 'info');

    try {
      // Call backend agent endpoint
      const response = await fetch(`${ZAYVORA_API}/api/agent/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.appendOutput('Error: Session expired', 'error');
          this.showLoginPrompt();
          return;
        }

        const error = await response.json();
        this.appendOutput(`Error: ${error.detail || response.statusText}`, 'error');
        return;
      }

      const result = await response.json();

      // Display result
      this.appendOutput('✅ Task completed', 'success');

      if (result.branch) {
        this.appendOutput(`Branch: ${result.branch}`, 'info');
      }

      if (result.pr_url) {
        this.appendOutput(`PR: ${result.pr_url}`, 'success');
      }

      if (result.files_changed) {
        this.appendOutput(`Files: ${result.files_changed.length}`, 'info');
      }

      if (result.message) {
        this.appendOutput(`Message: ${result.message}`, 'info');
      }
    } catch (err) {
      console.error('Execution error:', err);
      this.appendOutput(`Error: ${err.message}`, 'error');
      this.appendOutput('Ensure Zayvora backend is running on port 3000', 'info');
    }
  }

  /**
   * Append output to console
   */
  appendOutput(text, type = 'info') {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = text;

    this.outputArea.appendChild(line);
    this.outputArea.scrollTop = this.outputArea.scrollHeight;
  }

  /**
   * Update auth badge
   */
  updateAuthBadge(text) {
    this.authBadge.textContent = text;

    if (text.includes('Not logged in')) {
      this.authBadge.classList.add('logged-out');
    } else {
      this.authBadge.classList.remove('logged-out');
    }
  }

  /**
   * Get cookie value
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.zayvoraUI = new ZayvoraUI();
});
