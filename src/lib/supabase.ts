import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être configurées.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type Profile = {
  id: string;
  role: 'jury' | 'admin';
  jury_number: string | null;
  display_name: string | null;
  created_at: string;
};
