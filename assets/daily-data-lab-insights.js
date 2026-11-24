// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-24):
// - Objects in Earth orbit by owner (Day 007, CelesTrak SATCAT as of 2026-11-23, raw/day-007-space-debris/object.parquet):
//   United States 18,565 in orbit (13,171 active, 3,913 debris); Mexico 10 (5 active); Canada 82 (56 active); New Zealand 1.
//   Launch site RLLB (CelesTrak: "Rocket Lab Launch Base, Mahia Peninsula, New Zealand"): 263 payloads, 435 objects since
//   2018-01-21, 171 still in orbit. Day 001 = Mexicali–Calexico, Day 002 = Waitomo (NZ), Day 004 = Abraham Lake (Canada).
// - Observers: 35,283 objects in orbit in the public catalogue vs 68,450 objects larger than 10 cm in ESA's MASTER model
//   (1 Feb 2026, ESA Space Environment Report 2026, §2.4) → about half; different dates and definitions, so only indicative.
//   Earlier days: glowworm top region changed after dividing by iNaturalist effort (Day 002); 78% of located halo photos from
//   Europe and North America (Day 003); living languages with a grammar: Papunesia 25% vs South America 66% (Day 005);
//   11 of 228 countries have a high-confidence household food-waste estimate (Day 006).
// - Waste of shared resources: 50% of tracked objects in orbit are not working satellites (17,810 of 35,283, Day 007);
//   UNEP: 1,052 Mt of food wasted in 2022, 19% of food available to consumers (Day 006).
export const LAB_INSIGHT = {
  throughDay: 7,
  days: { places: [1, 2, 4, 7], observers: [2, 3, 5, 6, 7], waste: [6, 7] },
  threads: [
    { id: "places", tags: ["data"] },
    { id: "observers", tags: ["data"] },
    { id: "waste", tags: ["data", "hyp"] },
  ],
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "What we know depends on who measured it",
      conclusion: "Day 007 looks up: half of the 35,283 objects the public catalogue follows in Earth orbit are junk. The lab's places sit very differently under that sky. The United States owns 18,565 of them, Mexico 10, Canada 82, and New Zealand launches more than it owns. And like the glowworms, halos, grammars and food waste of earlier days, the catalogue only shows what someone could measure: about half of the objects larger than 10 cm that ESA's model expects.",
      placesTitle: "The lab's places in orbit",
      places: "Across the Mexicali–Calexico crossing (Day 001), the United States owns 18,565 objects in orbit (13,171 active satellites) and Mexico 10 (5 active). Canada, home of Abraham Lake (Day 004), owns 82. New Zealand, home of the Waitomo caves (Day 002), owns 1, but 263 satellites have been launched from Rocket Lab's base on the Mahia Peninsula since 2018, and 171 objects from it are still in orbit.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Glowworm counts changed once divided by observer effort (Day 002); 78% of located halo photos come from Europe and North America (Day 003); 66% of living languages in South America have a grammar but 25% in Papunesia (Day 005); 11 of 228 countries have a high-confidence food-waste estimate (Day 006). Orbit repeats the pattern: the public catalogue lists 35,283 objects, while ESA's model puts 68,450 above 10 cm, so radar and telescopes see about half (Day 007).",
      wasteTitle: "Waste in shared places",
      waste: "Half of what is tracked in orbit no longer works (Day 007), and about a fifth of the food available to consumers is wasted (Day 006). Both are shared resources that nobody pays to keep clean. That common cause is a hypothesis: the two datasets measure different things, and the lab does not test why either waste happens.",
      caveat: "Each day uses different places, years, and sources; ownership in orbit and country averages say nothing about a single city or household, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Lo que sabemos depende de quién lo midió",
      conclusion: "El Día 007 mira hacia arriba: la mitad de los 35,283 objetos que el catálogo público sigue en órbita terrestre es basura. Los lugares del Lab ocupan ese cielo de forma muy distinta: Estados Unidos es dueño de 18,565, México de 10, Canadá de 82, y Nueva Zelanda lanza más de lo que posee. Y como las luciérnagas, los halos, las gramáticas y el desperdicio de comida de días anteriores, el catálogo solo muestra lo que alguien pudo medir: más o menos la mitad de los objetos mayores de 10 cm que espera el modelo de la ESA.",
      placesTitle: "Los lugares del Lab en órbita",
      places: "En el cruce Mexicali–Calexico (Día 001), Estados Unidos es dueño de 18,565 objetos en órbita (13,171 satélites activos) y México de 10 (5 activos). Canadá, donde está el Lago Abraham (Día 004), tiene 82. Nueva Zelanda, donde están las cuevas de Waitomo (Día 002), tiene 1, pero desde 2018 se han lanzado 263 satélites desde la base de Rocket Lab en la península de Mahia, y 171 objetos de ahí siguen en órbita.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos de luciérnagas cambiaron al dividirlos entre el esfuerzo de observación (Día 002); el 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003); el 66% de las lenguas vivas de Sudamérica tiene gramática, pero solo el 25% en Papunesia (Día 005); 11 de 228 países tienen una estimación de desperdicio de comida de confianza alta (Día 006). La órbita repite el patrón: el catálogo público lista 35,283 objetos, mientras el modelo de la ESA calcula 68,450 de más de 10 cm, así que el radar y los telescopios ven alrededor de la mitad (Día 007).",
      wasteTitle: "Desperdicio en lugares compartidos",
      waste: "La mitad de lo que se rastrea en órbita ya no funciona (Día 007), y cerca de una quinta parte de la comida disponible para los consumidores se desperdicia (Día 006). Ambos son recursos compartidos que nadie paga por mantener limpios. Esa causa común es una hipótesis: los dos conjuntos de datos miden cosas distintas y el Lab no comprueba por qué ocurre ninguno de los dos desperdicios.",
      caveat: "Cada día usa lugares, años y fuentes distintos; la propiedad en órbita y los promedios por país no dicen nada de una ciudad o un hogar en particular, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Ce que l'on sait dépend de qui l'a mesuré",
      conclusion: "Le jour 007 lève les yeux : la moitié des 35 283 objets que le catalogue public suit en orbite terrestre sont des déchets. Les lieux du lab occupent ce ciel de façon très inégale : les États-Unis en possèdent 18 565, le Mexique 10, le Canada 82, et la Nouvelle-Zélande lance plus qu'elle ne possède. Comme les vers luisants, les halos, les grammaires et le gaspillage alimentaire des jours précédents, le catalogue ne montre que ce que quelqu'un a pu mesurer : environ la moitié des objets de plus de 10 cm prévus par le modèle de l'ESA.",
      placesTitle: "Les lieux du lab en orbite",
      places: "Au passage Mexicali–Calexico (jour 001), les États-Unis possèdent 18 565 objets en orbite (13 171 satellites actifs) et le Mexique 10 (5 actifs). Le Canada, où se trouve le lac Abraham (jour 004), en possède 82. La Nouvelle-Zélande, où se trouvent les grottes de Waitomo (jour 002), en possède 1, mais 263 satellites ont été lancés depuis la base de Rocket Lab sur la péninsule de Mahia depuis 2018, et 171 objets qui en sont partis sont encore en orbite.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs de vers luisants ont changé une fois divisés par l'effort d'observation (jour 002) ; 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003) ; 66 % des langues vivantes d'Amérique du Sud ont une grammaire contre 25 % en Papounésie (jour 005) ; 11 pays sur 228 ont une estimation du gaspillage alimentaire à confiance élevée (jour 006). L'orbite répète le motif : le catalogue public liste 35 283 objets, quand le modèle de l'ESA en compte 68 450 de plus de 10 cm ; radars et télescopes en voient environ la moitié (jour 007).",
      wasteTitle: "Du gaspillage dans des lieux partagés",
      waste: "La moitié de ce qui est suivi en orbite ne fonctionne plus (jour 007), et environ un cinquième de la nourriture disponible pour les consommateurs est gaspillé (jour 006). Ce sont deux ressources partagées que personne ne paie pour garder propres. Cette cause commune est une hypothèse : les deux jeux de données mesurent des choses différentes, et le lab ne teste pas pourquoi ces gaspillages se produisent.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents ; la propriété en orbite et les moyennes nationales ne disent rien d'une ville ou d'un foyer : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Ciò che sappiamo dipende da chi l'ha misurato",
      conclusion: "Il giorno 007 guarda in alto: metà dei 35.283 oggetti che il catalogo pubblico segue in orbita terrestre è spazzatura. I luoghi del lab occupano quel cielo in modo molto diverso: gli Stati Uniti ne possiedono 18.565, il Messico 10, il Canada 82, e la Nuova Zelanda lancia più di quanto possieda. E come le lucciole, gli aloni, le grammatiche e lo spreco alimentare dei giorni precedenti, il catalogo mostra solo ciò che qualcuno è riuscito a misurare: circa metà degli oggetti oltre i 10 cm previsti dal modello dell'ESA.",
      placesTitle: "I luoghi del lab in orbita",
      places: "Al valico Mexicali–Calexico (giorno 001), gli Stati Uniti possiedono 18.565 oggetti in orbita (13.171 satelliti attivi) e il Messico 10 (5 attivi). Il Canada, dove si trova il lago Abraham (giorno 004), ne possiede 82. La Nuova Zelanda, dove si trovano le grotte di Waitomo (giorno 002), ne possiede 1, ma dal 2018 dalla base di Rocket Lab sulla penisola di Mahia sono stati lanciati 263 satelliti, e 171 oggetti partiti da lì sono ancora in orbita.",
      observersTitle: "Ogni insieme di dati è anche una mappa di chi osserva",
      observers: "I conteggi di lucciole sono cambiati una volta divisi per lo sforzo di osservazione (giorno 002); il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003); il 66% delle lingue vive del Sud America ha una grammatica, contro il 25% in Papuasia (giorno 005); 11 paesi su 228 hanno una stima dello spreco alimentare ad alta affidabilità (giorno 006). L'orbita ripete lo schema: il catalogo pubblico elenca 35.283 oggetti, mentre il modello dell'ESA ne stima 68.450 oltre i 10 cm, quindi radar e telescopi ne vedono circa metà (giorno 007).",
      wasteTitle: "Spreco in luoghi condivisi",
      waste: "Metà di ciò che è tracciato in orbita non funziona più (giorno 007) e circa un quinto del cibo disponibile ai consumatori viene sprecato (giorno 006). Sono entrambe risorse condivise che nessuno paga per tenere pulite. Questa causa comune è un'ipotesi: i due insiemi di dati misurano cose diverse e il lab non verifica perché avvenga l'uno o l'altro spreco.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi; la proprietà in orbita e le medie nazionali non dicono nulla di una città o di una famiglia: questi collegamenti sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    pt: {
      eyebrow: "Conectando os dias · até o dia {day}",
      title: "O que sabemos depende de quem mediu",
      conclusion: "O Dia 007 olha para cima: metade dos 35.283 objetos que o catálogo público acompanha na órbita terrestre é lixo. Os lugares do laboratório ocupam esse céu de formas muito diferentes: os Estados Unidos são donos de 18.565, o México de 10, o Canadá de 82, e a Nova Zelândia lança mais do que possui. E, como os vaga-lumes, os halos, as gramáticas e o desperdício de comida dos dias anteriores, o catálogo só mostra o que alguém conseguiu medir: cerca de metade dos objetos maiores que 10 cm que o modelo da ESA prevê.",
      placesTitle: "Os lugares do laboratório em órbita",
      places: "Na travessia Mexicali–Calexico (Dia 001), os Estados Unidos são donos de 18.565 objetos em órbita (13.171 satélites ativos) e o México de 10 (5 ativos). O Canadá, onde fica o Lago Abraham (Dia 004), tem 82. A Nova Zelândia, onde ficam as cavernas de Waitomo (Dia 002), tem 1, mas desde 2018 foram lançados 263 satélites da base da Rocket Lab na península de Mahia, e 171 objetos que saíram de lá continuam em órbita.",
      observersTitle: "Cada conjunto de dados também é um mapa de seus observadores",
      observers: "As contagens de vaga-lumes mudaram ao serem divididas pelo esforço de observação (Dia 002); 78% das fotos de halos localizadas vêm da Europa e da América do Norte (Dia 003); 66% das línguas vivas da América do Sul têm gramática, contra 25% na Papunésia (Dia 005); 11 de 228 países têm uma estimativa de desperdício de alimentos de alta confiança (Dia 006). A órbita repete o padrão: o catálogo público lista 35.283 objetos, enquanto o modelo da ESA estima 68.450 acima de 10 cm, então radares e telescópios veem cerca de metade (Dia 007).",
      wasteTitle: "Desperdício em lugares compartilhados",
      waste: "Metade do que é rastreado em órbita não funciona mais (Dia 007), e cerca de um quinto da comida disponível aos consumidores é desperdiçado (Dia 006). Ambos são recursos compartilhados que ninguém paga para manter limpos. Essa causa comum é uma hipótese: os dois conjuntos de dados medem coisas diferentes, e o laboratório não testa por que nenhum dos dois desperdícios acontece.",
      caveat: "Cada dia usa lugares, anos e fontes diferentes; a propriedade em órbita e as médias nacionais não dizem nada sobre uma cidade ou um domicílio, então essas ligações são padrões a explorar, não provas.",
      dataTag: "A partir dos dados", hypTag: "Hipótese", day: "Dia {n}", readMore: "Veja as conexões no laboratório",
    },
    ja: {
      eyebrow: "日々をつなぐ · 第{day}日まで",
      title: "わかることは、誰が測ったかで決まる",
      conclusion: "第007日は空を見上げます。公開カタログが追跡する地球周回軌道上の35,283個の物体の半分はごみです。ラボの場所はこの空で大きく異なる位置にあります。米国は18,565個、メキシコは10個、カナダは82個を所有し、ニュージーランドは所有する数より多くを打ち上げています。これまでのツチボタル、ハロ、文法書、食品廃棄と同じく、カタログが示すのは誰かが測れたものだけで、ESAのモデルが予測する10 cm超の物体のおよそ半分です。",
      placesTitle: "軌道上のラボの場所",
      places: "メヒカリ–カレキシコの国境（第001日）では、米国が軌道上に18,565個（稼働衛星13,171個）、メキシコが10個（稼働5個）を所有しています。アブラハム湖（第004日）のあるカナダは82個。ワイトモ洞窟（第002日）のあるニュージーランドの所有は1個ですが、2018年以降マヒア半島のRocket Lab発射場から263機の衛星が打ち上げられ、そこから上がった171個が今も軌道上にあります。",
      observersTitle: "どのデータも、観察した人の地図でもある",
      observers: "ツチボタルの記録数は観察努力量で割ると変わり（第002日）、位置のわかるハロ写真の78%は欧州と北米から（第003日）、南米で話者のいる言語の66%に文法書がある一方パプネシアでは25%（第005日）、228か国のうち食品廃棄の推計の信頼度が高いのは11か国（第006日）。軌道も同じで、公開カタログは35,283個を載せていますが、ESAのモデルでは10 cm超が68,450個。レーダーと望遠鏡に見えているのはおよそ半分です（第007日）。",
      wasteTitle: "共有の場所での無駄",
      waste: "軌道上で追跡されている物体の半分はもう機能せず（第007日）、消費者が手にできる食品のおよそ5分の1が捨てられています（第006日）。どちらも、きれいに保つ費用を誰も払わない共有資源です。この共通の原因は仮説であり、2つのデータは異なるものを測っていて、ラボはどちらの無駄の理由も検証していません。",
      caveat: "日ごとに場所・年・出典が異なり、軌道上の所有や国の平均は個々の都市や家庭については何も語りません。これらのつながりは検討すべきパターンであり、証明ではありません。",
      dataTag: "データより", hypTag: "仮説", day: "第{n}日", readMore: "ラボでつながりを見る",
    },
    zh: {
      eyebrow: "连接各天 · 截至第 {day} 天",
      title: "我们知道什么，取决于谁去测量",
      conclusion: "第 007 天抬头望天：公开目录在地球轨道上跟踪的 35,283 个物体中有一半是垃圾。实验室的各个地点在这片天空中的位置截然不同：美国拥有 18,565 个，墨西哥 10 个，加拿大 82 个，而新西兰发射的比拥有的多。和前几天的萤火虫、光晕、语法与食物浪费一样，目录只显示有人能够测量的部分：大约是 ESA 模型预计的大于 10 厘米物体的一半。",
      placesTitle: "轨道上的实验室地点",
      places: "在墨西卡利–卡莱克西科口岸（第 001 天），美国在轨拥有 18,565 个物体（13,171 颗在用卫星），墨西哥拥有 10 个（5 颗在用）。亚伯拉罕湖（第 004 天）所在的加拿大拥有 82 个。怀托摩洞穴（第 002 天）所在的新西兰只拥有 1 个，但自 2018 年以来已从马希亚半岛的 Rocket Lab 发射场发射了 263 颗卫星，其中有 171 个物体仍在轨道上。",
      observersTitle: "每个数据集也是观察者的地图",
      observers: "萤火虫计数在除以观察努力后发生变化（第 002 天）；78% 有定位的光晕照片来自欧洲和北美（第 003 天）；南美 66% 的现存语言有语法书，巴布尼西亚只有 25%（第 005 天）；228 个国家中只有 11 个拥有高置信度的食物浪费估计（第 006 天）。轨道重复了这一模式：公开目录列出 35,283 个物体，而 ESA 模型估计大于 10 厘米的有 68,450 个，雷达和望远镜大约只看到一半（第 007 天）。",
      wasteTitle: "共享空间里的浪费",
      waste: "轨道上被跟踪的物体有一半已不再工作（第 007 天），而消费者可获得的食物约有五分之一被浪费（第 006 天）。两者都是没有人付费保持清洁的共享资源。这一共同原因只是假设：两组数据衡量的是不同的东西，实验室也没有检验两种浪费为何发生。",
      caveat: "每天使用不同的地点、年份和来源；轨道上的所有权和国家平均值不能说明某个城市或家庭，因此这些联系是值得探索的模式，而非证据。",
      dataTag: "来自数据", hypTag: "假设", day: "第 {n} 天", readMore: "在实验室查看这些联系",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
