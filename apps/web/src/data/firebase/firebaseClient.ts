import { initializeApp, getApps } from 'firebase/app';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export async function signInWithGoogle(): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured');
  }

  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}

export async function signInWithFacebook(): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured');
  }

  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
