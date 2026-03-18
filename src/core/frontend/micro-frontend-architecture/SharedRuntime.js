const AUTH_STORAGE_KEY = 'via.runtime.auth_state';
const THEME_STORAGE_KEY = 'via.runtime.theme';
const STORAGE_PREFIX = 'via.runtime.storage.';

function safeJsonParse(value, fallback = null) {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

export class SharedRuntime {
  constructor(options = {}) {
    this.storage = options.storage || window.localStorage;
    this.eventTarget = options.eventTarget || new EventTarget();
    this.eventWrappers = new Map();
    this.authState = safeJsonParse(this.storage.getItem(AUTH_STORAGE_KEY), null);
    this.theme = this.storage.getItem(THEME_STORAGE_KEY) || 'dark';

    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      if (event.key === AUTH_STORAGE_KEY) {
        this.authState = safeJsonParse(event.newValue, null);
        this.emit('auth_state', this.authState);
        return;
      }
      if (event.key === THEME_STORAGE_KEY) {
        this.theme = event.newValue || 'dark';
        this.emit('theme', this.theme);
        return;
      }
      if (event.key.indexOf(STORAGE_PREFIX) === 0) {
        this.emit('storage', {
          key: event.key.replace(STORAGE_PREFIX, ''),
          value: safeJsonParse(event.newValue, event.newValue)
        });
      }
    });
  }

  getAuthState() {
    return this.authState;
  }

  setAuthState(state) {
    this.authState = state && typeof state === 'object' ? { ...state } : state;
    this.storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.authState));
    this.emit('auth_state', this.authState);
    return this.authState;
  }

  getTheme() {
    return this.theme;
  }

  setTheme(theme) {
    this.theme = theme || 'dark';
    this.storage.setItem(THEME_STORAGE_KEY, this.theme);
    this.emit('theme', this.theme);
    return this.theme;
  }

  getStorage(key) {
    const rawValue = this.storage.getItem(`${STORAGE_PREFIX}${key}`);
    return safeJsonParse(rawValue, rawValue);
  }

  setStorage(key, value) {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.storage.setItem(storageKey, serialized);
    this.emit('storage', { key, value });
    return value;
  }

  emit(eventName, payload) {
    const detail = {
      eventName,
      payload,
      timestamp: Date.now()
    };
    this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
    window.dispatchEvent(new CustomEvent(`via:runtime:${eventName}`, { detail }));
    return detail;
  }

  subscribe(eventName, handler) {
    if (typeof handler !== 'function') {
      return () => {};
    }

    const wrappedHandler = (event) => handler(event.detail.payload, event.detail);
    const wrapperKey = `${eventName}:${String(handler)}`;
    this.eventWrappers.set(wrapperKey, wrappedHandler);
    this.eventTarget.addEventListener(eventName, wrappedHandler);
    return () => this.unsubscribe(eventName, handler);
  }

  unsubscribe(eventName, handler) {
    const wrapperKey = `${eventName}:${String(handler)}`;
    const wrappedHandler = this.eventWrappers.get(wrapperKey);
    if (!wrappedHandler) {
      return false;
    }

    this.eventTarget.removeEventListener(eventName, wrappedHandler);
    this.eventWrappers.delete(wrapperKey);
    return true;
  }
}
