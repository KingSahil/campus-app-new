import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubjectTopicsScreen({ navigation, route }) {
    const { subject } = route.params;
    
    const topics = [
        { id: 1, name: 'Introduction to ' + subject.name, videoCount: 5 },
        { id: 2, name: 'Fundamentals', videoCount: 8 },
        { id: 3, name: 'Advanced Concepts', videoCount: 6 },
        { id: 4, name: 'Problem Solving', videoCount: 10 },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0e0520', '#06091e', '#0d041e', '#150624']}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.gradient}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{subject.name}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Add/Remove Topic Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                        <MaterialIcons name="edit" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Add/Remove Topic</Text>
                    </TouchableOpacity>
                </View>

                {/* Topics List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {topics.map((topic) => (
                        <TouchableOpacity
                            key={topic.id}
                            style={styles.topicCard}
                            onPress={() => navigation.navigate('VideosList', { subject, topic })}
                            activeOpacity={0.8}
                        >
                            <View style={styles.topicInfo}>
                                <Text style={styles.topicName}>{topic.name}</Text>
                                <Text style={styles.videoCount}>{topic.videoCount} videos</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <MaterialIcons name="dashboard" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="school" size={24} color="#8B5CF6" />
                        <Text style={[styles.navLabel, { color: '#8B5CF6' }]}>Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => navigation.navigate('Notices')}
                    >
                        <MaterialIcons name="notifications" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Notices</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="event-available" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="person" size={24} color="#9CA3AF" />
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
        backgroundColor: '#111827',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    topicCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topicInfo: {
        flex: 1,
    },
    topicName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#E5E7EB',
        marginBottom: 4,
    },
    videoCount: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 20,
        paddingTop: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    navLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
        fontWeight: '500',
    },
});
