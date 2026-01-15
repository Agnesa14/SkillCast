import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// 1. LOGJIKA E SIGURT PËR APLIKACIONIN
// Kontrollojmë nëse aplikacioni është iniciuar njëherë.
// Nëse po, e marrim atë. Nëse jo, e krijojmë.
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 2. LOGJIKA E SIGURT PËR AUTH (Zgjidhja e errorit "already-initialized")
let auth;
try {
  // E provojmë: A ekziston auth-i gati?
  auth = getAuth(app);
} catch (e) {
  // Nëse jo (jep error që s'ekziston), atëherë e krijojmë nga e para
  // duke përdorur logjikën tonë të blinduar për memorien
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (storageError) {
    // Plan B: Nëse memoria e telefonit dështon, kalo në RAM
    console.log("Storage fail, using memory:", storageError);
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  }
}

const db = getFirestore(app);

export { auth, db };