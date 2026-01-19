import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function JobApplicantsScreen({ route, navigation }) {
  const { jobId, jobTitle } = route.params; // Marrim ID e punës nga ekrani i mëparshëm
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      // 1. Gjej të gjitha aplikimet për këtë punë
      const q = query(collection(db, "applications"), where("jobId", "==", jobId));
      const querySnapshot = await getDocs(q);
      
      const applicantsList = [];

      // 2. Për çdo aplikim, gjej të dhënat e Studentit (Emrin, Email, etj.)
      for (const docSnap of querySnapshot.docs) {
        const appData = docSnap.data();
        
        // Marrim detajet e studentit nga koleksioni 'users'
        const userRef = doc(db, "users", appData.studentId);
        const userSnap = await getDoc(userRef);
        
        let studentName = "Unknown Student";
        let studentEmail = "No email";
        let studentSkills = [];

        if (userSnap.exists()) {
          const userData = userSnap.data();
          studentName = userData.displayName || userData.email;
          studentEmail = userData.email;
          studentSkills = userData.skills || [];
        }

        applicantsList.push({
          id: docSnap.id, // ID e aplikimit
          ...appData,     // status, appliedAt, etj.
          studentName,
          studentEmail,
          studentSkills
        });
      }

      setApplicants(applicantsList);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      Alert.alert("Error", "Could not load applicants.");
    } finally {
      setLoading(false);
    }
  };

  // Funksioni për të ndryshuar statusin (Accept/Reject)
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const appRef = doc(db, "applications", applicationId);
      await updateDoc(appRef, { 
        status: newStatus,
        updatedAt: new Date()
      });

      // Përditësojmë listën lokalisht pa bërë refresh
      setApplicants(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      Alert.alert("Success", `Candidate ${newStatus} successfully.`);
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update status.");
    }
  };

  const renderApplicantCard = ({ item }) => {
    const isPending = item.status === 'pending';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.studentEmail}>{item.studentEmail}</Text>
          </View>
          {/* Status Badge */}
          <View style={[
            styles.statusBadge, 
            item.status === 'accepted' ? styles.bgGreen : 
            item.status === 'rejected' ? styles.bgRed : styles.bgOrange
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'accepted' ? styles.textGreen : 
              item.status === 'rejected' ? styles.textRed : styles.textOrange
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.skillsContainer}>
            {item.studentSkills.slice(0, 3).map((skill, index) => (
                <Text key={index} style={styles.skillTag}>{skill}</Text>
            ))}
        </View>

        {/* Action Buttons (Vetëm nëse është Pending) */}
        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnReject]} 
              onPress={() => handleUpdateStatus(item.id, 'rejected')}
            >
              <Text style={styles.btnTextRed}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, styles.btnAccept]} 
              onPress={() => handleUpdateStatus(item.id, 'accepted')}
            >
              <Text style={styles.btnTextWhite}>Accept Candidate</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>{jobTitle}</Text>
        <Text style={styles.subtitle}>{applicants.length} Applicants</Text>
      </View>

      <FlatList
        data={applicants}
        keyExtractor={item => item.id}
        renderItem={renderApplicantCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No applicants yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backButton: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  listContent: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  studentName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  studentEmail: { fontSize: 14, color: '#64748B' },
  
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  skillTag: { backgroundColor: '#F1F5F9', color: '#475569', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  bgGreen: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  bgRed: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  bgOrange: { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' },
  textGreen: { color: '#15803D', fontSize: 12, fontWeight: '700' },
  textRed: { color: '#B91C1C', fontSize: 12, fontWeight: '700' },
  textOrange: { color: '#C2410C', fontSize: 12, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#F1F5F9' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnReject: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EF4444' },
  btnAccept: { backgroundColor: '#2563EB' },
  btnTextRed: { color: '#EF4444', fontWeight: '700' },
  btnTextWhite: { color: '#FFF', fontWeight: '700' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, color: '#94A3B8', fontSize: 16 },
});