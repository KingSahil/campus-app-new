import { useState, useEffect, useCallback } from 'react';
import { Keyboard, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const discussionCache = {};

export const useDiscussion = (video, user) => {
    const [discussions, setDiscussions] = useState([]);
    const [loadingDiscussions, setLoadingDiscussions] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [expandedThreads, setExpandedThreads] = useState({});

    const fetchDiscussions = useCallback(async (forceRefresh = false) => {
        if (!video?.url) return;

        // Use cache if available and not forcing refresh
        if (!forceRefresh && discussionCache[video.url]) {
            setDiscussions(discussionCache[video.url]);
            return;
        }

        setLoadingDiscussions(true);
        try {
            const { data, error } = await supabase
                .from('video_discussions')
                .select('*')
                .eq('video_id', video.url)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const result = data || [];
            setDiscussions(result);
            discussionCache[video.url] = result;
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoadingDiscussions(false);
        }
    }, [video?.url]);

    const postMessage = async () => {
        const messageToSend = newMessage.trim();
        if (!messageToSend || !user) return;

        // Optimistic clear
        setNewMessage('');
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
                    message: messageToSend,
                    parent_id: null,
                })
                .select()
                .single();

            if (error) throw error;

            setDiscussions([data, ...discussions]);
        } catch (error) {
            console.error('Error posting message:', error);
            Alert.alert('Error', 'Failed to post message');
            setNewMessage(messageToSend); // Restore on error
        }
    };

    const postReply = async (parentId) => {
        const replyToSend = replyText.trim();
        if (!replyToSend || !user) return;

        // Optimistic clear
        setReplyText('');
        setReplyTo(null);
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
                    message: replyToSend,
                    parent_id: parentId,
                })
                .select()
                .single();

            if (error) throw error;

            setDiscussions([data, ...discussions]);
        } catch (error) {
            console.error('Error posting reply:', error);
            Alert.alert('Error', 'Failed to post reply');
            setReplyText(replyToSend); // Restore on error
            setReplyTo(parentId); // Restore parent ID
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

    useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    return {
        discussions,
        loadingDiscussions,
        newMessage,
        setNewMessage,
        replyTo,
        setReplyTo,
        replyText,
        setReplyText,
        expandedThreads,
        postMessage,
        postReply,
        toggleThread,
        getReplies,
        getMainMessages,
        formatTimeAgo
    };
};
