import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../cors.ts";
import { ENCRYPTION_KEY, supabase } from "../supabase-client.ts";

async function encrypt(text: string) {
  const keyBuffer = new TextEncoder().encode(ENCRYPTION_KEY).slice(0, 32);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text),
  );

  return `${btoa(String.fromCharCode(...iv))}.${
    btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  }`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { name, surname, secret_key } = await req.json();

    const encryptedKey = await encrypt(secret_key);

    const { error } = await supabase.from("users").insert(
      { name, surname, secret_key: encryptedKey },
    );

    if (error) throw new Error("Error during adding to table: ", error);

    return new Response(
      JSON.stringify({
        message:
          `Correctly saved user data with encrypted user key! Secret_key before: ${secret_key}, secret_key after: ${encryptedKey}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
