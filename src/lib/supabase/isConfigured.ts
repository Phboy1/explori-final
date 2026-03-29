import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
