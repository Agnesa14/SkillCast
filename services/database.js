// ⚠️ KUJDES: Meqë folderi 'services' është jashtë 'src', duhet të futemi te 'src'
import { db } from "../src/config/firebase"; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

// --- PËR PUNËT (JOBS) ---

// 1. Shton një punë të re (Zëvendëson addData për todos)
export const addJob = async (jobData) => {
  try {
    await addDoc(collection(db, "jobs"), {
      ...jobData,
      createdAt: serverTimestamp(),
      isActive: true
    });
    return { success: true };
  } catch (e) {
    console.error("Gabim në addJob:", e);
    return { success: false, error: e.message };
  }
};

// 2. Merr të gjitha punët (Zëvendëson getUserData, por për të gjithë)
export const getAllJobs = async () => {
  try {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Gabim në getAllJobs:", e);
    return [];
  }
};

// --- PËR APLIKIMET (APPLICATIONS) ---

// 3. Shton një aplikim (Lidh Studentin me Punën)
export const addApplication = async (applicationData) => {
  try {
    await addDoc(collection(db, "applications"), {
      ...applicationData,
      status: 'pending',
      appliedAt: serverTimestamp()
    });
    return { success: true };
  } catch (e) {
    console.error("Gabim në addApplication:", e);
    return { success: false, error: e.message };
  }
};

// 4. Merr Aplikimet (Filtron sipas User ID ose Employer ID)
// userId mund të jetë studentId ose employerId
// fieldName tregon cilën fushë po kërkojmë ("studentId" apo "employerId")
export const getApplications = async (fieldName, userId) => {
  try {
    const q = query(
      collection(db, "applications"), 
      where(fieldName, "==", userId),
      orderBy("appliedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Gabim në getApplications:", e);
    return [];
  }
};