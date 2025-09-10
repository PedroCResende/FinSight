'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATjUtFWIOprS9ntjc9RGAsoCjdf5409U8",
  authDomain: "finsight-lxxmb.firebaseapp.com",
  projectId: "finsight-lxxmb",
  storageBucket: "finsight-lxxmb.appspot.com",
  messagingSenderId: "686617891887",
  appId: "1:686617891887:web:881751cbebeb78e950a2da"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
