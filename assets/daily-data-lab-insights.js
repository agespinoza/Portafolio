// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-28):
// - Spices (Day 011, data/day-011-spices/day-011.json; FAOSTAT QCL/TCL/TM bulk files, World Bank, UN M49): in 2024, 7 of
//   8 spice groups have an HHI of production above 2,500 (seed spices 6,267, cloves 5,734; black pepper 1,378); India grows
//   78.9% of seed spices and 53.3% of dry chillies, Indonesia 74.4% of cloves; pepper's top three growers held 79.4% in
//   1961 (India, Malaysia, Indonesia) and 55.0% in 2024 (Viet Nam, India, Brazil). 34.2% of 2024 spice tonnes are FAO
//   estimates or imputations (vanilla 71%); world exports and imports of the same spice differ by −6.3% to +8.7% in
//   tonnes; world vanilla exports are 146% of production. Mexico grew 16.8% of world vanilla in 1961 and 7.2% (510 t) in
//   2024, and reported 11.8 t of vanilla exports in 2024 (137.3 t in 2000).
// - Earlier days, from the previous insight (2026-11-27): 13 international centres deposited 54.7% of Svalbard's samples
//   (Day 008); 87 of 135 certified dark-sky places in Wikidata are in the United States, none in Mexico, and 58.3% of
//   Mexicans cannot see the Milky Way from home (Day 010); glowworm counts changed after dividing by iNaturalist effort
//   (Day 002); 11 of 228 countries have a high-confidence food-waste estimate (Day 006); UN and WHO life expectancies
//   differ by 1.4 years on average (Day 009); Arizona and northern Sonora report the same median limiting magnitude while
//   all certified places in that window are on the US side (Day 010).
export const LAB_INSIGHT = {
  throughDay: 11,
  days: { holders: [8, 10, 11], counting: [2, 6, 9, 11], mexico: [1, 10, 11] },
  threads: [
    { id: "holders", tags: ["data"] },
    { id: "counting", tags: ["data"] },
    { id: "mexico", tags: ["data", "hyp"] },
  ],
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "Few places hold what many share",
      conclusion: "Day 011 maps the world's spices: in 2024, seven of eight FAOSTAT spice groups are highly concentrated, and pepper's centre has moved from the old Spice Route coasts of India, Malaysia and Indonesia (79.4% of world output in 1961) to Viet Nam, India and Brazil (55.0%). Across the lab, things the world shares (seed collections, dark skies, spices) are held in a few places, and the numbers that describe them are partly estimates.",
      holdersTitle: "Concentrated holders",
      holders: "India grows 78.9% of seed spices and Indonesia 74.4% of cloves (Day 011); 13 international centres deposited 55% of Svalbard's seed samples (Day 008); 87 of the 135 certified dark-sky places in Wikidata are in the United States (Day 010). Black pepper is the exception: its supply became less concentrated since 1961 (HHI 2,422 → 1,378).",
      countingTitle: "Who counts, and how",
      counting: "34% of the world's spice tonnes in 2024 are FAO estimates or imputations (71% for vanilla), and countries' exports and imports of the same spice disagree by −6.3% to +8.7% (Day 011). The same caution ran through earlier days: glowworm counts changed once divided by observer effort (Day 002), 11 of 228 countries have a high-confidence food-waste estimate (Day 006), and UN and WHO life expectancies differ by 1.4 years (Day 009).",
      mexicoTitle: "Mexico in the margins",
      mexico: "Mexico grew 16.8% of the world's vanilla in 1961 and 7.2% in 2024, and reported only 11.8 t of vanilla exports (Day 011). It has no certified dark-sky place in Wikidata, although northern Sonora's skies match Arizona's (Day 010), and 58.3% of Mexicans cannot see the Milky Way from home. Whether this reflects reporting and certification or real loss is a hypothesis to test, not a finding.",
      caveat: "Each day uses different places, years, and sources; national totals say nothing about a single farm, street or person, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Pocos lugares guardan lo que muchos comparten",
      conclusion: "El Día 011 mapea las especias del mundo: en 2024, siete de los ocho grupos de especias de FAOSTAT están muy concentrados, y el centro de la pimienta se movió de las antiguas costas de la ruta de las especias, India, Malasia e Indonesia (79.4% de la producción mundial en 1961), a Vietnam, India y Brasil (55.0%). En todo el Lab, lo que el mundo comparte (colecciones de semillas, cielos oscuros, especias) lo guardan pocos lugares, y las cifras que lo describen son en parte estimaciones.",
      holdersTitle: "Pocos que concentran",
      holders: "India cultiva el 78.9% de las especias de semilla e Indonesia el 74.4% del clavo (Día 011); 13 centros internacionales depositaron el 55% de las muestras de semillas de Svalbard (Día 008); 87 de los 135 lugares de cielo oscuro certificados en Wikidata están en Estados Unidos (Día 010). La pimienta negra es la excepción: su oferta se volvió menos concentrada desde 1961 (IHH 2,422 → 1,378).",
      countingTitle: "Quién cuenta, y cómo",
      counting: "El 34% de las toneladas de especias del mundo en 2024 son estimaciones o imputaciones de la FAO (71% en la vainilla), y las exportaciones e importaciones de una misma especia no coinciden por entre −6.3% y +8.7% (Día 011). La misma cautela recorrió los días anteriores: los conteos de luciérnagas cambiaron al dividirlos entre el esfuerzo de observación (Día 002), 11 de 228 países tienen una estimación de desperdicio de alta confianza (Día 006) y la esperanza de vida de la ONU y la OMS difiere en 1.4 años (Día 009).",
      mexicoTitle: "México en los márgenes",
      mexico: "México cultivaba el 16.8% de la vainilla del mundo en 1961 y el 7.2% en 2024, y reportó solo 11.8 t de exportaciones de vainilla (Día 011). No tiene ningún lugar de cielo oscuro certificado en Wikidata, aunque los cielos del norte de Sonora igualan a los de Arizona (Día 010), y el 58.3% de los mexicanos no puede ver la Vía Láctea desde casa. Si esto refleja cómo se reporta y se certifica o una pérdida real es una hipótesis por probar, no un hallazgo.",
      caveat: "Cada día usa lugares, años y fuentes distintos; los totales nacionales no dicen nada de una parcela, una calle o una persona en particular, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Peu de lieux détiennent ce que beaucoup partagent",
      conclusion: "Le jour 011 cartographie les épices du monde : en 2024, sept des huit groupes d'épices FAOSTAT sont très concentrés, et le centre du poivre est passé des anciennes côtes de la route des épices, Inde, Malaisie et Indonésie (79,4 % de la production mondiale en 1961), au Viêt Nam, à l'Inde et au Brésil (55,0 %). Dans tout le lab, ce que le monde partage (collections de semences, ciels noirs, épices) est détenu par peu de lieux, et les chiffres qui le décrivent sont en partie des estimations.",
      holdersTitle: "Des détenteurs concentrés",
      holders: "L'Inde cultive 78,9 % des épices en graines et l'Indonésie 74,4 % du girofle (jour 011) ; 13 centres internationaux ont déposé 55 % des échantillons de semences de Svalbard (jour 008) ; 87 des 135 lieux de ciel étoilé certifiés dans Wikidata sont aux États-Unis (jour 010). Le poivre noir fait exception : son offre est devenue moins concentrée depuis 1961 (IHH 2 422 → 1 378).",
      countingTitle: "Qui compte, et comment",
      counting: "34 % des tonnes d'épices du monde en 2024 sont des estimations ou imputations de la FAO (71 % pour la vanille), et les exportations et importations d'une même épice divergent de −6,3 % à +8,7 % (jour 011). La même prudence traversait les jours précédents : les effectifs de vers luisants ont changé une fois divisés par l'effort d'observation (jour 002), 11 pays sur 228 ont une estimation du gaspillage de haute confiance (jour 006), et l'espérance de vie de l'ONU et de l'OMS diffère de 1,4 an (jour 009).",
      mexicoTitle: "Le Mexique en marge",
      mexico: "Le Mexique cultivait 16,8 % de la vanille mondiale en 1961 et 7,2 % en 2024, et n'a déclaré que 11,8 t d'exportations de vanille (jour 011). Il n'a aucun lieu de ciel étoilé certifié dans Wikidata, bien que le ciel du nord du Sonora égale celui de l'Arizona (jour 010), et 58,3 % des Mexicains ne voient pas la Voie lactée depuis chez eux. Savoir si cela reflète les déclarations et la certification ou une perte réelle est une hypothèse à tester, pas un résultat.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents ; les totaux nationaux ne disent rien d'une exploitation, d'une rue ou d'une personne : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Pochi luoghi custodiscono ciò che molti condividono",
      conclusion: "Il giorno 011 mappa le spezie del mondo: nel 2024 sette degli otto gruppi di spezie FAOSTAT sono molto concentrati, e il centro del pepe si è spostato dalle antiche coste della rotta delle spezie, India, Malesia e Indonesia (79,4% della produzione mondiale nel 1961), a Vietnam, India e Brasile (55,0%). In tutto il lab, ciò che il mondo condivide (collezioni di semi, cieli bui, spezie) è custodito in pochi luoghi, e i numeri che lo descrivono sono in parte stime.",
      holdersTitle: "Pochi detentori",
      holders: "L'India coltiva il 78,9% delle spezie in semi e l'Indonesia il 74,4% dei chiodi di garofano (giorno 011); 13 centri internazionali hanno depositato il 55% dei campioni di semi delle Svalbard (giorno 008); 87 dei 135 luoghi a cielo buio certificati in Wikidata sono negli Stati Uniti (giorno 010). Il pepe nero è l'eccezione: la sua offerta è diventata meno concentrata dal 1961 (HHI 2.422 → 1.378).",
      countingTitle: "Chi conta, e come",
      counting: "Il 34% delle tonnellate di spezie del mondo nel 2024 sono stime o imputazioni della FAO (71% per la vaniglia), ed esportazioni e importazioni della stessa spezia divergono da −6,3% a +8,7% (giorno 011). La stessa cautela attraversava i giorni precedenti: i conteggi delle lucciole sono cambiati una volta divisi per lo sforzo di osservazione (giorno 002), 11 paesi su 228 hanno una stima dello spreco ad alta affidabilità (giorno 006) e la speranza di vita di ONU e OMS differisce di 1,4 anni (giorno 009).",
      mexicoTitle: "Il Messico ai margini",
      mexico: "Il Messico coltivava il 16,8% della vaniglia mondiale nel 1961 e il 7,2% nel 2024, e ha dichiarato solo 11,8 t di esportazioni di vaniglia (giorno 011). Non ha alcun luogo a cielo buio certificato in Wikidata, benché i cieli del nord di Sonora eguaglino quelli dell'Arizona (giorno 010), e il 58,3% dei messicani non vede la Via Lattea da casa. Se ciò rifletta dichiarazioni e certificazioni o una perdita reale è un'ipotesi da verificare, non un risultato.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi; i totali nazionali non dicono nulla di un'azienda agricola, di una strada o di una persona: questi legami sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    pt: {
      eyebrow: "Conectando os dias · até o Dia {day}",
      title: "Poucos lugares guardam o que muitos compartilham",
      conclusion: "O Dia 011 mapeia as especiarias do mundo: em 2024, sete dos oito grupos de especiarias da FAOSTAT são altamente concentrados, e o centro da pimenta saiu das antigas costas da rota das especiarias, Índia, Malásia e Indonésia (79,4% da produção mundial em 1961), para Vietnã, Índia e Brasil (55,0%). Em todo o lab, o que o mundo compartilha (coleções de sementes, céus escuros, especiarias) é guardado por poucos lugares, e os números que o descrevem são em parte estimativas.",
      holdersTitle: "Poucos que concentram",
      holders: "A Índia cultiva 78,9% das especiarias em sementes e a Indonésia 74,4% do cravo (Dia 011); 13 centros internacionais depositaram 55% das amostras de sementes de Svalbard (Dia 008); 87 dos 135 lugares de céu escuro certificados no Wikidata estão nos Estados Unidos (Dia 010). A pimenta-do-reino é a exceção: sua oferta ficou menos concentrada desde 1961 (IHH 2.422 → 1.378).",
      countingTitle: "Quem conta, e como",
      counting: "34% das toneladas de especiarias do mundo em 2024 são estimativas ou imputações da FAO (71% na baunilha), e exportações e importações da mesma especiaria divergem de −6,3% a +8,7% (Dia 011). A mesma cautela atravessou os dias anteriores: as contagens de vaga-lumes mudaram quando divididas pelo esforço de observação (Dia 002), 11 de 228 países têm uma estimativa de desperdício de alta confiança (Dia 006) e a expectativa de vida da ONU e da OMS difere em 1,4 ano (Dia 009).",
      mexicoTitle: "O México à margem",
      mexico: "O México cultivava 16,8% da baunilha do mundo em 1961 e 7,2% em 2024, e declarou apenas 11,8 t de exportações de baunilha (Dia 011). Não tem nenhum lugar de céu escuro certificado no Wikidata, embora os céus do norte de Sonora igualem os do Arizona (Dia 010), e 58,3% dos mexicanos não veem a Via Láctea de casa. Se isso reflete declarações e certificação ou uma perda real é uma hipótese a testar, não uma conclusão.",
      caveat: "Cada dia usa lugares, anos e fontes diferentes; totais nacionais nada dizem sobre uma lavoura, uma rua ou uma pessoa, então essas conexões são padrões a explorar, não provas.",
      dataTag: "Dos dados", hypTag: "Hipótese", day: "Dia {n}", readMore: "Ver as conexões no lab",
    },
    ja: {
      eyebrow: "日をつなぐ · Day {day}まで",
      title: "多くの人が共有するものを、少数の場所が握っている",
      conclusion: "Day 011は世界のスパイスを地図にします。2024年、FAOSTATの8つのスパイス群のうち7つが高集中で、コショウの中心はかつての香辛料ルートの海岸、インド・マレーシア・インドネシア（1961年に世界生産の79.4%）からベトナム・インド・ブラジル（55.0%）へ移りました。ラボ全体を通して、世界が共有するもの（種子コレクション、暗い夜空、スパイス）は少数の場所に握られ、それを表す数字の一部は推計値です。",
      holdersTitle: "集中する担い手",
      holders: "インドは種子系スパイスの78.9%、インドネシアはクローブの74.4%を生産しています（Day 011）。スバールバルの種子サンプルの55%は13の国際センターが預け（Day 008）、Wikidataの認定ダークスカイ地域135か所のうち87か所は米国にあります（Day 010）。例外は黒コショウで、1961年以降、供給の集中度は下がりました（HHI 2,422 → 1,378）。",
      countingTitle: "誰が、どう数えるか",
      counting: "2024年の世界のスパイスのトン数の34%はFAOの推計・補完値で（バニラは71%）、同じスパイスの輸出と輸入は−6.3%〜+8.7%食い違います（Day 011）。同じ注意はこれまでの日にもありました。ツチボタルの記録数は観察努力で割ると変わり（Day 002）、食品廃棄の推計が高い信頼度なのは228か国中11か国（Day 006）、国連とWHOの平均寿命は1.4年異なります（Day 009）。",
      mexicoTitle: "周縁のメキシコ",
      mexico: "メキシコは1961年に世界のバニラの16.8%、2024年には7.2%を生産し、バニラ輸出の報告はわずか11.8 tでした（Day 011）。北部ソノラの空はアリゾナと同等なのに、Wikidataに認定ダークスカイ地域は1か所もなく（Day 010）、メキシコの人の58.3%は自宅から天の川を見られません。これが報告や認定の問題なのか、実際の喪失なのかは検証すべき仮説であり、結論ではありません。",
      caveat: "日ごとに場所、年、出典が異なります。国の合計は個々の農園や通り、人については何も語らないため、これらのつながりは探る価値のあるパターンであって証拠ではありません。",
      dataTag: "データから", hypTag: "仮説", day: "Day {n}", readMore: "ラボでつながりを見る",
    },
    zh: {
      eyebrow: "连接各天 · 截至第 {day} 天",
      title: "众人共享之物，握在少数地方手中",
      conclusion: "第 011 天绘制了世界香料地图：2024年，FAOSTAT八类香料中有七类高度集中，胡椒的中心已从古老香料之路的海岸——印度、马来西亚和印度尼西亚（1961年占世界产量79.4%）——转移到越南、印度和巴西（55.0%）。纵观整个实验室，世界共享的东西（种子库、黑暗夜空、香料）都握在少数地方手中，而描述它们的数字部分是估计值。",
      holdersTitle: "集中的持有者",
      holders: "印度种植了78.9%的籽类香料，印度尼西亚种植了74.4%的丁香（第 011 天）；斯瓦尔巴种子样本的55%由13个国际中心存入（第 008 天）；Wikidata中135处认证暗夜地有87处在美国（第 010 天）。黑胡椒是例外：自1961年以来其供应变得不那么集中（HHI 2,422 → 1,378）。",
      countingTitle: "谁在计数，如何计数",
      counting: "2024年世界香料吨数中有34%是粮农组织的估计或插补值（香草为71%），同一种香料的出口与进口相差−6.3%至+8.7%（第 011 天）。之前各天也有同样的提醒：萤火虫记录数除以观察努力后发生了变化（第 002 天），228个国家中只有11个的食物浪费估计属于高可信度（第 006 天），联合国与世卫组织的预期寿命相差1.4年（第 009 天）。",
      mexicoTitle: "处于边缘的墨西哥",
      mexico: "墨西哥1961年种植了世界16.8%的香草，2024年为7.2%，且仅报告了11.8吨香草出口（第 011 天）。尽管索诺拉北部的夜空与亚利桑那相当，Wikidata中墨西哥没有一处认证暗夜地（第 010 天），58.3%的墨西哥人在家看不到银河。这反映的是报告与认证问题还是真实的损失，是一个有待检验的假设，而非结论。",
      caveat: "每天使用的地点、年份和来源都不同；国家总量无法说明某个农场、某条街或某个人的情况，因此这些联系是值得探索的模式，而不是证据。",
      dataTag: "来自数据", hypTag: "假设", day: "第 {n} 天", readMore: "在实验室查看这些联系",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
