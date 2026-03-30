(function attachGestures(global) {
  'use strict';

  const namespace = global.VIA || (global.VIA = { engine: {}, world: {}, ui: {}, storage: {}, router: {} });

  const state = {
    active: null,
    handlers: []
  };

  function dispatch(type, payload) {
    state.handlers.forEach(function each(handler) {
      if (typeof handler[type] === 'function') {
        handler[type](payload);
      }
    });
  }

  namespace.ui.gestures = {
    register(handler) {
      state.handlers.push(handler);
      return function unregister() {
        state.handlers = state.handlers.filter((item) => item !== handler);
      };
    },

    bind(element) {
      element.addEventListener('pointerdown', function onPointerDown(event) {
        if (state.active) {
          return;
        }
        state.active = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          time: Date.now()
        };
        dispatch('start', state.active);
      });

      element.addEventListener('pointermove', function onPointerMove(event) {
        if (!state.active || state.active.id !== event.pointerId) {
          return;
        }

        const dx = event.clientX - state.active.startX;
        const dy = event.clientY - state.active.startY;
        dispatch('move', { dx, dy, originalEvent: event });
      });

      element.addEventListener('pointerup', function onPointerUp(event) {
        if (!state.active || state.active.id !== event.pointerId) {
          return;
        }

        const duration = Date.now() - state.active.time;
        const dx = event.clientX - state.active.startX;
        const dy = event.clientY - state.active.startY;
        dispatch('end', { dx, dy, duration, originalEvent: event });
        state.active = null;
      });
    }
  };
}(window));
