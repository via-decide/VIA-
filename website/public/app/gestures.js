(function attachGestures(global) {
  'use strict';

  const VIA = global.VIA || (global.VIA = { core: {}, router: {}, state: {}, storage: {}, modules: {}, ui: {}, gestures: {} });

  const gestureState = {
    active: null,
    handlers: []
  };

  function dispatch(type, payload) {
    gestureState.handlers.forEach(function each(handler) {
      if (typeof handler[type] === 'function') {
        handler[type](payload);
      }
    });
  }

  VIA.gestures.register = function register(handler) {
    gestureState.handlers.push(handler);
    return function unregister() {
      gestureState.handlers = gestureState.handlers.filter(function notMatch(item) {
        return item !== handler;
      });
    };
  };

  VIA.gestures.bind = function bind(element) {
    element.addEventListener('pointerdown', function onPointerDown(event) {
      if (gestureState.active) {
        return;
      }

      gestureState.active = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        time: Date.now()
      };

      dispatch('start', gestureState.active);
    });

    element.addEventListener('pointermove', function onPointerMove(event) {
      if (!gestureState.active || gestureState.active.id !== event.pointerId) {
        return;
      }

      dispatch('move', {
        dx: event.clientX - gestureState.active.startX,
        dy: event.clientY - gestureState.active.startY,
        originalEvent: event
      });
    });

    element.addEventListener('pointerup', function onPointerUp(event) {
      if (!gestureState.active || gestureState.active.id !== event.pointerId) {
        return;
      }

      dispatch('end', {
        dx: event.clientX - gestureState.active.startX,
        dy: event.clientY - gestureState.active.startY,
        duration: Date.now() - gestureState.active.time,
        originalEvent: event
      });

      gestureState.active = null;
    });
  };
}(window));
