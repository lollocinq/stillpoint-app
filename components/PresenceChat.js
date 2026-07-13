"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PresenceChat() {
  const [messages, setMessages] = useState([
    {
      role: "guide",
      text: "Notice what you are feeling right now, without needing to fix it. What remains when you stop thinking about the problem, and simply feel the moment you are in?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch("/api/presence-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((prev) => [...prev, { role: "guide", text: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-mock">
      {messages.map((m, i) => (
        <div
          className="chat-bubble"
          key={i}
          style={{ textAlign: m.role === "user" ? "right" : "left" }}
        >
          {m.text}
        </div>
      ))}
      {error && <p className="auth-status">{error}</p>}
      <form className="chat-input-mock" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your question here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={sending}>
          {sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
