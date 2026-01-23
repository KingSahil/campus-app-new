import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getTopicsBySubject, createTopic, deleteTopic } from '../lib/learningHub';
import Background from '../components/Background';

export default function SubjectTopicsScreen({ route, navigation }) {
    const { subject: subjectParam, subjectId, subjectName } = route.params || {};

    // Reconstruct subject if lost during refresh or malformed
    let subject = subjectParam;
    if (!subject || subject === '[object Object]') {
        if (subjectId) {
            subject = { id: subjectId, name: subjectName };
        }
    }

    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        if (!subject?.id) return;

        setLoading(true);
        const { data, error } = await getTopicsBySubject(subject.id);

        if (error) {
            Alert.alert('Error', 'Failed to load topics: ' + error.message);
        } else {
            setTopics(data || []);
        }
        setLoading(false);
    };

    const handleAddTopic = async () => {
        if (!newTopicName.trim()) {
            Alert.alert('Error', 'Please enter a topic name');
            return;
        }

        if (!subject?.id) {
            Alert.alert('Error', 'Subject information is missing');
            return;
        }

        setSubmitting(true);
        const { data, error } = await createTopic(subject.id, newTopicName);
        setSubmitting(false);

        if (error) {
            Alert.alert('Error', 'Failed to add topic: ' + error.message);
            return;
        }

        setNewTopicName('');
        setModalVisible(false);

        // Reload topics to ensure fresh data from database
        await loadTopics();

        Alert.alert('Success', 'Topic added successfully!');
    };

    const handleDeleteTopic = async (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this topic?')) {
                const previousTopics = [...topics];
                setTopics(topics.filter(t => t.id !== id));

                const { error } = await deleteTopic(id);
                if (error) {
                    setTopics(previousTopics);
                    alert('Failed to delete topic: ' + error.message);
                }
            }
            return;
        }

        Alert.alert(
            'Delete Topic',
            'Are you sure you want to delete this topic?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const previousTopics = [...topics];
                        setTopics(topics.filter(t => t.id !== id));

                        const { error } = await deleteTopic(id);
                        if (error) {
                            setTopics(previousTopics);
                            Alert.alert('Error', 'Failed to delete topic');
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
                            <View>
                                <Text style={styles.title}>{subject.name}</Text>
                                <Text style={styles.subtitle}>Topics & Lessons</Text>
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

                        {/* Topics List */}
                        <View style={[styles.section, { marginBottom: 100 }]}        >
                            {loading ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator size="large" color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading topics...</Text>
                                </View>
                            ) : topics.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="topic" size={48} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No topics yet</Text>
                                    <Text style={styles.emptySubtext}>Add your first topic to get started</Text>
                                </View>
                            ) : (
                                topics.map((topic) => (
                                    <TouchableOpacity
                                        key={topic.id}
                                        style={styles.topicCard}
                                        onPress={() => navigation.navigate('MaterialSelect', {
                                            subjectId: subject.id,
                                            subjectName: subject.name,
                                            topicId: topic.id,
                                            topicName: topic.name
                                        })}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.topicInfo}>
                                            <Text style={styles.topicName}>{topic.name}</Text>
                                            <Text style={styles.videoCount}>{topic.video_count || 0} videos</Text>
                                        </View>
                                        {isDeleteMode ? (
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDeleteTopic(topic.id)}
                                            >
                                                <MaterialIcons name="delete" size={24} color="#FF3B30" />
                                            </TouchableOpacity>
                                        ) : (
                                            <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Add Topic Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Topic</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Topic Name"
                                placeholderTextColor="#6B7280"
                                value={newTopicName}
                                onChangeText={setNewTopicName}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setNewTopicName('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.addModalButton]}
                                    onPress={handleAddTopic}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.addModalButtonText}>Add Topic</Text>
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
    topicCard: {
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
    topicInfo: {
        flex: 1,
    },
    topicName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    videoCount: {
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
