import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber, type User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

type FirebaseConfigModule = {
  default?: Partial<FirebaseConfig>;
} & Partial<FirebaseConfig>;

function getFirebaseConfigFromEnv(): FirebaseConfig {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
  };
}

function normalizeFirebaseConfig(config: Partial<FirebaseConfig>): FirebaseConfig {
  const normalizedConfig: FirebaseConfig = {
    apiKey: config.apiKey ?? '',
    authDomain: config.authDomain ?? '',
    projectId: config.projectId ?? '',
    storageBucket: config.storageBucket ?? '',
    messagingSenderId: config.messagingSenderId ?? '',
    appId: config.appId ?? '',
    measurementId: config.measurementId,
    firestoreDatabaseId: config.firestoreDatabaseId || '(default)'
  };

  const missingKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ].filter((key) => !normalizedConfig[key as keyof FirebaseConfig]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase configuration values: ${missingKeys.join(', ')}`);
  }

  return normalizedConfig;
}

async function loadFirebaseConfig(): Promise<FirebaseConfig> {
  try {
    const importedConfig = await import('../firebase-applet-config.json') as FirebaseConfigModule;
    return normalizeFirebaseConfig(importedConfig.default ?? importedConfig);
  } catch (error) {
    console.warn('Firebase: Falling back to VITE_FIREBASE_* environment variables.', error);
    return normalizeFirebaseConfig(getFirebaseConfigFromEnv());
  }
}

const firebaseConfig = await loadFirebaseConfig();

console.log('Firebase: Initializing with project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
console.log('Firebase: App initialized successfully.');

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

export const setupRecaptcha = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  if ((window as typeof window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier) {
    try {
      (window as typeof window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier?.clear();
    } catch (error) {
      console.warn('Error clearing recaptcha verifier', error);
    }
    delete (window as typeof window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier;
  }

  (window as typeof window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response: string) => {
      console.log('Recaptcha resolved', response);
    }
  });
};

export const signInWithPhone = async (phoneNumber: string) => {
  const appVerifier = (window as typeof window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier;
  if (!appVerifier) {
    throw new Error('Recaptcha verifier is not initialized.');
  }

  try {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error) {
    console.error('signInWithPhone error', error);
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
  };
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
      providerInfo: auth.currentUser?.providerData.map((provider: User['providerData'][number]) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. The client is offline.');
    }
  }
}

testConnection();
