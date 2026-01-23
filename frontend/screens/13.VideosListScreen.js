import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getVideosByTopic, createVideo, deleteVideo } from '../lib/learningHub';
import Background from '../components/Background';

export default function VideosListScreen({ navigation, route }) {
    const { subjectId, subjectName, topicId, topicName, subject: subjectObj, topic: topicObj } = route.params || {};

    let subject = subjectObj;
    if (!subject || subject === '[object Object]') {
        subject = { id: subjectId, name: subjectName };
    }

    let topic = topicObj;
    if (!topic || topic === '[object Object]') {
        topic = { id: topicId, name: topicName };
    }

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    useEffect(() => {
        loadVideos();
    }, []);

    // Reload videos when screen comes into focus (e.g., after returning from video player)
    useFocusEffect(
        React.useCallback(() => {
            loadVideos();
        }, [topic?.id])
    );

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

    const handleDeleteVideo = async (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this video?')) {
                const previousVideos = [...videos];
                setVideos(videos.filter(v => v.id !== id));

                const { error } = await deleteVideo(id);
                if (error) {
                    setVideos(previousVideos);
                    alert('Failed to delete video: ' + error.message);
                }
            }
            return;
        }

        Alert.alert(
            'Delete Video',
            'Are you sure you want to delete this video?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const previousVideos = [...videos];
                        setVideos(videos.filter(v => v.id !== id));

                        const { error } = await deleteVideo(id);
                        if (error) {
                            setVideos(previousVideos);
                            Alert.alert('Error', 'Failed to delete video');
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
                                <Text style={styles.title}>{topic.name}</Text>
                                <Text style={styles.subtitle}>{subject.name}</Text>
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

                        {/* Videos List */}
                        <View style={[styles.section, { marginBottom: 100 }]}        >
                            {loading ? (
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator size="large" color="#0A84FF" />
                                    <Text style={styles.loadingText}>Loading videos...</Text>
                                </View>
                            ) : videos.length === 0 ? (
                                <View style={styles.emptyCard}>
                                    <MaterialIcons name="play-circle-outline" size={48} color="#8E8E93" />
                                    <Text style={styles.emptyText}>No videos yet</Text>
                                    <Text style={styles.emptySubtext}>Add your first video to start learning</Text>
                                </View>
                            ) : (
                                videos.map((video) => (
                                    <TouchableOpacity
                                        key={video.id}
                                        style={styles.videoCard}
                                        onPress={() => navigation.navigate('LectureVideo', {
                                            video,
                                            videoId: video.id,
                                            videoUrl: video.url,
                                            videoTitle: video.title,
                                            videoDescription: video.description,
                                            videoThumbnail: video.thumbnail,
                                            videoDuration: video.duration,
                                            videoUpvotes: video.upvotes,
                                            topicId: topic.id,
                                            topicName: topic.name,
                                            subjectId: subject.id,
                                            subjectName: subject.name
                                        })}
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
                                                <MaterialIcons name="thumb-up-off-alt" size={16} color="#0A84FF" />
                                                <Text style={styles.upvotesText}>{video.upvotes || 0} upvotes</Text>
                                            </View>
                                        </View>
                                        {isDeleteMode && (
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDeleteVideo(video.id)}
                                            >
                                                <MaterialIcons name="delete" size={24} color="#FF3B30" />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>

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
    videoCard: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
        backgroundColor: 'rgba(28, 28, 46, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        borderRadius: 12,
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
        color: '#ffffff',
        lineHeight: 20,
    },
    upvotesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    upvotesText: {
        fontSize: 13,
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
