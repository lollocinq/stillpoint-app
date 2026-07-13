"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.href : undefined,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (loading) {
    return <p className="access-note">Checking access&hellip;</p>;
  }

  if (session) {
    return children;
  }

  return (
    <div className="auth-form">
      <p>
        Enter your email to unlock this guide. We&rsquo;ll send a magic link, no password
        needed.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send magic link"}
        </button>
      </form>
      {status === "sent" && (
        <p className="auth-status">
          Check your inbox and click the link to come back here signed in.
        </p>
      )}
      {status === "error" && <p className="auth-status">{errorMsg}</p>}
    </div>
  );
}
