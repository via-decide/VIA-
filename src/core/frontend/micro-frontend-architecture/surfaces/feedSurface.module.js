export default {
  async mount(context) {
    const legacySwitchLayer = window.__viaLegacySwitchLayer;
    if (typeof legacySwitchLayer === 'function') {
      legacySwitchLayer('feed');
    }
    context.runtime.emit('telemetry', {
      surface: 'feed_surface',
      action: 'mount'
    });
  },
  async unmount(context) {
    if (context && context.target) {
      context.target.dataset.activeSurface = '';
    }
  }
};
