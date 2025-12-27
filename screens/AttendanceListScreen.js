import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function AttendanceListScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    const presentStudents = [
        { id: '2023001', name: 'John Doe', initials: 'JD', color1: '#3B82F6', color2: '#6366F1' },
        { id: '2023015', name: 'Emma Watson', initials: 'EW', color1: '#A855F7', color2: '#EC4899' },
        { id: '2023042', name: 'Liam Johnson', initials: 'LJ', color1: '#10B981', color2: '#14B8A6', hasImage: true },
        { id: '2023089', name: "Sarah O'Connor", initials: 'SO', color1: '#10B981', color2: '#14B8A6' },
    ];

    const absentStudents = [
        { id: '2023011', name: 'Michael Key', initials: 'MK' },
        { id: '2023055', name: 'Jessica Lee', initials: 'JL' },
    ];

    const getGradientStyle = (color1, color2) => ({
        background: `linear-gradient(to bottom right, ${color1}, ${color2})`,
    });

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
                        <Text style={styles.headerSubtitle}>Physics • Session #42</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="filter-list" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
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
                                <Text style={styles.countTextPresent}>24</Text>
                            </View>
                        </View>

                        <View style={styles.studentList}>
                            {presentStudents.map((student) => (
                                <View key={student.id} style={styles.studentCard}>
                                    {student.hasImage ? (
                                        <View style={styles.avatarImage}>
                                            <View style={[styles.avatarPlaceholder, { backgroundColor: student.color1 }]}>
                                                <Text style={styles.avatarText}>{student.initials}</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={[styles.avatar, { 
                                            backgroundColor: student.color1,
                                        }]}>
                                            <Text style={styles.avatarText}>{student.initials}</Text>
                                        </View>
                                    )}
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentId}>ID: {student.id}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.statusButton} activeOpacity={0.7}>
                                        <MaterialIcons name="check-circle" size={24} color="#10B981" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Absent Students */}
                    <View style={[styles.section, { marginBottom: 40 }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={[styles.sectionTitle, { color: '#F87171' }]}>ABSENT STUDENTS</Text>
                            </View>
                            <View style={styles.countBadgeAbsent}>
                                <Text style={styles.countTextAbsent}>5</Text>
                            </View>
                        </View>

                        <View style={styles.studentList}>
                            {absentStudents.map((student) => (
                                <View key={student.id} style={styles.studentCardAbsent}>
                                    <View style={styles.absentIndicator} />
                                    <View style={styles.avatarAbsent}>
                                        <Text style={styles.avatarTextAbsent}>{student.initials}</Text>
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentNameAbsent}>{student.name}</Text>
                                        <Text style={styles.studentId}>ID: {student.id}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.statusButtonAbsent} activeOpacity={0.7}>
                                        <MaterialIcons name="close" size={20} color="#8E8E93" />
                                    </TouchableOpacity>
                                </View>
                            ))}
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
});
