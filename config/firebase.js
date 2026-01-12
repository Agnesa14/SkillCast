import { initializeApp } from "firebase/app";
// Importojmë veglat për Login (Auth) dhe Databazë (Firestore)
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurimi yt nga Google
const firebaseConfig = {
  apiKey: "AIzaSyAoIh1k65RkHDKH94BJdtFnGhX31DdFVIk",
  authDomain: "skillcast-c6395.firebaseapp.com",
  projectId: "skillcast-c6395",
  storageBucket: "skillcast-c6395.firebasestorage.app",
  messagingSenderId: "488264122959",
  appId: "1:488264122959:web:f243904027445fe5a4e03a",
  measurementId: "G-PXM0136K5N"
};

// 1. Nisim Firebase
const app = initializeApp(firebaseConfig);

// 2. Eksportojmë Auth dhe Database që t'i përdorim në faila të tjerë
export const auth = getAuth(app);
export const db = getFirestore(app);