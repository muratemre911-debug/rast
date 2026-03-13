import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase: Missing credentials');
    return null;
  }
  
  if (supabaseUrl.includes('your-project')) {
    console.log('Supabase: Using placeholder');
    return null;
  }
  
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase: Connected');
    return supabaseClient;
  } catch (error) {
    console.error('Supabase error:', error);
    return null;
  }
};

export const supabase = {
  get client(): SupabaseClient | null {
    return getSupabaseClient();
  }
};
