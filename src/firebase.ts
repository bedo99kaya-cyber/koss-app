import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDKxaYcjvJUz5lj3lBpCFwjt4kjT-QZndU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "proje-1-781da.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "proje-1-781da",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "proje-1-781da.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "326523444892",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:326523444892:web:1cf17f42a1619637e51759",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SCN0WYNRC4"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    ignoreUndefinedProperties: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);
