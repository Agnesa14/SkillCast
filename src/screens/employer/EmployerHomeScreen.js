import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase'; 
import { useFocusEffect } from '@react-navigation/native';

export default function EmployerHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  // State
  const [jobs, setJobs] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Data (Jobs + Stats)
  const fetchData = async () => {
    if (!user) return;
    
    try {
      // 1. Get My Posted Jobs (Ordered by newest)
      // Note: If this fails, ensure you created the Index in Firebase Console as requested before.
      const jobsQuery = query(
        collection(db, "jobs"), 
        where("employerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsList = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobsList);

      // 2. Get Total Applications Count (Aggregate)
      const appsQuery = query(collection(db, "applications"), where("employerId", "==", user.uid));
      const appsSnapshot = await getCountFromServer(appsQuery);
      setTotalApplications(appsSnapshot.data().count);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    logout();
  };

  // Navigate to the Applicants Screen (The "Secret" screen we built)
  const handleViewApplicants = (job) => {
    navigation.navigate('JobApplicants', { 
        jobId: job.id, 
        jobTitle: job.title 
    });
  };

  const renderHeader = () => (
    <View>
        <Text style={styles.subtitle}>Overview</Text>
        
        {/* --- STATS CARDS --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="briefcase" size={24} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="people" size={24} color="#16A34A" />
            </View>
            <Text style={styles.statNumber}>{totalApplications}</Text>
            <Text style={styles.statLabel}>Candidates</Text>
          </View>
        </View>

        {/* --- POST JOB BUTTON --- */}
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate('PostJob')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Post a New Job</Text>
            <Text style={styles.cardDesc}>Reach out to new talent</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        <Text style={[styles.subtitle, { marginTop: 32, marginBottom: 12 }]}>Your Jobs</Text>
    </View>
  );

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.jobCard} 
        onPress={() => handleViewApplicants(item)}
        activeOpacity={0.7}
    >
      <View style={styles.jobHeader}>
        <View style={{flex: 1}}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobDate}>Posted: {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </View>
      
      <View style={styles.jobFooter}>
         <Text style={styles.applicantsLink}>Tap to manage applicants</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Employer Dashboard</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
            data={jobs}
            keyExtractor={item => item.id}
            renderItem={renderJobItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No jobs posted yet.</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  logoutBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 12 },
  
  content: { padding: 24 },
  subtitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 16 },

  // Stats Styles
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },

  // Action Card Style
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', padding: 20, borderRadius: 20, gap: 16, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  cardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Job List Styles
  jobCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    elevation: 2, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.03
  },
  jobHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  jobDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  jobFooter: { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 12 },
  applicantsLink: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontStyle: 'italic' }
});