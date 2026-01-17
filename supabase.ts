
import { createClient } from '@supabase/supabase-js';

// Direct access to process.env is standard for most hosting environments (Vercel, etc.)
// We use a fallback to empty string to prevent runtime crashes
const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || '';

// If keys are missing, we export null. 
// The app will check this and provide a fallback or instructions.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase credentials not found. Cloud features are disabled. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
}
