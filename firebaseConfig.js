import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Firebase client config lives in app.json → expo.extra.firebase
const firebaseExtra = Constants.expoConfig?.extra?.firebase || {};

const firebaseConfig = {
  apiKey: firebaseExtra.apiKey,
  authDomain: firebaseExtra.authDomain,
  projectId: firebaseExtra.projectId,
  storageBucket: firebaseExtra.storageBucket,
  messagingSenderId: firebaseExtra.messagingSenderId,
  appId: firebaseExtra.appId,
  measurementId: firebaseExtra.measurementId,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
