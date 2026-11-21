// Shared "research" blocks first built for Day 003: research questions tagged by evidence, a quality and
// limitations panel, a sources table, and DOI-checked references. Each day passes text already translated
// with its own tr(); the labels below are shared.
import type { ReactNode } from "react";
import { makeTr } from "./tr.js";

export type Tag = "data" | "lit" | "hyp" | "sim";
export interface Question { q: string; a: ReactNode; tag: Tag }
export interface Source { inst: string; title: string; url: string; pub: string; cover: string; license: string; limits: string; use: string }
export interface Reference { text: string; doi?: string; url?: string }

const MESSAGES: Record<string, Record<string, string>> = {
  es: {
    analysis: "Análisis", tagLit: "De la literatura", tagData: "De estos datos", tagHyp: "Hipótesis", tagSim: "Simulación",
    qualityEyebrow: "Calidad de los datos", qualityTitle: "Calidad, limitaciones y lo que falta", provenance: "Procedencia en números",
    implemented: "Implementado", pending: "Pendiente o fuera de alcance", sourcesTitle: "Fuentes",
    inst: "Institución", title: "Título", pub: "Publicado", cover: "Cobertura", license: "Licencia", limits: "Limitaciones", use: "Uso aquí",
    refsTitle: "Referencias (DOI verificados en Crossref y doi.org)", checked: "Todos los enlaces se revisaron el {date}.",
  },
  fr: {
    analysis: "Analyse", tagLit: "Littérature", tagData: "Ces données", tagHyp: "Hypothèse", tagSim: "Simulation",
    qualityEyebrow: "Qualité des données", qualityTitle: "Qualité, limites et ce qui manque", provenance: "Provenance en chiffres",
    implemented: "Réalisé", pending: "En attente ou hors périmètre", sourcesTitle: "Sources",
    inst: "Institution", title: "Titre", pub: "Publication", cover: "Couverture", license: "Licence", limits: "Limites", use: "Usage ici",
    refsTitle: "Références (DOI vérifiés sur Crossref et doi.org)", checked: "Tous les liens ont été vérifiés le {date}.",
  },
  it: {
    analysis: "Analisi", tagLit: "Dalla letteratura", tagData: "Da questi dati", tagHyp: "Ipotesi", tagSim: "Simulazione",
    qualityEyebrow: "Qualità dei dati", qualityTitle: "Qualità, limiti e cosa manca", provenance: "Provenienza in numeri",
    implemented: "Implementato", pending: "In sospeso o fuori ambito", sourcesTitle: "Fonti",
    inst: "Istituzione", title: "Titolo", pub: "Pubblicato", cover: "Copertura", license: "Licenza", limits: "Limiti", use: "Uso qui",
    refsTitle: "Riferimenti (DOI verificati su Crossref e doi.org)", checked: "Tutti i link sono stati verificati il {date}.",
  },
  ja: {
    analysis: "分析", tagLit: "文献より", tagData: "このデータより", tagHyp: "仮説", tagSim: "シミュレーション",
    qualityEyebrow: "データ品質", qualityTitle: "品質・限界・未対応の点", provenance: "数字で見るデータの出どころ",
    implemented: "実装済み", pending: "未対応・対象外", sourcesTitle: "出典",
    inst: "機関", title: "タイトル", pub: "公開", cover: "範囲", license: "ライセンス", limits: "限界", use: "このページでの用途",
    refsTitle: "参考文献（DOIはCrossrefとdoi.orgで確認済み）", checked: "すべてのリンクは{date}に確認しました。",
  },
};
const rt = makeTr("research", MESSAGES) as (language: string, key: string, fallback: string, values?: Record<string, string | number>) => string;

export function ResearchQuestions({ title, lead, items, language }: { title: string; lead: string; items: Question[]; language: string }) {
  const tagText: Record<Tag, string> = {
    lit: rt(language, "tagLit", "From the literature"), data: rt(language, "tagData", "From this data"),
    hyp: rt(language, "tagHyp", "Hypothesis"), sim: rt(language, "tagSim", "Simulation"),
  };
  return (
    <section className="card rs-panel">
      <div className="card__head"><div>
        <p className="mono rs-eyebrow">{rt(language, "analysis", "Analysis")}</p>
        <h2>{title}</h2>
        <p className="muted">{lead}</p>
      </div></div>
      <div className="lp-qs">
        {items.map((x, i) => (
          <details key={i} className="lp-q" open={i < 2}>
            <summary><span className="lp-q__n">{i + 1}</span>{x.q}<span className={`lp-tag lp-tag--${x.tag}`}>{tagText[x.tag]}</span></summary>
            <p>{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function QualityPanel({ provenance, done, pending, language }: { provenance: string[]; done: string[]; pending: string[]; language: string }) {
  return (
    <section className="card rs-panel">
      <div className="card__head"><div>
        <p className="mono rs-eyebrow">{rt(language, "qualityEyebrow", "Data quality")}</p>
        <h2>{rt(language, "qualityTitle", "Quality, limitations, and what is still missing")}</h2>
      </div></div>
      <div className="lp-qual-grid">
        <div>
          <h3>{rt(language, "provenance", "Provenance in numbers")}</h3>
          <ul className="lp-list">{provenance.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div>
          <h3>{rt(language, "implemented", "Implemented")}</h3>
          <ul className="lp-list lp-list--ok">{done.map((p, i) => <li key={i}>{p}</li>)}</ul>
          <h3>{rt(language, "pending", "Pending or out of scope")}</h3>
          <ul className="lp-list lp-list--todo">{pending.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

export function SourcesAndReferences({ sources, refs, checkedOn, language }: { sources: Source[]; refs: Reference[]; checkedOn: string; language: string }) {
  return (
    <div className="rs-sources">
      <h3>{rt(language, "sourcesTitle", "Sources")}</h3>
      <div className="lp-table-wrap">
        <table className="lp-table lp-sources">
          <thead><tr>
            <th scope="col">{rt(language, "inst", "Institution")}</th><th scope="col">{rt(language, "title", "Title")}</th>
            <th scope="col">{rt(language, "pub", "Published")}</th><th scope="col">{rt(language, "cover", "Coverage")}</th>
            <th scope="col">{rt(language, "license", "License")}</th><th scope="col">{rt(language, "limits", "Limitations")}</th>
            <th scope="col">{rt(language, "use", "Use here")}</th>
          </tr></thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.url}><td>{s.inst}</td><td><a href={s.url} target="_blank" rel="noopener">{s.title}</a></td><td>{s.pub}</td><td>{s.cover}</td><td>{s.license}</td><td>{s.limits}</td><td>{s.use}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lp-small">{rt(language, "checked", "All links were checked on {date}.", { date: checkedOn })}</p>
      <h3>{rt(language, "refsTitle", "References (DOIs checked against Crossref and doi.org)")}</h3>
      <ol className="lp-refs">
        {refs.map((r) => (
          <li key={r.doi ?? r.url}>{r.text}{" "}
            {r.doi ? <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener">doi:{r.doi}</a>
              : r.url ? <a href={r.url} target="_blank" rel="noopener">{r.url.replace(/^https?:\/\//, "")}</a> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
