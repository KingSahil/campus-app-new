import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');

export default function LectureVideoScreen({ navigation, route }) {
    const { video } = route.params;
    const [activeTab, setActiveTab] = useState('upvotes');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upvotes':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.upvoteSection}>
                            <TouchableOpacity style={styles.upvoteButton}>
                                <MaterialIcons name="thumb-up" size={32} color="#3B82F6" />
                            </TouchableOpacity>
                            <Text style={styles.upvoteCount}>1.2K Upvotes</Text>
                            <Text style={styles.upvoteSubtext}>Tap to upvote this video</Text>
                        </View>
                    </View>
                );
            case 'discussion':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.comingSoonText}>Discussion Forum</Text>
                        <Text style={styles.comingSoonSubtext}>
                            Join the conversation with your classmates
                        </Text>
                        <View style={styles.discussionPreview}>
                            <MaterialIcons name="forum" size={48} color="#6B7280" />
                            <Text style={styles.previewText}>No discussions yet. Be the first!</Text>
                        </View>
                    </View>
                );
            case 'ai':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>AI Summarizer</Text>
                        <View style={styles.aiCard}>
                            <MaterialIcons name="auto-awesome" size={32} color="#8B5CF6" />
                            <Text style={styles.aiText}>
                                Get AI-powered summaries and key points from this lecture
                            </Text>
                            <TouchableOpacity style={styles.aiButton}>
                                <Text style={styles.aiButtonText}>Generate Summary</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'quiz':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>AI Quiz</Text>
                        <View style={styles.quizCard}>
                            <MaterialIcons name="quiz" size={48} color="#3B82F6" />
                            <Text style={styles.quizText}>
                                Test your understanding with AI-generated questions
                            </Text>
                            <TouchableOpacity style={styles.quizButton}>
                                <Text style={styles.quizButtonText}>Start Quiz</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {video.title}
                    </Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <MaterialIcons name="more-vert" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Video Player */}
                <View style={styles.videoContainer}>
                    <Video
                        source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
                        style={styles.video}
                        useNativeControls
                        resizeMode="contain"
                        shouldPlay={false}
                    />
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upvotes' && styles.activeTab]}
                        onPress={() => setActiveTab('upvotes')}
                    >
                        <MaterialIcons
                            name="thumb-up"
                            size={24}
                            color={activeTab === 'upvotes' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'upvotes' && styles.activeTabText]}>
                            1.2K Upvotes
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
                        onPress={() => setActiveTab('discussion')}
                    >
                        <MaterialIcons
                            name="forum"
                            size={24}
                            color={activeTab === 'discussion' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
                            Discussion
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
                        onPress={() => setActiveTab('ai')}
                    >
                        <MaterialIcons
                            name="auto-awesome"
                            size={24}
                            color={activeTab === 'ai' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
                            AI Summarizer
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'quiz' && styles.activeTab]}
                        onPress={() => setActiveTab('quiz')}
                    >
                        <MaterialIcons
                            name="quiz"
                            size={24}
                            color={activeTab === 'quiz' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>
                            AI Quiz
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {renderTabContent()}
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
                        <MaterialIcons name="school" size={24} color="#3B82F6" />
                        <Text style={[styles.navLabel, { color: '#3B82F6' }]}>Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="event-available" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => navigation.navigate('Notices')}
                    >
                        <MaterialIcons name="notifications" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Notices</Text>
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
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1F2937',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginHorizontal: 8,
    },
    moreButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    tab: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3B82F6',
    },
    tabText: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#3B82F6',
    },
    contentContainer: {
        flex: 1,
    },
    tabContent: {
        padding: 24,
        minHeight: 300,
    },
    upvoteSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    upvoteButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    upvoteCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    upvoteSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    comingSoonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    comingSoonSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 24,
    },
    discussionPreview: {
        alignItems: 'center',
        paddingVertical: 48,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    previewText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 16,
    },
    aiCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    aiText: {
        fontSize: 15,
        color: '#D1D5DB',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    aiButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
    },
    aiButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    quizCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    quizText: {
        fontSize: 15,
        color: '#D1D5DB',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    quizButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quizButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
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
    },
});
