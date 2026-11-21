// Day 002 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";

type V = Record<string, string | number>;
const EN: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. Records show where people looked, so no pattern here is read as a cause.",
  q1: "Where in New Zealand are glowworms recorded most?",
  a1: "By raw count, {raw} ({rawCount} records). Adjusted for how much people use iNaturalist in each region, {top} leads with {topRate} records per 100,000 observations, {ratio}× {raw}'s rate.",
  q2: "When in the year are glowworms recorded?",
  a2: "Raw records peak in {rawPeak}, but relative to all iNaturalist activity the rate peaks in {first} and {second} ({peakRate} per 100,000), the Southern Hemisphere winter.",
  q3: "Are glowworms becoming more common?",
  a3: "The data cannot say. Records rose from {a} in {fromYear} to {b} in {toYear}, but the reporting rate stayed between {lo} and {hi} per 100,000 from {stableFrom} on: the growth follows iNaturalist's growth.",
  q4: "Where do glowworms live, and why do caves matter?",
  a4: "The larvae live in cool, damp, dark places and lure small insects with blue-green light onto sticky silk threads (Meyer-Rochow, 2007). In the Waitomo Glowworm Cave, opening an upper entrance in 1975 let outside air flow through, the cave climate became more variable, and the glowworm population declined (Pugsley, 1984).",
  q5: "Why divide by all iNaturalist observations?",
  a5: "Opportunistic records mix where a species lives with where people go and report (Isaac & Pocock, 2015). Comparing against all records from the same platform and area, a 'target-group' background, is a standard way to reduce that bias (Phillips et al., 2009).",
  q6: "Why would the rate peak in winter?",
  a6: "Possible reasons: evenings get dark earlier, July has school holidays when families visit caves and bush walks, and fewer other species are being logged in winter, which lowers the denominator. This page does not separate them.",
  p1: "{n} georeferenced GBIF records of Arachnocampa luminosa without geospatial issues: {inat} from iNaturalist, {museum} museum specimens or samples, {other} other.",
  p2: "{noRegion} records have no region and are left out of rates.",
  p3: "Effort: all iNaturalist research-grade observations in New Zealand, by region × month and region × year; combined assuming month and year are independent within a region.",
  p4: "iNaturalist can blur the coordinates of some observations, so a map point may be several kilometres from the real site.",
  d1: "Night-sky map, records by region, month, and year, with cross-filtering.",
  d2: "Effort-adjusted reporting rate with 95% Poisson intervals and low-sample flags.",
  d3: "Source, year-range, and distance-from-Waitomo filters.",
  d4: "Waitomo's monthly climate from ERA5 next to the records.",
  n1: "Count distinct observers, so one person's many visits weigh less.",
  n2: "Glowworm counts from cave monitoring, which would measure abundance instead of presence.",
  n3: "A filter on coordinate uncertainty.",
  covNZ: "New Zealand", covGlobal: "global", covRef: "reference", limGbif: "presence-only; observer bias", limInat: "volunteer observers; some blurred coordinates",
  limEra5: "~25 km grid; model estimate", limNe: "generalised coastlines", limRef: "—",
  useRecords: "used: glowworm records", useEffort: "used: observer effort", useClimate: "used: Waitomo climate", useMap: "used: map outline", useRef: "used: cave background",
  perRecord: "per record (CC0, CC BY, CC BY-NC)", continuous: "continuously updated", publicDomain: "public domain",
};
const ES: Record<string, string> = {
  title: "Seis preguntas de investigación",
  lead: "Cada respuesta indica de dónde sale. Los registros muestran dónde buscó la gente, así que ningún patrón se interpreta como causa.",
  q1: "¿En qué parte de Nueva Zelanda se registran más luciérnagas?",
  a1: "Por conteo sin ajustar, {raw} ({rawCount} registros). Ajustando por cuánto se usa iNaturalist en cada región, {top} encabeza con {topRate} registros por cada 100,000 observaciones, {ratio}× la tasa de {raw}.",
  q2: "¿En qué época del año se registran?",
  a2: "Los registros sin ajustar alcanzan su pico en {rawPeak}, pero frente a toda la actividad de iNaturalist la tasa llega a su máximo en {first} y {second} ({peakRate} por cada 100,000), el invierno del hemisferio sur.",
  q3: "¿Hay cada vez más luciérnagas?",
  a3: "Los datos no lo pueden decir. Los registros pasaron de {a} en {fromYear} a {b} en {toYear}, pero la tasa se mantuvo entre {lo} y {hi} por cada 100,000 desde {stableFrom}: el crecimiento sigue al de iNaturalist.",
  q4: "¿Dónde viven las luciérnagas y por qué importan las cuevas?",
  a4: "Las larvas viven en lugares frescos, húmedos y oscuros, y atraen insectos pequeños con luz azul verdosa hacia hilos de seda pegajosos (Meyer-Rochow, 2007). En la Cueva de las Luciérnagas de Waitomo, al abrirse una entrada superior en 1975 empezó a circular aire de afuera, el clima de la cueva se volvió más variable y la población de luciérnagas disminuyó (Pugsley, 1984).",
  q5: "¿Por qué dividir entre todas las observaciones de iNaturalist?",
  a5: "Los registros oportunistas mezclan dónde vive una especie con dónde va y reporta la gente (Isaac y Pocock, 2015). Comparar contra todos los registros de la misma plataforma y zona, un fondo de 'grupo objetivo', es una forma estándar de reducir ese sesgo (Phillips et al., 2009).",
  q6: "¿Por qué la tasa sería más alta en invierno?",
  a6: "Algunas razones posibles: oscurece más temprano, en julio hay vacaciones escolares y las familias visitan cuevas y senderos, y en invierno se registran menos especies, lo que baja el denominador. Esta página no las separa.",
  p1: "{n} registros georreferenciados de Arachnocampa luminosa en GBIF sin problemas geoespaciales: {inat} de iNaturalist, {museum} ejemplares de museo o muestras y {other} de otras fuentes.",
  p2: "{noRegion} registros no tienen región y se excluyen de las tasas.",
  p3: "Esfuerzo: todas las observaciones de grado de investigación de iNaturalist en Nueva Zelanda, por región × mes y región × año; se combinan suponiendo que mes y año son independientes dentro de cada región.",
  p4: "iNaturalist puede difuminar las coordenadas de algunas observaciones, así que un punto del mapa puede estar a varios kilómetros del sitio real.",
  d1: "Mapa de cielo nocturno y registros por región, mes y año, con filtros cruzados.",
  d2: "Tasa de registro ajustada por esfuerzo, con intervalos de Poisson de 95% y aviso de muestras pequeñas.",
  d3: "Filtros de fuente, rango de años y distancia a Waitomo.",
  d4: "Clima mensual de Waitomo (ERA5) junto a los registros.",
  n1: "Contar observadores distintos, para que las muchas visitas de una sola persona pesen menos.",
  n2: "Conteos de luciérnagas del monitoreo de cuevas, que medirían abundancia y no solo presencia.",
  n3: "Un filtro por incertidumbre de coordenadas.",
  covNZ: "Nueva Zelanda", covGlobal: "global", covRef: "referencia", limGbif: "solo presencia; sesgo del observador", limInat: "observadores voluntarios; algunas coordenadas difuminadas",
  limEra5: "malla de ~25 km; estimación de modelo", limNe: "costas generalizadas", limRef: "—",
  useRecords: "usado: registros de luciérnagas", useEffort: "usado: esfuerzo de observación", useClimate: "usado: clima de Waitomo", useMap: "usado: contorno del mapa", useRef: "usado: contexto de cuevas",
  perRecord: "por registro (CC0, CC BY, CC BY-NC)", continuous: "se actualiza continuamente", publicDomain: "dominio público",
};
const FR: Record<string, string> = {
  title: "Six questions de recherche",
  lead: "Chaque réponse indique sa provenance. Les observations montrent où les gens ont cherché ; aucune tendance n'est lue comme une cause.",
  q1: "Où les vers luisants sont-ils le plus signalés en Nouvelle-Zélande ?",
  a1: "En effectifs bruts, {raw} ({rawCount} observations). En tenant compte de l'usage d'iNaturalist dans chaque région, {top} arrive en tête avec {topRate} observations pour 100 000, soit {ratio}× le taux de {raw}.",
  q2: "À quelle période de l'année sont-ils signalés ?",
  a2: "Les effectifs bruts culminent en {rawPeak}, mais rapporté à l'activité totale d'iNaturalist, le taux culmine en {first} et {second} ({peakRate} pour 100 000), l'hiver austral.",
  q3: "Les vers luisants deviennent-ils plus nombreux ?",
  a3: "Les données ne permettent pas de le dire. Les observations sont passées de {a} en {fromYear} à {b} en {toYear}, mais le taux est resté entre {lo} et {hi} pour 100 000 depuis {stableFrom} : la hausse suit celle d'iNaturalist.",
  q4: "Où vivent les vers luisants, et pourquoi les grottes comptent-elles ?",
  a4: "Les larves vivent dans des lieux frais, humides et sombres, et attirent de petits insectes avec une lumière bleu-vert vers des fils de soie collants (Meyer-Rochow, 2007). Dans la grotte de Waitomo, l'ouverture d'une entrée supérieure en 1975 a laissé circuler l'air extérieur, le climat de la grotte est devenu plus variable et la population a diminué (Pugsley, 1984).",
  q5: "Pourquoi diviser par toutes les observations iNaturalist ?",
  a5: "Les observations opportunistes mélangent l'endroit où vit une espèce et l'endroit où les gens vont et signalent (Isaac & Pocock, 2015). Comparer à toutes les observations de la même plateforme et de la même zone, un fond de « groupe cible », est une façon courante de réduire ce biais (Phillips et al., 2009).",
  q6: "Pourquoi le taux culminerait-il en hiver ?",
  a6: "Raisons possibles : la nuit tombe plus tôt, juillet compte des vacances scolaires où les familles visitent grottes et sentiers, et moins d'autres espèces sont signalées en hiver, ce qui abaisse le dénominateur. Cette page ne les sépare pas.",
  p1: "{n} observations géoréférencées d'Arachnocampa luminosa sur GBIF sans problème géospatial : {inat} d'iNaturalist, {museum} spécimens de musée ou échantillons, {other} autres.",
  p2: "{noRegion} observations n'ont pas de région et sont exclues des taux.",
  p3: "Effort : toutes les observations iNaturalist de qualité recherche en Nouvelle-Zélande, par région × mois et région × année ; combinées en supposant mois et année indépendants dans chaque région.",
  p4: "iNaturalist peut flouter les coordonnées de certaines observations : un point peut se trouver à plusieurs kilomètres du site réel.",
  d1: "Carte en ciel nocturne et observations par région, mois et année, avec filtrage croisé.",
  d2: "Taux de signalement ajusté par l'effort, avec intervalles de Poisson à 95 % et signalement des petits échantillons.",
  d3: "Filtres de source, de période et de distance à Waitomo.",
  d4: "Climat mensuel de Waitomo (ERA5) à côté des observations.",
  n1: "Compter les observateurs distincts, pour que les nombreuses visites d'une même personne pèsent moins.",
  n2: "Comptages de vers luisants issus du suivi des grottes, qui mesureraient l'abondance et pas seulement la présence.",
  n3: "Un filtre sur l'incertitude des coordonnées.",
  covNZ: "Nouvelle-Zélande", covGlobal: "mondiale", covRef: "référence", limGbif: "présence seule ; biais d'observateur", limInat: "observateurs bénévoles ; certaines coordonnées floutées",
  limEra5: "grille d'env. 25 km ; estimation de modèle", limNe: "côtes généralisées", limRef: "—",
  useRecords: "utilisé : observations de vers luisants", useEffort: "utilisé : effort d'observation", useClimate: "utilisé : climat de Waitomo", useMap: "utilisé : contour de la carte", useRef: "utilisé : contexte des grottes",
  perRecord: "par observation (CC0, CC BY, CC BY-NC)", continuous: "mis à jour en continu", publicDomain: "domaine public",
};
const IT: Record<string, string> = {
  title: "Sei domande di ricerca",
  lead: "Ogni risposta indica da dove viene. Le segnalazioni mostrano dove le persone hanno cercato, quindi nessun andamento è letto come causa.",
  q1: "Dove vengono segnalate più lucciole in Nuova Zelanda?",
  a1: "Per conteggio grezzo, {raw} ({rawCount} segnalazioni). Tenendo conto di quanto si usa iNaturalist in ogni regione, {top} è in testa con {topRate} segnalazioni ogni 100.000 osservazioni, {ratio}× il tasso di {raw}.",
  q2: "In che periodo dell'anno vengono segnalate?",
  a2: "Le segnalazioni grezze hanno il picco a {rawPeak}, ma rispetto a tutta l'attività su iNaturalist il tasso è massimo a {first} e {second} ({peakRate} ogni 100.000), l'inverno australe.",
  q3: "Le lucciole stanno diventando più comuni?",
  a3: "I dati non lo dicono. Le segnalazioni sono passate da {a} nel {fromYear} a {b} nel {toYear}, ma il tasso è rimasto tra {lo} e {hi} ogni 100.000 dal {stableFrom}: la crescita segue quella di iNaturalist.",
  q4: "Dove vivono le lucciole, e perché contano le grotte?",
  a4: "Le larve vivono in luoghi freschi, umidi e bui e attirano piccoli insetti con una luce blu-verde verso fili di seta appiccicosi (Meyer-Rochow, 2007). Nella grotta di Waitomo, l'apertura di un ingresso superiore nel 1975 ha fatto circolare l'aria esterna, il clima della grotta è diventato più variabile e la popolazione è diminuita (Pugsley, 1984).",
  q5: "Perché dividere per tutte le osservazioni di iNaturalist?",
  a5: "Le segnalazioni opportunistiche mescolano dove vive una specie con dove le persone vanno e segnalano (Isaac & Pocock, 2015). Confrontarle con tutte le segnalazioni della stessa piattaforma e area, uno sfondo di 'gruppo bersaglio', è un modo standard per ridurre questo bias (Phillips et al., 2009).",
  q6: "Perché il tasso avrebbe il picco in inverno?",
  a6: "Possibili ragioni: fa buio prima, a luglio ci sono le vacanze scolastiche e le famiglie visitano grotte e sentieri, e d'inverno si registrano meno altre specie, il che abbassa il denominatore. Questa pagina non le separa.",
  p1: "{n} segnalazioni georeferenziate di Arachnocampa luminosa su GBIF senza problemi geospaziali: {inat} da iNaturalist, {museum} esemplari museali o campioni, {other} altre.",
  p2: "{noRegion} segnalazioni non hanno regione e sono escluse dai tassi.",
  p3: "Sforzo: tutte le osservazioni iNaturalist di livello ricerca in Nuova Zelanda, per regione × mese e regione × anno; combinate assumendo mese e anno indipendenti in ogni regione.",
  p4: "iNaturalist può sfocare le coordinate di alcune osservazioni, quindi un punto può trovarsi a diversi chilometri dal sito reale.",
  d1: "Mappa a cielo notturno e segnalazioni per regione, mese e anno, con filtri incrociati.",
  d2: "Tasso di segnalazione corretto per lo sforzo, con intervalli di Poisson al 95% e avvisi per campioni piccoli.",
  d3: "Filtri per fonte, intervallo di anni e distanza da Waitomo.",
  d4: "Clima mensile di Waitomo (ERA5) accanto alle segnalazioni.",
  n1: "Contare gli osservatori distinti, così le molte visite di una sola persona pesano meno.",
  n2: "Conteggi di lucciole dal monitoraggio delle grotte, che misurerebbero l'abbondanza e non solo la presenza.",
  n3: "Un filtro sull'incertezza delle coordinate.",
  covNZ: "Nuova Zelanda", covGlobal: "globale", covRef: "riferimento", limGbif: "solo presenza; bias dell'osservatore", limInat: "osservatori volontari; alcune coordinate sfocate",
  limEra5: "griglia di circa 25 km; stima da modello", limNe: "coste generalizzate", limRef: "—",
  useRecords: "usato: segnalazioni di lucciole", useEffort: "usato: sforzo di osservazione", useClimate: "usato: clima di Waitomo", useMap: "usato: contorno della mappa", useRef: "usato: contesto delle grotte",
  perRecord: "per segnalazione (CC0, CC BY, CC BY-NC)", continuous: "aggiornato di continuo", publicDomain: "pubblico dominio",
};
const JA: Record<string, string> = {
  title: "6つの研究課題",
  lead: "各回答には根拠の種類を示しています。記録は人が探した場所を示すため、傾向を原因とは解釈しません。",
  q1: "ニュージーランドのどこでツチボタルが最も記録されている？",
  a1: "生の記録数では{raw}（{rawCount}件）です。地域ごとのiNaturalist利用度で補正すると、{top}が10万観察あたり{topRate}件で首位となり、{raw}の{ratio}倍です。",
  q2: "1年のうちいつ記録される？",
  a2: "生の記録数は{rawPeak}にピークを迎えますが、iNaturalist全体の活動と比べると、報告率は{first}と{second}（10万あたり{peakRate}）に最も高くなります。南半球の冬です。",
  q3: "ツチボタルは増えている？",
  a3: "このデータからはわかりません。記録は{fromYear}年の{a}件から{toYear}年の{b}件に増えましたが、報告率は{stableFrom}年以降10万あたり{lo}〜{hi}で推移しており、増加はiNaturalistの成長に沿っています。",
  q4: "ツチボタルはどこにすみ、なぜ洞窟が重要？",
  a4: "幼虫は涼しく湿った暗い場所にすみ、青緑の光で小さな虫を粘着性の絹糸へおびき寄せます（Meyer-Rochow, 2007）。ワイトモのツチボタル洞窟では、1975年に上部の入口が開いて外気が流れ込むようになり、洞窟内の気候が不安定になって個体数が減りました（Pugsley, 1984）。",
  q5: "なぜiNaturalistの全観察数で割るの？",
  a5: "偶発的な記録には、種がすむ場所と人が行って報告する場所が混ざっています（Isaac & Pocock, 2015）。同じプラットフォーム・地域の全記録と比べる「ターゲットグループ」背景は、この偏りを減らす標準的な方法です（Phillips et al., 2009）。",
  q6: "なぜ報告率は冬に高くなる？",
  a6: "考えられる理由は、日が早く暮れること、7月の学校休暇に家族で洞窟や遊歩道を訪れること、冬は他の種の記録が少なく分母が小さくなることです。このページではこれらを区別していません。",
  p1: "地理空間上の問題がないGBIFのArachnocampa luminosaの位置付き記録は{n}件：iNaturalistが{inat}件、博物館標本・試料が{museum}件、その他が{other}件です。",
  p2: "{noRegion}件の記録には地域がなく、報告率から除外しています。",
  p3: "観察努力量：ニュージーランドのiNaturalist研究用グレード観察すべてを地域×月、地域×年で集計。各地域内で月と年が独立と仮定して組み合わせています。",
  p4: "iNaturalistでは一部の観察の座標がぼかされるため、地図上の点が実際の場所から数km離れていることがあります。",
  d1: "夜空の地図と、地域・月・年別の記録（クロスフィルター付き）。",
  d2: "観察努力量で補正した報告率（95%ポアソン区間と少数標本の表示付き）。",
  d3: "出典、年の範囲、ワイトモからの距離のフィルター。",
  d4: "記録と並べたワイトモの月別気候（ERA5）。",
  n1: "同じ人の何度もの訪問の重みを下げるため、異なる観察者の数を数える。",
  n2: "存在だけでなく個体数を測れる、洞窟モニタリングによるツチボタルの計数。",
  n3: "座標の不確かさによるフィルター。",
  covNZ: "ニュージーランド", covGlobal: "全球", covRef: "参考", limGbif: "在データのみ、観察者バイアス", limInat: "ボランティアの観察、一部の座標はぼかし",
  limEra5: "約25 km格子、モデル推定", limNe: "簡略化された海岸線", limRef: "—",
  useRecords: "使用：ツチボタルの記録", useEffort: "使用：観察努力量", useClimate: "使用：ワイトモの気候", useMap: "使用：地図の輪郭", useRef: "使用：洞窟の背景",
  perRecord: "記録ごと（CC0、CC BY、CC BY-NC）", continuous: "随時更新", publicDomain: "パブリックドメイン",
};
const tr = makeTr("glowResearch", { es: ES, fr: FR, it: IT, ja: JA }) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN[key], values);

export interface GlowResearchValues {
  raw: string; rawCount: string; top: string; topRate: string; ratio: string;
  rawPeak: string; first: string; second: string; peakRate: string;
  a: string; b: string; fromYear: number; toYear: number; lo: string; hi: string; stableFrom: number;
  n: string; inat: string; museum: string; other: string; noRegion: string;
}

export function GlowQuestions({ v, language }: { v: GlowResearchValues; language: string }) {
  const items: Question[] = [
    { q: T(language, "q1"), tag: "data", a: T(language, "a1", { raw: v.raw, rawCount: v.rawCount, top: v.top, topRate: v.topRate, ratio: v.ratio }) },
    { q: T(language, "q2"), tag: "data", a: T(language, "a2", { rawPeak: v.rawPeak, first: v.first, second: v.second, peakRate: v.peakRate }) },
    { q: T(language, "q3"), tag: "data", a: T(language, "a3", { a: v.a, b: v.b, fromYear: v.fromYear, toYear: v.toYear, lo: v.lo, hi: v.hi, stableFrom: v.stableFrom }) },
    { q: T(language, "q4"), tag: "lit", a: T(language, "a4") },
    { q: T(language, "q5"), tag: "lit", a: T(language, "a5") },
    { q: T(language, "q6"), tag: "hyp", a: T(language, "a6") },
  ];
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export function GlowQuality({ v, language }: { v: GlowResearchValues; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={[T(language, "p1", { n: v.n, inat: v.inat, museum: v.museum, other: v.other }), T(language, "p2", { noRegion: v.noRegion }), T(language, "p3"), T(language, "p4")]}
      done={["d1", "d2", "d3", "d4"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3"].map((k) => T(language, k))} />
  );
}

export function GlowSources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "GBIF", title: "Occurrence search API: Arachnocampa luminosa (taxonKey 1564326)", url: "https://www.gbif.org/species/1564326", pub: S("continuous"), cover: S("covNZ"), license: S("perRecord"), limits: S("limGbif"), use: S("useRecords") },
    { inst: "iNaturalist (via GBIF)", title: "Research-grade observations, New Zealand", url: "https://www.inaturalist.org/", pub: S("continuous"), cover: S("covNZ"), license: S("perRecord"), limits: S("limInat"), use: S("useEffort") },
    { inst: "ECMWF / Copernicus C3S · Open-Meteo", title: "ERA5 via Open-Meteo Historical Weather API", url: "https://open-meteo.com/en/docs/historical-weather-api", pub: S("continuous"), cover: S("covGlobal"), license: "CC BY 4.0", limits: S("limEra5"), use: S("useClimate") },
    { inst: "Natural Earth", title: "Admin 0 countries 1:50m", url: "https://www.naturalearthdata.com/", pub: "2022", cover: S("covGlobal"), license: S("publicDomain"), limits: S("limNe"), use: S("useMap") },
  ];
  const refs: Reference[] = [
    { text: "Meyer-Rochow, V. B. (2007). Glowworms: a review of Arachnocampa spp. and kin. Luminescence, 22(3), 251–265.", doi: "10.1002/bio.955" },
    { text: "Pugsley, C. (1984). Ecology of the New Zealand glowworm, Arachnocampa luminosa (Diptera: Keroplatidae), in the Glowworm Cave, Waitomo. Journal of the Royal Society of New Zealand, 14(4), 387–407.", doi: "10.1080/03036758.1984.10421739" },
    { text: "Isaac, N. J. B., & Pocock, M. J. O. (2015). Bias and information in biological records. Biological Journal of the Linnean Society, 115(3), 522–531.", doi: "10.1111/bij.12532" },
    { text: "Phillips, S. J., et al. (2009). Sample selection bias and presence-only distribution models: implications for background and pseudo-absence data. Ecological Applications, 19(1), 181–197.", doi: "10.1890/07-2153.1" },
    { text: "Hersbach, H., et al. (2020). The ERA5 global reanalysis. Quarterly Journal of the Royal Meteorological Society, 146(730), 1999–2049.", doi: "10.1002/qj.3803" },
    { text: "Zippenfenig, P. Open-Meteo.com Weather API. Zenodo.", doi: "10.5281/zenodo.7970649" },
  ];
  return <SourcesAndReferences sources={sources} refs={refs} checkedOn={checkedOn} language={language} />;
}
