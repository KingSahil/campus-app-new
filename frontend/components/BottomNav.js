import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomNav({ activeTab = 'Dashboard' }) {
    const navigation = useNavigation();

    const navItems = [
        { 
            key: 'Dashboard', 
            icon: 'dashboard', 
            label: 'Dashboard',
            onPress: () => navigation.navigate('Dashboard')
        },
        { 
            key: 'Learning', 
            icon: 'school', 
            label: 'Learning',
            onPress: () => navigation.navigate('LearningHub')
        },
        { 
            key: 'Notices', 
            icon: 'notifications', 
            label: 'Notices',
            onPress: () => navigation.navigate('Notices')
        },
        { 
            key: 'Attendance', 
            icon: 'checklist', 
            label: 'Attendance',
            onPress: () => navigation.navigate('StudentAttendance')
        },
        { 
            key: 'Profile', 
            icon: 'person', 
            label: 'Profile',
            onPress: () => navigation.navigate('ProfileDetail')
        },
    ];

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.navItem}
                        activeOpacity={0.7}
                        onPress={item.onPress}
                    >
                        <MaterialIcons 
                            name={item.icon} 
                            size={24} 
                            color={isActive ? '#0A84FF' : '#8E8E93'} 
                        />
                        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(71, 85, 105, 0.5)',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        ...Platform.select({
            web: {
                backdropFilter: 'blur(12px)',
            }
        }),
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 4,
    },
    navLabelActive: {
        color: '#0A84FF',
    },
});
