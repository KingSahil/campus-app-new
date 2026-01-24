import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function UpvoteTab({
    upvoteCount,
    hasUpvoted,
    loadingUpvote,
    handleUpvote
}) {
    return (
        <View style={styles.upvoteSection}>
            <TouchableOpacity
                style={[
                    styles.upvoteButton,
                    hasUpvoted && styles.upvoteButtonActive
                ]}
                onPress={handleUpvote}
                disabled={loadingUpvote}
            >
                {loadingUpvote ? (
                    <ActivityIndicator color={hasUpvoted ? "#fff" : "#3B82F6"} />
                ) : (
                    <MaterialIcons
                        name={hasUpvoted ? "thumb-up" : "thumb-up-off-alt"}
                        size={32}
                        color={hasUpvoted ? "#fff" : "#3B82F6"}
                    />
                )}
            </TouchableOpacity>
            <Text style={styles.upvoteCount}>
                {upvoteCount.toLocaleString()} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}
            </Text>
            <Text style={styles.upvoteSubtext}>
                {hasUpvoted ? 'You upvoted this video' : 'Tap to upvote this video'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
    upvoteButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
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
});
