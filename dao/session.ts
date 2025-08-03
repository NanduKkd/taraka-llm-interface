import { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function getSession(supabase: SupabaseClient, session_id: number) {
  const { data, error } = await supabase.from('sessions').select()
    .eq('id', session_id)
    .single();
  if(error)
    throw error;
  return data;
}

export async function updateSession(supabase: SupabaseClient, session_id: number, session_title: string) {
  const { error } = await supabase.from('sessions').update({
    title: session_title
  }).eq('session_id', session_id);
  if (error)
    throw error;
}
