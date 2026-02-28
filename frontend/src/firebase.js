// ─── Firebase Configuration ─────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyClHfHE0av6ACW_A4ajLb_7453pcdyaaKg",
    authDomain: "sit1-6b0de.firebaseapp.com",
    projectId: "sit1-6b0de",
    storageBucket: "sit1-6b0de.firebasestorage.app",
    messagingSenderId: "1034487127483",
    appId: "1:1034487127483:web:2001a0b5e09c5cece7b89e",
    measurementId: "G-CG0546MBMX"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services – exported for use anywhere in the app
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;
