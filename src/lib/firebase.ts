import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCPY5H7iqG8F68XO9EoE5g1mGiVp7IfO90',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'utsavcycle-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'utsavcycle-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'utsavcycle-ai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '933714199865',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:933714199865:web:0296a95d681087390414e8',
};

let app: any;
let auth: any;
let db: any;
let googleProvider: any;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn('Firebase initialization warning:', err);
}

export { app, auth, db, googleProvider };
export default app;
