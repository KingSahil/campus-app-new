import { supabase } from './supabase';

// ==================== SUBJECTS ====================

export async function getSubjects() {
    const { data, error } = await supabase
        .from('subjects')
        .select(`
            *,
            topics:topics(name)
        `)
        .order('created_at', { ascending: false });

    if (error) return { data, error };

    // Format the data to include topic count and preview
    const formattedData = data?.map(subject => ({
        ...subject,
        topic_count: subject.topics?.length || 0,
        topics_preview: subject.topics?.length > 0 
            ? `${subject.topics.length} ${subject.topics.length === 1 ? 'topic' : 'topics'}`
            : 'No topics yet'
    }));

    return { data: formattedData, error };
}

export async function createSubject(name, topicsPreview = '') {
    const { data, error } = await supabase
        .from('subjects')
        .insert([{ name, topics_preview: topicsPreview }])
        .select()
        .single();

    return { data, error };
}

export async function updateSubject(id, updates) {
    const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteSubject(id) {
    const { data, error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

    return { data, error };
}

// ==================== TOPICS ====================

export async function getTopicsBySubject(subjectId) {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function createTopic(subjectId, name) {
    const { data, error } = await supabase
        .from('topics')
        .insert([{ subject_id: subjectId, name }])
        .select()
        .single();

    return { data, error };
}

export async function updateTopic(id, updates) {
    const { data, error } = await supabase
        .from('topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteTopic(id) {
    const { data, error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

    return { data, error };
}

// ==================== VIDEOS ====================

// Helper function to extract YouTube video ID and generate thumbnail
function getYouTubeThumbnail(url) {
    // Try to extract video ID from various YouTube URL formats
    let videoId = null;
    
    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
        videoId = watchMatch[1];
    }
    
    // Short URL: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
        videoId = shortMatch[1];
    }
    
    // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/\/shorts\/([^?&]+)/);
    if (shortsMatch) {
        videoId = shortsMatch[1];
    }
    
    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/\/embed\/([^?&]+)/);
    if (embedMatch) {
        videoId = embedMatch[1];
    }
    
    // If we found a video ID, return the high-quality thumbnail
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    // Fallback to a placeholder if not a YouTube URL
    return `https://picsum.photos/320/180?random=${Date.now()}`;
}

export async function getVideosByTopic(topicId) {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('topic_id', topicId)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function createVideo(topicId, title, url) {
    const thumbnail = getYouTubeThumbnail(url);
    
    const { data, error } = await supabase
        .from('videos')
        .insert([{ 
            topic_id: topicId, 
            title, 
            url,
            thumbnail
        }])
        .select()
        .single();

    return { data, error };
}

export async function updateVideo(id, updates) {
    const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteVideo(id) {
    const { data, error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

    return { data, error };
}

export async function upvoteVideo(id, currentUpvotes) {
    const { data, error } = await supabase
        .from('videos')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}
