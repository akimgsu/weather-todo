import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// .env 파일에 작성하신 변수들을 불러옵니다.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 앱 시작
const app = initializeApp(firebaseConfig);

// Firestore(데이터베이스) 기능 시작 후 내보내기 (다른 파일에서 쓸 수 있게 함)
export const db = getFirestore(app);
