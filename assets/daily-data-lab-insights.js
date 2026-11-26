// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-26):
// - Longevity (Day 009, data/day-009-longevity/day-009.json; UN WPP 2024, WHO GHO 2023, World Bank WDI): world life
//   expectancy 73.2 (UN, 2023); WHO 73.3 with HALE 62.8, so 10.5 years in less than full health; the nine countries after
//   Singapore (HALE 72.9, 95% UI 69.3–76.1) all overlap its interval. Mexico e0 75.1 / HALE 63.1; United States 79.3 / 64.6,
//   13.9 years in less than full health (most of 185 countries), 5.1 healthy years below the Preston line (HALE on log GDP
//   per person, r² 0.69); Canada 82.6 / 67.9; New Zealand 82.1 / 68.0. UN vs WHO life expectancy differ by 1.4 years on
//   average (largest: Guyana, 9.8). Health spending as % of GDP explains 5% of the variation in HALE (183 countries).
//   Newman (2024, bioRxiv preprint): US supercentenarian records fall 69–82% after birth certificates are introduced.
//   Day 001 = Mexicali–Calexico, Day 002 = Waitomo (NZ), Day 004 = Abraham Lake (Canada).
// - Observers, earlier days: glowworm counts changed after dividing by iNaturalist effort (Day 002); 78% of located halo
//   photos from Europe and North America (Day 003); grammars for 66% of living languages in South America vs 25% in
//   Papunesia (Day 005); 11 of 228 countries with a high-confidence food-waste estimate (Day 006); public catalogue 35,283
//   objects in orbit vs 68,450 > 10 cm in ESA's model (Day 007); 10 countries with seeds in Svalbard have no 2024 WIEWS
//   figure (Day 008).
// - Shared resources: UNEP: 19% of food available to consumers wasted (Day 006); 50% of tracked objects in orbit are not
//   working satellites (Day 007); 13 international centres deposited 54.7% of Svalbard's samples (Day 008).
export const LAB_INSIGHT = {
  throughDay: 9,
  days: { places: [1, 2, 4, 9], observers: [2, 3, 5, 6, 7, 8, 9], waste: [6, 7, 8, 9] },
  threads: [
    { id: "places", tags: ["data"] },
    { id: "observers", tags: ["data"] },
    { id: "waste", tags: ["data", "hyp"] },
  ],
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "What we know depends on who measured it",
      conclusion: "Day 009 asks where people live longest and healthiest. A newborn can expect 73.2 years (UN, 2023), and about 10.5 of WHO's 73.3 are lived in less than full health; the ten countries with the longest healthy lives are a statistical tie. As on every earlier day, the answer depends on who keeps the record: UN and WHO estimates of life expectancy differ by 1.4 years on average, and the world's most extreme ages are disputed because birth records were missing when those people were born.",
      placesTitle: "The lab's places, in years of life",
      places: "Across the Mexicali–Calexico crossing (Day 001), a newborn can expect 79.3 years in the United States and 75.1 in Mexico. The United States has the most years in less than full health of 185 countries (13.9) and 5.1 fewer healthy years than its income predicts. Canada, home of Abraham Lake (Day 004), reaches 82.6 years with 67.9 healthy, and New Zealand, home of the Waitomo caves (Day 002), 82.1 with 68.0.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Glowworm counts changed once divided by observer effort (Day 002); 78% of located halo photos come from Europe and North America (Day 003); grammars exist for 66% of living languages in South America but 25% in Papunesia (Day 005); 11 of 228 countries have a high-confidence food-waste estimate (Day 006); radar and telescopes see about half of the objects larger than 10 cm in orbit (Day 007); ten countries with seeds in Svalbard report no 2024 figure to FAO (Day 008). Ages repeat it: in the United States, records of people aged 110+ fall 69–82% once birth certificates are introduced (Newman 2024, a preprint), and UN and WHO life expectancies differ by up to 9.8 years in Guyana (Day 009).",
      wasteTitle: "Shared resources, shared care",
      waste: "About a fifth of the food available to consumers is wasted (Day 006), half of what is tracked in orbit no longer works (Day 007), and 13 international centres supplied 55% of Svalbard's seeds (Day 008). Health follows the pattern: spending as a share of GDP explains only 5% of the differences in healthy life expectancy between countries (Day 009). How much a shared resource receives seems to matter less than who looks after it and how. That is a hypothesis: the four datasets measure different things, and the lab does not test why.",
      caveat: "Each day uses different places, years, and sources; national averages say nothing about a single city, household or person, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Lo que sabemos depende de quién lo midió",
      conclusion: "El Día 009 pregunta dónde se vive más tiempo y con mejor salud. Un recién nacido puede esperar 73.2 años (ONU, 2023), y unos 10.5 de los 73.3 de la OMS se viven con salud no plena; los diez países con la vida sana más larga están en un empate estadístico. Como en todos los días anteriores, la respuesta depende de quién lleva el registro: las estimaciones de esperanza de vida de la ONU y de la OMS difieren 1.4 años en promedio, y las edades más extremas del mundo están en duda porque faltaban actas de nacimiento cuando esas personas nacieron.",
      placesTitle: "Los lugares del Lab, en años de vida",
      places: "En el cruce Mexicali–Calexico (Día 001), un recién nacido puede esperar 79.3 años en Estados Unidos y 75.1 en México. Estados Unidos tiene más años con salud no plena que cualquiera de 185 países (13.9) y 5.1 años sanos menos de los que predice su ingreso. Canadá, donde está el lago Abraham (Día 004), llega a 82.6 años con 67.9 sanos, y Nueva Zelanda, donde están las cuevas de Waitomo (Día 002), a 82.1 con 68.0.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos de luciérnagas cambiaron al dividirlos entre el esfuerzo de observación (Día 002); el 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003); hay gramática para el 66% de las lenguas vivas de Sudamérica, pero solo para el 25% en Papunesia (Día 005); 11 de 228 países tienen una estimación de desperdicio de alta confianza (Día 006); radares y telescopios ven cerca de la mitad de los objetos de más de 10 cm en órbita (Día 007); diez países con semillas en Svalbard no reportan dato de 2024 a la FAO (Día 008). Las edades lo repiten: en Estados Unidos, los registros de personas de 110 años o más caen 69–82% cuando se introducen las actas de nacimiento (Newman 2024, un preprint), y la esperanza de vida de la ONU y la de la OMS difieren hasta 9.8 años en Guyana (Día 009).",
      wasteTitle: "Recursos compartidos, cuidado compartido",
      waste: "Cerca de una quinta parte de la comida disponible para los consumidores se desperdicia (Día 006), la mitad de lo que se rastrea en órbita ya no funciona (Día 007) y 13 centros internacionales aportaron el 55% de las semillas de Svalbard (Día 008). La salud sigue el patrón: el gasto como proporción del PIB explica solo el 5% de las diferencias de esperanza de vida saludable entre países (Día 009). Cuánto recibe un recurso compartido parece importar menos que quién lo cuida y cómo. Es una hipótesis: los cuatro conjuntos de datos miden cosas distintas y el Lab no prueba por qué.",
      caveat: "Cada día usa lugares, años y fuentes distintos; los promedios nacionales no dicen nada de una ciudad, un hogar o una persona en particular, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Ce que l'on sait dépend de qui l'a mesuré",
      conclusion: "Le jour 009 demande où l'on vit le plus longtemps et en meilleure santé. Un nouveau-né peut espérer 73,2 ans (ONU, 2023), et environ 10,5 des 73,3 années de l'OMS sont vécues en santé non optimale ; les dix pays où la vie en bonne santé est la plus longue sont à égalité statistique. Comme chaque jour précédent, la réponse dépend de qui tient le registre : les espérances de vie de l'ONU et de l'OMS diffèrent en moyenne de 1,4 an, et les âges les plus extrêmes du monde sont contestés parce que les actes de naissance manquaient à la naissance de ces personnes.",
      placesTitle: "Les lieux du lab, en années de vie",
      places: "De part et d'autre du passage Mexicali–Calexico (jour 001), un nouveau-né peut espérer 79,3 ans aux États-Unis et 75,1 au Mexique. Les États-Unis comptent le plus d'années en santé non optimale des 185 pays (13,9) et 5,1 années de bonne santé de moins que ne le prédit leur revenu. Le Canada, où se trouve le lac Abraham (jour 004), atteint 82,6 ans dont 67,9 en bonne santé, et la Nouvelle-Zélande, où se trouvent les grottes de Waitomo (jour 002), 82,1 dont 68,0.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs de vers luisants ont changé une fois divisés par l'effort d'observation (jour 002) ; 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003) ; 66 % des langues vivantes d'Amérique du Sud ont une grammaire, contre 25 % en Papunésie (jour 005) ; 11 pays sur 228 ont une estimation du gaspillage de haute confiance (jour 006) ; radars et télescopes voient environ la moitié des objets de plus de 10 cm en orbite (jour 007) ; dix pays ayant des semences au Svalbard ne déclarent aucun chiffre 2024 à la FAO (jour 008). Les âges le répètent : aux États-Unis, les records de personnes de 110 ans ou plus chutent de 69 à 82 % avec l'introduction des actes de naissance (Newman 2024, prépublication), et les espérances de vie de l'ONU et de l'OMS diffèrent jusqu'à 9,8 ans au Guyana (jour 009).",
      wasteTitle: "Ressources partagées, soin partagé",
      waste: "Environ un cinquième de la nourriture disponible pour les consommateurs est gaspillé (jour 006), la moitié de ce qui est suivi en orbite ne fonctionne plus (jour 007) et 13 centres internationaux ont fourni 55 % des semences du Svalbard (jour 008). La santé suit le même schéma : la dépense en part du PIB n'explique que 5 % des écarts d'espérance de vie en bonne santé entre pays (jour 009). Ce que reçoit une ressource partagée semble compter moins que qui en prend soin, et comment. C'est une hypothèse : les quatre jeux de données mesurent des choses différentes et le lab ne teste pas pourquoi.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents ; les moyennes nationales ne disent rien d'une ville, d'un foyer ou d'une personne : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Ciò che sappiamo dipende da chi l'ha misurato",
      conclusion: "Il giorno 009 chiede dove si viva più a lungo e più in salute. Un neonato può attendersi 73,2 anni (ONU, 2023), e circa 10,5 dei 73,3 dell'OMS si vivono in salute non piena; i dieci paesi con la vita in salute più lunga sono in pareggio statistico. Come in ogni giorno precedente, la risposta dipende da chi tiene il registro: le speranze di vita di ONU e OMS differiscono in media di 1,4 anni, e le età più estreme del mondo sono contestate perché mancavano i certificati di nascita quando quelle persone nacquero.",
      placesTitle: "I luoghi del lab, in anni di vita",
      places: "Ai due lati del valico Mexicali–Calexico (giorno 001), un neonato può attendersi 79,3 anni negli Stati Uniti e 75,1 in Messico. Gli Stati Uniti hanno più anni in salute non piena di tutti i 185 paesi (13,9) e 5,1 anni in salute in meno di quanto preveda il reddito. Il Canada, dove si trova il lago Abraham (giorno 004), arriva a 82,6 anni di cui 67,9 in salute, e la Nuova Zelanda, dove si trovano le grotte di Waitomo (giorno 002), a 82,1 di cui 68,0.",
      observersTitle: "Ogni dataset è anche una mappa di chi osserva",
      observers: "I conteggi delle lucciole sono cambiati una volta divisi per lo sforzo di osservazione (giorno 002); il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003); esiste una grammatica per il 66% delle lingue vive del Sud America ma per il 25% in Papunesia (giorno 005); 11 paesi su 228 hanno una stima dello spreco ad alta affidabilità (giorno 006); radar e telescopi vedono circa metà degli oggetti oltre 10 cm in orbita (giorno 007); dieci paesi con semi alle Svalbard non comunicano dati 2024 alla FAO (giorno 008). Le età lo confermano: negli Stati Uniti i record di persone di 110 anni o più calano del 69–82% quando arrivano i certificati di nascita (Newman 2024, preprint), e le speranze di vita di ONU e OMS differiscono fino a 9,8 anni in Guyana (giorno 009).",
      wasteTitle: "Risorse condivise, cura condivisa",
      waste: "Circa un quinto del cibo disponibile per i consumatori viene sprecato (giorno 006), metà di ciò che è tracciato in orbita non funziona più (giorno 007) e 13 centri internazionali hanno fornito il 55% dei semi delle Svalbard (giorno 008). La salute segue lo schema: la spesa in quota di PIL spiega solo il 5% delle differenze di speranza di vita in buona salute tra paesi (giorno 009). Quanto riceve una risorsa condivisa sembra contare meno di chi se ne prende cura e come. È un'ipotesi: i quattro dataset misurano cose diverse e il lab non verifica perché.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi; le medie nazionali non dicono nulla di una città, di una famiglia o di una persona: questi legami sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    pt: {
      eyebrow: "Conectando os dias · até o Dia {day}",
      title: "O que sabemos depende de quem mediu",
      conclusion: "O Dia 009 pergunta onde se vive mais e com mais saúde. Um recém-nascido pode esperar 73,2 anos (ONU, 2023), e cerca de 10,5 dos 73,3 da OMS são vividos com saúde não plena; os dez países com a vida saudável mais longa estão em empate estatístico. Como em todos os dias anteriores, a resposta depende de quem mantém o registro: as expectativas de vida da ONU e da OMS diferem 1,4 ano em média, e as idades mais extremas do mundo são contestadas porque faltavam certidões de nascimento quando essas pessoas nasceram.",
      placesTitle: "Os lugares do lab, em anos de vida",
      places: "Dos dois lados da travessia Mexicali–Calexico (Dia 001), um recém-nascido pode esperar 79,3 anos nos Estados Unidos e 75,1 no México. Os Estados Unidos têm mais anos com saúde não plena que qualquer um de 185 países (13,9) e 5,1 anos saudáveis a menos do que a renda prevê. O Canadá, onde fica o lago Abraham (Dia 004), chega a 82,6 anos com 67,9 saudáveis, e a Nova Zelândia, onde ficam as cavernas de Waitomo (Dia 002), a 82,1 com 68,0.",
      observersTitle: "Todo conjunto de dados é também um mapa de quem observa",
      observers: "As contagens de vaga-lumes mudaram quando divididas pelo esforço de observação (Dia 002); 78% das fotos de halos com localização vêm da Europa e da América do Norte (Dia 003); há gramática para 66% das línguas vivas da América do Sul, mas para 25% na Papunésia (Dia 005); 11 de 228 países têm estimativa de desperdício de alta confiança (Dia 006); radares e telescópios veem cerca de metade dos objetos maiores que 10 cm em órbita (Dia 007); dez países com sementes em Svalbard não informam dado de 2024 à FAO (Dia 008). As idades repetem isso: nos Estados Unidos, os registros de pessoas com 110 anos ou mais caem 69–82% quando surgem as certidões de nascimento (Newman 2024, um preprint), e as expectativas de vida da ONU e da OMS diferem até 9,8 anos na Guiana (Dia 009).",
      wasteTitle: "Recursos compartilhados, cuidado compartilhado",
      waste: "Cerca de um quinto da comida disponível aos consumidores é desperdiçado (Dia 006), metade do que é rastreado em órbita não funciona mais (Dia 007) e 13 centros internacionais forneceram 55% das sementes de Svalbard (Dia 008). A saúde segue o padrão: o gasto como parcela do PIB explica só 5% das diferenças de expectativa de vida saudável entre países (Dia 009). Quanto um recurso compartilhado recebe parece importar menos do que quem cuida dele e como. É uma hipótese: os quatro conjuntos de dados medem coisas diferentes e o lab não testa por quê.",
      caveat: "Cada dia usa lugares, anos e fontes diferentes; médias nacionais nada dizem sobre uma cidade, um domicílio ou uma pessoa, então essas conexões são padrões a explorar, não provas.",
      dataTag: "Dos dados", hypTag: "Hipótese", day: "Dia {n}", readMore: "Ver as conexões no lab",
    },
    ja: {
      eyebrow: "日をつなぐ · Day {day}まで",
      title: "何がわかるかは、誰が測ったかで決まる",
      conclusion: "Day 009は、最も長く健康に生きられるのはどこかを問います。新生児の平均寿命は73.2年（国連、2023年）で、WHOの73.3年のうち約10.5年は健康でない状態で過ごします。健康寿命の上位10か国は統計的に横並びです。これまでのどの日とも同じく、答えは誰が記録を取るかで変わります。国連とWHOの平均寿命の推計は平均1.4年異なり、世界で最も高い年齢は、その人たちが生まれたときに出生記録がなかったために議論になっています。",
      placesTitle: "ラボの舞台を寿命で見る",
      places: "メキシカリ–カレキシコの国境（Day 001）を挟んで、新生児の平均寿命は米国で79.3年、メキシコで75.1年です。米国の健康でない期間は185か国で最も長く（13.9年）、所得から予想されるより健康寿命が5.1年短くなっています。アブラハム湖のあるカナダ（Day 004）は82.6年でうち67.9年が健康、ワイトモ洞窟のあるニュージーランド（Day 002）は82.1年でうち68.0年です。",
      observersTitle: "どのデータも観察者の地図でもある",
      observers: "ツチボタルの記録数は観察努力で割ると変わりました（Day 002）。位置のわかるハロー写真の78%はヨーロッパと北米からです（Day 003）。文法書があるのは南米の現存言語の66%、パプネシアでは25%です（Day 005）。食品廃棄の推計が高い信頼度なのは228か国中11か国です（Day 006）。レーダーと望遠鏡が見ているのは軌道上の10 cm以上の物体の約半分です（Day 007）。スバールバルに種子を預ける10か国は2024年の数値をFAOに報告していません（Day 008）。年齢も同じです。米国では出生証明書が導入されると110歳以上の記録が69–82%減り（Newman 2024、プレプリント）、国連とWHOの平均寿命はガイアナで最大9.8年異なります（Day 009）。",
      wasteTitle: "共有の資源、共有の手入れ",
      waste: "消費者が手にできる食料の約5分の1が廃棄され（Day 006）、軌道上で追跡される物体の半分はもう機能せず（Day 007）、スバールバルの種子の55%は13の国際センターが預けました（Day 008）。健康も同じ傾向で、GDPに占める保健支出は国ごとの健康寿命の違いの5%しか説明しません（Day 009）。共有の資源にどれだけ注ぎ込むかより、誰がどのように手入れするかが大事なようです。これは仮説です。四つのデータは別々のものを測っており、ラボはその理由を検証していません。",
      caveat: "日ごとに場所、年、出典が異なります。国の平均は個々の都市や家庭、人については何も語らないため、これらのつながりは探る価値のあるパターンであって証拠ではありません。",
      dataTag: "データから", hypTag: "仮説", day: "Day {n}", readMore: "ラボでつながりを見る",
    },
    zh: {
      eyebrow: "连接各天 · 截至第 {day} 天",
      title: "我们知道什么，取决于谁去测量",
      conclusion: "第 009 天探讨哪里的人活得最久、最健康。新生儿预期可活73.2年（联合国，2023年），世卫组织估计的73.3年中约有10.5年处于非完全健康状态；健康寿命最长的十个国家在统计上并列。和此前每一天一样，答案取决于谁在记录：联合国和世卫组织的预期寿命估计平均相差1.4年，而世界上最极端的年龄之所以存在争议，是因为这些人出生时没有出生登记。",
      placesTitle: "用寿命看实验室的地点",
      places: "在墨西卡利–卡莱克西科口岸（第 001 天）两侧，新生儿预期寿命美国为79.3年，墨西哥为75.1年。美国非完全健康的年数在185个国家中最多（13.9年），健康年数比其收入预测的少5.1年。阿伯拉罕湖所在的加拿大（第 004 天）为82.6年，其中67.9年健康；怀托摩洞穴所在的新西兰（第 002 天）为82.1年，其中68.0年健康。",
      observersTitle: "每个数据集也是观察者的地图",
      observers: "萤火虫记录数除以观察努力后发生了变化（第 002 天）；有位置的晕像照片78%来自欧洲和北美（第 003 天）；南美现存语言66%有语法书，巴布内西亚只有25%（第 005 天）；228个国家中只有11个的食物浪费估计属于高可信度（第 006 天）；雷达和望远镜大约只看到轨道上大于10厘米物体的一半（第 007 天）；在斯瓦尔巴存有种子的十个国家没有向粮农组织报告2024年数据（第 008 天）。年龄也是如此：在美国，引入出生证明后，110岁以上的记录下降69–82%（Newman 2024，预印本），联合国与世卫组织的预期寿命在圭亚那相差高达9.8年（第 009 天）。",
      wasteTitle: "共享的资源，共同的照料",
      waste: "消费者可获得的食物约五分之一被浪费（第 006 天），轨道上被跟踪的物体有一半已不再工作（第 007 天），斯瓦尔巴的种子有55%来自13个国际中心（第 008 天）。健康也遵循这一模式：卫生支出占GDP的比重只能解释各国健康预期寿命差异的5%（第 009 天）。共享资源得到多少投入，似乎不如谁来照料、如何照料重要。这是一个假设：四个数据集测量的是不同的东西，实验室没有检验原因。",
      caveat: "每天使用的地点、年份和来源都不同；国家平均值无法说明某个城市、家庭或个人的情况，因此这些联系是值得探索的模式，而不是证据。",
      dataTag: "来自数据", hypTag: "假设", day: "第 {n} 天", readMore: "在实验室查看这些联系",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
