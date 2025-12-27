import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { auth0 } from '../lib/auth0';

export default function DashboardScreen({ navigation }) {
    const [user, setUser] = React.useState(null);

    useEffect(() => {
        getUserInfo();
    }, []);

    const getUserInfo = async () => {
        try {
            const user = await auth0.getUser();
            setUser(user);
        } catch (error) {
            console.log('Error getting user:', error);
        }d
    };``

    const handleSignOut = async () => {
        try {
            await auth0.signOut();
            navigation.replace('SignIn');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const quickAccessItems = [
        { icon: 'restaurant', label: 'Food', color: '#EF4444' },
        { icon: 'local-library', label: 'Library', color: '#10B981' },
        { icon: 'notifications', label: 'Notices', color: '#F59E0B', onPress: () => navigation.navigate('Notices') },
        { icon: 'campaign', label: 'Student Voice', color: '#A855F7' },
        { icon: 'checklist', label: 'Attendance', color: '#F97316' },
        { icon: 'storefront', label: 'Campus Marketplace', color: '#EC4899' },
        { icon: 'menu-book', label: 'Learning', color: '#06B6D4', onPress: () => navigation.navigate('LearningHub') },
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
                                <Text style={styles.title}>Dashboard</Text>
                                <Text style={styles.subtitle}>
                                    {user?.email ? `Welcome, ${user.email.split('@')[0]}!` : 'Welcome back!'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.profilePicContainer}
                                onPress={handleSignOut}
                            >
                                <Image
                                    source={{ 
                                        uri: user?.user_metadata?.avatar_url || 
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuC_UmOn2Ca2nFEDCfiijmx_SEi5EH7D2Y6catOJoHdc88XpwtWj5zuuQ5dwNK3a7Vj-26z0EWTwIWx9VZAGwkLntb__QkElZ01Us3OAPD9MqMORkDD0exnYBC5tsdW0CqAXJPvj5vQ2xXB5z23WE7ht34HAKNIQ2JaMajtyMPmUoBdGtODTxv_B148bL522wslFyfrgwmODlqI6XuD9T1Go9MhoAdT0_OCGvuW7aPDZeK-3c0mk5T1l3noLxaYZqL_N6G4BNePt4Xs' 
                                    }}
                                    style={styles.profilePic}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Upcoming Attendance */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Upcoming Attendance</Text>
                            <View style={styles.attendanceCard}>
                                <View style={styles.attendanceContent}>
                                    <View style={styles.attendanceIconBox}>
                                        <MaterialIcons name="school" size={24} color="#0A84FF" />
                                    </View>
                                    <View>
                                        <Text style={styles.attendanceSubject}>Physics</Text>
                                        <Text style={styles.attendanceTime}>10:00 AM - 11:00 AM</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.markButton} activeOpacity={0.8}>
                                    <Text style={styles.markButtonText}>Mark</Text>
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
                                        <MaterialIcons name={item.icon} size={28} color={item.color} />
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
                    <TouchableOpacity
                        style={styles.navItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('LearningHub')}
                    >
                        <MaterialIcons name="school" size={24} color="#8E8E93" />
                        <Text style={styles.navLabel}>Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Notices')}
                    >
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
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
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
        backgroundColor: '#334155',
        overflow: 'hidden',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 12,
    },
    attendanceCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }
        }),
    },
    attendanceContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    attendanceIconBox: {
        backgroundColor: 'rgba(10, 132, 255, 0.2)',
        padding: 12,
        borderRadius: 24,
    },
    attendanceSubject: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: 4,
    },
    attendanceTime: {
        fontSize: 14,
        color: '#8E8E93',
    },
    markButton: {
        backgroundColor: '#0A84FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    markButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    quickAccessCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        width: '47%',
        minHeight: 100,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }
        }),
    },
    quickAccessLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 8,
    },
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
    contentColumn: {
        width: '100%',
        maxWidth: 1400,      // 👈 controls shrink width
        alignSelf: 'center' // 👈 centers column
    },

});
