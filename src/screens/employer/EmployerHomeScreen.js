import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Rruga e saktë
import { Ionicons } from '@expo/vector-icons';

export default function EmployerHomeScreen({ navigation }) {
    const { logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Employer Dashboard</Text>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Welcome back!</Text>
                <Text style={styles.desc}>Manage your job postings and applications here.</Text>

                {/* Butoni për të postuar punë */}
                <TouchableOpacity 
                    style={styles.card} 
                    onPress={() => navigation.navigate('PostJob')}
                >
                    <View style={styles.iconBox}>
                        <Ionicons name="add-circle" size={32} color="#2563EB" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Post a New Job</Text>
                        <Text style={styles.cardDesc}>Find new talent easily</Text>
                    </View>
                </TouchableOpacity>

                {/* Këtu më vonë shtojmë listën e aplikimeve */}
                <View style={[styles.card, { marginTop: 20, opacity: 0.5 }]}>
                    <View style={styles.iconBox}>
                        <Ionicons name="people" size={32} color="#64748B" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>View Applications</Text>
                        <Text style={styles.cardDesc}>Coming soon...</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, backgroundColor: '#FFF' },
    title: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
    content: { padding: 24 },
    subtitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    desc: { fontSize: 16, color: '#64748B', marginBottom: 32 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 16, gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    cardDesc: { fontSize: 14, color: '#64748B' }
});