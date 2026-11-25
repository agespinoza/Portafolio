// Day 001 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";

export const REFS: Reference[] = [
  { text: "Vega Briones, G. (2016). Población commuter de la frontera norte: el caso de Mexicali-Calexico y Tijuana-San Diego. Estudios Demográficos y Urbanos, 31(1), 207–238.", doi: "10.24201/edu.v31i1.1508" },
  { text: "Sharma, S., Kang, D. H., Montes de Oca, J. R., & Mudgal, A. (2021). Machine learning methods for commercial vehicle wait time prediction at a border crossing. Research in Transportation Economics, 89, 101034.", doi: "10.1016/j.retrec.2021.101034" },
];


type V = Record<string, string | number>;
const EN: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. The numbers update with the crossing, lane, month, and hours you choose above.",
  q1: "When is the best time to cross?",
  a1: "For {lane} at {crossing} in {month}, between {from} and {to}, the quietest slot is {bestDay} at {bestHour} (about {best}) and the busiest is {worstDay} at {worstHour} (about {worst}). The planner ranks the hours for the day you pick.",
  q2: "Which crossing is faster, West or East?",
  a2: "In the hours both are open, {faster} averages {a} against {b} at {slower}, and it is faster in {share} of day-and-hour slots. East closes at night, so late crossings only have West.",
  a2none: "There are no hours in this window where both crossings report a wait.",
  q3: "How much time do SENTRI and Ready Lane save?",
  a3: "At {crossing}, {lanes}. The savings grow at the busiest hours, which is when trusted-traveler lanes matter most.",
  a3none: "In this window the trusted-traveler lanes do not save at least a minute on average.",
  q4: "Which months are busiest?",
  a4: "Between {from} and {to}, {worstMonth} has the longest average wait ({worstV}) and {bestMonth} the shortest ({bestV}) at {crossing}.",
  q5: "Who crosses every day, and why are some hours so busy?",
  a5: "Many crossers are commuters who live in Mexicali and work in Calexico or the Imperial Valley (Vega Briones, 2016). Morning peaks fit work and school schedules, and Sunday afternoon peaks fit weekend return trips; this page does not test those explanations.",
  q6: "How exact are CBP wait times, and can they be forecast?",
  a6: "CBP's numbers are estimates posted by officers, not measured trip times, and the averages do not say how many days they cover. Wait times follow strong daily and weekly cycles, which is why they can be forecast from history (Sharma et al., 2021, for commercial trucks).",
  p1: "Historical averages: 7 weekdays × 24 hours for each crossing, lane, and month (168 cells), from CBP's historical endpoint.",
  p2: "Hours reported as zero are treated as closed or missing. East is open 6 am–10 pm; West is open 24 hours.",
  p3: "Today's chart compares the hours reported so far with CBP's typical value, minimum, and maximum for the same weekday.",
  p4: "If the live service fails, the page uses a snapshot saved on {date}.",
  d1: "Live wait, today vs. typical, and monthly averages for both crossings and four lanes.",
  d2: "Planner of the best hours, with CBP's typical maximum as a bad-day check.",
  d3: "Comparison views: crossing vs. crossing and SENTRI or Ready Lane vs. standard.",
  d4: "Offline snapshot and five languages.",
  n1: "Measured crossing times (GPS or Bluetooth) to check CBP's estimates.",
  n2: "Holidays and special events, which CBP's averages do not separate.",
  n3: "Commercial lanes and southbound waits.",
  cover: "US land ports, hourly", coverRef: "program reference", limBwt: "officer estimates; no sample size", limRef: "—",
  useData: "used: live and historical waits", useRef: "used: lane descriptions", continuous: "continuously updated", usGov: "US public domain",
};
const ES: Record<string, string> = {
  title: "Seis preguntas de investigación",
  lead: "Cada respuesta indica de dónde sale. Los números cambian con el cruce, carril, mes y horas que elijas arriba.",
  q1: "¿Cuál es la mejor hora para cruzar?",
  a1: "Para {lane} en {crossing} en {month}, entre {from} y {to}, la hora más tranquila es {bestDay} a las {bestHour} (unos {best}) y la más concurrida {worstDay} a las {worstHour} (unos {worst}). El planificador ordena las horas del día que elijas.",
  q2: "¿Qué cruce es más rápido, West o East?",
  a2: "En las horas en que ambos están abiertos, {faster} promedia {a} contra {b} en {slower}, y es más rápido en {share} de las combinaciones de día y hora. East cierra de noche, así que de madrugada solo queda West.",
  a2none: "En este rango de horas no hay ninguna en que ambos cruces reporten espera.",
  q3: "¿Cuánto tiempo ahorran SENTRI y Ready Lane?",
  a3: "En {crossing}, {lanes}. El ahorro crece en las horas más concurridas, que es cuando los carriles de viajero confiable importan más.",
  a3none: "En este rango de horas los carriles de viajero confiable no ahorran ni un minuto en promedio.",
  q4: "¿Qué meses son los más concurridos?",
  a4: "Entre {from} y {to}, {worstMonth} tiene la espera promedio más larga ({worstV}) y {bestMonth} la más corta ({bestV}) en {crossing}.",
  q5: "¿Quién cruza todos los días y por qué algunas horas están tan llenas?",
  a5: "Muchas personas que cruzan son commuters que viven en Mexicali y trabajan en Calexico o el Valle Imperial (Vega Briones, 2016). Los picos de la mañana coinciden con horarios de trabajo y escuela, y los del domingo por la tarde con el regreso del fin de semana; esta página no comprueba esas explicaciones.",
  q6: "¿Qué tan exactos son los tiempos de CBP y se pueden pronosticar?",
  a6: "Las cifras de CBP son estimaciones publicadas por oficiales, no tiempos medidos, y los promedios no dicen cuántos días abarcan. Los tiempos de espera siguen ciclos diarios y semanales muy marcados, por eso se pueden pronosticar con el historial (Sharma et al., 2021, para camiones de carga).",
  p1: "Promedios históricos: 7 días × 24 horas por cruce, carril y mes (168 celdas), del servicio histórico de CBP.",
  p2: "Las horas reportadas en cero se tratan como cerradas o sin datos. East abre de 6 am a 10 pm; West, las 24 horas.",
  p3: "La gráfica de hoy compara las horas reportadas hasta ahora con el valor típico, mínimo y máximo de CBP para el mismo día de la semana.",
  p4: "Si el servicio en vivo falla, la página usa una copia guardada el {date}.",
  d1: "Espera en vivo, hoy contra lo típico y promedios mensuales para ambos cruces y cuatro carriles.",
  d2: "Planificador de las mejores horas, con el máximo típico de CBP como referencia de un día malo.",
  d3: "Vistas de comparación: cruce contra cruce y SENTRI o Ready Lane contra el carril estándar.",
  d4: "Copia sin conexión y cinco idiomas.",
  n1: "Tiempos de cruce medidos (GPS o Bluetooth) para validar las estimaciones de CBP.",
  n2: "Días festivos y eventos especiales, que los promedios de CBP no separan.",
  n3: "Carriles comerciales y esperas hacia el sur.",
  cover: "puertos terrestres de EE. UU., por hora", coverRef: "referencia del programa", limBwt: "estimaciones de oficiales; sin tamaño de muestra", limRef: "—",
  useData: "usado: esperas en vivo e históricas", useRef: "usado: descripción de carriles", continuous: "se actualiza continuamente", usGov: "dominio público de EE. UU.",
};
const FR: Record<string, string> = {
  title: "Six questions de recherche",
  lead: "Chaque réponse indique sa provenance. Les chiffres suivent le poste, la voie, le mois et les heures choisis plus haut.",
  q1: "Quelle est la meilleure heure pour traverser ?",
  a1: "Pour {lane} à {crossing} en {month}, entre {from} et {to}, le créneau le plus calme est {bestDay} à {bestHour} (environ {best}) et le plus chargé {worstDay} à {worstHour} (environ {worst}). Le planificateur classe les heures du jour choisi.",
  q2: "Quel poste est le plus rapide, West ou East ?",
  a2: "Aux heures où les deux sont ouverts, {faster} affiche {a} en moyenne contre {b} à {slower}, et il est plus rapide dans {share} des créneaux jour-heure. East ferme la nuit : tard le soir, il ne reste que West.",
  a2none: "Dans cette plage, aucune heure n'a d'attente publiée aux deux postes.",
  q3: "Combien de temps font gagner SENTRI et Ready Lane ?",
  a3: "À {crossing}, {lanes}. Le gain augmente aux heures de pointe, quand les voies pour voyageurs de confiance comptent le plus.",
  a3none: "Dans cette plage, les voies pour voyageurs de confiance ne font pas gagner au moins une minute en moyenne.",
  q4: "Quels mois sont les plus chargés ?",
  a4: "Entre {from} et {to}, {worstMonth} a l'attente moyenne la plus longue ({worstV}) et {bestMonth} la plus courte ({bestV}) à {crossing}.",
  q5: "Qui traverse chaque jour, et pourquoi certaines heures sont-elles si chargées ?",
  a5: "Beaucoup de personnes sont des navetteurs qui vivent à Mexicali et travaillent à Calexico ou dans l'Imperial Valley (Vega Briones, 2016). Les pointes du matin correspondent aux horaires de travail et d'école, celles du dimanche après-midi aux retours de week-end ; cette page ne teste pas ces explications.",
  q6: "Les temps de la CBP sont-ils exacts, et peut-on les prévoir ?",
  a6: "Les chiffres de la CBP sont des estimations publiées par les agents, pas des temps mesurés, et les moyennes n'indiquent pas combien de jours elles couvrent. Les attentes suivent de forts cycles quotidiens et hebdomadaires, ce qui permet de les prévoir à partir de l'historique (Sharma et al., 2021, pour les camions).",
  p1: "Moyennes historiques : 7 jours × 24 heures par poste, voie et mois (168 cases), issues du service historique de la CBP.",
  p2: "Les heures à zéro sont considérées comme fermées ou sans données. East ouvre de 6 h à 22 h ; West 24 h sur 24.",
  p3: "Le graphique du jour compare les heures publiées avec la valeur habituelle, le minimum et le maximum de la CBP pour le même jour de la semaine.",
  p4: "Si le service en direct échoue, la page utilise un instantané du {date}.",
  d1: "Attente en direct, aujourd'hui vs habituel et moyennes mensuelles pour les deux postes et quatre voies.",
  d2: "Planificateur des meilleures heures, avec le maximum habituel de la CBP comme repère de mauvais jour.",
  d3: "Vues comparatives : poste contre poste et SENTRI ou Ready Lane contre voie standard.",
  d4: "Instantané hors ligne et cinq langues.",
  n1: "Temps de passage mesurés (GPS ou Bluetooth) pour vérifier les estimations de la CBP.",
  n2: "Jours fériés et événements, que les moyennes de la CBP ne distinguent pas.",
  n3: "Voies commerciales et attentes vers le sud.",
  cover: "postes terrestres des États-Unis, par heure", coverRef: "référence du programme", limBwt: "estimations d'agents ; taille d'échantillon inconnue", limRef: "—",
  useData: "utilisé : attentes en direct et historiques", useRef: "utilisé : description des voies", continuous: "mis à jour en continu", usGov: "domaine public des États-Unis",
};
const IT: Record<string, string> = {
  title: "Sei domande di ricerca",
  lead: "Ogni risposta indica da dove viene. I numeri seguono il valico, la corsia, il mese e le ore scelti sopra.",
  q1: "Qual è l'ora migliore per attraversare?",
  a1: "Per {lane} a {crossing} a {month}, tra {from} e {to}, la fascia più tranquilla è {bestDay} alle {bestHour} (circa {best}) e la più affollata {worstDay} alle {worstHour} (circa {worst}). Il pianificatore ordina le ore del giorno scelto.",
  q2: "Quale valico è più veloce, West o East?",
  a2: "Nelle ore in cui sono aperti entrambi, {faster} ha una media di {a} contro {b} a {slower}, ed è più veloce nel {share} delle fasce giorno-ora. East chiude di notte, quindi a tarda sera resta solo West.",
  a2none: "In questa fascia non ci sono ore in cui entrambi i valichi riportano un'attesa.",
  q3: "Quanto tempo fanno risparmiare SENTRI e Ready Lane?",
  a3: "A {crossing}, {lanes}. Il risparmio cresce nelle ore di punta, quando le corsie per viaggiatori fidati contano di più.",
  a3none: "In questa fascia le corsie per viaggiatori fidati non fanno risparmiare almeno un minuto in media.",
  q4: "Quali mesi sono più affollati?",
  a4: "Tra {from} e {to}, {worstMonth} ha l'attesa media più lunga ({worstV}) e {bestMonth} la più breve ({bestV}) a {crossing}.",
  q5: "Chi attraversa ogni giorno, e perché alcune ore sono così piene?",
  a5: "Molti sono pendolari che vivono a Mexicali e lavorano a Calexico o nella Imperial Valley (Vega Briones, 2016). I picchi del mattino corrispondono agli orari di lavoro e scuola, quelli della domenica pomeriggio ai rientri del fine settimana; questa pagina non verifica queste spiegazioni.",
  q6: "Quanto sono precisi i tempi della CBP, e si possono prevedere?",
  a6: "I dati della CBP sono stime pubblicate dagli agenti, non tempi misurati, e le medie non dicono quanti giorni coprono. Le attese seguono forti cicli giornalieri e settimanali, per questo si possono prevedere dallo storico (Sharma et al., 2021, per i camion).",
  p1: "Medie storiche: 7 giorni × 24 ore per valico, corsia e mese (168 celle), dal servizio storico della CBP.",
  p2: "Le ore con valore zero sono considerate chiuse o senza dati. East è aperto dalle 6 alle 22; West 24 ore su 24.",
  p3: "Il grafico di oggi confronta le ore riportate finora con il valore tipico, il minimo e il massimo della CBP per lo stesso giorno della settimana.",
  p4: "Se il servizio in diretta non risponde, la pagina usa un'istantanea del {date}.",
  d1: "Attesa in diretta, oggi rispetto al tipico e medie mensili per entrambi i valichi e quattro corsie.",
  d2: "Pianificatore delle ore migliori, con il massimo tipico della CBP come riferimento per una giornata no.",
  d3: "Viste di confronto: valico contro valico e SENTRI o Ready Lane contro corsia standard.",
  d4: "Istantanea offline e cinque lingue.",
  n1: "Tempi di attraversamento misurati (GPS o Bluetooth) per verificare le stime della CBP.",
  n2: "Festività ed eventi speciali, che le medie della CBP non separano.",
  n3: "Corsie commerciali e attese verso sud.",
  cover: "valichi terrestri degli Stati Uniti, orario", coverRef: "riferimento del programma", limBwt: "stime degli agenti; campione non indicato", limRef: "—",
  useData: "usato: attese in diretta e storiche", useRef: "usato: descrizione delle corsie", continuous: "aggiornato di continuo", usGov: "pubblico dominio USA",
};
const JA: Record<string, string> = {
  title: "6つの研究課題",
  lead: "各回答には根拠の種類を示しています。数値は上で選んだ検問所・レーン・月・時間帯に応じて変わります。",
  q1: "いちばん良い通過時間は？",
  a1: "{month}の{crossing}・{lane}で{from}〜{to}の場合、最も空いているのは{bestDay}の{bestHour}（約{best}）、最も混むのは{worstDay}の{worstHour}（約{worst}）です。プランナーは選んだ曜日の時間を順位づけします。",
  q2: "WestとEast、どちらが速い？",
  a2: "両方が開いている時間では、{faster}の平均は{a}、{slower}は{b}で、曜日・時間の組み合わせの{share}で{faster}の方が速くなっています。Eastは夜間閉鎖のため、深夜はWestしかありません。",
  a2none: "この時間帯には、両方の検問所が待ち時間を報告している時間がありません。",
  q3: "SENTRIとReady Laneでどれくらい短縮できる？",
  a3: "{crossing}では、{lanes}。短縮幅は混雑する時間ほど大きく、信頼できる旅行者向けレーンが最も役立つのはその時間です。",
  a3none: "この時間帯では、信頼できる旅行者向けレーンの平均短縮は1分未満です。",
  q4: "いちばん混む月は？",
  a4: "{crossing}の{from}〜{to}では、平均待ち時間が最も長いのは{worstMonth}（{worstV}）、最も短いのは{bestMonth}（{bestV}）です。",
  q5: "毎日誰が渡っている？なぜ特定の時間が混む？",
  a5: "多くはメヒカリに住み、カレキシコやインペリアル・バレーで働く越境通勤者です（Vega Briones, 2016）。朝のピークは仕事や学校の時間に、日曜午後のピークは週末の帰宅に重なりますが、このページではその説明を検証していません。",
  q6: "CBPの待ち時間はどれくらい正確？予測はできる？",
  a6: "CBPの数値は職員が掲示する推定値で、実測ではありません。平均が何日分かも示されていません。待ち時間には強い日周期と週周期があるため、過去のデータから予測できます（Sharma et al., 2021、貨物トラックの例）。",
  p1: "過去平均：検問所・レーン・月ごとに7曜日×24時間（168セル）、CBPの過去データサービスより。",
  p2: "ゼロと報告された時間は閉鎖またはデータなしとして扱います。Eastは午前6時〜午後10時、Westは24時間営業です。",
  p3: "今日のグラフは、これまでに報告された時間を、同じ曜日のCBPの典型値・最小値・最大値と比べています。",
  p4: "ライブサービスが使えない場合は、{date}に保存したスナップショットを使います。",
  d1: "両検問所・4レーンのライブ待ち時間、今日と典型値の比較、月別平均。",
  d2: "最適な時間のプランナー（混雑日の目安としてCBPの典型的な最大値つき）。",
  d3: "比較表示：検問所どうし、SENTRI・Ready Laneと通常レーン。",
  d4: "オフライン用スナップショットと5言語対応。",
  n1: "CBPの推定を検証するための実測通過時間（GPSやBluetooth）。",
  n2: "CBPの平均では区別されない祝日や特別なイベント。",
  n3: "商用レーンと南行きの待ち時間。",
  cover: "米国の陸上入国港、1時間ごと", coverRef: "制度の参考情報", limBwt: "職員による推定、標本数なし", limRef: "—",
  useData: "使用：ライブ・過去の待ち時間", useRef: "使用：レーンの説明", continuous: "随時更新", usGov: "米国パブリックドメイン",
};
const tr = makeTr("borderResearch", { es: ES, fr: FR, it: IT, ja: JA }) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN[key], values);

export interface BorderResearchValues {
  lane: string; crossing: string; month: string; from: string; to: string;
  best?: { day: string; hour: string; v: string }; worst?: { day: string; hour: string; v: string };
  cmp?: { faster: string; slower: string; a: string; b: string; share: string } | null;
  lanes: string; worstMonth?: { name: string; v: string }; bestMonth?: { name: string; v: string }; snapshotDate: string;
}

export function BorderQuestions({ v, language }: { v: BorderResearchValues; language: string }) {
  const items: Question[] = [];
  if (v.best && v.worst) items.push({ q: T(language, "q1"), tag: "data", a: T(language, "a1", {
    lane: v.lane, crossing: v.crossing, month: v.month, from: v.from, to: v.to,
    bestDay: v.best.day, bestHour: v.best.hour, best: v.best.v, worstDay: v.worst.day, worstHour: v.worst.hour, worst: v.worst.v,
  }) });
  items.push({ q: T(language, "q2"), tag: "data", a: v.cmp ? T(language, "a2", v.cmp) : T(language, "a2none") });
  items.push({ q: T(language, "q3"), tag: "data", a: v.lanes ? T(language, "a3", { crossing: v.crossing, lanes: v.lanes }) : T(language, "a3none") });
  if (v.worstMonth && v.bestMonth) items.push({ q: T(language, "q4"), tag: "data", a: T(language, "a4", {
    from: v.from, to: v.to, crossing: v.crossing, worstMonth: v.worstMonth.name, worstV: v.worstMonth.v, bestMonth: v.bestMonth.name, bestV: v.bestMonth.v,
  }) });
  items.push({ q: T(language, "q5"), tag: "hyp", a: T(language, "a5") });
  items.push({ q: T(language, "q6"), tag: "lit", a: T(language, "a6") });
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export function BorderQuality({ snapshotDate, language }: { snapshotDate: string; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={[T(language, "p1"), T(language, "p2"), T(language, "p3"), T(language, "p4", { date: snapshotDate })]}
      done={["d1", "d2", "d3", "d4"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3"].map((k) => T(language, k))} />
  );
}

export function BorderSources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "U.S. Customs and Border Protection", title: "Border Wait Times (live, daily graph, historical averages)", url: "https://bwt.cbp.gov/", pub: S("continuous"), cover: S("cover"), license: S("usGov"), limits: S("limBwt"), use: S("useData") },
    { inst: "U.S. Customs and Border Protection", title: "SENTRI trusted traveler program", url: "https://www.cbp.gov/travel/trusted-traveler-programs/sentri", pub: S("continuous"), cover: S("coverRef"), license: S("usGov"), limits: S("limRef"), use: S("useRef") },
    { inst: "U.S. Customs and Border Protection", title: "Ready Lanes", url: "https://www.cbp.gov/travel/clearing-cbp/ready-lanes", pub: S("continuous"), cover: S("coverRef"), license: S("usGov"), limits: S("limRef"), use: S("useRef") },
  ];
  const refs = REFS;
  return <SourcesAndReferences sources={sources} refs={refs} checkedOn={checkedOn} language={language} />;
}
