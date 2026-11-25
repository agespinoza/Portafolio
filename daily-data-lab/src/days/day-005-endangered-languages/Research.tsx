// Day 005 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";

export const REFS: Reference[] = [
  { text: "Krauss, M. (1992). The world's languages in crisis. Language, 68(1), 4–10.", doi: "10.1353/lan.1992.0075" },
  { text: "Moseley, C. (Ed.). (2010). Atlas of the World's Languages in Danger (3rd ed.). Paris: UNESCO Publishing.", url: "https://webarchive.unesco.org/web/20151214150659/http://unesdoc.unesco.org/images/0018/001870/187026e.pdf" },
  { text: "Hammarström, H., Castermans, T., Forkel, R., Verbeek, K., Westenberg, M. A., & Speckmann, B. (2018). Simultaneous visualization of language endangerment and language description. Language Documentation & Conservation, 12, 359–392.", url: "https://hdl.handle.net/10125/24792" },
  { text: "Bromham, L., Dinnage, R., Skirgård, H., Ritchie, A., Cardillo, M., Meakins, F., Greenhill, S., & Hua, X. (2022). Global predictors of language endangerment and the future of linguistic diversity. Nature Ecology & Evolution, 6(2), 163–173.", doi: "10.1038/s41559-021-01604-y" },
  { text: "Skirgård, H., Haynie, H. J., Blasi, D. E., Hammarström, H., et al. (2023). Grambank reveals the importance of genealogical constraints on linguistic diversity and highlights the impact of language loss. Science Advances, 9(16), eadg6175.", doi: "10.1126/sciadv.adg6175" },
  { text: "Ranacher, P., Forkel, R., Efrat-Kowalsky, N., Urban, M., Hehli, N., Franz, T., et al. (2025). A global and interoperable dataset of linguistic distributions derived from the Atlas of the World's Languages. Scientific Data, 12, 1466.", doi: "10.1038/s41597-025-05828-6" },
  { text: "Hammarström, H., Forkel, R., Haspelmath, M., & Bank, S. (2026). Glottolog 5.4 (CLDF dataset). Zenodo.", doi: "10.5281/zenodo.24101243" },
  { text: "Skirgård, H., Haynie, H. J., Hammarström, H., et al. (2023). Grambank v1.0.3 (CLDF dataset). Zenodo.", doi: "10.5281/zenodo.7844558" },
  { text: "Raasveldt, M., & Mühleisen, H. (2019). DuckDB: an embeddable analytical database. Proceedings of the 2019 International Conference on Management of Data (SIGMOD), 1981–1984.", doi: "10.1145/3299869.3320212" },
];


type V = Record<string, string | number>;
const EN: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. Patterns in these data are never read as causes.",
  q1: "How many of the world's languages are endangered?",
  a1: "Glottolog rates {endangered} of {living} living spoken first languages as endangered ({share}): threatened, shifting, moribund, or nearly extinct.",
  q2: "Which languages are both endangered and poorly documented?",
  a2: "{priority} languages are shifting or worse and have no grammar sketch. {topMacro} holds {topMacroN} of them ({topMacroShare}); click the heatmap's dashed box to list them.",
  q3: "Do typology databases leave endangered languages out?",
  a3: "Not in these data: Grambank codes {gbMin}–{gbMax} of languages at every living status. The gap is for extinct languages, at {gbExtinct}, which are often known only from short wordlists.",
  q4: "Would losing endangered languages erase grammatical diversity?",
  a4: "In {gbMajority} of {gbValues} Grambank feature values, most of the languages that have the value are endangered or extinct, but {gbBase} of all Grambank languages are, so most of this is the base rate. Skirgård et al. (2023) found that the loss of diversity would be strikingly uneven across regions.",
  q5: "How fast are languages being lost?",
  a5: "Krauss (1992) warned that most of the world's languages could be gone or moribund within a century. Bromham et al. (2022) modeled 6,511 languages and project that, without intervention, language loss could triple within 40 years, at least one language a month; they associate endangerment with road density and years of schooling, not with contact between languages as such.",
  q6: "Why is the documentation gap largest in Papunesia?",
  a6: "Possible reasons: thousands of small languages in rugged terrain, few trained linguists per language, and a shorter history of grammatical description than in Eurasia or the Americas. This page does not test them.",
  p1: "{languages} spoken first languages in Glottolog 5.4; {unassessed} have no endangerment status.",
  p2: "AES counts match GlottoScope exactly ({scopeAes} languages with sign languages added). MED counts differ from that page: {medWeb} vs {medCldf} \"wordlist or less\".",
  p3: "Each language is one Glottolog point, not the area where it is spoken; dense regions overlap on the map.",
  p4: "Grambank 1.0.3 covers {gbLangs} of these languages; {fams} genealogical families plus isolates.",
  d1: "DuckDB pipeline from the CLDF tables to dim_language, fact_status, fact_features, and fact_coverage parquet files and summary.json.",
  d2: "Build check that stops when AES counts disagree with GlottoScope.",
  d3: "Cross-filtering by macroarea, family, country, and AES × MED cell; KPIs and lists recompute.",
  d4: "Wilson 95% intervals for country shares and Grambank feature values.",
  n1: "Speaker-area polygons (Ranacher et al., 2025) to map areas instead of points.",
  n2: "Year each language first reached a grammar, from Glottolog's MED history, to show the documentation race over time.",
  n3: "Sign languages (228 in Glottolog) are left out because MED is defined for spoken languages here.",
  n4: "Speaker numbers: not in Glottolog, and the main source (Ethnologue) is paywalled.",
  srcGlottolog: "7,685 spoken L1 languages", srcScope: "GlottoScope summary", srcGrambank: "2,467 languages, 195 features",
  srcWals: "2,660 languages", srcUnesco: "about 2,500 endangered languages",
  limGlottolog: "one point per language; status merged from several sources", limScope: "web page, not versioned",
  limGrambank: "sample, not all languages", limWals: "feature coverage uneven", limUnesco: "2010; not used as data here",
  limNe: "generalised coastlines", useLangs: "used: languages, AES, MED", useCheck: "used: count check",
  useGb: "used: coverage and features", useWals: "used: coverage", useCited: "cited only", useMap: "used: world map", useSql: "used: data pipeline",
  publicDomain: "public domain", allRights: "© UNESCO",
};
const ES: Record<string, string> = {
  title: "Seis preguntas de investigación",
  lead: "Cada respuesta indica de dónde sale. Los patrones de estos datos nunca se interpretan como causas.",
  q1: "¿Cuántas lenguas del mundo están en peligro?",
  a1: "Glottolog clasifica {endangered} de {living} lenguas maternas habladas vivas como en peligro ({share}): amenazadas, en desplazamiento, moribundas o casi extintas.",
  q2: "¿Qué lenguas están en peligro y además mal documentadas?",
  a2: "{priority} lenguas están en desplazamiento o peor y no tienen ni un esbozo gramatical. {topMacro} concentra {topMacroN} ({topMacroShare}); haz clic en el recuadro punteado del mapa de calor para verlas.",
  q3: "¿Las bases de datos tipológicas dejan fuera a las lenguas en peligro?",
  a3: "En estos datos, no: Grambank codifica entre {gbMin} y {gbMax} de las lenguas en cada nivel de riesgo. El hueco está en las lenguas extintas, con {gbExtinct}, que muchas veces solo se conocen por listas cortas de palabras.",
  q4: "¿Perder las lenguas en peligro borraría diversidad gramatical?",
  a4: "En {gbMajority} de {gbValues} valores de rasgos de Grambank, la mayoría de las lenguas que los tienen están en peligro o extintas, pero lo mismo pasa con el {gbBase} de todas las lenguas de Grambank, así que casi todo se explica por la proporción base. Skirgård et al. (2023) encontraron que la pérdida de diversidad sería muy desigual entre regiones.",
  q5: "¿Qué tan rápido se pierden las lenguas?",
  a5: "Krauss (1992) advirtió que la mayoría de las lenguas del mundo podrían desaparecer o quedar moribundas en un siglo. Bromham et al. (2022) modelaron 6,511 lenguas y proyectan que, sin intervención, la pérdida podría triplicarse en 40 años, al menos una lengua al mes; asocian el peligro con la densidad de caminos y los años de escolaridad, no con el contacto entre lenguas en sí.",
  q6: "¿Por qué el hueco de documentación es mayor en Papunesia?",
  a6: "Algunas razones posibles: miles de lenguas pequeñas en terreno accidentado, pocos lingüistas por lengua y una historia más corta de descripción gramatical que en Eurasia o América. Esta página no las comprueba.",
  p1: "{languages} lenguas maternas habladas en Glottolog 5.4; {unassessed} no tienen nivel de peligro.",
  p2: "Los conteos AES coinciden exactamente con GlottoScope ({scopeAes} lenguas al sumar las lenguas de señas). Los conteos MED difieren de esa página: {medWeb} contra {medCldf} en \"lista de palabras o menos\".",
  p3: "Cada lengua es un punto de Glottolog, no el área donde se habla; en regiones densas los puntos se enciman.",
  p4: "Grambank 1.0.3 cubre {gbLangs} de estas lenguas; {fams} familias genealógicas más las lenguas aisladas.",
  d1: "Pipeline en DuckDB de las tablas CLDF a los parquet dim_language, fact_status, fact_features y fact_coverage, y summary.json.",
  d2: "Verificación en la compilación que se detiene si los conteos AES no coinciden con GlottoScope.",
  d3: "Filtros cruzados por macroárea, familia, país y celda AES × MED; los indicadores y las listas se recalculan.",
  d4: "Intervalos de Wilson de 95% para los porcentajes por país y los valores de rasgos de Grambank.",
  n1: "Polígonos de áreas de hablantes (Ranacher et al., 2025) para mapear áreas en vez de puntos.",
  n2: "Año en que cada lengua tuvo su primera gramática, a partir del historial MED de Glottolog, para mostrar la carrera de la documentación.",
  n3: "Las lenguas de señas (228 en Glottolog) quedan fuera porque aquí MED se define para lenguas habladas.",
  n4: "Número de hablantes: no está en Glottolog y la fuente principal (Ethnologue) es de pago.",
  srcGlottolog: "7,685 lenguas maternas habladas", srcScope: "resumen de GlottoScope", srcGrambank: "2,467 lenguas, 195 rasgos",
  srcWals: "2,660 lenguas", srcUnesco: "unas 2,500 lenguas en peligro",
  limGlottolog: "un punto por lengua; nivel combinado de varias fuentes", limScope: "página web sin versiones",
  limGrambank: "muestra, no todas las lenguas", limWals: "cobertura de rasgos desigual", limUnesco: "2010; aquí no se usa como datos",
  limNe: "costas simplificadas", useLangs: "uso: lenguas, AES, MED", useCheck: "uso: verificación de conteos",
  useGb: "uso: cobertura y rasgos", useWals: "uso: cobertura", useCited: "solo citado", useMap: "uso: mapa mundial", useSql: "uso: pipeline de datos",
  publicDomain: "dominio público", allRights: "© UNESCO",
};
const FR: Record<string, string> = {
  title: "Six questions de recherche",
  lead: "Chaque réponse indique sa provenance. Les tendances de ces données ne sont jamais lues comme des causes.",
  q1: "Combien de langues du monde sont en danger ?",
  a1: "Glottolog classe {endangered} des {living} langues maternelles parlées encore vivantes comme en danger ({share}) : menacées, en recul, moribondes ou presque éteintes.",
  q2: "Quelles langues sont à la fois en danger et peu documentées ?",
  a2: "{priority} langues sont en recul ou pire et n'ont même pas d'esquisse grammaticale. {topMacro} en compte {topMacroN} ({topMacroShare}) ; cliquez sur le cadre pointillé de la carte de chaleur pour les lister.",
  q3: "Les bases typologiques laissent-elles de côté les langues en danger ?",
  a3: "Pas dans ces données : Grambank code de {gbMin} à {gbMax} des langues à chaque niveau de vitalité. Le manque concerne les langues éteintes, à {gbExtinct}, souvent connues seulement par de courtes listes de mots.",
  q4: "Perdre les langues en danger effacerait-il de la diversité grammaticale ?",
  a4: "Pour {gbMajority} des {gbValues} valeurs de traits de Grambank, la plupart des langues qui les portent sont en danger ou éteintes, mais c'est le cas de {gbBase} de toutes les langues de Grambank : l'essentiel tient au taux de base. Skirgård et al. (2023) montrent que la perte de diversité serait très inégale selon les régions.",
  q5: "À quelle vitesse les langues disparaissent-elles ?",
  a5: "Krauss (1992) avertissait que la plupart des langues du monde pourraient disparaître ou devenir moribondes en un siècle. Bromham et al. (2022) ont modélisé 6 511 langues et projettent que, sans intervention, les pertes pourraient tripler en 40 ans, au moins une langue par mois ; ils associent la menace à la densité routière et aux années de scolarité, pas au contact entre langues en soi.",
  q6: "Pourquoi le manque de documentation est-il le plus fort en Papunésie ?",
  a6: "Raisons possibles : des milliers de petites langues sur un relief difficile, peu de linguistes par langue et une tradition de description grammaticale plus courte qu'en Eurasie ou dans les Amériques. Cette page ne les teste pas.",
  p1: "{languages} langues maternelles parlées dans Glottolog 5.4 ; {unassessed} n'ont pas de statut de vitalité.",
  p2: "Les effectifs AES correspondent exactement à GlottoScope ({scopeAes} langues en ajoutant les langues des signes). Les effectifs MED diffèrent de cette page : {medWeb} contre {medCldf} « liste de mots ou moins ».",
  p3: "Chaque langue est un point Glottolog, pas l'aire où elle est parlée ; dans les régions denses, les points se chevauchent.",
  p4: "Grambank 1.0.3 couvre {gbLangs} de ces langues ; {fams} familles généalogiques plus les isolats.",
  d1: "Pipeline DuckDB des tables CLDF vers les parquet dim_language, fact_status, fact_features et fact_coverage, et summary.json.",
  d2: "Contrôle au build qui s'arrête si les effectifs AES ne correspondent pas à GlottoScope.",
  d3: "Filtres croisés par macro-aire, famille, pays et cellule AES × MED ; indicateurs et listes recalculés.",
  d4: "Intervalles de Wilson à 95 % pour les parts par pays et les valeurs de traits de Grambank.",
  n1: "Polygones d'aires de locuteurs (Ranacher et al., 2025) pour cartographier des aires plutôt que des points.",
  n2: "Année de la première grammaire de chaque langue, à partir de l'historique MED de Glottolog, pour montrer la course à la documentation.",
  n3: "Les langues des signes (228 dans Glottolog) sont exclues car MED est défini ici pour les langues parlées.",
  n4: "Nombre de locuteurs : absent de Glottolog, et la source principale (Ethnologue) est payante.",
  srcGlottolog: "7 685 langues maternelles parlées", srcScope: "résumé GlottoScope", srcGrambank: "2 467 langues, 195 traits",
  srcWals: "2 660 langues", srcUnesco: "environ 2 500 langues en danger",
  limGlottolog: "un point par langue ; statut fusionné de plusieurs sources", limScope: "page web non versionnée",
  limGrambank: "échantillon, pas toutes les langues", limWals: "couverture des traits inégale", limUnesco: "2010 ; non utilisé comme donnée ici",
  limNe: "côtes généralisées", useLangs: "usage : langues, AES, MED", useCheck: "usage : contrôle des effectifs",
  useGb: "usage : couverture et traits", useWals: "usage : couverture", useCited: "cité seulement", useMap: "usage : carte du monde", useSql: "usage : pipeline de données",
  publicDomain: "domaine public", allRights: "© UNESCO",
};
const IT: Record<string, string> = {
  title: "Sei domande di ricerca",
  lead: "Ogni risposta indica da dove proviene. Le tendenze di questi dati non vengono mai lette come cause.",
  q1: "Quante lingue del mondo sono in pericolo?",
  a1: "Glottolog classifica {endangered} delle {living} lingue materne parlate ancora vive come in pericolo ({share}): minacciate, in regressione, moribonde o quasi estinte.",
  q2: "Quali lingue sono in pericolo e anche poco documentate?",
  a2: "{priority} lingue sono in regressione o peggio e non hanno nemmeno un abbozzo grammaticale. {topMacro} ne conta {topMacroN} ({topMacroShare}); fai clic sul riquadro tratteggiato della mappa di calore per elencarle.",
  q3: "Le banche dati tipologiche escludono le lingue in pericolo?",
  a3: "Non in questi dati: Grambank codifica dal {gbMin} al {gbMax} delle lingue a ogni livello di vitalità. Il vuoto riguarda le lingue estinte, al {gbExtinct}, spesso note solo da brevi liste di parole.",
  q4: "Perdere le lingue in pericolo cancellerebbe diversità grammaticale?",
  a4: "In {gbMajority} dei {gbValues} valori di tratti di Grambank, la maggior parte delle lingue che li hanno è in pericolo o estinta, ma lo è anche il {gbBase} di tutte le lingue di Grambank: quasi tutto dipende dal tasso di base. Skirgård et al. (2023) hanno trovato che la perdita di diversità sarebbe molto diseguale tra le regioni.",
  q5: "Quanto velocemente si perdono le lingue?",
  a5: "Krauss (1992) avvertiva che la maggior parte delle lingue del mondo poteva scomparire o diventare moribonda entro un secolo. Bromham et al. (2022) hanno modellato 6.511 lingue e prevedono che, senza interventi, le perdite potrebbero triplicare in 40 anni, almeno una lingua al mese; associano il pericolo alla densità stradale e agli anni di scolarizzazione, non al contatto tra lingue in sé.",
  q6: "Perché il vuoto di documentazione è più grande in Papunesia?",
  a6: "Possibili ragioni: migliaia di piccole lingue su un territorio impervio, pochi linguisti per lingua e una storia di descrizione grammaticale più breve che in Eurasia o nelle Americhe. Questa pagina non le verifica.",
  p1: "{languages} lingue materne parlate in Glottolog 5.4; {unassessed} non hanno uno stato di vitalità.",
  p2: "I conteggi AES coincidono esattamente con GlottoScope ({scopeAes} lingue aggiungendo le lingue dei segni). I conteggi MED differiscono da quella pagina: {medWeb} contro {medCldf} \"lista di parole o meno\".",
  p3: "Ogni lingua è un punto di Glottolog, non l'area in cui è parlata; nelle regioni dense i punti si sovrappongono.",
  p4: "Grambank 1.0.3 copre {gbLangs} di queste lingue; {fams} famiglie genealogiche più gli isolati.",
  d1: "Pipeline DuckDB dalle tabelle CLDF ai parquet dim_language, fact_status, fact_features e fact_coverage, e summary.json.",
  d2: "Controllo in fase di build che si ferma se i conteggi AES non coincidono con GlottoScope.",
  d3: "Filtri incrociati per macroarea, famiglia, paese e cella AES × MED; indicatori ed elenchi si ricalcolano.",
  d4: "Intervalli di Wilson al 95% per le quote per paese e i valori dei tratti di Grambank.",
  n1: "Poligoni delle aree dei parlanti (Ranacher et al., 2025) per mappare aree invece di punti.",
  n2: "Anno in cui ogni lingua ha avuto la prima grammatica, dalla cronologia MED di Glottolog, per mostrare la corsa alla documentazione.",
  n3: "Le lingue dei segni (228 in Glottolog) sono escluse perché qui MED è definito per le lingue parlate.",
  n4: "Numero di parlanti: assente in Glottolog, e la fonte principale (Ethnologue) è a pagamento.",
  srcGlottolog: "7.685 lingue materne parlate", srcScope: "riepilogo GlottoScope", srcGrambank: "2.467 lingue, 195 tratti",
  srcWals: "2.660 lingue", srcUnesco: "circa 2.500 lingue in pericolo",
  limGlottolog: "un punto per lingua; stato unito da più fonti", limScope: "pagina web senza versioni",
  limGrambank: "campione, non tutte le lingue", limWals: "copertura dei tratti diseguale", limUnesco: "2010; qui non usato come dato",
  limNe: "coste generalizzate", useLangs: "uso: lingue, AES, MED", useCheck: "uso: controllo dei conteggi",
  useGb: "uso: copertura e tratti", useWals: "uso: copertura", useCited: "solo citato", useMap: "uso: mappa del mondo", useSql: "uso: pipeline dei dati",
  publicDomain: "pubblico dominio", allRights: "© UNESCO",
};
const JA: Record<string, string> = {
  title: "6つの研究課題",
  lead: "各回答には根拠の種類を示しています。データ上のパターンを原因とは解釈しません。",
  q1: "世界の言語のうち、どれだけが危機にあるのか？",
  a1: "Glottologは、現在も話されている第一言語{living}のうち{endangered}（{share}）を危機言語と評価しています（脅威・移行中・消滅寸前・ほぼ消滅）。",
  q2: "危機にあり、しかも記録が乏しい言語はどれか？",
  a2: "{priority}の言語が「移行中」以上の危機にあり、文法概説すらありません。そのうち{topMacroN}（{topMacroShare}）が{topMacro}にあります。ヒートマップの点線枠をクリックすると一覧が表示されます。",
  q3: "類型論データベースは危機言語を取りこぼしているか？",
  a3: "このデータではそうではありません。Grambankは、どの危機レベルでも話者のいる言語の{gbMin}〜{gbMax}をコード化しています。空白は消滅言語（{gbExtinct}）にあり、多くは短い単語リストでしか知られていません。",
  q4: "危機言語が失われると、文法の多様性も消えるのか？",
  a4: "Grambankの特徴値{gbValues}のうち{gbMajority}では、その値をもつ言語の大半が危機言語か消滅言語です。ただしGrambank全体でも{gbBase}がそうなので、大部分は基準率で説明できます。Skirgårdら（2023）は、多様性の喪失が地域間で著しく不均等になると示しました。",
  q5: "言語はどれくらいの速さで失われているのか？",
  a5: "Krauss（1992）は、世界の言語の大半が1世紀以内に消滅するか消滅寸前になりうると警告しました。Bromhamら（2022）は6,511言語をモデル化し、対策がなければ40年以内に言語の喪失が3倍になり、少なくとも月に1言語が失われると予測しています。危機と関連していたのは道路密度と就学年数で、言語接触そのものではありませんでした。",
  q6: "なぜパプネシアで記録の空白が最も大きいのか？",
  a6: "考えられる理由：険しい地形に何千もの小さな言語があること、言語あたりの言語学者が少ないこと、ユーラシアや南北アメリカより文法記述の歴史が短いこと。このページでは検証していません。",
  p1: "Glottolog 5.4の話し言葉の第一言語は{languages}、うち{unassessed}は危機度が未評価です。",
  p2: "AESの件数は手話を加えるとGlottoScopeと完全に一致します（{scopeAes}言語）。MEDの件数はそのページと異なります（「単語リスト以下」が{medWeb}対{medCldf}）。",
  p3: "各言語はGlottologの1地点で表され、話されている地域ではありません。密集地域では点が重なります。",
  p4: "Grambank 1.0.3はこのうち{gbLangs}言語をカバー。系統的な語族は{fams}、ほかに孤立言語があります。",
  d1: "CLDFテーブルからdim_language・fact_status・fact_features・fact_coverageのparquetとsummary.jsonを作るDuckDBパイプライン。",
  d2: "AES件数がGlottoScopeと一致しない場合に停止するビルド時チェック。",
  d3: "大地域・語族・国・AES×MEDセルによるクロスフィルタ。指標と一覧は再計算されます。",
  d4: "国別の割合とGrambankの特徴値にWilsonの95%区間。",
  n1: "点ではなく地域を描くための話者分布ポリゴン（Ranacherら, 2025）。",
  n2: "GlottologのMED履歴から各言語が初めて文法書を得た年を求め、記録の競争を時系列で示す。",
  n3: "手話（Glottologに228）は、ここではMEDを話し言葉に限っているため対象外。",
  n4: "話者数：Glottologにはなく、主な出典（Ethnologue）は有料。",
  srcGlottolog: "話し言葉の第一言語7,685", srcScope: "GlottoScopeの集計", srcGrambank: "2,467言語・195特徴",
  srcWals: "2,660言語", srcUnesco: "危機言語 約2,500",
  limGlottolog: "1言語1地点。危機度は複数の出典を統合", limScope: "バージョン管理のないWebページ",
  limGrambank: "標本であり全言語ではない", limWals: "特徴のカバー率に偏り", limUnesco: "2010年。ここではデータとして未使用",
  limNe: "海岸線は簡略化", useLangs: "用途：言語・AES・MED", useCheck: "用途：件数チェック",
  useGb: "用途：カバー率と特徴", useWals: "用途：カバー率", useCited: "引用のみ", useMap: "用途：世界地図", useSql: "用途：データパイプライン",
  publicDomain: "パブリックドメイン", allRights: "© UNESCO",
};
const tr = makeTr("languagesResearch", { es: ES, fr: FR, it: IT, ja: JA }) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN[key], values);

export interface QuestionValues {
  endangered: string; living: string; share: string; priority: string; topMacro: string; topMacroN: string; topMacroShare: string;
  gbExtinct: string; gbMin: string; gbMax: string; gbBase: string; gbMajority: string; gbValues: string;
}
export function LanguagesQuestions({ v, language }: { v: QuestionValues; language: string }) {
  const items: Question[] = [
    { q: T(language, "q1"), a: T(language, "a1", { endangered: v.endangered, living: v.living, share: v.share }), tag: "data" },
    { q: T(language, "q2"), a: T(language, "a2", { priority: v.priority, topMacro: v.topMacro, topMacroN: v.topMacroN, topMacroShare: v.topMacroShare }), tag: "data" },
    { q: T(language, "q3"), a: T(language, "a3", { gbMin: v.gbMin, gbMax: v.gbMax, gbExtinct: v.gbExtinct }), tag: "data" },
    { q: T(language, "q4"), a: T(language, "a4", { gbMajority: v.gbMajority, gbValues: v.gbValues, gbBase: v.gbBase }), tag: "data" },
    { q: T(language, "q5"), a: T(language, "a5"), tag: "lit" },
    { q: T(language, "q6"), a: T(language, "a6"), tag: "hyp" },
  ];
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export interface QualityValues { languages: string; unassessed: string; scopeAes: string; medWeb: string; medCldf: string; gbLangs: string; fams: string }
export function LanguagesQuality({ v, language }: { v: QualityValues; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={[T(language, "p1", { languages: v.languages, unassessed: v.unassessed }), T(language, "p2", { scopeAes: v.scopeAes, medWeb: v.medWeb, medCldf: v.medCldf }),
        T(language, "p3"), T(language, "p4", { gbLangs: v.gbLangs, fams: v.fams })]}
      done={["d1", "d2", "d3", "d4"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3", "n4"].map((k) => T(language, k))} />
  );
}

export function LanguagesSources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "Glottolog editors (MPI-EVA, Uppsala University)", title: "Glottolog 5.4 as CLDF", url: "https://doi.org/10.5281/zenodo.24101243", pub: "2026-11-10", cover: S("srcGlottolog"), license: "CC BY 4.0", limits: S("limGlottolog"), use: S("useLangs") },
    { inst: "Glottolog", title: "GlottoScope", url: "https://glottolog.org/langdoc/status", pub: "Glottolog 5.4", cover: S("srcScope"), license: "CC BY 4.0", limits: S("limScope"), use: S("useCheck") },
    { inst: "Grambank consortium", title: "Grambank v1.0.3", url: "https://doi.org/10.5281/zenodo.7844558", pub: "2023-04-19", cover: S("srcGrambank"), license: "CC BY 4.0", limits: S("limGrambank"), use: S("useGb") },
    { inst: "WALS editors · CLDF", title: "WALS Online v2020.6 (CLDF)", url: "https://github.com/cldf-datasets/wals/releases/tag/v2020.6", pub: "2026-09-28", cover: S("srcWals"), license: "CC BY 4.0", limits: S("limWals"), use: S("useWals") },
    { inst: "UNESCO", title: "Atlas of the World's Languages in Danger, 3rd ed.", url: "https://webarchive.unesco.org/web/20151214150659/http://unesdoc.unesco.org/images/0018/001870/187026e.pdf", pub: "2010", cover: S("srcUnesco"), license: S("allRights"), limits: S("limUnesco"), use: S("useCited") },
    { inst: "Natural Earth", title: "Land 1:110m", url: "https://www.naturalearthdata.com/", pub: "2022", cover: "global", license: S("publicDomain"), limits: S("limNe"), use: S("useMap") },
    { inst: "DuckDB Foundation", title: "DuckDB 1.4", url: "https://duckdb.org/", pub: "2025", cover: "—", license: "MIT", limits: "—", use: S("useSql") },
  ];
  const refs = REFS;
  return <SourcesAndReferences sources={sources} refs={refs} checkedOn={checkedOn} language={language} />;
}
