import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
    Modal, TextInput, KeyboardAvoidingView, Platform, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobDetailsScreen({ route, navigation }) {
    const { job } = route.params;
    const user = auth.currentUser;

    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        checkApplicationStatus();
    }, []);

    const checkApplicationStatus = async () => {
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

    const openApplyModal = () => {
        setModalVisible(true);
    };

    const submitApplication = async () => {
        setApplying(true);
        try {
            await addDoc(collection(db, "applications"), {
                jobId: job.id,
                jobTitle: job.title,
                companyName: job.company,
                companyLogo: job.logo || '',
                tags: job.tags || [],
                salary: job.salary || 'N/A',
                location: job.location || 'Remote',
                studentId: user.uid,
                studentName: user.displayName || 'Student',
                studentEmail: user.email,
                coverLetter: coverLetter,
                status: 'pending',
                appliedAt: serverTimestamp(),
            });

            setHasApplied(true);
            setModalVisible(false);

            setTimeout(() => {
                Alert.alert("Success!", "Your application has been sent to the recruiter.");
            }, 500);

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not submit application.");
        } finally {
            setApplying(false);
        }
    };

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

    const skillsText = (job.tags && job.tags.length > 0) ? job.tags.join(", ") : "relevant technologies";

    const openLink = (url) => {
        if (url) Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.topSection}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>{job.company ? job.company.charAt(0) : '?'}</Text>
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.company} • {job.location}</Text>

                    <View style={styles.tagsRow}>
                        <View style={styles.badge}><Text style={styles.badgeText}>{job.type || 'Full-time'}</Text></View>
                        <View style={styles.badge}><Text style={styles.badgeText}>{job.salary || 'Negotiable'}</Text></View>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>About the role</Text>
                <Text style={styles.description}>
                    {`We are looking for a passionate ${job.title} to join our team in ${job.location}.\n\nRequirements:\n• Knowledge of ${skillsText}\n• Good communication skills\n• Ability to work in a team`}
                </Text>

                {job.tags && job.tags.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Skills Required</Text>
                        <View style={styles.reqList}>
                            {job.tags.map((tag, index) => (
                                <View key={index} style={styles.reqItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                                    <Text style={styles.reqText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* --- COMPANY SECTION (FIXED) --- */}
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>About {job.company}</Text>

                <View style={styles.companyCard}>
                    <Text style={styles.companyDesc}>
                        {job.aboutCompany || `A leading company in the ${job.category || 'tech'} industry, committed to innovation and growth.`}
                    </Text>

                    <View style={styles.contactContainer}>
                        {/* Website Row - ERRORI ISHTE KETU */}
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() => openLink(job.website)}
                            disabled={!job.website}
                        >
                            <View style={styles.iconBox}>
                                <Ionicons name="globe-outline" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Website</Text>
                                <Text style={styles.contactValue}>{job.website || 'Not available'}</Text>
                            </View>
                            {/* Zgjidhja: Përdorim !!job.website për ta bërë Boolean të pastër */}
                            {!!job.website && <Ionicons name="open-outline" size={16} color="#94A3B8" style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>

                        {/* Email Row */}
                        <View style={styles.contactRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="mail-outline" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>HR Email</Text>
                                <Text style={styles.contactValue}>{job.email ? job.email : 'Hidden'}</Text>
                            </View>
                        </View>

                        {/* Address Row */}
                        <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.iconBox}>
                                <Ionicons name="location-outline" size={20} color="#2563EB" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contactLabel}>Headquarters</Text>
                                <Text style={styles.contactValue}>{job.address || job.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 20 }} />

            </ScrollView>

            <View style={styles.footer}>
                {renderActionButton()}
            </View>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Apply to {job.company}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Share a note with the recruiter (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: I have built 3 apps using React Native..."
                            placeholderTextColor="#94A3B8"
                            multiline numberOfLines={4}
                            value={coverLetter} onChangeText={setCoverLetter}
                        />
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
                            <Text style={styles.infoText}>Your profile details will be shared automatically.</Text>
                        </View>
                        <TouchableOpacity style={styles.confirmButton} onPress={submitApplication} disabled={applying}>
                            {applying ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>Submit Application</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 24, paddingTop: 0 },
    topSection: { alignItems: 'center', marginBottom: 24 },
    logoContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    logoText: { fontSize: 32, fontWeight: '800', color: '#64748B' },
    jobTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
    companyName: { fontSize: 16, color: '#64748B', fontWeight: '500' },
    tagsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    badgeText: { color: '#2563EB', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24, marginTop: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    description: { fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 24 },
    reqList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    reqItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10, gap: 8 },
    reqText: { color: '#334155', fontWeight: '600' },
    footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    applyButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    applyText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    disabledButton: { backgroundColor: '#F1F5F9' },
    appliedButton: { backgroundColor: '#10B981' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
    modalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 12 },
    textInput: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, height: 120, textAlignVertical: 'top', fontSize: 16, color: '#1E293B', marginBottom: 16 },
    infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, alignItems: 'center', gap: 12, marginBottom: 24 },
    infoText: { flex: 1, fontSize: 12, color: '#2563EB', fontWeight: '500' },
    confirmButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    confirmButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

    // --- STYLES PER COMPANY CARD ---
    companyCard: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    companyDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16, fontStyle: 'italic' },
    contactContainer: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12 },
    contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    contactLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    contactValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
});