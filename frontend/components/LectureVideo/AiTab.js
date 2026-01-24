import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

export default function AiTab({ summary }) {
    if (summary) {
        return (
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                    Answer
                </Text>
                <Markdown style={{
                    body: styles.summaryText,
                    heading1: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginVertical: 8 },
                    heading2: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginVertical: 6 },
                    heading3: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginVertical: 4 },
                    strong: { fontWeight: 'bold', color: '#fff' },
                    em: { fontStyle: 'italic', color: '#D1D5DB' },
                    code_inline: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#8B5CF6', paddingHorizontal: 4, borderRadius: 4 },
                    code_block: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#D1D5DB', padding: 12, borderRadius: 8, marginVertical: 8 },
                    fence: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#D1D5DB', padding: 12, borderRadius: 8, marginVertical: 8 },
                    bullet_list: { color: '#D1D5DB' },
                    ordered_list: { color: '#D1D5DB' },
                    list_item: { color: '#D1D5DB', marginVertical: 2 },
                    blockquote: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeftColor: '#3B82F6', borderLeftWidth: 4, paddingLeft: 12, paddingVertical: 8, marginVertical: 8 },
                    link: { color: '#3B82F6' },
                }}>{summary}</Markdown>
            </View>
        );
    }

    return (
        <View style={styles.aiCard}>
            <MaterialIcons name="auto-awesome" size={32} color="#8B5CF6" />
            <Text style={styles.aiText}>
                Ask AI anything about this video and get instant answers
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 15,
        color: '#D1D5DB',
        lineHeight: 24,
    },
    aiCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        gap: 16,
        marginTop: 40,
    },
    aiText: {
        fontSize: 16,
        color: '#D1D5DB',
        textAlign: 'center',
        lineHeight: 24,
    },
});
