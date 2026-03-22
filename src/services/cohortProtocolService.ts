import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile } from '../types';
import type { ProtocolSchema, SovereignProtocolSelection } from './onboardingProtocolService';

export type GoogleIdentity = {
  displayName: string;
  email: string | null;
  photoURL?: string | null;
};

export type PendingProtocolContext = {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  isNewUser: boolean;
  existingProfile?: UserProfile | null;
};

export type PersistProtocolOptions = {
  context: PendingProtocolContext;
  googleIdentity: GoogleIdentity;
  schema: ProtocolSchema;
  selection: SovereignProtocolSelection;
  initialProfile: Pick<UserProfile, 'username' | 'displayName' | 'city' | 'avatarEmoji' | 'bio'>;
};

export async function persistProtocolConfiguration({
  context,
  googleIdentity,
  schema,
  selection,
  initialProfile,
}: PersistProtocolOptions): Promise<UserProfile> {
  const cohortRef = doc(db, 'cohort_protocols', context.uid);
  const userRef = doc(db, 'users', context.uid);
  const nowIso = new Date().toISOString();

  const protocolPayload = {
    google_uid: context.uid,
    google_identity: {
      display_name: googleIdentity.displayName,
      email: googleIdentity.email,
      photo_url: googleIdentity.photoURL || null,
    },
    protocol_init_complete: true,
    orchestration_profile: selection.orchestrationProfile,
    default_start_mode: selection.defaultStartMode,
    operational_preferences: selection.operationalPreferences,
    schema_version: schema.version,
    source_files: schema.sourceFiles,
    updated_at: nowIso,
    created_at: context.isNewUser ? nowIso : (context.existingProfile?.createdAt || nowIso),
  };

  const baseProfile: UserProfile = {
    uid: context.uid,
    username: context.existingProfile?.username || initialProfile.username,
    displayName: context.existingProfile?.displayName || initialProfile.displayName,
    city: context.existingProfile?.city || initialProfile.city,
    avatarEmoji: context.existingProfile?.avatarEmoji || initialProfile.avatarEmoji,
    bio: context.existingProfile?.bio || initialProfile.bio,
    credits: context.existingProfile?.credits ?? 1000,
    xp: context.existingProfile?.xp ?? 0,
    level: context.existingProfile?.level ?? 1,
    followers: context.existingProfile?.followers ?? 0,
    following: context.existingProfile?.following ?? 0,
    posts: context.existingProfile?.posts ?? 0,
    createdAt: context.existingProfile?.createdAt || nowIso,
    ...(context.email ? { email: context.email } : {}),
    ...(context.phoneNumber ? { phoneNumber: context.phoneNumber } : {}),
    protocol_init_complete: true,
    orchestration_profile: selection.orchestrationProfile,
    default_start_mode: selection.defaultStartMode,
    operational_preferences: selection.operationalPreferences,
    cohort_schema_version: schema.version,
    cohort_protocol_updated_at: nowIso,
  };

  await Promise.all([
    setDoc(cohortRef, {
      ...protocolPayload,
      persisted_at: serverTimestamp(),
    }, { merge: true }),
    setDoc(userRef, {
      ...baseProfile,
      updatedAt: serverTimestamp(),
    }, { merge: true }),
  ]);

  return baseProfile;
}
