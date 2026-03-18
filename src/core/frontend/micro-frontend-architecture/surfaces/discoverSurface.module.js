export default {
  async mount(context) {
    if (typeof window.__viaLegacyBuildDiscover === 'function') {
      window.__viaLegacyBuildDiscover();
    }
    const legacySwitchLayer = window.__viaLegacySwitchLayer;
    if (typeof legacySwitchLayer === 'function') {
      legacySwitchLayer('discover');
    }
    if (context && context.target) {
      context.target.dataset.activeSurface = 'discover_surface';
    }
  },
  async prefetch() {
    if (typeof window.__viaLegacyBuildDiscover === 'function') {
      window.__viaLegacyBuildDiscover();
    }
  },
  async unmount(context) {
    if (context && context.target) {
      context.target.dataset.activeSurface = '';
    }
  }
};
