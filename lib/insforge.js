import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://2r925b9b.us-west.insforge.app';
const insforgeAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFubmciLCJpYXQiOjE3NjY3OTkzODd9.FgQB-VM4DHFQa6OgXTd_qx-wwI01l0lQiG-2IV5Dtoo';

export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey
});

// Add auth URL to the auth object
if (insforge.auth) {
    insforge.auth.url = insforgeUrl;
}

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