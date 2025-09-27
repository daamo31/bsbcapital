import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks to existing values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ietktalvzyykynhdkqhv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTIwNTQsImV4cCI6MjA2NzcyODA1NH0.ZRTRG5fAnJfJF0Fq-NMyBJKeWKy8wsByC8tOu6eWBFw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);