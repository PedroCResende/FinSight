'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, browserLocalPersistence, getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "finsight-lxxmb",
  "appId": "1:686617891887:web:2fffa88d7789119750a2da",
  "storageBucket": "finsight-lxxmb.appspot.com",
  "apiKey": "AIzaSyATjUtFWIOprS9ntjc9RGAsoCjdf5409U8",
  "authDomain": "finsight-lxxmb.firebaseapp.com",
  "messagingSenderId": "686617891887"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Use initializeAuth with browserLocalPersistence for iframe compatibility
const auth = typeof window !== 'undefined' 
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : getAuth(app);
  
const db = getFirestore(app);

export { app, auth, db };
