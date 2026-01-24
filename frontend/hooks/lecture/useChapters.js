import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

const chaptersCache = {};

export const useChapters = (video, isYouTubeVideo) => {
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [overallSummary, setOverallSummary] = useState('');

    const saveChaptersToDatabase = async (chaptersData, summaryData) => {
        if (!video.id) return;

        // Update Cache locally instantly
        chaptersCache[video.id] = { chapters: chaptersData, overall_summary: summaryData };

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

    const fetchSavedChapters = useCallback(async () => {
        if (!video.id) return;

        // Check cache first
        if (chaptersCache[video.id]) {
            setChapters(chaptersCache[video.id].chapters);
            setOverallSummary(chaptersCache[video.id].overall_summary);
            return;
        }

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
                // Save to cache
                chaptersCache[video.id] = {
                    chapters: data.chapters || [],
                    overall_summary: data.overall_summary || ''
                };
                console.log('Loaded saved chapters from database');
            }
        } catch (error) {
            console.error('Error loading chapters:', error);
        }
    }, [video.id]);

    const generateChapters = async () => {
        if (!isYouTubeVideo) {
            Alert.alert('Not Supported', 'Chapter generation is only available for YouTube videos');
            return;
        }

        setLoadingChapters(true);
        try {
            // Get backend URL from environment variable
            const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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

    useEffect(() => {
        fetchSavedChapters();
    }, [fetchSavedChapters]);

    return {
        chapters,
        loadingChapters,
        overallSummary,
        generateChapters
    };
};
