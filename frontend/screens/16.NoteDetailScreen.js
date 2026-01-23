import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';
import Background from '../components/Background';

export default function NoteDetailScreen({ navigation, route }) {
    const { note, subjectId, subjectName, topicId, topicName, subject: subjectObj, topic: topicObj } = route.params || {};

    const subject = subjectObj || { id: subjectId, name: subjectName };
    const topic = topicObj || { id: topicId, name: topicName };

    const [activeTab, setActiveTab] = useState('content');
    const [user, setUser] = useState(null);

    // Upvote states
    const [upvoteCount, setUpvoteCount] = useState(note.upvotes || 0);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [loadingUpvote, setLoadingUpvote] = useState(false);

    // Discussion states
    const [discussions, setDiscussions] = useState([]);
    const [loadingDiscussions, setLoadingDiscussions] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [expandedThreads, setExpandedThreads] = useState({});

    // Ask AI states
    const [userQuestion, setUserQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        getUserInfo();
        fetchUpvotes();
        fetchDiscussions();

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const getUserInfo = async () => {
        try {
            const userInfo = await auth0.getUser();
            const userData = userInfo?.data?.user || userInfo;
            setUser(userData);
        } catch (error) {
            console.log('Error getting user:', error);
        }
    };

    const fetchUpvotes = async () => {
        try {
            const noteId = note.id.toString();

            const { data, error, count } = await supabase
                .from('note_upvotes')
                .select('*', { count: 'exact' })
                .eq('note_id', noteId);

            if (error) {
                console.error('Error fetching upvotes:', error);
                return;
            }

            setUpvoteCount(count || 0);

            const userInfo = await auth0.getUser();
            const userData = userInfo?.data?.user || userInfo;
            const userId = userData?.sub;

            if (userId) {
                const userUpvote = data?.find(upvote => upvote.user_id === userId);
                setHasUpvoted(!!userUpvote);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpvote = async () => {
        if (!user?.sub) {
            Alert.alert('Sign In Required', 'Please sign in to upvote notes');
            return;
        }

        setLoadingUpvote(true);
        try {
            const noteId = note.id.toString();
            const userId = user.sub;
            const userEmail = user.email;

            if (hasUpvoted) {
                const { error } = await supabase
                    .from('note_upvotes')
                    .delete()
                    .eq('note_id', noteId)
                    .eq('user_id', userId);

                if (error) throw error;

                const { count } = await supabase
                    .from('note_upvotes')
                    .select('*', { count: 'exact', head: true })
                    .eq('note_id', noteId);

                await supabase
                    .from('notes')
                    .update({ upvotes: count || 0 })
                    .eq('id', note.id);

                setHasUpvoted(false);
                setUpvoteCount(count || 0);
            } else {
                const { error } = await supabase
                    .from('note_upvotes')
                    .insert({
                        note_id: noteId,
                        note_title: note.title,
                        user_id: userId,
                        user_email: userEmail,
                    });

                if (error) throw error;

                const { count } = await supabase
                    .from('note_upvotes')
                    .select('*', { count: 'exact', head: true })
                    .eq('note_id', noteId);

                await supabase
                    .from('notes')
                    .update({ upvotes: count || 0 })
                    .eq('id', note.id);

                setHasUpvoted(true);
                setUpvoteCount(count || 0);
            }
        } catch (error) {
            console.error('Error toggling upvote:', error);
            Alert.alert('Error', 'Failed to update upvote. Please try again.');
        } finally {
            setLoadingUpvote(false);
        }
    };

    const fetchDiscussions = async () => {
        setLoadingDiscussions(true);
        try {
            const { data, error } = await supabase
                .from('note_discussions')
                .select('*')
                .eq('note_id', note.id.toString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            const threaded = data.filter(d => !d.parent_id);
            setDiscussions(threaded);
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoadingDiscussions(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        if (!user?.sub) {
            Alert.alert('Sign In Required', 'Please sign in to post messages');
            return;
        }

        try {
            const { error } = await supabase
                .from('note_discussions')
                .insert({
                    note_id: note.id.toString(),
                    note_title: note.title,
                    user_id: user.sub,
                    user_email: user.email,
                    message: newMessage.trim(),
                });

            if (error) throw error;

            setNewMessage('');
            Keyboard.dismiss();
            fetchDiscussions();
        } catch (error) {
            console.error('Error posting message:', error);
            Alert.alert('Error', 'Failed to post message');
        }
    };

    const handleReply = async (parentId) => {
        if (!replyText.trim()) return;
        if (!user?.sub) {
            Alert.alert('Sign In Required', 'Please sign in to reply');
            return;
        }

        try {
            const { error } = await supabase
                .from('note_discussions')
                .insert({
                    note_id: note.id.toString(),
                    note_title: note.title,
                    user_id: user.sub,
                    user_email: user.email,
                    message: replyText.trim(),
                    parent_id: parentId,
                });

            if (error) throw error;

            setReplyText('');
            setReplyTo(null);
            Keyboard.dismiss();
            fetchDiscussions();
        } catch (error) {
            console.error('Error posting reply:', error);
            Alert.alert('Error', 'Failed to post reply');
        }
    };

    const getReplies = async (parentId) => {
        try {
            const { data, error } = await supabase
                .from('note_discussions')
                .select('*')
                .eq('parent_id', parentId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching replies:', error);
            return [];
        }
    };

    const toggleThread = async (discussionId) => {
        if (expandedThreads[discussionId]) {
            setExpandedThreads({ ...expandedThreads, [discussionId]: null });
        } else {
            const replies = await getReplies(discussionId);
            setExpandedThreads({ ...expandedThreads, [discussionId]: replies });
        }
    };

    const askAI = async () => {
        if (!userQuestion.trim()) {
            Alert.alert('Error', 'Please enter your question');
            return;
        }

        Keyboard.dismiss();
        setLoadingAI(true);
        try {
            const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

            const response = await fetch(`${BACKEND_URL}/ai-note-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    note_title: note.title,
                    note_content: note.content,
                    question: userQuestion,
                    api_provider: 'gemini'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.answer) {
                setAiAnswer(data.answer);
            } else {
                Alert.alert('Error', 'No answer generated. Please try again.');
            }
        } catch (error) {
            console.error('AI Error:', error);
            Alert.alert('Error', 'Failed to generate answer: ' + error.message);
        } finally {
            setLoadingAI(false);
        }
    };

    const renderContent = () => (
        <View style={styles.tabContent}>
            <Markdown style={markdownStyles}>
                {note.content}
            </Markdown>
        </View>
    );

    const renderDiscussion = () => (
        <View style={styles.tabContent}>
            {loadingDiscussions ? (
                <ActivityIndicator size="large" color="#0A84FF" />
            ) : (
                <>
                    <ScrollView style={styles.discussionList}>
                        {discussions.length === 0 ? (
                            <Text style={styles.noDiscussions}>No discussions yet. Be the first to comment!</Text>
                        ) : (
                            discussions.map((discussion) => (
                                <View key={discussion.id} style={styles.discussionItem}>
                                    <View style={styles.discussionHeader}>
                                        <Text style={styles.discussionUser}>{discussion.user_email}</Text>
                                        <Text style={styles.discussionTime}>
                                            {new Date(discussion.created_at).toLocaleString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.discussionMessage}>{discussion.message}</Text>

                                    <TouchableOpacity
                                        onPress={() => toggleThread(discussion.id)}
                                        style={styles.replyButton}
                                    >
                                        <MaterialIcons name="reply" size={16} color="#0A84FF" />
                                        <Text style={styles.replyButtonText}>
                                            {expandedThreads[discussion.id] ? 'Hide replies' : 'Reply'}
                                        </Text>
                                    </TouchableOpacity>

                                    {expandedThreads[discussion.id] && (
                                        <View style={styles.repliesContainer}>
                                            {expandedThreads[discussion.id].map((reply) => (
                                                <View key={reply.id} style={styles.replyItem}>
                                                    <View style={styles.discussionHeader}>
                                                        <Text style={styles.discussionUser}>{reply.user_email}</Text>
                                                        <Text style={styles.discussionTime}>
                                                            {new Date(reply.created_at).toLocaleString()}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.discussionMessage}>{reply.message}</Text>
                                                </View>
                                            ))}

                                            {replyTo === discussion.id ? (
                                                <View style={styles.replyInputContainer}>
                                                    <TextInput
                                                        style={styles.replyInput}
                                                        placeholder="Write a reply..."
                                                        placeholderTextColor="#6B7280"
                                                        value={replyText}
                                                        onChangeText={setReplyText}
                                                        multiline
                                                    />
                                                    <View style={styles.replyActions}>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setReplyTo(null);
                                                                setReplyText('');
                                                            }}
                                                            style={styles.replyCancelButton}
                                                        >
                                                            <Text style={styles.replyCancelText}>Cancel</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => handleReply(discussion.id)}
                                                            style={styles.replySendButton}
                                                        >
                                                            <Text style={styles.replySendText}>Send</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    onPress={() => setReplyTo(discussion.id)}
                                                    style={styles.writeReplyButton}
                                                >
                                                    <Text style={styles.writeReplyText}>Write a reply...</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {!keyboardVisible && (
                        <View style={styles.messageInputContainer}>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Share your thoughts..."
                                placeholderTextColor="#6B7280"
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                style={styles.sendButton}
                                disabled={!newMessage.trim()}
                            >
                                <MaterialIcons
                                    name="send"
                                    size={24}
                                    color={newMessage.trim() ? '#0A84FF' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );

    const renderAskAI = () => (
        <KeyboardAvoidingView
            style={styles.tabContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.aiContainer}>
                <Text style={styles.aiTitle}>Ask AI about this note</Text>
                <Text style={styles.aiSubtitle}>Get instant answers to your questions</Text>

                <TextInput
                    style={styles.aiInput}
                    placeholder="What would you like to know?"
                    placeholderTextColor="#6B7280"
                    value={userQuestion}
                    onChangeText={setUserQuestion}
                    multiline
                />

                <TouchableOpacity
                    style={[styles.aiButton, loadingAI && styles.aiButtonDisabled]}
                    onPress={askAI}
                    disabled={loadingAI}
                >
                    {loadingAI ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.aiButtonText}>Ask AI</Text>
                    )}
                </TouchableOpacity>

                {aiAnswer ? (
                    <ScrollView style={styles.aiAnswerContainer}>
                        <Text style={styles.aiAnswerTitle}>Answer:</Text>
                        <Markdown style={markdownStyles}>
                            {aiAnswer}
                        </Markdown>
                    </ScrollView>
                ) : null}
            </View>
        </KeyboardAvoidingView>
    );

    return (
        <View style={styles.container}>
            <Background />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#8E8E93" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{note.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.upvoteButton, hasUpvoted && styles.upvoteButtonActive]}
                        onPress={handleUpvote}
                        disabled={loadingUpvote}
                    >
                        {loadingUpvote ? (
                            <ActivityIndicator size="small" color="#0A84FF" />
                        ) : (
                            <>
                                <MaterialIcons
                                    name={hasUpvoted ? "arrow-upward" : "arrow-upward"}
                                    size={20}
                                    color={hasUpvoted ? "#fff" : "#0A84FF"}
                                />
                                <Text style={[styles.upvoteText, hasUpvoted && styles.upvoteTextActive]}>
                                    {upvoteCount}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'content' && styles.activeTab]}
                        onPress={() => setActiveTab('content')}
                    >
                        <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
                            Content
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
                        onPress={() => setActiveTab('discussion')}
                    >
                        <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
                            Discussion
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
                        onPress={() => setActiveTab('ai')}
                    >
                        <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
                            Ask AI
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {activeTab === 'content' && renderContent()}
                {activeTab === 'discussion' && renderDiscussion()}
                {activeTab === 'ai' && renderAskAI()}
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        marginHorizontal: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
    },
    upvoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: '#0A84FF',
        borderWidth: 1,
    },
    upvoteButtonActive: {
        backgroundColor: '#0A84FF',
    },
    upvoteText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0A84FF',
    },
    upvoteTextActive: {
        color: '#fff',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#0A84FF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#0A84FF',
    },
    tabContent: {
        flex: 1,
        padding: 20,
    },
    discussionList: {
        flex: 1,
    },
    noDiscussions: {
        textAlign: 'center',
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 20,
    },
    discussionItem: {
        backgroundColor: 'rgba(28, 28, 46, 0.5)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    discussionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    discussionUser: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0A84FF',
    },
    discussionTime: {
        fontSize: 12,
        color: '#8E8E93',
    },
    discussionMessage: {
        fontSize: 14,
        color: '#ffffff',
        lineHeight: 20,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    replyButtonText: {
        fontSize: 12,
        color: '#0A84FF',
        fontWeight: '500',
    },
    repliesContainer: {
        marginTop: 12,
        marginLeft: 16,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(10, 132, 255, 0.3)',
    },
    replyItem: {
        backgroundColor: 'rgba(28, 28, 46, 0.3)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    replyInputContainer: {
        marginTop: 8,
    },
    replyInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 10,
        color: '#ffffff',
        fontSize: 14,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    replyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    replyCancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    replyCancelText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },
    replySendButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#0A84FF',
    },
    replySendText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    writeReplyButton: {
        marginTop: 8,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    writeReplyText: {
        color: '#6B7280',
        fontSize: 14,
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    messageInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#ffffff',
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiContainer: {
        flex: 1,
    },
    aiTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    aiSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 20,
    },
    aiInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 14,
        color: '#ffffff',
        fontSize: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    aiButton: {
        backgroundColor: '#0A84FF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    aiButtonDisabled: {
        opacity: 0.6,
    },
    aiButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    aiAnswerContainer: {
        flex: 1,
        backgroundColor: 'rgba(28, 28, 46, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    aiAnswerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0A84FF',
        marginBottom: 12,
    },
});

const markdownStyles = {
    body: {
        color: '#ffffff',
        fontSize: 15,
        lineHeight: 24,
    },
    heading1: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 12,
    },
    heading2: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 14,
        marginBottom: 10,
    },
    heading3: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
    },
    paragraph: {
        color: '#ffffff',
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    code_inline: {
        backgroundColor: 'rgba(10, 132, 255, 0.1)',
        color: '#0A84FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    code_block: {
        backgroundColor: 'rgba(28, 28, 46, 0.5)',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
    },
    fence: {
        backgroundColor: 'rgba(28, 28, 46, 0.5)',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
    },
    list_item: {
        color: '#ffffff',
        fontSize: 15,
        lineHeight: 24,
    },
};
