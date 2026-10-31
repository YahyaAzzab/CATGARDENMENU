import { createClient } from '@supabase/supabase-js';
function envValue(value) {
    return typeof value === 'string' ? value.trim() : '';
}
const url = envValue(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, '');
const anonKey = envValue(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    envValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    envValue(import.meta.env.VITE_SUPABASE_KEY);
export const supabaseEnv = {
    url,
    anonKey,
    ready: url.length > 0 && anonKey.length > 0,
    missing: !url ? 'url' : !anonKey ? 'key' : null,
};
export const supabase = supabaseEnv.ready
    ? createClient(url, anonKey, {
        auth: {
            persistSession: true,
            storageKey: 'mcb-auth',
            autoRefreshToken: true,
        },
    })
    : null;
