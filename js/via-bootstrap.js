(function (global) {
  'use strict';

  var PROFILE_KEY = 'via_profile';
  var USER_KEY = 'via_user';
  var CREATOR_DRAFT_KEY = 'via_creator_published_drafts';
  var DEFAULT_DISCOVER_ITEMS = [
    {
      emoji: '📦',
      cat: 'Context',
      name: 'Context Packager',
      desc: 'Bundle text, code, and links into a single file payload for AI models.',
      path: 'https://via-decide.github.io/decide.engine-tools/'
    },
    {
      emoji: '📖',
      cat: 'Deep Dive',
      name: 'Digital Bharat Revolution',
      desc: 'How affordable internet and smartphones changed education, healthcare, and entrepreneurship.',
      path: './about.html#digital-bharat'
    },
    {
      emoji: '🎬',
      cat: 'Creator',
      name: 'Creator Story',
      desc: 'The conviction page that frames how creators publish inside VIA.',
      path: './creator-story.html'
    },
    {
      emoji: '🤖',
      cat: 'Agent',
      name: 'Agent Surface',
      desc: 'A direct-launch command surface for tools, pages, and runtime checks.',
      path: './agent.html'
    },
    {
      emoji: '🧭',
      cat: 'Imported',
      name: 'Decision Brief',
      desc: 'Constraint-first decision brief page adapted from decide.engine.',
      path: './decision-brief.html'
    },
    {
      emoji: '📚',
      cat: 'Imported',
      name: 'StudyOS Classic',
      desc: 'Direct launcher to the imported StudyOS workspace.',
      path: './StudyOS.html'
    },
    {
      emoji: '🛠️',
      cat: 'Imported',
      name: 'App Generator',
      desc: 'Generator surface normalized to VIA tool paths.',
      path: './app-generator.html'
    },
    {
      emoji: '💰',
      cat: 'Imported',
      name: 'Finance Dashboard MSME',
      desc: 'Standalone finance workspace based on decide.engine patterns.',
      path: './finance-dashboard-msme.html'
    },
    {
      emoji: '🧪',
      cat: 'Imported',
      name: 'Alchemist Quiz',
      desc: 'Quiz surface migrated with a VIA-safe fallback dataset.',
      path: './alchemist.html'
    }
  ];
  var DEFAULT_FEED_POSTS = [
    {
      id: 'seed-1',
      title: 'Welcome to VIA',
      body: 'Direct HTML surfaces now share state through a tiny browser runtime instead of a fragile SPA router shell.',
      author: 'VIA Official',
      tag: 'Platform',
      location: 'Bharat',
      created_at: '2026-03-19T00:00:00.000Z'
    },
    {
      id: 'seed-2',
      title: 'Creator flow is now first-class',
      body: 'The creator conviction page and onboarding page link straight into feed, profile, and agent surfaces with no client router assumptions.',
      author: 'VIA Studio',
      tag: 'Creator',
      location: 'Creator Surface',
      created_at: '2026-03-18T18:00:00.000Z'
    }
  ];

  function parseJSON(rawValue, fallback) {
    try {
      return JSON.parse(rawValue);
    } catch (_error) {
      return fallback;
    }
  }

  function clone(value) {
    return parseJSON(JSON.stringify(value), value);
  }

  function ensureRuntime() {
    if (global.VIAFederatedRuntime && typeof global.VIAFederatedRuntime.emit === 'function') {
      return global.VIAFederatedRuntime;
    }
    var listeners = {};
    global.VIAFederatedRuntime = {
      emit: function (eventName, payload) {
        (listeners[eventName] || []).slice().forEach(function (listener) {
          listener(payload);
        });
        return payload;
      },
      subscribe: function (eventName, listener) {
        if (typeof listener !== 'function') return function () {};
        listeners[eventName] = listeners[eventName] || [];
        listeners[eventName].push(listener);
        return function () {
          listeners[eventName] = (listeners[eventName] || []).filter(function (item) {
            return item !== listener;
          });
        };
      },
      getSnapshot: function () {
        return {
          page: global.location.pathname,
          listeners: Object.keys(listeners).reduce(function (acc, key) {
            acc[key] = (listeners[key] || []).length;
            return acc;
          }, {})
        };
      }
    };
    return global.VIAFederatedRuntime;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'guest';
  }

  function defaultProfile() {
    return {
      id: '',
      username: 'guest',
      display_name: 'Guest Explorer',
      city: 'Preview Mode',
      avatar_emoji: '👀',
      bio: 'Local-first VIA profile stored in your browser.',
      xp: 0,
      level: 1,
      followers: 0,
      following: 0,
      posts: 0,
      is_guest: true,
      created_at: new Date().toISOString()
    };
  }

  function normalizeProfile(profile) {
    var base = defaultProfile();
    var next = profile && typeof profile === 'object' ? profile : {};
    var username = String(next.username || next.displayName || next.display_name || base.username).trim() || base.username;
    return {
      id: String(next.id || next.uid || (next.is_guest ? '' : 'via-' + slugify(username))).trim(),
      username: username,
      display_name: String(next.display_name || next.displayName || username || base.display_name).trim() || base.display_name,
      city: String(next.city || base.city).trim() || base.city,
      avatar_emoji: String(next.avatar_emoji || next.avatarEmoji || base.avatar_emoji).trim() || base.avatar_emoji,
      bio: String(next.bio || base.bio).trim() || base.bio,
      xp: Number(next.xp || 0),
      level: Number(next.level || 1),
      followers: Number(next.followers || 0),
      following: Number(next.following || 0),
      posts: Number(next.posts || 0),
      is_guest: next.is_guest !== undefined ? !!next.is_guest : !next.id,
      created_at: next.created_at || base.created_at
    };
  }

  function readProfile() {
    var storedUser = parseJSON(global.localStorage.getItem(USER_KEY) || 'null', null);
    var storedProfile = parseJSON(global.localStorage.getItem(PROFILE_KEY) || 'null', null);
    return normalizeProfile(storedUser || storedProfile || defaultProfile());
  }

  function persistProfile(profile) {
    var normalized = normalizeProfile(profile);
    global.localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    global.localStorage.setItem(PROFILE_KEY, JSON.stringify({
      id: normalized.id || ('via-' + slugify(normalized.username)),
      username: normalized.username,
      displayName: normalized.display_name,
      avatarEmoji: normalized.avatar_emoji,
      city: normalized.city,
      bio: normalized.bio,
      isGuest: normalized.is_guest
    }));
    if (global.SocialCore && typeof global.SocialCore.bootstrapProfile === 'function' && normalized.id) {
      normalized = global.SocialCore.bootstrapProfile(normalized) || normalized;
      global.localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    }
    runtime.emit('profile_updated', normalized);
    return normalized;
  }

  function getCreatorDrafts() {
    var drafts = parseJSON(global.localStorage.getItem(CREATOR_DRAFT_KEY) || '[]', []);
    return Array.isArray(drafts) ? drafts : [];
  }

  function saveCreatorDraft(draft) {
    var next = draft && typeof draft === 'object' ? draft : null;
    if (!next) return null;
    var normalized = {
      id: next.id || 'draft-' + Date.now(),
      title: next.title || next.hook || 'Creator Draft',
      hook: next.hook || next.title || 'Creator Draft',
      context: next.context || '',
      insight: next.insight || '',
      cta: next.cta || '',
      author: next.author || readProfile().display_name,
      created_at: next.created_at || new Date().toISOString()
    };
    var drafts = getCreatorDrafts();
    global.localStorage.setItem(CREATOR_DRAFT_KEY, JSON.stringify([normalized].concat(drafts).slice(0, 12)));
    runtime.emit('draft_saved', normalized);
    return normalized;
  }

  function ensureFeedSeed() {
    if (!global.SocialCore || typeof global.SocialCore.listFeed !== 'function' || typeof global.SocialCore.createPost !== 'function') {
      return;
    }
    if (global.SocialCore.listFeed(1).length > 0) return;
    var seedProfile = persistProfile({
      id: 'via-official',
      username: 'via_official',
      display_name: 'VIA Official',
      avatar_emoji: '🇮🇳',
      city: 'Bharat',
      bio: 'Official seed profile for standalone VIA surfaces.',
      is_guest: false
    });
    DEFAULT_FEED_POSTS.forEach(function (post) {
      global.SocialCore.createPost({ body: post.body, visibility: 'public' }, seedProfile);
    });
    persistProfile(readProfile());
  }

  function listFeedPosts() {
    var socialPosts = global.SocialCore && typeof global.SocialCore.listFeed === 'function'
      ? global.SocialCore.listFeed(24)
      : [];
    var creatorPosts = getCreatorDrafts().map(function (draft) {
      return {
        id: draft.id,
        body: draft.context || draft.insight || draft.hook || draft.title,
        title: draft.title || draft.hook,
        created_at: draft.created_at,
        author: {
          display_name: draft.author || 'VIA Creator',
          username: slugify(draft.author || 'via-creator')
        },
        tag: 'Creator Draft',
        location: 'Creator Studio'
      };
    });
    var merged = creatorPosts.concat(socialPosts).sort(function (a, b) {
      return String(b.created_at || '').localeCompare(String(a.created_at || ''));
    });
    return merged;
  }

  function createFeedPost(input) {
    var profile = readProfile();
    if (!profile.id) {
      profile = persistProfile({
        username: profile.username,
        display_name: profile.display_name,
        avatar_emoji: profile.avatar_emoji,
        city: profile.city,
        bio: profile.bio,
        is_guest: false
      });
    }
    if (global.SocialCore && typeof global.SocialCore.createPost === 'function') {
      return global.SocialCore.createPost(input, profile).then(function (post) {
        runtime.emit('post_created', post);
        return post;
      });
    }
    return Promise.resolve(null);
  }

  function listProfiles() {
    if (global.SocialCore && typeof global.SocialCore.listProfiles === 'function') {
      var profiles = global.SocialCore.listProfiles();
      if (profiles.length) return profiles;
    }
    return [readProfile()];
  }

  function searchProfiles(query) {
    if (global.SocialCore && typeof global.SocialCore.searchProfiles === 'function') {
      return global.SocialCore.searchProfiles(query);
    }
    var current = readProfile();
    var term = String(query || '').trim().toLowerCase();
    if (!term) return [current];
    return [current].filter(function (profile) {
      return [profile.display_name, profile.username, profile.city].join(' ').toLowerCase().indexOf(term) >= 0;
    });
  }

  function followProfile(targetProfile) {
    if (global.SocialCore && typeof global.SocialCore.followUser === 'function') {
      return global.SocialCore.followUser(targetProfile, readProfile()).then(function (value) {
        runtime.emit('profile_followed', value);
        return value;
      });
    }
    return Promise.resolve(null);
  }

  var runtime = ensureRuntime();
  var VIAProfile = {
    getProfile: readProfile,
    updateProfile: persistProfile,
    saveProfile: persistProfile,
    clearProfile: function () {
      global.localStorage.removeItem(USER_KEY);
      global.localStorage.removeItem(PROFILE_KEY);
      runtime.emit('profile_cleared', true);
      return readProfile();
    }
  };
  var VIAFeed = {
    listPosts: listFeedPosts,
    createPost: createFeedPost,
    getDiscoverItems: function () { return clone(DEFAULT_DISCOVER_ITEMS); },
    getCreatorDrafts: getCreatorDrafts,
    publishDraft: saveCreatorDraft,
    listProfiles: listProfiles,
    searchProfiles: searchProfiles,
    followProfile: followProfile
  };

  global.VIAProfile = global.VIAProfile || VIAProfile;
  global.VIAFeed = VIAFeed;
  global.VIA_RUNTIME = {
    page: global.location.pathname,
    bootstrapAt: new Date().toISOString(),
    storageKeys: {
      profile: PROFILE_KEY,
      user: USER_KEY,
      creatorDrafts: CREATOR_DRAFT_KEY
    },
    getSnapshot: function () {
      return {
        profile: readProfile(),
        posts: listFeedPosts().length,
        drafts: getCreatorDrafts().length,
        runtime: runtime.getSnapshot ? runtime.getSnapshot() : null
      };
    }
  };

  ensureFeedSeed();
  persistProfile(readProfile());

  global.addEventListener('storage', function (event) {
    if ([PROFILE_KEY, USER_KEY, CREATOR_DRAFT_KEY].indexOf(event.key) >= 0) {
      runtime.emit('storage_sync', {
        key: event.key,
        profile: readProfile(),
        drafts: getCreatorDrafts().length
      });
    }
  });
})(window);
