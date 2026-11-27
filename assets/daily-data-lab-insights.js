// Cross-day insight: how the newest Daily Data Lab day connects with the earlier ones.
// Rewrite it with every new day (see daily-data-lab/CLAUDE.md). Shown on the lab home and the portfolio.
//
// Where the numbers come from (computed 2026-11-27):
// - Dark skies (Day 010, data/day-010-dark-skies/day-010.json; Falchi et al. 2016 Table 2 and World Atlas 2015 GeoTIFF,
//   Globe at Night 2011–2025, Wikidata, World Bank): 83.2% of the world's people under light-polluted skies, 35.9% without
//   the Milky Way; United States 77.6%, Mexico 58.3%, Canada 76.2%, New Zealand 56.4% without the Milky Way. Atlas artificial
//   brightness sampled at 1′ (raw/day-010-dark-skies/falchi_1arcmin.npy) at Day 001's Mexicali (32.62, −115.45) 6,392 μcd/m²
//   and Calexico (32.68, −115.50) 4,828; Day 002's Waitomo (−38.26, 175.10, src/days/day-002-glowworms/data.js) 15.2
//   (8.7% above the natural 174); Day 004's Abraham Lake (52.31, −116.33, data/day-004-abraham-lake) 3.9 (2.2% above).
//   Globe at Night: yearly mean limiting magnitude 3.54 (2011) → 3.15 (2022) while the median atlas brightness at observers'
//   sites fell 1.39 → 0.78 mcd/m²; within 1° cell × constellation groups ≈ 7.4%/yr brighter (95% CI 5.5–9.2), Kyba et al.
//   (2023) 9.6%/yr (7–10%), satellites 2.2%/yr (Kyba et al. 2017). Wikidata: 87 of 135 certified dark-sky places in the US,
//   none in Mexico; 73 of 130 under skies above 14 μcd/m².
// - Earlier days: glowworm counts changed after dividing by iNaturalist effort (Day 002); 78% of located halo photos from
//   Europe and North America, and light pillars need ground lights (Day 003); grammars for 66% of living languages in South
//   America vs 25% in Papunesia (Day 005); 11 of 228 countries with a high-confidence food-waste estimate (Day 006); 50% of
//   tracked objects in orbit are not working satellites (Day 007); 13 international centres deposited 54.7% of Svalbard's
//   samples (Day 008); UN and WHO life expectancies differ by 1.4 years on average (Day 009).
export const LAB_INSIGHT = {
  throughDay: 10,
  days: { places: [1, 2, 4, 10], observers: [2, 3, 5, 6, 9, 10], waste: [3, 7, 8, 10] },
  threads: [
    { id: "places", tags: ["data"] },
    { id: "observers", tags: ["data"] },
    { id: "waste", tags: ["data", "hyp"] },
  ],
  text: {
    en: {
      eyebrow: "Connecting the days · through Day {day}",
      title: "What we know depends on who measured it",
      conclusion: "Day 010 asks how many people have lost the night sky. In the 2015 atlas, 83.2% of people live under light-polluted skies and 35.9% cannot see the Milky Way from home. How fast it is getting worse depends again on who measures: satellites see about 2% a year, human eyes 7–10%, and even the eyes only show it once we account for volunteers moving to darker places.",
      placesTitle: "The lab's places under the night sky",
      places: "The Mexicali–Calexico crossing (Day 001) glows at 6,392 and 4,828 μcd/m² of artificial light, 28 to 37 times the natural sky, so the Milky Way is gone on both sides; 58.3% of Mexicans and 77.6% of people in the United States cannot see it from home. Waitomo, home of the glowworms (Day 002), sits at 15 μcd/m², just past the atlas's light-polluted line, and Abraham Lake (Day 004) at 3.9 μcd/m², only 2% above a natural sky.",
      observersTitle: "Every dataset is also a map of its observers",
      observers: "Glowworm counts changed once divided by observer effort (Day 002); 78% of located halo photos come from Europe and North America (Day 003); grammars exist for 66% of living languages in South America but 25% in Papunesia (Day 005); 11 of 228 countries have a high-confidence food-waste estimate (Day 006); UN and WHO life expectancies differ by 1.4 years on average (Day 009). Star counts repeat it: Globe at Night volunteers moved to darker sites (median atlas brightness 1.39 → 0.78 mcd/m², 2011–2022), which hides a brightening of about 7% a year in the raw averages (Day 010).",
      wasteTitle: "Shared resources, shared care",
      waste: "The dark night is a shared resource like the food supply, orbital space and seed collections. Care is concentrated: 13 international centres supplied 55% of Svalbard's seeds (Day 008), half of what is tracked in orbit no longer works (Day 007), and 87 of the 135 certified dark-sky places in Wikidata are in the United States, none in Mexico (Day 010). The same ground lights that draw light pillars on cold nights (Day 003) are what hide the stars. That they share a cause is a hypothesis: the datasets measure different things, and the lab does not test why.",
      caveat: "Each day uses different places, years, and sources; national averages and single map points say nothing about a single street, household or person, so these links are patterns worth exploring, not proof.",
      dataTag: "From the data", hypTag: "Hypothesis", day: "Day {n}", readMore: "See the connections in the lab",
    },
    es: {
      eyebrow: "Conectando los días · hasta el Día {day}",
      title: "Lo que sabemos depende de quién lo midió",
      conclusion: "El Día 010 pregunta cuántas personas han perdido el cielo nocturno. Según el atlas 2015, el 83.2% de la población vive bajo cielos con contaminación lumínica y el 35.9% no puede ver la Vía Láctea desde casa. Qué tan rápido empeora depende otra vez de quién mide: los satélites ven cerca de 2% al año, el ojo humano 7–10%, y aun el ojo solo lo muestra cuando se toma en cuenta que los voluntarios se mudaron a lugares más oscuros.",
      placesTitle: "Los lugares del Lab bajo el cielo nocturno",
      places: "El cruce Mexicali–Calexico (Día 001) brilla con 6,392 y 4,828 μcd/m² de luz artificial, de 28 a 37 veces el cielo natural, así que la Vía Láctea desapareció de ambos lados; el 58.3% de los mexicanos y el 77.6% de la población de Estados Unidos no pueden verla desde casa. Waitomo, hogar de las luciérnagas (Día 002), está en 15 μcd/m², apenas pasando la línea de contaminación lumínica del atlas, y el lago Abraham (Día 004) en 3.9 μcd/m², solo 2% por encima de un cielo natural.",
      observersTitle: "Cada conjunto de datos también es un mapa de quienes observan",
      observers: "Los conteos de luciérnagas cambiaron al dividirlos entre el esfuerzo de observación (Día 002); el 78% de las fotos de halos con ubicación vienen de Europa y Norteamérica (Día 003); hay gramática para el 66% de las lenguas vivas de Sudamérica, pero solo para el 25% en Papunesia (Día 005); 11 de 228 países tienen una estimación de desperdicio de alta confianza (Día 006); la esperanza de vida de la ONU y la de la OMS difieren 1.4 años en promedio (Día 009). Los conteos de estrellas lo repiten: los voluntarios de Globe at Night se mudaron a sitios más oscuros (mediana del brillo del atlas 1.39 → 0.78 mcd/m², 2011–2022), lo que oculta en los promedios crudos un aumento del brillo de cerca de 7% al año (Día 010).",
      wasteTitle: "Recursos compartidos, cuidado compartido",
      waste: "La noche oscura es un recurso compartido, como la comida, el espacio orbital y las colecciones de semillas. El cuidado está concentrado: 13 centros internacionales aportaron el 55% de las semillas de Svalbard (Día 008), la mitad de lo que se rastrea en órbita ya no funciona (Día 007) y 87 de los 135 lugares de cielo oscuro certificados en Wikidata están en Estados Unidos, ninguno en México (Día 010). Las mismas luces del suelo que dibujan pilares de luz en noches frías (Día 003) son las que ocultan las estrellas. Que compartan una causa es una hipótesis: los conjuntos de datos miden cosas distintas y el Lab no prueba por qué.",
      caveat: "Cada día usa lugares, años y fuentes distintos; los promedios nacionales y los puntos aislados de un mapa no dicen nada de una calle, un hogar o una persona en particular, así que estas conexiones son patrones para explorar, no pruebas.",
      dataTag: "De los datos", hypTag: "Hipótesis", day: "Día {n}", readMore: "Ver las conexiones en el Lab",
    },
    fr: {
      eyebrow: "Relier les jours · jusqu'au jour {day}",
      title: "Ce que l'on sait dépend de qui l'a mesuré",
      conclusion: "Le jour 010 demande combien de personnes ont perdu le ciel nocturne. Dans l'atlas 2015, 83,2 % de la population vit sous un ciel pollué par la lumière et 35,9 % ne peut pas voir la Voie lactée depuis chez soi. La vitesse à laquelle cela empire dépend encore de qui mesure : les satellites voient environ 2 % par an, l'œil humain 7–10 %, et même l'œil ne le montre qu'une fois pris en compte le déplacement des volontaires vers des lieux plus sombres.",
      placesTitle: "Les lieux du lab sous le ciel nocturne",
      places: "Le passage Mexicali–Calexico (jour 001) brille de 6 392 et 4 828 μcd/m² de lumière artificielle, 28 à 37 fois le ciel naturel : la Voie lactée a disparu des deux côtés ; 58,3 % des Mexicains et 77,6 % des habitants des États-Unis ne peuvent pas la voir depuis chez eux. Waitomo, le pays des vers luisants (jour 002), est à 15 μcd/m², juste au-delà du seuil de pollution de l'atlas, et le lac Abraham (jour 004) à 3,9 μcd/m², seulement 2 % au-dessus d'un ciel naturel.",
      observersTitle: "Chaque jeu de données est aussi une carte de ses observateurs",
      observers: "Les effectifs de vers luisants ont changé une fois divisés par l'effort d'observation (jour 002) ; 78 % des photos de halos localisées viennent d'Europe et d'Amérique du Nord (jour 003) ; 66 % des langues vivantes d'Amérique du Sud ont une grammaire, contre 25 % en Papunésie (jour 005) ; 11 pays sur 228 ont une estimation du gaspillage de haute confiance (jour 006) ; les espérances de vie de l'ONU et de l'OMS diffèrent en moyenne de 1,4 an (jour 009). Les comptages d'étoiles le répètent : les volontaires de Globe at Night se sont déplacés vers des sites plus sombres (luminance médiane de l'atlas 1,39 → 0,78 mcd/m², 2011–2022), ce qui masque dans les moyennes brutes un éclaircissement d'environ 7 % par an (jour 010).",
      wasteTitle: "Ressources partagées, soin partagé",
      waste: "La nuit noire est une ressource partagée, comme l'alimentation, l'espace orbital et les collections de semences. Le soin est concentré : 13 centres internationaux ont fourni 55 % des semences du Svalbard (jour 008), la moitié de ce qui est suivi en orbite ne fonctionne plus (jour 007), et 87 des 135 lieux de ciel étoilé certifiés de Wikidata sont aux États-Unis, aucun au Mexique (jour 010). Les mêmes lumières au sol qui dessinent des piliers lumineux par nuit froide (jour 003) cachent les étoiles. Qu'ils partagent une cause est une hypothèse : les jeux de données mesurent des choses différentes et le lab ne teste pas pourquoi.",
      caveat: "Chaque jour utilise des lieux, des années et des sources différents ; les moyennes nationales et les points isolés d'une carte ne disent rien d'une rue, d'un foyer ou d'une personne : ces liens sont des pistes à explorer, pas des preuves.",
      dataTag: "Données", hypTag: "Hypothèse", day: "Jour {n}", readMore: "Voir les liens dans le lab",
    },
    it: {
      eyebrow: "Collegare i giorni · fino al giorno {day}",
      title: "Ciò che sappiamo dipende da chi l'ha misurato",
      conclusion: "Il giorno 010 chiede quante persone abbiano perso il cielo notturno. Nell'atlante 2015 l'83,2% della popolazione vive sotto cieli inquinati dalla luce e il 35,9% non può vedere la Via Lattea da casa. Quanto in fretta peggiora dipende di nuovo da chi misura: i satelliti vedono circa il 2% l'anno, l'occhio umano il 7–10%, e persino l'occhio lo mostra solo dopo aver considerato che i volontari si sono spostati in luoghi più bui.",
      placesTitle: "I luoghi del lab sotto il cielo notturno",
      places: "Il valico Mexicali–Calexico (giorno 001) brilla con 6.392 e 4.828 μcd/m² di luce artificiale, da 28 a 37 volte il cielo naturale: la Via Lattea è sparita da entrambi i lati; il 58,3% dei messicani e il 77,6% della popolazione degli Stati Uniti non può vederla da casa. Waitomo, casa delle lucciole (giorno 002), è a 15 μcd/m², appena oltre la soglia di inquinamento dell'atlante, e il lago Abraham (giorno 004) a 3,9 μcd/m², solo il 2% sopra un cielo naturale.",
      observersTitle: "Ogni dataset è anche una mappa di chi osserva",
      observers: "I conteggi delle lucciole sono cambiati una volta divisi per lo sforzo di osservazione (giorno 002); il 78% delle foto di aloni localizzate viene da Europa e Nord America (giorno 003); esiste una grammatica per il 66% delle lingue vive del Sud America ma per il 25% in Papunesia (giorno 005); 11 paesi su 228 hanno una stima dello spreco ad alta affidabilità (giorno 006); le speranze di vita di ONU e OMS differiscono in media di 1,4 anni (giorno 009). I conteggi di stelle lo confermano: i volontari di Globe at Night si sono spostati in siti più bui (brillanza mediana dell'atlante 1,39 → 0,78 mcd/m², 2011–2022), nascondendo nelle medie grezze uno schiarimento di circa il 7% l'anno (giorno 010).",
      wasteTitle: "Risorse condivise, cura condivisa",
      waste: "La notte buia è una risorsa condivisa, come il cibo, lo spazio orbitale e le collezioni di semi. La cura è concentrata: 13 centri internazionali hanno fornito il 55% dei semi delle Svalbard (giorno 008), metà di ciò che è tracciato in orbita non funziona più (giorno 007) e 87 dei 135 luoghi a cielo buio certificati in Wikidata sono negli Stati Uniti, nessuno in Messico (giorno 010). Le stesse luci a terra che disegnano colonne luminose nelle notti fredde (giorno 003) nascondono le stelle. Che abbiano una causa comune è un'ipotesi: i dataset misurano cose diverse e il lab non verifica perché.",
      caveat: "Ogni giorno usa luoghi, anni e fonti diversi; le medie nazionali e i singoli punti di una mappa non dicono nulla di una strada, di una famiglia o di una persona: questi legami sono spunti da esplorare, non prove.",
      dataTag: "Dai dati", hypTag: "Ipotesi", day: "Giorno {n}", readMore: "Vedi i collegamenti nel lab",
    },
    pt: {
      eyebrow: "Conectando os dias · até o Dia {day}",
      title: "O que sabemos depende de quem mediu",
      conclusion: "O Dia 010 pergunta quantas pessoas perderam o céu noturno. No atlas 2015, 83,2% da população vive sob céus com poluição luminosa e 35,9% não consegue ver a Via Láctea de casa. A rapidez com que isso piora depende de novo de quem mede: os satélites veem cerca de 2% ao ano, o olho humano 7–10%, e mesmo o olho só mostra isso quando se considera que os voluntários passaram a observar em lugares mais escuros.",
      placesTitle: "Os lugares do lab sob o céu noturno",
      places: "A travessia Mexicali–Calexico (Dia 001) brilha com 6.392 e 4.828 μcd/m² de luz artificial, de 28 a 37 vezes o céu natural, então a Via Láctea sumiu dos dois lados; 58,3% dos mexicanos e 77,6% da população dos Estados Unidos não conseguem vê-la de casa. Waitomo, lar dos vaga-lumes (Dia 002), está em 15 μcd/m², logo acima da linha de poluição luminosa do atlas, e o lago Abraham (Dia 004) em 3,9 μcd/m², só 2% acima de um céu natural.",
      observersTitle: "Todo conjunto de dados é também um mapa de quem observa",
      observers: "As contagens de vaga-lumes mudaram quando divididas pelo esforço de observação (Dia 002); 78% das fotos de halos com localização vêm da Europa e da América do Norte (Dia 003); há gramática para 66% das línguas vivas da América do Sul, mas para 25% na Papunésia (Dia 005); 11 de 228 países têm estimativa de desperdício de alta confiança (Dia 006); as expectativas de vida da ONU e da OMS diferem 1,4 ano em média (Dia 009). As contagens de estrelas repetem isso: os voluntários do Globe at Night passaram para locais mais escuros (mediana do brilho do atlas 1,39 → 0,78 mcd/m², 2011–2022), o que esconde nas médias brutas um clareamento de cerca de 7% ao ano (Dia 010).",
      wasteTitle: "Recursos compartilhados, cuidado compartilhado",
      waste: "A noite escura é um recurso compartilhado, como a comida, o espaço orbital e as coleções de sementes. O cuidado é concentrado: 13 centros internacionais forneceram 55% das sementes de Svalbard (Dia 008), metade do que é rastreado em órbita não funciona mais (Dia 007) e 87 dos 135 lugares de céu escuro certificados no Wikidata ficam nos Estados Unidos, nenhum no México (Dia 010). As mesmas luzes no chão que desenham pilares de luz em noites frias (Dia 003) escondem as estrelas. Que tenham uma causa comum é uma hipótese: os conjuntos de dados medem coisas diferentes e o lab não testa por quê.",
      caveat: "Cada dia usa lugares, anos e fontes diferentes; médias nacionais e pontos isolados de um mapa nada dizem sobre uma rua, um domicílio ou uma pessoa, então essas conexões são padrões a explorar, não provas.",
      dataTag: "Dos dados", hypTag: "Hipótese", day: "Dia {n}", readMore: "Ver as conexões no lab",
    },
    ja: {
      eyebrow: "日をつなぐ · Day {day}まで",
      title: "何がわかるかは、誰が測ったかで決まる",
      conclusion: "Day 010は、夜空を失った人がどれくらいいるかを問います。2015年のアトラスでは、人口の83.2%が光害のある空の下で暮らし、35.9%が自宅から天の川を見られません。悪化の速さもまた、誰が測るかで変わります。衛星では年約2%、人の目では7–10%。しかも目による記録も、ボランティアがより暗い場所へ移ったことを考慮して初めてそれを示します。",
      placesTitle: "夜空の下のラボの舞台",
      places: "メキシカリ–カレキシコの国境（Day 001）は人工光6,392と4,828 μcd/m²で輝き、自然の空の28–37倍。両側とも天の川は消えています。メキシコの人の58.3%、米国の人の77.6%が自宅から天の川を見られません。ツチボタルのワイトモ（Day 002）は15 μcd/m²でアトラスの光害の線をわずかに越え、アブラハム湖（Day 004）は3.9 μcd/m²で自然の空より2%明るいだけです。",
      observersTitle: "どのデータも観察者の地図でもある",
      observers: "ツチボタルの記録数は観察努力で割ると変わりました（Day 002）。位置のわかるハロー写真の78%はヨーロッパと北米からです（Day 003）。文法書があるのは南米の現存言語の66%、パプネシアでは25%です（Day 005）。食品廃棄の推計が高い信頼度なのは228か国中11か国です（Day 006）。国連とWHOの平均寿命は平均1.4年異なります（Day 009）。星の観測も同じです。Globe at Night のボランティアはより暗い場所へ移り（アトラス輝度の中央値 1.39 → 0.78 mcd/m²、2011–2022年）、生の平均では年約7%の増光が隠れてしまいます（Day 010）。",
      wasteTitle: "共有の資源、共有の手入れ",
      waste: "暗い夜は、食料や軌道空間、種子コレクションと同じく共有の資源です。手入れは偏っています。スバールバルの種子の55%は13の国際センターが預け（Day 008）、軌道上で追跡される物体の半分はもう機能せず（Day 007）、Wikidataの認定ダークスカイ地域135か所のうち87か所は米国、メキシコは0か所です（Day 010）。寒い夜に光柱を描く地上の明かり（Day 003）こそが、星を隠しています。原因が共通だというのは仮説です。データはそれぞれ別のものを測っており、ラボはその理由を検証していません。",
      caveat: "日ごとに場所、年、出典が異なります。国の平均や地図上の1点は、個々の通りや家庭、人については何も語らないため、これらのつながりは探る価値のあるパターンであって証拠ではありません。",
      dataTag: "データから", hypTag: "仮説", day: "Day {n}", readMore: "ラボでつながりを見る",
    },
    zh: {
      eyebrow: "连接各天 · 截至第 {day} 天",
      title: "我们知道什么，取决于谁去测量",
      conclusion: "第 010 天探讨有多少人失去了夜空。根据2015年地图集，83.2%的人生活在光污染夜空下，35.9%在家看不到银河。情况恶化得多快，同样取决于谁在测量：卫星看到每年约2%，人眼看到7–10%；而且只有考虑到志愿者转向更暗的地点之后，人眼的记录才显示出这一点。",
      placesTitle: "夜空下的实验室地点",
      places: "墨西卡利–卡莱克西科口岸（第 001 天）的人工光为6,392和4,828 μcd/m²，是自然夜空的28到37倍，两侧都已看不到银河；58.3%的墨西哥人和77.6%的美国人在家看不到银河。萤火虫所在的怀托摩（第 002 天）为15 μcd/m²，刚刚越过地图集的光污染线；阿伯拉罕湖（第 004 天）为3.9 μcd/m²，只比自然夜空亮2%。",
      observersTitle: "每个数据集也是观察者的地图",
      observers: "萤火虫记录数除以观察努力后发生了变化（第 002 天）；有位置的晕像照片78%来自欧洲和北美（第 003 天）；南美现存语言66%有语法书，巴布内西亚只有25%（第 005 天）；228个国家中只有11个的食物浪费估计属于高可信度（第 006 天）；联合国与世卫组织的预期寿命平均相差1.4年（第 009 天）。观星记录也是如此：Globe at Night 的志愿者转移到了更暗的地点（地图集亮度中位数 1.39 → 0.78 mcd/m²，2011–2022年），在原始平均值中掩盖了每年约7%的变亮（第 010 天）。",
      wasteTitle: "共享的资源，共同的照料",
      waste: "黑暗的夜晚和食物、轨道空间、种子库一样，是共享的资源。照料高度集中：斯瓦尔巴的种子有55%来自13个国际中心（第 008 天），轨道上被跟踪的物体有一半已不再工作（第 007 天），Wikidata中135处认证暗夜地有87处在美国，墨西哥一处也没有（第 010 天）。在寒冷夜晚画出光柱的地面灯光（第 003 天），正是遮住星星的灯光。它们有共同原因只是一个假设：这些数据集测量的是不同的东西，实验室没有检验原因。",
      caveat: "每天使用的地点、年份和来源都不同；国家平均值和地图上的单个点无法说明某条街、某个家庭或某个人的情况，因此这些联系是值得探索的模式，而不是证据。",
      dataTag: "来自数据", hypTag: "假设", day: "第 {n} 天", readMore: "在实验室查看这些联系",
    },
  },
};

/** Insight text in a language, falling back to English key by key. */
export function insightText(language, key, values = {}) {
  const pick = LAB_INSIGHT.text[language]?.[key] ?? LAB_INSIGHT.text.en[key] ?? "";
  return pick.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}
