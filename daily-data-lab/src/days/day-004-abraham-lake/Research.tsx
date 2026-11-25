// Day 004 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";

export const REFS: Reference[] = [
  { text: "Messager, M. L., Lehner, B., Grill, G., Nedeva, I., & Schmitt, O. (2016). Estimating the volume and age of water stored in global lakes using a geo-statistical approach. Nature Communications, 7, 13603.", doi: "10.1038/ncomms13603" },
  { text: "Korver, M. C., Lehner, B., Cardille, J. A., & Carrea, L. (2024). Surface water temperature observations and ice phenology estimations for 1.4 million lakes globally. Remote Sensing of Environment, 308, 114164.", doi: "10.1016/j.rse.2024.114164" },
  { text: "Hersbach, H., et al. (2020). The ERA5 global reanalysis. Quarterly Journal of the Royal Meteorological Society, 146(730), 1999–2049.", doi: "10.1002/qj.3803" },
  { text: "Zippenfenig, P. Open-Meteo.com Weather API. Zenodo.", doi: "10.5281/zenodo.7970649" },
  { text: "Walter, K. M., Zimov, S. A., Chanton, J. P., Verbyla, D., & Chapin, F. S. (2006). Methane bubbling from Siberian thaw lakes as a positive feedback to climate warming. Nature, 443(7107), 71–75.", doi: "10.1038/nature05040" },
  { text: "Sharma, S., et al. (2019). Widespread loss of lake ice around the Northern Hemisphere in a warming world. Nature Climate Change, 9(3), 227–231.", doi: "10.1038/s41558-018-0393-5" },
  { text: "Raasveldt, M., & Mühleisen, H. (2019). DuckDB: an embeddable analytical database. Proceedings of the 2019 International Conference on Management of Data (SIGMOD), 1981–1984.", doi: "10.1145/3299869.3320212" },
];


type V = Record<string, string | number>;
const EN: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. Patterns in these data are never read as causes.",
  q1: "Are Abraham Lake's winters getting warmer?",
  a1: "Yes, slowly: +{slope} °C per decade since 1951 (95% interval {lo} to {hi}). The trend explains only {r2} of the year-to-year variation, so single winters say little about it.",
  q2: "Is it warming faster or slower than the world's big lakes?",
  a2: "On 1991–2025, Abraham's {abr} °C per decade is {position} the median of the large lakes downloaded so far ({median}). The comparison set grows each day as the backfill runs.",
  above: "above", below: "below",
  q3: "How long does Abraham stay frozen, and is that unusual?",
  a3: "LakeTEMP estimates {days} ice days a year. Lakes at the same latitude freeze for a median {p50} days, so Abraham has noticeably less ice than its neighbors.",
  q4: "Where do the white bubbles come from?",
  a4: "Organic matter decomposing in lake sediments releases methane, which rises as bubbles; in winter they freeze into the ice. Bubbling is a known pathway for lake methane to reach the atmosphere (Walter et al., 2006).",
  q5: "Is lake ice shrinking around the world?",
  a5: "Studies of long ice records find widespread loss of lake ice across the Northern Hemisphere as winters warm (Sharma et al., 2019). LakeTEMP is a 2013–2021 average, so this page can show where ice lasts longest but not how it has changed.",
  q6: "Why might Abraham freeze for less time than nearby lakes?",
  a6: "Possible reasons are that it is a deep, regulated reservoir that stores summer heat and has water drawn down in winter, and that warm Chinook winds blow along the Rocky Mountain foothills. Neither is tested here.",
  p1: "{lakes} lakes in HydroLAKES; one point per lake at its outlet (pour point), not at its center.",
  p2: "Winter trends: Abraham {abrN} winters since 1951; {ready} of 300 large lakes done so far (1991–2025), the rest download over the coming days.",
  p3: "LakeTEMP: {good} lakes with good statistics (trendline, not intermittent, ≥ 46 Landsat readings); Abraham has {obs} readings.",
  p4: "ERA5 is a reanalysis on a ~25 km grid: it describes the air over the area around the outlet, not the lake surface.",
  d1: "HydroLAKES table built with DuckDB spatial and joined to LakeTEMP by Hylak_id.",
  d2: "Winter trends with regr_slope and 95% intervals; any other lake fetched on demand and cached in the browser.",
  d3: "Daily GitHub Action that continues the Open-Meteo backfill within the free limit.",
  d4: "Ice days, ice season, and monthly water temperature with LakeTEMP's quality rules.",
  n1: "Lake polygons (820 MB) to place ERA5 at the lake's center instead of its outlet.",
  n2: "Year-by-year ice-on and ice-off dates to test whether Abraham's ice season is getting shorter.",
  n3: "In-situ ice observations to check LakeTEMP's estimates for Alberta lakes.",
  srcHydroLakes: "global, lakes ≥ 10 ha", srcLaketemp: "global, 2013–2021 average", srcEra5: "global, 1940–present",
  limHydroLakes: "pour point, not lake center; few names", limLaketemp: "ice estimated from a seasonal curve; no year-by-year values",
  limEra5: "~25 km grid; model estimate, not stations", limNe: "generalised coastlines",
  useLakes: "used: lake attributes", useTemp: "used: ice days, water temperature", useAir: "used: winter air temperature",
  useMap: "used: world map", useSql: "used: data pipeline", continuous: "continuously updated", publicDomain: "public domain",
};
const ES: Record<string, string> = {
  title: "Seis preguntas de investigación",
  lead: "Cada respuesta indica de dónde sale. Los patrones de estos datos nunca se interpretan como causas.",
  q1: "¿Se están calentando los inviernos del Lago Abraham?",
  a1: "Sí, despacio: +{slope} °C por década desde 1951 (intervalo de 95%: {lo} a {hi}). La tendencia explica solo el {r2} de la variación entre años, así que un solo invierno dice poco de ella.",
  q2: "¿Se calienta más rápido o más lento que los grandes lagos del mundo?",
  a2: "En 1991–2025, los {abr} °C por década de Abraham quedan {position} de la mediana de los lagos grandes descargados hasta ahora ({median}). El grupo de comparación crece cada día mientras avanza la descarga.",
  above: "por encima", below: "por debajo",
  q3: "¿Cuánto tiempo pasa congelado Abraham, y es eso raro?",
  a3: "LakeTEMP estima {days} días de hielo al año. Los lagos a la misma latitud se congelan una mediana de {p50} días, así que Abraham tiene bastante menos hielo que sus vecinos.",
  q4: "¿De dónde salen las burbujas blancas?",
  a4: "La materia orgánica que se descompone en los sedimentos del lago libera metano, que sube en burbujas; en invierno se congelan en el hielo. El burbujeo es una vía conocida por la que el metano de los lagos llega a la atmósfera (Walter et al., 2006).",
  q5: "¿Se está reduciendo el hielo de los lagos en el mundo?",
  a5: "Los estudios con registros largos de hielo encuentran una pérdida generalizada del hielo lacustre en el hemisferio norte conforme los inviernos se calientan (Sharma et al., 2019). LakeTEMP es un promedio de 2013–2021, así que esta página muestra dónde dura más el hielo, pero no cómo ha cambiado.",
  q6: "¿Por qué Abraham podría congelarse menos tiempo que los lagos cercanos?",
  a6: "Algunas razones posibles: es un embalse profundo y regulado que guarda el calor del verano y baja de nivel en invierno, y por las faldas de las Rocallosas soplan los vientos cálidos Chinook. Ninguna se comprueba aquí.",
  p1: "{lakes} lagos en HydroLAKES; un punto por lago en su salida (punto de desagüe), no en su centro.",
  p2: "Tendencias invernales: Abraham, {abrN} inviernos desde 1951; {ready} de 300 lagos grandes listos (1991–2025), el resto se descarga en los próximos días.",
  p3: "LakeTEMP: {good} lagos con buenas estadísticas (curva, no intermitentes, ≥ 46 lecturas de Landsat); Abraham tiene {obs} lecturas.",
  p4: "ERA5 es un reanálisis en una malla de ~25 km: describe el aire de la zona alrededor de la salida, no la superficie del lago.",
  d1: "Tabla de HydroLAKES construida con DuckDB spatial y unida a LakeTEMP por Hylak_id.",
  d2: "Tendencias invernales con regr_slope e intervalos de 95%; cualquier otro lago se pide bajo demanda y se guarda en el navegador.",
  d3: "GitHub Action diaria que continúa la descarga de Open-Meteo dentro del límite gratuito.",
  d4: "Días de hielo, temporada de hielo y temperatura mensual del agua con las reglas de calidad de LakeTEMP.",
  n1: "Polígonos de los lagos (820 MB) para ubicar ERA5 en el centro del lago y no en su salida.",
  n2: "Fechas de congelamiento y deshielo año por año para comprobar si la temporada de hielo de Abraham se acorta.",
  n3: "Observaciones de hielo en campo para validar las estimaciones de LakeTEMP en lagos de Alberta.",
  srcHydroLakes: "global, lagos ≥ 10 ha", srcLaketemp: "global, promedio 2013–2021", srcEra5: "global, 1940–hoy",
  limHydroLakes: "punto de desagüe, no centro; pocos nombres", limLaketemp: "hielo estimado con una curva estacional; sin valores por año",
  limEra5: "malla de ~25 km; estimación de modelo, no estaciones", limNe: "costas generalizadas",
  useLakes: "usado: atributos de lagos", useTemp: "usado: días de hielo, temperatura del agua", useAir: "usado: temperatura invernal del aire",
  useMap: "usado: mapa mundial", useSql: "usado: procesamiento de datos", continuous: "se actualiza continuamente", publicDomain: "dominio público",
};
const FR: Record<string, string> = {
  title: "Six questions de recherche",
  lead: "Chaque réponse indique sa provenance. Les tendances de ces données ne sont jamais lues comme des causes.",
  q1: "Les hivers du lac Abraham se réchauffent-ils ?",
  a1: "Oui, lentement : +{slope} °C par décennie depuis 1951 (intervalle à 95 % : {lo} à {hi}). La tendance n'explique que {r2} de la variation d'une année à l'autre ; un seul hiver en dit donc peu.",
  q2: "Se réchauffe-t-il plus vite ou plus lentement que les grands lacs du monde ?",
  a2: "Sur 1991–2025, les {abr} °C par décennie d'Abraham sont {position} de la médiane des grands lacs téléchargés à ce jour ({median}). L'ensemble de comparaison s'agrandit chaque jour.",
  above: "au-dessus", below: "en dessous",
  q3: "Combien de temps Abraham reste-t-il gelé, et est-ce inhabituel ?",
  a3: "LakeTEMP estime {days} jours de glace par an. Les lacs à la même latitude gèlent en médiane {p50} jours : Abraham a nettement moins de glace que ses voisins.",
  q4: "D'où viennent les bulles blanches ?",
  a4: "La matière organique qui se décompose dans les sédiments libère du méthane, qui remonte en bulles ; en hiver, elles gèlent dans la glace. Le bullage est une voie connue par laquelle le méthane des lacs atteint l'atmosphère (Walter et al., 2006).",
  q5: "La glace des lacs diminue-t-elle dans le monde ?",
  a5: "Les études fondées sur de longues séries de glace constatent une perte généralisée de la glace lacustre dans l'hémisphère Nord à mesure que les hivers se réchauffent (Sharma et al., 2019). LakeTEMP étant une moyenne 2013–2021, cette page montre où la glace dure le plus, pas son évolution.",
  q6: "Pourquoi Abraham gèlerait-il moins longtemps que les lacs voisins ?",
  a6: "Raisons possibles : c'est un réservoir profond et régulé qui stocke la chaleur de l'été et dont le niveau baisse en hiver, et les vents chauds du chinook soufflent au pied des Rocheuses. Aucune n'est testée ici.",
  p1: "{lakes} lacs dans HydroLAKES ; un point par lac à son exutoire, pas en son centre.",
  p2: "Tendances hivernales : Abraham, {abrN} hivers depuis 1951 ; {ready} des 300 grands lacs prêts (1991–2025), le reste arrive dans les prochains jours.",
  p3: "LakeTEMP : {good} lacs aux statistiques fiables (courbe, non intermittents, ≥ 46 mesures Landsat) ; Abraham compte {obs} mesures.",
  p4: "ERA5 est une réanalyse sur une grille d'environ 25 km : elle décrit l'air autour de l'exutoire, pas la surface du lac.",
  d1: "Table HydroLAKES construite avec DuckDB spatial et jointe à LakeTEMP par Hylak_id.",
  d2: "Tendances hivernales avec regr_slope et intervalles à 95 % ; tout autre lac est demandé à la volée et mis en cache dans le navigateur.",
  d3: "GitHub Action quotidienne qui poursuit le téléchargement Open-Meteo dans la limite gratuite.",
  d4: "Jours de glace, saison de glace et température mensuelle de l'eau selon les règles de qualité de LakeTEMP.",
  n1: "Polygones des lacs (820 Mo) pour placer ERA5 au centre du lac plutôt qu'à son exutoire.",
  n2: "Dates d'englacement et de débâcle année par année pour vérifier si la saison de glace d'Abraham raccourcit.",
  n3: "Observations de glace sur le terrain pour valider les estimations de LakeTEMP en Alberta.",
  srcHydroLakes: "mondiale, lacs ≥ 10 ha", srcLaketemp: "mondiale, moyenne 2013–2021", srcEra5: "mondiale, 1940–aujourd'hui",
  limHydroLakes: "exutoire, pas le centre ; peu de noms", limLaketemp: "glace estimée par une courbe saisonnière ; pas de valeurs annuelles",
  limEra5: "grille d'env. 25 km ; estimation de modèle, pas de stations", limNe: "côtes généralisées",
  useLakes: "utilisé : attributs des lacs", useTemp: "utilisé : jours de glace, température de l'eau", useAir: "utilisé : température hivernale de l'air",
  useMap: "utilisé : carte du monde", useSql: "utilisé : traitement des données", continuous: "mis à jour en continu", publicDomain: "domaine public",
};
const IT: Record<string, string> = {
  title: "Sei domande di ricerca",
  lead: "Ogni risposta indica da dove viene. Gli andamenti di questi dati non sono mai letti come cause.",
  q1: "Gli inverni del lago Abraham si stanno scaldando?",
  a1: "Sì, lentamente: +{slope} °C per decennio dal 1951 (intervallo al 95%: da {lo} a {hi}). La tendenza spiega solo il {r2} della variazione tra un anno e l'altro, quindi un singolo inverno dice poco.",
  q2: "Si scalda più o meno velocemente dei grandi laghi del mondo?",
  a2: "Nel 1991–2025, i {abr} °C per decennio di Abraham sono {position} la mediana dei grandi laghi scaricati finora ({median}). Il gruppo di confronto cresce ogni giorno.",
  above: "sopra", below: "sotto",
  q3: "Quanto resta ghiacciato Abraham, ed è insolito?",
  a3: "LakeTEMP stima {days} giorni di ghiaccio all'anno. I laghi alla stessa latitudine gelano per una mediana di {p50} giorni: Abraham ha molto meno ghiaccio dei vicini.",
  q4: "Da dove vengono le bolle bianche?",
  a4: "La materia organica che si decompone nei sedimenti libera metano, che sale in bolle; d'inverno restano congelate nel ghiaccio. Il gorgogliamento è una via nota con cui il metano dei laghi raggiunge l'atmosfera (Walter et al., 2006).",
  q5: "Il ghiaccio dei laghi si sta riducendo nel mondo?",
  a5: "Gli studi su lunghe serie di ghiaccio trovano una perdita diffusa del ghiaccio lacustre nell'emisfero nord con il riscaldamento degli inverni (Sharma et al., 2019). LakeTEMP è una media 2013–2021, quindi questa pagina mostra dove il ghiaccio dura di più, non come è cambiato.",
  q6: "Perché Abraham potrebbe gelare per meno tempo dei laghi vicini?",
  a6: "Possibili ragioni: è un bacino profondo e regolato che conserva il calore estivo e d'inverno si abbassa, e ai piedi delle Montagne Rocciose soffiano i venti caldi chinook. Nessuna è verificata qui.",
  p1: "{lakes} laghi in HydroLAKES; un punto per lago nel suo punto di uscita, non al centro.",
  p2: "Tendenze invernali: Abraham, {abrN} inverni dal 1951; {ready} dei 300 grandi laghi pronti (1991–2025), gli altri arrivano nei prossimi giorni.",
  p3: "LakeTEMP: {good} laghi con buone statistiche (curva, non intermittenti, ≥ 46 letture Landsat); Abraham ha {obs} letture.",
  p4: "ERA5 è una rianalisi su una griglia di circa 25 km: descrive l'aria intorno all'uscita, non la superficie del lago.",
  d1: "Tabella HydroLAKES costruita con DuckDB spatial e unita a LakeTEMP tramite Hylak_id.",
  d2: "Tendenze invernali con regr_slope e intervalli al 95%; ogni altro lago è richiesto su richiesta e salvato nel browser.",
  d3: "GitHub Action giornaliera che continua il download da Open-Meteo entro il limite gratuito.",
  d4: "Giorni di ghiaccio, stagione del ghiaccio e temperatura mensile dell'acqua con le regole di qualità di LakeTEMP.",
  n1: "Poligoni dei laghi (820 MB) per collocare ERA5 al centro del lago invece che all'uscita.",
  n2: "Date di congelamento e disgelo anno per anno per verificare se la stagione del ghiaccio di Abraham si accorcia.",
  n3: "Osservazioni del ghiaccio sul campo per validare le stime di LakeTEMP in Alberta.",
  srcHydroLakes: "globale, laghi ≥ 10 ha", srcLaketemp: "globale, media 2013–2021", srcEra5: "globale, 1940–oggi",
  limHydroLakes: "punto di uscita, non centro; pochi nomi", limLaketemp: "ghiaccio stimato da una curva stagionale; nessun valore annuale",
  limEra5: "griglia di circa 25 km; stima da modello, non stazioni", limNe: "coste generalizzate",
  useLakes: "usato: attributi dei laghi", useTemp: "usato: giorni di ghiaccio, temperatura dell'acqua", useAir: "usato: temperatura invernale dell'aria",
  useMap: "usato: mappa del mondo", useSql: "usato: elaborazione dati", continuous: "aggiornato di continuo", publicDomain: "pubblico dominio",
};
const JA: Record<string, string> = {
  title: "6つの研究課題",
  lead: "各回答には根拠の種類を示しています。データ上の傾向を原因とは解釈しません。",
  q1: "アブラハム湖の冬は暖かくなっている？",
  a1: "はい、ゆっくりと。1951年以降10年あたり+{slope} °C（95%区間 {lo}〜{hi}）です。年ごとの変動のうち傾向で説明できるのは{r2}だけなので、1回の冬からはほとんど何もわかりません。",
  q2: "世界の大きな湖と比べて速い？遅い？",
  a2: "1991〜2025年では、アブラハム湖の10年あたり{abr} °Cは、これまでに取得できた大きな湖の中央値（{median}）を{position}います。比較対象はダウンロードが進むにつれて毎日増えます。",
  above: "上回って", below: "下回って",
  q3: "アブラハム湖はどれくらい凍っている？それは珍しい？",
  a3: "LakeTEMPの推定では年{days}日凍ります。同じ緯度の湖の中央値は{p50}日なので、アブラハム湖は周辺の湖よりかなり氷が少なくなっています。",
  q4: "白い泡はどこから来るの？",
  a4: "湖底の堆積物で有機物が分解されるとメタンが発生し、泡となって上がります。冬にはそれが氷の中で凍ります。泡の放出は、湖のメタンが大気に届く経路として知られています（Walter et al., 2006）。",
  q5: "世界の湖の氷は減っている？",
  a5: "長期の結氷記録を使った研究では、冬の温暖化に伴い北半球で湖氷が広く減っていることがわかっています（Sharma et al., 2019）。LakeTEMPは2013〜2021年の平均なので、このページでは氷が長く続く場所はわかっても、その変化はわかりません。",
  q6: "アブラハム湖が周辺の湖より短い期間しか凍らないのはなぜ？",
  a6: "考えられる理由は、夏の熱をためて冬に水位が下がる深い調整池であることと、ロッキー山脈のふもとを暖かいチヌーク風が吹くことです。どちらもここでは検証していません。",
  p1: "HydroLAKESの湖は{lakes}。各湖は中心ではなく出口（流出点）の1点で表されます。",
  p2: "冬の傾向：アブラハム湖は1951年以降の{abrN}回の冬、大きな湖300のうち{ready}湖が完了（1991〜2025年）。残りは今後数日で取得します。",
  p3: "LakeTEMP：品質の良い統計（曲線による、間欠湖でない、Landsat観測46回以上）がある湖は{good}。アブラハム湖の観測は{obs}回です。",
  p4: "ERA5は約25 km格子の再解析で、湖面ではなく出口周辺の大気を表します。",
  d1: "DuckDBのspatial拡張でHydroLAKESの表を作り、Hylak_idでLakeTEMPと結合。",
  d2: "regr_slopeと95%区間による冬の傾向。その他の湖は必要に応じて取得し、ブラウザに保存。",
  d3: "無料枠の範囲でOpen-Meteoの取得を続ける毎日のGitHub Action。",
  d4: "LakeTEMPの品質基準に沿った結氷日数、結氷期間、月別水温。",
  n1: "ERA5を出口ではなく湖の中心に置くための湖のポリゴン（820 MB）。",
  n2: "アブラハム湖の結氷期間が短くなっているかを確かめるための、年ごとの結氷日と解氷日。",
  n3: "アルバータ州の湖でLakeTEMPの推定を検証するための現地の結氷観測。",
  srcHydroLakes: "全球、10 ha以上の湖", srcLaketemp: "全球、2013〜2021年平均", srcEra5: "全球、1940年〜現在",
  limHydroLakes: "中心でなく流出点、名前が少ない", limLaketemp: "季節曲線から推定した結氷、年ごとの値なし",
  limEra5: "約25 km格子、観測所ではなくモデル推定", limNe: "簡略化された海岸線",
  useLakes: "使用：湖の属性", useTemp: "使用：結氷日数・水温", useAir: "使用：冬の気温",
  useMap: "使用：世界地図", useSql: "使用：データ処理", continuous: "随時更新", publicDomain: "パブリックドメイン",
};
const tr = makeTr("abrahamResearch", { es: ES, fr: FR, it: IT, ja: JA }) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN[key], values);

export interface ResearchValues {
  slope: string; lo: string; hi: string; r2: string; abr: string; median: string; above: boolean;
  days: number; p50: number; lakes: string; abrN: number; ready: number; good: string; obs: number;
}

export function AbrahamQuestions({ v, language }: { v: ResearchValues; language: string }) {
  const items: Question[] = [
    { q: T(language, "q1"), a: T(language, "a1", { slope: v.slope, lo: v.lo, hi: v.hi, r2: v.r2 }), tag: "data" },
    { q: T(language, "q2"), a: T(language, "a2", { abr: v.abr, median: v.median, position: T(language, v.above ? "above" : "below") }), tag: "data" },
    { q: T(language, "q3"), a: T(language, "a3", { days: v.days, p50: v.p50 }), tag: "data" },
    { q: T(language, "q4"), a: T(language, "a4"), tag: "lit" },
    { q: T(language, "q5"), a: T(language, "a5"), tag: "lit" },
    { q: T(language, "q6"), a: T(language, "a6"), tag: "hyp" },
  ];
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export function AbrahamQuality({ v, language }: { v: ResearchValues; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={[T(language, "p1", { lakes: v.lakes }), T(language, "p2", { abrN: v.abrN, ready: v.ready }), T(language, "p3", { good: v.good, obs: v.obs }), T(language, "p4")]}
      done={["d1", "d2", "d3", "d4"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3"].map((k) => T(language, k))} />
  );
}

export function AbrahamSources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "WWF / McGill · HydroSHEDS", title: "HydroLAKES v1.0", url: "https://www.hydrosheds.org/products/hydrolakes", pub: "2016", cover: S("srcHydroLakes"), license: "CC BY 4.0", limits: S("limHydroLakes"), use: S("useLakes") },
    { inst: "McGill · HydroSHEDS", title: "LakeTEMP v1.1", url: "https://www.hydrosheds.org/products/laketemp", pub: "2024", cover: S("srcLaketemp"), license: "CC BY 4.0", limits: S("limLaketemp"), use: S("useTemp") },
    { inst: "ECMWF / Copernicus C3S · Open-Meteo", title: "ERA5 via Open-Meteo Historical Weather API", url: "https://open-meteo.com/en/docs/historical-weather-api", pub: S("continuous"), cover: S("srcEra5"), license: "CC BY 4.0", limits: S("limEra5"), use: S("useAir") },
    { inst: "Natural Earth", title: "Land 1:110m", url: "https://www.naturalearthdata.com/", pub: "2022", cover: "global", license: S("publicDomain"), limits: S("limNe"), use: S("useMap") },
    { inst: "DuckDB Foundation", title: "DuckDB 1.4 + spatial extension", url: "https://duckdb.org/", pub: "2025", cover: "—", license: "MIT", limits: "—", use: S("useSql") },
  ];
  const refs = REFS;
  return <SourcesAndReferences sources={sources} refs={refs} checkedOn={checkedOn} language={language} />;
}
