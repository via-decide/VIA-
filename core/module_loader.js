(function (global) {
  'use strict';

  function ModuleLoader(options) {
    var config = options || {};
    this._mountPoint = config.mountPoint || null;
    this._active = null;
    this._loadTimeoutMs = config.loadTimeoutMs || 12000;
  }

  ModuleLoader.prototype.setMountPoint = function setMountPoint(element) {
    this._mountPoint = element;
  };

  ModuleLoader.prototype._buildIframe = function _buildIframe(tool) {
    var iframe = document.createElement('iframe');
    iframe.title = tool.name || tool.id;
    iframe.src = tool.url;
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'no-referrer';
    iframe.setAttribute('sandbox', (tool.sandbox || []).join(' '));
    iframe.setAttribute('data-tool-id', tool.id);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    return iframe;
  };

  ModuleLoader.prototype._renderError = function _renderError(message) {
    var shell = document.createElement('div');
    shell.setAttribute('role', 'alert');
    shell.style.padding = '12px';
    shell.style.border = '1px solid #e5484d';
    shell.style.background = '#fff5f5';
    shell.style.color = '#b42318';
    shell.textContent = 'Tool failed to load: ' + message;
    return shell;
  };

  ModuleLoader.prototype.unload = function unload() {
    if (this._active && this._active.parentNode) {
      this._active.parentNode.removeChild(this._active);
    }
    this._active = null;
  };

  ModuleLoader.prototype.load = function load(tool) {
    var mount = this._mountPoint;
    if (!mount) {
      return Promise.reject(new Error('Module mount point is not configured.'));
    }

    this.unload();

    var iframe = this._buildIframe(tool);
    this._active = iframe;

    return new Promise(function (resolve, reject) {
      var settled = false;
      var timeout = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('iframe load timeout'));
      }, this._loadTimeoutMs);

      iframe.onload = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(iframe);
      };

      iframe.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(new Error('iframe load error'));
      };

      mount.appendChild(iframe);
    }.bind(this)).catch(function (error) {
      this.unload();
      mount.appendChild(this._renderError(error.message));
      throw error;
    }.bind(this));
  };

  global.VIA = global.VIA || {};
  global.VIA.ModuleLoader = ModuleLoader;
})(window);
