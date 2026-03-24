"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createBrowserSupabaseClient() {
  if (client) {
    return client;
  }

  const env = getSupabaseEnv();

  client = createBrowserClient<Database>(env.url, env.anonKey);

  return client;
}
