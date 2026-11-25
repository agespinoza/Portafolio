import type { ArticleSet } from "./types";

// Figures from data/day-007-space-debris/day-007.json, recomputed in the Day 007 Excel workbook (Analysis A–F).
export const D007: ArticleSet = {
  en: {
    title: "How much of Earth orbit is junk, and who left it there? An analysis of the public satellite catalogue",
    abstract: "CelesTrak's satellite catalogue lists 71,010 objects since 1957, of which 35,283 were in orbit on 23 November 2026. Only 17,473 of these are working satellites: 50.5% of what can be tracked is junk, made up of dead satellites, spent rocket bodies, fragments and unidentified objects. Working satellites crowd a shell at 450–500 km (10,007 objects, mostly large constellations), while junk peaks at 750–850 km, the altitude of the 2007 Fengyun-1C and 2009 Iridium–Cosmos break-ups. Among debris still in orbit, 37% comes from propulsion or battery explosions, 18% from anti-satellite tests and 6% from accidental collisions. In the last 12 months, 1,022 intact objects re-entered, 2.8 a day.",
    keywords: ["space debris", "low Earth orbit", "SATCAT", "satellite constellations", "fragmentation", "ESA"],
    sections: [
      { h: "Introduction", p: [
        "Every launch leaves objects behind, and every break-up multiplies them. Debris travels at orbital speed, so even small pieces can disable a satellite. ESA's Space Environment Report tracks the problem with its MASTER model; the public satellite catalogue lets anyone check the tracked part of it. This study asks how much of what orbits the Earth still works, where the junk is, who owns it and what created it.",
      ] },
      { h: "Data and methods", p: [
        "The data are CelesTrak's full satellite catalogue (SATCAT), downloaded once as CelesTrak's usage policy asks, with owner names from CelesTrak's sources list. Orbits follow ESA's classes (Space Environment Report 2026, Table 1.2); an object is active when its operational status is +, P, B, S or X; mean altitude is the average of apogee and perigee. SATCAT has no catalogue-entry date, so it is estimated from catalogue numbers, which places debris clouds in the year of their break-up. Break-up causes come from Table 2.1 of NASA's History of On-orbit Satellite Fragmentations (16th edition, 268 events to May 2022), and each piece inherits its parent launch's cause.",
        "DuckDB aggregates the catalogue into small cubes by orbit, owner, kind, year and altitude, and the build stops unless the cubes reproduce the SQL totals. ESA's MASTER estimates of objects too small to track are reported separately and not mixed with catalogue counts.",
      ] },
      { h: "Results", p: [
        "Of 35,283 objects in orbit, 17,473 are active satellites, 12,542 debris fragments, 2,957 dead satellites, 2,303 rocket bodies and 8 unidentified objects: half (50.5%) is junk. ESA's model adds about 68,450 objects larger than 10 cm, 1.5 million from 1 to 10 cm and 230 million from 1 mm to 1 cm. Active satellites peak at 450–500 km, with 10,007 objects, mostly constellation shells, while junk peaks at 750–850 km.",
        "The United States owns 18,565 objects in orbit, 29% of them junk; the Commonwealth of Independent States (former Soviet Union) 6,618, 94% junk; and China 6,236, 74% junk. 106 owners have something in orbit. The Fengyun-1C anti-satellite test of 2007 alone produced 3,535 catalogued pieces, 2,313 still in orbit. Among debris in orbit, propulsion or battery explosions account for 37%, anti-satellite tests for 18% and accidental collisions for 6%. Of debris with a published radar size, 84% is small (under 0.1 m²), and 59% of all objects in orbit have no published radar size. In the last 12 months 1,376 objects re-entered, 1,022 of them intact.",
      ] },
      { h: "Discussion", p: [
        "Two populations now share low orbit: recent constellations below 600 km, where atmospheric drag clears dead objects within years, and older debris higher up, where it can stay for decades. Most debris did not come from collisions but from explosions and deliberate tests, which is why passivating spent stages and banning destructive tests matter as much as avoiding collisions. Owners differ sharply: a large share of the United States' objects work, while most of the former Soviet Union's are junk from earlier decades.",
      ] },
      { h: "Limitations", p: [
        "The public catalogue covers only tracked objects, roughly those larger than 10 cm in low orbit, and the gap between its 35,283 objects and the roughly 40,000 that ESA reports as tracked comes from timing and definitions. Catalogue-entry years are estimated. NASA's break-up list ends in May 2022, so later pieces have no assigned cause. Owners are as recorded by CelesTrak.",
      ] },
      { h: "Conclusion", p: [
        "Half of what we track in orbit no longer works. The junk is concentrated in a few altitude bands and a few events, which means preventing explosions and destructive tests remains the most effective way to keep orbit usable.",
      ] },
    ],
    figure: "Objects in low Earth orbit by altitude, working satellites against dead satellites, rocket bodies and debris, next to the share of tracked objects that is junk.",
  },
  es: {
    title: "¿Cuánto de la órbita terrestre es basura y quién la dejó ahí? Un análisis del catálogo público de satélites",
    abstract: "El catálogo de satélites de CelesTrak registra 71,010 objetos desde 1957, de los cuales 35,283 estaban en órbita el 23 de noviembre de 2026. Solo 17,473 son satélites en funcionamiento: el 50.5% de lo que se puede rastrear es basura, formada por satélites muertos, etapas de cohetes gastadas, fragmentos y objetos no identificados. Los satélites activos se concentran en una capa a 450–500 km (10,007 objetos, sobre todo de grandes constelaciones), mientras que la basura llega a su máximo a 750–850 km, la altitud de las rupturas de Fengyun-1C en 2007 e Iridium–Cosmos en 2009. De los fragmentos que siguen en órbita, el 37% viene de explosiones de propulsión o de baterías, el 18% de pruebas antisatélite y el 6% de choques accidentales. En los últimos 12 meses reingresaron 1,022 objetos intactos, 2.8 al día.",
    keywords: ["basura espacial", "órbita baja terrestre", "SATCAT", "constelaciones de satélites", "fragmentación", "ESA"],
    sections: [
      { h: "Introducción", p: [
        "Cada lanzamiento deja objetos atrás, y cada ruptura los multiplica. La basura viaja a velocidad orbital, así que hasta un fragmento pequeño puede inutilizar un satélite. El Informe sobre el Entorno Espacial de la ESA sigue el problema con su modelo MASTER; el catálogo público de satélites permite a cualquiera revisar la parte rastreada. Este estudio pregunta cuánto de lo que orbita la Tierra sigue funcionando, dónde está la basura, de quién es y qué la creó.",
      ] },
      { h: "Datos y métodos", p: [
        "Los datos son el catálogo completo de satélites de CelesTrak (SATCAT), descargado una sola vez como pide su política de uso, con los nombres de los propietarios de la lista de fuentes de CelesTrak. Las órbitas siguen las clases de la ESA (Informe sobre el Entorno Espacial 2026, Tabla 1.2); un objeto está activo cuando su estado operativo es +, P, B, S o X; la altitud media es el promedio del apogeo y el perigeo. SATCAT no tiene fecha de entrada al catálogo, así que se estima a partir de los números de catálogo, lo que ubica las nubes de fragmentos en el año de su ruptura. Las causas de las rupturas vienen de la Tabla 2.1 de la Historia de Fragmentaciones de Satélites en Órbita de la NASA (16.ª edición, 268 eventos hasta mayo de 2022), y cada fragmento hereda la causa de su lanzamiento de origen.",
        "DuckDB agrega el catálogo en cubos pequeños por órbita, propietario, tipo, año y altitud, y la construcción se detiene si los cubos no reproducen los totales de SQL. Las estimaciones del modelo MASTER de la ESA para objetos demasiado pequeños para rastrearse se reportan por separado y no se mezclan con los conteos del catálogo.",
      ] },
      { h: "Resultados", p: [
        "De 35,283 objetos en órbita, 17,473 son satélites activos, 12,542 fragmentos, 2,957 satélites muertos, 2,303 cuerpos de cohete y 8 objetos no identificados: la mitad (50.5%) es basura. El modelo de la ESA agrega unos 68,450 objetos mayores de 10 cm, 1.5 millones de 1 a 10 cm y 230 millones de 1 mm a 1 cm. Los satélites activos llegan a su máximo a 450–500 km, con 10,007 objetos, sobre todo capas de constelaciones, mientras que la basura lo hace a 750–850 km.",
        "Estados Unidos es dueño de 18,565 objetos en órbita, el 29% basura; la Comunidad de Estados Independientes (antigua Unión Soviética) de 6,618, el 94% basura; y China de 6,236, el 74% basura. 106 propietarios tienen algo en órbita. Solo la prueba antisatélite de Fengyun-1C de 2007 produjo 3,535 fragmentos catalogados, 2,313 todavía en órbita. De los fragmentos en órbita, las explosiones de propulsión o de baterías explican el 37%, las pruebas antisatélite el 18% y los choques accidentales el 6%. De los fragmentos con tamaño de radar publicado, el 84% es pequeño (menos de 0.1 m²), y el 59% de todos los objetos en órbita no tiene tamaño de radar publicado. En los últimos 12 meses reingresaron 1,376 objetos, 1,022 de ellos intactos.",
      ] },
      { h: "Discusión", p: [
        "Dos poblaciones comparten hoy la órbita baja: constelaciones recientes por debajo de 600 km, donde el arrastre atmosférico limpia los objetos muertos en pocos años, y basura más antigua más arriba, donde puede quedarse décadas. La mayor parte de la basura no vino de choques sino de explosiones y pruebas deliberadas; por eso desactivar las etapas gastadas y prohibir las pruebas destructivas importa tanto como evitar choques. Los propietarios difieren mucho: buena parte de los objetos de Estados Unidos funciona, mientras que la mayoría de los de la antigua Unión Soviética es basura de décadas pasadas.",
      ] },
      { h: "Limitaciones", p: [
        "El catálogo público cubre solo objetos rastreados, más o menos los mayores de 10 cm en órbita baja, y la diferencia entre sus 35,283 objetos y los cerca de 40,000 que la ESA reporta como rastreados viene de las fechas y las definiciones. Los años de entrada al catálogo son estimados. La lista de rupturas de la NASA termina en mayo de 2022, así que los fragmentos posteriores no tienen causa asignada. Los propietarios son los que registra CelesTrak.",
      ] },
      { h: "Conclusión", p: [
        "La mitad de lo que rastreamos en órbita ya no funciona. La basura se concentra en unas pocas bandas de altitud y en unos pocos eventos, así que evitar explosiones y pruebas destructivas sigue siendo la forma más eficaz de mantener la órbita utilizable.",
      ] },
    ],
    figure: "Objetos en órbita baja por altitud, satélites activos frente a satélites muertos, cuerpos de cohete y fragmentos, junto a la proporción de objetos rastreados que es basura.",
  },
  pt: {
    title: "Quanto da órbita da Terra é lixo, e quem o deixou lá? Uma análise do catálogo público de satélites",
    abstract: "O catálogo de satélites do CelesTrak registra 71.010 objetos desde 1957, dos quais 35.283 estavam em órbita em 23 de novembro de 2026. Só 17.473 são satélites em funcionamento: 50,5% do que pode ser rastreado é lixo, formado por satélites mortos, estágios de foguete usados, fragmentos e objetos não identificados. Os satélites ativos se concentram numa camada a 450–500 km (10.007 objetos, sobretudo de grandes constelações), enquanto o lixo atinge o máximo a 750–850 km, a altitude das rupturas do Fengyun-1C em 2007 e do Iridium–Cosmos em 2009. Dos fragmentos ainda em órbita, 37% vêm de explosões de propulsão ou de baterias, 18% de testes antissatélite e 6% de colisões acidentais. Nos últimos 12 meses reentraram 1.022 objetos intactos, 2,8 por dia.",
    keywords: ["lixo espacial", "órbita baixa da Terra", "SATCAT", "constelações de satélites", "fragmentação", "ESA"],
    sections: [
      { h: "Introdução", p: [
        "Cada lançamento deixa objetos para trás, e cada ruptura os multiplica. O lixo viaja à velocidade orbital, então até um fragmento pequeno pode inutilizar um satélite. O Relatório sobre o Ambiente Espacial da ESA acompanha o problema com o modelo MASTER; o catálogo público de satélites permite a qualquer pessoa verificar a parte rastreada. Este estudo pergunta quanto do que orbita a Terra ainda funciona, onde está o lixo, de quem é e o que o criou.",
      ] },
      { h: "Dados e métodos", p: [
        "Os dados são o catálogo completo de satélites do CelesTrak (SATCAT), baixado uma única vez como pede sua política de uso, com os nomes dos proprietários da lista de fontes do CelesTrak. As órbitas seguem as classes da ESA (Relatório sobre o Ambiente Espacial 2026, Tabela 1.2); um objeto está ativo quando seu status operacional é +, P, B, S ou X; a altitude média é a média do apogeu e do perigeu. O SATCAT não tem data de entrada no catálogo, então ela é estimada pelos números de catálogo, o que coloca as nuvens de fragmentos no ano da ruptura. As causas das rupturas vêm da Tabela 2.1 da História das Fragmentações de Satélites em Órbita da NASA (16ª edição, 268 eventos até maio de 2022), e cada fragmento herda a causa do seu lançamento de origem.",
        "O DuckDB agrega o catálogo em pequenos cubos por órbita, proprietário, tipo, ano e altitude, e a construção para se os cubos não reproduzirem os totais do SQL. As estimativas do modelo MASTER da ESA para objetos pequenos demais para rastrear são apresentadas à parte e não se misturam às contagens do catálogo.",
      ] },
      { h: "Resultados", p: [
        "Dos 35.283 objetos em órbita, 17.473 são satélites ativos, 12.542 fragmentos, 2.957 satélites mortos, 2.303 corpos de foguete e 8 objetos não identificados: metade (50,5%) é lixo. O modelo da ESA acrescenta cerca de 68.450 objetos maiores que 10 cm, 1,5 milhão de 1 a 10 cm e 230 milhões de 1 mm a 1 cm. Os satélites ativos atingem o máximo a 450–500 km, com 10.007 objetos, sobretudo camadas de constelações, enquanto o lixo atinge o máximo a 750–850 km.",
        "Os Estados Unidos possuem 18.565 objetos em órbita, 29% deles lixo; a Comunidade dos Estados Independentes (antiga União Soviética), 6.618, 94% lixo; e a China, 6.236, 74% lixo. 106 proprietários têm algo em órbita. Só o teste antissatélite do Fengyun-1C, em 2007, produziu 3.535 fragmentos catalogados, 2.313 ainda em órbita. Entre os fragmentos em órbita, explosões de propulsão ou de baterias respondem por 37%, testes antissatélite por 18% e colisões acidentais por 6%. Dos fragmentos com tamanho de radar publicado, 84% são pequenos (menos de 0,1 m²), e 59% de todos os objetos em órbita não têm tamanho de radar publicado. Nos últimos 12 meses reentraram 1.376 objetos, 1.022 deles intactos.",
      ] },
      { h: "Discussão", p: [
        "Duas populações dividem hoje a órbita baixa: constelações recentes abaixo de 600 km, onde o arrasto atmosférico limpa os objetos mortos em poucos anos, e lixo mais antigo mais acima, onde pode ficar por décadas. A maior parte do lixo não veio de colisões, mas de explosões e testes deliberados; por isso passivar estágios usados e proibir testes destrutivos importa tanto quanto evitar colisões. Os proprietários diferem muito: boa parte dos objetos dos Estados Unidos funciona, enquanto a maioria dos da antiga União Soviética é lixo de décadas passadas.",
      ] },
      { h: "Limitações", p: [
        "O catálogo público cobre só objetos rastreados, aproximadamente os maiores que 10 cm em órbita baixa, e a diferença entre seus 35.283 objetos e os cerca de 40.000 que a ESA informa como rastreados vem de datas e definições. Os anos de entrada no catálogo são estimados. A lista de rupturas da NASA termina em maio de 2022, então os fragmentos posteriores não têm causa atribuída. Os proprietários são os registrados pelo CelesTrak.",
      ] },
      { h: "Conclusão", p: [
        "Metade do que rastreamos em órbita já não funciona. O lixo se concentra em poucas faixas de altitude e em poucos eventos, o que significa que evitar explosões e testes destrutivos continua sendo a forma mais eficaz de manter a órbita utilizável.",
      ] },
    ],
    figure: "Objetos em órbita baixa por altitude, satélites ativos contra satélites mortos, corpos de foguete e fragmentos, ao lado da fração dos objetos rastreados que é lixo.",
  },
  fr: {
    title: "Quelle part de l’orbite terrestre est un déchet, et qui l’y a laissée ? Une analyse du catalogue public des satellites",
    abstract: "Le catalogue de satellites de CelesTrak recense 71 010 objets depuis 1957, dont 35 283 étaient en orbite le 23 novembre 2026. Seuls 17 473 sont des satellites en fonctionnement : 50,5 % de ce qui peut être suivi est un déchet, qu’il s’agisse de satellites morts, d’étages de fusée usagés, de fragments ou d’objets non identifiés. Les satellites actifs se concentrent dans une couche à 450–500 km (10 007 objets, surtout de grandes constellations), tandis que les déchets culminent à 750–850 km, l’altitude des fragmentations de Fengyun-1C en 2007 et d’Iridium–Cosmos en 2009. Parmi les débris encore en orbite, 37 % proviennent d’explosions de propulsion ou de batteries, 18 % d’essais antisatellites et 6 % de collisions accidentelles. Au cours des 12 derniers mois, 1 022 objets intacts sont rentrés dans l’atmosphère, soit 2,8 par jour.",
    keywords: ["débris spatiaux", "orbite terrestre basse", "SATCAT", "constellations de satellites", "fragmentation", "ESA"],
    sections: [
      { h: "Introduction", p: [
        "Chaque lancement laisse des objets derrière lui, et chaque fragmentation les multiplie. Les débris circulent à vitesse orbitale : même un petit fragment peut mettre un satellite hors service. Le rapport de l’ESA sur l’environnement spatial suit le problème avec son modèle MASTER ; le catalogue public des satellites permet à chacun d’en vérifier la partie suivie. Cette étude se demande quelle part de ce qui orbite autour de la Terre fonctionne encore, où sont les déchets, à qui ils appartiennent et ce qui les a créés.",
      ] },
      { h: "Données et méthodes", p: [
        "Les données sont le catalogue complet des satellites de CelesTrak (SATCAT), téléchargé une seule fois comme le demande sa politique d’utilisation, avec les noms des propriétaires tirés de la liste des sources de CelesTrak. Les orbites suivent les classes de l’ESA (rapport 2026 sur l’environnement spatial, tableau 1.2) ; un objet est actif quand son statut opérationnel est +, P, B, S ou X ; l’altitude moyenne est la moyenne de l’apogée et du périgée. SATCAT ne donne pas de date d’entrée au catalogue : elle est estimée à partir des numéros de catalogue, ce qui place les nuages de débris l’année de leur fragmentation. Les causes des fragmentations proviennent du tableau 2.1 de l’historique des fragmentations de satellites en orbite de la NASA (16e édition, 268 événements jusqu’en mai 2022), et chaque fragment hérite de la cause de son lancement d’origine.",
        "DuckDB agrège le catalogue en petits cubes par orbite, propriétaire, type, année et altitude, et la construction s’arrête si les cubes ne reproduisent pas les totaux SQL. Les estimations du modèle MASTER de l’ESA pour les objets trop petits pour être suivis sont présentées à part et ne sont pas mêlées aux effectifs du catalogue.",
      ] },
      { h: "Résultats", p: [
        "Sur 35 283 objets en orbite, 17 473 sont des satellites actifs, 12 542 des débris, 2 957 des satellites morts, 2 303 des corps de fusée et 8 des objets non identifiés : la moitié (50,5 %) est un déchet. Le modèle de l’ESA y ajoute environ 68 450 objets de plus de 10 cm, 1,5 million de 1 à 10 cm et 230 millions de 1 mm à 1 cm. Les satellites actifs culminent à 450–500 km avec 10 007 objets, surtout des couches de constellations, tandis que les déchets culminent à 750–850 km.",
        "Les États-Unis possèdent 18 565 objets en orbite, dont 29 % de déchets ; la Communauté des États indépendants (ex-Union soviétique) 6 618, dont 94 % de déchets ; et la Chine 6 236, dont 74 % de déchets. 106 propriétaires ont un objet en orbite. L’essai antisatellite de Fengyun-1C en 2007 a produit à lui seul 3 535 fragments catalogués, dont 2 313 encore en orbite. Parmi les débris en orbite, les explosions de propulsion ou de batteries représentent 37 %, les essais antisatellites 18 % et les collisions accidentelles 6 %. Parmi les débris dont la taille radar est publiée, 84 % sont petits (moins de 0,1 m²), et 59 % de tous les objets en orbite n’ont pas de taille radar publiée. Au cours des 12 derniers mois, 1 376 objets sont rentrés, dont 1 022 intacts.",
      ] },
      { h: "Discussion", p: [
        "Deux populations se partagent aujourd’hui l’orbite basse : des constellations récentes sous 600 km, où la traînée atmosphérique élimine les objets morts en quelques années, et des débris plus anciens plus haut, où ils peuvent rester des décennies. L’essentiel des débris ne vient pas de collisions mais d’explosions et d’essais délibérés : passiver les étages usagés et interdire les essais destructifs compte donc autant qu’éviter les collisions. Les propriétaires diffèrent nettement : une grande part des objets américains fonctionne, tandis que la plupart de ceux de l’ex-Union soviétique sont des déchets des décennies passées.",
      ] },
      { h: "Limites", p: [
        "Le catalogue public ne couvre que les objets suivis, à peu près ceux de plus de 10 cm en orbite basse, et l’écart entre ses 35 283 objets et les quelque 40 000 que l’ESA déclare suivis tient aux dates et aux définitions. Les années d’entrée au catalogue sont estimées. La liste des fragmentations de la NASA s’arrête en mai 2022 : les fragments ultérieurs n’ont pas de cause attribuée. Les propriétaires sont ceux qu’enregistre CelesTrak.",
      ] },
      { h: "Conclusion", p: [
        "La moitié de ce que nous suivons en orbite ne fonctionne plus. Les déchets se concentrent dans quelques bandes d’altitude et quelques événements : éviter les explosions et les essais destructifs reste le moyen le plus efficace de garder l’orbite utilisable.",
      ] },
    ],
    figure: "Objets en orbite basse par altitude, satellites actifs face aux satellites morts, corps de fusée et débris, à côté de la part des objets suivis qui est un déchet.",
  },
  it: {
    title: "Quanta parte dell’orbita terrestre è spazzatura, e chi ce l’ha lasciata? Un’analisi del catalogo pubblico dei satelliti",
    abstract: "Il catalogo dei satelliti di CelesTrak elenca 71.010 oggetti dal 1957, di cui 35.283 erano in orbita il 23 novembre 2026. Solo 17.473 sono satelliti funzionanti: il 50,5% di ciò che si può tracciare è spazzatura, fatta di satelliti morti, stadi di razzo esausti, frammenti e oggetti non identificati. I satelliti attivi si concentrano in uno strato a 450–500 km (10.007 oggetti, soprattutto grandi costellazioni), mentre la spazzatura raggiunge il massimo a 750–850 km, la quota delle frammentazioni di Fengyun-1C nel 2007 e di Iridium–Cosmos nel 2009. Tra i detriti ancora in orbita, il 37% deriva da esplosioni di propulsione o di batterie, il 18% da test antisatellite e il 6% da collisioni accidentali. Negli ultimi 12 mesi sono rientrati 1.022 oggetti integri, 2,8 al giorno.",
    keywords: ["detriti spaziali", "orbita terrestre bassa", "SATCAT", "costellazioni di satelliti", "frammentazione", "ESA"],
    sections: [
      { h: "Introduzione", p: [
        "Ogni lancio lascia oggetti dietro di sé, e ogni frammentazione li moltiplica. I detriti viaggiano a velocità orbitale, quindi anche un piccolo frammento può mettere fuori uso un satellite. Il rapporto dell’ESA sull’ambiente spaziale segue il problema con il modello MASTER; il catalogo pubblico dei satelliti permette a chiunque di verificarne la parte tracciata. Lo studio si chiede quanta parte di ciò che orbita intorno alla Terra funzioni ancora, dove sia la spazzatura, di chi sia e che cosa l’abbia creata.",
      ] },
      { h: "Dati e metodi", p: [
        "I dati sono il catalogo completo dei satelliti di CelesTrak (SATCAT), scaricato una sola volta come chiede la sua politica d’uso, con i nomi dei proprietari dall’elenco delle fonti di CelesTrak. Le orbite seguono le classi dell’ESA (Space Environment Report 2026, tabella 1.2); un oggetto è attivo quando il suo stato operativo è +, P, B, S o X; la quota media è la media di apogeo e perigeo. SATCAT non ha una data di ingresso nel catalogo, quindi la si stima dai numeri di catalogo, il che colloca le nubi di detriti nell’anno della frammentazione. Le cause delle frammentazioni vengono dalla tabella 2.1 della History of On-orbit Satellite Fragmentations della NASA (16ª edizione, 268 eventi fino a maggio 2022), e ogni frammento eredita la causa del lancio di origine.",
        "DuckDB aggrega il catalogo in piccoli cubi per orbita, proprietario, tipo, anno e quota, e la build si ferma se i cubi non riproducono i totali SQL. Le stime del modello MASTER dell’ESA per gli oggetti troppo piccoli per essere tracciati sono riportate a parte e non si mescolano ai conteggi del catalogo.",
      ] },
      { h: "Risultati", p: [
        "Dei 35.283 oggetti in orbita, 17.473 sono satelliti attivi, 12.542 detriti, 2.957 satelliti morti, 2.303 corpi di razzo e 8 oggetti non identificati: metà (50,5%) è spazzatura. Il modello dell’ESA aggiunge circa 68.450 oggetti sopra i 10 cm, 1,5 milioni tra 1 e 10 cm e 230 milioni tra 1 mm e 1 cm. I satelliti attivi raggiungono il massimo a 450–500 km, con 10.007 oggetti, soprattutto strati di costellazioni, mentre la spazzatura lo raggiunge a 750–850 km.",
        "Gli Stati Uniti possiedono 18.565 oggetti in orbita, il 29% spazzatura; la Comunità degli Stati Indipendenti (ex Unione Sovietica) 6.618, il 94% spazzatura; la Cina 6.236, il 74% spazzatura. 106 proprietari hanno qualcosa in orbita. Il solo test antisatellite di Fengyun-1C del 2007 ha prodotto 3.535 frammenti catalogati, 2.313 ancora in orbita. Tra i detriti in orbita, le esplosioni di propulsione o di batterie spiegano il 37%, i test antisatellite il 18% e le collisioni accidentali il 6%. Dei detriti con dimensione radar pubblicata, l’84% è piccolo (sotto 0,1 m²), e il 59% di tutti gli oggetti in orbita non ha una dimensione radar pubblicata. Negli ultimi 12 mesi sono rientrati 1.376 oggetti, 1.022 dei quali integri.",
      ] },
      { h: "Discussione", p: [
        "Oggi due popolazioni condividono l’orbita bassa: costellazioni recenti sotto i 600 km, dove la resistenza atmosferica elimina gli oggetti morti in pochi anni, e detriti più vecchi più in alto, dove possono restare per decenni. La maggior parte dei detriti non viene da collisioni ma da esplosioni e test deliberati, per questo passivare gli stadi esausti e vietare i test distruttivi conta quanto evitare le collisioni. I proprietari differiscono nettamente: buona parte degli oggetti statunitensi funziona, mentre la maggior parte di quelli dell’ex Unione Sovietica è spazzatura dei decenni passati.",
      ] },
      { h: "Limiti", p: [
        "Il catalogo pubblico copre solo gli oggetti tracciati, all’incirca quelli sopra i 10 cm in orbita bassa, e la differenza tra i suoi 35.283 oggetti e i circa 40.000 che l’ESA dichiara tracciati dipende da date e definizioni. Gli anni di ingresso nel catalogo sono stimati. L’elenco delle frammentazioni della NASA termina a maggio 2022, quindi i frammenti successivi non hanno una causa assegnata. I proprietari sono quelli registrati da CelesTrak.",
      ] },
      { h: "Conclusione", p: [
        "Metà di ciò che tracciamo in orbita non funziona più. La spazzatura si concentra in poche fasce di quota e in pochi eventi: evitare esplosioni e test distruttivi resta il modo più efficace per mantenere l’orbita utilizzabile.",
      ] },
    ],
    figure: "Oggetti in orbita bassa per quota, satelliti attivi contro satelliti morti, corpi di razzo e detriti, accanto alla quota degli oggetti tracciati che è spazzatura.",
  },
  ja: {
    title: "地球の軌道のどれほどがごみで、誰が残したのか：公開衛星カタログの分析",
    abstract: "CelesTrakの衛星カタログには1957年以来71,010の物体が載り、そのうち35,283が2026年11月23日時点で軌道上にあった。稼働中の衛星は17,473にすぎず、追跡できる物体の50.5%は運用を終えた衛星、使用済みロケット段、破片、正体不明の物体といったごみである。稼働衛星は高度450〜500 kmの層に集中し（10,007個、主に大規模コンステレーション）、ごみは2007年の風雲1号C、2009年のイリジウム・コスモス衝突の破砕高度である750〜850 kmで最も多い。軌道上の破片のうち37%は推進系やバッテリーの爆発、18%は衛星破壊実験、6%は偶発的な衝突による。過去12か月に、破片ではない物体1,022個が再突入した（1日2.8個）。",
    keywords: ["スペースデブリ", "低軌道", "SATCAT", "衛星コンステレーション", "破砕", "ESA"],
    sections: [
      { h: "はじめに", p: [
        "打ち上げのたびに物体が残り、破砕のたびにそれが増える。デブリは軌道速度で飛ぶため、小さな破片でも衛星を壊しうる。ESAの宇宙環境報告書はMASTERモデルでこの問題を追跡しており、公開の衛星カタログを使えば誰でもその追跡可能な部分を確かめられる。本研究は、地球を回る物体のうちどれだけがまだ動いているか、ごみはどこにあり、誰のもので、何が生んだのかを問う。",
      ] },
      { h: "データと方法", p: [
        "データはCelesTrakの衛星カタログ全体（SATCAT）で、利用規約に従って1回だけダウンロードし、所有者名はCelesTrakの所有者一覧から取った。軌道の分類はESAの区分（宇宙環境報告書2026、表1.2）に従う。運用状態が+、P、B、S、Xの物体を稼働中とし、平均高度は遠地点と近地点の平均とした。SATCATにはカタログ登録日がないためカタログ番号から推定しており、これにより破片雲は破砕した年に位置づけられる。破砕原因はNASAの「軌道上衛星破砕の歴史」第16版の表2.1（2022年5月までの268件）から取り、各破片には元の打ち上げの原因を割り当てた。",
        "DuckDBでカタログを軌道・所有者・種類・年・高度別の小さなキューブに集計し、キューブがSQLの合計を再現しなければビルドを停止する。追跡できないほど小さい物体についてのESAのMASTER推計は別に示し、カタログの件数とは混ぜない。",
      ] },
      { h: "結果", p: [
        "軌道上の35,283個のうち、稼働衛星が17,473、破片が12,542、運用終了衛星が2,957、ロケット機体が2,303、正体不明が8で、半分（50.5%）がごみである。ESAのモデルはさらに、10 cm超が約68,450個、1〜10 cmが150万個、1 mm〜1 cmが2億3,000万個あると推計している。稼働衛星は450〜500 kmで最も多く（10,007個、主にコンステレーションの層）、ごみは750〜850 kmで最も多い。",
        "米国は軌道上に18,565個を所有し、そのうち29%がごみである。独立国家共同体（旧ソ連）は6,618個で94%、中国は6,236個で74%がごみである。軌道上に何かを持つ所有者は106に上る。2007年の風雲1号Cの衛星破壊実験だけで3,535個の破片がカタログ化され、2,313個がまだ軌道上にある。軌道上の破片のうち、推進系やバッテリーの爆発が37%、衛星破壊実験が18%、偶発的な衝突が6%を占める。レーダー断面積が公表されている破片の84%は小型（0.1 m²未満）で、軌道上の全物体の59%はレーダー断面積が公表されていない。過去12か月に1,376個が再突入し、そのうち1,022個は破片ではない物体だった。",
      ] },
      { h: "考察", p: [
        "低軌道には今、2つの集団がいる。大気抵抗で運用終了の物体が数年で落ちる600 km以下の新しいコンステレーションと、数十年残りうるさらに高い所の古いデブリである。デブリの大半は衝突ではなく爆発と意図的な実験から生まれた。だからこそ、使用済み段の無害化と破壊的な実験の禁止は、衝突回避と同じくらい重要である。所有者による違いは大きく、米国の物体の多くは稼働しているのに対し、旧ソ連の物体の大半は過去数十年のごみである。",
      ] },
      { h: "限界", p: [
        "公開カタログが含むのは追跡されている物体、つまり低軌道ではおおむね10 cm超の物体だけである。カタログの35,283個とESAが追跡済みとする約40,000個の差は、時点と定義の違いによる。カタログ登録年は推定値である。NASAの破砕リストは2022年5月で終わるため、それ以降の破片には原因が割り当てられていない。所有者はCelesTrakの記録どおりである。",
      ] },
      { h: "結論", p: [
        "私たちが軌道上で追跡している物体の半分は、もう動いていない。ごみはいくつかの高度帯といくつかの出来事に集中しており、爆発と破壊的な実験を防ぐことが、軌道を使える状態に保つ最も効果的な方法であり続ける。",
      ] },
    ],
    figure: "低軌道の物体の高度分布（稼働衛星と、運用終了衛星・ロケット機体・破片の比較）と、追跡物体に占めるごみの割合。",
  },
  zh: {
    title: "地球轨道上有多少是垃圾，又是谁留下的？对公开卫星目录的分析",
    abstract: "CelesTrak 卫星目录记录了 1957 年以来的 71,010 个物体，其中 35,283 个在 2026 年 11 月 23 日仍在轨道上。只有 17,473 个是正在工作的卫星：可追踪物体中有 50.5% 是垃圾，包括失效卫星、废弃火箭箭体、碎片和身份不明的物体。在用卫星集中在 450–500 公里的壳层（10,007 个，主要是大型星座），而垃圾在 750–850 公里最多，这正是 2007 年风云一号 C 和 2009 年铱星–宇宙卫星解体发生的高度。仍在轨的碎片中，37% 来自推进系统或电池爆炸，18% 来自反卫星试验，6% 来自意外碰撞。过去 12 个月中有 1,022 个完整物体再入大气层，每天 2.8 个。",
    keywords: ["太空碎片", "近地轨道", "SATCAT", "卫星星座", "解体", "ESA"],
    sections: [
      { h: "引言", p: [
        "每次发射都会留下物体，每次解体都会让它们成倍增加。碎片以轨道速度运行，即使很小的碎片也能让卫星失效。ESA 的《空间环境报告》用 MASTER 模型追踪这一问题；公开的卫星目录则让任何人都能核查其中可追踪的部分。本研究要问：环绕地球的物体中还有多少在工作？垃圾在哪里？属于谁？又是什么造成的？",
      ] },
      { h: "数据与方法", p: [
        "数据是 CelesTrak 的完整卫星目录（SATCAT），按照其使用政策只下载一次，所有者名称取自 CelesTrak 的来源列表。轨道分类采用 ESA 的类别（《2026 年空间环境报告》表 1.2）；运行状态为 +、P、B、S 或 X 的物体视为在用；平均高度为远地点和近地点的平均值。SATCAT 没有入目录日期，因此用目录编号估算，这会把碎片云归入其解体的年份。解体原因来自 NASA《在轨卫星解体史》第 16 版表 2.1（截至 2022 年 5 月的 268 次事件），每个碎片继承其来源发射的原因。",
        "DuckDB 把目录汇总为按轨道、所有者、类型、年份和高度划分的小型数据立方体；如果立方体无法重现 SQL 总数，构建就会停止。ESA MASTER 模型对太小而无法追踪的物体的估计单独列出，不与目录计数混合。",
      ] },
      { h: "结果", p: [
        "在 35,283 个在轨物体中，17,473 个是在用卫星，12,542 个是碎片，2,957 个是失效卫星，2,303 个是火箭箭体，8 个身份不明：一半（50.5%）是垃圾。ESA 的模型还估计有约 68,450 个大于 10 厘米的物体、150 万个 1 至 10 厘米的物体和 2.3 亿个 1 毫米至 1 厘米的物体。在用卫星在 450–500 公里最多，共 10,007 个，主要是星座壳层；垃圾则在 750–850 公里最多。",
        "美国拥有 18,565 个在轨物体，其中 29% 是垃圾；独联体（前苏联）拥有 6,618 个，94% 是垃圾；中国拥有 6,236 个，74% 是垃圾。共有 106 个所有者在轨道上有物体。仅 2007 年风云一号 C 反卫星试验就产生了 3,535 个已编目碎片，其中 2,313 个仍在轨。在轨碎片中，推进系统或电池爆炸占 37%，反卫星试验占 18%，意外碰撞占 6%。在公布了雷达截面的碎片中，84% 属于小型（小于 0.1 平方米），而全部在轨物体中有 59% 没有公布雷达截面。过去 12 个月有 1,376 个物体再入，其中 1,022 个是完整物体。",
      ] },
      { h: "讨论", p: [
        "如今近地轨道上共存着两类群体：600 公里以下的新星座，大气阻力会在几年内清除那里的失效物体；以及更高处的旧碎片，它们可能停留数十年。大多数碎片并非来自碰撞，而是来自爆炸和蓄意试验，因此对废弃箭体进行钝化处理、禁止破坏性试验与避免碰撞同样重要。各所有者差异很大：美国的大部分物体仍在工作，而前苏联的大多数物体是过去几十年留下的垃圾。",
      ] },
      { h: "局限", p: [
        "公开目录只包含被追踪的物体，在近地轨道大致是大于 10 厘米的物体；目录中的 35,283 个物体与 ESA 报告的约 40,000 个被追踪物体之间的差距来自时间和定义的不同。入目录年份是估算的。NASA 的解体清单截至 2022 年 5 月，之后的碎片没有指定原因。所有者以 CelesTrak 的记录为准。",
      ] },
      { h: "结论", p: [
        "我们在轨道上追踪的物体中有一半已不再工作。垃圾集中在少数几个高度带和少数几次事件中，因此防止爆炸和破坏性试验仍是保持轨道可用的最有效方法。",
      ] },
    ],
    figure: "近地轨道物体按高度的分布（在用卫星对比失效卫星、火箭箭体和碎片），旁边是被追踪物体中垃圾所占的比例。",
  },
};
