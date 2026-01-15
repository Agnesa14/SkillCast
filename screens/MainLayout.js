import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import ApplicationsScreen from './ApplicationsScreen';

const Tab = createBottomTabNavigator();

export default function MainLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true, // E KTHYEM TEKSTIN
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 65, // Lartësia ok për ikonë + tekst
          paddingBottom: 8, // Hapësirë që teksti mos të prekë fundin
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2563EB', // Bluja jonë zyrtare
        tabBarInactiveTintColor: '#94A3B8', // Gri moderne
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: -2, // E afron pak tekstin me ikonën
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Applications') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Jobs' }} // Më mirë "Jobs" se "Home" për kontekst
      />
      <Tab.Screen 
        name="Applications" 
        component={ApplicationsScreen} 
        options={{ title: 'Applications' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}