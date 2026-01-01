import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getSubjects, createSubject } from '../lib/learningHub';
import BottomNav from '../components/BottomNav';
import Background from '../components/Background';

export default function LearningHubScreen({ navigation }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setLoading(true);
        console.log('Loading subjects...');
        const { data, error } = await getSubjects();
        
        console.log('Subjects response:', { data, error });
        
        if (error) {
            console.error('Error loading subjects:', error);
            Alert.alert('Error', 'Failed to load subjects: ' + error.message);
            setLoading(false);
        } else {
            console.log('Subjects loaded:', data);
            setSubjects(data || []);
            setLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) {
            Alert.alert('Error', 'Please enter a subject name');
            return;
        }

        setSubmitting(true);
        const { data, error } = await createSubject(newSubjectName);
        setSubmitting(false);

        if (error) {
            Alert.alert('Error', 'Failed to add subject: ' + error.message);
            return;
        }

        setSubjects([data, ...subjects]);
        setNewSubjectName('');
        setModalVisible(false);
        Alert.alert('Success', 'Subject added successfully!');
    };

    return (
        <View style={styles.container}>
            <Background />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.contentColumn}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Learning Hub</Text>
                                <Text style={styles.subtitle}>Explore your subjects</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.addButton}
                                onPress={() => setModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="add" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        {/* Subjects List */}
                        <View style={[styles.section, { marginBottom: 100 }]}        >
                            {loading ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator size="large" color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading subjects...</Text>
                                </View>
                            ) : subjects.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="school" size={48} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No subjects yet</Text>
                                    <Text style={styles.emptySubtext}>Tap the + button to add your first subject</Text>
                                </View>
                            ) : (
                                subjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        style={styles.subjectCard}
                                        onPress={() => navigation.navigate('SubjectTopics', { subject })}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.subjectInfo}>
                                            <Text style={styles.subjectName}>{subject.name}</Text>
                                            <Text style={styles.subjectTopics}>{subject.topics_preview || 'No topics yet'}</Text>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <BottomNav activeTab="Learning" />

                {/* Add Subject Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Subject</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Subject Name"
                                placeholderTextColor="#6B7280"
                                value={newSubjectName}
                                onChangeText={setNewSubjectName}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setNewSubjectName('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.addModalButton]}
                                    onPress={handleAddSubject}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.addModalButtonText}>Add Subject</Text>
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
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
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
    subjectCard: {
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    subjectInfo: {
        flex: 1,
    },
    subjectName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    subjectTopics: {
        fontSize: 14,
        color: '#8E8E93',
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
