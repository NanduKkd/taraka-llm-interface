import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { Json } from '../types/supabase.ts';

export const listMessages = async(supabase: SupabaseClient, sessionId: number) => {
  const { data, error } = await supabase.from('messages').select('*').eq('session_id', sessionId);
  if(error)
    throw error;
  return data;
}

export const saveMessage = async(supabase: SupabaseClient, content: Json, model: string, provider: string, role: string, session_id: number) => {
  const { error } = await supabase.from('messages').insert({
    content,
    model,
    provider,
    role,
    session_id,
  })
  if(error)
    throw error;
}

export const getLastSessionMessage = async(supabase: SupabaseClient, session_id: number) => {
  const { error, data } = await supabase.from('messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', {ascending: false})
    .range(0,1);
  if(error)
    throw error;
  return data;
}
