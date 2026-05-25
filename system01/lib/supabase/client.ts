import { createBrowserClient } from "@supabase/ssr";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL inválida. Use uma URL como: https://seu-projeto.supabase.co"
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não encontrada no .env.local."
    );
  }

  return {
    supabaseUrl,
    supabaseKey,
  };
}

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseKey);
}