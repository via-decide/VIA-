(function (global) {
  'use strict';

  const SOCIAL_KEY = 'viadecide.social.core';

  function defaultState() {
    return {
      users: {},
      posts: [],
      follows: [],
      reactions: [],
      circles: [],
      memberships: [],
      moderation_flags: []
    };
  }

  function readState() {
    try {
      const raw = localStorage.getItem(SOCIAL_KEY);
      const parsed = raw ? JSON.parse(raw) : defaultState();
      return parsed && typeof parsed === 'object' ? { ...defaultState(), ...parsed } : defaultState();
    } catch (_error) {
      return defaultState();
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(SOCIAL_KEY, JSON.stringify({ ...defaultState(), ...(state || {}) }));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function getClient() {
    if (global.DatabaseService && typeof global.DatabaseService.getClient === 'function') {
      return global.DatabaseService.getClient();
    }
    return null;
  }

  function getCurrentUser() {
    if (global.DatabaseService && typeof global.DatabaseService.getLocalUserProfile === 'function') {
      return global.DatabaseService.getLocalUserProfile();
    }
    try {
      const raw = localStorage.getItem('via_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function saveLocalUser(profile) {
    if (!profile) return null;
    if (global.DatabaseService && typeof global.DatabaseService.saveLocalUser === 'function') {
      return global.DatabaseService.saveLocalUser(profile);
    }
    try {
      localStorage.setItem('via_user', JSON.stringify(profile));
    } catch (_error) {
      return null;
    }
    return profile;
  }

  function normalizeProfile(profile) {
    if (!profile || typeof profile !== 'object') return null;
    return {
      ...profile,
      display_name: profile.display_name || profile.name || 'VIA User',
      username: profile.username || 'user',
      city: profile.city || '',
      avatar_emoji: profile.avatar_emoji || '🌟',
      xp: Number(profile.xp || 0),
      level: Number(profile.level || 1),
      followers: Number(profile.followers || 0),
      following: Number(profile.following || 0),
      posts: Number(profile.posts || 0)
    };
  }

  function getProfileCounts(userId, state = readState()) {
    return {
      followers: state.follows.filter((item) => item.target_user_id === userId).length,
      following: state.follows.filter((item) => item.actor_user_id === userId).length,
      posts: state.posts.filter((item) => item.author_id === userId).length
    };
  }

  function syncProfileCounts(profile) {
    const normalized = normalizeProfile(profile);
    if (!normalized || !normalized.id) return normalized;
    const state = readState();
    const counts = getProfileCounts(normalized.id, state);
    const merged = { ...normalized, ...counts };
    state.users[merged.id] = {
      id: merged.id,
      username: merged.username,
      display_name: merged.display_name,
      city: merged.city,
      avatar_emoji: merged.avatar_emoji
    };
    writeState(state);
    saveLocalUser(merged);
    return merged;
  }

  function bootstrapProfile(profile) {
    const normalized = normalizeProfile(profile);
    if (!normalized || !normalized.id) return normalized;
    const state = readState();
    state.users[normalized.id] = {
      id: normalized.id,
      username: normalized.username,
      display_name: normalized.display_name,
      city: normalized.city,
      avatar_emoji: normalized.avatar_emoji
    };
    writeState(state);
    return syncProfileCounts(normalized);
  }

  function listFeed(limit = 20) {
    const state = readState();
    return state.posts
      .slice()
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .slice(0, limit)
      .map((post) => ({
        ...post,
        reaction_count: state.reactions.filter((item) => item.post_id === post.id).length,
        author: state.users[post.author_id] || null
      }));
  }

  async function createPost(input, actor = getCurrentUser()) {
    const author = normalizeProfile(actor);
    if (!author || !author.id) return null;

    const body = String(input && input.body ? input.body : '').trim();
    if (!body) return null;

    const state = readState();
    const post = {
      id: `post-${Date.now()}`,
      author_id: author.id,
      body,
      created_at: new Date().toISOString(),
      visibility: String(input && input.visibility ? input.visibility : 'public')
    };
    state.posts.push(post);
    writeState(state);

    const merged = syncProfileCounts(author);
    const client = getClient();
    if (client) {
      try {
        await client.from('via_posts').insert({
          id: post.id,
          author_id: post.author_id,
          body: post.body,
          visibility: post.visibility,
          created_at: post.created_at
        });
      } catch (_error) {
        // local-first fallback
      }
    }

    return { ...post, author: merged };
  }

  async function followUser(targetProfile, actor = getCurrentUser()) {
    const source = normalizeProfile(actor);
    const target = normalizeProfile(targetProfile);
    if (!source || !target || !source.id || !target.id || source.id === target.id) return null;

    const state = readState();
    const existing = state.follows.find((item) => item.actor_user_id === source.id && item.target_user_id === target.id);
    if (existing) return existing;

    const relation = {
      id: `follow-${Date.now()}`,
      actor_user_id: source.id,
      target_user_id: target.id,
      created_at: new Date().toISOString()
    };
    state.follows.push(relation);
    writeState(state);

    syncProfileCounts(source);
    syncProfileCounts(target);

    const client = getClient();
    if (client) {
      try {
        await client.from('via_follows').insert(relation);
      } catch (_error) {
        // local-first fallback
      }
    }

    return relation;
  }

  async function reactToPost(postId, emoji, actor = getCurrentUser()) {
    const user = normalizeProfile(actor);
    const reaction = String(emoji || '').trim();
    if (!user || !user.id || !postId || !reaction) return null;

    const state = readState();
    const existing = state.reactions.find((item) => item.post_id === postId && item.actor_user_id === user.id && item.emoji === reaction);
    if (existing) return existing;

    const entry = {
      id: `reaction-${Date.now()}`,
      post_id: postId,
      actor_user_id: user.id,
      emoji: reaction,
      created_at: new Date().toISOString()
    };
    state.reactions.push(entry);
    writeState(state);

    const client = getClient();
    if (client) {
      try {
        await client.from('via_reactions').insert(entry);
      } catch (_error) {
        // local-first fallback
      }
    }

    return entry;
  }

  function listCircles() {
    const state = readState();
    return state.circles.slice().sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  }

  async function createCircle(input, actor = getCurrentUser()) {
    const owner = normalizeProfile(actor);
    const name = String(input && input.name ? input.name : '').trim();
    if (!owner || !owner.id || !name) return null;

    const state = readState();
    const circle = {
      id: `circle-${Date.now()}`,
      owner_id: owner.id,
      name,
      description: String(input && input.description ? input.description : '').trim(),
      created_at: new Date().toISOString()
    };
    state.circles.push(circle);
    state.memberships.push({
      id: `membership-${Date.now()}`,
      circle_id: circle.id,
      user_id: owner.id,
      role: 'owner',
      created_at: circle.created_at
    });
    writeState(state);

    const client = getClient();
    if (client) {
      try {
        await client.from('via_circles').insert(circle);
        await client.from('via_circle_members').insert({
          circle_id: circle.id,
          user_id: owner.id,
          role: 'owner',
          created_at: circle.created_at
        });
      } catch (_error) {
        // local-first fallback
      }
    }

    return circle;
  }

  async function flagContent(input, actor = getCurrentUser()) {
    const user = normalizeProfile(actor);
    if (!user || !user.id) return null;

    const flag = {
      id: `flag-${Date.now()}`,
      reporter_user_id: user.id,
      entity_type: String(input && input.entityType ? input.entityType : 'post'),
      entity_id: String(input && input.entityId ? input.entityId : '').trim(),
      reason: String(input && input.reason ? input.reason : '').trim(),
      status: 'open',
      created_at: new Date().toISOString()
    };
    if (!flag.entity_id || !flag.reason) return null;

    const state = readState();
    state.moderation_flags.push(flag);
    writeState(state);

    const client = getClient();
    if (client) {
      try {
        await client.from('via_moderation_queue').insert(flag);
      } catch (_error) {
        // local-first fallback
      }
    }

    return flag;
  }

  global.SocialCore = {
    readState,
    writeState,
    normalizeProfile,
    bootstrapProfile,
    syncProfileCounts,
    getProfileCounts,
    listFeed,
    createPost,
    followUser,
    reactToPost,
    listCircles,
    createCircle,
    flagContent
  };
})(window);
