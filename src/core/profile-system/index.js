import { ProfileStore } from './ProfileStore';
import { ProfileManager } from './ProfileManager';

export function createProfileSystem() {
  const store = new ProfileStore();
  const manager = new ProfileManager(store);

  const profileSystem = {
    getProfile: () => manager.getCurrentProfile(),
    createProfile: (username) => manager.createProfile(username),
    updateProfile: (data) => manager.updateProfile(data),
    clearProfile: () => store.clear()
  };

  if (typeof window !== 'undefined') {
    window.VIAProfile = profileSystem;
  }

  return profileSystem;
}

const defaultProfileSystem = createProfileSystem();

export default defaultProfileSystem;
