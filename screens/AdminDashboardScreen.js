import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboardScreen({ navigation }) {
    const quickAccessItems = [
        { icon: 'restaurant', label: 'Food', color: '#EF4444' },
        { icon: 'local-library', label: 'Library', color: '#10B981' },
        { icon: 'campaign', label: 'Student Voice', color: '#A855F7' },
        { 
            icon: 'checklist', 
            label: 'Attendance', 
            color: '#F97316',
            onPress: () => navigation.navigate('AttendanceAdmin')
        },
        { icon: 'storefront', label: 'Campus\nMarketplace', color: '#EC4899' },
        { icon: 'menu-book', label: 'Learning', color: '#06B6D4' },
    ];

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Main Content */}
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.contentColumn}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Admin Portal</Text>
                                <Text style={styles.subtitle}>Welcome, Professor</Text>
                            </View>
                            <View style={styles.profilePicContainer}>
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_UmOn2Ca2nFEDCfiijmx_SEi5EH7D2Y6catOJoHdc88XpwtWj5zuuQ5dwNK3a7Vj-26z0EWTwIWx9VZAGwkLntb__QkElZ01Us3OAPD9MqMORkDD0exnYBC5tsdW0CqAXJPvj5vQ2xXB5z23WE7ht34HAKNIQ2JaMajtyMPmUoBdGtODTxv_B148bL522wslFyfrgwmODlqI6XuD9T1Go9MhoAdT0_OCGvuW7aPDZeK-3c0mk5T1l3noLxaYZqL_N6G4BNePt4Xs' }}
                                    style={styles.profilePic}
                                />
                            </View>
                        </View>

                        {/* Quick Access */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            <Text style={styles.sectionTitle}>Quick Access</Text>
                            <View style={styles.gridContainer}>
                                {quickAccessItems.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.quickAccessCard}
                                        activeOpacity={0.8}
                                        onPress={item.onPress}
                                    >
                                        <MaterialIcons name={item.icon} size={32} color={item.color} />
                                        <Text style={styles.quickAccessLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
                        <MaterialIcons name="dashboard" size={24} color="#0A84FF" />
                        <Text style={[styles.navLabel, { color: '#0A84FF' }]}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
                        <MaterialIcons name="school" size={24} color="#8E8E93" />
                        <Text style={styles.navLabel}>Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
                        <MaterialIcons name="notifications" size={24} color="#8E8E93" />
                        <Text style={styles.navLabel}>Notices</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
                        <MaterialIcons name="checklist" size={24} color="#8E8E93" />
                        <Text style={styles.navLabel}>Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
                        <MaterialIcons name="person" size={24} color="#8E8E93" />
                        <Text style={styles.navLabel}>Profile</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    contentColumn: {
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 32,
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    profilePicContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#475569',
        overflow: 'hidden',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 8,
    },
    quickAccessCard: {
        width: Platform.select({ web: 'calc(50% - 8px)', default: '47%' }),
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        height: 144,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
        }),
    },
    quickAccessLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        lineHeight: 20,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingBottom: Platform.select({ ios: 24, default: 24 }),
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-around',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 4,
    },
});
