import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY")!;
export const ENCRYPTION_KEY = Deno.env.get("VITE_ENCRYPTION_KEY")!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
