import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 
import { auth, db } from '../../config/firebase'; // ✅ Path-i është i saktë
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApplicationsScreen() {
    const navigation = useNavigation(); 
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        const q = query(
            collection(db, "applications"),
            where("studentId", "==", user.uid),
            orderBy("appliedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const apps = [];
            querySnapshot.forEach((doc) => {
                apps.push({ id: doc.id, ...doc.data() });
            });
            setApplications(apps);
            setLoading(false);
        }, (error) => {
            console.error("Gabim:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleWithdraw = (applicationId, companyName) => {
        Alert.alert(
            "Withdraw Application",
            `Are you sure you want to withdraw your application for ${companyName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Withdraw",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "applications", applicationId));
                        } catch (error) {
                            console.error("Error withdrawing:", error);
                            Alert.alert("Error", "Could not withdraw application.");
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return '#10B981';
            case 'rejected': return '#EF4444';
            case 'pending': return '#F59E0B';
            default: return '#64748B';
        }
    };

    const renderApplication = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                // Krijojmë një objekt pune të përkohshëm për të mos u prishur JobDetails
                const jobData = {
                    id: item.jobId,
                    title: item.jobTitle,
                    company: item.companyName,
                    location: item.location || 'See details', 
                    type: 'Applied',
                    salary: item.salary || '-', 
                    tags: item.tags || [] 
                };
                // Tani 'navigation' ekziston dhe nuk do japë error
                navigation.navigate('JobDetails', { job: jobData });
            }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Text style={styles.logoText}>{item.companyName ? item.companyName.charAt(0) : '?'}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                </View>

                {item.status === 'pending' && (
                    <TouchableOpacity
                        onPress={() => handleWithdraw(item.id, item.companyName)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                <Text style={styles.title}>My Applications</Text>
            </View>

            {applications.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyText}>No applications yet</Text>
                    <Text style={styles.emptySubText}>Start applying to jobs to see them here.</Text>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderApplication}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },

    list: { padding: 24 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logoText: { fontSize: 20, fontWeight: '700', color: '#64748B' },

    info: { flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    companyName: { fontSize: 14, color: '#64748B' },

    deleteButton: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700' },
    dateText: { fontSize: 12, color: '#94A3B8' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    emptySubText: { fontSize: 14, color: '#94A3B8', marginTop: 8 },
});