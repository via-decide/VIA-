export default {
  async mount(context) {
    if (typeof window.__viaLegacyBuildProfile === 'function') {
      window.__viaLegacyBuildProfile();
    }
    const legacySwitchLayer = window.__viaLegacySwitchLayer;
    if (typeof legacySwitchLayer === 'function') {
      legacySwitchLayer('profile');
    }
    context.runtime.emit('telemetry', {
      surface: 'profile_surface',
      action: 'mount'
    });
  },
  async prefetch() {
    if (typeof window.__viaLegacyBuildProfile === 'function') {
      window.__viaLegacyBuildProfile();
    }
  },
  async unmount(context) {
    if (context && context.target) {
      context.target.dataset.activeSurface = '';
    }
  }
};
