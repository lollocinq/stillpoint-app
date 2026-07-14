import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Stripe webhook missing signature header.");
      return new Response("Webhook signature missing", { status: 200 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session?.metadata?.user_id;

      if (!userId) {
        console.error("Stripe webhook missing user_id in session metadata.", session?.id);
        return new Response("Webhook received", { status: 200 });
      }

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Supabase service role environment variables are not configured.");
        return new Response("Webhook received", { status: 200 });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      console.log("Stripe webhook payment insert start", {
        userId,
        sessionId: session.id,
        eventType: event.type,
      });

      const insertResult = await supabase.from("payments").insert({
        user_id: userId,
        paid: true,
        stripe_session_id: session.id,
      });

      console.log("Stripe webhook payment insert result", insertResult);

      if (insertResult.error) {
        throw insertResult.error;
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new Response("Webhook received", { status: 200 });
  }
}
