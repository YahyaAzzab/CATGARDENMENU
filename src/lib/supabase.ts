import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const supabaseEnv = {
  url,
  anonKey,
  ready: url.length > 0 && anonKey.length > 0,
}

export const supabase: SupabaseClient | null = supabaseEnv.ready
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        storageKey: 'mcb-auth',
        autoRefreshToken: true,
      },
    })
  : null
