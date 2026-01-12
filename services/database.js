import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const COLLECTION_NAME = "todos";

// 1. Shton të dhëna
export const addData = async (userId, title) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: userId,
      title: title,
      createdAt: new Date()
    });
    return true;
  } catch (e) {
    console.error("Gabim addData:", e);
    return false;
  }
};

// 2. Merr të dhënat (Lexon nga Google)
export const getUserData = async (userId) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    // I kthen dokumentet në një listë të thjeshtë
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Gabim getUserData:", e);
    return [];
  }
};