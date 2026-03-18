export default {
  async mount(context) {
    if (context && context.runtime && context.runtime.navigation) {
      context.runtime.navigation.openSurface('creator_surface');
    }
  },
  async unmount() {}
};
