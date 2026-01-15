import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ProfileScreen() {
  const user = auth.currentUser;

  // Këto janë aftësi shembull (Hardcoded) sa për të parë dizajnin.
  // Më vonë do t'i marrim nga Databaza (Firestore).
  const mySkills = ["Java", "React Native", "Communication", "English C1", "UI Design", "Teamwork"];

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error("Logout Error:", error);
            }
          }
        }
      ]
    );
  };

  const renderSkill = (skill, index) => (
    <View key={index} style={styles.skillBadge}>
      <Text style={styles.skillText}>{skill}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER: Avatar & Emri */}
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || "S"}
                </Text>
            </View>
            <Text style={styles.userName}>Agnesa Maxhuni</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleTag}>
                <Text style={styles.roleText}>Student @ UMIB</Text>
            </View>
        </View>

        <View style={styles.separator} />

        {/* SEKSIONI I AFTËSIVE (SKILLS) - Kërkesa jote kryesore */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Skills & Badges</Text>
                <TouchableOpacity>
                    <Ionicons name="create-outline" size={20} color="#2563EB" />
                </TouchableOpacity>
            </View>
            <View style={styles.skillsContainer}>
                {mySkills.map(renderSkill)}
                {/* Butoni për të shtuar skill të ri */}
                <TouchableOpacity style={[styles.skillBadge, styles.addSkillBadge]}>
                    <Ionicons name="add" size={16} color="#64748B" />
                    <Text style={[styles.skillText, { color: '#64748B' }]}>Add</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* STATUSI I VIDEO CV */}
        <View style={styles.videoCard}>
            <View style={styles.videoIconBg}>
                <Ionicons name="videocam" size={24} color="#FFF" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.videoTitle}>Video Introduction</Text>
                <Text style={styles.videoSubtitle}>Recorded • 00:30s</Text>
            </View>
            <TouchableOpacity>
                <Ionicons name="play-circle" size={32} color="#2563EB" />
            </TouchableOpacity>
        </View>

        {/* MENUJA DHE LOGOUT */}
        <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="document-text-outline" size={22} color="#1E293B" />
                <Text style={styles.menuText}>My CV / Resume</Text>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="settings-outline" size={22} color="#1E293B" />
                <Text style={styles.menuText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text style={[styles.menuText, { color: '#EF4444' }]}>Sign Out</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 24 },
  
  // Header Styles
  header: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 4, borderColor: '#FFF',
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#2563EB' },
  userName: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  roleTag: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },

  separator: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8, marginBottom: 24 },

  // Skills Styles
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  
  skillBadge: {
    backgroundColor: '#FFF',
    borderRadius: 25, // Rrumbullakimi i skills
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 3, elevation: 1
  },
  addSkillBadge: { backgroundColor: '#F1F5F9', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 4 },
  skillText: { color: '#334155', fontWeight: '600', fontSize: 14 },

  // Video Card Styles
  videoCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 5, elevation: 2
  },
  videoIconBg: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#2563EB',
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  videoTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  videoSubtitle: { fontSize: 13, color: '#10B981', fontWeight: '600' }, // Green for "Recorded"

  // Menu Styles
  menuContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuText: { flex: 1, fontSize: 16, marginLeft: 16, color: '#334155', fontWeight: '500' },
});