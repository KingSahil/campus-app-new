import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function VideosListScreen({ navigation, route }) {
    const { subject, topic } = route.params;
    
    const videos = [
        {
            id: 1,
            title: 'Introduction to the Fundamentals',
            thumbnail: 'https://picsum.photos/320/180?random=1',
            upvotes: 20,
            duration: '10:45',
        },
        {
            id: 2,
            title: 'Deep Dive into Core Concepts',
            thumbnail: 'https://picsum.photos/320/180?random=2',
            upvotes: 15,
            duration: '15:30',
        },
        {
            id: 3,
            title: 'Practical Applications and Examples',
            thumbnail: 'https://picsum.photos/320/180?random=3',
            upvotes: 32,
            duration: '12:20',
        },
        {
            id: 4,
            title: 'Advanced Techniques Explained',
            thumbnail: 'https://picsum.photos/320/180?random=4',
            upvotes: 18,
            duration: '18:15',
        },
    ];

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

                {/* Videos List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {videos.map((video) => (
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
                                    <Text style={styles.upvotesText}>{video.upvotes} upvotes</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
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
});
