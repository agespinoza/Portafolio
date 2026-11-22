const headings = {
  en: "Curious facts", es: "Datos curiosos", pt: "Curiosidades", zh: "有趣的发现",
  ja: "興味深いデータ", it: "Curiosità", fr: "Faits insolites",
};

export default function StudyFacts({ facts, language }) {
  return (
    <section className="study-facts" aria-labelledby="study-facts-title">
      <h2 id="study-facts-title">{headings[language] ?? headings.en}</h2>
      <div className="al-family">
        {facts.map(({ title, text }, index) => (
          <article key={title} className="al-fact">
            <span className="al-fact__n" aria-hidden="true">{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
