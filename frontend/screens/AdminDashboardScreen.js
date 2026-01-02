import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboardScreen({ navigation }) {
    const quickAccessItems = [
        {
            icon: 'checklist',
            label: 'Attendance',
            color: '#F97316',
            onPress: () => navigation.navigate('AttendanceAdmin')
        },
        {
            icon: 'menu-book',
            label: 'Learning',
            color: '#06B6D4',
            onPress: () => navigation.navigate('LearningHub')
        },
        { icon: 'restaurant', label: 'Food', color: '#EF4444' },
        { icon: 'local-library', label: 'Library', color: '#10B981' },
        { icon: 'campaign', label: 'Student Voice', color: '#A855F7' },

        { icon: 'storefront', label: 'Campus\nMarketplace', color: '#EC4899' },

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
                            <View style={styles.headerButtons}>
                                <TouchableOpacity 
                                    style={styles.notificationButton}
                                    onPress={() => navigation.navigate('Notices')}
                                >
                                    <MaterialIcons name="notifications" size={24} color="#ffffff" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.profilePicContainer}
                                    onPress={() => navigation.navigate('ProfileDetail')}
                                >
                                    <Image
                                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_UmOn2Ca2nFEDCfiijmx_SEi5EH7D2Y6catOJoHdc88XpwtWj5zuuQ5dwNK3a7Vj-26z0EWTwIWx9VZAGwkLntb__QkElZ01Us3OAPD9MqMORkDD0exnYBC5tsdW0CqAXJPvj5vQ2xXB5z23WE7ht34HAKNIQ2JaMajtyMPmUoBdGtODTxv_B148bL522wslFyfrgwmODlqI6XuD9T1Go9MhoAdT0_OCGvuW7aPDZeK-3c0mk5T1l3noLxaYZqL_N6G4BNePt4Xs' }}
                                        style={styles.profilePic}
                                    />
                                </TouchableOpacity>
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
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
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
});
