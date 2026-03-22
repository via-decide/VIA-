import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Compass,
  Plus,
  ShoppingBag,
  User,
  Search,
  Bell,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Music2,
  BookOpen,
  Clock,
  Users,
  Settings,
  LogOut,
  Grid,
  Bookmark,
  MapPin,
  Link as LinkIcon,
  Calendar,
  X
} from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  handleFirestoreError,
  OperationType,
  setupRecaptcha,
  signInWithPhone
} from './firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  increment,
  getDoc,
  getDocFromServer,
  deleteDoc,
  limit,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, ConfirmationResult } from 'firebase/auth';
import { UserProfile, Post, DeepDive, AppState } from './types';
import { createProfileSystem } from './core/profile-system';
import { attachAuthor, normalizePostAuthor } from './core/profile-system/AuthorAdapter';
import { INITIAL_POSTS, INITIAL_DEEP_DIVES } from './constants';

// Sub-components
import FeedPost from './components/FeedPost';
import DeepDiveCard from './components/DeepDiveCard';
import Navigation from './components/Navigation';
import ProfileView from './components/ProfileView';
import DiscoverView from './components/DiscoverView';
import GamesView from './components/GamesView';
import SovereignProtocolModal from './components/SovereignProtocolModal';
import CreatePostModal from './components/CreatePostModal';
import CommentsModal from './components/CommentsModal';
import { persistProtocolConfiguration, type PendingProtocolContext } from './services/cohortProtocolService';
import type { ProtocolSchema, SovereignProtocolSelection } from './services/onboardingProtocolService';

// ─── Sub-view types ─────────────────────────────────────────────────────────
type SubView =
  | { type: 'user-profile'; uid: string }
  | { type: 'dive-detail'; dive: DeepDive };

// ─── VIARouter ambient type (router.js, loaded before React) ─────────────────
declare global {
  interface Window {
    VIARouter?: {
      navigate:         (path: string) => void;
      registerReact:    (h: Partial<{ setTab: (t: string) => void; openProfile: (uid: string) => void; openDive: (id: string) => void }>) => void;
      deregisterReact:  (key: 'setTab' | 'openProfile' | 'openDive') => void;
      unregisterReact:  () => void;
      resolve:          (hash: string) => boolean;
      toUser:           (uid: string) => void;
      toReactDive:      (id: string) => void;
    };
  }
}

// ─── SubViewErrorBoundary ─────────────────────────────────────────────────────
// Wraps each sub-view overlay. On a React component crash:
//   1. Deregisters its broken handler from VIARouter (prevents loops)
//   2. For UserProfileSheet: calls VIARouter.navigate → hard redirect to profile.html
//   3. For DiveDetailSheet:  closes the overlay (no standalone fallback page)
//   4. Calls onCrash() to clear subView state in App

interface SubViewErrorBoundaryProps {
  children: React.ReactNode;
  handlerKey?: 'openProfile' | 'openDive';
  fallbackHash?: string;         // set for user-profile; omit for dive-detail
  onCrash: () => void;
}

class SubViewErrorBoundary extends React.Component<
  SubViewErrorBoundaryProps,
  { crashed: boolean }
> {
  constructor(props: SubViewErrorBoundaryProps) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error) {
    console.error('[SubView] Component crashed — engaging router.js fallback:', error);

    // Step 1: Remove the broken React handler so the router uses hard fallback
    if (this.props.handlerKey) {
      window.VIARouter?.deregisterReact(this.props.handlerKey);
    }

    // Step 2: For user profiles — navigate via router (goes to profile.html)
    //         For dives — no standalone page exists; just close the overlay
    if (this.props.fallbackHash) {
      window.VIARouter?.navigate(this.props.fallbackHash);
    }

    // Step 3: Clean up React state
    this.props.onCrash();
  }

  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

// ─── UserProfileSheet ────────────────────────────────────────────────────────
const UserProfileSheet: React.FC<{
  uid: string;
  currentUserUid: string;
  onClose: () => void;
}> = ({ uid, currentUserUid, onClose }) => {
  const [person, setPerson] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) setPerson(snap.data() as UserProfile);
        const fSnap = await getDocs(query(
          collection(db, 'follows'),
          where('followerId', '==', currentUserUid),
          where('followingId', '==', uid)
        ));
        setIsFollowing(!fSnap.empty);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid, currentUserUid]);

  const handleFollow = async () => {
    if (busy || !person) return;
    setBusy(true);
    const followId = `${currentUserUid}_${uid}`;
    const followRef = doc(db, 'follows', followId);
    try {
      if (isFollowing) {
        await deleteDoc(followRef);
        await updateDoc(doc(db, 'users', currentUserUid), { following: increment(-1) });
        await updateDoc(doc(db, 'users', uid), { followers: increment(-1) });
        setIsFollowing(false);
      } else {
        await setDoc(followRef, { followerId: currentUserUid, followingId: uid, createdAt: new Date().toISOString() });
        await updateDoc(doc(db, 'users', currentUserUid), { following: increment(1) });
        await updateDoc(doc(db, 'users', uid), { followers: increment(1) });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-via-dark flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center px-6 pt-14 pb-4 border-b border-white/5 shrink-0">
        <button onClick={onClose} className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center mr-4 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-syne font-bold text-lg">Profile</span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-via-accent" size={32} />
        </div>
      ) : person ? (
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="h-32 bg-gradient-to-br from-via-accent/30 to-via-gold/20" />
          <div className="px-6 -mt-10 relative z-10">
            <div className="flex items-end justify-between mb-6">
              <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center text-4xl border-4 border-via-dark shadow-2xl">
                {person.avatarEmoji || '🇮🇳'}
              </div>
              {currentUserUid !== uid && (
                <button
                  onClick={handleFollow}
                  disabled={busy}
                  className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    isFollowing ? 'bg-white/10 text-white/60' : 'bg-via-accent text-white shadow-lg shadow-via-accent/20'
                  } disabled:opacity-50`}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <h1 className="font-syne font-bold text-2xl">{person.displayName}</h1>
            <p className="text-white/40 text-sm font-mono">@{person.username}</p>
            {person.city && <p className="text-white/30 text-xs mt-1 flex items-center gap-1"><MapPin size={10} />{person.city}</p>}
            {person.bio && <p className="text-white/70 text-sm mt-3 leading-relaxed">{person.bio}</p>}
            <div className="flex gap-6 mt-6 pb-6 border-b border-white/5">
              <div className="text-center">
                <div className="font-syne font-bold text-xl">{person.followers || 0}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-syne font-bold text-xl">{person.following || 0}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Following</div>
              </div>
              <div className="text-center">
                <div className="font-syne font-bold text-xl text-via-accent">{person.level || 1}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Level</div>
              </div>
              <div className="text-center">
                <div className="font-syne font-bold text-xl text-via-gold">{person.xp || 0}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">XP</div>
              </div>
            </div>
            <div className="pt-6 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Member since</p>
              <p className="text-white/60 text-sm">{person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'VIA Member'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-3">
          <Users size={48} />
          <p className="text-sm uppercase tracking-widest font-bold">User not found</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── DiveDetailSheet ─────────────────────────────────────────────────────────
const DiveDetailSheet: React.FC<{
  dive: DeepDive;
  onClose: () => void;
}> = ({ dive, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: '100%' }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: '100%' }}
    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    className="fixed inset-0 z-50 bg-via-dark flex flex-col"
  >
    <div className="flex items-center px-6 pt-14 pb-4 border-b border-white/5 shrink-0">
      <button onClick={onClose} className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center mr-4 hover:bg-white/10 transition-colors">
        <ArrowLeft size={20} />
      </button>
      <span className="font-syne font-bold text-lg">Deep Dive</span>
    </div>
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 space-y-6">
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-via-accent">{dive.category}</span>
        <h1 className="font-syne font-bold text-3xl leading-tight">{dive.title}</h1>
        <p className="text-white/40 text-sm">{dive.subtitle}</p>
        <div className="flex items-center gap-3 text-white/30 text-xs">
          <span className="flex items-center gap-1"><Clock size={12} />{dive.readTime} min read</span>
          <span className="flex items-center gap-1"><Users size={12} />{dive.participants} exploring</span>
        </div>
      </div>
      {dive.imageUrl && (
        <div className="h-52 rounded-3xl overflow-hidden">
          <img src={dive.imageUrl} alt={dive.title} className="w-full h-full object-cover" />
        </div>
      )}
      <p className="text-white/80 text-base leading-relaxed">{dive.summary}</p>
      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-via-accent">Full Content</p>
        <p className="text-white/70 text-sm leading-relaxed">{dive.content || 'Full article coming soon. This deep dive is being curated by our editorial team.'}</p>
      </div>
    </div>
  </motion.div>
);

// ─── Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-via-dark p-6 text-center">
          <div className="glass-panel p-8 rounded-3xl max-w-md space-y-4 border-red-500/20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-syne font-bold text-2xl text-white">Something went wrong</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {this.state.errorInfo.includes('{') ? 'A secure operation failed. Please check your permissions.' : this.state.errorInfo}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-via-accent text-white font-bold uppercase tracking-widest hover:bg-via-accent/80 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'dives' | 'games' | 'discover' | 'profile'>('feed');
  const [subView, setSubView] = useState<SubView | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingInitialName, setOnboardingInitialName] = useState('');
  const [onboardingInitialUsername, setOnboardingInitialUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const pendingProtocolRef = useRef<PendingProtocolContext | null>(null);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [dives, setDives] = useState<DeepDive[]>(INITIAL_DEEP_DIVES);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const profileSystemRef = useRef(createProfileSystem());

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
    console.log(`[VIA] ${msg}`);
  };

  // Navigate to a main tab — always closes any open sub-view first
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setSubView(null);
    setActiveTab(tab);
  }, []);

  const openUserProfile = useCallback((uid: string) => {
    setSubView({ type: 'user-profile', uid });
  }, []);

  const openDive = useCallback((dive: DeepDive) => {
    setSubView({ type: 'dive-detail', dive });
  }, []);

  const closeSubView = useCallback(() => setSubView(null), []);

  // ── Register React handlers with router.js (fallback system) ─────────────
  // router.js is loaded before React (via <script src="./router.js"> in index.html).
  // Once React mounts, we give it handles into React state so it delegates here.
  // On unmount we clear the handles so the router uses hard fallbacks instead.
  useEffect(() => {
    window.VIARouter?.registerReact({
      setTab:      (tab: string) => handleTabChange(tab as typeof activeTab),
      openProfile: (uid: string) => setSubView({ type: 'user-profile', uid }),
      // openDive via id only: find the dive from state
      openDive:    (id: string) => {
        const dive = dives.find(d => d.id === id);
        if (dive) setSubView({ type: 'dive-detail', dive });
      },
    });
    return () => { window.VIARouter?.unregisterReact(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTabChange, dives]);

  useEffect(() => {
    const localProfile = profileSystemRef.current.getProfile();

    if (localProfile && !profile) {
      setProfile((current) => current ?? ({
        uid: localProfile.id,
        id: localProfile.id,
        username: localProfile.username,
        displayName: localProfile.displayName || localProfile.username,
        avatarEmoji: localProfile.avatarEmoji || '👤',
        bio: 'Local profile ready for future auth sync.',
        credits: 0,
        xp: 0,
        level: 1,
        followers: 0,
        following: 0,
        posts: 0,
        createdAt: new Date().toISOString()
      } as UserProfile));
    }
  }, [profile]);

  // Auth Listener — modeled after Game- repo's working pattern
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        setAuthError('');

        if (firebaseUser) {
          addLog(`User authenticated: ${firebaseUser.email || firebaseUser.phoneNumber}`);

          const userRef = doc(db, 'users', firebaseUser.uid);

          // Use getDocFromServer to avoid stale cache for new-user check
          let userSnap;
          try {
            userSnap = await getDocFromServer(userRef);
          } catch {
            // Fallback to cache if offline
            userSnap = await getDoc(userRef);
          }

          if (!userSnap.exists()) {
            addLog('New user — starting onboarding...');
            const identifier = firebaseUser.email || firebaseUser.phoneNumber || 'user';
            const suggestedUsername = identifier.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
            const suggestedName = firebaseUser.displayName || (firebaseUser.phoneNumber ? `User ${firebaseUser.phoneNumber.slice(-4)}` : '');
            setOnboardingInitialName(suggestedName);
            setOnboardingInitialUsername(suggestedUsername);
            // Store in React ref (not window) — safe across re-renders
            pendingProtocolRef.current = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              isNewUser: true,
            };
            setShowOnboarding(true);
          } else {
            const storedProfile = userSnap.data() as UserProfile;
            const syncedProfile = { ...storedProfile, id: storedProfile.uid };
            profileSystemRef.current.updateProfile({
              id: syncedProfile.uid,
              username: syncedProfile.username,
              displayName: syncedProfile.displayName,
              avatarEmoji: syncedProfile.avatarEmoji,
              isGuest: false,
              email: syncedProfile.email,
              phoneNumber: syncedProfile.phoneNumber
            });
            setProfile(syncedProfile);
            if (!storedProfile.protocol_init_complete) {
              addLog('Protocol initialization incomplete — locking dashboard until sovereign config is saved.');
              setOnboardingInitialName(storedProfile.displayName || firebaseUser.displayName || 'Sovereign');
              setOnboardingInitialUsername(storedProfile.username || onboardingInitialUsername);
              pendingProtocolRef.current = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phoneNumber: firebaseUser.phoneNumber,
                isNewUser: false,
                existingProfile: syncedProfile,
              };
              setShowOnboarding(true);
            } else {
              pendingProtocolRef.current = null;
              setShowOnboarding(false);
            }
          }

          // Real-time profile updates (like Game- uses onSnapshot)
          if (profileUnsub) profileUnsub();
          profileUnsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              const liveProfile = snap.data() as UserProfile;
              const syncedProfile = { ...liveProfile, id: liveProfile.uid };
              profileSystemRef.current.updateProfile({
                id: syncedProfile.uid,
                username: syncedProfile.username,
                displayName: syncedProfile.displayName,
                avatarEmoji: syncedProfile.avatarEmoji,
                isGuest: false,
                email: syncedProfile.email,
                phoneNumber: syncedProfile.phoneNumber
              });
              setProfile(syncedProfile);
            }
          }, (err) => {
            console.error('Profile snapshot error:', err);
          });
        } else {
          // No user — clear all auth state
          setShowOnboarding(false);
          pendingProtocolRef.current = null;
          const localProfile = profileSystemRef.current.getProfile();
          setProfile(localProfile ? ({
            uid: localProfile.id,
            id: localProfile.id,
            username: localProfile.username,
            displayName: localProfile.displayName || localProfile.username,
            avatarEmoji: localProfile.avatarEmoji || '👤',
            bio: 'Local profile ready for future auth sync.',
            credits: 0,
            xp: 0,
            level: 1,
            followers: 0,
            following: 0,
            posts: 0,
            createdAt: new Date().toISOString()
          } as UserProfile) : null);
          if (profileUnsub) {
            profileUnsub();
            profileUnsub = null;
          }
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setAuthError(err?.message || 'Authentication failed. Please try again.');
        addLog(`Auth error: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      // Error callback — Game- pattern: always set isAuthReady even on error
      console.error('Auth listener error:', error);
      setAuthError(error.message || 'Authentication service error');
      addLog(`Auth error: ${error.message}`);
      setLoading(false);
    });

    // Timeout for loading state (Game- uses 10s, we use 8s)
    const timeout = setTimeout(() => {
      if (loading) {
        addLog('Auth initialization taking longer than expected...');
      }
      setLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
      clearTimeout(timeout);
    };
  }, []);

  // Fetch Posts & Dives
  useEffect(() => {
    if (!user) return;

    // Fetch Posts with a query to ensure we get the latest ones
    const postsQuery = query(
      collection(db, 'posts'), 
      limit(50)
    );

    const postsUnsub = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => normalizePostAuthor({ 
        id: doc.id, 
        ...doc.data() 
      } as Post));
      
      // Sort by date descending client-side to avoid needing a composite index immediately
      const sortedPosts = fetchedPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (sortedPosts.length > 0) {
        setPosts(sortedPosts);
      }
    }, (err) => {
      console.error('Posts snapshot error:', err);
      handleFirestoreError(err, OperationType.LIST, 'posts');
    });

    const divesUnsub = onSnapshot(collection(db, 'deep_dives'), (snapshot) => {
      const fetchedDives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeepDive));
      if (fetchedDives.length > 0) setDives(fetchedDives);
    }, (err) => {
      console.error('Dives snapshot error:', err);
      handleFirestoreError(err, OperationType.LIST, 'deep_dives');
    });

    return () => {
      postsUnsub();
      divesUnsub();
    };
  }, [user]);

  const handleSendCode = async () => {
    // Clean phone number: remove spaces, dashes, etc.
    const cleanedPhone = phoneNumber.replace(/\s|-|\(|\)/g, '');

    if (!cleanedPhone) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    // Validate E.164 format with reasonable length (7-15 digits after country code)
    if (!/^\+[1-9]\d{6,14}$/.test(cleanedPhone)) {
      setPhoneError('Please use international format (e.g., +919876543210)');
      return;
    }

    setPhoneError('');
    setIsSendingCode(true);
    try {
      // Setup recaptcha right before use (not on mount) — ensures DOM is ready
      setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(cleanedPhone);
      setConfirmationResult(result);
      addLog('Verification code sent');
    } catch (error: any) {
      console.error('Phone Auth Error:', error);
      const code = error?.code || '';
      if (code === 'auth/too-many-requests') {
        setPhoneError('Too many attempts. Please try again later.');
      } else if (code === 'auth/invalid-phone-number') {
        setPhoneError('Invalid phone number. Please check and try again.');
      } else {
        setPhoneError(error.message || 'Failed to send code');
      }
      // Reset recaptcha for retry
      setupRecaptcha('recaptcha-container');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !confirmationResult) return;
    setIsVerifyingCode(true);
    setPhoneError('');
    try {
      await confirmationResult.confirm(verificationCode);
      addLog('Phone verification successful');
    } catch (error: any) {
      console.error('Phone verify error:', error);
      const code = error?.code || '';
      if (code === 'auth/code-expired') {
        setPhoneError('Code expired. Please request a new one.');
        setConfirmationResult(null);
        setVerificationCode('');
      } else if (code === 'auth/invalid-verification-code') {
        setPhoneError('Invalid code. Please check and try again.');
      } else {
        setPhoneError(error.message || 'Verification failed');
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Clear phone auth state when switching back to main auth options
  const handleBackToAuthOptions = () => {
    setShowPhoneInput(false);
    setConfirmationResult(null);
    setVerificationCode('');
    setPhoneNumber('');
    setPhoneError('');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activePostIndex) {
      setActivePostIndex(index);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, updatedProfile);
      const nextLocalProfile = profileSystemRef.current.updateProfile({
        id: user.uid,
        username: updatedProfile.username || profile?.username || 'guest',
        displayName: updatedProfile.displayName || profile?.displayName || updatedProfile.username || 'guest',
        avatarEmoji: updatedProfile.avatarEmoji || profile?.avatarEmoji || '👤',
        isGuest: false
      });
      setProfile((current) => current ? { ...current, ...updatedProfile, id: nextLocalProfile.id } : current);
      addLog('Profile updated successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!profile) return;
    try {
      const activeProfile = window.VIAProfile?.getProfile() || {
        id: profile.uid,
        username: profile.username,
        displayName: profile.displayName,
        avatarEmoji: profile.avatarEmoji || '🇮🇳',
        isGuest: false
      };

      const newPost = attachAuthor({
        content,
        imageUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString()
      }, activeProfile);

      await addDoc(collection(db, 'posts'), newPost);
      addLog('Post created successfully');
      
      // Increment user's post count
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        posts: increment(1),
        xp: increment(50) // Reward for posting
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    }
  };

  const handleLikePost = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        likes: increment(1)
      });
      if (profile) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          xp: increment(5) // Small reward for engagement
        });
      }
      addLog('Post liked');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'posts');
    }
  };

  const handleCommentPost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForComments(post);
      setIsCommentsModalOpen(true);
      if (profile) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          xp: increment(10) // Reward for commenting
        });
      }
    }
  };

  const handleSharePost = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        shares: increment(1)
      });
      addLog('Post shared');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'posts');
    }
  };

  const handleOnboardingComplete = async ({ schema, selection }: { schema: ProtocolSchema; selection: SovereignProtocolSelection }) => {
    const pending = pendingProtocolRef.current;
    if (!pending) {
      addLog('Error: No pending user found for protocol initialization.');
      setShowOnboarding(false);
      return;
    }

    try {
      const resolvedDisplayName = onboardingInitialName || user?.displayName || pending.existingProfile?.displayName || 'Sovereign Operator';
      const newProfile = await persistProtocolConfiguration({
        context: pending,
        googleIdentity: {
          displayName: resolvedDisplayName,
          email: pending.email,
          photoURL: user?.photoURL,
        },
        schema,
        selection,
        initialProfile: {
          username: pending.existingProfile?.username || onboardingInitialUsername || `sovereign_${pending.uid.slice(0, 6)}`,
          displayName: resolvedDisplayName,
          city: pending.existingProfile?.city || 'Sovereign Grid',
          avatarEmoji: pending.existingProfile?.avatarEmoji || '🜂',
          bio: pending.existingProfile?.bio || 'Sovereign operator configured through VIA protocol initialization.',
        },
      });
      const syncedProfile = { ...newProfile, id: newProfile.uid };
      profileSystemRef.current.updateProfile({
        id: syncedProfile.uid,
        username: syncedProfile.username,
        displayName: syncedProfile.displayName,
        avatarEmoji: syncedProfile.avatarEmoji,
        isGuest: false,
        email: syncedProfile.email,
        phoneNumber: syncedProfile.phoneNumber,
      });
      setProfile(syncedProfile);
      setShowOnboarding(false);
      pendingProtocolRef.current = null;
      addLog(`Protocol initialization complete — ${selection.defaultStartMode} staged for ${selection.orchestrationProfile}.`);
    } catch (err: any) {
      console.error('Protocol save error:', err);
      addLog(`Failed to save sovereign protocol: ${err?.message || 'Unknown error'}. Please try again.`);
      throw err; // Re-throw so the sovereign protocol modal can surface the failure state
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-via-dark">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-via-accent" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-via-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-via-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-via-gold/10 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 relative z-10 max-w-md"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-via-accent rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-via-accent/40"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="font-syne font-extrabold text-5xl tracking-tighter text-white">VIA</h1>
            <p className="font-syne font-bold text-xl text-via-gold uppercase tracking-[0.2em]">Bharat's Social Platform</p>
          </div>

          <p className="text-white/60 text-sm leading-relaxed font-medium">
            Discover, create, and deep dive into the stories that matter. 
            Join the next generation of Bharat's digital landscape.
          </p>

          {/* Auth error banner */}
          {authError && (
            <div className="w-full glass-panel rounded-2xl p-4 border-red-500/30 text-left space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Auth Error</span>
              </div>
              <p className="text-red-400/80 text-xs">{authError}</p>
            </div>
          )}

          <div className="space-y-4">
            {!showPhoneInput ? (
              <>
                <button
                  onClick={async () => {
                    try {
                      setAuthError('');
                      await signInWithGoogle();
                    } catch (err: any) {
                      if (err?.code !== 'auth/popup-closed-by-user') {
                        setAuthError(err?.message || 'Google sign-in failed. Please try again.');
                      }
                    }
                  }}
                  className="w-full py-4 rounded-2xl bg-white text-via-dark font-bold text-lg flex items-center justify-center gap-3 hover:bg-via-accent hover:text-white transition-all shadow-xl"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
                <button
                  onClick={() => {
                    setShowPhoneInput(true);
                    setAuthError('');
                  }}
                  className="w-full py-4 rounded-2xl glass-panel text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <User className="w-5 h-5" />
                  Continue with Phone
                </button>
              </>
            ) : (
              <div className="space-y-4 text-left">
                {!confirmationResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (phoneError) setPhoneError('');
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors"
                      />
                    </div>
                    {phoneError && <p className="text-red-400 text-xs ml-2">{phoneError}</p>}
                    <button
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                      className="w-full py-4 rounded-2xl bg-via-accent text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-via-accent/80 transition-all disabled:opacity-50"
                    >
                      {isSendingCode ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Verification Code'}
                    </button>
                    <button
                      onClick={handleBackToAuthOptions}
                      className="w-full py-2 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Back to options
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Verification Code</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors text-center tracking-[0.5em] text-2xl font-bold"
                        maxLength={6}
                      />
                    </div>
                    {phoneError && <p className="text-red-400 text-xs ml-2">{phoneError}</p>}
                    <button
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode}
                      className="w-full py-4 rounded-2xl bg-via-gold text-via-dark font-bold text-lg flex items-center justify-center gap-3 hover:bg-via-gold/80 transition-all disabled:opacity-50"
                    >
                      {isVerifyingCode ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Continue'}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmationResult(null);
                        setVerificationCode('');
                        setPhoneError('');
                      }}
                      className="w-full py-2 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Resend code
                    </button>
                    <button
                      onClick={handleBackToAuthOptions}
                      className="w-full py-2 text-white/20 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
                    >
                      Back to options
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div id="recaptcha-container"></div>

          <div className="pt-8 flex justify-center gap-8 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-via-dark text-white font-sans selection:bg-via-accent selection:text-white">

        {/* Sovereign protocol overlay for users who have not completed initialization */}
        <AnimatePresence>
          {showOnboarding && (
            <SovereignProtocolModal
              googleUserName={onboardingInitialName || user?.displayName || profile?.displayName || 'OPERATOR'}
              onComplete={handleOnboardingComplete}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="relative h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div 
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                onScroll={handleScroll}
              >
                {posts.map((post, index) => (
                  <div key={post.id} className="h-screen snap-start">
                    <FeedPost 
                      post={post} 
                      isActive={index === activePostIndex} 
                      onLike={handleLikePost}
                      onComment={handleCommentPost}
                      onShare={handleSharePost}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'dives' && (
              <motion.div 
                key="dives"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto px-6 pt-24 pb-32 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="font-syne font-bold text-4xl tracking-tight">Deep Dives</h2>
                  <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Curated knowledge for you</p>
                </div>

                <div className="grid gap-6">
                  {dives.map((dive) => (
                    <DeepDiveCard
                      key={dive.id}
                      dive={dive}
                      onClick={() => openDive(dive)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto"
              >
                <GamesView />
              </motion.div>
            )}

            {activeTab === 'discover' && profile && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto"
              >
                <DiscoverView currentUser={profile} onViewUser={openUserProfile} />
              </motion.div>
            )}

            {activeTab === 'profile' && profile && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto"
              >
                <ProfileView 
              user={profile} 
              onLogout={logout} 
              onUpdateProfile={handleUpdateProfile}
            />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sub-view overlays — PRIMARY: React state / FALLBACK: router.js */}
        <AnimatePresence>
          {subView?.type === 'user-profile' && profile && (
            <SubViewErrorBoundary
              key={'boundary-' + subView.uid}
              handlerKey="openProfile"
              fallbackHash={'#/user/' + subView.uid}
              onCrash={closeSubView}
            >
              <UserProfileSheet
                key={subView.uid}
                uid={subView.uid}
                currentUserUid={profile.uid}
                onClose={closeSubView}
              />
            </SubViewErrorBoundary>
          )}
          {subView?.type === 'dive-detail' && (
            <SubViewErrorBoundary
              key={'boundary-' + subView.dive.id}
              handlerKey="openDive"
              onCrash={closeSubView}
            >
              <DiveDetailSheet
                key={subView.dive.id}
                dive={subView.dive}
                onClose={closeSubView}
              />
            </SubViewErrorBoundary>
          )}
        </AnimatePresence>

        {/* Global Navigation — always on top, even over sub-views */}
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreatePost={() => setIsCreatePostModalOpen(true)}
        />

        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          user={profile!}
          onSave={handleCreatePost}
        />

        {profile && selectedPostForComments && (
          <CommentsModal
            isOpen={isCommentsModalOpen}
            onClose={() => {
              setIsCommentsModalOpen(false);
              setSelectedPostForComments(null);
            }}
            post={selectedPostForComments}
            currentUser={profile}
          />
        )}

        {/* Top Bar (Conditional) */}
        {activeTab !== 'feed' && (
          <div className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
              <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-via-accent">
                <TrendingUp size={20} />
              </div>
              <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="text-via-gold">✨</span>
                <span className="text-xs font-bold tracking-widest">{profile?.credits || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                onClick={() => handleTabChange('discover')}
                className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors relative"
              >
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-via-accent rounded-full border-2 border-via-dark" />
              </button>
            </div>
          </div>
        )}

        {/* Logs Overlay (Dev Only) */}
        {process.env.NODE_ENV !== 'production' && logs.length > 0 && (
          <div className="fixed top-20 left-6 z-50 pointer-events-none space-y-2">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel px-3 py-1 rounded-lg text-[10px] font-mono text-white/40"
              >
                {log}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
