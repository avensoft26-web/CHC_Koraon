import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9b2wqPZboF4FE9sNv47-IQ11iptagutw",
  authDomain: "hos-management-ce6e8.firebaseapp.com",
  projectId: "hos-management-ce6e8",
  storageBucket: "hos-management-ce6e8.appspot.com",
  messagingSenderId: "199385175936",
  appId: "1:199385175936:web:835230eccc3d6a93591365",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Force Google to show the account chooser so the user sees their real signed-in Google accounts
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface RealGoogleUser {
  idToken: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Triggers the official Google OAuth popup window (accounts.google.com).
 * Google's native account chooser displays whatever real Google accounts 
 * are currently logged into the user's browser.
 */
export async function triggerRealGoogleSignIn(): Promise<RealGoogleUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    idToken,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'Hospital Staff',
    avatar: user.photoURL || undefined,
  };
}
