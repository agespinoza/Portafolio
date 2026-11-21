// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-21):
// - Light-pillar photos (Day 003): median ERA5 hourly temperature −19.4 °C, 6 photos with a time and weather
//   (src/days/day-003-light-pillars/catalog.json, phenomenon light_pillar).
// - Abraham Lake (Day 004): ERA5 daily mean air temperature (raw/day-004-abraham-lake/weather/7243.json);
//   Dec–Feb days with a daily mean ≤ −19.4 °C: 10.7 per winter in 1951–1980, 8.3 in 1996–2025;
//   days ≤ −15 °C per calendar year: 26.8 vs 20.8; winter trend +0.25 °C per decade.
// - Border waits (Day 001): CBP historical averages, car standard lane, 6 am–10 pm, saved snapshot.
// - Glowworms (Day 002): effort-adjusted reporting rate peaks in June–July; raw top region Wellington,
//   adjusted top region West Coast.
// - Located light-pillar and halo photos from Europe and North America (Day 003): 154 of 197 (78%).
export const LAB_INSIGHT = {
  throughDay: 4,
  days: { cold: [3, 4], seasons: [1, 2], observers: [1, 2, 3, 4] },
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "Winter is the common thread, and it is losing its edge",
      conclusion: "Three of the four days depend on cold: ice crystals that make light pillars (Day 003), the lake ice that traps methane bubbles at Abraham Lake (Day 004), and the dark winter evenings when glowworm reports peak (Day 002). Together they point the same way: the very cold days these sights need are becoming rarer. At Abraham Lake, winter days as cold as a typical light-pillar night fell from 10.7 to 8.3 per winter between 1951–1980 and 1996–2025.",
      coldTitle: "The cold behind the spectacle",
      cold: "Day 003's light-pillar photos were taken at a median −19.4 °C. At Abraham Lake, winter days with a daily mean that cold dropped from 10.7 to 8.3 per winter, and days at −15 °C or colder from 26.8 to 20.8 a year, while winters warmed +0.25 °C per decade. A rough yardstick: only 6 pillar photos have a time and weather, and those are hourly readings.",
      seasonsTitle: "Seasons run people, too",
      seasons: "Border waits at Calexico West are longest in April, March, and December (about 70 minutes on daytime averages) and shortest in October; East is quietest in July and August. Glowworm reports peak in the Southern Hemisphere winter once observer effort is removed. These human cycles likely follow holidays and school calendars more than the weather, which these days do not test.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Raw glowworm counts favored Wellington until they were divided by iNaturalist effort, which put the West Coast first (Day 002). 78% of the located halo photos come from Europe and North America (Day 003). CBP waits are officer estimates (Day 001), and Abraham's ice is a model estimate from satellite readings and a 25 km reanalysis grid (Day 004). Before comparing places, correct for who did the measuring.",
      caveat: "Each day uses different places, years, and sources, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "El invierno es el hilo común, y está perdiendo filo",
      conclusion: "Tres de los cuatro días dependen del frío: los cristales de hielo que forman los pilares de luz (Día 003), el hielo del lago que atrapa las burbujas de metano en el Lago Abraham (Día 004) y las noches oscuras de invierno en que más se reportan luciérnagas (Día 002). Juntos apuntan en la misma dirección: los días muy fríos que necesitan estos fenómenos son cada vez menos. En el Lago Abraham, los días de invierno tan fríos como una noche típica de pilares de luz bajaron de 10.7 a 8.3 por invierno entre 1951–1980 y 1996–2025.",
      coldTitle: "El frío detrás del espectáculo",
      cold: "Las fotos de pilares de luz del Día 003 se tomaron a una mediana de −19.4 °C. En el Lago Abraham, los días de invierno con una media así de fría bajaron de 10.7 a 8.3 por invierno, y los días de −15 °C o menos de 26.8 a 20.8 al año, mientras los inviernos se calentaron +0.25 °C por década. Es una referencia aproximada: solo 6 fotos de pilares tienen hora y clima, y son lecturas por hora.",
      seasonsTitle: "Las temporadas también mueven a la gente",
      seasons: "En Calexico West la espera es más larga en abril, marzo y diciembre (unos 70 minutos en promedio de día) y más corta en octubre; East está más tranquilo en julio y agosto. Los reportes de luciérnagas llegan a su máximo en el invierno del hemisferio sur cuando se quita el efecto del esfuerzo de observación. Estos ciclos humanos probablemente siguen las vacaciones y los calendarios escolares más que el clima, algo que estos días no comprueban.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos sin ajustar de luciérnagas favorecían a Wellington hasta dividirlos entre el esfuerzo de iNaturalist, que puso primero a West Coast (Día 002). El 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003). Las esperas de CBP son estimaciones de oficiales (Día 001), y el hielo de Abraham es una estimación de modelo con lecturas de satélite y un reanálisis de 25 km (Día 004). Antes de comparar lugares, hay que corregir por quién midió.",
      caveat: "Cada día usa lugares, años y fuentes distintos, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "L'hiver est le fil conducteur, et il perd de son mordant",
      conclusion: "Trois des quatre jours dépendent du froid : les cristaux de glace qui créent les piliers lumineux (jour 003), la glace du lac qui piège les bulles de méthane au lac Abraham (jour 004) et les soirées sombres d'hiver où les vers luisants sont le plus signalés (jour 002). Ensemble, ils vont dans le même sens : les jours très froids dont ces phénomènes ont besoin se raréfient. Au lac Abraham, les jours d'hiver aussi froids qu'une nuit typique de piliers lumineux sont passés de 10,7 à 8,3 par hiver entre 1951–1980 et 1996–2025.",
      coldTitle: "Le froid derrière le spectacle",
      cold: "Les photos de piliers lumineux du jour 003 ont été prises à une médiane de −19,4 °C. Au lac Abraham, les jours d'hiver à moyenne journalière aussi froide sont passés de 10,7 à 8,3 par hiver, et les jours à −15 °C ou moins de 26,8 à 20,8 par an, tandis que les hivers se réchauffaient de +0,25 °C par décennie. Repère approximatif : seules 6 photos de piliers ont une heure et une météo, et ce sont des valeurs horaires.",
      seasonsTitle: "Les saisons rythment aussi les gens",
      seasons: "À Calexico West, l'attente est la plus longue en avril, mars et décembre (environ 70 minutes en moyenne de jour) et la plus courte en octobre ; East est le plus calme en juillet et août. Les signalements de vers luisants culminent pendant l'hiver austral une fois l'effort d'observation retiré. Ces cycles humains suivent sans doute les vacances et les calendriers scolaires plus que la météo, ce que ces jours ne testent pas.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs bruts de vers luisants favorisaient Wellington jusqu'à leur division par l'effort iNaturalist, qui place la West Coast en tête (jour 002). 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003). Les attentes de la CBP sont des estimations d'agents (jour 001), et la glace d'Abraham est une estimation de modèle à partir de mesures satellite et d'une réanalyse à 25 km (jour 004). Avant de comparer des lieux, il faut corriger selon qui a mesuré.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "L'inverno è il filo comune, e sta perdendo forza",
      conclusion: "Tre dei quattro giorni dipendono dal freddo: i cristalli di ghiaccio che creano i pilastri di luce (giorno 003), il ghiaccio del lago che intrappola le bolle di metano al lago Abraham (giorno 004) e le sere buie d'inverno in cui le lucciole vengono segnalate di più (giorno 002). Insieme indicano la stessa direzione: i giorni molto freddi di cui hanno bisogno questi fenomeni stanno diventando più rari. Al lago Abraham, i giorni d'inverno freddi come una tipica notte di pilastri di luce sono scesi da 10,7 a 8,3 per inverno tra il 1951–1980 e il 1996–2025.",
      coldTitle: "Il freddo dietro lo spettacolo",
      cold: "Le foto di pilastri di luce del giorno 003 sono state scattate a una mediana di −19,4 °C. Al lago Abraham, i giorni d'inverno con una media giornaliera così fredda sono scesi da 10,7 a 8,3 per inverno, e quelli a −15 °C o meno da 26,8 a 20,8 all'anno, mentre gli inverni si sono scaldati di +0,25 °C per decennio. Riferimento approssimativo: solo 6 foto di pilastri hanno ora e meteo, e sono valori orari.",
      seasonsTitle: "Le stagioni muovono anche le persone",
      seasons: "A Calexico West l'attesa è più lunga ad aprile, marzo e dicembre (circa 70 minuti in media di giorno) e più breve a ottobre; East è più tranquillo a luglio e agosto. Le segnalazioni di lucciole hanno il picco nell'inverno australe una volta tolto l'effetto dello sforzo di osservazione. Questi cicli umani seguono probabilmente vacanze e calendari scolastici più del meteo, cosa che questi giorni non verificano.",
      observersTitle: "Ogni insieme di dati è anche una mappa di chi osserva",
      observers: "I conteggi grezzi di lucciole favorivano Wellington finché non sono stati divisi per lo sforzo su iNaturalist, che ha messo al primo posto la West Coast (giorno 002). Il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003). Le attese della CBP sono stime degli agenti (giorno 001) e il ghiaccio di Abraham è una stima di modello da letture satellitari e una rianalisi a 25 km (giorno 004). Prima di confrontare luoghi, bisogna correggere per chi ha misurato.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi: questi collegamenti sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    ja: {
      eyebrow: "日々をつなぐ · 第{day}日まで",
      title: "共通する糸は冬、そしてその厳しさは薄れつつある",
      conclusion: "4日のうち3日は寒さに関わっています。光柱をつくる氷晶（第003日）、アブラハム湖でメタンの泡を閉じ込める湖氷（第004日）、そしてツチボタルの報告が増える暗い冬の夕方（第002日）です。合わせると同じ方向が見えます。こうした現象に必要なとても寒い日が減っているのです。アブラハム湖では、典型的な光柱の夜と同じくらい寒い冬の日が、1951〜1980年の1冬あたり10.7日から1996〜2025年には8.3日に減りました。",
      coldTitle: "絶景を支える寒さ",
      cold: "第003日の光柱の写真は、中央値−19.4 °Cで撮影されていました。アブラハム湖では、日平均がそれほど寒い冬の日が1冬あたり10.7日から8.3日に、−15 °C以下の日が年26.8日から20.8日に減り、冬は10年あたり+0.25 °C暖かくなりました。あくまで目安で、時刻と気象がわかる光柱の写真は6枚だけ、しかも1時間ごとの値です。",
      seasonsTitle: "季節は人も動かす",
      seasons: "カレキシコ・ウエストの待ち時間は4月・3月・12月に最も長く（日中平均で約70分）、10月に最も短くなります。イーストは7〜8月が最も空いています。ツチボタルの報告は、観察努力量の影響を除くと南半球の冬にピークを迎えます。こうした人の周期は天気よりも休暇や学校の暦に沿っていると考えられますが、これらの日では検証していません。",
      observersTitle: "どのデータも、観察した人の地図でもある",
      observers: "ツチボタルの生の記録数はウェリントンに偏っていましたが、iNaturalistの観察努力量で割るとウェストコーストが首位になりました（第002日）。位置のわかるハロ写真の78%はヨーロッパと北米からです（第003日）。CBPの待ち時間は職員の推定（第001日）、アブラハム湖の氷は衛星観測と25 kmの再解析によるモデル推定です（第004日）。場所を比べる前に、誰が測ったかを補正する必要があります。",
      caveat: "日ごとに場所・年・出典が異なるため、これらのつながりは検討すべきパターンであり、証明ではありません。",
      dataTag: "データより", hypTag: "仮説", day: "第{n}日", readMore: "ラボでつながりを見る",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
