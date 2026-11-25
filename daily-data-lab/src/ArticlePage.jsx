// Research article for a Daily Data Lab day (#/day/N/article): abstract, numbered sections, a figure from the
// day's real data, data availability, how to cite (with BibTeX), and the day's DOI-checked references.
import { useState } from "react";
import { dayText, localeFor, t } from "../../assets/i18n.js";
import { DownloadButton } from "./StudyDownloads.jsx";
import { ARTICLES, REFERENCES } from "./articles/index.ts";

const UI = {
  en: { kicker: "Research article", by: "Alicia Espinoza · Daily Data Lab", published: "Published", keywords: "Keywords", abstract: "Abstract",
    back: "Interactive study", excel: "Data in Excel", print: "Print or save as PDF", figure: "Figure 1", availability: "Data and code availability",
    availText: "Every number in this article can be recomputed from the interactive study, the data download in Excel (every table behind the study) and the public source code.",
    code: "Source code", cite: "How to cite", copy: "Copy BibTeX", copied: "BibTeX copied.", refs: "References", article: "Research article", lang: "en" },
  es: { kicker: "Artículo de investigación", by: "Alicia Espinoza · Daily Data Lab", published: "Publicado", keywords: "Palabras clave", abstract: "Resumen",
    back: "Estudio interactivo", excel: "Datos en Excel", print: "Imprimir o guardar como PDF", figure: "Figura 1", availability: "Disponibilidad de datos y código",
    availText: "Cada cifra de este artículo se puede recalcular desde el estudio interactivo, la descarga de datos en Excel (todas las tablas del estudio) y el código fuente público.",
    code: "Código fuente", cite: "Cómo citar", copy: "Copiar BibTeX", copied: "BibTeX copiado.", refs: "Referencias", article: "Artículo de investigación", lang: "es" },
  pt: { kicker: "Artigo de pesquisa", by: "Alicia Espinoza · Daily Data Lab", published: "Publicado", keywords: "Palavras-chave", abstract: "Resumo",
    back: "Estudo interativo", excel: "Dados em Excel", print: "Imprimir ou salvar como PDF", figure: "Figura 1", availability: "Disponibilidade de dados e código",
    availText: "Cada número deste artigo pode ser recalculado a partir do estudo interativo, do download dos dados em Excel (todas as tabelas do estudo) e do código-fonte público.",
    code: "Código-fonte", cite: "Como citar", copy: "Copiar BibTeX", copied: "BibTeX copiado.", refs: "Referências", article: "Artigo de pesquisa", lang: "pt" },
  fr: { kicker: "Article de recherche", by: "Alicia Espinoza · Daily Data Lab", published: "Publié le", keywords: "Mots-clés", abstract: "Résumé",
    back: "Étude interactive", excel: "Données Excel", print: "Imprimer ou enregistrer en PDF", figure: "Figure 1", availability: "Disponibilité des données et du code",
    availText: "Chaque chiffre de cet article peut être recalculé à partir de l’étude interactive, du téléchargement des données Excel (toutes les tables de l’étude) et du code source public.",
    code: "Code source", cite: "Comment citer", copy: "Copier le BibTeX", copied: "BibTeX copié.", refs: "Références", article: "Article de recherche", lang: "fr" },
  it: { kicker: "Articolo di ricerca", by: "Alicia Espinoza · Daily Data Lab", published: "Pubblicato", keywords: "Parole chiave", abstract: "Sintesi",
    back: "Studio interattivo", excel: "Dati in Excel", print: "Stampa o salva in PDF", figure: "Figura 1", availability: "Disponibilità di dati e codice",
    availText: "Ogni numero di questo articolo si può ricalcolare dallo studio interattivo, dal download dei dati in Excel (tutte le tabelle dello studio) e dal codice sorgente pubblico.",
    code: "Codice sorgente", cite: "Come citare", copy: "Copia BibTeX", copied: "BibTeX copiato.", refs: "Riferimenti", article: "Articolo di ricerca", lang: "it" },
  ja: { kicker: "研究論文", by: "Alicia Espinoza · Daily Data Lab", published: "公開", keywords: "キーワード", abstract: "要旨",
    back: "インタラクティブな研究", excel: "Excelデータ", print: "印刷またはPDFで保存", figure: "図1", availability: "データとコードの入手",
    availText: "この論文のすべての数値は、インタラクティブな研究、Excelのデータダウンロード（研究のすべての表）、公開ソースコードから再計算できます。",
    code: "ソースコード", cite: "引用方法", copy: "BibTeXをコピー", copied: "BibTeXをコピーしました。", refs: "参考文献", article: "研究論文", lang: "ja" },
  zh: { kicker: "研究文章", by: "Alicia Espinoza · Daily Data Lab", published: "发布于", keywords: "关键词", abstract: "摘要",
    back: "交互式研究", excel: "Excel 数据", print: "打印或另存为 PDF", figure: "图 1", availability: "数据与代码获取",
    availText: "本文中的每个数字都可以通过交互式研究、Excel 数据下载（研究中的所有表）以及公开源代码重新计算。",
    code: "源代码", cite: "引用格式", copy: "复制 BibTeX", copied: "已复制 BibTeX。", refs: "参考文献", article: "研究文章", lang: "zh" },
};
export const articleUi = (language) => UI[language] ?? UI.en;
const REPO = "https://github.com/agespinoza/Portafolio/tree/main/daily-data-lab/src/days/";
const SITE = "https://agespinoza.github.io/Portafolio/lab/index.html";

export function hasArticle(slug) { return Boolean(ARTICLES[slug]); }

export default function ArticlePage({ day, language }) {
  const set = ARTICLES[day.slug];
  const [copied, setCopied] = useState(false);
  if (!set) return null;
  const a = set[language] ?? set.en;
  const ui = articleUi(language);
  const pad = String(day.day).padStart(3, "0");
  const date = new Intl.DateTimeFormat(localeFor(language), { dateStyle: "long", timeZone: "UTC" }).format(new Date(day.date));
  const url = `${SITE}#/day/${day.day}/article`;
  const year = day.date.slice(0, 4);
  const apa = `Espinoza, A. (${year}). ${set.en.title}${/[.?!]$/.test(set.en.title) ? "" : "."} Daily Data Lab, Day ${pad}. ${url}`;
  const bib = `@misc{espinoza${year}day${pad},\n  author = {Espinoza, Alicia},\n  title = {${set.en.title}},\n  year = {${year}},\n  howpublished = {Daily Data Lab, Day ${pad}},\n  url = {${url}},\n  note = {Accessed ${new Date().toISOString().slice(0, 10)}}\n}`;
  const refs = REFERENCES[day.slug] ?? [];
  const figAt = Math.min(2, a.sections.length - 1); // the figure follows the Results section
  return (
    <article className="wrap article" lang={localeFor(language)}>
      <header className="article__head">
        <p className="kicker"><span>{ui.kicker}</span><span>{t(language, "lab.day", "Day {number}", { number: pad })}</span><span className="study-header__topic">{dayText(language, day.slug, "topic", day.topic)}</span></p>
        <h1 tabIndex={-1}>{a.title}</h1>
        <p className="article__byline">{ui.by} · {ui.published} <time dateTime={day.date}>{date}</time></p>
        <div className="article__actions">
          <a className="study-button" href={`#/day/${day.day}`}>← {ui.back}</a>
          <DownloadButton day={day} language={language} label={ui.excel} />
          <button className="study-button" type="button" onClick={() => window.print()}>{ui.print}</button>
        </div>
      </header>
      <section className="article__abstract" aria-labelledby="abstract-title">
        <h2 id="abstract-title">{ui.abstract}</h2>
        <p>{a.abstract}</p>
        <p className="article__keywords"><strong>{ui.keywords}:</strong> {a.keywords.join(" · ")}</p>
      </section>
      {a.sections.map((s, i) => (
        <section key={i} className="article__section">
          <h2>{i + 1}. {s.h}</h2>
          {s.p.map((t, j) => <p key={j}>{t}</p>)}
          {i === figAt && day.preview && (
            <figure className="article__figure">
              <img className={day.previewLight ? "art-dark" : ""} src={`../${day.preview}`} alt={dayText(language, day.slug, "previewAlt", day.previewAlt || "")} width="792" height="346" loading="lazy" />
              {day.previewLight && <img className="art-light" src={`../${day.previewLight}`} alt={dayText(language, day.slug, "previewAlt", day.previewAlt || "")} width="792" height="346" loading="lazy" />}
              <figcaption><strong>{ui.figure}.</strong> {a.figure}</figcaption>
            </figure>
          )}
        </section>
      ))}
      <section className="article__section">
        <h2>{ui.availability}</h2>
        <p>{ui.availText}</p>
        <p><DownloadButton day={day} language={language} label={ui.excel} /></p>
        <ul className="article__links">
          <li><a href={`#/day/${day.day}`}>{ui.back}</a></li>
          <li><a href={REPO} rel="noopener">{ui.code} (GitHub)</a></li>
        </ul>
      </section>
      <section className="article__section">
        <h2>{ui.cite}</h2>
        <p className="article__cite">{apa}</p>
        <pre className="article__bib"><code>{bib}</code></pre>
        <button className="study-button" type="button" onClick={async () => { try { await navigator.clipboard.writeText(bib); setCopied(true); } catch { setCopied(false); } }}>{ui.copy}</button>
        <p className={copied ? "study-share__status" : "sr"} role="status">{copied ? ui.copied : ""}</p>
      </section>
      <section className="article__section">
        <h2>{ui.refs}</h2>
        <ol className="article__refs">
          {refs.map((r) => (
            <li key={r.text}>{r.text} {r.doi ? <a href={`https://doi.org/${r.doi}`} rel="noopener">doi:{r.doi}</a> : r.url ? <a href={r.url} rel="noopener">{r.url}</a> : null}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
