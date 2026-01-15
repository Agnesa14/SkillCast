import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth 
} from "firebase/auth";
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

// Inicializimi i App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializimi i Auth - kjo pjesë shuan Warning-un
const auth = (() => {
  try {
    // Provojmë të inicializojmë me persistence
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    // Nëse është inicializuar një herë, kthejmë atë ekzistuesin
    return getAuth(app);
  }
})();

const db = getFirestore(app);

export { auth, db };