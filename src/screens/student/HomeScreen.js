import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase'; // ✅ Rruga e saktë
import { SafeAreaView } from 'react-native-safe-area-context';

// --- DUMMY DATA ---
const JOBS = [
    {
        id: '1',
        company: 'Gjirafa Inc.',
        logo: 'https://gjirafa.com/assets/images/gjirafa-logo.png',
        title: 'Junior React Developer',
        location: 'Prishtinë (On-site)',
        type: 'Internship',
        salary: '€250 - €400',
        tags: ['React', 'JavaScript', 'CSS'],
        category: 'Development',
        isRemote: false,
        posted: '2 days ago',
        aboutCompany: 'Gjirafa is the fastest growing tech company in the Balkans, focusing on e-commerce, video streaming, and online advertising.',
        website: 'www.gjirafa.com',
        email: 'careers@gjirafa.com',
        address: 'Magjistralja Prishtinë-Ferizaj, km 4'
    },
    {
        id: '2',
        company: 'Solaborate',
        logo: '',
        title: 'UI/UX Designer Intern',
        location: 'Mitrovicë',
        type: 'Part-time',
        salary: 'Unpaid',
        tags: ['Figma', 'Prototyping', 'User Research'],
        category: 'Design',
        isRemote: false,
        posted: '5 hours ago',
        aboutCompany: 'Solaborate is a communication and collaboration platform company.',
        website: 'www.solaborate.com',
        email: 'jobs@solaborate.com',
        address: 'Mitrovicë Innovation Center'
    },
    {
        id: '3',
        company: 'Kutia',
        logo: '',
        title: 'Backend Developer (Node.js)',
        location: 'Remote',
        type: 'Full-time',
        salary: '€500+',
        tags: ['Node.js', 'MongoDB', 'API'],
        category: 'Development',
        isRemote: true,
        posted: '1 week ago',
        aboutCompany: 'Kutia is a software development agency offering custom solutions.',
        website: 'www.kutia.net',
        email: 'hr@kutia.net',
        address: 'Rr. UÇK, Prishtinë'
    },
    {
        id: '4',
        company: 'Raiffeisen Bank',
        logo: '',
        title: 'IT Support Intern',
        location: 'Prishtinë',
        type: 'Internship',
        salary: '€300',
        tags: ['Networking', 'Hardware', 'Support'],
        category: 'IT',
        isRemote: false,
        posted: '3 days ago',
        aboutCompany: 'Raiffeisen Bank Kosova is one of the leading banks in the country.',
        website: 'www.raiffeisen-kosovo.com',
        email: 'recruitment@raiffeisen.com',
        address: 'Robert Doll, Prishtinë'
    }
];

const FILTERS = ["All", "Remote", "Paid", "Development", "Design"];

export default function HomeScreen({ navigation }) {
    const user = auth.currentUser;

    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [filteredJobs, setFilteredJobs] = useState(JOBS);
    const [greeting, setGreeting] = useState('Hello');

    // 1. Logjika për Përshëndetjen
    useEffect(() => {
        const hours = new Date().getHours();
        if (hours < 12) setGreeting('Good Morning');
        else if (hours < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // 2. Logjika e Filterimit dhe Search
    useEffect(() => {
        let result = JOBS;

        // a) Filtro sipas Kategorisë
        if (activeFilter !== 'All') {
            if (activeFilter === 'Remote') {
                result = result.filter(job => job.isRemote);
            } else if (activeFilter === 'Paid') {
                result = result.filter(job => job.salary !== 'Unpaid');
            } else {
                result = result.filter(job => job.category === activeFilter);
            }
        }

        // b) Filtro sipas Tekstit
        if (search) {
            const text = search.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(text) ||
                job.company.toLowerCase().includes(text) ||
                job.tags.some(tag => tag.toLowerCase().includes(text))
            );
        }

        setFilteredJobs(result);
    }, [search, activeFilter]);


    const renderJobCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('JobDetails', { job: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.logoContainer}>
                    {/* Nëse ka logo URL, mund të shtosh Image component këtu, përndryshe shfaq shkronjën */}
                    <Text style={styles.logoText}>{item.company.charAt(0)}</Text>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.companyName}>{item.company}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name={item.isRemote ? "wifi" : "location-outline"} size={14} color="#64748B" />
                        <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.postedText}>{item.posted}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{greeting}, {user?.displayName ? user.displayName.split(' ')[0] : 'Student'} 👋</Text>
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
                        onChangeText={setSearch}
                        placeholderTextColor="#94A3B8"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
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
                            onPress={() => setActiveFilter(filter)}
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

            {/* LISTA E PUNËVE */}
            <FlatList
                data={filteredJobs}
                renderItem={renderJobCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                        <Text style={styles.sectionTitle}>
                            {activeFilter === 'All' ? "Recommended for you" : `Results for ${activeFilter}`}
                        </Text>
                        <Text style={styles.resultCount}>{filteredJobs.length} jobs found</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No jobs found</Text>
                        <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },

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