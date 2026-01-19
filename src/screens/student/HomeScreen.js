import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase'; 
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const FILTERS = ["All", "Remote", "Full-Time", "Part-Time", "Internship"];

export default function HomeScreen({ navigation }) {
    const user = auth.currentUser;
    
    // State for Real Data
    const [jobs, setJobs] = useState([]); // Master list
    const [filteredJobs, setFilteredJobs] = useState([]); // Display list
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI States
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [greeting, setGreeting] = useState('Hello');

    // 1. Time Greeting Logic
    useFocusEffect(
        useCallback(() => {
            const hours = new Date().getHours();
            if (hours < 12) setGreeting('Good Morning');
            else if (hours < 18) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
            
            // Auto-refresh when screen comes into focus
            fetchJobs();
        }, [])
    );

    // 2. Fetch Jobs from Firebase
    const fetchJobs = async () => {
        try {
            // Query: Get active jobs, ordered by newest first
            const q = query(
                collection(db, "jobs"),
                where("isActive", "==", true),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const jobsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setJobs(jobsList);
            setFilteredJobs(jobsList); // Initial render
            
            // Re-apply filters if any exist
            applyFilters(jobsList, search, activeFilter);

        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 3. Helper: "Time Ago" Calculator
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const now = new Date();
        const postedDate = new Date(timestamp.seconds * 1000);
        const diffInSeconds = Math.floor((now - postedDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return postedDate.toLocaleDateString();
    };

    // 4. Advanced Filter Logic
    const applyFilters = (data, searchText, filterType) => {
        let result = data;

        // a) Filter by Category/Type
        if (filterType !== 'All') {
            if (filterType === 'Remote') {
                // Check if location or description contains "Remote"
                result = result.filter(job => 
                    (job.location && job.location.toLowerCase().includes('remote')) ||
                    (job.title && job.title.toLowerCase().includes('remote'))
                );
            } else {
                // Filter by job type (Full-Time, Internship, etc.)
                // Assuming description or a specific field contains this info
                result = result.filter(job => 
                    job.description && job.description.toLowerCase().includes(filterType.toLowerCase())
                );
            }
        }

        // b) Filter by Search Text
        if (searchText) {
            const text = searchText.toLowerCase();
            result = result.filter(job =>
                (job.title && job.title.toLowerCase().includes(text)) ||
                (job.companyName && job.companyName.toLowerCase().includes(text)) ||
                (job.skills && job.skills.some(skill => skill.toLowerCase().includes(text)))
            );
        }

        setFilteredJobs(result);
    };

    // Trigger filter when inputs change
    const handleSearch = (text) => {
        setSearch(text);
        applyFilters(jobs, text, activeFilter);
    };

    const handleFilterSelect = (filter) => {
        setActiveFilter(filter);
        applyFilters(jobs, search, filter);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const renderJobCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('JobDetails', { job: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>
                        {item.companyName ? item.companyName.charAt(0).toUpperCase() : 'J'}
                    </Text>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons 
                            name={item.location?.toLowerCase().includes('remote') ? "wifi" : "location-outline"} 
                            size={14} 
                            color="#64748B" 
                        />
                        <Text style={styles.locationText}>{item.location || "Remote"}</Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View style={styles.tagsContainer}>
                    {/* Salary Tag */}
                    <View style={[styles.tag, { backgroundColor: '#DCFCE7' }]}>
                        <Text style={[styles.tagText, { color: '#166534' }]}>
                            {item.salary || "Negotiable"}
                        </Text>
                    </View>
                    {/* Skills Tags (Max 2) */}
                    {item.skills && item.skills.slice(0, 2).map((skill, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{skill}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.postedText}>{getTimeAgo(item.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{greeting}, {user?.email ? user.email.split('@')[0] : 'Student'} 👋</Text>
                    <Text style={styles.subTitle}>Let's find your dream career.</Text>
                </View>
                <TouchableOpacity style={styles.notifButton}>
                    <View style={styles.badge} />
                    <Ionicons name="notifications-outline" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            {/* SEARCH & FILTER AREA */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94A3B8" style={{ marginLeft: 12 }} />
                    <TextInput
                        placeholder="Search jobs, companies, skills..."
                        style={styles.input}
                        value={search}
                        onChangeText={handleSearch}
                        placeholderTextColor="#94A3B8"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.activeChip
                            ]}
                            onPress={() => handleFilterSelect(filter)}
                        >
                            <Text style={[
                                styles.chipText,
                                activeFilter === filter && styles.activeChipText
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* JOB LIST */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={filteredJobs}
                    renderItem={renderJobCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
                    }
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            <Text style={styles.sectionTitle}>
                                {activeFilter === 'All' ? "Latest Jobs" : `Results for ${activeFilter}`}
                            </Text>
                            <Text style={styles.resultCount}>{filteredJobs.length} jobs found</Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name="briefcase-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No jobs found</Text>
                            <Text style={styles.emptySubText}>
                                {activeFilter !== 'All' 
                                    ? `No ${activeFilter} jobs available yet.` 
                                    : "Check back later for new opportunities."}
                            </Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header Styles
    header: { padding: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF' },
    greeting: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
    subTitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
    notifButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', zIndex: 10 },

    // Search Section
    searchSection: { backgroundColor: '#FFF', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 24, height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
    input: { flex: 1, fontSize: 16, color: '#1E293B', marginLeft: 8 },

    // Filters
    filterContainer: { paddingHorizontal: 24, gap: 10 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
    activeChip: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    chipText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
    activeChipText: { color: '#FFF' },

    // List
    listContent: { paddingHorizontal: 24, paddingBottom: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    resultCount: { fontSize: 12, color: '#94A3B8' },

    // Card Styles
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    logoContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logoText: { fontSize: 20, fontWeight: '700', color: '#64748B' },
    cardContent: { flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    companyName: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 12, color: '#94A3B8' },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tagsContainer: { flexDirection: 'row', gap: 6 },
    tag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { fontSize: 10, color: '#2563EB', fontWeight: '600' },
    postedText: { fontSize: 11, color: '#94A3B8' },

    // Empty State
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#94A3B8', marginTop: 8 },
});