export default {
  async mount(context) {
    if (context && context.runtime && context.runtime.navigation) {
      context.runtime.navigation.openSurface('engine_tools_surface');
    }
  },
  async unmount() {}
};
