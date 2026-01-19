import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebase'; // ✅ Rruga e saktë
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PostJobScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [salary, setSalary] = useState('');
    const [skills, setSkills] = useState(''); // Input si string: "React, Node, Figma"
    
    const [loading, setLoading] = useState(false);

    // Funksion ndihmës për të krijuar fjalë kyçe për Search (p.sh. "react", "developer")
    const generateKeywords = (title, company) => {
        const text = `${title} ${company}`.toLowerCase();
        return text.split(' ').filter(word => word.length > 2); // Ruajmë fjalët me më shumë se 2 shkronja
    };

    const handlePostJob = async () => {
        Keyboard.dismiss(); // Mbyll tastierën për estetikë

        // 1. Siguria: Kontrollojmë a është i loguar
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Gabim", "Ju duhet të jeni të loguar për të postuar punë.");
            return;
        }

        // 2. Validimi: Heqim hapësirat e tepërta (.trim())
        if (!title.trim() || !company.trim() || !description.trim() || !salary.trim()) {
            Alert.alert("Kujdes", "Ju lutem plotësoni fushat kryesore (Titulli, Kompania, Përshkrimi, Paga).");
            return;
        }

        setLoading(true);

        try {
            // 3. Përgatitja e Skills (Array)
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            // 4. Përgatitja e Keywords për Search
            const searchKeywords = generateKeywords(title, company);

            const jobData = {
                title: title.trim(),
                
                // DATA CONSISTENCY: I ruajmë të dyja format që të mos kemi error në JobDetails
                company: company.trim(),
                companyName: company.trim(),
                
                description: description.trim(),
                salary: salary.trim(),
                skills: skillsArray,
                
                // Lidhja me Punëdhënësin
                employerId: user.uid, 
                employerEmail: user.email,
                
                // Meta të dhëna
                createdAt: serverTimestamp(),
                isActive: true,
                searchKeywords: searchKeywords // ✅ Kjo bën që Search-i te HomeScreen të punojë saktë
            };

            // 5. Ruajtja në Firebase
            await addDoc(collection(db, "jobs"), jobData);

            Alert.alert("Sukses", "Puna u publikua me sukses! 🚀", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Error posting job:", error);
            Alert.alert("Gabim", "Puna nuk u postua dot. Provoni përsëri.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Post a New Job</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                    
                    <Text style={styles.label}>Job Title *</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Senior React Native Developer" 
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Company Name *</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Tech Solutions Inc." 
                        value={company}
                        onChangeText={setCompany}
                    />

                    <Text style={styles.label}>Salary Range (Monthly) *</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. €800 - €1200" 
                        value={salary}
                        onChangeText={setSalary}
                    />

                    <Text style={styles.label}>Required Skills (Comma separated)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. React Native, Firebase, TypeScript" 
                        value={skills}
                        onChangeText={setSkills}
                    />
                    <Text style={styles.helperText}>Separate skills with commas.</Text>

                    <Text style={styles.label}>Job Description *</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        placeholder="Describe the role, responsibilities, and requirements..." 
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />

                    <View style={{ height: 20 }} />

                    <TouchableOpacity 
                        style={[styles.submitBtn, loading && styles.disabledBtn]} 
                        onPress={handlePostJob}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>Post Job Now</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
    
    form: { padding: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 12 },
    helperText: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginLeft: 4 },
    
    input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B' },
    textArea: { height: 120 },
    
    submitBtn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 32, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    disabledBtn: { backgroundColor: '#94A3B8' },
    submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});