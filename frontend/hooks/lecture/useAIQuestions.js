import { useState, useCallback } from 'react';
import { Keyboard, Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

export const useAIQuestions = (video) => {
    const [userQuestion, setUserQuestion] = useState('');
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);

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

    const generateSummary = async () => {
        const question = userQuestion.trim();
        if (!question) {
            Alert.alert('Error', 'Please enter your question or doubt');
            return;
        }

        // Clear input immediately for better UX
        setUserQuestion('');
        Keyboard.dismiss();
        setLoadingSummary(true);

        try {
            // Check if we have a cached answer for this question
            const cachedAnswer = await fetchSavedAIQuestions(question);
            if (cachedAnswer && cachedAnswer.answer) {
                setSummary(cachedAnswer.answer);
                console.log('Loaded cached AI answer from database');
                setLoadingSummary(false);
                return;
            }

            // Get backend URL from environment variable
            const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

            const response = await fetch(`${BACKEND_URL}/ai-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: video.url,
                    video_title: video.title,
                    question: question,
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
                await saveAIQuestionToDatabase(question, data.answer);
            } else {
                Alert.alert('Error', 'No answer generated. Please try again.');
                // Restore question if failed? Maybe not needed as user might want to ask something else.
                // setUserQuestion(question); 
            }
        } catch (error) {
            console.error('Summary Error:', error);
            Alert.alert('Error', 'Failed to generate answer: ' + error.message);
            setUserQuestion(question); // Restore on error so user doesn't lose text
        } finally {
            setLoadingSummary(false);
        }
    };

    return {
        userQuestion,
        setUserQuestion,
        summary,
        loadingSummary,
        generateSummary
    };
};
