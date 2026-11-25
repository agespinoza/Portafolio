// "Data in Excel": builds an .xlsx in the visitor's browser from the same data the page uses (src/exports.ts,
// src/xlsx.ts). Nothing is stored in the repository, every new day gets it by adding one EXPORTS entry, and the file
// always matches the page. The first sheet explains the study in the visitor's language.
import { useState } from "react";
import { dayText, localeFor } from "../../assets/i18n.js";
import { EXPORTS } from "./exports";
import { infoSheet, saveBlob, workbook } from "./xlsx";

const SITE = "https://agespinoza.github.io/Portafolio/lab/index.html";

const messages = {
  en: { button: "Data in Excel", title: "Download the data", lead: "Every table behind this study as an Excel workbook, built from the data this page uses right now: typed columns, filters, frozen headers, and a first sheet with the sources.",
    get: "Download Excel (.xlsx)", busy: "Building…", about: "About", study: "Study", summary: "Summary", date: "Published", page: "Interactive page", article: "Research article",
    source: "Source", license: "Use", licenseText: "Cite the original sources above. Each source keeps its own license, listed on the page under Method & sources.", sheets: "Sheets", rows: "rows", built: "File built", sheetName: "README" },
  es: { button: "Datos en Excel", title: "Descargar los datos", lead: "Todas las tablas detrás de este estudio en un libro de Excel, armado con los datos que usa esta página ahora mismo: columnas con tipo, filtros, encabezados fijos y una primera hoja con las fuentes.",
    get: "Descargar Excel (.xlsx)", busy: "Generando…", about: "Acerca de", study: "Estudio", summary: "Resumen", date: "Publicado", page: "Página interactiva", article: "Artículo de investigación",
    source: "Fuente", license: "Uso", licenseText: "Cita las fuentes originales de arriba. Cada fuente conserva su propia licencia, indicada en la página en Método y fuentes.", sheets: "Hojas", rows: "filas", built: "Archivo generado", sheetName: "LÉAME" },
  pt: { button: "Dados em Excel", title: "Baixar os dados", lead: "Todas as tabelas por trás deste estudo numa pasta de trabalho do Excel, montada com os dados que esta página usa agora: colunas tipadas, filtros, cabeçalhos fixos e uma primeira planilha com as fontes.",
    get: "Baixar Excel (.xlsx)", busy: "Gerando…", about: "Sobre", study: "Estudo", summary: "Resumo", date: "Publicado", page: "Página interativa", article: "Artigo de pesquisa",
    source: "Fonte", license: "Uso", licenseText: "Cite as fontes originais acima. Cada fonte mantém sua própria licença, indicada na página em Método e fontes.", sheets: "Planilhas", rows: "linhas", built: "Arquivo gerado", sheetName: "LEIA-ME" },
  fr: { button: "Données Excel", title: "Télécharger les données", lead: "Toutes les tables de cette étude dans un classeur Excel, construit avec les données qu’utilise cette page en ce moment : colonnes typées, filtres, en-têtes figés et une première feuille avec les sources.",
    get: "Télécharger Excel (.xlsx)", busy: "Création…", about: "À propos", study: "Étude", summary: "Résumé", date: "Publiée le", page: "Page interactive", article: "Article de recherche",
    source: "Source", license: "Utilisation", licenseText: "Citez les sources originales ci-dessus. Chaque source garde sa propre licence, indiquée sur la page dans Méthode et sources.", sheets: "Feuilles", rows: "lignes", built: "Fichier créé le", sheetName: "LISEZ-MOI" },
  it: { button: "Dati in Excel", title: "Scarica i dati", lead: "Tutte le tabelle di questo studio in una cartella Excel, creata con i dati che questa pagina usa ora: colonne tipizzate, filtri, intestazioni bloccate e un primo foglio con le fonti.",
    get: "Scarica Excel (.xlsx)", busy: "Creazione…", about: "Informazioni", study: "Studio", summary: "Sintesi", date: "Pubblicato", page: "Pagina interattiva", article: "Articolo di ricerca",
    source: "Fonte", license: "Uso", licenseText: "Cita le fonti originali qui sopra. Ogni fonte mantiene la propria licenza, indicata nella pagina in Metodo e fonti.", sheets: "Fogli", rows: "righe", built: "File creato il", sheetName: "LEGGIMI" },
  ja: { button: "Excelデータ", title: "データをダウンロード", lead: "この研究の背後にあるすべての表を、このページがいま使っているデータからExcelブックとして作成します。型付きの列、フィルター、固定見出し、出典を記した最初のシート付き。",
    get: "Excelをダウンロード（.xlsx）", busy: "作成中…", about: "概要", study: "研究", summary: "要約", date: "公開", page: "インタラクティブページ", article: "研究論文",
    source: "出典", license: "利用", licenseText: "上記の出典を引用してください。各出典のライセンスはページの「方法と出典」に記載しています。", sheets: "シート", rows: "行", built: "作成日", sheetName: "はじめに" },
  zh: { button: "Excel 数据", title: "下载数据", lead: "用本页当前使用的数据生成 Excel 工作簿，包含本研究背后的所有表：带类型的列、筛选、冻结的表头，以及列出来源的第一张工作表。",
    get: "下载 Excel（.xlsx）", busy: "生成中…", about: "说明", study: "研究", summary: "摘要", date: "发布", page: "交互页面", article: "研究文章",
    source: "来源", license: "使用", licenseText: "请引用上面的原始来源。每个来源保留其自己的许可，见页面的“方法与来源”。", sheets: "工作表", rows: "行", built: "生成日期", sheetName: "说明" },
};
const copyFor = (language) => messages[language] ?? messages.en;

function Icon() {
  return (
    <svg className="study-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 4v11m-4-4 4 4 4-4 M5 19h14" />
    </svg>
  );
}

export const hasDownloads = (slug) => Boolean(EXPORTS[slug]);

/** Builds and saves the day's workbook. */
export function downloadDay(day, language) {
  const copy = copyFor(language);
  const data = EXPORTS[day.slug]();
  const pad = String(day.day).padStart(3, "0");
  const today = new Date().toISOString().slice(0, 10);
  const about = infoSheet(copy.sheetName, [
    ["Daily Data Lab", `${copy.study} ${pad}`],
    [copy.study, dayText(language, day.slug, "title", day.title)],
    [copy.summary, dayText(language, day.slug, "summary", day.summary)],
    [copy.date, new Intl.DateTimeFormat(localeFor(language), { dateStyle: "long", timeZone: "UTC" }).format(new Date(day.date))],
    [copy.page, `${SITE}${language === "en" ? "" : `?lang=${language}`}#/day/${day.day}`],
    [copy.article, `${SITE}${language === "en" ? "" : `?lang=${language}`}#/day/${day.day}/article`],
    [copy.source, day.source ?? ""],
    [copy.license, copy.licenseText],
    [copy.built, today],
    ["", ""],
    [copy.sheets, ""],
    ...data.map((s) => [s.name, `${s.rows.length.toLocaleString(localeFor(language))} ${copy.rows}`]),
  ]);
  const blob = workbook([about, ...data], `Daily Data Lab · ${pad} · ${day.title}`);
  saveBlob(blob, `daily-data-lab-${pad}-${day.slug}-data${language === "en" ? "" : `-${language}`}.xlsx`);
}

function useDownload(day, language) {
  const [busy, setBusy] = useState(false);
  const run = () => {
    setBusy(true);
    // Let the label repaint before the work starts.
    setTimeout(() => { try { downloadDay(day, language); } finally { setBusy(false); } }, 30);
  };
  return [busy, run];
}

/** Header button and article button: download straight away. */
export function DownloadButton({ day, language, label }) {
  const [busy, run] = useDownload(day, language);
  if (!EXPORTS[day.slug]) return null;
  const copy = copyFor(language);
  return <button className="study-button" type="button" onClick={run} disabled={busy} aria-busy={busy}><Icon />{busy ? copy.busy : label ?? copy.button}</button>;
}

export function StudyDownloads({ day, language }) {
  const [busy, run] = useDownload(day, language);
  if (!EXPORTS[day.slug]) return null;
  const copy = copyFor(language);
  return (
    <section className="study-downloads" id="study-downloads" aria-labelledby="study-downloads-title">
      <h2 id="study-downloads-title">{copy.title}</h2>
      <p className="study-downloads__lead">{copy.lead}</p>
      <button className="study-button study-downloads__get" type="button" onClick={run} disabled={busy} aria-busy={busy}><Icon />{busy ? copy.busy : copy.get}</button>
    </section>
  );
}
