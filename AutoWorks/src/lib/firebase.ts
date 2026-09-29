import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import type { DeveloperProfile } from '../types';

// ---------------------------------------------------------------------------
// Firebase config — swap these with your own project values or pull from env
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? '',
};

const isConfigured = Object.values(firebaseConfig).every(v => v !== '');

// Only initialise if all keys are present to avoid SDK errors in dev
const app  = isConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db   = app ? getFirestore(app) : null;

const googleProvider = new GoogleAuthProvider();

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  if (!auth) throw new Error('Firebase not configured');
  return signOut(auth);
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function saveProfile(uid: string, profile: DeveloperProfile) {
  if (!db) throw new Error('Firebase not configured');
  await setDoc(doc(db, 'profiles', uid), profile);
}

export async function loadProfile(uid: string): Promise<DeveloperProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? (snap.data() as DeveloperProfile) : null;
}

export { auth, db, isConfigured };
