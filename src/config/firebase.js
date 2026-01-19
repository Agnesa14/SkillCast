import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ SHTESË: Na duhet për foto/CV
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAoIh1k65RkHDKH94BJdtFnGhX31DdFVIk",
  authDomain: "skillcast-c6395.firebaseapp.com",
  projectId: "skillcast-c6395",
  storageBucket: "skillcast-c6395.firebasestorage.app",
  messagingSenderId: "488264122959",
  appId: "1:488264122959:web:f243904027445fe5a4e03a",
  measurementId: "G-PXM0136K5N"
};

// 1. Inicializimi i App (Singleton Pattern)
let app;
let auth;

if (getApps().length === 0) {
  // Hera e parë që hapet aplikacioni
  app = initializeApp(firebaseConfig);
  
  // Inicializojmë Auth me Persistence (që useri të rrijë logged in)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  // Nëse aplikacioni është tashmë i hapur (hot reload)
  app = getApp();
  auth = getAuth(app);
}

// 2. Inicializimi i Shërbimeve të tjera
const db = getFirestore(app);
const storage = getStorage(app); // ✅ E gatshme për përdorim të mëvonshëm

// 3. Eksportojmë gjithçka që na duhet
export { auth, db, storage };