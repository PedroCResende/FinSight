'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB...Y-U", // process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "your-project-id.firebaseapp.com", // process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "your-project-id", // process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "your-project-id.appspot.com", // process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "your-sender-id", // process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: "1:your-sender-id:web:your-app-id", // process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-your-measurement-id" // process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Security check to ensure Firebase credentials are provided
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "AIzaSyB...Y-U") {
    console.warn('Firebase configuration is using placeholder values. Please update your .env.local file with real credentials.');
}


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
