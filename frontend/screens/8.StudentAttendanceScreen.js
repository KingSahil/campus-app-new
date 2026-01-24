import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';
import Background from '../components/Background';

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

export default function StudentAttendanceScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [filter, setFilter] = useState('all'); // all, present, absent, late
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0
    });

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            setLoading(true);

            // Get user info from Auth0
            const userInfo = await auth0.getUser();
            const userData = userInfo?.data?.user || userInfo;
            const userEmail = userData?.email;

            if (!userEmail) {
                Alert.alert('Error', 'Unable to get your email. Please sign in again.');
                setLoading(false);
                return;
            }

            // Fetch attendance records using student_email
            const { data, error } = await supabase
                .from('attendance_records')
                .select(`
                    *,
                    attendance_sessions (
                        *,
                        classes (
                            name,
                            subject
                        )
                    )
                `)
                .eq('student_email', userEmail)
                .order('marked_at', { ascending: false });

            if (error) {
                console.error('Error fetching attendance:', error);
                Alert.alert('Error', 'Failed to load attendance records');
                setAttendanceRecords([]);
                calculateStats([]);
            } else {
                setAttendanceRecords(data || []);
                calculateStats(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to load attendance records');
            setAttendanceRecords([]);
            calculateStats([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (records) => {
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const late = records.filter(r => r.status === 'late').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        setStats({ total, present, absent, late, percentage });
    };

    const getFilteredRecords = () => {
        if (filter === 'all') return attendanceRecords;
        return attendanceRecords.filter(record => record.status === filter);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return '#10B981';
            case 'absent': return '#EF4444';
            case 'late': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present': return 'check-circle';
            case 'absent': return 'cancel';
            case 'late': return 'schedule';
            default: return 'help';
        }
    };

    const renderStatsCard = () => (
        <View style={styles.statsCard}>
            <View style={styles.mainStatContainer}>
                <Text style={styles.percentageText}>{stats.percentage}%</Text>
                <Text style={styles.percentageLabel}>Attendance Rate</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#10B9811A' }]}>
                        <MaterialIcons name="check-circle" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.statValue}>{stats.present}</Text>
                    <Text style={styles.statLabel}>Present</Text>
                </View>

                <View style={styles.statItem}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B1A' }]}>
                        <MaterialIcons name="schedule" size={24} color="#F59E0B" />
                    </View>
                    <Text style={styles.statValue}>{stats.late}</Text>
                    <Text style={styles.statLabel}>Late</Text>
                </View>

                <View style={styles.statItem}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#EF44441A' }]}>
                        <MaterialIcons name="cancel" size={24} color="#EF4444" />
                    </View>
                    <Text style={styles.statValue}>{stats.absent}</Text>
                    <Text style={styles.statLabel}>Absent</Text>
                </View>
            </View>
        </View>
    );

    const renderFilterButtons = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => setFilter('all')}
            >
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                    All ({attendanceRecords.length})
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.filterButton, filter === 'present' && styles.filterButtonActive]}
                onPress={() => setFilter('present')}
            >
                <Text style={[styles.filterText, filter === 'present' && styles.filterTextActive]}>
                    Present ({stats.present})
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.filterButton, filter === 'late' && styles.filterButtonActive]}
                onPress={() => setFilter('late')}
            >
                <Text style={[styles.filterText, filter === 'late' && styles.filterTextActive]}>
                    Late ({stats.late})
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.filterButton, filter === 'absent' && styles.filterButtonActive]}
                onPress={() => setFilter('absent')}
            >
                <Text style={[styles.filterText, filter === 'absent' && styles.filterTextActive]}>
                    Absent ({stats.absent})
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderAttendanceRecord = (record) => (
        <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
                <View style={styles.recordTitleContainer}>
                    <Text style={styles.recordSubject}>
                        {record.attendance_sessions?.classes?.name || 'Unknown Class'}
                    </Text>
                    <Text style={styles.recordDate}>
                        {formatDate(record.marked_at)} • {formatTime(record.marked_at)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) + '1A' }]}>
                    <MaterialIcons
                        name={getStatusIcon(record.status)}
                        size={18}
                        color={getStatusColor(record.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A84FF" />
                <Text style={styles.loadingText}>Loading attendance records...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Background />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentColumn}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>My Attendance</Text>
                                <Text style={styles.subtitle}>{stats.total} Sessions Recorded</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={fetchAttendanceRecords}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="refresh" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        {/* Stats Card */}
                        {renderStatsCard()}

                        {/* Filter Buttons */}
                        {renderFilterButtons()}

                        {/* Attendance Records */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            <Text style={styles.sectionTitle}>Attendance History</Text>

                            {getFilteredRecords().length === 0 ? (
                                <View style={styles.emptyState}>
                                    <MaterialIcons name="event-busy" size={48} color="#8E8E93" />
                                    <Text style={styles.emptyStateText}>No attendance records found</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        {filter === 'all'
                                            ? 'Your attendance records will appear here'
                                            : `No ${filter} records found`
                                        }
                                    </Text>
                                </View>
                            ) : (
                                getFilteredRecords().map(record => renderAttendanceRecord(record))
                            )}
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
        ...Platform.select({ web: { paddingTop: 20 } }),
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#ffffff',
        marginTop: 16,
        fontSize: 16,
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
    refreshButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
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
    mainStatContainer: {
        alignItems: 'center',
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 24,
    },
    percentageText: {
        fontSize: 56,
        fontWeight: '700',
        color: '#0A84FF',
        letterSpacing: -2,
    },
    percentageLabel: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        borderWidth: 1,
    },
    filterButtonActive: {
        backgroundColor: '#0A84FF',
        borderColor: '#0A84FF',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
    },
    filterTextActive: {
        color: '#ffffff',
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
    recordCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
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
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    recordTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    recordSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    recordDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
        textAlign: 'center',
    },
});
