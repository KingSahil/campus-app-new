import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabNavigation({
    activeTab,
    setActiveTab,
    upvoteCount,
    hasUpvoted,
    loadingUpvote,
    handleUpvote
}) {
    return (
        <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'upvotes' && styles.activeTab]}
                onPress={handleUpvote}
                disabled={loadingUpvote}
            >
                {loadingUpvote ? (
                    <ActivityIndicator color="#3B82F6" size="small" />
                ) : (
                    <MaterialIcons
                        name={hasUpvoted ? "thumb-up" : "thumb-up-off-alt"}
                        size={24}
                        color={hasUpvoted ? '#3B82F6' : '#9CA3AF'}
                    />
                )}
                <Text style={[styles.tabText, hasUpvoted && styles.activeTabText]}>
                    {upvoteCount.toLocaleString()} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}
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
                    Ask AI
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'chapters' && styles.activeTab]}
                onPress={() => setActiveTab('chapters')}
            >
                <MaterialIcons
                    name="video-library"
                    size={24}
                    color={activeTab === 'chapters' ? '#3B82F6' : '#9CA3AF'}
                />
                <Text style={[styles.tabText, activeTab === 'chapters' && styles.activeTabText]}>
                    Chapters
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
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#111827',
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
});
