import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { auth0 } from '../lib/auth0';
import { supabase } from '../lib/supabase';

// Helper function to generate a consistent UUID from a string
const generateUUIDFromString = (str) => {
    // Simple hash function to generate consistent UUID
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    
    // Convert to UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.substr(0, 8)}-${hex.substr(0, 4)}-4${hex.substr(0, 3)}-${hex.substr(0, 4)}-${hex.substr(0, 12)}`.padEnd(36, '0');
};

export default function DashboardScreen({ navigation }) {
    const [user, setUser] = React.useState(null);
    const [activeSessions, setActiveSessions] = React.useState([]);
    const [loadingSessions, setLoadingSessions] = React.useState(true);

    useEffect(() => {
        getUserInfo();
        fetchActiveSessions();
        
        // Refresh sessions every 30 seconds
        const interval = setInterval(fetchActiveSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    const getUserInfo = async () => {
        try {
            const userInfo = await auth0.getUser();
            console.log('Auth0 user info:', userInfo);
            // Extract the actual user data from the nested structure
            const userData = userInfo?.data?.user || userInfo;
            console.log('Extracted user data:', userData);
            setUser(userData);
        } catch (error) {
            console.log('Error getting user:', error);
        }
    };

    const fetchActiveSessions = async () => {
        try {
            setLoadingSessions(true);
            const { data, error } = await supabase
                .from('attendance_sessions')
                .select(`
                    *,
                    classes (
                        id,
                        name,
                        subject,
                        start_time,
                        end_time
                    )
                `)
                .eq('is_active', true)
                .order('started_at', { ascending: false });

            if (error) {
                console.error('Error fetching active sessions:', error);
                return;
            }

            setActiveSessions(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleSignOut = async () => {
        try {
            await auth0.signOut();
            navigation.replace('SignIn');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const handleMarkAttendance = async (session) => {
        if (!user) {
            Alert.alert('Error', 'Please sign in to mark attendance');
            return;
        }

        const userEmail = user.email;
        const userName = user.name || user.given_name || user.nickname || 'Student';

        if (!userEmail) {
            Alert.alert('Error', 'Unable to get your email. Please sign in again.');
            return;
        }

        Alert.alert(
            'Mark Attendance',
            `Mark attendance for ${session.classes?.subject || 'this class'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Mark',
                    onPress: async () => {
                        try {
                            // Generate a consistent student_id from email
                            const studentId = generateUUIDFromString(userEmail);

                            // Check if already marked
                            const { data: existingRecord } = await supabase
                                .from('attendance_records')
                                .select('id')
                                .eq('session_id', session.id)
                                .eq('student_email', userEmail)
                                .single();

                            if (existingRecord) {
                                Alert.alert('Already Marked', 'You have already marked attendance for this session');
                                return;
                            }

                            // Insert attendance record
                            const { error } = await supabase
                                .from('attendance_records')
                                .insert({
                                    session_id: session.id,
                                    student_id: studentId,
                                    student_email: userEmail,
                                    student_name: userName,
                                    status: 'present',
                                    marked_at: new Date().toISOString(),
                                });

                            if (error) {
                                console.error('Error marking attendance:', error);
                                Alert.alert('Error', 'Failed to mark attendance. Please try again.');
                                return;
                            }

                            Alert.alert('Success', 'Attendance marked successfully!');
                        } catch (error) {
                            console.error('Error:', error);
                            Alert.alert('Error', 'Failed to mark attendance');
                        }
                    }
                }
            ]
        );
    };

    const quickAccessItems = [
        { icon: 'restaurant', label: 'Food', color: '#EF4444' },
        { icon: 'local-library', label: 'Library', color: '#10B981' },
        { icon: 'notifications', label: 'Notices', color: '#F59E0B', onPress: () => navigation.navigate('Notices') },
        { icon: 'campaign', label: 'Student Voice', color: '#A855F7' },
        { icon: 'checklist', label: 'Attendance', color: '#F97316', onPress: () => navigation.navigate('StudentAttendance') },
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

                        {/* Active Attendance Sessions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Active Sessions</Text>
                                <TouchableOpacity 
                                    onPress={fetchActiveSessions}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="refresh" size={20} color="#8E8E93" />
                                </TouchableOpacity>
                            </View>
                            
                            {loadingSessions ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading sessions...</Text>
                                </View>
                            ) : activeSessions.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="event-busy" size={32} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No active sessions</Text>
                                    <Text style={styles.emptySubtext}>Check back when your instructor starts attendance</Text>
                                </View>
                            ) : (
                                activeSessions.map((session) => (
                                    <View key={session.id} style={styles.attendanceCard}>
                                        <View style={styles.attendanceContent}>
                                            <View style={styles.attendanceIconBox}>
                                                <MaterialIcons name="school" size={24} color="#0A84FF" />
                                            </View>
                                            <View style={styles.sessionDetails}>
                                                <Text style={styles.attendanceSubject}>
                                                    {session.classes?.subject || session.classes?.name || 'Class'}
                                                </Text>
                                                <Text style={styles.attendanceTime}>
                                                    {session.classes?.start_time && session.classes?.end_time 
                                                        ? `${formatTime(session.classes.start_time)} - ${formatTime(session.classes.end_time)}`
                                                        : 'Active Now'
                                                    }
                                                </Text>
                                                {session.session_code && (
                                                    <View style={styles.codeContainer}>
                                                        <MaterialIcons name="qr-code" size={14} color="#0A84FF" />
                                                        <Text style={styles.sessionCode}>Code: {session.session_code}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.markButton} 
                                            activeOpacity={0.8}
                                            onPress={() => handleMarkAttendance(session)}
                                        >
                                            <Text style={styles.markButtonText}>Mark</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
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
                    <TouchableOpacity
                        style={styles.navItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('StudentAttendance')}
                    >
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
        paddingBottom: 100,
    },
    contentColumn: {
        width: '100%',
        maxWidth: 1400,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    profilePicContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#0A84FF',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 12,
    },
    loadingCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    emptyCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
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
        marginBottom: 12,
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
        flex: 1,
    },
    attendanceIconBox: {
        backgroundColor: 'rgba(10, 132, 255, 0.2)',
        padding: 12,
        borderRadius: 24,
    },
    sessionDetails: {
        flex: 1,
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
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    sessionCode: {
        fontSize: 12,
        color: '#0A84FF',
        fontWeight: '600',
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
});
