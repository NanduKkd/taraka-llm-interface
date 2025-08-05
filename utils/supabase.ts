import { createClient as createSupabaseClient } from 'npm:@supabase/supabase-js@2'
import { Database } from '../types/supabase.ts';
import { dbConstants } from '../config/constants.ts';

const API_KEY = dbConstants.supabaseAnonKey;
const URL = 'https://bncxailwwhuvcyoahoaj.supabase.co';

export default function createClient (apiKey: string) {
  const supabase = createSupabaseClient<Database>(URL, API_KEY, { accessToken: async() => apiKey });
  return supabase;
}
