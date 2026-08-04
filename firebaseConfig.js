import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Load Firebase configuration from app.json (extra)
const firebaseExtra = Constants.expoConfig?.extra?.firebase || Constants.manifest?.extra?.firebase || {};

const firebaseConfig = {
  apiKey: firebaseExtra.apiKey,
  authDomain: firebaseExtra.authDomain,
  projectId: firebaseExtra.projectId,
  storageBucket: firebaseExtra.storageBucket,
  messagingSenderId: firebaseExtra.messagingSenderId,
  appId: firebaseExtra.appId,
  measurementId: firebaseExtra.measurementId,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);

// Initialize Firebase Auth and export it
export const auth = getAuth(app);
