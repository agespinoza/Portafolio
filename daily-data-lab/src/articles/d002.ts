import type { ArticleSet } from "./types";

// Figures from src/days/day-002-glowworms/snapshot.json, recomputed in the Day 002 Excel workbook (Analysis A–C).
export const D002: ArticleSet = {
  en: {
    title: "Where do New Zealand's glowworms shine? Citizen-science records of Arachnocampa luminosa corrected for observer effort",
    abstract: "I analyse all 1,215 georeferenced GBIF records of the New Zealand glowworm (Arachnocampa luminosa), 95.5% of them made since 2016, mostly through iNaturalist. Raw counts point to Wellington (253 records), the region where most people observe nature. Dividing iNaturalist glowworm records by all iNaturalist observations in each region changes the picture: the West Coast leads with 194 records per 100,000 observations (95% interval 167–224), followed by Waikato, home of the Waitomo Caves (117), while Wellington falls to sixth (60). Correcting for effort also moves the seasonal peak from April to June. The records describe where people document glowworms, not their true distribution.",
    keywords: ["glowworms", "Arachnocampa luminosa", "citizen science", "observer effort", "GBIF", "iNaturalist", "New Zealand"],
    sections: [
      { h: "Introduction", p: [
        "Arachnocampa luminosa is a fungus gnat whose larvae glow to lure prey in caves, gorges and damp forest banks. The Waitomo Caves made it famous, but the species lives across New Zealand. Public records of it now come mostly from citizen scientists, whose activity is uneven across regions and seasons. The question here is where and when glowworms are recorded once that unevenness is taken into account.",
      ] },
      { h: "Data and methods", p: [
        "Records come from GBIF's occurrence search for taxon key 1564326, keeping those with coordinates and no geospatial issue: 1,215 records from 1914 to 2026, of which 1,190 are iNaturalist observations, 24 museum specimens or samples and 1 other observation. The observer-effort denominator is the number of all iNaturalist research-grade observations in New Zealand, of every species, by region, month and year, from GBIF facets (16 regions). Monthly climate at Waitomo for 2021–2025 comes from Open-Meteo (ERA5).",
        "The reporting rate is iNaturalist glowworm records divided by all iNaturalist observations in the same region (or month), per 100,000. Intervals are approximate 95% Poisson intervals (Wilson–Hilferty). Regions with fewer than 10 records are flagged and not ranked.",
      ] },
      { h: "Results", p: [
        "By raw count, Wellington (253), Waikato (210) and the West Coast (188) lead. By reporting rate, the West Coast is first with 194 per 100,000 observations (167–224), Waikato second (117; 102–134) and Bay of Plenty third (104; 82–130); Wellington drops to sixth (60; 53–68) because its many observers record everything. Canterbury, Gisborne, Hawke's Bay and the Chatham Islands have too few records to rank.",
        "Raw records peak in April (197), but the rate peaks in June (73 per 100,000) and July (68), the coldest and wettest months at Waitomo, and is lowest in September (33). Across the 12 months, the rate correlates negatively with the mean daily high at Waitomo (r = −0.46), a descriptive figure from only 12 points. Records are recent: 95.5% of dated records were made in 2016 or later, as iNaturalist spread.",
      ] },
      { h: "Discussion", p: [
        "Correcting for observer effort matters more than any other step: it changes the leading region and the peak season. The West Coast combines limestone karst, gorges and high rainfall, conditions in which the larvae thrive, with few observers, so each observation there is more likely to be a glowworm. The winter peak in the rate may reflect longer nights and visits to caves and glowworm dells in the off-season, rather than more glowworms.",
      ] },
      { h: "Limitations", p: [
        "Records show where people photograph glowworms; caves and tourist sites dominate, and private land is under-sampled. The effort denominator counts observations of all species, which is a proxy for observer activity, not for night-time visits. Museum specimens are kept in the data but excluded from rates because no matching effort exists.",
      ] },
      { h: "Conclusion", p: [
        "Once observer effort is accounted for, the West Coast and Waikato stand out as the regions where glowworms are most often recorded, and winter becomes the season with the highest reporting rate.",
      ] },
    ],
    figure: "Georeferenced glowworm records in New Zealand, grouped about every 25 km, drawn as glowing points on a night map.",
  },
  es: {
    title: "¿Dónde brillan las luciérnagas de Nueva Zelanda? Registros de ciencia ciudadana de Arachnocampa luminosa corregidos por el esfuerzo de observación",
    abstract: "Analizo los 1,215 registros georreferenciados en GBIF de la luciérnaga de Nueva Zelanda (Arachnocampa luminosa), el 95.5% hechos desde 2016, sobre todo con iNaturalist. Los conteos brutos apuntan a Wellington (253 registros), la región donde más gente observa la naturaleza. Al dividir los registros de luciérnagas en iNaturalist entre todas las observaciones de iNaturalist de cada región, el panorama cambia: West Coast encabeza con 194 registros por cada 100,000 observaciones (intervalo de 95%: 167–224), seguida de Waikato, donde están las cuevas de Waitomo (117), mientras que Wellington baja al sexto lugar (60). Corregir por el esfuerzo también mueve el pico estacional de abril a junio. Los registros describen dónde la gente documenta luciérnagas, no su distribución real.",
    keywords: ["luciérnagas", "Arachnocampa luminosa", "ciencia ciudadana", "esfuerzo de observación", "GBIF", "iNaturalist", "Nueva Zelanda"],
    sections: [
      { h: "Introducción", p: [
        "Arachnocampa luminosa es un mosquito de los hongos cuyas larvas brillan para atraer presas en cuevas, cañadas y taludes húmedos del bosque. Las cuevas de Waitomo la hicieron famosa, pero la especie vive en toda Nueva Zelanda. Sus registros públicos vienen hoy sobre todo de científicos ciudadanos, cuya actividad es desigual entre regiones y estaciones. La pregunta es dónde y cuándo se registran luciérnagas una vez que se toma en cuenta esa desigualdad.",
      ] },
      { h: "Datos y métodos", p: [
        "Los registros vienen de la búsqueda de ocurrencias de GBIF para el taxón 1564326, conservando los que tienen coordenadas y ningún problema geoespacial: 1,215 registros de 1914 a 2026, de los cuales 1,190 son observaciones de iNaturalist, 24 especímenes o muestras de museo y 1 otra observación. El denominador de esfuerzo es el número de todas las observaciones de grado de investigación de iNaturalist en Nueva Zelanda, de cualquier especie, por región, mes y año, a partir de las facetas de GBIF (16 regiones). El clima mensual en Waitomo de 2021–2025 viene de Open-Meteo (ERA5).",
        "La tasa de registro es el número de registros de luciérnagas en iNaturalist entre todas las observaciones de iNaturalist de la misma región (o mes), por cada 100,000. Los intervalos son intervalos de Poisson de 95% aproximados (Wilson–Hilferty). Las regiones con menos de 10 registros se marcan y no se ordenan.",
      ] },
      { h: "Resultados", p: [
        "Por conteo bruto encabezan Wellington (253), Waikato (210) y West Coast (188). Por tasa de registro, West Coast es primera con 194 por cada 100,000 observaciones (167–224), Waikato segunda (117; 102–134) y Bay of Plenty tercera (104; 82–130); Wellington baja al sexto lugar (60; 53–68) porque sus muchos observadores registran de todo. Canterbury, Gisborne, Hawke's Bay y las islas Chatham tienen muy pocos registros para ordenarlas.",
        "Los registros brutos llegan a su máximo en abril (197), pero la tasa lo hace en junio (73 por cada 100,000) y julio (68), los meses más fríos y lluviosos en Waitomo, y es más baja en septiembre (33). En los 12 meses, la tasa se correlaciona negativamente con la máxima diaria promedio en Waitomo (r = −0.46), una cifra descriptiva de solo 12 puntos. Los registros son recientes: el 95.5% de los registros con fecha se hicieron en 2016 o después, conforme se extendió iNaturalist.",
      ] },
      { h: "Discusión", p: [
        "Corregir por el esfuerzo de observación importa más que cualquier otro paso: cambia la región líder y la temporada pico. West Coast combina karst de caliza, cañadas y mucha lluvia, condiciones en las que prosperan las larvas, con pocos observadores, así que cada observación ahí tiene más probabilidad de ser una luciérnaga. El pico invernal de la tasa puede reflejar noches más largas y visitas a cuevas y cañadas en temporada baja, más que un aumento de luciérnagas.",
      ] },
      { h: "Limitaciones", p: [
        "Los registros muestran dónde la gente fotografía luciérnagas; dominan las cuevas y los sitios turísticos, y los terrenos privados están submuestreados. El denominador cuenta observaciones de todas las especies, una aproximación de la actividad de los observadores, no de las visitas nocturnas. Los especímenes de museo se conservan en los datos pero se excluyen de las tasas porque no hay esfuerzo equivalente.",
      ] },
      { h: "Conclusión", p: [
        "Una vez considerado el esfuerzo de observación, West Coast y Waikato destacan como las regiones donde más se registran luciérnagas, y el invierno pasa a ser la temporada con la tasa de registro más alta.",
      ] },
    ],
    figure: "Registros georreferenciados de luciérnagas en Nueva Zelanda, agrupados cada 25 km aproximadamente, como puntos brillantes sobre un mapa nocturno.",
  },
  pt: {
    title: "Onde brilham os vaga-lumes da Nova Zelândia? Registros de ciência cidadã de Arachnocampa luminosa corrigidos pelo esforço de observação",
    abstract: "Analiso os 1.215 registros georreferenciados no GBIF do vaga-lume da Nova Zelândia (Arachnocampa luminosa), 95,5% feitos desde 2016, sobretudo pelo iNaturalist. As contagens brutas apontam para Wellington (253 registros), a região onde mais gente observa a natureza. Ao dividir os registros de vaga-lumes no iNaturalist por todas as observações do iNaturalist em cada região, o quadro muda: West Coast lidera com 194 registros por 100.000 observações (intervalo de 95%: 167–224), seguida de Waikato, onde ficam as cavernas de Waitomo (117), enquanto Wellington cai para o sexto lugar (60). A correção pelo esforço também desloca o pico sazonal de abril para junho. Os registros descrevem onde as pessoas documentam vaga-lumes, não sua distribuição real.",
    keywords: ["vaga-lumes", "Arachnocampa luminosa", "ciência cidadã", "esforço de observação", "GBIF", "iNaturalist", "Nova Zelândia"],
    sections: [
      { h: "Introdução", p: [
        "Arachnocampa luminosa é um mosquito-dos-fungos cujas larvas brilham para atrair presas em cavernas, desfiladeiros e barrancos úmidos de floresta. As cavernas de Waitomo a tornaram famosa, mas a espécie vive em toda a Nova Zelândia. Seus registros públicos vêm hoje sobretudo de cientistas cidadãos, cuja atividade é desigual entre regiões e estações. A pergunta é onde e quando os vaga-lumes são registrados depois de levar essa desigualdade em conta.",
      ] },
      { h: "Dados e métodos", p: [
        "Os registros vêm da busca de ocorrências do GBIF para o táxon 1564326, mantendo os que têm coordenadas e nenhum problema geoespacial: 1.215 registros de 1914 a 2026, dos quais 1.190 são observações do iNaturalist, 24 espécimes ou amostras de museu e 1 outra observação. O denominador de esforço é o número de todas as observações de grau de pesquisa do iNaturalist na Nova Zelândia, de qualquer espécie, por região, mês e ano, a partir das facetas do GBIF (16 regiões). O clima mensal em Waitomo em 2021–2025 vem do Open-Meteo (ERA5).",
        "A taxa de registro é o número de registros de vaga-lumes no iNaturalist dividido por todas as observações do iNaturalist da mesma região (ou mês), por 100.000. Os intervalos são intervalos de Poisson de 95% aproximados (Wilson–Hilferty). Regiões com menos de 10 registros são sinalizadas e não entram no ranking.",
      ] },
      { h: "Resultados", p: [
        "Pela contagem bruta lideram Wellington (253), Waikato (210) e West Coast (188). Pela taxa de registro, West Coast é a primeira com 194 por 100.000 observações (167–224), Waikato a segunda (117; 102–134) e Bay of Plenty a terceira (104; 82–130); Wellington cai para o sexto lugar (60; 53–68) porque seus muitos observadores registram de tudo. Canterbury, Gisborne, Hawke's Bay e as ilhas Chatham têm registros de menos para entrar no ranking.",
        "Os registros brutos atingem o máximo em abril (197), mas a taxa atinge em junho (73 por 100.000) e julho (68), os meses mais frios e chuvosos em Waitomo, e é mais baixa em setembro (33). Nos 12 meses, a taxa tem correlação negativa com a máxima diária média em Waitomo (r = −0,46), um número descritivo de apenas 12 pontos. Os registros são recentes: 95,5% dos registros com data foram feitos em 2016 ou depois, com a expansão do iNaturalist.",
      ] },
      { h: "Discussão", p: [
        "Corrigir pelo esforço de observação importa mais do que qualquer outra etapa: muda a região líder e a estação de pico. West Coast combina carste calcário, desfiladeiros e muita chuva, condições em que as larvas prosperam, com poucos observadores, então cada observação ali tem mais chance de ser um vaga-lume. O pico de inverno na taxa pode refletir noites mais longas e visitas a cavernas e vales na baixa temporada, e não mais vaga-lumes.",
      ] },
      { h: "Limitações", p: [
        "Os registros mostram onde as pessoas fotografam vaga-lumes; cavernas e pontos turísticos dominam, e terras privadas são pouco amostradas. O denominador conta observações de todas as espécies, uma aproximação da atividade dos observadores, não das visitas noturnas. Os espécimes de museu ficam nos dados, mas fora das taxas, porque não há esforço equivalente.",
      ] },
      { h: "Conclusão", p: [
        "Levando em conta o esforço de observação, West Coast e Waikato se destacam como as regiões onde os vaga-lumes são mais registrados, e o inverno passa a ser a estação com a maior taxa de registro.",
      ] },
    ],
    figure: "Registros georreferenciados de vaga-lumes na Nova Zelândia, agrupados a cada 25 km aproximadamente, como pontos brilhantes num mapa noturno.",
  },
  fr: {
    title: "Où brillent les vers luisants de Nouvelle-Zélande ? Observations participatives d’Arachnocampa luminosa corrigées de l’effort d’observation",
    abstract: "J’analyse les 1 215 données géoréférencées de GBIF sur le ver luisant de Nouvelle-Zélande (Arachnocampa luminosa), dont 95,5 % datent de 2016 ou après, surtout via iNaturalist. Les comptages bruts désignent Wellington (253 données), la région où l’on observe le plus la nature. En divisant les données iNaturalist de vers luisants par l’ensemble des observations iNaturalist de chaque région, le tableau change : la West Coast arrive en tête avec 194 données pour 100 000 observations (intervalle à 95 % : 167–224), devant le Waikato, où se trouvent les grottes de Waitomo (117), tandis que Wellington recule au sixième rang (60). La correction de l’effort déplace aussi le pic saisonnier d’avril à juin. Les données décrivent où l’on documente les vers luisants, pas leur répartition réelle.",
    keywords: ["vers luisants", "Arachnocampa luminosa", "science participative", "effort d’observation", "GBIF", "iNaturalist", "Nouvelle-Zélande"],
    sections: [
      { h: "Introduction", p: [
        "Arachnocampa luminosa est un moucheron fongivore dont les larves luisent pour attirer leurs proies dans les grottes, les gorges et les talus humides des forêts. Les grottes de Waitomo l’ont rendu célèbre, mais l’espèce vit dans toute la Nouvelle-Zélande. Ses données publiques proviennent désormais surtout de la science participative, dont l’activité varie selon les régions et les saisons. La question est de savoir où et quand on observe des vers luisants une fois cette inégalité prise en compte.",
      ] },
      { h: "Données et méthodes", p: [
        "Les données proviennent de la recherche d’occurrences de GBIF pour le taxon 1564326, en gardant celles qui ont des coordonnées et aucun problème géospatial : 1 215 données de 1914 à 2026, dont 1 190 observations iNaturalist, 24 spécimens ou échantillons de musée et 1 autre observation. Le dénominateur d’effort est le nombre de toutes les observations iNaturalist de qualité recherche en Nouvelle-Zélande, toutes espèces confondues, par région, mois et année, d’après les facettes de GBIF (16 régions). Le climat mensuel à Waitomo pour 2021–2025 provient d’Open-Meteo (ERA5).",
        "Le taux de signalement est le nombre de données iNaturalist de vers luisants divisé par toutes les observations iNaturalist de la même région (ou du même mois), pour 100 000. Les intervalles sont des intervalles de Poisson à 95 % approchés (Wilson–Hilferty). Les régions comptant moins de 10 données sont signalées et non classées.",
      ] },
      { h: "Résultats", p: [
        "En comptage brut, Wellington (253), le Waikato (210) et la West Coast (188) dominent. En taux de signalement, la West Coast est première avec 194 pour 100 000 observations (167–224), le Waikato deuxième (117 ; 102–134) et la Bay of Plenty troisième (104 ; 82–130) ; Wellington recule au sixième rang (60 ; 53–68), car ses nombreux observateurs notent tout. Canterbury, Gisborne, Hawke's Bay et les îles Chatham ont trop peu de données pour être classées.",
        "Les données brutes culminent en avril (197), mais le taux culmine en juin (73 pour 100 000) et en juillet (68), les mois les plus froids et les plus pluvieux à Waitomo, et il est au plus bas en septembre (33). Sur les 12 mois, le taux est négativement corrélé à la température maximale moyenne à Waitomo (r = −0,46), un chiffre descriptif calculé sur 12 points seulement. Les données sont récentes : 95,5 % des données datées ont été faites en 2016 ou après, avec l’essor d’iNaturalist.",
      ] },
      { h: "Discussion", p: [
        "Corriger l’effort d’observation compte plus que toute autre étape : cela change la région en tête et la saison de pointe. La West Coast associe karst calcaire, gorges et fortes pluies, des conditions où les larves prospèrent, à peu d’observateurs : chaque observation y a plus de chances d’être un ver luisant. Le pic hivernal du taux peut refléter des nuits plus longues et des visites de grottes et de vallons en basse saison plutôt que davantage de vers luisants.",
      ] },
      { h: "Limites", p: [
        "Les données montrent où l’on photographie des vers luisants ; grottes et sites touristiques dominent, et les terrains privés sont sous-échantillonnés. Le dénominateur compte les observations de toutes les espèces, un indicateur de l’activité des observateurs et non des sorties nocturnes. Les spécimens de musée restent dans les données mais sont exclus des taux, faute d’effort comparable.",
      ] },
      { h: "Conclusion", p: [
        "Une fois l’effort d’observation pris en compte, la West Coast et le Waikato ressortent comme les régions où l’on signale le plus de vers luisants, et l’hiver devient la saison au taux de signalement le plus élevé.",
      ] },
    ],
    figure: "Données géoréférencées de vers luisants en Nouvelle-Zélande, regroupées tous les 25 km environ, en points lumineux sur une carte nocturne.",
  },
  it: {
    title: "Dove brillano le lucciole della Nuova Zelanda? Segnalazioni di citizen science di Arachnocampa luminosa corrette per lo sforzo di osservazione",
    abstract: "Analizzo tutte le 1.215 segnalazioni georeferenziate in GBIF della lucciola della Nuova Zelanda (Arachnocampa luminosa), il 95,5% raccolte dal 2016, soprattutto tramite iNaturalist. I conteggi grezzi indicano Wellington (253 segnalazioni), la regione in cui più persone osservano la natura. Dividendo le segnalazioni iNaturalist di lucciole per tutte le osservazioni iNaturalist di ogni regione, il quadro cambia: la West Coast è in testa con 194 segnalazioni ogni 100.000 osservazioni (intervallo al 95%: 167–224), seguita dal Waikato, dove si trovano le grotte di Waitomo (117), mentre Wellington scende al sesto posto (60). La correzione per lo sforzo sposta anche il picco stagionale da aprile a giugno. Le segnalazioni descrivono dove le persone documentano le lucciole, non la loro distribuzione reale.",
    keywords: ["lucciole", "Arachnocampa luminosa", "citizen science", "sforzo di osservazione", "GBIF", "iNaturalist", "Nuova Zelanda"],
    sections: [
      { h: "Introduzione", p: [
        "Arachnocampa luminosa è un moscerino dei funghi le cui larve brillano per attirare le prede in grotte, gole e scarpate umide dei boschi. Le grotte di Waitomo l’hanno resa famosa, ma la specie vive in tutta la Nuova Zelanda. Le sue segnalazioni pubbliche oggi arrivano soprattutto dalla citizen science, la cui attività è disomogenea tra regioni e stagioni. La domanda è dove e quando le lucciole vengono segnalate una volta tenuto conto di questa disomogeneità.",
      ] },
      { h: "Dati e metodi", p: [
        "Le segnalazioni vengono dalla ricerca di occorrenze di GBIF per il taxon 1564326, tenendo quelle con coordinate e senza problemi geospaziali: 1.215 segnalazioni dal 1914 al 2026, di cui 1.190 osservazioni iNaturalist, 24 esemplari o campioni museali e 1 altra osservazione. Il denominatore dello sforzo è il numero di tutte le osservazioni iNaturalist di qualità scientifica in Nuova Zelanda, di ogni specie, per regione, mese e anno, dalle faccette di GBIF (16 regioni). Il clima mensile a Waitomo per il 2021–2025 viene da Open-Meteo (ERA5).",
        "Il tasso di segnalazione è il numero di segnalazioni iNaturalist di lucciole diviso per tutte le osservazioni iNaturalist della stessa regione (o mese), ogni 100.000. Gli intervalli sono intervalli di Poisson al 95% approssimati (Wilson–Hilferty). Le regioni con meno di 10 segnalazioni sono segnalate e non classificate.",
      ] },
      { h: "Risultati", p: [
        "Per conteggio grezzo guidano Wellington (253), il Waikato (210) e la West Coast (188). Per tasso di segnalazione, la West Coast è prima con 194 ogni 100.000 osservazioni (167–224), il Waikato secondo (117; 102–134) e la Bay of Plenty terza (104; 82–130); Wellington scende al sesto posto (60; 53–68) perché i suoi numerosi osservatori registrano di tutto. Canterbury, Gisborne, Hawke's Bay e le isole Chatham hanno troppe poche segnalazioni per essere classificate.",
        "Le segnalazioni grezze raggiungono il massimo ad aprile (197), ma il tasso lo raggiunge a giugno (73 ogni 100.000) e luglio (68), i mesi più freddi e piovosi a Waitomo, ed è minimo a settembre (33). Sui 12 mesi il tasso è correlato negativamente con la massima giornaliera media a Waitomo (r = −0,46), un dato descrittivo basato su soli 12 punti. Le segnalazioni sono recenti: il 95,5% di quelle datate risale al 2016 o dopo, con la diffusione di iNaturalist.",
      ] },
      { h: "Discussione", p: [
        "Correggere per lo sforzo di osservazione conta più di ogni altro passaggio: cambia la regione in testa e la stagione di picco. La West Coast unisce carsismo calcareo, gole e piogge abbondanti, condizioni in cui le larve prosperano, a pochi osservatori, per cui ogni osservazione lì ha più probabilità di essere una lucciola. Il picco invernale del tasso può riflettere notti più lunghe e visite a grotte e valli in bassa stagione, più che un aumento delle lucciole.",
      ] },
      { h: "Limiti", p: [
        "Le segnalazioni mostrano dove le persone fotografano le lucciole; dominano grotte e luoghi turistici, e i terreni privati sono poco campionati. Il denominatore conta le osservazioni di tutte le specie, un indicatore dell’attività degli osservatori e non delle uscite notturne. Gli esemplari museali restano nei dati ma sono esclusi dai tassi perché manca uno sforzo comparabile.",
      ] },
      { h: "Conclusione", p: [
        "Tenendo conto dello sforzo di osservazione, la West Coast e il Waikato emergono come le regioni in cui le lucciole sono segnalate più spesso, e l’inverno diventa la stagione con il tasso di segnalazione più alto.",
      ] },
    ],
    figure: "Segnalazioni georeferenziate di lucciole in Nuova Zelanda, raggruppate circa ogni 25 km, come punti luminosi su una mappa notturna.",
  },
  ja: {
    title: "ニュージーランドのツチボタルはどこで光るか：観察努力で補正したArachnocampa luminosaの市民科学記録",
    abstract: "ニュージーランドのツチボタル（Arachnocampa luminosa）についてGBIFに登録された位置情報付きの記録1,215件を分析した。その95.5%は2016年以降で、多くはiNaturalistによる。単純な件数では、自然観察をする人が最も多いウェリントン（253件）が首位になる。各地域のiNaturalistのツチボタル記録を、その地域のiNaturalist全観察数で割ると様相が変わる。ウェストコーストが観察10万件あたり194件（95%区間167〜224）で首位、ワイトモ洞窟のあるワイカトが2位（117）となり、ウェリントンは6位（60）に下がる。観察努力で補正すると、季節のピークも4月から6月に移る。これらの記録はツチボタルが記録される場所を示すもので、実際の分布ではない。",
    keywords: ["ツチボタル", "Arachnocampa luminosa", "市民科学", "観察努力", "GBIF", "iNaturalist", "ニュージーランド"],
    sections: [
      { h: "はじめに", p: [
        "Arachnocampa luminosaはキノコバエの一種で、幼虫が光って洞窟や渓谷、湿った森の斜面で獲物を誘う。ワイトモ洞窟で有名になったが、ニュージーランド各地に生息している。公開記録の多くは今や市民科学者によるもので、その活動は地域や季節によって偏っている。本研究の問いは、その偏りを考慮したとき、ツチボタルがどこで、いつ記録されているかである。",
      ] },
      { h: "データと方法", p: [
        "記録はGBIFの出現記録検索（タクソンキー1564326）から、座標があり地理空間上の問題がないものを残した。1914年から2026年までの1,215件で、うち1,190件がiNaturalistの観察、24件が博物館の標本・試料、1件がその他の観察である。観察努力の分母は、GBIFのファセットから得たニュージーランドのiNaturalist研究グレード観察（全生物種）の地域・月・年ごとの件数（16地域）。ワイトモの2021〜2025年の月別気候はOpen-Meteo（ERA5）による。",
        "記録率は、iNaturalistのツチボタル記録数を同じ地域（または月）のiNaturalist全観察数で割り、10万件あたりで表した。区間は近似95%ポアソン区間（Wilson–Hilferty）。記録が10件未満の地域は印を付け、順位付けしない。",
      ] },
      { h: "結果", p: [
        "単純な件数ではウェリントン（253）、ワイカト（210）、ウェストコースト（188）が上位。記録率ではウェストコーストが観察10万件あたり194件（167〜224）で1位、ワイカトが2位（117、102〜134）、ベイ・オブ・プレンティが3位（104、82〜130）。ウェリントンは観察者が多くあらゆるものを記録するため6位（60、53〜68）に下がる。カンタベリー、ギズボーン、ホークスベイ、チャタム諸島は記録が少なすぎて順位を付けられない。",
        "単純な件数は4月（197件）が最多だが、記録率は6月（10万件あたり73）と7月（68）、つまりワイトモで最も寒く雨の多い月に最も高く、9月（33）が最低である。12か月で見ると、記録率はワイトモの平均日最高気温と負の相関がある（r = −0.46）が、12点だけの記述的な値である。記録は新しく、日付のある記録の95.5%は、iNaturalistが普及した2016年以降のものだ。",
      ] },
      { h: "考察", p: [
        "観察努力による補正は他のどの手順よりも重要で、首位の地域とピークの季節の両方を変える。ウェストコーストは石灰岩のカルスト、渓谷、多雨という幼虫が育ちやすい条件を備える一方で観察者が少なく、そこでの観察はツチボタルである可能性が高い。記録率の冬のピークは、ツチボタルが増えるというより、夜が長くなることやオフシーズンの洞窟・渓谷訪問を反映している可能性がある。",
      ] },
      { h: "限界", p: [
        "記録は人がツチボタルを撮影する場所を示しており、洞窟や観光地に偏り、私有地は記録が少ない。分母は全生物種の観察数で、観察者の活動の代理指標であって夜間の訪問の指標ではない。博物館の標本はデータに残すが、対応する観察努力がないため記録率からは除いた。",
      ] },
      { h: "結論", p: [
        "観察努力を考慮すると、ウェストコーストとワイカトがツチボタルが最もよく記録される地域として浮かび上がり、冬が記録率の最も高い季節になる。",
      ] },
    ],
    figure: "ニュージーランドの位置情報付きツチボタル記録。約25 kmごとにまとめ、夜の地図上に光る点で表示。",
  },
  zh: {
    title: "新西兰的萤火虫在哪里发光？按观察努力校正的 Arachnocampa luminosa 公民科学记录",
    abstract: "本文分析了 GBIF 中新西兰萤火虫（Arachnocampa luminosa）全部 1,215 条带地理坐标的记录，其中 95.5% 产生于 2016 年及以后，主要来自 iNaturalist。按原始计数，惠灵顿（253 条）居首，这里也是观察自然的人最多的地区。把每个地区 iNaturalist 上的萤火虫记录除以该地区全部 iNaturalist 观察数后，情况发生变化：西海岸以每 10 万条观察 194 条（95% 区间 167–224）居首，其次是怀托摩溶洞所在的怀卡托（117），惠灵顿降至第六（60）。按努力校正后，季节高峰也从 4 月移到 6 月。这些记录反映的是人们在哪里记录萤火虫，而不是其真实分布。",
    keywords: ["萤火虫", "Arachnocampa luminosa", "公民科学", "观察努力", "GBIF", "iNaturalist", "新西兰"],
    sections: [
      { h: "引言", p: [
        "Arachnocampa luminosa 是一种菌蚊，其幼虫在洞穴、峡谷和潮湿的林间坡地发光以引诱猎物。怀托摩溶洞让它闻名，但这个物种分布于新西兰各地。如今它的公开记录主要来自公民科学家，而他们的活动在地区和季节之间并不均衡。本文要回答的是：在考虑这种不均衡之后，萤火虫在哪里、在什么时候被记录。",
      ] },
      { h: "数据与方法", p: [
        "记录来自 GBIF 对分类单元 1564326 的出现记录检索，保留有坐标且没有地理空间问题的记录：1914 年至 2026 年共 1,215 条，其中 1,190 条为 iNaturalist 观察，24 条为博物馆标本或样品，1 条为其他观察。观察努力的分母是 GBIF 分面统计中新西兰 iNaturalist 研究级观察（所有物种）按地区、月份和年份的数量（16 个地区）。怀托摩 2021–2025 年的月度气候来自 Open-Meteo（ERA5）。",
        "记录率是 iNaturalist 萤火虫记录数除以同一地区（或月份）全部 iNaturalist 观察数，按每 10 万条计。区间为近似 95% 泊松区间（Wilson–Hilferty）。记录少于 10 条的地区会被标注，不参与排名。",
      ] },
      { h: "结果", p: [
        "按原始计数，惠灵顿（253）、怀卡托（210）和西海岸（188）居前。按记录率，西海岸以每 10 万条观察 194 条（167–224）居首，怀卡托第二（117；102–134），丰盛湾第三（104；82–130）；惠灵顿降至第六（60；53–68），因为那里大量观察者什么都记录。坎特伯雷、吉斯伯恩、霍克斯湾和查塔姆群岛的记录太少，不参与排名。",
        "原始记录在 4 月最多（197 条），但记录率在 6 月（每 10 万条 73）和 7 月（68）最高，这是怀托摩最冷、最潮湿的月份，9 月最低（33）。在 12 个月中，记录率与怀托摩的平均日最高气温呈负相关（r = −0.46），但这只是基于 12 个点的描述性数字。记录都很新：有日期的记录中 95.5% 是在 2016 年及以后、随着 iNaturalist 普及而产生的。",
      ] },
      { h: "讨论", p: [
        "按观察努力校正比任何其他步骤都重要：它改变了领先地区和高峰季节。西海岸既有石灰岩喀斯特、峡谷和充沛降雨这些适合幼虫生长的条件，观察者又少，因此那里的每条观察更可能是萤火虫。记录率的冬季高峰可能反映了夜晚更长以及淡季游览洞穴和山谷，而不一定是萤火虫更多。",
      ] },
      { h: "局限", p: [
        "记录显示的是人们在哪里拍摄萤火虫；洞穴和旅游景点占主导，私人土地采样不足。分母统计的是所有物种的观察，代表观察者的活跃程度，而不是夜间出行。博物馆标本保留在数据中，但由于没有对应的观察努力，不计入记录率。",
      ] },
      { h: "结论", p: [
        "考虑观察努力后，西海岸和怀卡托成为萤火虫记录最频繁的地区，冬季则成为记录率最高的季节。",
      ] },
    ],
    figure: "新西兰带地理坐标的萤火虫记录，约每 25 公里归为一组，以夜间地图上的发光点表示。",
  },
};
