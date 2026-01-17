
import { createClient } from '@supabase/supabase-js';

// Safe environment variable access for browser environments
const getEnv = (key: string): string => {
  try {
    // Check if process and process.env exist before accessing
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    return '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Create client only if credentials exist, otherwise return null
// This prevents the app from crashing on initialization
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
