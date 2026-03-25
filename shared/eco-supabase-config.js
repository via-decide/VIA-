// Runtime Supabase config shim. Keep the anon key out of git by injecting
// window.ECO_SUPABASE_ANON_KEY during deployment or by running:
// localStorage.setItem('eco_supabase_anon_key', 'your-anon-key')
(function (global) {
  const DEFAULT_SUPABASE_URL = 'https://disabled-via-config.supabase.co';

  function readStoredValue(key) {
    try {
      return String(global.localStorage?.getItem(key) || '').trim();
    } catch (_error) {
      return '';
    }
  }

  const runtimeAnonKey = String(global.ECO_SUPABASE_ANON_KEY || '').trim() || readStoredValue('eco_supabase_anon_key');

  global.ECO_SUPABASE_URL = DEFAULT_SUPABASE_URL;
  global.ECO_SUPABASE_ANON_KEY = runtimeAnonKey;
  global.ECO_SUPABASE_CONFIG = {
    url: DEFAULT_SUPABASE_URL,
    anonKey: runtimeAnonKey,
    isConfigured: false // Force disabled to stop DNS spam
  };
})(window);
