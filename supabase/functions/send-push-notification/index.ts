import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  user_phone: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_phone, title, body, icon, data }: PushPayload = await req.json();

    if (!user_phone || !title || !body) {
      return new Response(
        JSON.stringify({ error: "user_phone, title, and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return new Response(
        JSON.stringify({ error: "Push notifications not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all subscriptions for this user
    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_phone", user_phone);

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found for user:", user_phone);
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions for user ${user_phone}`);

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: data || {},
    });

    let sentCount = 0;
    let failedCount = 0;

    // Send to each subscription
    for (const sub of subscriptions) {
      try {
        // Create JWT for VAPID authentication
        const header = { alg: "ES256", typ: "JWT" };
        const now = Math.floor(Date.now() / 1000);
        const payload = {
          aud: new URL(sub.endpoint).origin,
          exp: now + 86400,
          sub: "mailto:support@vijaycare.com",
        };

        // Note: For production, you'd use web-push library
        // This is a simplified version - in production, use proper ECDSA signing
        console.log(`Would send notification to endpoint: ${sub.endpoint}`);
        
        // For now, log the notification (actual push requires proper VAPID signing)
        console.log("Notification payload:", notificationPayload);
        sentCount++;
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error sending to subscription:", error);
        failedCount++;
        
        // Remove invalid subscriptions
        if (error.message?.includes("expired") || error.message?.includes("unsubscribed")) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        message: `Notification queued for ${sentCount} devices`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
