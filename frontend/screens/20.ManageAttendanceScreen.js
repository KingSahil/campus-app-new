import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';
import Background from '../components/Background';

export default function ManageAttendanceScreen({ navigation, route }) {
    const [configuredClasses, setConfiguredClasses] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSessionTime, setActiveSessionTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        fetchClasses();
        fetchActiveSession();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setConfiguredClasses(data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveSession = async () => {
        try {
            const { data, error } = await supabase
                .from('attendance_sessions')
                .select('*, classes(*)')
                .eq('is_active', true)
                .order('started_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

            setActiveSession(data);
        } catch (error) {
            console.error('Error fetching active session:', error);
        }
    };

    useEffect(() => {
        // Timer simulation
        const timer = setInterval(() => {
            setActiveSessionTime(prev => {
                let newSeconds = prev.seconds + 1;
                let newMinutes = prev.minutes;
                let newHours = prev.hours;

                if (newSeconds >= 60) {
                    newSeconds = 0;
                    newMinutes += 1;
                }
                if (newMinutes >= 60) {
                    newMinutes = 0;
                    newHours += 1;
                }

                return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => {
        return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
    };

    const startSession = async (classItem) => {
        try {
            const user = await auth0.getUser();

            // Generate a unique session code
            const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data, error } = await supabase
                .from('attendance_sessions')
                .insert([{
                    class_id: classItem.id,
                    session_code: sessionCode,
                    is_active: true,
                    created_by: user?.sub
                }])
                .select('*, classes(*)')
                .single();

            if (error) throw error;

            setActiveSession(data);
            setActiveSessionTime({ hours: 0, minutes: 0, seconds: 0 });

            Alert.alert('Success', `Session started!\\nSession Code: ${sessionCode}`);
        } catch (error) {
            console.error('Error starting session:', error);
            Alert.alert('Error', 'Failed to start session: ' + error.message);
        }
    };

    const stopSession = async () => {
        if (!activeSession) return;

        try {
            const { error } = await supabase
                .from('attendance_sessions')
                .update({
                    is_active: false,
                    ended_at: new Date().toISOString()
                })
                .eq('id', activeSession.id);

            if (error) throw error;

            setActiveSession(null);
            setActiveSessionTime({ hours: 0, minutes: 0, seconds: 0 });

            Alert.alert('Success', 'Session stopped successfully');
            fetchClasses();
        } catch (error) {
            console.error('Error stopping session:', error);
            Alert.alert('Error', 'Failed to stop session');
        }
    };

    const getUpcomingSessions = () => {
        // Filter out active session if it exists
        const filtered = activeSession
            ? configuredClasses.filter(c => c.id !== activeSession.class_id)
            : configuredClasses;

        return filtered.map((classItem, index) => {
            const startTime = new Date(`2000-01-01T${classItem.start_time}`);
            return {
                id: classItem.id,
                classData: classItem,
                subject: classItem.subject,
                time: startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                room: classItem.room_number || 'Room ' + (101 + index),
                icon: index % 2 === 0 ? 'calculate' : 'science',
                color1: index % 2 === 0 ? '#3B82F6' : '#EC4899',
                color2: index % 2 === 0 ? '#A855F7' : '#F97316',
            };
        });
    };

    const upcomingSessions = getUpcomingSessions();

    return (
        <View style={styles.container}>
            <Background />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('AttendanceAdmin')}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Sessions</Text>
                    <TouchableOpacity
                        style={styles.historyButton}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="history" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Active Session */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>CURRENT ACTIVE SESSION</Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingCard}>
                            <ActivityIndicator size="large" color="#0A84FF" />
                            <Text style={styles.loadingText}>Loading sessions...</Text>
                        </View>
                    ) : activeSession ? (
                        <View style={styles.activeSessionCard}>
                            {/* Glowing background effect */}
                            <View style={styles.glowingCircle} />

                            <View style={styles.activeSessionHeader}>
                                <Text style={styles.activeSessionSubject}>
                                    {activeSession.classes?.subject || activeSession.classes?.name}
                                </Text>
                                <View style={styles.timerContainer}>
                                    <Text style={styles.timerText}>{formatTime(activeSessionTime)}</Text>
                                </View>
                            </View>

                            {/* {activeSession.session_code && (
                                <View style={styles.sessionCodeCard}>
                                    <Text style={styles.sessionCodeLabel}>Session Code</Text>
                                    <Text style={styles.sessionCodeText}>{activeSession.session_code}</Text>
                                </View>
                            )} */}

                            <TouchableOpacity
                                style={styles.viewAttendanceButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('AttendanceList', { sessionId: activeSession.id })}
                            >
                                <View style={styles.buttonContent}>
                                    <View style={styles.buttonLeft}>
                                        <MaterialIcons name="fact-check" size={24} color="#ffffff" />
                                        <Text style={styles.buttonText}>View Attendance</Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="#ffffff" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.stopButton}
                                activeOpacity={0.8}
                                onPress={stopSession}
                            >
                                <MaterialIcons name="stop-circle" size={24} color="#ffffff" />
                                <Text style={styles.stopButtonText}>Stop Session</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.noSessionCard}>
                            <MaterialIcons name="event-busy" size={48} color="#8E8E93" />
                            <Text style={styles.noSessionText}>No Active Session</Text>
                            <Text style={styles.noSessionSubtext}>Start a session from the list below</Text>
                        </View>
                    )}

                    {/* Upcoming Sessions */}
                    <View style={styles.upcomingHeader}>
                        <Text style={styles.sectionTitle}>AVAILABLE CLASSES</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{upcomingSessions.length} classes</Text>
                        </View>
                    </View>

                    <View style={styles.upcomingList}>
                        {upcomingSessions.map((session) => (
                            <View key={session.id} style={styles.upcomingCard}>
                                <View style={[styles.iconContainer, {
                                    backgroundColor: `${session.color1}33`,
                                }]}>
                                    <MaterialIcons name={session.icon} size={28} color="#ffffff" />
                                </View>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionSubject}>{session.subject}</Text>
                                    <View style={styles.sessionDetails}>
                                        <View style={styles.timeTag}>
                                            <MaterialIcons name="schedule" size={14} color="#8E8E93" />
                                            <Text style={styles.sessionTime}>{session.time}</Text>
                                        </View>
                                        <View style={styles.dot} />
                                        <Text style={styles.sessionRoom}>{session.room}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.playButton}
                                    activeOpacity={0.7}
                                    onPress={() => startSession(session.classData)}
                                    disabled={!!activeSession}
                                >
                                    <MaterialIcons
                                        name="play-arrow"
                                        size={24}
                                        color={activeSession ? "#444" : "#8E8E93"}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={styles.setupButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('AttendanceAdmin')}
                    >
                        <MaterialIcons name="edit-calendar" size={24} color="#0A84FF" />
                        <Text style={styles.setupButtonText}>Go to Set Up Classes Page</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 140,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingLeft: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8E8E93',
        letterSpacing: 1.2,
    },
    activeSessionCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(10, 132, 255, 0.4)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#0A84FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    glowingCircle: {
        position: 'absolute',
        right: -40,
        top: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(10, 132, 255, 0.2)',
        opacity: 0.4,
    },
    activeSessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    activeSessionSubject: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    timerContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    timerText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#ffffff',
        fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    },
    viewAttendanceButton: {
        backgroundColor: '#0A84FF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.2)',
        ...Platform.select({
            ios: {
                shadowColor: '#0A84FF',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    stopButton: {
        backgroundColor: '#EF4444',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        ...Platform.select({
            ios: {
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    stopButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    upcomingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    countBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    countText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
    },
    upcomingList: {
        gap: 12,
    },
    upcomingCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionInfo: {
        flex: 1,
        gap: 4,
    },
    sessionSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    sessionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sessionTime: {
        fontSize: 12,
        color: '#8E8E93',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    sessionRoom: {
        fontSize: 12,
        color: '#8E8E93',
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.8)',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    loadingText: {
        color: '#8E8E93',
        marginTop: 12,
        fontSize: 14,
    },
    noSessionCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.8)',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    noSessionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 16,
    },
    noSessionSubtext: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
    },
    sessionCodeCard: {
        backgroundColor: 'rgba(10, 132, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(10, 132, 255, 0.2)',
    },
    sessionCodeLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
    },
    sessionCodeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0A84FF',
        letterSpacing: 4,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: Platform.select({ ios: 24, default: 24 }),
        paddingTop: 24,
        backgroundColor: 'rgba(22, 22, 37, 0.95)',
    },
    setupButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    setupButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
