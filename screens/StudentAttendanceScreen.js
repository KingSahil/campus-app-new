import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';

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
            
            let userId = null;
            try {
                const user = await auth0.getUser();
                console.log('User data:', user);
                userId = user?.sub || user?.id;
            } catch (authError) {
                console.log('Auth error:', authError);
                // Use mock data if auth fails
                useMockData();
                return;
            }
            
            if (!userId) {
                console.log('No user ID found, using mock data');
                useMockData();
                return;
            }

            // Fetch attendance records with session and class details
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
                .eq('student_id', userId)
                .order('marked_at', { ascending: false });

            if (error) {
                console.error('Error fetching attendance:', error);
                // Using mock data for demo if database not set up
                useMockData();
            } else {
                setAttendanceRecords(data || []);
                calculateStats(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
            useMockData();
        } finally {
            setLoading(false);
        }
    };

    const useMockData = () => {
        const mockData = [
            {
                id: '1',
                status: 'present',
                marked_at: '2025-12-27T10:30:00',
                attendance_sessions: {
                    started_at: '2025-12-27T10:00:00',
                    classes: {
                        name: 'Physics 101',
                        subject: 'Physics'
                    }
                }
            },
            {
                id: '2',
                status: 'present',
                marked_at: '2025-12-26T14:15:00',
                attendance_sessions: {
                    started_at: '2025-12-26T14:00:00',
                    classes: {
                        name: 'Mathematics 201',
                        subject: 'Mathematics'
                    }
                }
            },
            {
                id: '3',
                status: 'late',
                marked_at: '2025-12-26T10:20:00',
                attendance_sessions: {
                    started_at: '2025-12-26T10:00:00',
                    classes: {
                        name: 'Physics 101',
                        subject: 'Physics'
                    }
                }
            },
            {
                id: '4',
                status: 'present',
                marked_at: '2025-12-25T09:05:00',
                attendance_sessions: {
                    started_at: '2025-12-25T09:00:00',
                    classes: {
                        name: 'Computer Science 301',
                        subject: 'Computer Science'
                    }
                }
            },
            {
                id: '5',
                status: 'absent',
                marked_at: '2025-12-25T14:00:00',
                attendance_sessions: {
                    started_at: '2025-12-25T14:00:00',
                    classes: {
                        name: 'Chemistry 102',
                        subject: 'Chemistry'
                    }
                }
            },
            {
                id: '6',
                status: 'present',
                marked_at: '2025-12-24T11:10:00',
                attendance_sessions: {
                    started_at: '2025-12-24T11:00:00',
                    classes: {
                        name: 'Physics 101',
                        subject: 'Physics'
                    }
                }
            },
            {
                id: '7',
                status: 'present',
                marked_at: '2025-12-23T10:05:00',
                attendance_sessions: {
                    started_at: '2025-12-23T10:00:00',
                    classes: {
                        name: 'Mathematics 201',
                        subject: 'Mathematics'
                    }
                }
            },
        ];
        setAttendanceRecords(mockData);
        calculateStats(mockData);
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
                        <Text style={styles.headerTitle}>My Attendance</Text>
                        <Text style={styles.headerSubtitle}>{stats.total} Sessions Recorded</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={fetchAttendanceRecords}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="refresh" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView 
                    style={styles.scrollView} 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Stats Card */}
                    {renderStatsCard()}

                    {/* Filter Buttons */}
                    {renderFilterButtons()}

                    {/* Attendance Records */}
                    <View style={styles.section}>
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
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    safeArea: {
        flex: 1,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#1C1C1E',
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    statsCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    mainStatContainer: {
        alignItems: 'center',
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
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
        backgroundColor: '#1C1C1E',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2C2C2E',
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 16,
    },
    recordCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
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
        alignItems: 'center',
        paddingVertical: 48,
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
