import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Alert, ActivityIndicator,
  Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  sendPasswordResetEmail,
  updateProfile // We need this to store the role temporarily in the Auth object
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import { auth, db } from '../../config/firebase'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [role, setRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const colors = { 
    primary: '#2563EB', 
    background: '#F8F9FA', 
    text: '#1E293B', 
    subText: '#64748B', 
    inputBg: '#F1F5F9' 
  };

  // 1. Clear fields when toggling Login / Sign Up
  useEffect(() => {
    setEmail('');
    setPassword('');
    setLoading(false);
  }, [isRegistering]);

  // 2. Clear fields when toggling Student / Employer
  const switchRole = (newRole) => {
    if (role !== newRole) {
      setRole(newRole);
      setEmail('');     
      setPassword('');  
      Keyboard.dismiss();
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Attention", "Please enter your email address first to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Email Sent", "A password reset link has been sent to your email. Please check your inbox.");
    } catch (error) {
      Alert.alert("Error", "Could not send reset email. Please ensure the email is correct.");
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Attention", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss(); 

    try {
      if (isRegistering) {
        // ==========================================
        //         REGISTRATION LOGIC
        // ==========================================
        
        // 1. Password Strength Validation
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        if (password.length < 6 || !hasUpperCase || !hasNumber) {
            setLoading(false);
            Alert.alert(
                "Weak Password", 
                "Password must be at least 6 characters long and contain at least one uppercase letter and one number."
            );
            return;
        }

        // 2. Student Domain Validation
        if (role === 'student' && !email.trim().toLowerCase().endsWith('@umib.net')) {
          setLoading(false);
          Alert.alert("Access Denied", "Students must use an official university email (@umib.net).");
          return;
        }

        // 3. Create User in AUTH only (NOT Database yet)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // CRITICAL: We save the role in the 'displayName' of the Auth user.
        // We do NOT write to the 'users' collection in Firestore yet.
        await updateProfile(user, { displayName: role });

        // 4. Send Verification Email
        try {
          await sendEmailVerification(user);
        } catch (emailErr) {
          console.log("Error sending email:", emailErr);
        }

        // 5. Sign Out immediately so they can't access the app
        await signOut(auth);
        setLoading(false);

        // 6. Show Alert (Changed text as requested)
        Alert.alert(
          "Verification Email Sent 📧",
          `We have sent a link to ${email}.\n\nPlease click the link to activate your account. You cannot log in until verified.`,
          [{ text: "OK", onPress: () => setIsRegistering(false) }]
        );

      } else {
        // ==========================================
        //             LOGIN LOGIC
        // ==========================================
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Force a reload to check if they just clicked the link
        await user.reload(); 

        // 1. Check if Email is Verified
        if (!user.emailVerified) {
          setLoading(false);
          await signOut(auth); // Kick them out if not verified
          Alert.alert(
            "Account Not Active",
            "Your email is not verified yet. Please check your inbox and click the activation link.",
            [{ text: "OK" }]
          );
          return;
        }

        // 2. NOW we check/create the Database Record
        // This code runs ONLY if the user IS verified.
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // This is the FIRST time the verified user is logging in.
            // Now we finally create the database entry.
            
            const savedRole = user.displayName || 'student'; // Retrieve role from Auth Profile

            await setDoc(userDocRef, {
                email: user.email,
                role: savedRole,
                createdAt: serverTimestamp(),
                isProfileComplete: false,
                uid: user.uid
            });
        }

        setLoading(false);
        // Login successful - App will navigate automatically
      }

    } catch (error) {
      setLoading(false);
      
      let msg = "Something went wrong. Please try again.";
      const errorCode = error.code;

      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        msg = "Invalid Email or Password.";
      } else if (errorCode === 'auth/email-already-in-use') {
        msg = "This email is already registered.";
      } else if (errorCode === 'auth/too-many-requests') {
        msg = "Too many attempts. Please try again later.";
      } else if (errorCode === 'auth/invalid-email') {
        msg = "The email address is badly formatted.";
      }

      Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.content}>
            
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="flash" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.appName, { color: colors.primary }]}>SkillCast</Text>
              <Text style={[styles.tagline, { color: colors.subText }]}>
                {isRegistering ? "Create a new account" : "Welcome back"}
              </Text>
            </View>

            {isRegistering && (
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleCard, role === 'student' ? { borderColor: colors.primary, backgroundColor: '#EFF6FF' } : { borderColor: 'transparent' }]} 
                  onPress={() => switchRole('student')}
                >
                  <Ionicons name="school" size={24} color={role === 'student' ? colors.primary : '#64748B'} />
                  <Text style={[styles.roleText, { color: role === 'student' ? colors.primary : colors.subText }]}>Student</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.roleCard, role === 'employer' ? { borderColor: colors.primary, backgroundColor: '#EFF6FF' } : { borderColor: 'transparent' }]} 
                  onPress={() => switchRole('employer')}
                >
                  <Ionicons name="briefcase" size={24} color={role === 'employer' ? colors.primary : '#64748B'} />
                  <Text style={[styles.roleText, { color: role === 'employer' ? colors.primary : colors.subText }]}>Employer</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="mail-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder={role === 'student' && isRegistering ? "name@umib.net" : "Email"}
                  placeholderTextColor={colors.subText}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current.focus()}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {isRegistering && role === 'student' && (
                 <Text style={styles.helperText}>
                   * Official university email required (@umib.net)
                 </Text>
              )}

              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, marginTop: 16 }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={{ marginRight: 10 }} />
                <TextInput
                  ref={passwordRef}
                  placeholder="Password"
                  placeholderTextColor={colors.subText}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.subText} />
                </TouchableOpacity>
              </View>

              {!isRegistering && (
                <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: 20 }}>
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 20 }} />

              <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.primary }]} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>{isRegistering ? "Sign Up" : "Log In"}</Text>}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={{ color: colors.subText }}>
                  {isRegistering ? "Have an account? " : "Don't have an account? "}
                  <Text
                    style={{ color: colors.primary, fontWeight: 'bold' }}
                    onPress={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering ? "Log In" : "Sign Up"}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 50 },
  input: { flex: 1, fontSize: 16 },
  helperText: { fontSize: 12, color: '#64748B', marginTop: 6, marginLeft: 4, fontStyle: 'italic' },
  loginButton: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, elevation: 4 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 }
});