import React, { useEffect, useState, useContext } from 'react';
import { 
    View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, 
    Alert, Modal, ScrollView, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 
import { auth, db } from '../../config/firebase'; 
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/AuthContext';

export default function ApplicationsScreen() {
    const navigation = useNavigation(); 
    const { userRole } = useContext(AuthContext); 
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); 
    const user = auth.currentUser;

    // Filter State
    const [filterStatus, setFilterStatus] = useState('All'); // All, pending, accepted, rejected
    const [searchText, setSearchText] = useState('');

    // Modal State
    const [selectedApp, setSelectedApp] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!user) return;

        let q;
        if (userRole === 'student') {
            q = query(collection(db, "applications"), where("studentId", "==", user.uid), orderBy("appliedAt", "desc"));
        } else {
            q = query(collection(db, "applications"), where("employerId", "==", user.uid), orderBy("appliedAt", "desc"));
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const apps = [];
            querySnapshot.forEach((doc) => {
                apps.push({ id: doc.id, ...doc.data() });
            });
            setApplications(apps);
            filterData(apps, filterStatus, searchText);
            setLoading(false);
        }, (error) => {
            console.error("Fetch error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userRole]);

    // Logic for Filtering and Searching
    const filterData = (data, status, text) => {
        let result = data;

        // 1. Filter by Status
        if (status !== 'All') {
            result = result.filter(app => app.status === status.toLowerCase());
        }

        // 2. Filter by Search Text
        if (text) {
            const term = text.toLowerCase();
            result = result.filter(app => 
                (app.jobTitle && app.jobTitle.toLowerCase().includes(term)) ||
                (app.companyName && app.companyName.toLowerCase().includes(term)) ||
                (app.studentName && app.studentName.toLowerCase().includes(term))
            );
        }

        setFilteredApps(result);
    };

    // Trigger filter when inputs change
    useEffect(() => {
        filterData(applications, filterStatus, searchText);
    }, [filterStatus, searchText, applications]);

    const handleWithdraw = (applicationId, companyName) => {
        Alert.alert(
            "Withdraw Application",
            `Are you sure you want to withdraw your application for ${companyName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Withdraw",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "applications", applicationId));
                        } catch (error) {
                            Alert.alert("Error", "Could not withdraw application.");
                        }
                    }
                }
            ]
        );
    };

    const handleStatusChange = async (appId, newStatus) => {
        setActionLoading(true);
        try {
            await updateDoc(doc(db, "applications", appId), {
                status: newStatus
            });
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", "Could not update status.");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return '#10B981';
            case 'rejected': return '#EF4444';
            case 'pending': return '#F59E0B';
            default: return '#64748B';
        }
    };

    // Component for Filter Tab
    const FilterTab = ({ title, value }) => (
        <TouchableOpacity 
            style={[styles.filterTab, filterStatus === value && styles.activeFilterTab]}
            onPress={() => setFilterStatus(value)}
        >
            <Text style={[styles.filterText, filterStatus === value && styles.activeFilterText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const renderApplication = ({ item }) => {
        const isStudent = userRole === 'student';

        return (
            <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.9}
                onPress={() => {
                    if (!isStudent) {
                        setSelectedApp(item);
                        setModalVisible(true);
                    } else {
                        const jobData = {
                            id: item.jobId,
                            title: item.jobTitle,
                            company: item.companyName,
                            location: item.location || 'See details', 
                            type: 'Applied',
                            salary: item.salary || '-', 
                            tags: item.tags || [] 
                        };
                        navigation.navigate('JobDetails', { job: jobData });
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        {isStudent ? (
                            <Text style={styles.logoText}>{item.companyName ? item.companyName.charAt(0) : '?'}</Text>
                        ) : (
                            <Ionicons name="person" size={24} color="#64748B" />
                        )}
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                        <Text style={styles.companyName}>
                            {isStudent ? item.companyName : `Applicant: ${item.studentName}`}
                        </Text>
                    </View>

                    {isStudent && item.status === 'pending' && (
                        <TouchableOpacity 
                            onPress={() => handleWithdraw(item.id, item.companyName)}
                            style={styles.deleteButton}
                        >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>
                        {item.appliedAt ? new Date(item.appliedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {userRole === 'student' ? "My Applications" : "Received Applications"}
                </Text>
            </View>

            {/* --- SEARCH & FILTER SECTION --- */}
            <View style={styles.filterContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder={userRole === 'student' ? "Search jobs..." : "Search applicants..."}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                    <FilterTab title="All" value="All" />
                    <FilterTab title="Pending" value="pending" />
                    <FilterTab title="Accepted" value="accepted" />
                    <FilterTab title="Rejected" value="rejected" />
                </ScrollView>
            </View>

            {filteredApps.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyText}>No applications found</Text>
                    <Text style={styles.emptySubText}>
                        Try changing the filters or search terms.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredApps}
                    renderItem={renderApplication}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}

            {/* EMPLOYER MODAL (Review Candidate) */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Review Application</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView>
                            <Text style={styles.label}>Applicant:</Text>
                            <Text style={styles.value}>{selectedApp?.studentName}</Text>
                            <Text style={styles.valueSub}>{selectedApp?.studentEmail}</Text>

                            <View style={styles.divider} />

                            <Text style={styles.label}>Cover Letter / Note:</Text>
                            <View style={styles.noteBox}>
                                <Text style={styles.noteText}>
                                    {selectedApp?.coverLetter || "No cover letter provided."}
                                </Text>
                            </View>
                        </ScrollView>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={[styles.actionBtn, styles.rejectBtn]} 
                                onPress={() => handleStatusChange(selectedApp?.id, 'rejected')}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <ActivityIndicator color="#EF4444" /> : <Text style={styles.btnText}>Reject</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.actionBtn, styles.acceptBtn]} 
                                onPress={() => handleStatusChange(selectedApp?.id, 'accepted')}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.btnText, { color: '#FFF' }]}>Accept</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 24, backgroundColor: '#FFF', paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },

    // FILTER STYLES
    filterContainer: { backgroundColor: '#FFF', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', marginHorizontal: 24, paddingHorizontal: 12, borderRadius: 12, height: 44, marginBottom: 12 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1E293B' },
    tabsContainer: { paddingHorizontal: 24, gap: 10 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
    activeFilterTab: { backgroundColor: '#2563EB' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    activeFilterText: { color: '#FFF' },

    list: { padding: 24 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logoText: { fontSize: 20, fontWeight: '700', color: '#64748B' },

    info: { flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    companyName: { fontSize: 14, color: '#64748B' },

    deleteButton: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12, marginTop: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700' },
    dateText: { fontSize: 12, color: '#94A3B8' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    emptySubText: { fontSize: 14, color: '#94A3B8', marginTop: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    label: { fontSize: 14, color: '#64748B', fontWeight: '600', marginTop: 12 },
    value: { fontSize: 18, color: '#1E293B', fontWeight: '700' },
    valueSub: { fontSize: 14, color: '#2563EB' },
    noteBox: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, marginTop: 8 },
    noteText: { color: '#334155', fontStyle: 'italic', lineHeight: 22 },
    actionButtons: { flexDirection: 'row', gap: 16, marginTop: 24 },
    actionBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    rejectBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
    acceptBtn: { backgroundColor: '#10B981' },
    btnText: { fontWeight: '700', fontSize: 16, color: '#1E293B' }
});