import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // <--- E RËNDËSISHME
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importojmë ekranet
import MainLayout from './screens/MainLayout';
import LoginScreen from './screens/LoginScreen';
import JobDetailsScreen from './screens/JobDetailsScreen'; // <--- E shtuam këtë

const Stack = createNativeStackNavigator();

const MainApp = () => {
  const { user, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 2. User i Loguar & Verifikuar
  if (user && user.emailVerified) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 'Main' përmban Tabet (Home, Applications, Profile) */}
        <Stack.Screen name="Main" component={MainLayout} />
        
        {/* 'JobDetails' hapet SIPËR tabeve kur klikon një punë */}
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      </Stack.Navigator>
    );
  }

  // 3. User i pa loguar
  return <LoginScreen />;
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