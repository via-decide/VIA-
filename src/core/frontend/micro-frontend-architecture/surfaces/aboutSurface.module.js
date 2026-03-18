export default {
  async mount(context) {
    const legacySwitchLayer = window.__viaLegacySwitchLayer;
    if (typeof legacySwitchLayer === 'function') {
      legacySwitchLayer('about');
    }
    if (context && context.target) {
      context.target.dataset.activeSurface = 'about_surface';
    }
  },
  async unmount(context) {
    if (context && context.target) {
      context.target.dataset.activeSurface = '';
    }
  }
};
