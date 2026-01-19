import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase'; 

// --- LISTA E INDUSTRIVE (Për të shmangur shkrimin manual) ---
const INDUSTRIES = [
  "Software Development", "Information Technology", "Construction (Ndërtimtari)",
  "Architecture", "Engineering", "Marketing & Sales",
  "Finance & Accounting", "Healthcare", "Education",
  "Manufacturing", "Retail", "Telecommunications", "Legal", "Other"
];

export default function CompleteEmployerProfileScreen() {
  const [loading, setLoading] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState(''); // City, Country
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  
  // Industry Selection State
  const [industry, setIndustry] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  // --- SAVE PROFILE LOGIC ---
  const handleSaveProfile = async () => {
    if (!companyName || !industry || !location || !description) {
      Alert.alert("Missing Information", "Please fill in Company Name, Industry, Location, and Description.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      const userRef = doc(db, "users", user.uid);

      // Update Firestore with Company Data
      await updateDoc(userRef, {
        displayName: companyName.trim(), // User's display name becomes Company Name
        companyName: companyName.trim(),
        industry: industry,
        location: location.trim(),
        website: website.trim(),
        about: description.trim(), // Company description
        isProfileComplete: true, // 🚩 HAP DASHBOARDIN
      });

      // App.js do ta vërejë ndryshimin automatikisht ose pas një reload
      Alert.alert("Success", "Company Profile Created!");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Company Profile</Text>
        <Text style={styles.subtitle}>Setup your business profile to start hiring students.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. COMPANY NAME */}
        <View style={styles.section}>
          <Text style={styles.label}>Company Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business" size={20} color="#64748B" style={{marginRight: 10}}/>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Tech Solutions Sh.p.k" 
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>
        </View>

        {/* 2. INDUSTRY (Modal Selector) */}
        <View style={styles.section}>
          <Text style={styles.label}>Industry *</Text>
          <TouchableOpacity style={styles.selectorButton} onPress={() => setModalVisible(true)}>
            <Text style={{ color: industry ? '#1E293B' : '#94A3B8', fontSize: 16 }}>
              {industry || "Select Industry"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* 3. LOCATION */}
        <View style={styles.section}>
          <Text style={styles.label}>Location (City) *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#64748B" style={{marginRight: 10}}/>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Prishtinë, Mitrovicë" 
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* 4. WEBSITE */}
        <View style={styles.section}>
          <Text style={styles.label}>Website / Social Link</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="globe" size={20} color="#64748B" style={{marginRight: 10}}/>
            <TextInput 
              style={styles.input} 
              placeholder="https://..." 
              autoCapitalize="none"
              value={website}
              onChangeText={setWebsite}
            />
          </View>
        </View>

        {/* 5. DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.label}>About the Company *</Text>
          <TextInput 
            style={[styles.textArea]} 
            placeholder="Tell students about your company culture and what you do..." 
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Complete Setup</Text>}
        </TouchableOpacity>

      </ScrollView>

      {/* --- INDUSTRY SELECTION MODAL --- */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Industry</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#2563EB', fontSize: 16, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={INDUSTRIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setIndustry(item); setModalVisible(false); }}
              >
                <Text style={[styles.modalItemText, industry === item && { color: '#2563EB', fontWeight: 'bold' }]}>
                  {item}
                </Text>
                {industry === item && <Ionicons name="checkmark" size={24} color="#2563EB" />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 24, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },
  scrollContent: { padding: 24 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 50 },
  input: { flex: 1, fontSize: 16, color: '#1E293B' },
  
  selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 50 },
  
  textArea: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', height: 120, textAlignVertical: 'top' },

  saveButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemText: { fontSize: 16, color: '#334155' }
});