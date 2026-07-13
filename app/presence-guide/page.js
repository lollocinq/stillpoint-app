import AuthGate from "../../components/AuthGate";

export default function PresenceGuide() {
  return (
    <div className="theme-presence">
      <section className="guide-header">
        <p className="eyebrow">In the spirit of Eckhart Tolle&rsquo;s teachings</p>
        <h1>Presence Guide</h1>
        <p className="subtitle">
          Bring a question or a weight you&rsquo;re carrying. Sit with it here for a moment.
        </p>
      </section>

      <AuthGate>
        <div className="chat-mock">
          <div className="chat-bubble">
            &ldquo;Notice what you are feeling right now, without needing to fix it. What
            remains when you stop thinking about the problem, and simply feel the moment you
            are in?&rdquo;
          </div>
          <div className="chat-input-mock">
            <input
              type="text"
              placeholder="Type your question here... (chat not yet connected)"
              disabled
            />
            <button disabled>Send</button>
          </div>
        </div>
      </AuthGate>

      <footer>Placeholder content &middot; chat functionality arrives in a later build step</footer>
    </div>
  );
}
