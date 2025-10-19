import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ietktalvzyykynhdkqhv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTIwNTQsImV4cCI6MjA2NzcyODA1NH0.ZRTRG5fAnJfJF0Fq-NMyBJKeWKy8wsByC8tOu6eWBFw';

const getGlobal = () => {
	if (typeof globalThis !== 'undefined') return globalThis;
	if (typeof window !== 'undefined') return window;
	return global;
};

const g = getGlobal();
if (!g.__supabase_client__) {
	g.__supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
export const supabase = g.__supabase_client__;