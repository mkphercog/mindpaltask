import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../cors.ts";
import { ENCRYPTION_KEY, supabase } from "../supabase-client.ts";

async function decrypt(encryptedText: string) {
  const keyBuffer = new TextEncoder().encode(ENCRYPTION_KEY).slice(0, 32);
  const [ivBase64, encryptedBase64] = encryptedText.split(".");

  const iv = new Uint8Array(
    atob(ivBase64).split("").map((char) => char.charCodeAt(0)),
  );
  const encryptedData = new Uint8Array(
    atob(encryptedBase64).split("").map((char) => char.charCodeAt(0)),
  );

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData,
  );

  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { data } = await supabase.from("users").select("*");
    if (!data) {
      return new Response(JSON.stringify({ error: "No data found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const decryptedUsersData = await Promise.all(data.map(
      async ({ name, surname, secret_key }) => {
        const decryptedKey = await decrypt(secret_key);

        return { name, surname, secret_key: decryptedKey };
      },
    ));

    return new Response(JSON.stringify(decryptedUsersData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
});
