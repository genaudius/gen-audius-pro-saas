import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase - Usar variables de entorno en producción
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Graceful degrade: if Firebase env vars are missing (local/preview),
// export safe stubs so the app keeps booting. Social login will be disabled.
const FIREBASE_ENABLED = !!firebaseConfig.apiKey;

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let appleProvider = null;

if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    appleProvider = new OAuthProvider('apple.com');
  } catch (e) {
    console.warn('[Firebase] Init failed, social login disabled:', e?.message);
  }
} else {
  console.info('[Firebase] No VITE_FIREBASE_API_KEY — social login disabled in this env.');
}

export { auth, db, googleProvider, appleProvider, FIREBASE_ENABLED };
export default app;
