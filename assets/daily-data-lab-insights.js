// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-23):
// - Household food waste in the countries of earlier days' places (Day 006, UNEP Food Waste Index Report 2024,
//   Annex 3, data/day-006-food-waste/day-006.json and raw/day-006-food-waste/country.parquet): Mexico 105 kg/cap
//   (medium confidence) and United States 73 (high) for the Mexicali–Calexico crossing (Day 001); Canada 79 (high)
//   for Abraham Lake (Day 004); New Zealand 61 (high) for Waitomo (Day 002).
// - Cold vs heat: CCKP CRU TS 4.08 mean annual temperature 1991–2020: Canada −4.1 °C, Mexico 21.4 °C. Across the 100
//   most populous countries, Pearson r between temperature and household kg/cap = 0.23 (all 100) and 0.10 (45 measured,
//   high or medium confidence). Light-pillar photos (Day 003) median −19.4 °C; Abraham Lake winters +0.25 °C per decade (Day 004).
// - Observers: 11 of 228 countries have a high-confidence household estimate and 55 medium (Day 006); UNEP's low-income
//   household extrapolation uses six measured low-income countries plus lower-middle-income estimates (FWI 2024, ch. 2). Earlier days: glowworm top region
//   changed after dividing by iNaturalist effort (Day 002); 78% of located halo photos from Europe and North America
//   (Day 003); living languages with a grammar: Papunesia 25% vs South America 66% (Day 005).
export const LAB_INSIGHT = {
  throughDay: 6,
  days: { places: [1, 2, 4, 6], cold: [3, 4, 6], observers: [2, 3, 5, 6] },
  threads: [
    { id: "places", tags: ["data"] },
    { id: "cold", tags: ["data", "hyp"] },
    { id: "observers", tags: ["data"] },
  ],
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "What we know depends on who measured it",
      conclusion: "Day 006 puts a number on the lab's places: a person in Mexico wastes 105 kg of food at home a year, across the border in the United States 73 kg, in Canada 79 and in New Zealand 61. Like the glowworms, halos, and grammars of earlier days, those numbers are only as good as the measuring: of 228 countries, 11 have a high-confidence estimate, and most of the rest are copied from neighbours.",
      placesTitle: "Food waste at the lab's places",
      places: "At the Mexicali–Calexico crossing (Day 001), the two sides differ by 32 kg per person a year at home: Mexico 105 kg, the USA 73. Near Abraham Lake (Day 004), Canada wastes 79 kg; near the Waitomo caves (Day 002), New Zealand 61. All three rich countries are rated high confidence; Mexico's figure is medium.",
      coldTitle: "Cold places, warm kitchens",
      cold: "The lab's coldest places (Days 003–004) sit in a country averaging −4.1 °C that still wastes 79 kg per person at home, while Mexico, at 21.4 °C, wastes 105. Across 100 countries, warmth and household waste correlate weakly (r = 0.23), and only r = 0.10 with measured estimates. Faster spoilage in heat is a hypothesis this lab does not test.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Glowworm counts changed once divided by observer effort (Day 002); 78% of located halo photos come from Europe and North America (Day 003); 66% of living languages in South America have a grammar but 25% in Papunesia (Day 005). Food waste repeats the pattern: UNEP extrapolates low-income homes from just six measured low-income countries plus lower-middle-income data, and only 11 of 228 countries have a high-confidence household estimate (Day 006).",
      caveat: "Each day uses different places, years, and sources; country averages say nothing about a single city or household, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Lo que sabemos depende de quién lo midió",
      conclusion: "El Día 006 pone una cifra a los lugares del Lab: una persona en México desperdicia 105 kg de comida en casa al año; del otro lado de la frontera, en Estados Unidos, 73 kg; en Canadá, 79, y en Nueva Zelanda, 61. Como las luciérnagas, los halos y las gramáticas de días anteriores, esas cifras valen lo que vale la medición: de 228 países, 11 tienen una estimación de confianza alta y la mayoría del resto se copia de sus vecinos.",
      placesTitle: "Desperdicio de alimentos en los lugares del Lab",
      places: "En el cruce Mexicali–Calexico (Día 001), los dos lados difieren en 32 kg por persona al año en casa: México 105 kg, Estados Unidos 73. Cerca del Lago Abraham (Día 004), Canadá desperdicia 79 kg; cerca de las cuevas de Waitomo (Día 002), Nueva Zelanda 61. Los tres países ricos tienen confianza alta; la cifra de México, media.",
      coldTitle: "Lugares fríos, cocinas cálidas",
      cold: "Los lugares más fríos del Lab (Días 003–004) están en un país con una media de −4.1 °C que aun así desperdicia 79 kg por persona en casa, mientras México, a 21.4 °C, desperdicia 105. En 100 países, el calor y el desperdicio en casa se correlacionan débilmente (r = 0.23), y solo r = 0.10 con estimaciones medidas. Que el calor eche a perder la comida más rápido es una hipótesis que el Lab no comprueba.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos de luciérnagas cambiaron al dividirlos entre el esfuerzo de observación (Día 002); el 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003); el 66% de las lenguas vivas de Sudamérica tiene gramática, pero solo el 25% en Papunesia (Día 005). El desperdicio repite el patrón: UNEP extrapola los hogares de ingreso bajo a partir de solo seis países de ingreso bajo medidos más datos de ingreso mediano bajo, y solo 11 de 228 países tienen una estimación de hogares de confianza alta (Día 006).",
      caveat: "Cada día usa lugares, años y fuentes distintos; los promedios por país no dicen nada de una ciudad o un hogar en particular, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Ce que l'on sait dépend de qui l'a mesuré",
      conclusion: "Le jour 006 chiffre les lieux du lab : une personne au Mexique gaspille 105 kg de nourriture à la maison par an, de l'autre côté de la frontière aux États-Unis 73 kg, au Canada 79 et en Nouvelle-Zélande 61. Comme les vers luisants, les halos et les grammaires des jours précédents, ces chiffres ne valent que ce que vaut la mesure : sur 228 pays, 11 ont une estimation de confiance élevée, et la plupart des autres sont copiés sur leurs voisins.",
      placesTitle: "Le gaspillage alimentaire aux lieux du lab",
      places: "Au passage Mexicali–Calexico (jour 001), les deux côtés diffèrent de 32 kg par personne et par an à la maison : Mexique 105 kg, États-Unis 73. Près du lac Abraham (jour 004), le Canada gaspille 79 kg ; près des grottes de Waitomo (jour 002), la Nouvelle-Zélande 61. Les trois pays riches ont une confiance élevée ; le chiffre mexicain, moyenne.",
      coldTitle: "Lieux froids, cuisines chaudes",
      cold: "Les lieux les plus froids du lab (jours 003–004) sont dans un pays à −4,1 °C de moyenne qui gaspille pourtant 79 kg par personne à la maison, tandis que le Mexique, à 21,4 °C, en gaspille 105. Sur 100 pays, chaleur et gaspillage des ménages sont faiblement corrélés (r = 0,23), et seulement r = 0,10 avec les estimations mesurées. Que la chaleur gâte plus vite les aliments est une hypothèse que le lab ne teste pas.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs de vers luisants ont changé une fois divisés par l'effort d'observation (jour 002) ; 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003) ; 66 % des langues vivantes d'Amérique du Sud ont une grammaire, contre 25 % en Papunésie (jour 005). Le gaspillage répète le motif : le PNUE extrapole les ménages des pays à faible revenu à partir de six pays mesurés seulement, plus des données de pays à revenu intermédiaire inférieur, et seuls 11 pays sur 228 ont une estimation ménages de confiance élevée (jour 006).",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents ; une moyenne nationale ne dit rien d'une ville ou d'un foyer : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Ciò che sappiamo dipende da chi l'ha misurato",
      conclusion: "Il giorno 006 dà un numero ai luoghi del lab: una persona in Messico spreca in casa 105 kg di cibo all'anno, oltre il confine negli Stati Uniti 73 kg, in Canada 79 e in Nuova Zelanda 61. Come le lucciole, gli aloni e le grammatiche dei giorni precedenti, questi numeri valgono quanto la misura: su 228 paesi, 11 hanno una stima ad alta affidabilità e la maggior parte degli altri è copiata dai vicini.",
      placesTitle: "Lo spreco alimentare nei luoghi del lab",
      places: "Al valico Mexicali–Calexico (giorno 001), i due lati differiscono di 32 kg a persona all'anno in casa: Messico 105 kg, Stati Uniti 73. Vicino al lago Abraham (giorno 004), il Canada spreca 79 kg; vicino alle grotte di Waitomo (giorno 002), la Nuova Zelanda 61. I tre paesi ricchi hanno affidabilità alta; il dato messicano, media.",
      coldTitle: "Luoghi freddi, cucine calde",
      cold: "I luoghi più freddi del lab (giorni 003–004) sono in un paese con una media di −4,1 °C che spreca comunque 79 kg a persona in casa, mentre il Messico, a 21,4 °C, ne spreca 105. Su 100 paesi, caldo e spreco domestico sono correlati debolmente (r = 0,23), e solo r = 0,10 con le stime misurate. Che il caldo faccia deperire prima il cibo è un'ipotesi che il lab non verifica.",
      observersTitle: "Ogni insieme di dati è anche una mappa di chi osserva",
      observers: "I conteggi di lucciole sono cambiati una volta divisi per lo sforzo di osservazione (giorno 002); il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003); il 66% delle lingue vive sudamericane ha una grammatica, ma solo il 25% in Papunesia (giorno 005). Lo spreco ripete lo schema: l'UNEP estrapola le famiglie dei paesi a basso reddito da soli sei paesi misurati più dati dei paesi a reddito medio-basso, e solo 11 paesi su 228 hanno una stima domestica ad alta affidabilità (giorno 006).",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi; una media nazionale non dice nulla di una città o di una famiglia: questi collegamenti sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    pt: {
      eyebrow: "Conectando os dias · até o dia {day}",
      title: "O que sabemos depende de quem mediu",
      conclusion: "O Dia 006 dá um número aos lugares do laboratório: uma pessoa no México desperdiça 105 kg de comida em casa por ano; do outro lado da fronteira, nos Estados Unidos, 73 kg; no Canadá, 79; e na Nova Zelândia, 61. Como os vaga-lumes, os halos e as gramáticas dos dias anteriores, esses números valem o que vale a medição: de 228 países, 11 têm estimativa de confiança alta, e a maioria dos outros é copiada dos vizinhos.",
      placesTitle: "Desperdício de alimentos nos lugares do laboratório",
      places: "Na travessia Mexicali–Calexico (Dia 001), os dois lados diferem em 32 kg por pessoa por ano em casa: México 105 kg, EUA 73. Perto do Lago Abraham (Dia 004), o Canadá desperdiça 79 kg; perto das cavernas de Waitomo (Dia 002), a Nova Zelândia 61. Os três países ricos têm confiança alta; o número do México, média.",
      coldTitle: "Lugares frios, cozinhas quentes",
      cold: "Os lugares mais frios do laboratório (Dias 003–004) ficam num país com média de −4,1 °C que ainda desperdiça 79 kg por pessoa em casa, enquanto o México, a 21,4 °C, desperdiça 105. Em 100 países, calor e desperdício doméstico se correlacionam fracamente (r = 0,23), e só r = 0,10 com estimativas medidas. Que o calor estrague a comida mais rápido é uma hipótese que o laboratório não testa.",
      observersTitle: "Cada conjunto de dados também é um mapa de seus observadores",
      observers: "As contagens de vaga-lumes mudaram ao serem divididas pelo esforço de observação (Dia 002); 78% das fotos de halos localizadas vêm da Europa e da América do Norte (Dia 003); 66% das línguas vivas sul-americanas têm gramática, mas só 25% na Papunésia (Dia 005). O desperdício repete o padrão: o PNUMA extrapola os domicílios de renda baixa a partir de só seis países medidos mais dados de renda média-baixa, e só 11 de 228 países têm estimativa domiciliar de confiança alta (Dia 006).",
      caveat: "Cada dia usa lugares, anos e fontes diferentes; médias nacionais não dizem nada sobre uma cidade ou um domicílio, então essas ligações são padrões a explorar, não provas.",
      dataTag: "A partir dos dados", hypTag: "Hipótese", day: "Dia {n}", readMore: "Veja as conexões no laboratório",
    },
    ja: {
      eyebrow: "日々をつなぐ · 第{day}日まで",
      title: "わかることは、誰が測ったかで決まる",
      conclusion: "第006日はラボの場所に数字を与えます。メキシコでは1人が家庭で年105 kgの食品を捨て、国境の向こうの米国では73 kg、カナダでは79 kg、ニュージーランドでは61 kgです。これまでのツチボタル、ハロ、文法書と同じく、これらの数字は測定の質しだいです。228か国のうち信頼度の高い推計があるのは11か国で、残りの多くは近隣国から写した値です。",
      placesTitle: "ラボの場所での食品廃棄",
      places: "メヒカリ–カレキシコの国境（第001日）では、両側で家庭の1人あたり年間廃棄が32 kg違います。メキシコ105 kg、米国73 kg。アブラハム湖（第004日）のあるカナダは79 kg、ワイトモ洞窟（第002日）のあるニュージーランドは61 kg。3つの豊かな国は信頼度が高く、メキシコは中です。",
      coldTitle: "寒い土地、暖かい台所",
      cold: "ラボで最も寒い場所（第003〜004日）は年平均−4.1 °Cの国にありますが、家庭で1人あたり79 kgを捨てています。21.4 °Cのメキシコは105 kg。100か国では気温と家庭廃棄の相関は弱く（r = 0.23）、実測の推計だけではr = 0.10です。暑さで食品が早く傷むという説は、このラボでは検証していない仮説です。",
      observersTitle: "どのデータも、観察した人の地図でもある",
      observers: "ツチボタルの記録数は観察努力量で割ると変わり（第002日）、位置のわかるハロ写真の78%は欧州と北米から（第003日）、南米で話者のいる言語の66%に文法書がある一方パプネシアでは25%（第005日）。食品廃棄も同じで、UNEPは低所得国の家庭を、実測のある低所得国わずか6か国と下位中所得国のデータから外挿しており、家庭推計の信頼度が高いのは228か国中11か国だけです（第006日）。",
      caveat: "日ごとに場所・年・出典が異なり、国の平均は個々の都市や家庭については何も語りません。これらのつながりは検討すべきパターンであり、証明ではありません。",
      dataTag: "データより", hypTag: "仮説", day: "第{n}日", readMore: "ラボでつながりを見る",
    },
    zh: {
      eyebrow: "连接各天 · 截至第 {day} 天",
      title: "我们知道什么，取决于谁去测量",
      conclusion: "第 006 天为实验室的各个地点给出了数字：墨西哥人均每年在家浪费 105 公斤食物，边境另一侧的美国为 73 公斤，加拿大 79 公斤，新西兰 61 公斤。和前几天的萤火虫、光晕与语法一样，这些数字的好坏取决于测量：228 个国家中只有 11 个有高置信度估计，其余多数是从邻国照搬的。",
      placesTitle: "实验室各地点的食物浪费",
      places: "在墨西卡利–卡莱克西科口岸（第 001 天），两侧家庭人均每年浪费相差 32 公斤：墨西哥 105 公斤，美国 73 公斤。亚伯拉罕湖（第 004 天）所在的加拿大浪费 79 公斤；怀托摩洞穴（第 002 天）所在的新西兰为 61 公斤。三个富裕国家的数据均为高置信度，墨西哥为中等。",
      coldTitle: "寒冷的地方，温暖的厨房",
      cold: "实验室最冷的地点（第 003–004 天）位于年均气温 −4.1 °C 的国家，但家庭人均仍浪费 79 公斤；而 21.4 °C 的墨西哥浪费 105 公斤。在 100 个国家中，气温与家庭浪费只有弱相关（r = 0.23），仅用实测估计时 r = 0.10。炎热使食物更快变质只是本实验室未检验的假设。",
      observersTitle: "每个数据集也是观察者的地图",
      observers: "萤火虫计数在除以观察努力后发生变化（第 002 天）；78% 有定位的光晕照片来自欧洲和北美（第 003 天）；南美 66% 的现存语言有语法书，巴布尼西亚只有 25%（第 005 天）。食物浪费重复了这一模式：UNEP 仅根据六个实测低收入国家加上中低收入国家的数据来外推低收入国家的家庭浪费，228 个国家中只有 11 个拥有高置信度的家庭估计（第 006 天）。",
      caveat: "每天使用不同的地点、年份和来源；国家平均值不能说明某个城市或家庭，因此这些联系是值得探索的模式，而非证据。",
      dataTag: "来自数据", hypTag: "假设", day: "第 {n} 天", readMore: "在实验室查看这些联系",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
