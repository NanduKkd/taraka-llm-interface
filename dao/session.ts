import supabase from "../utils/supabase.ts";

export async function listSessions(): Promise<{ created_at: Date; id: number; machine_id: string; os: string; path: string; title: string | null; user_id: string; }[]> {
  const { data, error } = await supabase.from('sessions').select('*');
  if (error)
    throw error;
  return data.map(i => ({...i, created_at: new Date(i.created_at)}));
}

export async function startSession(machine_id: string, os: string, path: string): Promise<{ created_at: Date; id: number; machine_id: string; os: string; path: string; title: string | null; user_id: string; }[]> {
  const { data, error } = await supabase.from('sessions').insert({
    machine_id,
    os,
    path
  }).select();
  if (error)
    throw error;
  return {...data, created_at: new Date(data.created_at)};
}
