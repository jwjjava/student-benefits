import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/** 브라우저에서 기록·설문·제보를 insert하는 클라이언트. 설정이 없으면 null. */
export function getBrowserSupabase() {
  if (!isSupabaseConfigured) return null;
  client ??= createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
