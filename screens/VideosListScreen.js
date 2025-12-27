import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getVideosByTopic, createVideo } from '../lib/learningHub';

export default function VideosListScreen({ navigation, route }) {
    const { subject, topic } = route.params;
    
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        if (!topic?.id) return;
        
        setLoading(true);
        const { data, error } = await getVideosByTopic(topic.id);
        
        if (error) {
            Alert.alert('Error', 'Failed to load videos: ' + error.message);
        } else {
            setVideos(data || []);
        }
        setLoading(false);
    };

    const handleAddVideo = async () => {
        if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
            Alert.alert('Error', 'Please fill in both title and video link');
            return;
        }

        if (!topic?.id) {
            Alert.alert('Error', 'Topic information is missing');
            return;
        }

        setSubmitting(true);
        const { data, error } = await createVideo(topic.id, newVideoTitle, newVideoUrl);
        setSubmitting(false);

        if (error) {
            Alert.alert('Error', 'Failed to add video: ' + error.message);
            return;
        }

        setVideos([data, ...videos]);
        setNewVideoTitle('');
        setNewVideoUrl('');
        setModalVisible(false);
        Alert.alert('Success', 'Video added successfully!');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#111827', '#1F2937']}
                style={styles.gradient}
            />
            <View style={styles.radialGlow} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color="#F9FAFB" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Videos</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Add Video Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => setModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="add-circle" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add New Video</Text>
                    </TouchableOpacity>
                </View>

                {/* Videos List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4F46E5" />
                            <Text style={styles.loadingText}>Loading videos...</Text>
                        </View>
                    ) : videos.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="play-circle-outline" size={64} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>No videos yet</Text>
                            <Text style={styles.emptySubtext}>Add your first video to start learning</Text>
                        </View>
                    ) : (
                        videos.map((video) => (
                            <TouchableOpacity
                                key={video.id}
                                style={styles.videoCard}
                                onPress={() => navigation.navigate('LectureVideo', { video, topic, subject })}
                                activeOpacity={0.8}
                            >
                                <View style={styles.thumbnailContainer}>
                                    <Image
                                        source={{ uri: video.thumbnail }}
                                        style={styles.thumbnail}
                                    />
                                    <View style={styles.playOverlay}>
                                        <MaterialIcons name="play-circle-outline" size={40} color="rgba(255,255,255,0.8)" />
                                    </View>
                                    <View style={styles.durationBadge}>
                                        <Text style={styles.durationText}>{video.duration}</Text>
                                    </View>
                                </View>
                                <View style={styles.videoInfo}>
                                    <Text style={styles.videoTitle} numberOfLines={2}>
                                        {video.title}
                                    </Text>
                                    <View style={styles.upvotesContainer}>
                                        <MaterialIcons name="thumb-up-off-alt" size={16} color="#4F46E5" />
                                        <Text style={styles.upvotesText}>{video.upvotes || 0} upvotes</Text>
                                    </View>
                                </View>
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
                        <MaterialIcons name="school" size={24} color="#4F46E5" />
                        <Text style={[styles.navLabel, { color: '#4F46E5' }]}>Learning</Text>
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

                {/* Add Video Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Video</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Video Title"
                                placeholderTextColor="#6B7280"
                                value={newVideoTitle}
                                onChangeText={setNewVideoTitle}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Video URL (e.g., YouTube link)"
                                placeholderTextColor="#6B7280"
                                value={newVideoUrl}
                                onChangeText={setNewVideoUrl}
                                autoCapitalize="none"
                                keyboardType="url"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setNewVideoTitle('');
                                        setNewVideoUrl('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.addModalButton]}
                                    onPress={handleAddVideo}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.addModalButtonText}>Add Video</Text>
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
    radialGlow: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '80%',
        height: '50%',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        borderRadius: 9999,
        transform: [{ scaleX: 2 }],
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
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
        borderRadius: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F9FAFB',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    actionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4F46E5',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    videoCard: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    thumbnailContainer: {
        width: 128,
        height: 72,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    videoInfo: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    videoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F9FAFB',
        lineHeight: 20,
    },
    upvotesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    upvotesText: {
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
        color: '#F9FAFB',
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
        backgroundColor: '#4F46E5',
    },
    addModalButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
