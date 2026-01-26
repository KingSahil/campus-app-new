import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';
import Background from '../components/Background';

export default function QuestionsListScreen({ navigation, route }) {
    const { subjectId, subjectName, topicId, topicName, subject: subjectObj, topic: topicObj } = route.params || {};

    let subject = subjectObj;
    if (!subject || subject === '[object Object]') {
        subject = { id: subjectId, name: subjectName };
    }

    let topic = topicObj;
    if (!topic || topic === '[object Object]') {
        topic = { id: topicId, name: topicName };
    }

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newQuestionTitle, setNewQuestionTitle] = useState('');
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [newQuestionAnswer, setNewQuestionAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    useEffect(() => {
        getUserInfo();
        loadQuestions();
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

    const loadQuestions = async () => {
        if (!topic?.id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('topic_id', topic.id)
                .order('upvotes', { ascending: false });

            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load questions: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestionContent.trim()) {
            Alert.alert('Error', 'Please enter question content');
            return;
        }

        if (!user?.sub) {
            Alert.alert('Sign In Required', 'Please sign in to add questions');
            return;
        }

        setSubmitting(true);
        try {
            // Generate a title from the first 50 characters of the question content
            const generatedTitle = newQuestionContent.length > 50
                ? newQuestionContent.substring(0, 50) + '...'
                : newQuestionContent;

            const { data, error } = await supabase
                .from('questions')
                .insert({
                    topic_id: topic.id,
                    subject_id: subject.id,
                    title: generatedTitle,
                    question: newQuestionContent,
                    answer: newQuestionAnswer.trim() || null,
                    question_type: 'theory',
                    created_by: user.sub,
                    created_by_email: user.email,
                })
                .select()
                .single();

            if (error) throw error;

            setQuestions([data, ...questions]);
            setNewQuestionContent('');
            setNewQuestionAnswer('');
            setModalVisible(false);
            Alert.alert('Success', 'Question added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add question: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this question?')) {
                const previousQuestions = [...questions];
                setQuestions(questions.filter(q => q.id !== id));

                const { error } = await supabase
                    .from('questions')
                    .delete()
                    .eq('id', id);

                if (error) {
                    setQuestions(previousQuestions);
                    alert('Failed to delete question: ' + error.message);
                }
            }
            return;
        }
        Alert.alert(
            'Delete Question',
            'Are you sure you want to delete this question?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const previousQuestions = [...questions];
                        setQuestions(questions.filter(q => q.id !== id));

                        const { error } = await supabase
                            .from('questions')
                            .delete()
                            .eq('id', id);

                        if (error) {
                            setQuestions(previousQuestions);
                            Alert.alert('Error', 'Failed to delete question');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Background />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.contentColumn}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="arrow-back-ios" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>Questions</Text>
                                <Text style={styles.subtitle}>{topic.name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => setIsDeleteMode(!isDeleteMode)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name={isDeleteMode ? "delete" : "delete-outline"}
                                        size={24}
                                        color={isDeleteMode ? "#FF3B30" : "#8E8E93"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => setModalVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="add" size={24} color="#8E8E93" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Questions List */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            {loading ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator size="large" color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading questions...</Text>
                                </View>
                            ) : questions.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="quiz" size={48} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No questions yet</Text>
                                    <Text style={styles.emptySubtext}>Add your first question to get started</Text>
                                </View>
                            ) : (
                                questions.map((question) => (
                                    <TouchableOpacity
                                        key={question.id}
                                        style={styles.questionCard}
                                        onPress={() => navigation.navigate('QuestionDetail', {
                                            question,
                                            subjectId: subject.id,
                                            subjectName: subject.name,
                                            topicId: topic.id,
                                            topicName: topic.name
                                        })}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.questionContent}>
                                            <View style={styles.questionInfo}>
                                                <Text style={styles.questionTitle} numberOfLines={3}>
                                                    {question.question}
                                                </Text>
                                            </View>
                                            <View style={styles.questionStats}>
                                                <View style={styles.upvoteContainer}>
                                                    <MaterialIcons name="arrow-upward" size={16} color="#0A84FF" />
                                                    <Text style={styles.upvoteCount}>{question.upvotes || 0}</Text>
                                                </View>
                                                {isDeleteMode ? (
                                                    <TouchableOpacity
                                                        style={styles.deleteButton}
                                                        onPress={() => handleDeleteQuestion(question.id)}
                                                    >
                                                        <MaterialIcons name="delete" size={24} color="#FF3B30" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Add Question Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <ScrollView
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Add New Question</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <MaterialIcons name="close" size={24} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Question"
                                    placeholderTextColor="#6B7280"
                                    value={newQuestionContent}
                                    onChangeText={setNewQuestionContent}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />

                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Answer (Optional)"
                                    placeholderTextColor="#6B7280"
                                    value={newQuestionAnswer}
                                    onChangeText={setNewQuestionAnswer}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            setNewQuestionContent('');
                                            setNewQuestionAnswer('');
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.addModalButton]}
                                        onPress={handleAddQuestion}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.addModalButtonText}>Add Question</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
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
        ...Platform.select({ web: { paddingTop: 20 } }),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    contentColumn: {
        width: '100%',
        maxWidth: 1400,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: 32,
    },
    questionCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }
        }),
    },
    questionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questionInfo: {
        flex: 1,
        marginRight: 12,
    },
    questionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        lineHeight: 22,
        marginBottom: 4,
    },
    questionPreview: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    questionStats: {
        alignItems: 'center',
        gap: 8,
    },
    upvoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    upvoteCount: {
        fontSize: 14,
        color: '#0A84FF',
        fontWeight: '600',
    },
    loadingCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    emptyCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalScrollContent: {
        justifyContent: 'center',
        minHeight: '100%',
    },
    modalContent: {
        backgroundColor: 'rgba(28, 28, 46, 0.95)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 14,
        color: '#ffffff',
        fontSize: 15,
        marginBottom: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cancelButtonText: {
        color: '#8E8E93',
        fontSize: 15,
        fontWeight: '600',
    },
    addModalButton: {
        backgroundColor: '#0A84FF',
    },
    addModalButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
});
