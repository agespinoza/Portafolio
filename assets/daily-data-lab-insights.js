// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-25):
// - Svalbard Global Seed Vault (Day 008, data/day-008-seed-banks/day-008.json; Seed Portal 2026-11-25, FAO WIEWS 2024):
//   Mexico's national genebanks 94,724 accessions in WIEWS, 0 samples in Svalbard; CIMMYT (MEX002, international centre near
//   Mexico City) 190,453 samples in Svalbard vs 213,600 WIEWS accessions; US national depositors 161,530 samples (4 genebanks);
//   Canada (CAN004) 34,952; New Zealand (NZL001) 3,121. Day 001 = Mexicali–Calexico, Day 002 = Waitomo (NZ), Day 004 = Abraham Lake (Canada).
// - Observers: 10 countries with seeds in Svalbard have no 2024 WIEWS figure (largest: South Korea, 48,282 samples); WIEWS is
//   self-reported. Earlier days: glowworm counts changed after dividing by iNaturalist effort (Day 002); 78% of located halo
//   photos from Europe and North America (Day 003); grammars for 66% of living languages in South America vs 25% in Papunesia
//   (Day 005); 11 of 228 countries with a high-confidence food-waste estimate (Day 006); public catalogue 35,283 objects in orbit
//   vs 68,450 > 10 cm in ESA's model (Day 007).
// - Shared resources: 13 international centres deposited 54.7% of Svalbard's 1,417,961 samples (Day 008); 50% of tracked
//   objects in orbit are not working satellites (Day 007); UNEP: 19% of food available to consumers wasted (Day 006).
export const LAB_INSIGHT = {
  throughDay: 8,
  days: { places: [1, 2, 4, 8], observers: [2, 3, 5, 6, 7, 8], waste: [6, 7, 8] },
  threads: [
    { id: "places", tags: ["data"] },
    { id: "observers", tags: ["data"] },
    { id: "waste", tags: ["data", "hyp"] },
  ],
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "What we know depends on who measured it",
      conclusion: "Day 008 opens the Svalbard seed vault: 1.42 million seed samples kept as a backup of the world's crops. The lab's places sit very differently in it. Mexico's national genebanks have sent nothing, while CIMMYT, an international centre near Mexico City, has sent 190,453 samples; national genebanks in the United States have 161,530. And, as on earlier days, the record shows who reports: ten countries with seeds in the vault have no 2024 figure in FAO's genebank database.",
      placesTitle: "The lab's places in the seed vault",
      places: "Across the Mexicali–Calexico crossing (Day 001), US national genebanks keep 161,530 samples in Svalbard; Mexico's national genebanks, with 94,724 accessions at home, keep none, though CIMMYT, near Mexico City, keeps 190,453. Canada, home of Abraham Lake (Day 004), keeps 34,952, and New Zealand, home of the Waitomo caves (Day 002), 3,121.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Glowworm counts changed once divided by observer effort (Day 002); 78% of located halo photos come from Europe and North America (Day 003); grammars exist for 66% of living languages in South America but 25% in Papunesia (Day 005); 11 of 228 countries have a high-confidence food-waste estimate (Day 006); radar and telescopes see about half of the objects larger than 10 cm in orbit (Day 007). Genebanks repeat it: ten countries with seeds in Svalbard, led by South Korea, report no 2024 figure to FAO (Day 008).",
      wasteTitle: "Shared resources, shared care",
      waste: "About a fifth of the food available to consumers is wasted (Day 006) and half of what is tracked in orbit no longer works (Day 007); in the seed vault, 13 international centres supplied 55% of the samples (Day 008). Resources that belong to everyone seem to be looked after mainly where someone is mandated and paid to do it. That is a hypothesis: the three datasets measure different things, and the lab does not test why.",
      caveat: "Each day uses different places, years, and sources; national totals say nothing about a single city or household, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Lo que sabemos depende de quién lo midió",
      conclusion: "El Día 008 abre la bóveda de semillas de Svalbard: 1.42 millones de muestras guardadas como respaldo de los cultivos del mundo. Los lugares del Lab aparecen ahí de forma muy distinta. Los bancos nacionales de México no han enviado nada, mientras que el CIMMYT, un centro internacional cerca de la Ciudad de México, ha enviado 190,453 muestras; los bancos nacionales de Estados Unidos tienen 161,530. Y, como en días anteriores, el registro muestra quién reporta: diez países con semillas en la bóveda no tienen dato de 2024 en la base de bancos de germoplasma de la FAO.",
      placesTitle: "Los lugares del Lab en la bóveda de semillas",
      places: "En el cruce Mexicali–Calexico (Día 001), los bancos nacionales de Estados Unidos guardan 161,530 muestras en Svalbard; los de México, con 94,724 accesiones en casa, no guardan ninguna, aunque el CIMMYT, cerca de la Ciudad de México, guarda 190,453. Canadá, donde está el Lago Abraham (Día 004), guarda 34,952, y Nueva Zelanda, donde están las cuevas de Waitomo (Día 002), 3,121.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos de luciérnagas cambiaron al dividirlos entre el esfuerzo de observación (Día 002); el 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003); hay gramática para el 66% de las lenguas vivas de Sudamérica pero solo para el 25% en Papunesia (Día 005); 11 de 228 países tienen una estimación de desperdicio de comida de confianza alta (Día 006); el radar y los telescopios ven cerca de la mitad de los objetos de más de 10 cm en órbita (Día 007). Los bancos de germoplasma lo repiten: diez países con semillas en Svalbard, encabezados por Corea del Sur, no reportan dato de 2024 a la FAO (Día 008).",
      wasteTitle: "Recursos compartidos, cuidado compartido",
      waste: "Cerca de una quinta parte de la comida disponible para los consumidores se desperdicia (Día 006) y la mitad de lo que se rastrea en órbita ya no funciona (Día 007); en la bóveda de semillas, 13 centros internacionales aportaron el 55% de las muestras (Día 008). Los recursos que son de todos parecen cuidarse sobre todo donde alguien tiene el mandato y los fondos para hacerlo. Es una hipótesis: los tres conjuntos de datos miden cosas distintas y el Lab no comprueba por qué.",
      caveat: "Cada día usa lugares, años y fuentes distintos; los totales por país no dicen nada de una ciudad o un hogar en particular, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Ce que l'on sait dépend de qui l'a mesuré",
      conclusion: "Le jour 008 ouvre la réserve de semences du Svalbard : 1,42 million d'échantillons gardés en sauvegarde des cultures du monde. Les lieux du lab y figurent de façon très inégale. Les banques nationales du Mexique n'ont rien envoyé, alors que le CIMMYT, centre international près de Mexico, a envoyé 190 453 échantillons ; les banques nationales des États-Unis en ont 161 530. Et, comme les jours précédents, le registre montre qui déclare : dix pays ayant des semences dans la réserve n'ont pas de chiffre 2024 dans la base de la FAO sur les banques de gènes.",
      placesTitle: "Les lieux du lab dans la réserve de semences",
      places: "Au passage Mexicali–Calexico (jour 001), les banques nationales des États-Unis gardent 161 530 échantillons à Svalbard ; celles du Mexique, avec 94 724 accessions chez elles, n'en gardent aucun, mais le CIMMYT, près de Mexico, en garde 190 453. Le Canada, où se trouve le lac Abraham (jour 004), en garde 34 952, et la Nouvelle-Zélande, où se trouvent les grottes de Waitomo (jour 002), 3 121.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs de vers luisants ont changé une fois divisés par l'effort d'observation (jour 002) ; 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003) ; 66 % des langues vivantes d'Amérique du Sud ont une grammaire contre 25 % en Papounésie (jour 005) ; 11 pays sur 228 ont une estimation du gaspillage alimentaire à confiance élevée (jour 006) ; radars et télescopes voient environ la moitié des objets de plus de 10 cm en orbite (jour 007). Les banques de gènes répètent le motif : dix pays ayant des semences à Svalbard, Corée du Sud en tête, ne déclarent pas de chiffre 2024 à la FAO (jour 008).",
      wasteTitle: "Ressources partagées, soin partagé",
      waste: "Environ un cinquième de la nourriture disponible pour les consommateurs est gaspillé (jour 006) et la moitié de ce qui est suivi en orbite ne fonctionne plus (jour 007) ; dans la réserve de semences, 13 centres internationaux ont fourni 55 % des échantillons (jour 008). Les ressources de tous semblent surtout entretenues là où quelqu'un en a le mandat et les moyens. C'est une hypothèse : les trois jeux de données mesurent des choses différentes, et le lab ne teste pas pourquoi.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents ; les totaux nationaux ne disent rien d'une ville ou d'un foyer : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Ciò che sappiamo dipende da chi l'ha misurato",
      conclusion: "Il giorno 008 apre il deposito di semi delle Svalbard: 1,42 milioni di campioni conservati come backup delle colture del mondo. I luoghi del lab vi compaiono in modo molto diverso. Le banche nazionali del Messico non hanno inviato nulla, mentre il CIMMYT, centro internazionale vicino a Città del Messico, ha inviato 190.453 campioni; le banche nazionali degli Stati Uniti ne hanno 161.530. E, come nei giorni precedenti, il registro mostra chi riferisce: dieci paesi con semi nel deposito non hanno un dato 2024 nella banca dati della FAO sulle banche del germoplasma.",
      placesTitle: "I luoghi del lab nel deposito di semi",
      places: "Al valico Mexicali–Calexico (giorno 001), le banche nazionali degli Stati Uniti custodiscono 161.530 campioni a Svalbard; quelle del Messico, con 94.724 accessioni in casa, nessuno, anche se il CIMMYT, vicino a Città del Messico, ne custodisce 190.453. Il Canada, dove si trova il lago Abraham (giorno 004), ne custodisce 34.952, e la Nuova Zelanda, dove si trovano le grotte di Waitomo (giorno 002), 3.121.",
      observersTitle: "Ogni dataset è anche una mappa di chi osserva",
      observers: "I conteggi delle lucciole sono cambiati una volta divisi per lo sforzo di osservazione (giorno 002); il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003); esiste una grammatica per il 66% delle lingue vive del Sud America ma per il 25% in Papunesia (giorno 005); 11 paesi su 228 hanno una stima dello spreco alimentare ad alta affidabilità (giorno 006); radar e telescopi vedono circa metà degli oggetti oltre i 10 cm in orbita (giorno 007). Le banche del germoplasma lo ripetono: dieci paesi con semi a Svalbard, in testa la Corea del Sud, non riferiscono un dato 2024 alla FAO (giorno 008).",
      wasteTitle: "Risorse condivise, cura condivisa",
      waste: "Circa un quinto del cibo disponibile per i consumatori viene sprecato (giorno 006) e metà di ciò che è tracciato in orbita non funziona più (giorno 007); nel deposito di semi, 13 centri internazionali hanno fornito il 55% dei campioni (giorno 008). Le risorse di tutti sembrano curate soprattutto dove qualcuno ha il mandato e i fondi per farlo. È un'ipotesi: i tre dataset misurano cose diverse, e il lab non verifica il perché.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi; i totali nazionali non dicono nulla di una città o di una famiglia: questi legami sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    pt: {
      eyebrow: "Conectando os dias · até o Dia {day}",
      title: "O que sabemos depende de quem mediu",
      conclusion: "O Dia 008 abre o cofre de sementes de Svalbard: 1,42 milhão de amostras guardadas como backup das culturas do mundo. Os lugares do lab aparecem ali de forma muito diferente. Os bancos nacionais do México não enviaram nada, enquanto o CIMMYT, centro internacional perto da Cidade do México, enviou 190.453 amostras; os bancos nacionais dos Estados Unidos têm 161.530. E, como em dias anteriores, o registro mostra quem reporta: dez países com sementes no cofre não têm dado de 2024 na base de bancos de germoplasma da FAO.",
      placesTitle: "Os lugares do lab no cofre de sementes",
      places: "Na travessia Mexicali–Calexico (Dia 001), os bancos nacionais dos Estados Unidos guardam 161.530 amostras em Svalbard; os do México, com 94.724 acessos em casa, nenhuma, embora o CIMMYT, perto da Cidade do México, guarde 190.453. O Canadá, onde fica o Lago Abraham (Dia 004), guarda 34.952, e a Nova Zelândia, onde ficam as cavernas de Waitomo (Dia 002), 3.121.",
      observersTitle: "Todo conjunto de dados é também um mapa de quem observa",
      observers: "As contagens de vaga-lumes mudaram quando divididas pelo esforço de observação (Dia 002); 78% das fotos de halos com localização vêm da Europa e da América do Norte (Dia 003); há gramática para 66% das línguas vivas da América do Sul, mas para 25% na Papuásia (Dia 005); 11 de 228 países têm estimativa de desperdício de alimentos de alta confiança (Dia 006); radares e telescópios veem cerca de metade dos objetos maiores que 10 cm em órbita (Dia 007). Os bancos de germoplasma repetem o padrão: dez países com sementes em Svalbard, liderados pela Coreia do Sul, não reportam dado de 2024 à FAO (Dia 008).",
      wasteTitle: "Recursos compartilhados, cuidado compartilhado",
      waste: "Cerca de um quinto da comida disponível aos consumidores é desperdiçado (Dia 006) e metade do que é rastreado em órbita não funciona mais (Dia 007); no cofre de sementes, 13 centros internacionais forneceram 55% das amostras (Dia 008). Recursos que são de todos parecem cuidados sobretudo onde alguém tem o mandato e o dinheiro para isso. É uma hipótese: os três conjuntos de dados medem coisas diferentes, e o lab não testa por quê.",
      caveat: "Cada dia usa lugares, anos e fontes diferentes; totais nacionais nada dizem sobre uma cidade ou um domicílio, então essas conexões são padrões a explorar, não provas.",
      dataTag: "Dos dados", hypTag: "Hipótese", day: "Dia {n}", readMore: "Ver as conexões no lab",
    },
    ja: {
      eyebrow: "日をつなぐ · Day {day}まで",
      title: "何がわかるかは、誰が測ったかで決まる",
      conclusion: "Day 008はスバールバルの種子貯蔵庫を開きます。世界の作物のバックアップとして142万の種子サンプルが保管されています。ラボの舞台となった場所は、そこでまったく違う姿を見せます。メキシコの国内ジーンバンクは何も送っていませんが、メキシコ市近郊の国際センターCIMMYTは190,453サンプルを送り、米国の国内ジーンバンクは161,530です。そしてこれまでの日と同じく、記録は誰が報告するかを映します。貯蔵庫に種子がある10か国は、FAOのジーンバンクデータベースに2024年の値がありません。",
      placesTitle: "種子貯蔵庫の中のラボの舞台",
      places: "メキシカリ–カレキシコの国境（Day 001）を挟んで、米国の国内ジーンバンクはスバールバルに161,530サンプルを預けています。国内に94,724点を持つメキシコの国内ジーンバンクはゼロですが、メキシコ市近郊のCIMMYTは190,453です。アブラハム湖のあるカナダ（Day 004）は34,952、ワイトモ洞窟のあるニュージーランド（Day 002）は3,121です。",
      observersTitle: "どのデータも観察者の地図でもある",
      observers: "ツチボタルの記録数は観察努力で割ると変わりました（Day 002）。位置のわかるハロー写真の78%はヨーロッパと北米からです（Day 003）。文法書があるのは南米の現存言語の66%、パプネシアでは25%です（Day 005）。食品廃棄の推計が高い信頼度なのは228か国中11か国です（Day 006）。レーダーと望遠鏡が捉えるのは10 cm超の軌道物体の約半分です（Day 007）。ジーンバンクも同じで、韓国をはじめスバールバルに種子がある10か国はFAOに2024年の値を報告していません（Day 008）。",
      wasteTitle: "共有の資源、共有の手入れ",
      waste: "消費者が手にできる食料の約5分の1が廃棄され（Day 006）、軌道上で追跡される物体の半分はもう機能していません（Day 007）。種子貯蔵庫では、13の国際センターがサンプルの55%を寄託しました（Day 008）。みんなの資源は、任務と資金を持つ誰かがいるところでおもに守られているように見えます。これは仮説です。3つのデータは異なるものを測っており、ラボは理由を検証していません。",
      caveat: "日ごとに場所、年、出典が異なります。国の合計は個々の都市や家庭については何も語らないため、これらのつながりは探る価値のあるパターンであって証拠ではありません。",
      dataTag: "データから", hypTag: "仮説", day: "Day {n}", readMore: "ラボでつながりを見る",
    },
    zh: {
      eyebrow: "连接各天 · 截至第 {day} 天",
      title: "我们知道什么，取决于谁去测量",
      conclusion: "第 008 天打开了斯瓦尔巴种子库：142万份种子样本作为世界作物的备份保存在那里。实验室的几个地点在其中的位置大不相同。墨西哥的国家基因库什么也没有送去，而墨西哥城附近的国际中心CIMMYT送去了190,453份；美国国家基因库有161,530份。和前几天一样，记录也反映了谁在报告：在种子库有种子的10个国家在粮农组织的基因库数据库中没有2024年数据。",
      placesTitle: "实验室的地点在种子库里",
      places: "在墨西卡利–卡莱克西科口岸（第 001 天）两侧，美国国家基因库在斯瓦尔巴存有161,530份样本；墨西哥国家基因库在本国有94,724份种质，却一份也没有存放，不过墨西哥城附近的CIMMYT存有190,453份。阿伯拉罕湖所在的加拿大（第 004 天）存有34,952份，怀托摩洞穴所在的新西兰（第 002 天）存有3,121份。",
      observersTitle: "每个数据集也是观察者的地图",
      observers: "萤火虫记录数除以观察努力后发生了变化（第 002 天）；有位置的晕像照片78%来自欧洲和北美（第 003 天）；南美现存语言66%有语法书，巴布内西亚只有25%（第 005 天）；228个国家中只有11个的食物浪费估计属于高可信度（第 006 天）；雷达和望远镜大约只看到轨道上大于10厘米物体的一半（第 007 天）。基因库也是如此：以韩国为首、在斯瓦尔巴有种子的10个国家没有向粮农组织报告2024年数据（第 008 天）。",
      wasteTitle: "共享的资源，共同的照料",
      waste: "消费者可获得的食物约五分之一被浪费（第 006 天），轨道上被跟踪的物体有一半已不再工作（第 007 天）；在种子库里，13个国际中心提供了55%的样本（第 008 天）。属于所有人的资源，似乎主要在有人肩负职责并有经费的地方得到照料。这是一个假设：三个数据集测量的是不同的东西，实验室没有检验原因。",
      caveat: "每天使用的地点、年份和来源都不同；国家总数无法说明某个城市或家庭的情况，因此这些联系是值得探索的模式，而不是证据。",
      dataTag: "来自数据", hypTag: "假设", day: "第 {n} 天", readMore: "在实验室查看这些联系",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
