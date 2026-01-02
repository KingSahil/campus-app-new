import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import Markdown from 'react-native-markdown-display';
import { supabase } from '../lib/supabase';
import { auth0 } from '../lib/auth0';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // YouTube Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/\/shorts\/([^?&]+)/);
    if (shortsMatch && shortsMatch[1].length === 11) {
        return shortsMatch[1];
    }
    
    // Standard YouTube URLs
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// Direct video player component using expo-video
function DirectVideoPlayer({ videoUrl, onTimeUpdate }) {
    const player = useVideoPlayer(videoUrl, player => {
        player.loop = false;
        player.play();
    });

    React.useEffect(() => {
        if (!player) return;
        
        const interval = setInterval(() => {
            if (player.currentTime) {
                onTimeUpdate(player.currentTime);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player, onTimeUpdate]);

    return (
        <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
        />
    );
}

export default function LectureVideoScreen({ navigation, route }) {
    const { video } = route.params;
    const [activeTab, setActiveTab] = useState('discussion');
    const videoRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    
    // Upvote states
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [loadingUpvote, setLoadingUpvote] = useState(false);
    const [user, setUser] = useState(null);
    
    // Discussion states
    const [discussions, setDiscussions] = useState([]);
    const [loadingDiscussions, setLoadingDiscussions] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [expandedThreads, setExpandedThreads] = useState({});
    
    // Ask AI states
    const [userQuestion, setUserQuestion] = useState('');
    const [summary, setSummary] = useState('')
    const [loadingSummary, setLoadingSummary] = useState(false);
    
    // Chapters states
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [overallSummary, setOverallSummary] = useState('');
    const [playerReady, setPlayerReady] = useState(false);
    
    // Quiz states
    const [quiz, setQuiz] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    
    // Keyboard state
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    
    // Check if the video is a YouTube video
    const youtubeVideoId = getYouTubeVideoId(video.url);
    const isYouTubeVideo = youtubeVideoId !== null;

    useEffect(() => {
        getUserInfo();
        fetchUpvotes();
        fetchDiscussions();
        fetchSavedChapters();
        fetchSavedQuiz();
        
        // Keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );
        
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
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

    const fetchUpvotes = async () => {
        try {
            // Generate consistent video ID from URL
            const videoId = video.url;

            // Get total upvote count
            const { data, error, count } = await supabase
                .from('video_upvotes')
                .select('*', { count: 'exact' })
                .eq('video_id', videoId);

            if (error) {
                console.error('Error fetching upvotes:', error);
                return;
            }

            setUpvoteCount(count || 0);

            // Check if current user has upvoted
            const userInfo = await auth0.getUser();
            const userData = userInfo?.data?.user || userInfo;
            const userId = userData?.sub;

            if (userId) {
                const userUpvote = data?.find(upvote => upvote.user_id === userId);
                setHasUpvoted(!!userUpvote);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpvote = async () => {
        if (!user?.sub) {
            Alert.alert('Sign In Required', 'Please sign in to upvote videos');
            return;
        }

        setLoadingUpvote(true);
        try {
            const videoId = video.url;
            const userId = user.sub;
            const userEmail = user.email;

            if (hasUpvoted) {
                // Remove upvote
                const { error } = await supabase
                    .from('video_upvotes')
                    .delete()
                    .eq('video_id', videoId)
                    .eq('user_id', userId);

                if (error) throw error;

                // Get current count from video_upvotes table
                const { count } = await supabase
                    .from('video_upvotes')
                    .select('*', { count: 'exact', head: true })
                    .eq('video_id', videoId);

                // Update the videos table with actual count
                await supabase
                    .from('videos')
                    .update({ upvotes: count || 0 })
                    .eq('id', video.id);

                setHasUpvoted(false);
                setUpvoteCount(count || 0);
            } else {
                // Add upvote
                const { error } = await supabase
                    .from('video_upvotes')
                    .insert({
                        video_id: videoId,
                        video_title: video.title,
                        user_id: userId,
                        user_email: userEmail,
                    });

                if (error) throw error;

                // Get current count from video_upvotes table
                const { count } = await supabase
                    .from('video_upvotes')
                    .select('*', { count: 'exact', head: true })
                    .eq('video_id', videoId);

                // Update the videos table with actual count
                await supabase
                    .from('videos')
                    .update({ upvotes: count || 0 })
                    .eq('id', video.id);

                setHasUpvoted(true);
                setUpvoteCount(count || 0);
            }
        } catch (error) {
            console.error('Error toggling upvote:', error);
            Alert.alert('Error', 'Failed to update upvote. Please try again.');
        } finally {
            setLoadingUpvote(false);
        }
    };

    const generateSummary = async () => {
        if (!userQuestion.trim()) {
            Alert.alert('Error', 'Please enter your question or doubt');
            return;
        }

        Keyboard.dismiss();
        setLoadingSummary(true);
        try {
            // Check if we have a cached answer for this question
            const cachedAnswer = await fetchSavedAIQuestions(userQuestion.trim());
            if (cachedAnswer && cachedAnswer.answer) {
                setSummary(cachedAnswer.answer);
                console.log('Loaded cached AI answer from database');
                setLoadingSummary(false);
                return;
            }

            // Get backend URL
            const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.14:8000';
            
            const response = await fetch(`${BACKEND_URL}/ai-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: video.url,
                    video_title: video.title,
                    question: userQuestion,
                    api_provider: 'gemini'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.answer) {
                setSummary(data.answer);
                // Save to database
                await saveAIQuestionToDatabase(userQuestion, data.answer);
            } else {
                Alert.alert('Error', 'No answer generated. Please try again.');
            }
        } catch (error) {
            console.error('Summary Error:', error);
            Alert.alert('Error', 'Failed to generate answer: ' + error.message);
        } finally {
            setLoadingSummary(false);
        }
    };

    const saveAIQuestionToDatabase = async (question, answer) => {
        if (!video.id) return;
        
        try {
            const { error } = await supabase
                .from('video_ai_questions')
                .upsert({
                    video_id: video.id,
                    question: question,
                    answer: answer,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'video_id,question'
                });

            if (error) {
                console.error('Error saving AI Q&A:', error);
            } else {
                console.log('AI Q&A saved to database');
            }
        } catch (error) {
            console.error('Error saving AI Q&A:', error);
        }
    };

    const fetchSavedAIQuestions = async (question) => {
        if (!video.id) return null;
        
        try {
            const { data, error } = await supabase
                .from('video_ai_questions')
                .select('*')
                .eq('video_id', video.id)
                .eq('question', question)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Not found error
                    console.error('Error fetching saved AI Q&A:', error);
                }
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error loading AI Q&A:', error);
            return null;
        }
    };

    const generateChapters = async () => {
        if (!isYouTubeVideo) {
            Alert.alert('Not Supported', 'Chapter generation is only available for YouTube videos');
            return;
        }

        setLoadingChapters(true);
        try {
            // Get backend URL with platform-specific handling
            let BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
            
            // If no env variable set, use platform-specific defaults
            if (!BACKEND_URL) {
                if (Platform.OS === 'android') {
                    // Android emulator uses 10.0.2.2 to access host machine's localhost
                    BACKEND_URL = 'http://10.0.2.2:8000';
                } else if (Platform.OS === 'ios') {
                    // iOS simulator can use localhost
                    BACKEND_URL = 'http://localhost:8000';
                } else if (Platform.OS === 'web') {
                    // Web can use localhost
                    BACKEND_URL = 'http://localhost:8000';
                } else {
                    // For physical devices, you need to use your computer's IP address
                    // Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
                    // Replace with your actual IP address
                    BACKEND_URL = 'http://localhost:8000';
                }
            }
            
            console.log('Using backend URL:', BACKEND_URL);
            
            const response = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: video.url,
                    api_provider: 'gemini', // or 'openrouter'
                    model: 'gemini-2.0-flash-exp', // or 'anthropic/claude-3.5-sonnet' for openrouter
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            // Update state with chapters and summary
            setChapters(data.chapters || []);
            setOverallSummary(data.summary || '');
            
            // Save to database for future use
            await saveChaptersToDatabase(data.chapters || [], data.summary || '');
            
            Alert.alert('Success', 'Chapters generated successfully!');
        } catch (error) {
            console.error('Chapter Generation Error:', error);
            
            // Provide more helpful error messages
            let errorMessage = 'Failed to generate chapters.';
            
            if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
                errorMessage = `Cannot connect to backend server.\n\n` +
                    `Please ensure:\n` +
                    `1. Backend is running (python main.py)\n` +
                    `2. Server is at http://localhost:8000\n` +
                    `3. Check your .env file has EXPO_PUBLIC_BACKEND_URL\n\n` +
                    `Platform: ${Platform.OS}`;
            } else {
                errorMessage = error.message || errorMessage;
            }
            
            Alert.alert('Backend Connection Error', errorMessage);
        } finally {
            setLoadingChapters(false);
        }
    };

    const generateQuiz = async () => {
        setLoadingQuiz(true);
        try {
            // Get backend URL
            const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.14:8000';
            
            const response = await fetch(`${BACKEND_URL}/generate-quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: video.url,
                    video_title: video.title,
                    api_provider: 'gemini'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.quiz && Array.isArray(data.quiz) && data.quiz.length > 0) {
                setQuiz(data.quiz);
                setSelectedAnswers({});
                setShowResults(false);
                // Save to database
                await saveQuizToDatabase(data.quiz);
            } else {
                Alert.alert('Error', 'Invalid quiz format received');
            }
        } catch (error) {
            console.error('Quiz Error:', error);
            Alert.alert('Error', 'Failed to generate quiz: ' + error.message);
        } finally {
            setLoadingQuiz(false);
        }
    };

    const saveQuizToDatabase = async (quizData) => {
        if (!video.id) return;
        
        try {
            const { error } = await supabase
                .from('video_quizzes')
                .upsert({
                    video_id: video.id,
                    quiz_data: quizData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'video_id'
                });

            if (error) {
                console.error('Error saving quiz:', error);
            } else {
                console.log('Quiz saved to database');
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
        }
    };

    const fetchSavedQuiz = async () => {
        if (!video.id) return;
        
        try {
            const { data, error } = await supabase
                .from('video_quizzes')
                .select('*')
                .eq('video_id', video.id)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Not found error
                    console.error('Error fetching saved quiz:', error);
                }
                return;
            }

            if (data && data.quiz_data) {
                setQuiz(data.quiz_data);
                setSelectedAnswers({});
                setShowResults(false);
                console.log('Loaded saved quiz from database');
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    };

    const submitQuiz = () => {
        setShowResults(true);
    };

    const fetchDiscussions = async () => {
        setLoadingDiscussions(true);
        try {
            const { data, error } = await supabase
                .from('video_discussions')
                .select('*')
                .eq('video_id', video.url)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDiscussions(data || []);
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoadingDiscussions(false);
        }
    };

    const fetchSavedChapters = async () => {
        if (!video.id) return;
        
        try {
            const { data, error } = await supabase
                .from('video_chapters')
                .select('chapters, overall_summary')
                .eq('video_id', video.id)
                .single();

            if (error) {
                // No saved chapters yet, that's okay
                if (error.code !== 'PGRST116') {
                    console.error('Error fetching saved chapters:', error);
                }
                return;
            }

            if (data) {
                setChapters(data.chapters || []);
                setOverallSummary(data.overall_summary || '');
                console.log('Loaded saved chapters from database');
            }
        } catch (error) {
            console.error('Error loading chapters:', error);
        }
    };

    const saveChaptersToDatabase = async (chaptersData, summaryData) => {
        if (!video.id) return;
        
        try {
            const { error } = await supabase
                .from('video_chapters')
                .upsert({
                    video_id: video.id,
                    chapters: chaptersData,
                    overall_summary: summaryData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'video_id'
                });

            if (error) {
                console.error('Error saving chapters:', error);
            } else {
                console.log('Chapters saved to database successfully');
            }
        } catch (error) {
            console.error('Error saving chapters:', error);
        }
    };

    const postMessage = async () => {
        if (!newMessage.trim() || !user) return;

        Keyboard.dismiss();
        try {
            const { data, error } = await supabase
                .from('video_discussions')
                .insert({
                    video_id: video.url,
                    video_title: video.title,
                    user_id: user.sub,
                    user_name: user.name || user.email?.split('@')[0] || 'Student',
                    user_email: user.email,
                    message: newMessage.trim(),
                    parent_id: null,
                })
                .select()
                .single();

            if (error) throw error;

            setDiscussions([data, ...discussions]);
            setNewMessage('');
        } catch (error) {
            console.error('Error posting message:', error);
            Alert.alert('Error', 'Failed to post message');
        }
    };

    const postReply = async (parentId) => {
        if (!replyText.trim() || !user) return;

        Keyboard.dismiss();
        try {
            const { data, error } = await supabase
                .from('video_discussions')
                .insert({
                    video_id: video.url,
                    video_title: video.title,
                    user_id: user.sub,
                    user_name: user.name || user.email?.split('@')[0] || 'Student',
                    user_email: user.email,
                    message: replyText.trim(),
                    parent_id: parentId,
                })
                .select()
                .single();

            if (error) throw error;

            setDiscussions([data, ...discussions]);
            setReplyText('');
            setReplyTo(null);
        } catch (error) {
            console.error('Error posting reply:', error);
            Alert.alert('Error', 'Failed to post reply');
        }
    };

    const toggleThread = (messageId) => {
        setExpandedThreads(prev => ({
            ...prev,
            [messageId]: !prev[messageId]
        }));
    };

    const getReplies = (parentId) => {
        return discussions.filter(d => d.parent_id === parentId);
    };

    const getMainMessages = () => {
        return discussions.filter(d => !d.parent_id);
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const handleSeekToTimestamp = async (timestamp) => {
        // Convert timestamp (MM:SS or HH:MM:SS) to seconds
        const parts = timestamp.split(':').map(Number);
        let seconds = 0;
        
        if (parts.length === 2) {
            // MM:SS format
            seconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS format
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        console.log('Attempting to seek to:', seconds, 'seconds');

        if (isYouTubeVideo && youtubeVideoId) {
            // For YouTube videos
            if (youtubePlayerRef.current && youtubePlayerRef.current.seekTo) {
                try {
                    await youtubePlayerRef.current.seekTo(seconds, true);
                    console.log('Successfully seeked to', seconds);
                } catch (error) {
                    console.error('Seek error:', error);
                    Alert.alert('Seek Failed', 'Could not seek to timestamp: ' + error.message);
                }
            } else {
                console.error('YouTube player ref not available or seekTo method missing');
                console.log('Ref current:', youtubePlayerRef.current);
                console.log('PlayerReady:', playerReady);
                Alert.alert('Player Not Ready', 'YouTube player is not ready yet. Please wait a moment and try again.');
            }
        } else {
            // For direct videos using expo-video
            if (videoRef.current && videoRef.current.player) {
                videoRef.current.player.currentTime = seconds;
                videoRef.current.player.play();
            } else {
                Alert.alert('Player Not Ready', 'Please wait for the video to load');
            }
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upvotes':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.upvoteSection}>
                            <TouchableOpacity 
                                style={[
                                    styles.upvoteButton,
                                    hasUpvoted && styles.upvoteButtonActive
                                ]}
                                onPress={handleUpvote}
                                disabled={loadingUpvote}
                            >
                                {loadingUpvote ? (
                                    <ActivityIndicator color={hasUpvoted ? "#fff" : "#3B82F6"} />
                                ) : (
                                    <MaterialIcons 
                                        name={hasUpvoted ? "thumb-up" : "thumb-up-off-alt"} 
                                        size={32} 
                                        color={hasUpvoted ? "#fff" : "#3B82F6"} 
                                    />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.upvoteCount}>
                                {upvoteCount.toLocaleString()} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}
                            </Text>
                            <Text style={styles.upvoteSubtext}>
                                {hasUpvoted ? 'You upvoted this video' : 'Tap to upvote this video'}
                            </Text>
                        </View>
                    </View>
                );
            case 'discussion':
                return (
                    <View style={styles.tabContent}>
                        {/* Messages List */}
                        {loadingDiscussions ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color="#3B82F6" />
                                <Text style={styles.loadingText}>Loading discussions...</Text>
                            </View>
                        ) : getMainMessages().length === 0 ? (
                            <View style={styles.emptyDiscussion}>
                                <MaterialIcons name="forum" size={48} color="#6B7280" />
                                <Text style={styles.emptyText}>No discussions yet</Text>
                                <Text style={styles.emptySubtext}>Be the first to ask a question!</Text>
                            </View>
                        ) : (
                            getMainMessages().map((message) => {
                                const replies = getReplies(message.id);
                                const isExpanded = expandedThreads[message.id];
                                const replyingTo = replyTo === message.id;

                                return (
                                    <View key={message.id} style={styles.messageCard}>
                                        {/* Main Message */}
                                        <TouchableOpacity
                                            style={styles.messageHeader}
                                            onPress={() => replies.length > 0 && toggleThread(message.id)}
                                            activeOpacity={replies.length > 0 ? 0.7 : 1}
                                        >
                                            <View style={styles.userAvatar}>
                                                <Text style={styles.avatarText}>
                                                    {message.user_name?.charAt(0).toUpperCase() || 'S'}
                                                </Text>
                                            </View>
                                            <View style={styles.messageContent}>
                                                <View style={styles.messageTop}>
                                                    <Text style={styles.userName}>{message.user_name}</Text>
                                                    <Text style={styles.messageTime}>{formatTimeAgo(message.created_at)}</Text>
                                                </View>
                                                <Text style={styles.messageText}>{message.message}</Text>
                                            </View>
                                        </TouchableOpacity>

                                        {/* Reply Button */}
                                        <View style={styles.messageActions}>
                                            {replies.length > 0 && (
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => toggleThread(message.id)}
                                                >
                                                    <MaterialIcons
                                                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                                        size={18}
                                                        color="#3B82F6"
                                                    />
                                                    <Text style={styles.actionText}>
                                                        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => setReplyTo(replyingTo ? null : message.id)}
                                            >
                                                <MaterialIcons name="reply" size={18} color="#3B82F6" />
                                                <Text style={styles.actionText}>Reply</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Replies Thread */}
                                        {isExpanded && replies.length > 0 && (
                                            <View style={styles.repliesContainer}>
                                                {replies.map((reply) => (
                                                    <View key={reply.id} style={styles.replyCard}>
                                                        <View style={styles.replyLine} />
                                                        <View style={styles.replyContent}>
                                                            <View style={styles.userAvatarSmall}>
                                                                <Text style={styles.avatarTextSmall}>
                                                                    {reply.user_name?.charAt(0).toUpperCase() || 'S'}
                                                                </Text>
                                                            </View>
                                                            <View style={styles.replyBody}>
                                                                <View style={styles.replyTop}>
                                                                    <Text style={styles.replyUserName}>{reply.user_name}</Text>
                                                                    <Text style={styles.replyTime}>{formatTimeAgo(reply.created_at)}</Text>
                                                                </View>
                                                                <Text style={styles.replyText}>{reply.message}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </View>
                );
            case 'ai':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Ask AI</Text>
                        
                        {summary ? (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>
                                    Answer
                                </Text>
                                <Markdown style={{
                                    body: styles.summaryText,
                                    heading1: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginVertical: 8 },
                                    heading2: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginVertical: 6 },
                                    heading3: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginVertical: 4 },
                                    strong: { fontWeight: 'bold', color: '#fff' },
                                    em: { fontStyle: 'italic', color: '#D1D5DB' },
                                    code_inline: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#8B5CF6', paddingHorizontal: 4, borderRadius: 4 },
                                    code_block: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#D1D5DB', padding: 12, borderRadius: 8, marginVertical: 8 },
                                    fence: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#D1D5DB', padding: 12, borderRadius: 8, marginVertical: 8 },
                                    bullet_list: { color: '#D1D5DB' },
                                    ordered_list: { color: '#D1D5DB' },
                                    list_item: { color: '#D1D5DB', marginVertical: 2 },
                                    blockquote: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeftColor: '#3B82F6', borderLeftWidth: 4, paddingLeft: 12, paddingVertical: 8, marginVertical: 8 },
                                    link: { color: '#3B82F6' },
                                }}>{summary}</Markdown>
                            </View>
                        ) : (
                            <View style={styles.aiCard}>
                                <MaterialIcons name="auto-awesome" size={32} color="#8B5CF6" />
                                <Text style={styles.aiText}>
                                    Ask AI anything about this video and get instant answers
                                </Text>
                            </View>
                        )}
                    </View>
                );
            case 'chapters':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>Video Chapters</Text>
                        
                        {!chapters.length ? (
                            <View style={styles.chaptersCard}>
                                <MaterialIcons name="video-library" size={48} color="#3B82F6" />
                                <Text style={styles.chaptersText}>
                                    Generate AI-powered chapters with timestamps and summaries
                                </Text>
                                {!isYouTubeVideo && (
                                    <Text style={styles.chaptersWarning}>
                                        ⚠️ Only available for YouTube videos
                                    </Text>
                                )}
                                <TouchableOpacity 
                                    style={[styles.chaptersButton, !isYouTubeVideo && styles.chaptersButtonDisabled]}
                                    onPress={generateChapters}
                                    disabled={loadingChapters || !isYouTubeVideo}
                                >
                                    {loadingChapters ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                                            <Text style={styles.chaptersButtonText}>Generate Chapters</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {/* Overall Summary */}
                                {overallSummary ? (
                                    <View style={styles.overallSummaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialIcons name="description" size={24} color="#3B82F6" />
                                            <Text style={styles.overallSummaryTitle}>Video Summary</Text>
                                        </View>
                                        <Text style={styles.overallSummaryText}>{overallSummary}</Text>
                                    </View>
                                ) : null}

                                {/* Chapters List */}
                                <View style={styles.chaptersHeader}>
                                    <Text style={styles.chaptersListTitle}>Chapters ({chapters.length})</Text>
                                    <TouchableOpacity 
                                        style={styles.regenerateButton}
                                        onPress={generateChapters}
                                        disabled={loadingChapters}
                                    >
                                        <MaterialIcons name="refresh" size={18} color="#3B82F6" />
                                        <Text style={styles.regenerateText}>Regenerate</Text>
                                    </TouchableOpacity>
                                </View>

                                {chapters.map((chapter, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.chapterCard}
                                        onPress={() => handleSeekToTimestamp(chapter.timestamp)}
                                    >
                                        <View style={styles.chapterLeft}>
                                            <View style={styles.chapterNumber}>
                                                <Text style={styles.chapterNumberText}>{index + 1}</Text>
                                            </View>
                                            <View style={styles.chapterInfo}>
                                                <Text style={styles.chapterTimestamp}>{chapter.timestamp}</Text>
                                                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                                                <Text style={styles.chapterSummary}>{chapter.summary}</Text>
                                            </View>
                                        </View>
                                        <MaterialIcons name="play-circle-outline" size={28} color="#3B82F6" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                );
            case 'quiz':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>AI Quiz</Text>
                        
                        {!quiz ? (
                            <View style={styles.quizCard}>
                                <MaterialIcons name="quiz" size={48} color="#3B82F6" />
                                <Text style={styles.quizText}>
                                    Test your understanding with AI-generated questions
                                </Text>
                                <TouchableOpacity 
                                    style={styles.quizButton}
                                    onPress={generateQuiz}
                                    disabled={loadingQuiz}
                                >
                                    {loadingQuiz ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.quizButtonText}>Generate Quiz</Text>
                                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {quiz.map((q, index) => (
                                    <View key={index} style={styles.questionCard}>
                                        <Text style={styles.questionText}>
                                            {index + 1}. {q.question}
                                        </Text>
                                        {q.options.map((option, optIndex) => {
                                            const optionLetter = option.charAt(0);
                                            const isSelected = selectedAnswers[index] === optionLetter;
                                            const isCorrect = q.correct === optionLetter;
                                            const showCorrect = showResults && isCorrect;
                                            const showWrong = showResults && isSelected && !isCorrect;
                                            
                                            return (
                                                <TouchableOpacity
                                                    key={optIndex}
                                                    style={[
                                                        styles.optionButton,
                                                        isSelected && styles.selectedOption,
                                                        showCorrect && styles.correctOption,
                                                        showWrong && styles.wrongOption,
                                                    ]}
                                                    onPress={() => {
                                                        if (!showResults) {
                                                            setSelectedAnswers({...selectedAnswers, [index]: optionLetter});
                                                        }
                                                    }}
                                                    disabled={showResults}
                                                >
                                                    <Text style={[
                                                        styles.optionText,
                                                        (isSelected || showCorrect) && styles.selectedOptionText
                                                    ]}>
                                                        {option}
                                                    </Text>
                                                    {showCorrect && <MaterialIcons name="check-circle" size={20} color="#10B981" />}
                                                    {showWrong && <MaterialIcons name="cancel" size={20} color="#EF4444" />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                                
                                {!showResults ? (
                                    <TouchableOpacity 
                                        style={styles.submitButton}
                                        onPress={submitQuiz}
                                    >
                                        <Text style={styles.submitButtonText}>Submit Quiz</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.resultsCard}>
                                        <MaterialIcons name="emoji-events" size={48} color="#F59E0B" />
                                        <Text style={styles.resultsText}>
                                            Score: {Object.values(selectedAnswers).filter((ans, idx) => ans === quiz[idx]?.correct).length} / {quiz.length}
                                        </Text>
                                        <TouchableOpacity 
                                            style={styles.retakeButton}
                                            onPress={() => {
                                                setQuiz(null);
                                                setSelectedAnswers({});
                                                setShowResults(false);
                                            }}
                                        >
                                            <Text style={styles.retakeButtonText}>Take New Quiz</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
                enabled={activeTab === 'discussion' || activeTab === 'ai'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {video.title}
                    </Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <MaterialIcons name="more-vert" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Video Player */}
                <View style={styles.videoContainer}>
                    {isYouTubeVideo ? (
                        Platform.OS === 'web' ? (
                            <iframe
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                        )
                    ) : (
                        <DirectVideoPlayer videoUrl={video.url} onTimeUpdate={setCurrentTime} />
                    )}
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upvotes' && styles.activeTab]}
                        onPress={handleUpvote}
                        disabled={loadingUpvote}
                    >
                        {loadingUpvote ? (
                            <ActivityIndicator color="#3B82F6" size="small" />
                        ) : (
                            <MaterialIcons
                                name={hasUpvoted ? "thumb-up" : "thumb-up-off-alt"}
                                size={24}
                                color={hasUpvoted ? '#3B82F6' : '#9CA3AF'}
                            />
                        )}
                        <Text style={[styles.tabText, hasUpvoted && styles.activeTabText]}>
                            {upvoteCount.toLocaleString()} {upvoteCount === 1 ? 'Upvote' : 'Upvotes'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
                        onPress={() => setActiveTab('discussion')}
                    >
                        <MaterialIcons
                            name="forum"
                            size={24}
                            color={activeTab === 'discussion' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
                            Discussion
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
                        onPress={() => setActiveTab('ai')}
                    >
                        <MaterialIcons
                            name="auto-awesome"
                            size={24}
                            color={activeTab === 'ai' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
                            Ask AI
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'chapters' && styles.activeTab]}
                        onPress={() => setActiveTab('chapters')}
                    >
                        <MaterialIcons
                            name="video-library"
                            size={24}
                            color={activeTab === 'chapters' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'chapters' && styles.activeTabText]}>
                            Chapters
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'quiz' && styles.activeTab]}
                        onPress={() => setActiveTab('quiz')}
                    >
                        <MaterialIcons
                            name="quiz"
                            size={24}
                            color={activeTab === 'quiz' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>
                            AI Quiz
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {renderTabContent()}
                </ScrollView>

                {/* Fixed Input Bars */}
                {activeTab === 'discussion' && !replyTo && (
                    <View style={styles.fixedInputBar}>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.fixedMessageInput}
                                placeholder="Ask a question or start a discussion..."
                                placeholderTextColor="#6B7280"
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.fixedSendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                                onPress={postMessage}
                                disabled={!newMessage.trim()}
                            >
                                <MaterialIcons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {activeTab === 'discussion' && replyTo && (
                    <View style={styles.fixedInputBar}>
                        <View style={styles.replyIndicator}>
                            <MaterialIcons name="reply" size={16} color="#3B82F6" />
                            <Text style={styles.replyIndicatorText}>Replying...</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setReplyTo(null);
                                    setReplyText('');
                                }}
                                style={styles.cancelReplyIconButton}
                            >
                                <MaterialIcons name="close" size={16} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.fixedMessageInput}
                                placeholder="Write a reply..."
                                placeholderTextColor="#6B7280"
                                value={replyText}
                                onChangeText={setReplyText}
                                multiline
                                autoFocus
                            />
                            <TouchableOpacity
                                style={[styles.fixedSendButton, !replyText.trim() && styles.sendButtonDisabled]}
                                onPress={() => postReply(replyTo)}
                                disabled={!replyText.trim()}
                            >
                                <MaterialIcons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {activeTab === 'ai' && (
                    <View style={styles.fixedInputBar}>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.fixedMessageInput}
                                placeholder="Ask Anything!"
                                placeholderTextColor="#6B7280"
                                value={userQuestion}
                                onChangeText={setUserQuestion}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.fixedSendButton, (!userQuestion.trim() || loadingSummary) && styles.sendButtonDisabled]}
                                onPress={generateSummary}
                                disabled={!userQuestion.trim() || loadingSummary}
                            >
                                {loadingSummary ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F2937',
    },
    keyboardAvoid: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1F2937',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginHorizontal: 8,
    },
    moreButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    tab: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3B82F6',
    },
    tabText: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#3B82F6',
    },
    contentContainer: {
        flex: 1,
    },
    tabContent: {
        padding: 24,
        minHeight: 300,
    },
    upvoteSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    upvoteButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    upvoteButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
    },
    upvoteCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    upvoteSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    comingSoonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    comingSoonSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 24,
    },
    discussionPreview: {
        alignItems: 'center',
        paddingVertical: 48,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    previewText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 16,
    },
    aiCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    aiText: {
        fontSize: 15,
        color: '#D1D5DB',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    aiButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
    },
    aiButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    timestampSection: {
        width: '100%',
        marginVertical: 16,
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    timestampInput: {
        flex: 1,
    },
    captureButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 1,
        borderColor: '#8B5CF6',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 85,
    },
    captureText: {
        color: '#8B5CF6',
        fontSize: 11,
        fontWeight: '600',
    },
    currentTimeText: {
        fontSize: 12,
        color: '#8B5CF6',
        marginTop: 8,
        fontWeight: '500',
    },
    questionInput: {
        width: '100%',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#D1D5DB',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 15,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    multilineInputCompact: {
        minHeight: 50,
    },
    aiCardCompact: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    aiInputContainer: {
        marginTop: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 16,
        padding: 16,
    },
    aiInputContainerKeyboard: {
        marginTop: 0,
        backgroundColor: '#1F2937',
        borderTopWidth: 2,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopColor: 'rgba(139, 92, 246, 0.5)',
        borderRadius: 0,
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    },
    contentContainerKeyboard: {
        paddingBottom: 0,
    },
    summaryCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 22,
    },
    quizCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    quizText: {
        fontSize: 15,
        color: '#D1D5DB',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    quizButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quizButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    questionCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
        lineHeight: 24,
    },
    optionButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectedOption: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
    },
    correctOption: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
    },
    wrongOption: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444',
    },
    optionText: {
        fontSize: 14,
        color: '#D1D5DB',
        flex: 1,
    },
    selectedOptionText: {
        color: '#fff',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsCard: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 16,
    },
    resultsText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginVertical: 16,
    },
    retakeButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retakeButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    newMessageContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
        alignItems: 'flex-end',
    },
    messageInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#3B82F6',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#374151',
        opacity: 0.5,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    emptyDiscussion: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D1D5DB',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    messageCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    messageHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContent: {
        flex: 1,
    },
    messageTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    userName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    messageTime: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    messageText: {
        color: '#D1D5DB',
        fontSize: 14,
        lineHeight: 20,
    },
    messageActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
        marginLeft: 52,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: '500',
    },
    repliesContainer: {
        marginTop: 12,
        marginLeft: 26,
    },
    replyCard: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    replyLine: {
        width: 2,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        marginRight: 12,
        borderRadius: 1,
    },
    replyContent: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    userAvatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    replyBody: {
        flex: 1,
    },
    replyTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    replyUserName: {
        color: '#D1D5DB',
        fontSize: 13,
        fontWeight: '600',
    },
    replyTime: {
        color: '#9CA3AF',
        fontSize: 11,
    },
    replyText: {
        color: '#D1D5DB',
        fontSize: 13,
        lineHeight: 18,
    },
    replyInputContainer: {
        flexDirection: 'row',
        marginTop: 12,
        marginLeft: 26,
    },
    replyInputBox: {
        flex: 1,
    },
    replyInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 8,
        padding: 10,
        color: '#fff',
        fontSize: 13,
        marginBottom: 8,
        maxHeight: 80,
    },
    replyActions: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'flex-end',
    },
    cancelReplyButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cancelReplyText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '500',
    },
    sendReplyButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
    },
    sendReplyText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    // Chapters styles
    chaptersCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    chaptersText: {
        fontSize: 15,
        color: '#D1D5DB',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 22,
    },
    chaptersWarning: {
        fontSize: 13,
        color: '#F59E0B',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    chaptersButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chaptersButtonDisabled: {
        backgroundColor: '#374151',
        opacity: 0.5,
    },
    chaptersButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    overallSummaryCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    overallSummaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
    },
    overallSummaryText: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
    },
    chaptersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chaptersListTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    regenerateText: {
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: '500',
    },
    chapterCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chapterLeft: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    chapterNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    chapterNumberText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    chapterInfo: {
        flex: 1,
    },
    chapterTimestamp: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '600',
        marginBottom: 4,
    },
    chapterTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    chapterSummary: {
        fontSize: 13,
        color: '#9CA3AF',
        lineHeight: 18,
    },
    fixedInputBar: {
        flexDirection: 'column',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1F2937',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    replyIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    replyIndicatorText: {
        flex: 1,
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '500',
    },
    cancelReplyIconButton: {
        padding: 4,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end',
    },
    fixedMessageInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
    },
    fixedSendButton: {
        backgroundColor: '#3B82F6',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
