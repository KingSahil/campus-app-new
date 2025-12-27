import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-web-webview';

const { width } = Dimensions.get('window');

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
    if (!url) return null;
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
    const [activeTab, setActiveTab] = useState('upvotes');
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    
    // AI Summarizer states
    const [timestamp, setTimestamp] = useState('');
    const [userQuestion, setUserQuestion] = useState('');
    const [summary, setSummary] = useState('')
    const [loadingSummary, setLoadingSummary] = useState(false);
    
    // Quiz states
    const [quiz, setQuiz] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    
    // Check if the video is a YouTube video
    const youtubeVideoId = getYouTubeVideoId(video.url);
    const isYouTubeVideo = youtubeVideoId !== null;

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-capture current timestamp
    const captureCurrentTime = () => {
        if (currentTime > 0) {
            setTimestamp(formatTime(currentTime));
        }
    };

    const generateSummary = async () => {
        if (!timestamp.trim() && currentTime === 0) {
            Alert.alert('Error', 'Please enter a timestamp or play the video');
            return;
        }

        const timeToUse = timestamp.trim() || formatTime(currentTime);
        const questionContext = userQuestion.trim() 
            ? `The student asks: "${userQuestion}". ` 
            : '';

        setLoadingSummary(true);
        try {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${questionContext}Provide a detailed summary and explanation for the video titled "${video.title}" at timestamp ${timeToUse}. Focus on answering the student's question if provided, otherwise explain the main concepts, important takeaways, and any formulas or definitions mentioned around this time. Format the response with clear headings and bullet points.`
                            }]
                        }]
                    })
                }
            );

            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                setSummary(data.candidates[0].content.parts[0].text);
            } else {
                Alert.alert('Error', 'Failed to generate summary');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate summary: ' + error.message);
        } finally {
            setLoadingSummary(false);
        }
    };

    const generateQuiz = async () => {
        setLoadingQuiz(true);
        try {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Generate a quiz with 5 multiple-choice questions based on the video titled "${video.title}". Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format as JSON array with structure: [{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A"}]. Only return valid JSON, no additional text.`
                            }]
                        }]
                    })
                }
            );

            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                const text = data.candidates[0].content.parts[0].text;
                const jsonMatch = text.match(/\[.*\]/s);
                if (jsonMatch) {
                    const quizData = JSON.parse(jsonMatch[0]);
                    setQuiz(quizData);
                    setSelectedAnswers({});
                    setShowResults(false);
                } else {
                    Alert.alert('Error', 'Failed to parse quiz data');
                }
            } else {
                Alert.alert('Error', 'Failed to generate quiz');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate quiz: ' + error.message);
        } finally {
            setLoadingQuiz(false);
        }
    };

    const submitQuiz = () => {
        setShowResults(true);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upvotes':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.upvoteSection}>
                            <TouchableOpacity style={styles.upvoteButton}>
                                <MaterialIcons name="thumb-up" size={32} color="#3B82F6" />
                            </TouchableOpacity>
                            <Text style={styles.upvoteCount}>1.2K Upvotes</Text>
                            <Text style={styles.upvoteSubtext}>Tap to upvote this video</Text>
                        </View>
                    </View>
                );
            case 'discussion':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.comingSoonText}>Discussion Forum</Text>
                        <Text style={styles.comingSoonSubtext}>
                            Join the conversation with your classmates
                        </Text>
                        <View style={styles.discussionPreview}>
                            <MaterialIcons name="forum" size={48} color="#6B7280" />
                            <Text style={styles.previewText}>No discussions yet. Be the first!</Text>
                        </View>
                    </View>
                );
            case 'ai':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>AI Summarizer</Text>
                        <View style={styles.aiCard}>
                            <MaterialIcons name="auto-awesome" size={32} color="#8B5CF6" />
                            <Text style={styles.aiText}>
                                Get AI-powered summaries for specific timestamps
                            </Text>
                            
                            <View style={styles.timestampSection}>
                                <View style={styles.timestampRow}>
                                    <View style={styles.timestampInput}>
                                        <Text style={styles.inputLabel}>Timestamp</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., 5:30"
                                            placeholderTextColor="#6B7280"
                                            value={timestamp}
                                            onChangeText={setTimestamp}
                                        />
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.captureButton}
                                        onPress={captureCurrentTime}
                                    >
                                        <MaterialIcons name="access-time" size={24} color="#8B5CF6" />
                                        <Text style={styles.captureText}>Capture</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {currentTime > 0 && (
                                    <Text style={styles.currentTimeText}>
                                        Current: {formatTime(currentTime)}
                                    </Text>
                                )}
                            </View>
                            
                            <View style={styles.questionInput}>
                                <Text style={styles.inputLabel}>Your Question or Doubt (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.multilineInput]}
                                    placeholder="What is the doubt? What do you want to know?"
                                    placeholderTextColor="#6B7280"
                                    value={userQuestion}
                                    onChangeText={setUserQuestion}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.aiButton}
                                onPress={generateSummary}
                                disabled={loadingSummary}
                            >
                                {loadingSummary ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.aiButtonText}>Generate Summary</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        
                        {summary ? (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>
                                    {userQuestion ? `Answer: ${userQuestion.substring(0, 50)}...` : `Summary for ${timestamp || formatTime(currentTime)}`}
                                </Text>
                                <Text style={styles.summaryText}>{summary}</Text>
                            </View>
                        ) : null}
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
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
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
                        <WebView
                            style={styles.video}
                            source={{ html: `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body { margin: 0; padding: 0; background: #000; }
                                        iframe { border: none; }
                                    </style>
                                </head>
                                <body>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src="https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1"
                                        frameborder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen
                                    ></iframe>
                                </body>
                                </html>
                            ` }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsFullscreenVideo={true}
                        />
                    ) : (
                        <DirectVideoPlayer videoUrl={video.url} onTimeUpdate={setCurrentTime} />
                    )}
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upvotes' && styles.activeTab]}
                        onPress={() => setActiveTab('upvotes')}
                    >
                        <MaterialIcons
                            name="thumb-up"
                            size={24}
                            color={activeTab === 'upvotes' ? '#3B82F6' : '#9CA3AF'}
                        />
                        <Text style={[styles.tabText, activeTab === 'upvotes' && styles.activeTabText]}>
                            1.2K Upvotes
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
                            AI Summarizer
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
                        <MaterialIcons name="school" size={24} color="#3B82F6" />
                        <Text style={[styles.navLabel, { color: '#3B82F6' }]}>Learning</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="event-available" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => navigation.navigate('Notices')}
                    >
                        <MaterialIcons name="notifications" size={24} color="#9CA3AF" />
                        <Text style={styles.navLabel}>Notices</Text>
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
    safeArea: {
        flex: 1,
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
    bottomNav: {
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
