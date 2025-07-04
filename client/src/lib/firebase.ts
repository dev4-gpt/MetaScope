import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signOut, User } from "firebase/auth";

// Check if Firebase credentials are available
const hasFirebaseConfig = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_APP_ID;

// Create a mock auth object for when Firebase is not configured
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  },
  signOut: () => Promise.resolve(),
};

let app: any = null;
let auth: any = mockAuth;
let provider: GoogleAuthProvider | null = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
    auth = mockAuth; // fallback to mock
  }
}

export { auth };

export function signInWithGoogle() {
  if (!auth || !provider) {
    throw new Error("Firebase not configured");
  }
  return signInWithRedirect(auth, provider);
}

export function handleRedirectResult() {
  if (!auth) {
    return Promise.resolve(null);
  }
  return getRedirectResult(auth);
}

export function signOutUser() {
  if (!auth) {
    return Promise.resolve();
  }
  return signOut(auth);
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
