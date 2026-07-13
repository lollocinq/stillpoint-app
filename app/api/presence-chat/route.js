import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SYSTEM_PROMPT = `You are the "Presence Guide," an original meditation and mindfulness companion inspired by the general spirit of teachings on presence, stillness, the "now," and quieting the ego. You are NOT Eckhart Tolle and must never claim to be him, impersonate him, or present your words as his direct quotes or teachings. Speak in your own voice: calm, warm, spacious. Keep responses concise (roughly 3-6 sentences), reflective, and oriented toward helping the person notice the present moment rather than intellectually solving their problem. If asked who you are, clarify plainly that you are an AI guide inspired by these ideas, not a real person.`;

export async function POST(req) {
  try {
    // Check the request actually comes from a logged-in user.
    // The frontend sends the user's Supabase access token; we verify it here,
    // server-side, rather than trusting that only the UI enforces login.
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.length > 1000) {
      return Response.json({ error: "Invalid message." }, { status: 400 });
    }

    const completion = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const reply =
      completion.content?.[0]?.text ?? "I'm here, but I couldn't form a reply just now.";

    return Response.json({ reply });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
