import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// KUJDES: AuthContext është brenda src/contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// --- IMPORTET E REJA (Sipas folderave që krijuam) ---

// 1. Auth (Login) - Tani ndodhet te src/screens/auth/
import LoginScreen from './src/screens/auth/LoginScreen';

// 2. Student Screens - Tani ndodhen te src/screens/student/
import MainLayout from './src/screens/student/MainLayout';
import JobDetailsScreen from './src/screens/student/JobDetailsScreen';

// 3. Employer Screens - Tani ndodhen te src/screens/employer/
import EmployerHomeScreen from './src/screens/employer/EmployerHomeScreen';
import PostJobScreen from './src/screens/employer/PostJobScreen';

const Stack = createNativeStackNavigator();

const MainApp = () => {
  // Marrim userin dhe rolin nga AuthContext
  const { user, userRole, loading } = useAuth();

  // 1. Loading State (sa kohë presim Firebase-in)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 2. Nëse useri NUK është i loguar -> Shfaq Login
  if (!user) {
    return <LoginScreen />;
  }

  // 3. Nëse është EMPLOYER -> Shfaq panelin e Punëdhënësit
  if (userRole === 'employer') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="EmployerHome" component={EmployerHomeScreen} />
        <Stack.Screen name="PostJob" component={PostJobScreen} />
        {/* E lëmë JobDetails edhe këtu, nëse employer do të shohë si duket puna */}
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      </Stack.Navigator>
    );
  }

  // 4. Nëse është STUDENT (ose Default) -> Shfaq panelin e Studentit
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 'Main' përmban Tabet (Home, Applications, Profile) */}
      <Stack.Screen name="Main" component={MainLayout} />
      
      {/* 'JobDetails' hapet SIPËR tabeve kur klikon një punë */}
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