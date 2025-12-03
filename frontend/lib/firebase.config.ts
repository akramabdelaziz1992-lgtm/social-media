// Firebase Configuration for Frontend
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBl5NfTaWByDKxI-9WH6V1zLA5548lVHmg",
  authDomain: "almasar-callcenter.firebaseapp.com",
  projectId: "almasar-callcenter",
  storageBucket: "almasar-callcenter.firebasestorage.app",
  messagingSenderId: "578093312644",
  appId: "1:578093312644:web:9a0b726e8ed84b4c5130d1",
  measurementId: "G-1XKFXRY3JT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
