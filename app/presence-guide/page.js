import AuthGate from "../../components/AuthGate";
import PresenceChat from "../../components/PresenceChat";

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
        <PresenceChat />
      </AuthGate>

      <footer>Placeholder content &middot; Presence Guide chat is now live</footer>
    </div>
  );
}
