import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
// ✅ SHTESË: Importojmë onSnapshot për dëgjim në kohë reale
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'; 

import { auth, db } from '../config/firebase'; 

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // ✅ E shtuam këtë (mban të dhënat e Firestore)
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);

  // 1. Dëgjuesi i Userit (Auth State)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Nëse nuk ka user, ndalojmë loading këtu (për rastin kur bën logout)
      if (!currentUser) {
        setUserData(null);
        setUserRole(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2. Dëgjuesi i të Dhënave (Firestore Real-time)
  // Ky aktivizohet sa herë ndryshon "user".
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      
      // ✅ onSnapshot dëgjon çdo ndryshim në databazë në kohë reale
      const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data); // Ruajmë gjithë objektin (përfshirë isProfileComplete)
          setUserRole(data.role); 
        } else {
            console.log("No User Data found!");
        }
        setLoading(false); // E heqim loading pasi kemi marrë të dhënat
      }, (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
      });

      return () => unsubscribeFirestore(); // Pastrimi kur useri ndryshon
    }
  }, [user]);

  // Funksioni për Regjistrim
  const signup = async (email, password, role = 'student') => {
    // 1. Krijojmë userin në Authentication
    const response = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Ruajmë të dhënat në Firestore
    await setDoc(doc(db, "users", response.user.uid), {
      email: email,
      role: role, 
      uid: response.user.uid,
      createdAt: serverTimestamp(),
      
      // ✅ SETUP FILLESTAR I PROFILIT
      isProfileComplete: false, // E rëndësishme për App.js!
      
      // Fushat bosh që të mos kemi error 'undefined'
      displayName: "",
      about: "",
      skills: [], // Për studentët
      companyName: "", // Për employer
      industry: "" // Për employer
    });

    return response;
  };

  // Funksioni për Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Funksioni për Logout
  const logout = async () => {
    // Pastrojmë state manualisht për siguri
    setUserData(null);
    setUserRole(null);
    return signOut(auth);
  };

  const value = {
    user,
    userData, // ✅ Tani e eksportojmë që App.js ta lexojë
    userRole, 
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};