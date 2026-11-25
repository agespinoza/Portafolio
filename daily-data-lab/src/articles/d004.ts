import type { ArticleSet } from "./types";

// Figures from src/days/day-004-abraham-lake/snapshot.json, recomputed in the Day 004 Excel workbook (Analysis A–C).
export const D004: ArticleSet = {
  en: {
    title: "How fast are winters warming at Abraham Lake? A reservoir in the Canadian Rockies against the world's lakes",
    abstract: "Abraham Lake, a 52 km² reservoir in Alberta known for methane bubbles frozen into its ice, is larger than 99.8% of the 1,427,688 lakes in HydroLAKES. Its winters (December to February) have warmed by 0.25 °C per decade since 1951 (95% interval 0.03–0.46; 75 winters of ERA5 air temperature), although the trend since 1991 is not statistically different from zero. LakeTEMP gives Abraham 142 ice days a year, fewer than the median of 188 for lakes at its latitude and 155 for lakes at a similar latitude and elevation. Across 112 large lakes with a 1991–2025 trend, 102 warmed and 45 warmed significantly, with a median of 0.34 °C per decade, faster at higher latitudes.",
    keywords: ["Abraham Lake", "lake ice", "winter warming", "HydroLAKES", "LakeTEMP", "ERA5", "trend analysis"],
    sections: [
      { h: "Introduction", p: [
        "Abraham Lake is a reservoir on the North Saskatchewan River created by the Bighorn Dam. Its clear winter ice traps columns of methane bubbles, which made it a destination for photographers. Ice depends on winter cold, so the questions are how fast its winters are warming, how its ice season compares with other lakes, and how its warming compares with the world's largest lakes.",
      ] },
      { h: "Data and methods", p: [
        "Lake geometry comes from HydroLAKES v1.0 (every lake of at least 0.1 km²), read with DuckDB's spatial extension. Ice days, ice dates and monthly surface-water temperature come from LakeTEMP v1.1. Winter air temperature is the December-to-February mean of ERA5 daily 2 m temperature at each lake's pour point, from Open-Meteo, assigned to the year of the January and kept only with at least 89 days of data: every winter since 1951 for Abraham and 1991–2025 for the 300 largest lakes (111 of them complete so far, because of API quotas).",
        "Trends are ordinary least squares slopes in °C per decade with 95% intervals from Student's t with n − 2 degrees of freedom. Ice days are compared with the median of all high-quality LakeTEMP lakes in the same 1° latitude band and with peers at a similar latitude and elevation.",
      ] },
      { h: "Results", p: [
        "Abraham covers 52.1 km², averages 34 m deep and sits at 1,308 m; 3,271 lakes are larger and 2,636 deeper. Its winters average −9.7 °C, from −16.3 °C in the coldest to −5.8 °C in the warmest. Since 1951 they have warmed by 0.246 °C per decade (0.035–0.457; R² = 0.07), about 1.8 °C over the record. Since 1991 the slope is 0.16 °C per decade with a standard error of 0.27, so that shorter window cannot separate a trend from year-to-year noise.",
        "LakeTEMP gives Abraham 142 ice days a year, against a median of 188 for lakes in its latitude band and 155 for 1,921 peers at a similar latitude and elevation; 93% of lakes that freeze have more ice days. Among the 112 lakes with a 1991–2025 trend, 102 warmed, 45 warmed significantly and 1 cooled significantly; the median rate is 0.34 °C per decade and rates rise with latitude (r = 0.38). Abraham's long-run rate sits at the 34th percentile of that group, although it covers a longer period.",
      ] },
      { h: "Discussion", p: [
        "Abraham's shorter ice season than its neighbours is consistent with a reservoir: water level changes and outflow through the dam keep part of the surface moving. Its winter warming is modest compared with the largest lakes, which are mostly at higher latitudes where winters are warming fastest. For the ice that makes the lake famous, a warming of about 1.8 °C in winter air temperature since 1951 is meaningful even if each single winter varies by several degrees.",
      ] },
      { h: "Limitations", p: [
        "Air temperature at the pour point is not lake temperature, and ERA5 smooths mountain valleys. Trends assume independent winters and a straight line. The 300-lake backfill is still in progress, so the comparison group is the 112 lakes finished so far, and Abraham's 1951 record is longer than theirs.",
      ] },
      { h: "Conclusion", p: [
        "Abraham Lake's winters are warming by about a quarter of a degree per decade, and it already has fewer ice days than similar lakes; most of the world's largest lakes are warming faster.",
      ] },
    ],
    figure: "The 300 largest lakes coloured by ice days, next to 75 winters of air temperature at Abraham Lake with its warming trend.",
  },
  es: {
    title: "¿Qué tan rápido se calientan los inviernos en el lago Abraham? Un embalse de las Rocosas canadienses frente a los lagos del mundo",
    abstract: "El lago Abraham, un embalse de 52 km² en Alberta conocido por las burbujas de metano congeladas en su hielo, es más grande que el 99.8% de los 1,427,688 lagos de HydroLAKES. Sus inviernos (diciembre a febrero) se han calentado 0.25 °C por década desde 1951 (intervalo de 95%: 0.03–0.46; 75 inviernos de temperatura del aire de ERA5), aunque la tendencia desde 1991 no se distingue estadísticamente de cero. LakeTEMP le da al Abraham 142 días de hielo al año, menos que la mediana de 188 de los lagos a su latitud y de 155 de los lagos a latitud y altitud parecidas. De 112 lagos grandes con tendencia 1991–2025, 102 se calentaron y 45 de forma significativa, con una mediana de 0.34 °C por década, más rápido a latitudes altas.",
    keywords: ["lago Abraham", "hielo lacustre", "calentamiento invernal", "HydroLAKES", "LakeTEMP", "ERA5", "análisis de tendencias"],
    sections: [
      { h: "Introducción", p: [
        "El lago Abraham es un embalse del río North Saskatchewan creado por la presa Bighorn. Su hielo transparente atrapa columnas de burbujas de metano, lo que lo volvió un destino de fotógrafos. El hielo depende del frío invernal, así que las preguntas son qué tan rápido se calientan sus inviernos, cómo se compara su temporada de hielo con la de otros lagos y cómo se compara su calentamiento con el de los lagos más grandes del mundo.",
      ] },
      { h: "Datos y métodos", p: [
        "La geometría de los lagos viene de HydroLAKES v1.0 (todos los lagos de al menos 0.1 km²), leída con la extensión espacial de DuckDB. Los días de hielo, sus fechas y la temperatura mensual del agua superficial vienen de LakeTEMP v1.1. La temperatura invernal del aire es el promedio de diciembre a febrero de la temperatura diaria a 2 m de ERA5 en el punto de desagüe de cada lago, desde Open-Meteo, asignado al año del enero y conservado solo con al menos 89 días de datos: todos los inviernos desde 1951 para el Abraham y 1991–2025 para los 300 lagos más grandes (111 completos hasta ahora, por los límites de la API).",
        "Las tendencias son pendientes de mínimos cuadrados en °C por década, con intervalos de 95% de la t de Student con n − 2 grados de libertad. Los días de hielo se comparan con la mediana de todos los lagos de LakeTEMP de buena calidad en la misma franja de 1° de latitud y con lagos parecidos en latitud y altitud.",
      ] },
      { h: "Resultados", p: [
        "El Abraham cubre 52.1 km², tiene 34 m de profundidad media y está a 1,308 m de altitud; 3,271 lagos son más grandes y 2,636 más profundos. Sus inviernos promedian −9.7 °C, de −16.3 °C en el más frío a −5.8 °C en el más templado. Desde 1951 se han calentado 0.246 °C por década (0.035–0.457; R² = 0.07), cerca de 1.8 °C en todo el registro. Desde 1991 la pendiente es de 0.16 °C por década con un error estándar de 0.27, así que esa ventana más corta no separa una tendencia del ruido entre años.",
        "LakeTEMP le da al Abraham 142 días de hielo al año, frente a una mediana de 188 en su franja de latitud y de 155 en 1,921 lagos de latitud y altitud parecidas; el 93% de los lagos que se congelan tienen más días de hielo. De los 112 lagos con tendencia 1991–2025, 102 se calentaron, 45 de forma significativa y 1 se enfrió de forma significativa; la mediana es de 0.34 °C por década y las tasas aumentan con la latitud (r = 0.38). La tasa de largo plazo del Abraham queda en el percentil 34 de ese grupo, aunque abarca un periodo más largo.",
      ] },
      { h: "Discusión", p: [
        "Que el Abraham tenga una temporada de hielo más corta que sus vecinos es coherente con un embalse: los cambios de nivel y la salida de agua por la presa mantienen en movimiento parte de la superficie. Su calentamiento invernal es moderado comparado con el de los lagos más grandes, que están sobre todo en latitudes altas, donde los inviernos se calientan más rápido. Para el hielo que hace famoso al lago, un calentamiento de unos 1.8 °C en la temperatura invernal del aire desde 1951 importa, aunque cada invierno varíe varios grados.",
      ] },
      { h: "Limitaciones", p: [
        "La temperatura del aire en el punto de desagüe no es la temperatura del lago, y ERA5 suaviza los valles de montaña. Las tendencias suponen inviernos independientes y una línea recta. La descarga de los 300 lagos sigue en curso, así que el grupo de comparación son los 112 lagos terminados hasta ahora, y el registro del Abraham desde 1951 es más largo que el de ellos.",
      ] },
      { h: "Conclusión", p: [
        "Los inviernos del lago Abraham se calientan alrededor de un cuarto de grado por década, y el lago ya tiene menos días de hielo que lagos parecidos; la mayoría de los lagos más grandes del mundo se calienta más rápido.",
      ] },
    ],
    figure: "Los 300 lagos más grandes coloreados por días de hielo, junto a 75 inviernos de temperatura del aire en el lago Abraham con su tendencia de calentamiento.",
  },
  pt: {
    title: "Quão rápido os invernos estão esquentando no lago Abraham? Um reservatório nas Rochosas canadenses diante dos lagos do mundo",
    abstract: "O lago Abraham, um reservatório de 52 km² em Alberta conhecido pelas bolhas de metano congeladas em seu gelo, é maior que 99,8% dos 1.427.688 lagos do HydroLAKES. Seus invernos (dezembro a fevereiro) esquentaram 0,25 °C por década desde 1951 (intervalo de 95%: 0,03–0,46; 75 invernos de temperatura do ar do ERA5), embora a tendência desde 1991 não se distinga estatisticamente de zero. O LakeTEMP dá ao Abraham 142 dias de gelo por ano, menos que a mediana de 188 dos lagos na sua latitude e de 155 dos lagos em latitude e altitude parecidas. Entre 112 grandes lagos com tendência 1991–2025, 102 esquentaram e 45 de forma significativa, com mediana de 0,34 °C por década, mais rápido em latitudes altas.",
    keywords: ["lago Abraham", "gelo lacustre", "aquecimento invernal", "HydroLAKES", "LakeTEMP", "ERA5", "análise de tendências"],
    sections: [
      { h: "Introdução", p: [
        "O lago Abraham é um reservatório no rio North Saskatchewan criado pela barragem Bighorn. Seu gelo transparente aprisiona colunas de bolhas de metano, o que o tornou destino de fotógrafos. O gelo depende do frio do inverno, então as perguntas são quão rápido seus invernos estão esquentando, como sua temporada de gelo se compara à de outros lagos e como seu aquecimento se compara ao dos maiores lagos do mundo.",
      ] },
      { h: "Dados e métodos", p: [
        "A geometria dos lagos vem do HydroLAKES v1.0 (todos os lagos com pelo menos 0,1 km²), lida com a extensão espacial do DuckDB. Dias de gelo, datas do gelo e temperatura mensal da água superficial vêm do LakeTEMP v1.1. A temperatura do ar no inverno é a média de dezembro a fevereiro da temperatura diária a 2 m do ERA5 no ponto de saída de cada lago, via Open-Meteo, atribuída ao ano do janeiro e mantida só com pelo menos 89 dias de dados: todos os invernos desde 1951 para o Abraham e 1991–2025 para os 300 maiores lagos (111 completos até agora, por causa das cotas da API).",
        "As tendências são inclinações de mínimos quadrados em °C por década, com intervalos de 95% da t de Student com n − 2 graus de liberdade. Os dias de gelo são comparados com a mediana de todos os lagos do LakeTEMP de boa qualidade na mesma faixa de 1° de latitude e com lagos de latitude e altitude parecidas.",
      ] },
      { h: "Resultados", p: [
        "O Abraham ocupa 52,1 km², tem 34 m de profundidade média e fica a 1.308 m de altitude; 3.271 lagos são maiores e 2.636 mais profundos. Seus invernos têm média de −9,7 °C, de −16,3 °C no mais frio a −5,8 °C no mais ameno. Desde 1951 esquentaram 0,246 °C por década (0,035–0,457; R² = 0,07), cerca de 1,8 °C ao longo do registro. Desde 1991 a inclinação é de 0,16 °C por década com erro padrão de 0,27, então essa janela mais curta não separa uma tendência do ruído entre anos.",
        "O LakeTEMP dá ao Abraham 142 dias de gelo por ano, contra uma mediana de 188 na sua faixa de latitude e de 155 em 1.921 lagos de latitude e altitude parecidas; 93% dos lagos que congelam têm mais dias de gelo. Dos 112 lagos com tendência 1991–2025, 102 esquentaram, 45 de forma significativa e 1 esfriou de forma significativa; a mediana é de 0,34 °C por década e as taxas aumentam com a latitude (r = 0,38). A taxa de longo prazo do Abraham fica no percentil 34 desse grupo, embora cubra um período mais longo.",
      ] },
      { h: "Discussão", p: [
        "Uma temporada de gelo mais curta que a dos vizinhos é coerente com um reservatório: as variações de nível e a vazão pela barragem mantêm parte da superfície em movimento. Seu aquecimento invernal é moderado em comparação com os maiores lagos, que estão sobretudo em latitudes altas, onde os invernos esquentam mais rápido. Para o gelo que torna o lago famoso, um aquecimento de cerca de 1,8 °C na temperatura do ar no inverno desde 1951 é relevante, mesmo que cada inverno varie vários graus.",
      ] },
      { h: "Limitações", p: [
        "A temperatura do ar no ponto de saída não é a temperatura do lago, e o ERA5 suaviza os vales de montanha. As tendências supõem invernos independentes e uma reta. O preenchimento dos 300 lagos ainda está em andamento, então o grupo de comparação são os 112 lagos concluídos até agora, e o registro do Abraham desde 1951 é mais longo que o deles.",
      ] },
      { h: "Conclusão", p: [
        "Os invernos do lago Abraham estão esquentando cerca de um quarto de grau por década, e o lago já tem menos dias de gelo que lagos parecidos; a maioria dos maiores lagos do mundo esquenta mais rápido.",
      ] },
    ],
    figure: "Os 300 maiores lagos coloridos pelos dias de gelo, ao lado de 75 invernos de temperatura do ar no lago Abraham com sua tendência de aquecimento.",
  },
  fr: {
    title: "À quelle vitesse les hivers se réchauffent-ils au lac Abraham ? Un réservoir des Rocheuses canadiennes face aux lacs du monde",
    abstract: "Le lac Abraham, un réservoir de 52 km² en Alberta connu pour les bulles de méthane prises dans sa glace, est plus grand que 99,8 % des 1 427 688 lacs de HydroLAKES. Ses hivers (décembre à février) se sont réchauffés de 0,25 °C par décennie depuis 1951 (intervalle à 95 % : 0,03–0,46 ; 75 hivers de température de l’air ERA5), même si la tendance depuis 1991 ne se distingue pas statistiquement de zéro. LakeTEMP attribue au lac Abraham 142 jours de glace par an, moins que la médiane de 188 pour les lacs de sa latitude et de 155 pour les lacs de latitude et d’altitude semblables. Sur 112 grands lacs dotés d’une tendance 1991–2025, 102 se sont réchauffés, dont 45 de façon significative, avec une médiane de 0,34 °C par décennie, plus rapide aux hautes latitudes.",
    keywords: ["lac Abraham", "glace lacustre", "réchauffement hivernal", "HydroLAKES", "LakeTEMP", "ERA5", "analyse de tendance"],
    sections: [
      { h: "Introduction", p: [
        "Le lac Abraham est un réservoir de la rivière Saskatchewan Nord créé par le barrage Bighorn. Sa glace limpide piège des colonnes de bulles de méthane, ce qui en a fait une destination pour les photographes. La glace dépend du froid hivernal ; les questions sont donc : à quelle vitesse ses hivers se réchauffent-ils, comment sa saison de glace se compare-t-elle à celle des autres lacs, et comment son réchauffement se compare-t-il à celui des plus grands lacs du monde ?",
      ] },
      { h: "Données et méthodes", p: [
        "La géométrie des lacs provient de HydroLAKES v1.0 (tous les lacs d’au moins 0,1 km²), lue avec l’extension spatiale de DuckDB. Les jours de glace, les dates de glace et la température mensuelle de l’eau de surface proviennent de LakeTEMP v1.1. La température hivernale de l’air est la moyenne de décembre à février de la température quotidienne à 2 m d’ERA5 à l’exutoire de chaque lac, via Open-Meteo, rattachée à l’année du mois de janvier et conservée seulement avec au moins 89 jours de données : tous les hivers depuis 1951 pour le lac Abraham et 1991–2025 pour les 300 plus grands lacs (111 complets à ce jour, en raison des quotas de l’API).",
        "Les tendances sont des pentes des moindres carrés en °C par décennie, avec des intervalles à 95 % issus de la loi de Student à n − 2 degrés de liberté. Les jours de glace sont comparés à la médiane de tous les lacs LakeTEMP de bonne qualité dans la même bande de 1° de latitude et à des lacs de latitude et d’altitude semblables.",
      ] },
      { h: "Résultats", p: [
        "Le lac Abraham couvre 52,1 km², a une profondeur moyenne de 34 m et se trouve à 1 308 m d’altitude ; 3 271 lacs sont plus grands et 2 636 plus profonds. Ses hivers affichent en moyenne −9,7 °C, de −16,3 °C pour le plus froid à −5,8 °C pour le plus doux. Depuis 1951, ils se sont réchauffés de 0,246 °C par décennie (0,035–0,457 ; R² = 0,07), soit environ 1,8 °C sur la période. Depuis 1991, la pente est de 0,16 °C par décennie avec une erreur type de 0,27 : cette fenêtre plus courte ne permet pas de séparer une tendance du bruit interannuel.",
        "LakeTEMP attribue au lac Abraham 142 jours de glace par an, contre une médiane de 188 dans sa bande de latitude et de 155 pour 1 921 lacs de latitude et d’altitude semblables ; 93 % des lacs qui gèlent ont plus de jours de glace. Parmi les 112 lacs dotés d’une tendance 1991–2025, 102 se sont réchauffés, 45 de façon significative et 1 s’est refroidi de façon significative ; la médiane est de 0,34 °C par décennie et les taux augmentent avec la latitude (r = 0,38). Le taux de long terme du lac Abraham se situe au 34e centile de ce groupe, bien qu’il couvre une période plus longue.",
      ] },
      { h: "Discussion", p: [
        "Une saison de glace plus courte que celle de ses voisins est cohérente avec un réservoir : les variations de niveau et le débit au barrage maintiennent une partie de la surface en mouvement. Son réchauffement hivernal est modéré par rapport aux plus grands lacs, situés surtout aux hautes latitudes, là où les hivers se réchauffent le plus vite. Pour la glace qui fait la renommée du lac, un réchauffement d’environ 1,8 °C de la température hivernale de l’air depuis 1951 compte, même si chaque hiver varie de plusieurs degrés.",
      ] },
      { h: "Limites", p: [
        "La température de l’air à l’exutoire n’est pas celle du lac, et ERA5 lisse les vallées de montagne. Les tendances supposent des hivers indépendants et une droite. Le téléchargement des 300 lacs se poursuit : le groupe de comparaison se limite aux 112 lacs terminés, et la série du lac Abraham depuis 1951 est plus longue que les leurs.",
      ] },
      { h: "Conclusion", p: [
        "Les hivers du lac Abraham se réchauffent d’environ un quart de degré par décennie, et le lac compte déjà moins de jours de glace que des lacs semblables ; la plupart des plus grands lacs du monde se réchauffent plus vite.",
      ] },
    ],
    figure: "Les 300 plus grands lacs colorés selon le nombre de jours de glace, à côté de 75 hivers de température de l’air au lac Abraham et de sa tendance au réchauffement.",
  },
  it: {
    title: "Quanto velocemente si riscaldano gli inverni al lago Abraham? Un bacino delle Montagne Rocciose canadesi a confronto con i laghi del mondo",
    abstract: "Il lago Abraham, un bacino artificiale di 52 km² in Alberta noto per le bolle di metano intrappolate nel ghiaccio, è più grande del 99,8% dei 1.427.688 laghi di HydroLAKES. I suoi inverni (da dicembre a febbraio) si sono riscaldati di 0,25 °C per decennio dal 1951 (intervallo al 95%: 0,03–0,46; 75 inverni di temperatura dell’aria ERA5), anche se la tendenza dal 1991 non si distingue statisticamente da zero. LakeTEMP attribuisce al lago Abraham 142 giorni di ghiaccio l’anno, meno della mediana di 188 dei laghi alla stessa latitudine e di 155 dei laghi a latitudine e quota simili. Tra 112 grandi laghi con una tendenza 1991–2025, 102 si sono riscaldati e 45 in modo significativo, con una mediana di 0,34 °C per decennio, più veloce alle alte latitudini.",
    keywords: ["lago Abraham", "ghiaccio lacustre", "riscaldamento invernale", "HydroLAKES", "LakeTEMP", "ERA5", "analisi di tendenza"],
    sections: [
      { h: "Introduzione", p: [
        "Il lago Abraham è un bacino sul fiume North Saskatchewan creato dalla diga di Bighorn. Il suo ghiaccio trasparente intrappola colonne di bolle di metano, che lo hanno reso una meta per i fotografi. Il ghiaccio dipende dal freddo invernale, quindi le domande sono quanto velocemente si riscaldano i suoi inverni, come la sua stagione del ghiaccio si confronta con quella di altri laghi e come il suo riscaldamento si confronta con quello dei laghi più grandi del mondo.",
      ] },
      { h: "Dati e metodi", p: [
        "La geometria dei laghi viene da HydroLAKES v1.0 (tutti i laghi di almeno 0,1 km²), letta con l’estensione spaziale di DuckDB. Giorni di ghiaccio, date del ghiaccio e temperatura mensile dell’acqua superficiale vengono da LakeTEMP v1.1. La temperatura invernale dell’aria è la media da dicembre a febbraio della temperatura giornaliera a 2 m di ERA5 nel punto di emissario di ogni lago, tramite Open-Meteo, attribuita all’anno del gennaio e tenuta solo con almeno 89 giorni di dati: ogni inverno dal 1951 per il lago Abraham e il 1991–2025 per i 300 laghi più grandi (111 completi finora, per i limiti della API).",
        "Le tendenze sono pendenze ai minimi quadrati in °C per decennio, con intervalli al 95% dalla t di Student con n − 2 gradi di libertà. I giorni di ghiaccio sono confrontati con la mediana di tutti i laghi LakeTEMP di buona qualità nella stessa fascia di 1° di latitudine e con laghi a latitudine e quota simili.",
      ] },
      { h: "Risultati", p: [
        "Il lago Abraham copre 52,1 km², ha una profondità media di 34 m e si trova a 1.308 m; 3.271 laghi sono più grandi e 2.636 più profondi. I suoi inverni hanno una media di −9,7 °C, da −16,3 °C nel più freddo a −5,8 °C nel più mite. Dal 1951 si sono riscaldati di 0,246 °C per decennio (0,035–0,457; R² = 0,07), circa 1,8 °C sull’intero periodo. Dal 1991 la pendenza è di 0,16 °C per decennio con un errore standard di 0,27, quindi quella finestra più breve non separa una tendenza dal rumore tra un anno e l’altro.",
        "LakeTEMP attribuisce al lago Abraham 142 giorni di ghiaccio l’anno, contro una mediana di 188 nella sua fascia di latitudine e di 155 per 1.921 laghi a latitudine e quota simili; il 93% dei laghi che gelano ha più giorni di ghiaccio. Tra i 112 laghi con tendenza 1991–2025, 102 si sono riscaldati, 45 in modo significativo e 1 si è raffreddato in modo significativo; la mediana è di 0,34 °C per decennio e i tassi crescono con la latitudine (r = 0,38). Il tasso di lungo periodo del lago Abraham si colloca al 34° percentile del gruppo, pur coprendo un periodo più lungo.",
      ] },
      { h: "Discussione", p: [
        "Una stagione del ghiaccio più breve di quella dei laghi vicini è coerente con un bacino artificiale: le variazioni di livello e il deflusso dalla diga mantengono in movimento parte della superficie. Il suo riscaldamento invernale è moderato rispetto ai laghi più grandi, che si trovano soprattutto alle alte latitudini, dove gli inverni si riscaldano più in fretta. Per il ghiaccio che rende famoso il lago, un riscaldamento di circa 1,8 °C della temperatura invernale dell’aria dal 1951 conta, anche se ogni inverno varia di diversi gradi.",
      ] },
      { h: "Limiti", p: [
        "La temperatura dell’aria all’emissario non è la temperatura del lago, ed ERA5 smussa le valli di montagna. Le tendenze assumono inverni indipendenti e una retta. Il recupero dei 300 laghi è ancora in corso, quindi il gruppo di confronto è formato dai 112 laghi completati finora, e la serie del lago Abraham dal 1951 è più lunga della loro.",
      ] },
      { h: "Conclusione", p: [
        "Gli inverni del lago Abraham si riscaldano di circa un quarto di grado per decennio, e il lago ha già meno giorni di ghiaccio di laghi simili; la maggior parte dei laghi più grandi del mondo si riscalda più in fretta.",
      ] },
    ],
    figure: "I 300 laghi più grandi colorati per giorni di ghiaccio, accanto a 75 inverni di temperatura dell’aria al lago Abraham con la sua tendenza al riscaldamento.",
  },
  ja: {
    title: "エイブラハム湖の冬はどれほど速く暖まっているか：カナダ・ロッキーの貯水湖と世界の湖の比較",
    abstract: "アルバータ州のエイブラハム湖は、氷に閉じ込められたメタンの泡で知られる52 km²の貯水湖で、HydroLAKESに収録された1,427,688の湖の99.8%より大きい。冬（12〜2月）の気温は1951年以降10年あたり0.25 °C上昇している（95%区間0.03〜0.46、ERA5気温の75冬）。ただし1991年以降の傾向は統計的にゼロと区別できない。LakeTEMPによるエイブラハム湖の結氷日数は年142日で、同緯度の湖の中央値188日、緯度と標高が近い湖の155日より少ない。1991〜2025年の傾向がある大きな湖112のうち102が温暖化し、45は有意に温暖化していた。中央値は10年あたり0.34 °Cで、高緯度ほど速い。",
    keywords: ["エイブラハム湖", "湖氷", "冬の温暖化", "HydroLAKES", "LakeTEMP", "ERA5", "傾向分析"],
    sections: [
      { h: "はじめに", p: [
        "エイブラハム湖はビッグホーン・ダムによってノースサスカチュワン川にできた貯水湖である。透明な冬の氷がメタンの泡の柱を閉じ込めることで、写真家の目的地になった。氷は冬の寒さに左右されるため、問いは3つある。冬はどれほど速く暖まっているか、結氷期間は他の湖と比べてどうか、温暖化の速さは世界最大級の湖と比べてどうか。",
      ] },
      { h: "データと方法", p: [
        "湖の形状はHydroLAKES v1.0（0.1 km²以上のすべての湖）から、DuckDBの空間拡張で読み込んだ。結氷日数、結氷時期、月別の表層水温はLakeTEMP v1.1による。冬の気温は、Open-Meteoから得た各湖の流出点におけるERA5の日平均2 m気温の12〜2月平均で、1月の年に割り当て、89日以上のデータがある冬だけを使った。エイブラハム湖は1951年以降のすべての冬、最大の300湖は1991〜2025年である（APIの利用上限のため、現時点で完了したのは111湖）。",
        "傾向は最小二乗法の傾き（10年あたり°C）で、自由度n − 2のスチューデントのtによる95%区間を付けた。結氷日数は、同じ緯度1°帯にある品質の良いLakeTEMPの全湖の中央値、および緯度と標高が近い湖と比較した。",
      ] },
      { h: "結果", p: [
        "エイブラハム湖の面積は52.1 km²、平均水深34 m、標高1,308 mで、より大きい湖は3,271、より深い湖は2,636ある。冬の平均気温は−9.7 °Cで、最も寒い冬は−16.3 °C、最も暖かい冬は−5.8 °Cだった。1951年以降、10年あたり0.246 °C（0.035〜0.457、R² = 0.07）上昇し、全期間で約1.8 °Cになる。1991年以降の傾きは10年あたり0.16 °C、標準誤差0.27で、この短い期間では傾向を年々の変動と区別できない。",
        "LakeTEMPではエイブラハム湖の結氷日数は年142日で、同緯度帯の中央値188日、緯度と標高の近い1,921湖の中央値155日を下回る。結氷する湖の93%はこれより結氷日数が多い。1991〜2025年の傾向がある112湖のうち、102が温暖化、45が有意に温暖化、1が有意に寒冷化した。中央値は10年あたり0.34 °Cで、緯度が高いほど速い（r = 0.38）。エイブラハム湖の長期の上昇率はこのグループの34パーセンタイルに当たるが、対象期間はより長い。",
      ] },
      { h: "考察", p: [
        "近くの湖より結氷期間が短いのは貯水湖として自然である。水位の変化やダムからの放流で水面の一部が動き続けるからだ。冬の温暖化は最大級の湖に比べると穏やかである。それらの湖の多くは冬の温暖化が最も速い高緯度にある。湖を有名にした氷にとって、1951年以降の冬の気温が約1.8 °C上がったことは、冬ごとに数度の変動があるとしても意味がある。",
      ] },
      { h: "限界", p: [
        "流出点の気温は湖の水温ではなく、ERA5は山の谷を平滑化してしまう。傾向は各冬が独立で直線的であることを仮定している。300湖のデータ取得はまだ進行中で、比較対象は完了した112湖であり、1951年からのエイブラハム湖の記録はそれらより長い。",
      ] },
      { h: "結論", p: [
        "エイブラハム湖の冬は10年あたり約4分の1度暖まっており、湖はすでに似た湖より結氷日数が少ない。世界最大級の湖の多くは、さらに速く暖まっている。",
      ] },
    ],
    figure: "結氷日数で色分けした最大の300湖と、エイブラハム湖の75冬の気温とその上昇傾向。",
  },
  zh: {
    title: "亚伯拉罕湖的冬天变暖有多快？加拿大落基山脉的一座水库与世界湖泊的比较",
    abstract: "亚伯拉罕湖是艾伯塔省一座 52 平方公里的水库，以冰中冻结的甲烷气泡闻名，比 HydroLAKES 中 1,427,688 个湖泊的 99.8% 都大。自 1951 年以来，它的冬季（12 月至 2 月）每十年升温 0.25 °C（95% 区间 0.03–0.46；75 个冬季的 ERA5 气温），但 1991 年以来的趋势在统计上与零无法区分。LakeTEMP 显示亚伯拉罕湖每年结冰 142 天，少于同纬度湖泊的中位数 188 天，也少于纬度和海拔相近湖泊的 155 天。在 112 个有 1991–2025 年趋势的大湖中，102 个变暖，45 个显著变暖，中位数为每十年 0.34 °C，纬度越高变暖越快。",
    keywords: ["亚伯拉罕湖", "湖冰", "冬季变暖", "HydroLAKES", "LakeTEMP", "ERA5", "趋势分析"],
    sections: [
      { h: "引言", p: [
        "亚伯拉罕湖是北萨斯喀彻温河上由比格霍恩大坝形成的水库。它清澈的冬冰困住了一串串甲烷气泡，使之成为摄影胜地。冰取决于冬季的寒冷，因此问题是：它的冬季变暖有多快？它的结冰期与其他湖泊相比如何？它的变暖速度与世界最大的湖泊相比又如何？",
      ] },
      { h: "数据与方法", p: [
        "湖泊几何数据来自 HydroLAKES v1.0（所有面积至少 0.1 平方公里的湖泊），用 DuckDB 空间扩展读取。结冰天数、结冰日期和月度表层水温来自 LakeTEMP v1.1。冬季气温是通过 Open-Meteo 获取的每个湖泊出水口处 ERA5 日均 2 米气温的 12 月至 2 月平均值，归入 1 月所在年份，并且只保留至少有 89 天数据的冬季：亚伯拉罕湖使用 1951 年以来的所有冬季，300 个最大湖泊使用 1991–2025 年（受 API 配额限制，目前完成了 111 个）。",
        "趋势采用最小二乘斜率，单位为每十年 °C，95% 区间来自自由度为 n − 2 的 Student t 分布。结冰天数与同一 1° 纬度带内所有高质量 LakeTEMP 湖泊的中位数以及纬度和海拔相近的湖泊进行比较。",
      ] },
      { h: "结果", p: [
        "亚伯拉罕湖面积 52.1 平方公里，平均深度 34 米，海拔 1,308 米；比它大的湖有 3,271 个，比它深的有 2,636 个。它的冬季平均气温为 −9.7 °C，最冷的冬季 −16.3 °C，最暖的 −5.8 °C。自 1951 年以来每十年升温 0.246 °C（0.035–0.457；R² = 0.07），整个记录期约升温 1.8 °C。1991 年以来斜率为每十年 0.16 °C，标准误为 0.27，因此这个较短的时段无法把趋势与年际波动区分开。",
        "LakeTEMP 显示亚伯拉罕湖每年结冰 142 天，而同一纬度带的中位数为 188 天，纬度和海拔相近的 1,921 个湖泊为 155 天；在会结冰的湖泊中，93% 的结冰天数更多。在 112 个有 1991–2025 年趋势的湖泊中，102 个变暖，45 个显著变暖，1 个显著变冷；中位数为每十年 0.34 °C，且速率随纬度升高而增加（r = 0.38）。亚伯拉罕湖的长期速率位于该组的第 34 百分位，但其时间跨度更长。",
      ] },
      { h: "讨论", p: [
        "结冰期比周边湖泊短，这与水库的特点一致：水位变化和大坝泄流使部分水面保持流动。与最大的湖泊相比，它的冬季变暖较为温和，因为那些湖泊大多位于冬季变暖最快的高纬度地区。对于让这座湖出名的冰来说，1951 年以来冬季气温约 1.8 °C 的上升是有意义的，即使每个冬季之间相差好几度。",
      ] },
      { h: "局限", p: [
        "出水口处的气温不等于湖泊水温，ERA5 也会把山谷平滑掉。趋势假设各个冬季相互独立且呈线性。300 个湖泊的数据下载仍在进行，因此比较组是目前已完成的 112 个湖泊，而亚伯拉罕湖自 1951 年的记录比它们更长。",
      ] },
      { h: "结论", p: [
        "亚伯拉罕湖的冬季每十年升温约四分之一度，而且它的结冰天数已经少于相似的湖泊；世界上大多数最大的湖泊升温更快。",
      ] },
    ],
    figure: "按结冰天数着色的 300 个最大湖泊，旁边是亚伯拉罕湖 75 个冬季的气温及其变暖趋势。",
  },
};
