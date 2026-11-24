import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "./database.types";

/** 서버에서 공개 혜택을 읽는 클라이언트. 로그인 세션을 쓰지 않는다. */
export function createServerSupabase() {
  if (!isSupabaseConfigured) return null;
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
