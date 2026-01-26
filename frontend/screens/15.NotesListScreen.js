import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';
import Background from '../components/Background';

export default function NotesListScreen({ navigation, route }) {
    const { subjectId, subjectName, topicId, topicName, subject: subjectObj, topic: topicObj } = route.params || {};

    let subject = subjectObj;
    if (!subject || subject === '[object Object]') {
        subject = { id: subjectId, name: subjectName };
    }

    let topic = topicObj;
    if (!topic || topic === '[object Object]') {
        topic = { id: topicId, name: topicName };
    }

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNotePdfLink, setNewNotePdfLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    useEffect(() => {
        getUserInfo();
        loadNotes();
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

    const loadNotes = async () => {
        if (!topic?.id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('topic_id', topic.id)
                .order('upvotes', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load notes: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNoteTitle.trim()) {
            Alert.alert('Error', 'Please enter a note title');
            return;
        }

        if (!user?.sub) {
            Alert.alert('Sign In Required', 'Please sign in to add notes');
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('notes')
                .insert({
                    topic_id: topic.id,
                    subject_id: subject.id,
                    title: newNoteTitle,
                    pdf_link: newNotePdfLink.trim() || null,
                    created_by: user.sub,
                    created_by_email: user.email,
                })
                .select()
                .single();

            if (error) throw error;

            setNotes([data, ...notes]);
            setNewNoteTitle('');
            setNewNotePdfLink('');
            setModalVisible(false);
            Alert.alert('Success', 'Note added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add note: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this note?')) {
                const previousNotes = [...notes];
                setNotes(notes.filter(n => n.id !== id));

                const { error } = await supabase
                    .from('notes')
                    .delete()
                    .eq('id', id);

                if (error) {
                    setNotes(previousNotes);
                    alert('Failed to delete note: ' + error.message);
                }
            }
            return;
        }
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const previousNotes = [...notes];
                        setNotes(notes.filter(n => n.id !== id));

                        const { error } = await supabase
                            .from('notes')
                            .delete()
                            .eq('id', id);

                        if (error) {
                            setNotes(previousNotes);
                            Alert.alert('Error', 'Failed to delete note');
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
                                <Text style={styles.title}>Notes</Text>
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

                        {/* Notes List */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            {loading ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator size="large" color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading notes...</Text>
                                </View>
                            ) : notes.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="description" size={48} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No notes yet</Text>
                                    <Text style={styles.emptySubtext}>Add your first note to get started</Text>
                                </View>
                            ) : (
                                notes.map((note) => (
                                    <TouchableOpacity
                                        key={note.id}
                                        style={styles.noteCard}
                                        onPress={() => navigation.navigate('NoteDetail', {
                                            note,
                                            subjectId: subject.id,
                                            subjectName: subject.name,
                                            topicId: topic.id,
                                            topicName: topic.name
                                        })}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.noteContent}>
                                            <View style={styles.noteInfo}>
                                                <Text style={styles.noteTitle}>{note.title}</Text>
                                                {note.pdf_link && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                        <MaterialIcons name="picture-as-pdf" size={14} color="#FF3B30" style={{ marginRight: 4 }} />
                                                        <Text style={{ color: '#0A84FF', fontSize: 12 }}>PDF Attached</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.noteStats}>
                                                <View style={styles.upvoteContainer}>
                                                    <MaterialIcons name="arrow-upward" size={16} color="#0A84FF" />
                                                    <Text style={styles.upvoteCount}>{note.upvotes || 0}</Text>
                                                </View>
                                                {isDeleteMode ? (
                                                    <TouchableOpacity
                                                        style={styles.deleteButton}
                                                        onPress={() => handleDeleteNote(note.id)}
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

                {/* Add Note Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Note</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Note Title"
                                placeholderTextColor="#6B7280"
                                value={newNoteTitle}
                                onChangeText={setNewNoteTitle}
                            />


                            <TextInput
                                style={styles.input}
                                placeholder="Google Drive PDF Link"
                                placeholderTextColor="#6B7280"
                                value={newNotePdfLink}
                                onChangeText={setNewNotePdfLink}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setNewNoteTitle('');
                                        setNewNotePdfLink('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.addModalButton]}
                                    onPress={handleAddNote}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.addModalButtonText}>Add Note</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
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
    noteCard: {
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
    noteContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteInfo: {
        flex: 1,
        marginRight: 12,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    notePreview: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
    noteStats: {
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
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'rgba(28, 28, 46, 0.95)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
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
        minHeight: 120,
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
