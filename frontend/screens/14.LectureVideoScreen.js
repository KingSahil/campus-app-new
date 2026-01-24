import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import { auth0 } from '../lib/auth0';
import { lectureVideoStyles as styles } from '../styles/LectureVideoStyles';
import Background from '../components/Background';

// Components
import VideoPlayer from '../components/LectureVideo/VideoPlayer';
import TabNavigation from '../components/LectureVideo/TabNavigation';
import UpvoteTab from '../components/LectureVideo/UpvoteTab';
import DiscussionTab from '../components/LectureVideo/DiscussionTab';
import AiTab from '../components/LectureVideo/AiTab';
import ChaptersTab from '../components/LectureVideo/ChaptersTab';
import QuizTab from '../components/LectureVideo/QuizTab';
import InputBar from '../components/LectureVideo/InputBar';

// Hooks
import { useUpvotes } from '../hooks/lecture/useUpvotes';
import { useDiscussion } from '../hooks/lecture/useDiscussion';
import { useAIQuestions } from '../hooks/lecture/useAIQuestions';
import { useChapters } from '../hooks/lecture/useChapters';
import { useQuiz } from '../hooks/lecture/useQuiz';

export default function LectureVideoScreen({ navigation, route }) {
    const {
        video: videoParam,
        videoId,
        videoUrl,
        videoTitle,
        videoDescription,
        videoThumbnail,
        videoDuration,
        videoUpvotes,
        topicId,
        topicName,
        subjectId,
    } = route.params || {};

    // Force Status Bar color on focus
    useFocusEffect(
        React.useCallback(() => {
            if (Platform.OS === 'android') {
                RNStatusBar.setBackgroundColor('#111827');
                RNStatusBar.setBarStyle('light-content');
            }
        }, [])
    );

    // Configure system bars for Android (Navigation Bar)
    useEffect(() => {
        if (Platform.OS === 'android') {
            const configureSystemBars = async () => {
                try {
                    await NavigationBar.setBackgroundColorAsync('#111827');
                    await NavigationBar.setButtonStyleAsync('light'); // Assuming dark background
                } catch (e) {
                    console.log('Failed to configure navigation bar:', e);
                }
            };
            configureSystemBars();
        }
    }, []);

    // Reconstruct video object
    let video = videoParam;
    if (!video || !video.url || video === '[object Object]') {
        if (videoUrl) {
            video = {
                id: videoId,
                url: videoUrl,
                title: videoTitle,
                description: videoDescription,
                thumbnail: videoThumbnail,
                duration: videoDuration,
                upvotes: videoUpvotes
            };
        }
    }

    const [activeTab, setActiveTab] = useState('discussion');
    const [user, setUser] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const videoPlayerRef = useRef(null);

    // Get User
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userInfo = await auth0.getUser();
                const userData = userInfo?.data?.user || userInfo;
                setUser(userData);
            } catch (error) {
                console.log('Error getting user:', error);
            }
        };
        getUserInfo();
    }, []);

    // Hooks
    const { upvoteCount, hasUpvoted, loadingUpvote, handleUpvote } = useUpvotes(video, user);

    const {
        discussions, loadingDiscussions, newMessage, setNewMessage,
        replyTo, setReplyTo, replyText, setReplyText, expandedThreads,
        postMessage, postReply, toggleThread, getReplies, getMainMessages, formatTimeAgo
    } = useDiscussion(video, user);

    const { userQuestion, setUserQuestion, summary, loadingSummary, generateSummary } = useAIQuestions(video);

    // Helper to check for YouTube video
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

        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const isYouTubeVideo = !!getYouTubeVideoId(video?.url);

    const { chapters, loadingChapters, overallSummary, generateChapters } = useChapters(video, isYouTubeVideo);

    const {
        quiz, loadingQuiz, selectedAnswers, setSelectedAnswers,
        showResults, setShowResults, generateQuiz, submitQuiz, resetQuiz
    } = useQuiz(video);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else if (topicId && subjectId) {
            navigation.navigate('VideosList', { topicId, topicName, subjectId, subjectName });
        } else {
            navigation.navigate('LearningHub');
        }
    };

    const handleSeekToTimestamp = (timestamp) => {
        const parts = timestamp.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
        else if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];

        if (videoPlayerRef.current) {
            videoPlayerRef.current.seekTo(seconds);
        }
    };

    if (!video?.url) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Video not found</Text>
                        <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
                            <Text style={{ color: '#3B82F6' }}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upvotes':
                return (
                    <UpvoteTab
                        upvoteCount={upvoteCount}
                        hasUpvoted={hasUpvoted}
                        loadingUpvote={loadingUpvote}
                        handleUpvote={handleUpvote}
                    />
                );
            case 'discussion':
                return (
                    <DiscussionTab
                        loadingDiscussions={loadingDiscussions}
                        getMainMessages={getMainMessages}
                        getReplies={getReplies}
                        toggleThread={toggleThread}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                        expandedThreads={expandedThreads}
                        formatTimeAgo={formatTimeAgo}
                    />
                );
            case 'ai':
                return <AiTab summary={summary} />;
            case 'chapters':
                return (
                    <ChaptersTab
                        chapters={chapters}
                        loadingChapters={loadingChapters}
                        overallSummary={overallSummary}
                        generateChapters={generateChapters}
                        isYouTubeVideo={isYouTubeVideo}
                        handleSeekToTimestamp={handleSeekToTimestamp}
                    />
                );
            case 'quiz':
                return (
                    <QuizTab
                        quiz={quiz}
                        loadingQuiz={loadingQuiz}
                        selectedAnswers={selectedAnswers}
                        setSelectedAnswers={setSelectedAnswers}
                        showResults={showResults}
                        setShowResults={setShowResults}
                        generateQuiz={generateQuiz}
                        submitQuiz={submitQuiz}
                        resetQuiz={resetQuiz}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" backgroundColor="#111827" translucent={false} />
            <Background />
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    keyboardVerticalOffset={0}
                    enabled={activeTab === 'discussion' || activeTab === 'ai'}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} numberOfLines={1}>{video.title}</Text>
                        <TouchableOpacity style={styles.moreButton}>
                            <MaterialIcons name="more-vert" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        stickyHeaderIndices={[1]}
                        keyboardDismissMode="interactive"
                        keyboardShouldPersistTaps="handled"
                    >
                        <VideoPlayer
                            ref={videoPlayerRef}
                            videoUrl={video.url}
                            onTimeUpdate={setCurrentTime}
                        />

                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            upvoteCount={upvoteCount}
                            hasUpvoted={hasUpvoted}
                            loadingUpvote={loadingUpvote}
                            handleUpvote={handleUpvote}
                        />

                        <View style={styles.tabContent}>
                            {renderTabContent()}
                        </View>
                    </ScrollView>

                    {/* Input Bars */}
                    {activeTab === 'discussion' && (
                        <InputBar
                            value={replyTo ? replyText : newMessage}
                            onChangeText={replyTo ? setReplyText : setNewMessage}
                            onSend={replyTo ? () => postReply(replyTo) : postMessage}
                            placeholder={replyTo ? "Write a reply..." : "Ask a question or start a discussion..."}
                            replyTo={replyTo}
                            onCancelReply={() => { setReplyTo(null); setReplyText(''); }}
                        />
                    )}

                    {activeTab === 'ai' && (
                        <InputBar
                            value={userQuestion}
                            onChangeText={setUserQuestion}
                            onSend={generateSummary}
                            placeholder="Ask Anything!"
                            loading={loadingSummary}
                        />
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}


