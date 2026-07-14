import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { quotes } from "../../../lib/quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Triggered weekly by Vercel Cron (see vercel.json). Vercel automatically
// sends "Authorization: Bearer <CRON_SECRET>" on cron-triggered requests,
// which is what keeps this from being a publicly triggerable email blast.
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase service role environment variables are not configured.");
      return new Response("Supabase service role not configured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Reuse the existing registered users as the subscriber list, rather
    // than maintaining a separate signup table.
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (error) {
      throw error;
    }

    const emails = (data?.users ?? []).map((user) => user.email).filter(Boolean);

    if (emails.length === 0) {
      return new Response("No subscribers to send to", { status: 200 });
    }

    // Pick a quote deterministically based on the current week, so each
    // weekly send is different without needing to store any extra state.
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const quote = quotes[weekNumber % quotes.length];

    const { error: sendError } = await resend.emails.send({
      from: "Stillpoint <onboarding@resend.dev>",
      to: "onboarding@resend.dev",
      bcc: emails,
      subject: "This week's stillpoint",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #2b2b28;">
          <p style="font-style: italic; font-size: 18px; line-height: 1.6;">&ldquo;${quote.text}&rdquo;</p>
          <p style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; color: #6b6b64;">${quote.author}</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e0d8;" />
          <p style="font-size: 13px; color: #8a8a82;">
            You're receiving this because you registered on Stillpoint.
          </p>
        </div>
      `,
    });

    if (sendError) {
      throw sendError;
    }

    return new Response(`Newsletter sent to ${emails.length} subscriber(s)`, { status: 200 });
  } catch (error) {
    console.error("Newsletter send error:", error);
    return new Response("Newsletter send failed", { status: 500 });
  }
}
