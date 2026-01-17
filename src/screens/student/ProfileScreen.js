import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';

const STUDENT = {
    name: auth.currentUser?.displayName || "Agnesa Student",
    university: "Universiteti i Prishtinës",
    major: "Computer Science & Engineering",
    bio: "Aspiring Mobile Developer passionate about React Native and UI Design. Building things that matter.",
    location: "Prishtinë, Kosovë",
    github: "https://github.com",
    linkedin: "https://linkedin.com",

    skills: ["React Native", "JavaScript", "Firebase", "Figma", "Git", "Python", "UI/UX"],

    projects: [
        {
            id: 1,
            title: "Weather App",
            description: "Real-time weather tracking with geolocation and live updates.",
            tech: ["React Native", "API"],
            image: "https://cdn.dribbble.com/users/1615584/screenshots/14637278/media/e13ba3764646456c36352d53016fb0e0.jpg",
            githubLink: "https://github.com",
            demoLink: null
        },
        {
            id: 2,
            title: "Fashion E-Commerce",
            description: "Modern shopping app with cart, favorites, and payment integration.",
            tech: ["React", "Node.js"],
            image: "https://cdn.dribbble.com/users/2401147/screenshots/15567995/media/6991505e1c8f02138566e38392c41505.png",
            githubLink: "https://github.com",
            demoLink: "https://youtube.com"
        },
        {
            id: 3,
            title: "Task Master",
            description: "A productivity app to organize daily tasks and boost efficiency.",
            tech: ["Flutter", "Firebase"],
            image: "https://cdn.dribbble.com/users/702789/screenshots/14053258/media/501944935a57637b694050114c347640.png",
            githubLink: "https://github.com",
            demoLink: null
        },
        {
            id: 4,
            title: "Crypto Tracker",
            description: "Live cryptocurrency prices and portfolio management.",
            tech: ["React Native", "CoinGecko API"],
            image: "https://cdn.dribbble.com/users/5031392/screenshots/15467626/media/26dd22806326bb6f1113001125b807e0.png",
            githubLink: "https://github.com",
            demoLink: null
        },
        {
            id: 5,
            title: "Healthy Recipes",
            description: "Find delicious recipes based on ingredients you have.",
            tech: ["React", "Spoonacular API"],
            image: "https://cdn.dribbble.com/users/1615584/screenshots/15710309/media/9d67ba5b9bc65ae64b77a72d3f66c0b3.jpg",
            githubLink: "https://github.com",
            demoLink: null
        },
        {
            id: 6,
            title: "FitnessPal Clone",
            description: "Workout tracker and calorie counter application.",
            tech: ["Swift", "HealthKit"],
            image: "https://cdn.dribbble.com/users/2064121/screenshots/16301138/media/131464303f721e8d4793f0648c081373.png",
            githubLink: "https://github.com",
            demoLink: null
        }
    ],

    certificates: [
        { title: "React Native Bootcamp", issuer: "Udemy", date: "Jan 2024" },
        { title: "Advanced CSS & Sass", issuer: "Coursera", date: "Dec 2023" },
        { title: "UX Design Fundamentals", issuer: "Google", date: "Nov 2023" }
    ]
};

export default function ProfileScreen({ navigation }) {

    const openLink = (url) => {
        if (url) Linking.openURL(url);
    };

    const handleLogout = () => {
        auth.signOut().catch(err => console.log(err));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg" }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{STUDENT.name}</Text>
                    <Text style={styles.uni}>{STUDENT.major} @ {STUDENT.university}</Text>

                    <View style={styles.locationTag}>
                        <Ionicons name="location-sharp" size={14} color="#64748B" />
                        <Text style={styles.locationText}>{STUDENT.location}</Text>
                    </View>

                    <Text style={styles.bioText}>{STUDENT.bio}</Text>

                    <View style={styles.socialRow}>
                        {Boolean(STUDENT.github) && (
                            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(STUDENT.github)}>
                                <Ionicons name="logo-github" size={20} color="#333" />
                            </TouchableOpacity>
                        )}
                        {Boolean(STUDENT.linkedin) && (
                            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(STUDENT.linkedin)}>
                                <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.socialBtn}>
                            <Ionicons name="mail" size={20} color="#EA4335" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- SKILLS --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillsContainer}>
                        {STUDENT.skills.map((skill, index) => (
                            <View key={index} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* --- HORIZONTAL PROJECTS --- */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={styles.sectionTitle}>Featured Projects 🚀</Text>
                        <Text style={{ color: '#2563EB', fontSize: 12 }}>Scroll ➝</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                        {STUDENT.projects.map((project) => (
                            <View key={project.id} style={styles.projectCardHorizontal}>
                                <View style={{ backgroundColor: '#F1F5F9' }}>
                                    <Image
                                        source={{ uri: project.image }}
                                        style={styles.projectImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.projectContent}>
                                    <Text style={styles.projectTitle} numberOfLines={1}>{project.title}</Text>
                                    <Text style={styles.projectDesc} numberOfLines={2}>{project.description}</Text>

                                    <View style={styles.techRow}>
                                        {project.tech.slice(0, 2).map((t, i) => (
                                            <Text key={i} style={styles.techText}>#{t}</Text>
                                        ))}
                                        {project.tech.length > 2 && <Text style={styles.techText}>+{project.tech.length - 2}</Text>}
                                    </View>

                                    <View style={styles.projectLinks}>
                                        {Boolean(project.githubLink) && (
                                            <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(project.githubLink)}>
                                                <Ionicons name="code-slash" size={14} color="#2563EB" />
                                                <Text style={styles.linkText}>Code</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* --- CERTIFICATES --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    {STUDENT.certificates.map((cert, index) => (
                        <View key={index} style={styles.certRow}>
                            <View style={styles.certIcon}>
                                <Ionicons name="ribbon-outline" size={24} color="#F59E0B" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.certTitle}>{cert.title}</Text>
                                <Text style={styles.certIssuer}>{cert.issuer} • {cert.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* --- LOGOUT --- */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 20 },

    header: { alignItems: 'center', marginBottom: 24, backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2 },
    avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
    name: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    uni: { fontSize: 14, color: '#64748B', marginBottom: 4 },
    locationTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    locationText: { fontSize: 13, color: '#64748B', marginLeft: 4 },

    bioText: { textAlign: 'center', fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16, paddingHorizontal: 10, fontStyle: 'italic' },

    socialRow: { flexDirection: 'row', gap: 12 },
    socialBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    skillBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
    skillText: { color: '#2563EB', fontSize: 13, fontWeight: '500' },

    projectCardHorizontal: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        width: 240,
        marginRight: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden'
    },
    projectImage: { width: '100%', height: 130 },
    projectContent: { padding: 12 },
    projectTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    projectDesc: { fontSize: 13, color: '#64748B', marginBottom: 8, height: 36 },
    techRow: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
    techText: { fontSize: 11, color: '#94A3B8', fontWeight: '600', backgroundColor: '#F8F9FA', paddingHorizontal: 4, borderRadius: 4 },

    projectLinks: { flexDirection: 'row', alignItems: 'center' },
    linkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    linkText: { fontSize: 12, fontWeight: '600', color: '#2563EB', marginLeft: 4 },

    certRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9', marginTop: 8 },
    certIcon: { width: 36, height: 36, backgroundColor: '#FFFBEB', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    certTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    certIssuer: { fontSize: 12, color: '#64748B' },

    logoutButton: { backgroundColor: '#FFF1F2', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#FECDD3' },
    logoutText: { color: '#E11D48', fontWeight: '700', fontSize: 16 },
});