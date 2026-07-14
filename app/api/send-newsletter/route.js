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

    // Resend's shared "onboarding@resend.dev" sender only allows delivery
    // to the email the Resend account itself was created with, until a
    // domain is verified at resend.com/domains. Until then, narrow the
    // send down to that one test address so real sends don't 403. Once a
    // domain is verified, set RESEND_DOMAIN_VERIFIED=true in the
    // environment (no code change needed) to reach every registered user.
    const domainVerified = process.env.RESEND_DOMAIN_VERIFIED === "true";
    const recipients = domainVerified
      ? emails
      : emails.filter((email) => email === process.env.RESEND_TEST_RECIPIENT);

    if (!domainVerified && !process.env.RESEND_TEST_RECIPIENT) {
      console.error("RESEND_TEST_RECIPIENT is not configured.");
      return new Response("RESEND_TEST_RECIPIENT not configured", { status: 500 });
    }

    if (recipients.length === 0) {
      return new Response(
        "No sendable recipients (Resend sandbox mode restricts sending until a domain is verified)",
        { status: 200 }
      );
    }

    // Pick a quote deterministically based on the current week, so each
    // weekly send is different without needing to store any extra state.
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const quote = quotes[weekNumber % quotes.length];

    const { error: sendError } = await resend.emails.send({
      from: "Stillpoint <onboarding@resend.dev>",
      // In sandbox mode Resend requires every address on the send,
      // including "to", to be the account's own verified email. Using it
      // here (rather than the resend.dev placeholder) satisfies that, and
      // remains a harmless, valid "to" once a real domain is verified too.
      to: process.env.RESEND_TEST_RECIPIENT,
      bcc: recipients,
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

    return new Response(
      `Newsletter sent to ${recipients.length} of ${emails.length} registered subscriber(s)`,
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter send error:", error);
    return new Response("Newsletter send failed", { status: 500 });
  }
}
