import profileConfig from './profile-config.json';

export class ProfileManager {
  constructor(store) {
    this.store = store;
  }

  getCurrentProfile() {
    const existingProfile = this.store.get();

    if (existingProfile) {
      return existingProfile;
    }

    return this.createGuestProfile();
  }

  createGuestProfile() {
    const guestProfile = {
      id: `guest_${Date.now()}`,
      username: profileConfig.guest_username,
      displayName: profileConfig.guest_username,
      avatarEmoji: '👤',
      isGuest: true
    };

    this.store.save(guestProfile);
    return guestProfile;
  }

  createProfile(username) {
    const normalizedUsername = this.normalizeUsername(username);
    const resolvedUsername = normalizedUsername || `${profileConfig.default_username_prefix}_${Date.now()}`;

    const profile = {
      id: `user_${Date.now()}`,
      username: resolvedUsername,
      displayName: resolvedUsername,
      avatarEmoji: '👤',
      isGuest: false
    };

    this.store.save(profile);
    return profile;
  }

  updateProfile(data) {
    const currentProfile = this.getCurrentProfile();
    const nextProfile = {
      ...currentProfile,
      ...data,
      username: data.username === ''
        ? profileConfig.guest_username
        : data.username
          ? this.normalizeUsername(data.username)
          : currentProfile.username,
      displayName: data.displayName || data.username || currentProfile.displayName || currentProfile.username,
      isGuest: typeof data.isGuest === 'boolean' ? data.isGuest : currentProfile.isGuest
    };

    this.store.save(nextProfile);
    return nextProfile;
  }

  normalizeUsername(username) {
    return String(username || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 30);
  }
}
