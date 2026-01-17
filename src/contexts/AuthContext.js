import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

// 👇 NDRYSHIMI I VETËM: Shto '/config' sepse firebase.js është brenda folderit config
import { auth, db } from '../config/firebase'; 

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Nëse useri është i loguar, shkojmë në Firestore dhe marrim rolin e tij
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            setUserRole(userSnapshot.data().role); // E ruajmë rolin në state
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
        setUser(currentUser);
      } else {
        // Nëse nuk ka user
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Funksioni për Regjistrim (Tani pranon edhe 'role')
  const signup = async (email, password, role = 'student') => {
    // 1. Krijojmë userin në Authentication
    const response = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Ruajmë të dhënat shtesë (rolin) në Firestore Database
    await setDoc(doc(db, "users", response.user.uid), {
      email: email,
      role: role, // 'student' ose 'employer'
      createdAt: new Date(),
      uid: response.user.uid
    });

    return response;
  };

  // Funksioni për Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Funksioni për Logout
  const logout = () => {
    setUserRole(null); // Pastrojmë rolin kur del
    return signOut(auth);
  };

  const value = {
    user,
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