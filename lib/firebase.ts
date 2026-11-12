import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) {
    if (typeof window !== 'undefined') {
      try {
        db = initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        db = getFirestore(firebaseApp);
      }
    } else {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
}

export async function signInWithGoogle(): Promise<User | null> {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(authInstance, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return;
  await signOut(authInstance);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
}
