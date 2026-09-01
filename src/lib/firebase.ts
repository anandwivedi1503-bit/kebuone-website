import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Safe client Firebase Auth.
 * Missing/invalid keys must not crash the whole site (navbar, Eva, booking shells).
 */
function initAuth(): Auth | null {
  if (!firebaseConfig.apiKey) return null;
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getAuth(app);
  } catch (error) {
    console.warn("FIREBASE CLIENT INIT SKIPPED:", error);
    return null;
  }
}

export const firebaseAuth: Auth | null = initAuth();

/** Runtime may be null when Firebase is not configured — guard before OTP/login use. */
export const auth = firebaseAuth as Auth;
