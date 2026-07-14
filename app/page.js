import { quotes } from "../lib/quotes";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Stillpoint</h1>
        <p className="subtitle">
          A quiet space for reflection, and two guides to sit with when you need one.
        </p>
        <div className="guide-links">
          <a href="/presence-guide" className="btn">
            Enter the Presence Guide
          </a>
          <a href="/krishnamurti-guide" className="btn">
            Enter the Krishnamurti Guide
          </a>
        </div>
      </section>

      <section className="quotes">
        {quotes.map((q) => (
          <div className="quote" key={q.text}>
            <p>&ldquo;{q.text}&rdquo;</p>
            <cite>{q.author}</cite>
          </div>
        ))}
      </section>

      <footer>Placeholder content &middot; Stillpoint is a work in progress</footer>
    </>
  );
}
