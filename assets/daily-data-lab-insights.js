// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-22):
// - Languages near earlier days' places (Day 005): Glottolog 5.4 spoken L1 languages whose Glottolog point lies within
//   300 km (haversine) of Mexicali (32.62, −115.45; Day 001), Waitomo (−38.26, 175.10; Day 002), and Abraham Lake
//   (52.31, −116.33; Day 004), from raw/day-005-endangered-languages/*.parquet: 17 languages, 0 "not endangered",
//   12 endangered (AES 2–5), 5 extinct. Mexicali 13 (8 endangered, 5 extinct; Cocopa nearest at 63 km);
//   Abraham 3 (Stoney shifting; Tsuut'ina "Sarsi" and Shuswap nearly extinct); Waitomo 1 (Māori, shifting).
// - Light-pillar photos (Day 003): median ERA5 hourly temperature −19.4 °C, 6 photos with a time and weather.
// - Abraham Lake (Day 004): Dec–Feb days with a daily mean ≤ −19.4 °C: 10.7 per winter in 1951–1980, 8.3 in 1996–2025;
//   winter trend +0.25 °C per decade (raw/day-004-abraham-lake/weather/7243.json).
// - Observers: glowworm top region Wellington raw vs West Coast effort-adjusted (Day 002); 78% of located halo photos
//   from Europe and North America (Day 003); living languages with a grammar (MED long grammar or grammar):
//   Papunesia 24.6% vs South America 66.0% and Australia 70.3%; Grambank codes 31% of all 7,685 languages (Day 005).
export const LAB_INSIGHT = {
  throughDay: 5,
  days: { places: [1, 2, 4, 5], cold: [3, 4], observers: [2, 3, 5] },
  threads: [
    { id: "places", tags: ["data"] },
    { id: "cold", tags: ["data"] },
    { id: "observers", tags: ["data", "hyp"] },
  ],
  text: {
    pt: {
      "eyebrow": "Conectando os dias · até o dia {day}",
      "title": "Todos os lugares do laboratório até agora estão perdendo alguma coisa",
      "conclusion": "Os locais dos primeiros quatro dias compartilham mais que frio. Dos 17 locais Glottolog em um raio de 300 km de Mexicali (Dia 001), Waitomo (Dia 002) e Abraham Lake (Dia 004), nenhum é classificado como seguro: 12 estão em perigo e 5 estão extintos (Dia 005). Abraham Lake também está perdendo seus dias mais frios de inverno, o tipo de luz que os pilares de luz precisam (Dias 003–004). Ambas as perdas são medidas de forma desigual, por pessoas que escolhem onde procurar.",
      "placesTitle": "Línguas ameaçadas nos locais do laboratório",
      "places": "A 300 km da travessia Mexicali-Calexico, Glottolog lista 13 línguas, incluindo Cocopa a 63 km de distância e Kumeyaay, Paipai e Kiliwa: 8 estão ameaçadas de extinção e 5 extintas. Perto do Lago Abraham, Stoney está mudando e Tsuut'ina e Shuswap estão quase extintos. Perto das cavernas de Waitomo, Māori é classificado como mutável, embora tenha uma gramática longa.",
      "coldTitle": "O frio por trás do espetáculo",
      "cold": "As fotos do pilar de luz do dia 003 foram tiradas a uma temperatura média de -19,4 °C. Em Abraham Lake, os dias de inverno com média diária de frio caíram de 10,7 para 8,3 por inverno, e os dias de -15 °C ou mais frios de 26,8 para 20,8 por ano, enquanto os invernos aqueceram +0,25 °C por década. Um parâmetro aproximado: apenas 6 fotos de pilares têm hora e clima, e essas são leituras de hora em hora.",
      "observersTitle": "Cada conjunto de dados também é um mapa de seus observadores",
      "observers": "As contagens brutas de pirilampos favoreceram Wellington até serem divididas pelo esforço iNaturalist (Dia 002), e 78% das fotos de halo localizadas vêm da Europa e América do Norte (Dia 003). As gramáticas seguem os linguistas da mesma maneira: 66% das línguas vivas na América do Sul têm gramática, mas apenas 25% na Papunésia (Dia 005). Se isto reflecte acesso, financiamento ou história é uma hipótese que hoje em dia não se testa.",
      "caveat": "Cada dia usa lugares, anos e fontes diferentes, e um círculo de 300 km em torno de um ponto Glottolog é um parâmetro aproximado, portanto, essas ligações são padrões que vale a pena explorar, e não uma prova.",
      "dataTag": "A partir dos dados",
      "hypTag": "Hipótese",
      "day": "Dia {n}",
      "readMore": "Veja as conexões no laboratório"
    },
    zh: {
      "eyebrow": "连接日子·通过日 {day}",
      "title": "到目前为止，实验室的每个地方都在失去一些东西",
      "conclusion": "前四天的地方共享的不仅仅是寒冷。在 Glottolog 距墨西卡利（第 001 天）、怀托摩（第 002 天）和亚伯拉罕湖（第 004 天）300 公里范围内的 17 种语言中，没有一种语言被评为安全：12 种濒临灭绝，5 种灭绝（第 005 天）。亚伯拉罕湖也正在失去光柱所需要的最冷的冬季（第 003-004 天）。对于这两种损失的衡量，根据人们选择的去处而有所不同。",
      "placesTitle": "实验室周围的濒危语言",
      "places": "Glottolog 在墨西卡利-卡莱克西科过境点 300 公里范围内列出了 13 种语言，包括 63 公里外的 Cocopa 语言以及 Kumeyaay、Paipai 和 Kiliwa：8 种语言濒临灭绝，5 种语言灭绝。在亚伯拉罕湖附近，斯托尼正在移动，而苏蒂纳和舒斯瓦普几乎灭绝。在怀托摩洞穴附近，毛利语虽然语法很长，但仍被评定为变动语。",
      "coldTitle": "奇观背后的寒冷",
      "cold": "第 003 天的光柱照片是在中值 -19.4 °C 下拍摄的。在亚伯拉罕湖，冬季每日平均寒冷天数从每年 10.7 下降到 8.3，-15°C 或更低的天数从每年 26.8 下降到 20.8，而冬季每十年变暖 0.25°C。粗略的标准是：只有 6 张柱子照片有时间和天气，而且是每小时的读数。",
      "observersTitle": "每个数据集也是其观察者的地图",
      "observers": "原始萤火虫计数对惠灵顿有利，直到除以 iNaturalist 工作量（第 002 天），并且 78% 的定位光环照片来自欧洲和北美（第 003 天）。语法也以同样的方式遵循语言学家的说法：南美洲 66% 的现有语言都有语法，但巴布尼西亚只有 25%（第 005 天）。这是否反映了准入、资金或历史只是一个假设，目前还没有得到检验。",
      "caveat": "每天使用不同的地点、年份和来源，围绕 Glottolog 点 300 公里的圆圈是一个粗略的尺度，因此这些链接是值得探索的模式，而不是证明。",
      "dataTag": "从数据来看",
      "hypTag": "假设",
      "day": "日 {n}",
      "readMore": "查看实验室中的连接"
    },
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "Every place in the lab so far is losing something",
      conclusion: "The places of the first four days share more than cold. Of the 17 languages Glottolog places within 300 km of Mexicali (Day 001), Waitomo (Day 002), and Abraham Lake (Day 004), none is rated safe: 12 are endangered and 5 are extinct (Day 005). Abraham Lake is also losing its coldest winter days, the kind light pillars need (Days 003–004). Both losses are measured unevenly, by people who chose where to look.",
      placesTitle: "Endangered languages around the lab's places",
      places: "Within 300 km of the Mexicali–Calexico crossing, Glottolog lists 13 languages, including Cocopa 63 km away and Kumeyaay, Paipai, and Kiliwa: 8 are endangered and 5 extinct. Near Abraham Lake, Stoney is shifting and Tsuut'ina and Shuswap are nearly extinct. Near the Waitomo caves, Māori is rated shifting, though it has a long grammar.",
      coldTitle: "The cold behind the spectacle",
      cold: "Day 003's light-pillar photos were taken at a median −19.4 °C. At Abraham Lake, winter days with a daily mean that cold dropped from 10.7 to 8.3 per winter, and days at −15 °C or colder from 26.8 to 20.8 a year, while winters warmed +0.25 °C per decade. A rough yardstick: only 6 pillar photos have a time and weather, and those are hourly readings.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Raw glowworm counts favored Wellington until they were divided by iNaturalist effort (Day 002), and 78% of located halo photos come from Europe and North America (Day 003). Grammars follow linguists the same way: 66% of living languages in South America have a grammar, but only 25% in Papunesia (Day 005). Whether this reflects access, funding, or history is a hypothesis these days do not test.",
      caveat: "Each day uses different places, years, and sources, and a 300 km circle around a Glottolog point is a rough yardstick, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Cada lugar del Lab hasta ahora está perdiendo algo",
      conclusion: "Los lugares de los primeros cuatro días comparten algo más que el frío. De las 17 lenguas que Glottolog ubica a menos de 300 km de Mexicali (Día 001), Waitomo (Día 002) y el Lago Abraham (Día 004), ninguna está fuera de peligro: 12 están en peligro y 5 extintas (Día 005). El Lago Abraham también está perdiendo sus días de invierno más fríos, los que necesitan los pilares de luz (Días 003–004). Ambas pérdidas se miden de forma desigual, por personas que eligieron dónde mirar.",
      placesTitle: "Lenguas en peligro alrededor de los lugares del Lab",
      places: "A menos de 300 km del cruce Mexicali–Calexico, Glottolog registra 13 lenguas, entre ellas el cucapá a 63 km y el kumiai, el pai pai y el kiliwa: 8 están en peligro y 5 extintas. Cerca del Lago Abraham, el stoney está en desplazamiento y el tsuut'ina y el shuswap están casi extintos. Cerca de las cuevas de Waitomo, el maorí está en desplazamiento, aunque tiene una gramática extensa.",
      coldTitle: "El frío detrás del espectáculo",
      cold: "Las fotos de pilares de luz del Día 003 se tomaron a una mediana de −19.4 °C. En el Lago Abraham, los días de invierno con una media así de fría bajaron de 10.7 a 8.3 por invierno, y los días de −15 °C o menos de 26.8 a 20.8 al año, mientras los inviernos se calentaron +0.25 °C por década. Es una referencia aproximada: solo 6 fotos de pilares tienen hora y clima, y son lecturas por hora.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos sin ajustar de luciérnagas favorecían a Wellington hasta dividirlos entre el esfuerzo de iNaturalist (Día 002), y el 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003). Las gramáticas siguen a los lingüistas de la misma manera: el 66% de las lenguas vivas de Sudamérica tiene una gramática, pero solo el 25% en Papunesia (Día 005). Si esto refleja acceso, financiamiento o historia es una hipótesis que estos días no comprueban.",
      caveat: "Cada día usa lugares, años y fuentes distintos, y un círculo de 300 km alrededor de un punto de Glottolog es una referencia aproximada, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Chaque lieu du lab, jusqu'ici, perd quelque chose",
      conclusion: "Les lieux des quatre premiers jours partagent plus que le froid. Sur les 17 langues que Glottolog situe à moins de 300 km de Mexicali (jour 001), de Waitomo (jour 002) et du lac Abraham (jour 004), aucune n'est classée hors de danger : 12 sont en danger et 5 éteintes (jour 005). Le lac Abraham perd aussi ses jours d'hiver les plus froids, ceux dont les piliers lumineux ont besoin (jours 003–004). Les deux pertes sont mesurées de façon inégale, par des gens qui ont choisi où regarder.",
      placesTitle: "Des langues en danger autour des lieux du lab",
      places: "À moins de 300 km du passage Mexicali–Calexico, Glottolog recense 13 langues, dont le cocopa à 63 km, le kumeyaay, le paipai et le kiliwa : 8 sont en danger et 5 éteintes. Près du lac Abraham, le stoney est en recul, le tsuut'ina et le shuswap presque éteints. Près des grottes de Waitomo, le maori est classé en recul, bien qu'il dispose d'une grammaire longue.",
      coldTitle: "Le froid derrière le spectacle",
      cold: "Les photos de piliers lumineux du jour 003 ont été prises à une médiane de −19,4 °C. Au lac Abraham, les jours d'hiver à moyenne journalière aussi froide sont passés de 10,7 à 8,3 par hiver, et les jours à −15 °C ou moins de 26,8 à 20,8 par an, tandis que les hivers se réchauffaient de +0,25 °C par décennie. Repère approximatif : seules 6 photos de piliers ont une heure et une météo, et ce sont des valeurs horaires.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs bruts de vers luisants favorisaient Wellington jusqu'à leur division par l'effort iNaturalist (jour 002), et 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003). Les grammaires suivent les linguistes de la même façon : 66 % des langues vivantes d'Amérique du Sud ont une grammaire, contre 25 % en Papunésie (jour 005). Que cela tienne à l'accès, au financement ou à l'histoire est une hypothèse que ces jours ne testent pas.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents, et un cercle de 300 km autour d'un point Glottolog n'est qu'un repère approximatif : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Ogni luogo del lab, finora, sta perdendo qualcosa",
      conclusion: "I luoghi dei primi quattro giorni condividono più del freddo. Delle 17 lingue che Glottolog colloca entro 300 km da Mexicali (giorno 001), Waitomo (giorno 002) e il lago Abraham (giorno 004), nessuna è fuori pericolo: 12 sono in pericolo e 5 estinte (giorno 005). Il lago Abraham sta anche perdendo i suoi giorni d'inverno più freddi, quelli di cui hanno bisogno i pilastri di luce (giorni 003–004). Entrambe le perdite sono misurate in modo diseguale, da persone che hanno scelto dove guardare.",
      placesTitle: "Lingue in pericolo intorno ai luoghi del lab",
      places: "Entro 300 km dal valico Mexicali–Calexico, Glottolog elenca 13 lingue, tra cui il cocopa a 63 km, il kumeyaay, il paipai e il kiliwa: 8 sono in pericolo e 5 estinte. Vicino al lago Abraham, lo stoney è in regressione e il tsuut'ina e lo shuswap sono quasi estinti. Vicino alle grotte di Waitomo, il maori è classificato in regressione, pur avendo una grammatica estesa.",
      coldTitle: "Il freddo dietro lo spettacolo",
      cold: "Le foto di pilastri di luce del giorno 003 sono state scattate a una mediana di −19,4 °C. Al lago Abraham, i giorni d'inverno con una media giornaliera così fredda sono scesi da 10,7 a 8,3 per inverno, e quelli a −15 °C o meno da 26,8 a 20,8 all'anno, mentre gli inverni si sono scaldati di +0,25 °C per decennio. Riferimento approssimativo: solo 6 foto di pilastri hanno ora e meteo, e sono valori orari.",
      observersTitle: "Ogni insieme di dati è anche una mappa di chi osserva",
      observers: "I conteggi grezzi di lucciole favorivano Wellington finché non sono stati divisi per lo sforzo su iNaturalist (giorno 002), e il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003). Le grammatiche seguono i linguisti allo stesso modo: il 66% delle lingue vive del Sud America ha una grammatica, ma solo il 25% in Papunesia (giorno 005). Se ciò dipenda da accesso, finanziamenti o storia è un'ipotesi che questi giorni non verificano.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi, e un cerchio di 300 km attorno a un punto Glottolog è un riferimento approssimativo: questi collegamenti sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    ja: {
      eyebrow: "日々をつなぐ · 第{day}日まで",
      title: "ラボで訪れたどの場所も、何かを失いつつある",
      conclusion: "最初の4日間の場所に共通するのは寒さだけではありません。Glottologがメヒカリ（第001日）、ワイトモ（第002日）、アブラハム湖（第004日）から300 km以内に位置づける17言語のうち、危機にないと評価された言語はありません。12が危機言語、5が消滅言語です（第005日）。アブラハム湖では、光柱に必要なほど寒い冬の日も減っています（第003〜004日）。どちらの喪失も、どこを見るかを選んだ人々によって不均等に測られています。",
      placesTitle: "ラボの場所の周りにある危機言語",
      places: "メヒカリ–カレキシコの国境から300 km以内に、Glottologは13言語を挙げています。63 km先のココパ語、クメヤイ語、パイパイ語、キリワ語などで、8が危機、5が消滅です。アブラハム湖の近くではストーニー語が移行中、ツーティナ語とシュスワップ語がほぼ消滅。ワイトモ洞窟の近くではマオリ語が移行中と評価されていますが、長い文法書があります。",
      coldTitle: "絶景を支える寒さ",
      cold: "第003日の光柱の写真は、中央値−19.4 °Cで撮影されていました。アブラハム湖では、日平均がそれほど寒い冬の日が1冬あたり10.7日から8.3日に、−15 °C以下の日が年26.8日から20.8日に減り、冬は10年あたり+0.25 °C暖かくなりました。あくまで目安で、時刻と気象がわかる光柱の写真は6枚だけ、しかも1時間ごとの値です。",
      observersTitle: "どのデータも、観察した人の地図でもある",
      observers: "ツチボタルの生の記録数はウェリントンに偏っていましたが、iNaturalistの観察努力量で割ると変わりました（第002日）。位置のわかるハロ写真の78%はヨーロッパと北米からです（第003日）。文法書も同じように言語学者の行き先に従います。南アメリカでは話者のいる言語の66%に文法書がありますが、パプネシアでは25%だけです（第005日）。それがアクセス・資金・歴史のどれによるのかは、これらの日では検証していない仮説です。",
      caveat: "日ごとに場所・年・出典が異なり、Glottologの地点から半径300 kmという円は大まかな目安にすぎません。これらのつながりは検討すべきパターンであり、証明ではありません。",
      dataTag: "データより", hypTag: "仮説", day: "第{n}日", readMore: "ラボでつながりを見る",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
