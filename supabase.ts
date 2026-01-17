
import { createClient } from '@supabase/supabase-js';

// Vercel environment variables are injected at build time
const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * DATABASE SCHEMA REQUIREMENTS:
 * Table: 'portfolio'
 * Columns: 
 * - id: int8 (primary key, set to 1)
 * - data: jsonb (stores the entire PortfolioData object)
 * - updated_at: timestamptz (default: now())
 */
