import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const insforge = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export const supabase = insforge;

export async function createProfile(user) {
    const { data, error } = await insforge
        .from('profiles')
        .insert([
            {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                role: 'student',
                avatar_url: user.user_metadata?.avatar_url || ''
            }
        ])
        .select()
        .maybeSingle();

    return { data, error };
}

export async function getProfile(userId) {
    const { data, error } = await insforge
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    return { data, error };
}

export async function updateProfile(userId, updates) {
    const { data, error } = await insforge
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();

    return { data, error };
}