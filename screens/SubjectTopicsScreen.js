import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getTopicsBySubject, createTopic } from '../lib/learningHub';

export default function SubjectTopicsScreen({ navigation, route }) {
    const { subject } = route.params;
    
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

        setTopics([data, ...topics]);
        setNewTopicName('');
        setModalVisible(false);
        Alert.alert('Success', 'Topic added successfully!');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0e0520', '#06091e', '#0d041e', '#150624']}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.gradient}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{subject.name}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Add/Remove Topic Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => setModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="add-circle" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Add New Topic</Text>
                    </TouchableOpacity>
                </View>

                {/* Topics List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#8B5CF6" />
                            <Text style={styles.loadingText}>Loading topics...</Text>
                        </View>
                    ) : topics.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="topic" size={64} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>No topics yet</Text>
                            <Text style={styles.emptySubtext}>Add your first topic to get started</Text>
                        </View>
                    ) : (
                        topics.map((topic) => (
                            <TouchableOpacity
                                key={topic.id}
                                style={styles.topicCard}
                                onPress={() => navigation.navigate('VideosList', { subject, topic })}
                                activeOpacity={0.8}
                            >
                                <View style={styles.topicInfo}>
                                    <Text style={styles.topicName}>{topic.name}</Text>
                                    <Text style={styles.videoCount}>{topic.video_count || 0} videos</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
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
                        <MaterialIcons name="school" size={24} color="#8B5CF6" />
                        <Text style={[styles.navLabel, { color: '#8B5CF6' }]}>Learning</Text>
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
        backgroundColor: '#111827',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    topicCard: {
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
    topicInfo: {
        flex: 1,
    },
    topicName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#E5E7EB',
        marginBottom: 4,
    },
    videoCount: {
        fontSize: 13,
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
        color: '#E5E7EB',
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
        backgroundColor: 'rgba(0,0,0,0.2)',
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
        fontWeight: '500',
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
        backgroundColor: '#8B5CF6',
    },
    addModalButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
