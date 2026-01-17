import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase'; // ✅ Saktë
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [role, setRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = { primary: '#2563EB', background: '#F8F9FA', text: '#1E293B', subText: '#64748B', inputBg: '#F1F5F9' };

  useEffect(() => {
    setEmail('');
    setPassword('');
    setLoading(false);
  }, [isRegistering]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Kujdes", "Ju lutem plotësoni fushat.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // --- REGJISTRIMI ---

        // 1. Kontrolli i domenit
        if (role === 'student' && !email.trim().toLowerCase().endsWith('@umib.net')) {
          setLoading(false);
          Alert.alert("Gabim", "Studentët duhet të kenë email zyrtar (@umib.net).");
          return;
        }

        // 2. Krijo Userin
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Ruaj në Database
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date(),
          isProfileComplete: false
        });

        // 4. Dërgo Emailin (e mbrojtur që të mos bllokohet)
        try {
          await sendEmailVerification(user);
        } catch (emailErr) {
          console.log("Email error:", emailErr);
          // Vazhdojmë edhe nëse emaili dështon momentalisht
        }

        // 5. NDALO LOAD & BEJ LOGOUT
        setLoading(false);

        // Bëjmë logout manualisht këtu pasi kemi mbaruar punë
        await signOut(auth);

        Alert.alert(
          "Llogaria u krijua! 📧",
          `Një email verifikimi u dërgua në ${email}.\nKontrolloni Inbox ose Spam dhe klikoni linkun.`,
          [{ text: "OK", onPress: () => setIsRegistering(false) }]
        );

      } else {
        // --- LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await user.reload(); // Rifresko statusin e userit

        if (!user.emailVerified) {
          setLoading(false);
          await signOut(auth); // E nxjerrim jashtë
          Alert.alert(
            "E pa verifikuar",
            "Ju lutem verifikoni emailin tuaj para se të hyni.",
            [{ text: "OK" }]
          );
          return;
        }

        // Hyrja me sukses
        setLoading(false);
      }

    } catch (error) {
      setLoading(false);
      console.error("AUTH Error:", error);

      let msg = error.message;
      if (msg.includes("email-already-in-use")) msg = "Kjo email adresë është e zënë.";
      if (msg.includes("wrong-password")) msg = "Fjalëkalim i gabuar.";
      if (msg.includes("user-not-found")) msg = "Përdoruesi nuk u gjet.";

      Alert.alert("Gabim", msg);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>SkillCast</Text>
            <Text style={[styles.tagline, { color: colors.subText }]}>
              {isRegistering ? "Krijo llogari të re" : "Hyni në llogari"}
            </Text>
          </View>

          {isRegistering && (
            <View style={styles.roleContainer}>
              <TouchableOpacity style={[styles.roleCard, role === 'student' ? { borderColor: colors.primary, backgroundColor: '#EFF6FF' } : { borderColor: 'transparent' }]} onPress={() => setRole('student')}>
                <Ionicons name="school" size={24} color={role === 'student' ? colors.primary : '#64748B'} />
                <Text style={[styles.roleText, { color: role === 'student' ? colors.primary : colors.subText }]}>Student</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.roleCard, role === 'employer' ? { borderColor: colors.primary, backgroundColor: '#EFF6FF' } : { borderColor: 'transparent' }]} onPress={() => setRole('employer')}>
                <Ionicons name="briefcase" size={24} color={role === 'employer' ? colors.primary : '#64748B'} />
                <Text style={[styles.roleText, { color: role === 'employer' ? colors.primary : colors.subText }]}>Employer</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="mail-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
              <TextInput
                placeholder={role === 'student' && isRegistering ? "email@umib.net" : "Email"}
                placeholderTextColor={colors.subText}
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Fjalëkalimi"
                placeholderTextColor={colors.subText}
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.primary }]} onPress={handleAuth} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>{isRegistering ? "Regjistrohu" : "Hyni"}</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={{ color: colors.subText }}>
                {isRegistering ? "Keni llogari? " : "Nuk keni llogari? "}
                <Text
                  style={{ color: colors.primary, fontWeight: 'bold' }}
                  onPress={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "Hyni" : "Regjistrohuni"}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  appName: { fontSize: 28, fontWeight: '800' },
  tagline: { fontSize: 16, marginTop: 4 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleCard: { flex: 0.48, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 2, shadowOpacity: 0.05 },
  roleText: { fontWeight: '700', marginTop: 8 },
  formContainer: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, shadowOpacity: 0.05, elevation: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 16 },
  input: { flex: 1, fontSize: 16 },
  loginButton: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, elevation: 4 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 }
});