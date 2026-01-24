import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { auth0 } from '../../lib/auth0';

const upvotesCache = {};

export const useUpvotes = (video, user) => {
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [loadingUpvote, setLoadingUpvote] = useState(false);

    const fetchUpvotes = useCallback(async () => {
        if (!video?.url) return;
        const videoId = video.url;

        // Check cache
        if (upvotesCache[videoId]) {
            setUpvoteCount(upvotesCache[videoId].count);
            // We still need to check user specific upvote... or we can cache that too?
            // If we cache user specific, the cache key needs to be composite or nested.
            // Simplified: we cache the count. User status might still need check if we don't cache it.
            // But let's cache the user status too if we have user.sub
        }

        try {
            const { data, error, count } = await supabase
                .from('video_upvotes')
                .select('*', { count: 'exact' })
                .eq('video_id', videoId);

            if (error) {
                console.error('Error fetching upvotes:', error);
                return;
            }

            const total = count || 0;
            setUpvoteCount(total);

            // Update simple cache
            upvotesCache[videoId] = { count: total, data: data };

            if (user?.sub) {
                const userUpvote = data?.find(upvote => upvote.user_id === user.sub);
                setHasUpvoted(!!userUpvote);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, [video?.url, user?.sub]);

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
                const { error } = await supabase
                    .from('video_upvotes')
                    .delete()
                    .eq('video_id', videoId)
                    .eq('user_id', userId);

                if (error) throw error;

                const { count } = await supabase
                    .from('video_upvotes')
                    .select('*', { count: 'exact', head: true })
                    .eq('video_id', videoId);

                await supabase
                    .from('videos')
                    .update({ upvotes: count || 0 })
                    .eq('id', video.id);

                setHasUpvoted(false);
                setUpvoteCount(count || 0);
                if (video?.url) {
                    upvotesCache[video.url] = { count: count || 0, data: null }; // Data null invalidates advanced checks but count is correct
                }
            } else {
                const { error } = await supabase
                    .from('video_upvotes')
                    .insert({
                        video_id: videoId,
                        video_title: video.title,
                        user_id: userId,
                        user_email: userEmail,
                    });

                if (error) throw error;

                const { count } = await supabase
                    .from('video_upvotes')
                    .select('*', { count: 'exact', head: true })
                    .eq('video_id', videoId);

                await supabase
                    .from('videos')
                    .update({ upvotes: count || 0 })
                    .eq('id', video.id);

                setHasUpvoted(true);
                setUpvoteCount(count || 0);
                if (video?.url) {
                    upvotesCache[video.url] = { count: count || 0, data: null };
                }
            }
        } catch (error) {
            console.error('Error toggling upvote:', error);
            Alert.alert('Error', 'Failed to update upvote. Please try again.');
        } finally {
            setLoadingUpvote(false);
        }
    };

    useEffect(() => {
        fetchUpvotes();
    }, [fetchUpvotes]);

    return {
        upvoteCount,
        hasUpvoted,
        loadingUpvote,
        handleUpvote
    };
};
