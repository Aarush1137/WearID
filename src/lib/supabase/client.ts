import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createMockSupabaseClient, MockSupabaseClient } from "./mock-client";

export type AppSupabaseClient = any;

/**
 * Isomorphic Supabase Client Factory.
 * Automatically falls back to the in-memory mock client when:
 * 1. NEXT_PUBLIC_USE_LOCAL_MOCKS is explicitly "true", OR
 * 2. Supabase URL / Anon Key are absent in the local environment.
 *
 * This allows complete zero-credential local development and offline PWA operation.
 */
export function createClient(): AppSupabaseClient {
  const forceMocks = process.env.NEXT_PUBLIC_USE_LOCAL_MOCKS === "true";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (forceMocks || !supabaseUrl || !supabaseAnonKey) {
    return createMockSupabaseClient();
  }

  return createSupabaseJsClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
