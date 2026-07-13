const quotes = [
  {
    text: "Realize deeply that the present moment is all you ever have.",
    author: "Eckhart Tolle",
  },
  {
    text: "The ability to observe without evaluating is the highest form of intelligence.",
    author: "Jiddu Krishnamurti",
  },
  {
    text: "Wherever you are, be all there.",
    author: "Jim Elliot",
  },
  {
    text: "You are not a drop in the ocean. You are the entire ocean in a drop.",
    author: "Rumi",
  },
];

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
          <div className="quote" key={q.author}>
            <p>&ldquo;{q.text}&rdquo;</p>
            <cite>{q.author}</cite>
          </div>
        ))}
      </section>

      <footer>Placeholder content &middot; Stillpoint is a work in progress</footer>
    </>
  );
}
