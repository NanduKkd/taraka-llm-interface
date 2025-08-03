import { createClient as createSupabaseClient } from 'npm:@supabase/supabase-js@2'
import { Database } from '../types/supabase.ts';

const URL = 'https://bncxailwwhuvcyoahoaj.supabase.co';

export default function createClient (apiKey: string) {
  const supabase = createSupabaseClient<Database>(URL, apiKey);
  return supabase;
}
