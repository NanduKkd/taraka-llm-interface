export const dbConstants = {
  supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY')!,
}

export const aiConstants = {
  googleai: {
    apiKey: Deno.env.get('GOOGLEAI_API_KEY')!,
  }
}
