export default function KrishnamurtiGuide() {
  return (
    <div className="theme-krishnamurti">
      <section className="guide-header">
        <p className="eyebrow">In the spirit of Jiddu Krishnamurti&rsquo;s teachings</p>
        <h1>Krishnamurti Guide</h1>
        <p className="subtitle">
          Question the question itself. Bring what troubles your mind and look at it directly.
        </p>
      </section>

      <p className="access-note">
        Requires registration and a one-time &euro;1 payment &mdash; unlocks permanent access
        (coming in a later step).
      </p>

      <div className="chat-mock">
        <div className="chat-bubble">
          &ldquo;Why do you seek an answer from outside yourself? Can you look at the problem
          without the conditioning of past experience, and see it freshly, as if for the first
          time?&rdquo;
        </div>
        <div className="chat-input-mock">
          <input type="text" placeholder="Type your question here... (chat not yet connected)" disabled />
          <button disabled>Send</button>
        </div>
      </div>

      <footer>
        Placeholder content &middot; payment and chat functionality arrive in later build steps
      </footer>
    </div>
  );
}
