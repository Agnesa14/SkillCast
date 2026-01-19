import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; 

// Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// --- SCREENS IMPORT ---

// 1. Auth
import LoginScreen from './src/screens/auth/LoginScreen';

// 2. Profile Completion (NEW ✅)
import CompleteStudentProfileScreen from './src/screens/student/CompleteStudentProfileScreen';
import CompleteEmployerProfileScreen from './src/screens/employer/CompleteEmployerProfileScreen';

// 3. Student Screens
import MainLayout from './src/screens/student/MainLayout';
import JobDetailsScreen from './src/screens/student/JobDetailsScreen';

// 4. Employer Screens
import EmployerHomeScreen from './src/screens/employer/EmployerHomeScreen';
import PostJobScreen from './src/screens/employer/PostJobScreen';
import JobApplicantsScreen from './src/screens/employer/JobApplicantsScreen';

const Stack = createNativeStackNavigator();

const MainApp = () => {
  // ✅ UPDATE: Added 'userData' to check isProfileComplete
  const { user, userRole, loading, userData } = useAuth();

  // 1. Loading State (Branded Splash Screen)
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoBox}>
            <Ionicons name="flash" size={50} color="#2563EB" />
        </View>
        <Text style={styles.loadingText}>SkillCast</Text>
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 24 }} />
      </View>
    );
  }

  // 2. CHECK LOGIN & VERIFICATION STATUS
  // If user is not logged in OR email is not verified, show LoginScreen.
  if (!user || !user.emailVerified) {
    return <LoginScreen />;
  }

  // 3. CHECK PROFILE COMPLETION (NEW LOGIC ✅)
  // Nëse useri është i verifikuar, por nuk e ka profilin e plotësuar:
  if (userData && userData.isProfileComplete === false) {
      if (userRole === 'student') {
          // Shfaq formën për Studentin pa Navigation Stack (Force Mode)
          return <CompleteStudentProfileScreen />;
      } else {
          // ✅ Tani shfaqim formën e Employerit sepse është krijuar
          return <CompleteEmployerProfileScreen />;
      }
  }

  // ---------------------------------------------------------
  // If we reach here: User is Logged In, Verified AND Profile is Complete ✅
  // ---------------------------------------------------------

  // 4. Employer Navigation Flow
  if (userRole === 'employer') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="EmployerHome" component={EmployerHomeScreen} />
        <Stack.Screen name="PostJob" component={PostJobScreen} />
        {/* Allows Employer to preview job details */}
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
        
        {/* Applicants Screen */}
        <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
      </Stack.Navigator>
    );
  }

  // 5. Student Navigation Flow (Default)
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 'Main' contains the Tabs (Home, Applications, Profile) */}
      <Stack.Screen name="Main" component={MainLayout} />
      
      {/* 'JobDetails' opens on top of tabs when a job is clicked */}
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', 
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  loadingText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 1
  }
});