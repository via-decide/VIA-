/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserProfile = {
  uid: string;
  id?: string;
  username: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  avatarEmoji?: string;
  bio?: string;
  credits: number;
  xp: number;
  level: number;
  followers: number;
  following: number;
  posts: number;
  createdAt: any;
  protocol_init_complete?: boolean;
  orchestration_profile?: string;
  default_start_mode?: string;
  operational_preferences?: Record<string, string>;
  cohort_schema_version?: string;
  cohort_protocol_updated_at?: string;
};

export type PostAuthor = {
  id: string;
  username: string;
  displayName?: string;
  avatarEmoji?: string;
  isGuest?: boolean;
};

export type Post = {
  id: string;
  userId: string;
  author: PostAuthor;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: any;
};

export type DeepDive = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  readTime: number;
  participants: number;
  createdAt: any;
};

export type Game = {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  tags: string[];
  isFlagship: boolean;
  playerCount?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  moduleTarget?: 'mars';
  requiresSession?: boolean;
};

export type AppState = {
  activeTab: 'feed' | 'dives' | 'games' | 'market' | 'profile';
  user: UserProfile | null;
  isAuthReady: boolean;
  posts: Post[];
  deepDives: DeepDive[];
  currentPostIndex: number;
};
