import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { Json, Database } from '../types/supabase.ts';

export const listMessages = async(supabase: SupabaseClient<Database>, sessionId: number) => {
  const { data, error } = await supabase.from('messages').select('*').eq('session_id', sessionId);
  if(error)
    throw error;
  return data;
}

export const saveMessage = async(supabase: SupabaseClient<Database>, data: Database['public']['Tables']['messages']['Insert']) => {
  const { error } = await supabase.from('messages').insert(data)
  if(error)
    throw error;
}

export const getLastSessionMessage = async(supabase: SupabaseClient<Database>, session_id: number) => {
  const { error, data } = await supabase.from('messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', {ascending: false})
    .range(0,1);
  if(error)
    throw error;
  return data;
}
