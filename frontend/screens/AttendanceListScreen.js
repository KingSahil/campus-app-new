import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function AttendanceListScreen({ navigation, route }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [presentStudents, setPresentStudents] = useState([]);
    const [absentStudents, setAbsentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionInfo, setSessionInfo] = useState(null);

    const sessionId = route.params?.sessionId;

    useEffect(() => {
        if (sessionId) {
            fetchAttendanceData();
            // Refresh every 5 seconds to show new attendance marks
            const interval = setInterval(fetchAttendanceData, 5000);
            return () => clearInterval(interval);
        }
    }, [sessionId]);

    const fetchAttendanceData = async () => {
        try {
            // Fetch session info
            const { data: session, error: sessionError } = await supabase
                .from('attendance_sessions')
                .select(`
                    *,
                    classes (
                        id,
                        name,
                        subject
                    )
                `)
                .eq('id', sessionId)
                .single();

            if (sessionError) {
                console.error('Error fetching session:', sessionError);
                return;
            }

            setSessionInfo(session);

            // Fetch attendance records
            const { data: records, error: recordsError } = await supabase
                .from('attendance_records')
                .select('*')
                .eq('session_id', sessionId)
                .order('marked_at', { ascending: false });

            if (recordsError) {
                console.error('Error fetching records:', recordsError);
                return;
            }

            // Separate present and absent
            const present = records.filter(r => r.status === 'present');
            const absent = records.filter(r => r.status === 'absent');

            setPresentStudents(present);
            setAbsentStudents(absent);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[parts.length - 1][0];
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        if (!name) return '#8E8E93';
        const colors = [
            '#3B82F6', '#A855F7', '#EC4899', '#10B981', 
            '#F59E0B', '#EF4444', '#14B8A6', '#6366F1'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const filteredPresentStudents = presentStudents.filter(student =>
        student.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAbsentStudents = absentStudents.filter(student =>
        student.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Attendance List</Text>
                        <Text style={styles.headerSubtitle}>
                            {sessionInfo?.classes?.subject || 'Class'} • {sessionInfo?.session_code || 'Session'}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        activeOpacity={0.7}
                        onPress={fetchAttendanceData}
                    >
                        <MaterialIcons name="refresh" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0A84FF" />
                        <Text style={styles.loadingText}>Loading attendance...</Text>
                    </View>
                ) : (
                    <ScrollView 
                    style={styles.scrollView} 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                >
                    {/* Search Bar - Sticky */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchWrapper}>
                            <MaterialIcons name="search" size={24} color="#8E8E93" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search student name or ID"
                                placeholderTextColor="#8E8E93"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Present Students */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <View style={styles.statusDot} />
                                <Text style={styles.sectionTitle}>PRESENT STUDENTS</Text>
                            </View>
                            <View style={styles.countBadgePresent}>
                                <Text style={styles.countTextPresent}>{filteredPresentStudents.length}</Text>
                            </View>
                        </View>

                        {filteredPresentStudents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="person-off" size={48} color="#8E8E93" />
                                <Text style={styles.emptyText}>No students marked present yet</Text>
                            </View>
                        ) : (
                            <View style={styles.studentList}>
                                {filteredPresentStudents.map((student) => {
                                    const initials = getInitials(student.student_name);
                                    const color = getAvatarColor(student.student_name);
                                    
                                    return (
                                        <View key={student.id} style={styles.studentCard}>
                                            <View style={[styles.avatar, { backgroundColor: color }]}>
                                                <Text style={styles.avatarText}>{initials}</Text>
                                            </View>
                                            <View style={styles.studentInfo}>
                                                <Text style={styles.studentName}>{student.student_name}</Text>
                                                <Text style={styles.studentId}>{student.student_email}</Text>
                                            </View>
                                            <View style={styles.timeContainer}>
                                                <Text style={styles.timeText}>
                                                    {new Date(student.marked_at).toLocaleTimeString('en-US', { 
                                                        hour: 'numeric', 
                                                        minute: '2-digit' 
                                                    })}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={styles.statusButton} activeOpacity={0.7}>
                                                <MaterialIcons name="check-circle" size={24} color="#10B981" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Absent Students */}
                    <View style={[styles.section, { marginBottom: 40 }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={[styles.sectionTitle, { color: '#F87171' }]}>ABSENT STUDENTS</Text>
                            </View>
                            <View style={styles.countBadgeAbsent}>
                                <Text style={styles.countTextAbsent}>{filteredAbsentStudents.length}</Text>
                            </View>
                        </View>

                        {filteredAbsentStudents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="check-circle" size={48} color="#10B981" />
                                <Text style={styles.emptyText}>No absent students</Text>
                            </View>
                        ) : (
                            <View style={styles.studentList}>
                                {filteredAbsentStudents.map((student) => {
                                    const initials = getInitials(student.student_name);
                                    
                                    return (
                                        <View key={student.id} style={styles.studentCardAbsent}>
                                            <View style={styles.absentIndicator} />
                                            <View style={styles.avatarAbsent}>
                                                <Text style={styles.avatarTextAbsent}>{initials}</Text>
                                            </View>
                                            <View style={styles.studentInfo}>
                                                <Text style={styles.studentNameAbsent}>{student.student_name}</Text>
                                                <Text style={styles.studentId}>{student.student_email}</Text>
                                            </View>
                                            <TouchableOpacity style={styles.statusButtonAbsent} activeOpacity={0.7}>
                                                <MaterialIcons name="close" size={20} color="#8E8E93" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </ScrollView>
                )}
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
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: 'rgba(22, 22, 37, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    searchWrapper: {
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: 14,
        zIndex: 1,
    },
    searchInput: {
        backgroundColor: 'rgba(28, 28, 46, 1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingLeft: 48,
        paddingRight: 16,
        color: '#ffffff',
        fontSize: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        ...Platform.select({
            ios: {
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
            },
        }),
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
        letterSpacing: 1.2,
    },
    countBadgePresent: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countTextPresent: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
    },
    countBadgeAbsent: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countTextAbsent: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    studentList: {
        gap: 12,
    },
    studentCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
        }),
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: 2,
    },
    studentId: {
        fontSize: 12,
        color: '#8E8E93',
    },
    statusButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentCardAbsent: {
        backgroundColor: 'rgba(28, 28, 46, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    absentIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
    },
    avatarAbsent: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(28, 28, 46, 1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    avatarTextAbsent: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8E8E93',
    },
    studentNameAbsent: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    statusButtonAbsent: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    timeContainer: {
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
        color: '#8E8E93',
    },
});
