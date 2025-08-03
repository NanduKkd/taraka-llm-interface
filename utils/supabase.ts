import { createClient } from 'npm:@supabase/supabase-js@2'
import { Database } from '../types/supabase.ts';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuY3hhaWx3d2h1dmN5b2Fob2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTM1NjYsImV4cCI6MjA2OTMyOTU2Nn0.Y2FfV48fbgow-8dP9HDXxNfohYARrvTC5fOM2eP3iBQ'
const URL = 'https://bncxailwwhuvcyoahoaj.supabase.co';

const supabase = createClient<Database>(URL, API_KEY);

export default supabase;
