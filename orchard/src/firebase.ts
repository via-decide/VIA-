import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs, addDoc, serverTimestamp, getDocFromServer, FirestoreError } from 'firebase/firestore';
import _staticConfig from '../firebase-applet-config.json';

// Support runtime config injection via Cloudflare Pages env var
// Set VITE_FIREBASE_CONFIG as a JSON string in Cloudflare Pages environment
function resolveFirebaseConfig() {
  try {
    const envConfig = import.meta.env.VITE_FIREBASE_CONFIG;
    if (envConfig && typeof envConfig === 'string') {
      const parsed = JSON.parse(envConfig);
      if (parsed.projectId && parsed.projectId !== 'REPLACE_ME') return parsed;
    }
  } catch (_err) {
    // fall through to static config
  }
  return _staticConfig;
}
const firebaseConfig = resolveFirebaseConfig();

// Initialize Firebase
console.log('Firebase: Initializing with config...', firebaseConfig.projectId);
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase: App initialized successfully.');
} catch (error) {
  console.error('Firebase: Initialization error', error);
  throw error;
}
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
console.log('Firebase: Auth and Firestore initialized.');
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = async () => {
  console.log('signInWithGoogle: Starting popup...');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('signInWithGoogle: Popup success', result.user.uid);
    return result;
  } catch (error) {
    console.error('signInWithGoogle: Popup error', error);
    throw error;
  }
};
export const logout = () => signOut(auth);

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
