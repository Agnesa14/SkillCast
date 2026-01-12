import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});

// Ky funksion bën të mundur përdorimin e Auth në çdo faqe
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kontrollon nëse useri është i loguar sa herë hapet aplikacioni
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Funksioni për Regjistrim (Signup)
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Funksioni për Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Funksioni për Logout
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
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