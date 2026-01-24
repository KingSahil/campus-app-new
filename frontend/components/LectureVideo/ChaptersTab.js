import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChaptersTab({
    chapters,
    loadingChapters,
    overallSummary,
    generateChapters,
    isYouTubeVideo,
    handleSeekToTimestamp
}) {
    if (!chapters.length) {
        return (
            <View style={styles.chaptersCard}>
                <MaterialIcons name="video-library" size={48} color="#3B82F6" />
                <Text style={styles.chaptersText}>
                    Generate AI-powered chapters with timestamps and summaries
                </Text>
                {!isYouTubeVideo && (
                    <Text style={styles.chaptersWarning}>
                        ⚠️ Only available for YouTube videos
                    </Text>
                )}
                <TouchableOpacity
                    style={[styles.chaptersButton, !isYouTubeVideo && styles.chaptersButtonDisabled]}
                    onPress={generateChapters}
                    disabled={loadingChapters || !isYouTubeVideo}
                >
                    {loadingChapters ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                            <Text style={styles.chaptersButtonText}>Generate Chapters</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View>
            {/* Overall Summary */}
            {overallSummary ? (
                <View style={styles.overallSummaryCard}>
                    <View style={styles.summaryHeader}>
                        <MaterialIcons name="description" size={24} color="#3B82F6" />
                        <Text style={styles.overallSummaryTitle}>Video Summary</Text>
                    </View>
                    <Text style={styles.overallSummaryText}>{overallSummary}</Text>
                </View>
            ) : null}

            {/* Chapters List */}
            <View style={styles.chaptersHeader}>
                <Text style={styles.chaptersListTitle}>Chapters ({chapters.length})</Text>
                <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={generateChapters}
                    disabled={loadingChapters}
                >
                    <MaterialIcons name="refresh" size={18} color="#3B82F6" />
                    <Text style={styles.regenerateText}>Regenerate</Text>
                </TouchableOpacity>
            </View>

            {chapters.map((chapter, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.chapterCard}
                    onPress={() => handleSeekToTimestamp(chapter.timestamp)}
                >
                    <View style={styles.chapterLeft}>
                        <View style={styles.chapterNumber}>
                            <Text style={styles.chapterNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.chapterInfo}>
                            <Text style={styles.chapterTimestamp}>{chapter.timestamp}</Text>
                            <Text style={styles.chapterTitle}>{chapter.title}</Text>
                            <Text style={styles.chapterSummary}>{chapter.summary}</Text>
                        </View>
                    </View>
                    <MaterialIcons name="play-circle-outline" size={28} color="#3B82F6" />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    chaptersCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    chaptersText: {
        fontSize: 15,
        color: '#D1D5DB',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    chaptersWarning: {
        fontSize: 13,
        color: '#F59E0B',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    chaptersButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chaptersButtonDisabled: {
        backgroundColor: '#374151',
        opacity: 0.5,
    },
    chaptersButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    overallSummaryCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    overallSummaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
    },
    overallSummaryText: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
    },
    chaptersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chaptersListTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    regenerateText: {
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: '500',
    },
    chapterCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chapterLeft: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    chapterNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    chapterNumberText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    chapterInfo: {
        flex: 1,
    },
    chapterTimestamp: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '600',
        marginBottom: 4,
    },
    chapterTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    chapterSummary: {
        fontSize: 13,
        color: '#9CA3AF',
        lineHeight: 18,
    },
});
