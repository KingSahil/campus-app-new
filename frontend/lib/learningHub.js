import { insforge } from './insforge';

// ==================== SUBJECTS ====================

export async function getSubjects() {
    const { data, error } = await insforge
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function createSubject(name, topicsPreview = '') {
    const { data, error } = await insforge
        .from('subjects')
        .insert([{ name, topics_preview: topicsPreview }])
        .select()
        .single();

    return { data, error };
}

export async function updateSubject(id, updates) {
    const { data, error } = await insforge
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteSubject(id) {
    const { data, error } = await insforge
        .from('subjects')
        .delete()
        .eq('id', id);

    return { data, error };
}

// ==================== TOPICS ====================

export async function getTopicsBySubject(subjectId) {
    const { data, error } = await insforge
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function createTopic(subjectId, name) {
    const { data, error } = await insforge
        .from('topics')
        .insert([{ subject_id: subjectId, name }])
        .select()
        .single();

    return { data, error };
}

export async function updateTopic(id, updates) {
    const { data, error } = await insforge
        .from('topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteTopic(id) {
    const { data, error } = await insforge
        .from('topics')
        .delete()
        .eq('id', id);

    return { data, error };
}

// ==================== VIDEOS ====================

export async function getVideosByTopic(topicId) {
    const { data, error } = await insforge
        .from('videos')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

    return { data, error };
}

export async function createVideo(topicId, title, url) {
    const { data, error } = await insforge
        .from('videos')
        .insert([{ 
            topic_id: topicId, 
            title, 
            url,
            thumbnail: `https://picsum.photos/320/180?random=${Date.now()}`
        }])
        .select()
        .single();

    return { data, error };
}

export async function updateVideo(id, updates) {
    const { data, error } = await insforge
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteVideo(id) {
    const { data, error } = await insforge
        .from('videos')
        .delete()
        .eq('id', id);

    return { data, error };
}

export async function upvoteVideo(id, currentUpvotes) {
    const { data, error } = await insforge
        .from('videos')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}
