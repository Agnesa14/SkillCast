import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, 
    Modal, TextInput, KeyboardAvoidingView, Platform, Share 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase'; 
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobDetailsScreen({ route, navigation }) {
    // Get data passed from HomeScreen
    const { job } = route.params; 
    const user = auth.currentUser;

    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    // Handle Skills (support both array formats)
    const jobSkills = job.skills || job.tags || [];

    useEffect(() => {
        checkApplicationStatus();
    }, []);

    // 1. Check if already applied
    const checkApplicationStatus = async () => {
        if (!user) {
            setCheckingStatus(false);
            return;
        }
        try {
            const q = query(
                collection(db, "applications"),
                where("jobId", "==", job.id),
                where("studentId", "==", user.uid)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) setHasApplied(true);
        } catch (error) {
            console.error("Error checking status:", error);
        } finally {
            setCheckingStatus(false);
        }
    };

    // 2. Share Functionality (Professional Feature)
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this job: ${job.title} at ${job.companyName}. Apply via SkillCast!`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const openApplyModal = () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to apply for jobs.");
            return;
        }
        setModalVisible(true);
    };

    // 3. Submit Application to Firebase
    const submitApplication = async () => {
        if (!coverLetter.trim()) {
            Alert.alert("Missing Info", "Please write a short cover letter to stand out.");
            return;
        }

        setApplying(true);
        try {
            await addDoc(collection(db, "applications"), {
                // Job Details
                jobId: job.id,
                jobTitle: job.title,
                companyName: job.companyName || job.company, // Handle both naming conventions
                employerId: job.employerId || "unknown", // Crash prevention
                
                // Student Details
                studentId: user.uid,
                studentName: user.displayName || user.email.split('@')[0],
                studentEmail: user.email,
                coverLetter: coverLetter.trim(),
                
                // Metadata
                status: 'pending',
                appliedAt: serverTimestamp(),
            });

            setHasApplied(true);
            setModalVisible(false);

            // Delay alert slightly for better UX
            setTimeout(() => {
                Alert.alert("Success! 🚀", "Your application has been sent to the employer.");
            }, 500);

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not submit application. Please try again.");
        } finally {
            setApplying(false);
        }
    };

    // Render Logic for the Bottom Button
    const renderActionButton = () => {
        if (checkingStatus) {
            return (
                <View style={[styles.applyButton, styles.disabledButton]}>
                    <ActivityIndicator color="#94A3B8" />
                </View>
            );
        }
        if (hasApplied) {
            return (
                <View style={[styles.applyButton, styles.appliedButton]}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.applyText}>Application Sent</Text>
                </View>
            );
        }
        return (
            <TouchableOpacity style={styles.applyButton} onPress={openApplyModal} disabled={applying}>
                <Text style={styles.applyText}>Apply Now</Text>
            </TouchableOpacity>
        );
    };

    // Date Formatter Helper
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        // Handle both Firebase Timestamp and regular Date objects
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                    <Ionicons name="share-outline" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Top Section */}
                <View style={styles.topSection}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>
                            {(job.companyName || job.company || '?').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.companyName || job.company}</Text>

                    <View style={styles.tagsRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{job.salary || 'Negotiable'}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Full-Time</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Job Description */}
                <Text style={styles.sectionTitle}>About the Role</Text>
                <Text style={styles.description}>
                    {job.description || "No detailed description provided for this role."}
                </Text>

                {/* Requirements / Skills */}
                {jobSkills.length > 0 && (
                    <>
                        <View style={{ height: 24 }} />
                        <Text style={styles.sectionTitle}>Requirements & Skills</Text>
                        <View style={styles.reqList}>
                            {jobSkills.map((skill, index) => (
                                <View key={index} style={styles.reqItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                                    <Text style={styles.reqText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <View style={{ height: 24 }} />

                {/* Company & Meta Info */}
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.companyCard}>
                    <View style={styles.contactContainer}>
                        <View style={styles.contactRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="mail-outline" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Contact Email</Text>
                                <Text style={styles.contactValue}>{job.employerEmail || 'Protected'}</Text>
                            </View>
                        </View>

                        <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.iconBox}>
                                <Ionicons name="calendar-outline" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Posted On</Text>
                                <Text style={styles.contactValue}>{formatDate(job.createdAt)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Footer Action */}
            <View style={styles.footer}>
                {renderActionButton()}
            </View>

            {/* Application Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Apply to {job.companyName || job.company}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubtitle}>Why are you a good fit? (Cover Letter)</Text>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="Hello, I have experience with..." 
                            placeholderTextColor="#94A3B8"
                            multiline 
                            numberOfLines={4}
                            value={coverLetter} 
                            onChangeText={setCoverLetter}
                        />

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
                            <Text style={styles.infoText}>Your profile and email will be shared automatically.</Text>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={submitApplication} disabled={applying}>
                            {applying ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Send Application</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    
    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    
    content: { padding: 24, paddingTop: 20 },
    
    // Top Section
    topSection: { alignItems: 'center', marginBottom: 24 },
    logoContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    logoText: { fontSize: 32, fontWeight: '800', color: '#64748B' },
    jobTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
    companyName: { fontSize: 16, color: '#64748B', fontWeight: '500' },
    
    tagsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    badgeText: { color: '#2563EB', fontWeight: '600' },
    
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
    
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    description: { fontSize: 16, color: '#475569', lineHeight: 26 },
    
    reqList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    reqItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10, gap: 8 },
    reqText: { color: '#334155', fontWeight: '600' },
    
    companyCard: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    contactContainer: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12 },
    contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    contactLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    contactValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },

    footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF' },
    applyButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    applyText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    disabledButton: { backgroundColor: '#F1F5F9', shadowOpacity: 0 },
    appliedButton: { backgroundColor: '#10B981', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 450 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
    modalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 12 },
    textInput: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, height: 120, textAlignVertical: 'top', fontSize: 16, color: '#1E293B', marginBottom: 16 },
    infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, alignItems: 'center', gap: 12, marginBottom: 24 },
    infoText: { flex: 1, fontSize: 12, color: '#2563EB', fontWeight: '500' },
    confirmButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    confirmButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});