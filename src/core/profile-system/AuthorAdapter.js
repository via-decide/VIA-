export function attachAuthor(post, profile) {
  return {
    ...post,
    userId: profile.id,
    authorName: profile.displayName || profile.username,
    authorAvatar: profile.avatarEmoji || post.authorAvatar || '👤',
    author: {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName || profile.username,
      avatarEmoji: profile.avatarEmoji || post.authorAvatar || '👤',
      isGuest: profile.isGuest
    }
  };
}

export function normalizePostAuthor(post) {
  if (post.author?.id && post.author?.username) {
    return {
      ...post,
      authorName: post.authorName || post.author.displayName || post.author.username,
      authorAvatar: post.authorAvatar || post.author.avatarEmoji || '👤'
    };
  }

  const fallbackName = post.authorName || 'Unknown Author';
  const fallbackUsername = fallbackName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'guest';

  return {
    ...post,
    authorName: fallbackName,
    authorAvatar: post.authorAvatar || '👤',
    author: {
      id: post.userId || `guest_${post.id}`,
      username: fallbackUsername,
      displayName: fallbackName,
      avatarEmoji: post.authorAvatar || '👤',
      isGuest: String(post.userId || '').startsWith('guest')
    }
  };
}
