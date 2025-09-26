import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ietktalvzyykynhdkqhv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTIwNTQsImV4cCI6MjA2NzcyODA1NH0.ZRTRG5fAnJfJF0Fq-NMyBJKeWKy8wsByC8tOu6eWBFw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);