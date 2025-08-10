// NOTICE
// THIS IS NOT A PROPER TEST FILE
//
// This file is only for trying out some features
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { writeFile } from 'node:fs/promises';
import { Database } from './types/supabase.ts';

const isDev = true;

const API_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const URL = Deno.env.get('SUPABASE_URL')!;//'https://bncxailwwhuvcyoahoaj.supabase.co';
const FUNCTION_URL = isDev ? 'http:/localhost:8000/' : 'https://bncxailwwhuvcyoahoaj.supabase.co/functions/v1/LLM-Call';

const supabase = createClient(URL, API_KEY);

async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: Deno.env.get('EMAIL')!,
    password: Deno.env.get('PASSWORD')!,
  })
  if(error)
    throw error;
  const newSupa = createClient(URL, API_KEY, {accessToken: async() => await data.session.access_token});
  return { supabase: newSupa, token: data.session.access_token };
  /*
  console.log(await newSupa.from('sessions').select('*'))
  const { access_token } = data.session;
  axios.defaults.headers.Authorization = 'Bearer '+access_token;
  axios.defaults.headers.apikey = API_KEY;
  return access_token;
  */
}
async function getSession(supabase: SupabaseClient<Database>) {
  const { data: session, error } = await supabase.from('sessions').select('*').eq('id', 1).single();
  if(error)
    throw error;
  if(!session)
    throw new Error('No session found');
  console.log(session.id);
  return session;
}
async function sendMessage ({ id: sessionId}: {id: number}, token: string) {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      model: 'gemini-2.5-flash-lite',
      provider: 'googleai',
      messageContent: [{type: 'text', text: 'Hey there!'}],
      isAnonymous: true,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+token,
    },
  })

  console.log(res.status)
  if(res.body) {
    for await (const data of res.body) {
      console.log(new TextDecoder().decode(data));
    }
  }
}
async function test() {
  try {
    const { supabase, token } = await login();
    console.log(token);
    const session = await getSession(supabase);
    await sendMessage(session, token);
  } catch (error) {
    console.error(error);
  }
  // console.log(session);
}

test()
