import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Platform, StyleSheet, Dimensions, Alert } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
    if (!url) return null;

    // YouTube Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/\/shorts\/([^?&]+)/);
    if (shortsMatch && shortsMatch[1].length === 11) {
        return shortsMatch[1];
    }

    // Live URL: https://www.youtube.com/live/VIDEO_ID
    const liveMatch = url.match(/\/live\/([^?&]+)/);
    if (liveMatch && liveMatch[1].length === 11) {
        return liveMatch[1];
    }

    // Standard YouTube URLs
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// Direct video player component using expo-video
function DirectVideoPlayer({ videoUrl, onTimeUpdate, playerRef }) {
    const player = useVideoPlayer(videoUrl, player => {
        player.loop = false;
        player.play();
    });

    useEffect(() => {
        if (!player) return;

        // Expose player to parent via ref
        if (playerRef) {
            playerRef.current = {
                player,
                seekTo: (seconds) => {
                    player.currentTime = seconds;
                    player.play();
                }
            };
        }

        const interval = setInterval(() => {
            if (player.currentTime) {
                onTimeUpdate(player.currentTime);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player, onTimeUpdate, playerRef]);

    return (
        <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
        />
    );
}

// Main VideoPlayer Component
const VideoPlayer = forwardRef(({ videoUrl, onTimeUpdate }, ref) => {
    const youtubeVideoId = getYouTubeVideoId(videoUrl);
    const isYouTubeVideo = youtubeVideoId !== null;

    const youtubePlayerRef = useRef(null);
    const directPlayerRef = useRef(null);
    const [playerReady, setPlayerReady] = useState(false);

    useImperativeHandle(ref, () => ({
        seekTo: async (seconds) => {
            console.log('Seeking to:', seconds);
            if (isYouTubeVideo) {
                if (youtubePlayerRef.current) {
                    try {
                        // seekTo(seconds, allowSeekAhead)
                        youtubePlayerRef.current.seekTo(seconds, true);
                    } catch (error) {
                        console.error('Seek error:', error);
                        Alert.alert('Seek Failed', 'Could not seek to timestamp');
                    }
                } else {
                    Alert.alert('Player Not Ready', 'YouTube player is not ready yet');
                }
            } else {
                if (directPlayerRef.current) {
                    directPlayerRef.current.seekTo(seconds);
                } else {
                    Alert.alert('Player Not Ready', 'Please wait for the video to load');
                }
            }
        },
        isYouTubeVideo,
        youtubeVideoId
    }));

    if (isYouTubeVideo) {
        return (
            <View style={styles.videoContainer}>
                {Platform.OS === 'web' ? (
                    <iframe
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                    />
                ) : (
                    <YoutubePlayer
                        ref={youtubePlayerRef}
                        height={width * 9 / 16}
                        videoId={youtubeVideoId}
                        play={false}
                        onReady={() => {
                            console.log('YouTube player ready');
                            setPlayerReady(true);
                        }}
                        initialPlayerParams={{
                            preventFullScreen: false,
                            controls: true,
                            modestbranding: true,
                        }}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={styles.videoContainer}>
            <DirectVideoPlayer
                videoUrl={videoUrl}
                onTimeUpdate={onTimeUpdate}
                playerRef={directPlayerRef}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    videoContainer: {
        width: '100%',
        backgroundColor: '#000',
        ...Platform.select({
            web: {
                width: '100%',
                maxWidth: 1000,
                aspectRatio: 16 / 9,
                alignSelf: 'center',
                maxHeight: '60vh',
            },
            default: {
                aspectRatio: 16 / 9,
            }
        })
    },
    video: {
        width: '100%',
        height: '100%',
    },
});

export default VideoPlayer;
