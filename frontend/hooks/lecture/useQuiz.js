import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const quizCache = {};

export const useQuiz = (video) => {
    const [quiz, setQuiz] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

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

    const fetchSavedQuiz = useCallback(async () => {
        if (!video.id) return;

        // Check cache
        if (quizCache[video.id]) {
            setQuiz(quizCache[video.id]);
            setSelectedAnswers({});
            setShowResults(false);
            console.log('Loaded quiz from cache');
            return;
        }

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

                // Update cache
                quizCache[video.id] = data.quiz_data;
                console.log('Loaded saved quiz from database');
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    }, [video.id]);

    const generateQuiz = async () => {
        setLoadingQuiz(true);
        try {
            // Get backend URL from environment variable
            const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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
                // Update cache
                if (video?.id) {
                    quizCache[video.id] = data.quiz;
                }
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

    const submitQuiz = () => {
        setShowResults(true);
    };

    const resetQuiz = () => {
        setQuiz(null);
        setSelectedAnswers({});
        setShowResults(false);
    }

    useEffect(() => {
        fetchSavedQuiz();
    }, [fetchSavedQuiz]);

    return {
        quiz,
        loadingQuiz,
        selectedAnswers,
        setSelectedAnswers,
        showResults,
        setShowResults,
        generateQuiz,
        submitQuiz,
        resetQuiz
    };
};
