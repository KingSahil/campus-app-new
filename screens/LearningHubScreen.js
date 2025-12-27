import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSubjects, createSubject } from '../lib/learningHub';

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
            <LinearGradient
                colors={['#1E1A3B', '#101021', '#0D1B2A']}
                style={styles.gradient}
            />
            <LinearGradient
                colors={['rgba(109, 40, 217, 0.4)', 'rgba(59, 130, 246, 0.2)', 'transparent']}
                style={styles.glowGradient}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Learning Hub</Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Subjects List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#60A5FA" />
                            <Text style={styles.loadingText}>Loading subjects...</Text>
                        </View>
                    ) : subjects.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="school" size={64} color="rgba(255,255,255,0.2)" />
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
                                <View>
                                    <Text style={styles.subjectName}>{subject.name}</Text>
                                    <Text style={styles.subjectTopics}>{subject.topics_preview || 'No topics yet'}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <MaterialIcons name="dashboard" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="school" size={24} color="#60A5FA" />
                        <Text style={[styles.navLabel, { color: '#60A5FA' }]}>Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => navigation.navigate('Notices')}
                    >
                        <MaterialIcons name="notifications" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Notices</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="event-available" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="person" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Profile</Text>
                    </TouchableOpacity>
                </View>

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
        backgroundColor: '#111827',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    glowGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        opacity: 0.3,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#F3F4F6',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    subjectCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subjectName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    subjectTopics: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    loadingText: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: '#F3F4F6',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 20,
        paddingTop: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    navLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        color: '#F9FAFB',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        color: '#F9FAFB',
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
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelButtonText: {
        color: '#9CA3AF',
        fontSize: 15,
        fontWeight: '600',
    },
    addModalButton: {
        backgroundColor: '#60A5FA',
    },
    addModalButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
