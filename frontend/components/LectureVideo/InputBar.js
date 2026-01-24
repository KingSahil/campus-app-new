import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InputBar({
    value,
    onChangeText,
    onSend,
    placeholder,
    loading,
    replyTo,
    onCancelReply
}) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.fixedInputBar, { paddingBottom: Math.max(Platform.OS === 'web' ? 60 : 12, insets.bottom) }]}>
            {replyTo && (
                <View style={styles.replyIndicator}>
                    <MaterialIcons name="reply" size={16} color="#3B82F6" />
                    <Text style={styles.replyIndicatorText}>Replying...</Text>
                    <TouchableOpacity
                        onPress={onCancelReply}
                        style={styles.cancelReplyIconButton}
                    >
                        <MaterialIcons name="close" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.fixedMessageInput}
                    placeholder={placeholder}
                    placeholderTextColor="#6B7280"
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    autoFocus={!!replyTo}
                    onKeyPress={(e) => {
                        if (Platform.OS === 'web') {
                            if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                                e.preventDefault();
                                if (value.trim() && !loading) {
                                    onSend();
                                }
                            }
                        }
                    }}
                />
                <TouchableOpacity
                    style={[styles.fixedSendButton, (!value.trim() || loading) && styles.sendButtonDisabled]}
                    onPress={onSend}
                    disabled={!value.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <MaterialIcons name={placeholder.includes("AI") ? "auto-awesome" : "send"} size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fixedInputBar: {
        flexDirection: 'column',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    replyIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    replyIndicatorText: {
        flex: 1,
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '500',
    },
    cancelReplyIconButton: {
        padding: 4,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end',
    },
    fixedMessageInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
    },
    fixedSendButton: {
        backgroundColor: '#3B82F6',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#374151',
        opacity: 0.5,
    },
});
