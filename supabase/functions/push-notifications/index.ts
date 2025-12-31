// @ts-nocheck
// supabase/functions/push-notifications/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface NotificationPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    sender_id: string;
    recipient_id: string;
    message: string;
    // ... any other fields
  };
  schema: "public";
}

serve(async (req) => {
  const payload: NotificationPayload = await req.json();

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Get the Recipient's Expo Push Token
  const { data: user, error } = await supabase
    .from("students")
    .select("expo_push_token")
    .eq("id", payload.record.recipient_id)
    .single();

  if (error || !user || !user.expo_push_token) {
    console.log("No token found for user", payload.record.recipient_id);
    return new Response("No token found", { status: 200 });
  }

  // 2. Send Push Notification via Expo API
  const message = {
    to: user.expo_push_token,
    sound: "default",
    title: "New Message",
    body: payload.record.message,
    data: { url: "/messages" },
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  return new Response("Notification sent", { status: 200 });
});
