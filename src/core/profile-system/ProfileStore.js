import profileConfig from './profile-config.json';

export class ProfileStore {
  constructor(storage = typeof window !== 'undefined' ? window.localStorage : null) {
    this.storage = storage;
    this.storageKey = profileConfig.storage_key;
  }

  load() {
    if (!this.storage) return null;

    try {
      const rawProfile = this.storage.getItem(this.storageKey);
      return rawProfile ? JSON.parse(rawProfile) : null;
    } catch (error) {
      console.warn('[VIAProfile] Failed to load stored profile.', error);
      return null;
    }
  }

  save(profile) {
    if (!this.storage) return profile;

    this.storage.setItem(this.storageKey, JSON.stringify(profile));
    return profile;
  }

  get() {
    return this.load();
  }

  clear() {
    if (!this.storage) return;
    this.storage.removeItem(this.storageKey);
  }
}
