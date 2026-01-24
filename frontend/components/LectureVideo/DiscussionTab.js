import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DiscussionTab({
    loadingDiscussions,
    getMainMessages,
    getReplies,
    toggleThread,
    replyTo,
    setReplyTo,
    expandedThreads,
    formatTimeAgo
}) {
    const mainMessages = getMainMessages();

    if (loadingDiscussions) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#3B82F6" />
                <Text style={styles.loadingText}>Loading discussions...</Text>
            </View>
        );
    }

    if (mainMessages.length === 0) {
        return (
            <View style={styles.emptyDiscussion}>
                <MaterialIcons name="forum" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No discussions yet</Text>
                <Text style={styles.emptySubtext}>Be the first to ask a question!</Text>
            </View>
        );
    }

    return (
        <View>
            {mainMessages.map((message) => {
                const replies = getReplies(message.id);
                const isExpanded = expandedThreads[message.id];
                const replyingTo = replyTo === message.id;

                return (
                    <View key={message.id} style={styles.messageCard}>
                        {/* Main Message */}
                        <TouchableOpacity
                            style={styles.messageHeader}
                            onPress={() => replies.length > 0 && toggleThread(message.id)}
                            activeOpacity={replies.length > 0 ? 0.7 : 1}
                        >
                            <View style={styles.userAvatar}>
                                <Text style={styles.avatarText}>
                                    {message.user_name?.charAt(0).toUpperCase() || 'S'}
                                </Text>
                            </View>
                            <View style={styles.messageContent}>
                                <View style={styles.messageTop}>
                                    <Text style={styles.userName}>{message.user_name}</Text>
                                    <Text style={styles.messageTime}>{formatTimeAgo(message.created_at)}</Text>
                                </View>
                                <Text style={styles.messageText}>{message.message}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Reply Button */}
                        <View style={styles.messageActions}>
                            {replies.length > 0 && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => toggleThread(message.id)}
                                >
                                    <MaterialIcons
                                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                        size={18}
                                        color="#3B82F6"
                                    />
                                    <Text style={styles.actionText}>
                                        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setReplyTo(replyingTo ? null : message.id)}
                            >
                                <MaterialIcons name="reply" size={18} color="#3B82F6" />
                                <Text style={styles.actionText}>Reply</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Replies Thread */}
                        {isExpanded && replies.length > 0 && (
                            <View style={styles.repliesContainer}>
                                {replies.map((reply) => (
                                    <View key={reply.id} style={styles.replyCard}>
                                        <View style={styles.replyLine} />
                                        <View style={styles.replyContent}>
                                            <View style={styles.userAvatarSmall}>
                                                <Text style={styles.avatarTextSmall}>
                                                    {reply.user_name?.charAt(0).toUpperCase() || 'S'}
                                                </Text>
                                            </View>
                                            <View style={styles.replyBody}>
                                                <View style={styles.replyTop}>
                                                    <Text style={styles.replyUserName}>{reply.user_name}</Text>
                                                    <Text style={styles.replyTime}>{formatTimeAgo(reply.created_at)}</Text>
                                                </View>
                                                <Text style={styles.replyText}>{reply.message}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    emptyDiscussion: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D1D5DB',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    messageCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    messageHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContent: {
        flex: 1,
    },
    messageTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    userName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    messageTime: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    messageText: {
        color: '#D1D5DB',
        fontSize: 14,
        lineHeight: 20,
    },
    messageActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
        marginLeft: 52,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: '500',
    },
    repliesContainer: {
        marginTop: 12,
        marginLeft: 26,
    },
    replyCard: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    replyLine: {
        width: 2,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        marginRight: 12,
        borderRadius: 1,
    },
    replyContent: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    userAvatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    replyBody: {
        flex: 1,
    },
    replyTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    replyUserName: {
        color: '#D1D5DB',
        fontSize: 13,
        fontWeight: '600',
    },
    replyTime: {
        color: '#9CA3AF',
        fontSize: 11,
    },
    replyText: {
        color: '#D1D5DB',
        fontSize: 13,
        lineHeight: 18,
    },
});
