import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Load Firebase configuration from app.json (extra)
const firebaseExtra = Constants.expoConfig?.extra?.firebase || Constants.manifest?.extra?.firebase || {};

const firebaseConfig = {
  apiKey: firebaseExtra.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseExtra.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseExtra.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: firebaseExtra.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseExtra.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseExtra.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: firebaseExtra.measurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);

// Initialize Firebase Auth and export it
export const auth = getAuth(app);
