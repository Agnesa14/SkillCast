import React, { useEffect, useState } from 'react';
import { Platform, Keyboard } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; // ✅ Sigurohu për path-in

// Importojmë ekranet
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import ApplicationsScreen from './ApplicationsScreen';

const Tab = createBottomTabNavigator();

export default function MainLayout() {
    const [applicationCount, setApplicationCount] = useState(0);
    const user = auth.currentUser;

    // 1. Logjika "Senior": Live Badge Counter
    // Dëgjon në kohë reale sa aplikime ka bërë studenti
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "applications"),
            where("studentId", "==", user.uid)
        );

        // onSnapshot dëgjon çdo ndryshim në databazë
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setApplicationCount(snapshot.size); // Përditëson numrin te ikona
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true, // ✅ Mshef menunë kur hapet tastiera (UX Pro)
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 10, // Për Android
                    shadowColor: '#000', // Për iOS
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    height: Platform.OS === 'ios' ? 85 : 65, // Rregullim për iPhone X+
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: -2,
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
                options={{ title: 'Jobs' }}
            />
            
            <Tab.Screen
                name="Applications"
                component={ApplicationsScreen}
                options={{ 
                    title: 'Applications',
                    // ✅ MARKET-READY: Tregon numrin e aplikimeve mbi ikonë
                    tabBarBadge: applicationCount > 0 ? applicationCount : null,
                    tabBarBadgeStyle: { 
                        backgroundColor: '#EF4444', 
                        fontSize: 12,
                        fontWeight: 'bold' 
                    }
                }}
            />
            
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}