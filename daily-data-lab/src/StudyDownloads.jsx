// "Data analysis in Excel": the downloadable workbooks built by scripts/excel/ (listed in downloads.json).
import DOWNLOADS from "./downloads.json";
import { localeFor } from "../../assets/i18n.js";

const messages = {
  en: {
    button: "Excel analysis", title: "Data analysis in Excel",
    lead: "Every row behind this study, with live formulas, native charts, the data pipeline, quality checks and a data dictionary.",
    xlsx: "Excel workbook", xlsm: "Excel with VBA macros", xlsxNote: "Opens anywhere, no macros.",
    xlsmNote: "Adds macros: refresh and check, PivotTable, column profile, CSV export. Excel may ask you to enable them.",
    inside: "Inside", sheets: ["README and sources", "Analysis with drop-downs", "Charts", "Data tables", "Pipeline and checks", "Data dictionary"],
  },
  es: {
    button: "Análisis en Excel", title: "Análisis de datos en Excel",
    lead: "Todas las filas detrás de este estudio, con fórmulas vivas, gráficas nativas, el pipeline de datos, verificaciones de calidad y un diccionario de datos.",
    xlsx: "Libro de Excel", xlsm: "Excel con macros VBA", xlsxNote: "Abre en cualquier lugar, sin macros.",
    xlsmNote: "Agrega macros: recalcular y verificar, tabla dinámica, perfil de columnas, exportar a CSV. Excel puede pedirte habilitarlas.",
    inside: "Contiene", sheets: ["README y fuentes", "Análisis con listas desplegables", "Gráficas", "Tablas de datos", "Pipeline y verificaciones", "Diccionario de datos"],
  },
  pt: {
    button: "Análise em Excel", title: "Análise de dados em Excel",
    lead: "Todas as linhas por trás deste estudo, com fórmulas vivas, gráficos nativos, o pipeline de dados, verificações de qualidade e um dicionário de dados.",
    xlsx: "Pasta de trabalho do Excel", xlsm: "Excel com macros VBA", xlsxNote: "Abre em qualquer lugar, sem macros.",
    xlsmNote: "Adiciona macros: recalcular e verificar, tabela dinâmica, perfil de colunas, exportar para CSV. O Excel pode pedir para habilitá-las.",
    inside: "Contém", sheets: ["README e fontes", "Análise com listas suspensas", "Gráficos", "Tabelas de dados", "Pipeline e verificações", "Dicionário de dados"],
  },
  fr: {
    button: "Analyse Excel", title: "Analyse des données dans Excel",
    lead: "Toutes les lignes derrière cette étude, avec des formules dynamiques, des graphiques natifs, le pipeline de données, des contrôles qualité et un dictionnaire des données.",
    xlsx: "Classeur Excel", xlsm: "Excel avec macros VBA", xlsxNote: "S’ouvre partout, sans macros.",
    xlsmNote: "Ajoute des macros : recalcul et contrôles, tableau croisé dynamique, profil des colonnes, export CSV. Excel peut vous demander de les activer.",
    inside: "Contenu", sheets: ["README et sources", "Analyse avec listes déroulantes", "Graphiques", "Tables de données", "Pipeline et contrôles", "Dictionnaire des données"],
  },
  it: {
    button: "Analisi in Excel", title: "Analisi dei dati in Excel",
    lead: "Tutte le righe dietro questo studio, con formule dinamiche, grafici nativi, la pipeline dei dati, controlli di qualità e un dizionario dei dati.",
    xlsx: "Cartella di lavoro Excel", xlsm: "Excel con macro VBA", xlsxNote: "Si apre ovunque, senza macro.",
    xlsmNote: "Aggiunge macro: ricalcolo e controlli, tabella pivot, profilo delle colonne, esportazione CSV. Excel potrebbe chiederti di abilitarle.",
    inside: "Contiene", sheets: ["README e fonti", "Analisi con menu a discesa", "Grafici", "Tabelle di dati", "Pipeline e controlli", "Dizionario dei dati"],
  },
  ja: {
    button: "Excel分析", title: "Excelでのデータ分析",
    lead: "この研究のすべての行を、動く数式、ネイティブのグラフ、データパイプライン、品質チェック、データ辞書とともに収録しています。",
    xlsx: "Excelブック", xlsm: "VBAマクロ付きExcel", xlsxNote: "どこでも開けます（マクロなし）。",
    xlsmNote: "マクロを追加：再計算とチェック、ピボットテーブル、列のプロファイル、CSV書き出し。Excelで有効化を求められる場合があります。",
    inside: "内容", sheets: ["README と出典", "ドロップダウン付きの分析", "グラフ", "データ表", "パイプラインとチェック", "データ辞書"],
  },
  zh: {
    button: "Excel 分析", title: "Excel 数据分析",
    lead: "本研究背后的全部数据行，附带实时公式、原生图表、数据管道、质量检查和数据字典。",
    xlsx: "Excel 工作簿", xlsm: "带 VBA 宏的 Excel", xlsxNote: "随处可打开，不含宏。",
    xlsmNote: "附加宏：重新计算并检查、数据透视表、列概况、导出 CSV。Excel 可能会要求你启用宏。",
    inside: "包含", sheets: ["README 与来源", "带下拉列表的分析", "图表", "数据表", "管道与检查", "数据字典"],
  },
};

const copyFor = (language) => messages[language] ?? messages.en;
const size = (bytes, language) => `${(bytes / 1024 / 1024).toLocaleString(localeFor(language), { maximumFractionDigits: bytes < 1024 * 1024 ? 2 : 1, minimumFractionDigits: 1 })} MB`;

function Icon() {
  return (
    <svg className="study-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 4v11m-4-4 4 4 4-4 M5 19h14" />
    </svg>
  );
}

export const hasDownloads = (slug) => Boolean(DOWNLOADS[slug]);

/** Header button: jumps to the download card (hash routes rule out #anchors). */
export function DownloadButton({ slug, language }) {
  if (!DOWNLOADS[slug]) return null;
  const copy = copyFor(language);
  const go = () => {
    const el = document.getElementById("study-downloads");
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
  };
  return <button className="study-button" type="button" onClick={go}><Icon />{copy.button}</button>;
}

export function StudyDownloads({ slug, language }) {
  const files = DOWNLOADS[slug];
  if (!files) return null;
  const copy = copyFor(language);
  return (
    <section className="study-downloads" id="study-downloads" tabIndex={-1} aria-labelledby="study-downloads-title">
      <h2 id="study-downloads-title">{copy.title}</h2>
      <p className="study-downloads__lead">{copy.lead}</p>
      <div className="study-downloads__files">
        {["xlsx", "xlsm"].filter((ext) => files[ext]).map((ext) => (
          <a key={ext} className="study-downloads__file" href={files[ext].file} download type={ext === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/vnd.ms-excel.sheet.macroEnabled.12"}>
            <span className="study-downloads__ext">.{ext}</span>
            <span className="study-downloads__name"><Icon />{copy[ext]}</span>
            <span className="study-downloads__note">{copy[`${ext}Note`]} · {size(files[ext].bytes, language)}</span>
          </a>
        ))}
      </div>
      <p className="study-downloads__inside"><strong>{copy.inside}:</strong> {copy.sheets.join(" · ")}</p>
    </section>
  );
}
