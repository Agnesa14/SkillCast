import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform // ✅ SHTUAR
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase'; 

// --- PREDEFINED PROFESSIONAL SKILLS DATA ---
const PREDEFINED_SKILLS = [
  "JavaScript", "Python", "React Native", "Java", "C#", "SQL", "Figma", "Photoshop", "Excel",
  "Data Analysis", "Machine Learning", "Cybersecurity", "Networking",
  "AutoCAD", "Civil Engineering", "Electrical Engineering", "Matlab", "Robotics",
  "Accounting", "Marketing", "Project Management", "Public Speaking", "Sales", "HR Management",
  "Teamwork", "Leadership", "Communication", "Problem Solving", "Time Management",
  "English", "German", "French", "Spanish"
];

export default function CompleteStudentProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState(''); 
  const [about, setAbout] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  // Skills State
  const [skills, setSkills] = useState([]); 
  const [isSkillModalVisible, setSkillModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- SKILL LOGIC ---
  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill)); 
    } else {
      if (skills.length >= 10) {
        Alert.alert("Limit Reached", "You can select up to 10 skills.");
        return;
      }
      setSkills([...skills, skill]); 
    }
  };

  const addCustomSkill = () => {
    if (searchQuery.trim().length > 0) {
      const newSkill = searchQuery.trim();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
        setSearchQuery('');
        setSkillModalVisible(false);
      }
    }
  };

  const filteredSkills = PREDEFINED_SKILLS.filter(skill => 
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- SAVE PROFILE LOGIC ---
  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !headline || skills.length === 0) {
      Alert.alert("Missing Information", "Please fill in Name, Headline, and at least one Skill.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`, 
        headline: headline.trim(),
        about: about.trim(),
        portfolioUrl: portfolioUrl.trim(),
        skills: skills,
        isProfileComplete: true, 
      });

      // Shpresojmë që AuthContext ta kapë ndryshimin automatikisht
      Alert.alert("Success", "Profile Updated!", [{ text: "OK" }]);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ FIX: KeyboardAvoidingView për të mos mbuluar fushat */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Help employers find you by adding your details.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* 1. PERSONAL INFO */}
            <View style={styles.section}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.row}>
                <TextInput 
                style={[styles.input, { flex: 1, marginRight: 10 }]} 
                placeholder="First Name" 
                value={firstName}
                onChangeText={setFirstName}
                />
                <TextInput 
                style={[styles.input, { flex: 1 }]} 
                placeholder="Last Name" 
                value={lastName}
                onChangeText={setLastName}
                />
            </View>
            </View>

            {/* 2. HEADLINE */}
            <View style={styles.section}>
            <Text style={styles.label}>Headline *</Text>
            <TextInput 
                style={styles.input} 
                placeholder="e.g. CS Student | React Developer" 
                value={headline}
                onChangeText={setHeadline}
            />
            <Text style={styles.helperText}>A short professional title.</Text>
            </View>

            {/* 3. SKILLS */}
            <View style={styles.section}>
            <Text style={styles.label}>Skills *</Text>
            <View style={styles.skillsContainer}>
                {skills.map((skill, index) => (
                <TouchableOpacity key={index} style={styles.selectedSkillChip} onPress={() => toggleSkill(skill)}>
                    <Text style={styles.selectedSkillText}>{skill}</Text>
                    <Ionicons name="close-circle" size={16} color="#FFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={styles.addSkillButton} onPress={() => setSkillModalVisible(true)}>
                <Ionicons name="add" size={20} color="#2563EB" />
                <Text style={{ color: '#2563EB', fontWeight: '600' }}>Add Skill</Text>
                </TouchableOpacity>
            </View>
            </View>

            {/* 4. ABOUT */}
            <View style={styles.section}>
            <Text style={styles.label}>About Me</Text>
            <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="Tell employers about your goals and background..." 
                multiline
                value={about}
                onChangeText={setAbout}
            />
            </View>

            {/* 5. LINKS */}
            <View style={styles.section}>
            <Text style={styles.label}>Portfolio / GitHub / LinkedIn</Text>
            <TextInput 
                style={styles.input} 
                placeholder="https://..." 
                autoCapitalize="none"
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
            />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Complete Profile</Text>}
            </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- SKILLS MODAL --- */}
      <Modal visible={isSkillModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Skills</Text>
            <TouchableOpacity onPress={() => setSkillModalVisible(false)}>
              <Text style={{ color: '#2563EB', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search skills (e.g. Java, Accounting)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredSkills}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.skillOption} onPress={() => toggleSkill(item)}>
                <Text style={styles.skillOptionText}>{item}</Text>
                {skills.includes(item) && <Ionicons name="checkmark-circle" size={24} color="#2563EB" />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#64748B', marginBottom: 10 }}>No standard skill found for "{searchQuery}"</Text>
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.customSkillButton} onPress={addCustomSkill}>
                    <Text style={styles.customSkillText}>+ Add "{searchQuery}" as custom skill</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  // ✅ UPDATE: Added padding bottom to avoid keyboard overlap issues
  scrollContent: { padding: 24, paddingBottom: 100 }, 
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  row: { flexDirection: 'row' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B' },
  helperText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedSkillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  selectedSkillText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  addSkillButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#2563EB', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 4 },

  saveButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  modalContainer: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, paddingHorizontal: 12, height: 50, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  skillOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
  skillOptionText: { fontSize: 16, color: '#1E293B' },
  customSkillButton: { backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, alignItems: 'center' },
  customSkillText: { color: '#2563EB', fontWeight: '700' }
});