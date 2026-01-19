import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Linking, FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase'; 

// Lista e paracaktuar e skills për sugjerim
const SUGGESTED_SKILLS = [
  "React Native", "JavaScript", "Python", "Node.js", "Figma", 
  "UI/UX", "Firebase", "SQL", "Git", "Java", "C#", "Flutter"
];

// Ngjyra pastel për cover-at e projekteve (për bukuri vizuale)
const PROJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- USER DATA ---
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  
  // --- SKILLS LOGIC (NEW 🧠) ---
  const [skillsArray, setSkillsArray] = useState([]);
  const [skillInput, setSkillInput] = useState(''); // Për kërkim/shtim

  // --- PROJECTS STATE ---
  const [projects, setProjects] = useState([]); 
  const [isProjectModalVisible, setProjectModalVisible] = useState(false);
  
  const [newProject, setNewProject] = useState({
    title: '', desc: '', tech: '', demoLink: '', repoLink: ''
  });

  const user = auth.currentUser;

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.displayName || '');
        setHeadline(data.headline || '');
        setAbout(data.about || '');
        setSkillsArray(Array.isArray(data.skills) ? data.skills : []);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE PROFILE ---
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: name.trim(),
        headline: headline.trim(),
        about: about.trim(),
        skills: skillsArray,
        updatedAt: new Date(),
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully! 🚀");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // --- SKILLS HANDLERS ---
  const addSkill = (skill) => {
    if (!skillsArray.includes(skill)) {
      setSkillsArray([...skillsArray, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setSkillsArray(skillsArray.filter(skill => skill !== skillToRemove));
  };

  // --- PROJECT HANDLERS ---
  const handleAddProject = async () => {
    if (!newProject.title || !newProject.desc) {
      Alert.alert("Missing Info", "Title and Description are required.");
      return;
    }

    // Zgjedhim një ngjyrë random për cover
    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];

    const projectItem = {
      id: Date.now().toString(),
      title: newProject.title,
      desc: newProject.desc,
      tech: newProject.tech,
      demoLink: newProject.demoLink,
      repoLink: newProject.repoLink,
      color: randomColor // Ruajmë ngjyrën për konsistencë
    };

    const updatedProjects = [projectItem, ...projects]; // Add to top
    setProjects(updatedProjects);
    
    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { projects: updatedProjects });
        setProjectModalVisible(false);
        setNewProject({ title: '', desc: '', tech: '', demoLink: '', repoLink: '' });
    } catch (e) {
        Alert.alert("Error", "Could not save project.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    Alert.alert("Delete Project", "Are you sure?", [
        { text: "Cancel" },
        { 
            text: "Delete", style: "destructive", 
            onPress: async () => {
                const updatedProjects = projects.filter(p => p.id !== projectId);
                setProjects(updatedProjects);
                await updateDoc(doc(db, "users", user.uid), { projects: updatedProjects });
            }
        }
    ]);
  };

  const openLink = (url) => {
    if (url) Linking.openURL(url).catch(err => console.error("Error", err));
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB"/></View>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>Make it shine ✨</Text>
            </View>
            <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* --- MAIN PROFILE CARD --- */}
          <View style={styles.card}>
            <View style={styles.profileHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0)}</Text></View>
                <View style={{flex:1}}>
                    {isEditing ? (
                        <>
                            <TextInput style={styles.editInput} value={name} onChangeText={setName} placeholder="Full Name"/>
                            <TextInput style={styles.editInput} value={headline} onChangeText={setHeadline} placeholder="Title (e.g. Junior Dev)"/>
                        </>
                    ) : (
                        <>
                            <Text style={styles.nameText}>{name}</Text>
                            <Text style={styles.headlineText}>{headline || "No headline yet"}</Text>
                        </>
                    )}
                </View>
                <TouchableOpacity onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)} style={styles.editBtn}>
                    <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>About Me</Text>
            {isEditing ? (
                <TextInput style={[styles.editInput, styles.textArea]} multiline value={about} onChangeText={setAbout} placeholder="Tell employers about yourself..."/>
            ) : (
                <Text style={styles.bodyText}>{about || "Add a short bio to introduce yourself."}</Text>
            )}

            {/* --- SKILLS SECTION (IMPROVED 🧠) --- */}
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>Skills</Text>
            
            <View style={styles.skillsWrapper}>
                {skillsArray.map((skill, index) => (
                    <TouchableOpacity key={index} style={styles.skillChip} onPress={() => isEditing && removeSkill(skill)}>
                        <Text style={styles.skillText}>{skill}</Text>
                        {isEditing && <Ionicons name="close-circle" size={16} color="#2563EB" style={{marginLeft: 4}}/>}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Skill Selector (Only when editing) */}
            {isEditing && (
                <View style={{marginTop: 10}}>
                    <View style={styles.skillInputContainer}>
                        <TextInput 
                            style={{flex:1}} 
                            placeholder="Add a skill (e.g. React)" 
                            value={skillInput}
                            onChangeText={setSkillInput}
                        />
                        <TouchableOpacity onPress={() => skillInput && addSkill(skillInput)}>
                            <Ionicons name="add-circle" size={28} color="#2563EB"/>
                        </TouchableOpacity>
                    </View>
                    {/* Suggestions */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
                        {SUGGESTED_SKILLS.filter(s => !skillsArray.includes(s)).map((s, i) => (
                            <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => addSkill(s)}>
                                <Text style={styles.suggestionText}>+ {s}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
          </View>

          {/* --- PROJECTS CAROUSEL (IMPROVED 🚀) --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.bigTitle}>Projects</Text>
            <TouchableOpacity onPress={() => setProjectModalVisible(true)}>
                <Text style={styles.addLink}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <TouchableOpacity style={styles.emptyProjectState} onPress={() => setProjectModalVisible(true)}>
                <Ionicons name="briefcase-outline" size={32} color="#CBD5E1"/>
                <Text style={styles.emptyText}>Add your first project</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
                {projects.map((project) => (
                    <View key={project.id} style={styles.projectCard}>
                        {/* Fake Cover Image / Header */}
                        <View style={[styles.projectCover, {backgroundColor: project.color || '#3B82F6'}]}>
                             <Ionicons name="laptop-outline" size={40} color="rgba(255,255,255,0.8)" />
                             {/* Delete Button absolute positioned */}
                             <TouchableOpacity style={styles.deleteProjectBtn} onPress={() => handleDeleteProject(project.id)}>
                                <Ionicons name="trash" size={16} color="#FFF"/>
                             </TouchableOpacity>
                        </View>
                        
                        <View style={styles.projectBody}>
                            <Text style={styles.projectTitle} numberOfLines={1}>{project.title}</Text>
                            <Text style={styles.projectDesc} numberOfLines={2}>{project.desc}</Text>
                            
                            {/* Tech Tags Mini */}
                            <View style={{flexDirection:'row', flexWrap:'wrap', gap: 4, marginBottom: 12}}>
                                {project.tech.split(',').slice(0,2).map((t, i) => (
                                    <View key={i} style={styles.miniTag}><Text style={styles.miniTagText}>{t.trim()}</Text></View>
                                ))}
                                {project.tech.split(',').length > 2 && <Text style={{fontSize:10, color:'#94A3B8'}}>...</Text>}
                            </View>

                            <View style={styles.projectActions}>
                                {project.demoLink ? (
                                    <TouchableOpacity style={[styles.btnSmall, {backgroundColor:'#0F172A'}]} onPress={() => openLink(project.demoLink)}>
                                        <Text style={styles.btnSmallText}>Demo</Text>
                                    </TouchableOpacity>
                                ) : <View style={{flex:1}}/>} 
                                
                                {project.repoLink && (
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => openLink(project.repoLink)}>
                                        <Ionicons name="logo-github" size={20} color="#0F172A"/>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
          )}
          
          <View style={{height: 40}} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL FOR NEW PROJECT --- */}
      <Modal visible={isProjectModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Project</Text>
                <TouchableOpacity onPress={()=>setProjectModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#64748B"/>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Project Name</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. E-Commerce App" value={newProject.title} onChangeText={(t)=>setNewProject({...newProject, title: t})} />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.modalInput, {height: 80, textAlignVertical:'top'}]} multiline placeholder="What problem does it solve?" value={newProject.desc} onChangeText={(t)=>setNewProject({...newProject, desc: t})} />

                <Text style={styles.inputLabel}>Tech Stack</Text>
                <TextInput style={styles.modalInput} placeholder="React, Node.js, MongoDB" value={newProject.tech} onChangeText={(t)=>setNewProject({...newProject, tech: t})} />

                <Text style={styles.inputLabel}>GitHub Link</Text>
                <TextInput style={styles.modalInput} autoCapitalize="none" placeholder="https://github.com/..." value={newProject.repoLink} onChangeText={(t)=>setNewProject({...newProject, repoLink: t})} />

                <Text style={styles.inputLabel}>Live Demo Link</Text>
                <TextInput style={styles.modalInput} autoCapitalize="none" placeholder="https://..." value={newProject.demoLink} onChangeText={(t)=>setNewProject({...newProject, demoLink: t})} />
                
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddProject}>
                    <Text style={styles.saveBtnText}>Save Project</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' }, // Pak më gri për kontrast
  scrollContent: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 14, color: '#64748B', fontWeight:'500' },
  logoutBtn: { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 12 },

  // Profile Card
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 30, shadowColor: '#64748B', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 26, fontWeight: '700' },
  nameText: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  headlineText: { fontSize: 14, color: '#64748B', marginTop: 2 },
  editBtn: { backgroundColor: '#2563EB', padding: 8, borderRadius: 20 },
  
  editInput: { borderBottomWidth: 1, borderColor: '#E2E8F0', paddingVertical: 6, fontSize: 15, color: '#0F172A', marginBottom: 4 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { fontSize: 15, color: '#334155', lineHeight: 22, marginTop: 6 },

  // Skills
  skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#DBEAFE' },
  skillText: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  skillInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, height: 44, marginTop: 10, borderWidth:1, borderColor:'#E2E8F0' },
  suggestionChip: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  suggestionText: { color: '#475569', fontSize: 12, fontWeight: '500' },

  // Project Carousel
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bigTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  addLink: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  
  carouselContent: { paddingRight: 20 }, // Spacing at end of scroll
  projectCard: { width: 260, backgroundColor: '#FFF', borderRadius: 20, marginRight: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  projectCover: { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  deleteProjectBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 12 },
  
  projectBody: { padding: 16 },
  projectTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  projectDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 12, height: 36 }, // Fixed height for alignment
  
  miniTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  miniTagText: { fontSize: 10, color: '#475569', fontWeight: '600' },

  projectActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
  btnSmall: { backgroundColor: '#0F172A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  btnSmallText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  iconBtn: { padding: 6, backgroundColor: '#F1F5F9', borderRadius: 10 },

  emptyProjectState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', gap: 10 },
  emptyText: { color: '#94A3B8', fontWeight: '600' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 16 },
  modalInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16 },
  saveBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});