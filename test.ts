import { createClient } from 'npm:@supabase/supabase-js@2'
import axios from 'npm:axios';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuY3hhaWx3d2h1dmN5b2Fob2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTM1NjYsImV4cCI6MjA2OTMyOTU2Nn0.Y2FfV48fbgow-8dP9HDXxNfohYARrvTC5fOM2eP3iBQ'
const URL = 'https://bncxailwwhuvcyoahoaj.supabase.co';

const supabase = createClient(URL, API_KEY);

async function signUpNewUser() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nandukkd7164@gmail.com',
    password: 'Password@123',
  })
  const { access_token } = data.session;
  axios.defaults.headers.Authorization = 'Bearer '+access_token;
  axios.defaults.headers.apikey = API_KEY;
  return access_token;
}

const listSessions = async() => {
  const { data, error } = await supabase.from('sessions').select('*');
  console.log(data, error);
}

listSessions();
