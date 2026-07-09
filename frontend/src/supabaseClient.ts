import { createclient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("SupabaseURL:", supabaseUrl);
console.log("Has SupabaseKey:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('error');
}

export constant supabase = createClient(supabaseUrl, supabaseKey)
