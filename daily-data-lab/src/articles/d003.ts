import type { ArticleSet } from "./types";

// Figures from src/days/day-003-light-pillars/catalog.json, recomputed in the Day 003 Excel workbook (Analysis A–E).
export const D003: ArticleSet = {
  en: {
    title: "Where and when do light pillars appear? A photographic catalogue of ice-crystal optics with reanalysis weather",
    abstract: "From 1,239 Wikimedia Commons files I built a catalogue of 931 dated photographs of light, sun and moon pillars, sun dogs (parhelia), 22° halos and circumzenithal arcs, each with its author, license and an evidence level. 197 photos can be located; for these I attach ERA5 weather and compute the Sun's elevation. Pillars make up 11.1% of the catalogue. Light pillars, which reflect artificial lights, were photographed in very cold, humid and calm air (median −19.4 °C, 87% relative humidity) with the Sun far below the horizon, whereas halos and sun dogs appear in milder air under high cloud. The catalogue maps where people photograph the sky, not where these displays are most frequent.",
    keywords: ["light pillars", "ice halos", "atmospheric optics", "Wikimedia Commons", "ERA5", "citizen photography"],
    sections: [
      { h: "Introduction", p: [
        "Light pillars are vertical shafts of light above lamps or the Sun, made when flat hexagonal ice crystals float almost horizontally and reflect the light from their faces. The same crystals refract light into halos, sun dogs and arcs. These displays are documented mostly by amateur photographers. This study asks what a large public photo archive can say about where and when they are seen, and under what weather.",
      ] },
      { h: "Data and methods", p: [
        "I listed every file in the Wikimedia Commons categories for sun pillars (including the by-country sub-categories), light pillars, parhelia, 22° halos and circumzenithal arcs: 1,239 files. I kept the 931 with a capture date between 2000 and 2026, dropping 298 without a date and 10 outside the window. Each photo keeps its phenomena, author, license and link. Evidence level A means a camera position and a capture time, B a place only, and C a date only; missing values are left empty, never set to zero.",
        "For the 197 located photos I added the country and hemisphere (Natural Earth), ERA5 weather from Open-Meteo at the capture hour, or as a daily mean when there is no time, and the Sun's elevation from the NOAA solar-position equations. Shares of pillars carry 95% Wilson intervals, and weather is summarised with medians and quartiles because counts are small.",
      ] },
      { h: "Results", p: [
        "The catalogue holds 505 photos of 22° halos, 361 of sun dogs, 100 of circumzenithal arcs, 84 of sun pillars, 19 of light pillars and 2 of moon pillars; a photo can show several. Pillars of any kind are 103 photos, 11.1% of the total. Evidence is mostly weak: 136 photos reach level A, 61 level B and 734 level C. Of the located photos, 181 are in the northern hemisphere and 16 in the southern; the United States (41), Germany (17), Canada (16) and the United Kingdom (13) contribute most.",
        "Weather separates the mechanisms. The located light pillars were photographed at a median of −19.4 °C and 87% humidity with light wind (12 km/h), almost no high cloud, and the Sun 40° below the horizon: they are night scenes over towns. Sun pillars sit near sunrise or sunset (median Sun elevation −9.7°) in air around 4.5 °C. Halos and sun dogs appear in milder air (medians 10.0 and 11.7 °C) under substantial high cloud (46% and 60%), with the Sun well above the horizon (34° and 8°).",
      ] },
      { h: "Discussion", p: [
        "The contrast matches the physics of the two families. Pillars need plate crystals settling near the ground in cold, still air, where they behave like a field of small mirrors; halos and arcs form in cirrus high above the observer, regardless of the cold at the surface. The northern, high-latitude bias of the catalogue reflects both climate and who photographs and uploads.",
      ] },
      { h: "Limitations", p: [
        "Counts are small once photos are located, and most photos are dated but not placed. Camera clocks are assumed to show local time, so the Sun's elevation is only as good as the clock. ERA5 is a reanalysis on a coarse grid and cannot see the shallow layer of crystals that makes a light pillar.",
      ] },
      { h: "Conclusion", p: [
        "A public photo archive, carefully filtered and joined with reanalysis weather, recovers the expected physical contrast: light pillars belong to very cold, calm nights, while halos and sun dogs belong to high cloud in daylight.",
      ] },
    ],
    figure: "World map of located photographs of light pillars and ice halos, next to a simulated view of light pillars.",
  },
  es: {
    title: "¿Dónde y cuándo aparecen los pilares de luz? Un catálogo fotográfico de óptica de cristales de hielo con clima de reanálisis",
    abstract: "A partir de 1,239 archivos de Wikimedia Commons construí un catálogo de 931 fotografías fechadas de pilares de luz, solares y lunares, parhelios, halos de 22° y arcos circuncenitales, cada una con su autor, licencia y nivel de evidencia. 197 fotos se pueden ubicar; a ellas les agrego el clima de ERA5 y calculo la elevación del Sol. Los pilares son el 11.1% del catálogo. Los pilares de luz, que reflejan luces artificiales, se fotografiaron en aire muy frío, húmedo y en calma (mediana de −19.4 °C y 87% de humedad relativa) con el Sol muy por debajo del horizonte, mientras que los halos y parhelios aparecen en aire más templado y con nubes altas. El catálogo muestra dónde la gente fotografía el cielo, no dónde estos fenómenos son más frecuentes.",
    keywords: ["pilares de luz", "halos de hielo", "óptica atmosférica", "Wikimedia Commons", "ERA5", "fotografía ciudadana"],
    sections: [
      { h: "Introducción", p: [
        "Los pilares de luz son columnas verticales de luz sobre lámparas o sobre el Sol, que se forman cuando cristales de hielo hexagonales y planos flotan casi horizontales y reflejan la luz en sus caras. Los mismos cristales refractan la luz y forman halos, parhelios y arcos. Estos fenómenos los documentan sobre todo fotógrafos aficionados. Este estudio pregunta qué puede decir un gran archivo público de fotos sobre dónde y cuándo se ven, y con qué clima.",
      ] },
      { h: "Datos y métodos", p: [
        "Listé todos los archivos de las categorías de Wikimedia Commons de pilares solares (incluidas las subcategorías por país), pilares de luz, parhelios, halos de 22° y arcos circuncenitales: 1,239 archivos. Conservé los 931 con fecha de captura entre 2000 y 2026, descartando 298 sin fecha y 10 fuera de ese periodo. Cada foto conserva sus fenómenos, autor, licencia y enlace. El nivel de evidencia A indica posición de la cámara y hora de captura, B solo un lugar y C solo una fecha; los valores faltantes se dejan vacíos, nunca en cero.",
        "A las 197 fotos ubicadas les agregué el país y el hemisferio (Natural Earth), el clima de ERA5 de Open-Meteo a la hora de captura, o como promedio diario cuando no hay hora, y la elevación del Sol con las ecuaciones de posición solar de NOAA. Las proporciones de pilares llevan intervalos de Wilson de 95%, y el clima se resume con medianas y cuartiles porque los conteos son pequeños.",
      ] },
      { h: "Resultados", p: [
        "El catálogo tiene 505 fotos de halos de 22°, 361 de parhelios, 100 de arcos circuncenitales, 84 de pilares solares, 19 de pilares de luz y 2 de pilares lunares; una foto puede mostrar varios. Los pilares de cualquier tipo suman 103 fotos, el 11.1% del total. La evidencia es mayormente débil: 136 fotos llegan al nivel A, 61 al B y 734 al C. De las fotos ubicadas, 181 están en el hemisferio norte y 16 en el sur; Estados Unidos (41), Alemania (17), Canadá (16) y el Reino Unido (13) aportan más.",
        "El clima separa los mecanismos. Los pilares de luz ubicados se fotografiaron con una mediana de −19.4 °C y 87% de humedad, viento ligero (12 km/h), casi sin nubes altas y el Sol 40° bajo el horizonte: son escenas nocturnas sobre ciudades. Los pilares solares ocurren cerca del amanecer o el atardecer (mediana de elevación solar de −9.7°) con aire de unos 4.5 °C. Los halos y parhelios aparecen con aire más templado (medianas de 10.0 y 11.7 °C), bastantes nubes altas (46% y 60%) y el Sol bien arriba del horizonte (34° y 8°).",
      ] },
      { h: "Discusión", p: [
        "El contraste coincide con la física de las dos familias. Los pilares necesitan cristales planos que bajan cerca del suelo en aire frío y quieto, donde funcionan como un campo de pequeños espejos; los halos y arcos se forman en cirros muy por encima del observador, sin importar el frío en la superficie. El sesgo del catálogo hacia el norte y las latitudes altas refleja tanto el clima como quién fotografía y sube las imágenes.",
      ] },
      { h: "Limitaciones", p: [
        "Los conteos son pequeños una vez que se ubican las fotos, y la mayoría tiene fecha pero no lugar. Se supone que el reloj de la cámara marca la hora local, así que la elevación del Sol es tan buena como ese reloj. ERA5 es un reanálisis en una malla gruesa y no puede ver la capa delgada de cristales que forma un pilar de luz.",
      ] },
      { h: "Conclusión", p: [
        "Un archivo público de fotos, bien filtrado y unido al clima de reanálisis, recupera el contraste físico esperado: los pilares de luz pertenecen a noches muy frías y en calma, y los halos y parhelios a las nubes altas de día.",
      ] },
    ],
    figure: "Mapa mundial de fotografías ubicadas de pilares de luz y halos de hielo, junto a una vista simulada de pilares de luz.",
  },
  pt: {
    title: "Onde e quando aparecem os pilares de luz? Um catálogo fotográfico de óptica de cristais de gelo com clima de reanálise",
    abstract: "A partir de 1.239 arquivos do Wikimedia Commons montei um catálogo de 931 fotografias datadas de pilares de luz, solares e lunares, parélios, halos de 22° e arcos circunzenitais, cada uma com autor, licença e nível de evidência. 197 fotos podem ser localizadas; para elas junto o clima do ERA5 e calculo a elevação do Sol. Os pilares são 11,1% do catálogo. Os pilares de luz, que refletem luzes artificiais, foram fotografados em ar muito frio, úmido e calmo (mediana de −19,4 °C e 87% de umidade relativa) com o Sol bem abaixo do horizonte, enquanto halos e parélios aparecem em ar mais ameno e sob nuvens altas. O catálogo mostra onde as pessoas fotografam o céu, não onde esses fenômenos são mais frequentes.",
    keywords: ["pilares de luz", "halos de gelo", "óptica atmosférica", "Wikimedia Commons", "ERA5", "fotografia cidadã"],
    sections: [
      { h: "Introdução", p: [
        "Pilares de luz são colunas verticais de luz acima de lâmpadas ou do Sol, formadas quando cristais de gelo hexagonais e planos flutuam quase na horizontal e refletem a luz em suas faces. Os mesmos cristais refratam a luz em halos, parélios e arcos. Esses fenômenos são documentados sobretudo por fotógrafos amadores. Este estudo pergunta o que um grande arquivo público de fotos pode dizer sobre onde e quando eles são vistos, e com que clima.",
      ] },
      { h: "Dados e métodos", p: [
        "Listei todos os arquivos das categorias do Wikimedia Commons de pilares solares (incluindo as subcategorias por país), pilares de luz, parélios, halos de 22° e arcos circunzenitais: 1.239 arquivos. Mantive os 931 com data de captura entre 2000 e 2026, descartando 298 sem data e 10 fora do período. Cada foto guarda seus fenômenos, autor, licença e link. O nível de evidência A indica posição da câmera e hora de captura, B só um lugar e C só uma data; valores ausentes ficam vazios, nunca zero.",
        "Para as 197 fotos localizadas, juntei país e hemisfério (Natural Earth), o clima do ERA5 via Open-Meteo na hora da captura, ou a média diária quando não há hora, e a elevação do Sol pelas equações de posição solar da NOAA. As proporções de pilares têm intervalos de Wilson de 95%, e o clima é resumido com medianas e quartis porque as contagens são pequenas.",
      ] },
      { h: "Resultados", p: [
        "O catálogo tem 505 fotos de halos de 22°, 361 de parélios, 100 de arcos circunzenitais, 84 de pilares solares, 19 de pilares de luz e 2 de pilares lunares; uma foto pode mostrar vários. Pilares de qualquer tipo somam 103 fotos, 11,1% do total. A evidência é em geral fraca: 136 fotos chegam ao nível A, 61 ao B e 734 ao C. Das fotos localizadas, 181 estão no hemisfério norte e 16 no sul; Estados Unidos (41), Alemanha (17), Canadá (16) e Reino Unido (13) contribuem mais.",
        "O clima separa os mecanismos. Os pilares de luz localizados foram fotografados com mediana de −19,4 °C e 87% de umidade, vento fraco (12 km/h), quase sem nuvens altas e o Sol 40° abaixo do horizonte: são cenas noturnas sobre cidades. Os pilares solares ocorrem perto do nascer ou do pôr do sol (mediana de elevação solar de −9,7°) com ar em torno de 4,5 °C. Halos e parélios aparecem com ar mais ameno (medianas de 10,0 e 11,7 °C), bastante nuvem alta (46% e 60%) e o Sol bem acima do horizonte (34° e 8°).",
      ] },
      { h: "Discussão", p: [
        "O contraste combina com a física das duas famílias. Os pilares precisam de cristais planos descendo perto do solo em ar frio e parado, onde funcionam como um campo de pequenos espelhos; halos e arcos se formam em cirros muito acima do observador, independentemente do frio na superfície. O viés do catálogo para o norte e altas latitudes reflete tanto o clima quanto quem fotografa e publica.",
      ] },
      { h: "Limitações", p: [
        "As contagens ficam pequenas depois de localizar as fotos, e a maioria tem data, mas não lugar. Supõe-se que o relógio da câmera mostre a hora local, então a elevação do Sol é tão boa quanto esse relógio. O ERA5 é uma reanálise numa grade grossa e não enxerga a camada fina de cristais que forma um pilar de luz.",
      ] },
      { h: "Conclusão", p: [
        "Um arquivo público de fotos, bem filtrado e unido ao clima de reanálise, recupera o contraste físico esperado: pilares de luz pertencem a noites muito frias e calmas, e halos e parélios a nuvens altas durante o dia.",
      ] },
    ],
    figure: "Mapa-múndi das fotografias localizadas de pilares de luz e halos de gelo, ao lado de uma vista simulada de pilares de luz.",
  },
  fr: {
    title: "Où et quand voit-on des piliers lumineux ? Un catalogue photographique de l’optique des cristaux de glace avec la météo de réanalyse",
    abstract: "À partir de 1 239 fichiers de Wikimedia Commons, j’ai constitué un catalogue de 931 photographies datées de piliers lumineux, solaires et lunaires, de parhélies, de halos de 22° et d’arcs circumzénithaux, chacune avec son auteur, sa licence et un niveau de preuve. 197 photos sont localisables ; j’y associe la météo ERA5 et je calcule la hauteur du Soleil. Les piliers représentent 11,1 % du catalogue. Les piliers lumineux, qui reflètent des lumières artificielles, ont été photographiés dans un air très froid, humide et calme (médiane de −19,4 °C et 87 % d’humidité relative), le Soleil loin sous l’horizon, tandis que halos et parhélies apparaissent dans un air plus doux sous des nuages élevés. Le catalogue montre où l’on photographie le ciel, pas où ces phénomènes sont les plus fréquents.",
    keywords: ["piliers lumineux", "halos de glace", "optique atmosphérique", "Wikimedia Commons", "ERA5", "photographie amateur"],
    sections: [
      { h: "Introduction", p: [
        "Les piliers lumineux sont des colonnes verticales de lumière au-dessus des lampes ou du Soleil ; ils se forment quand des cristaux de glace hexagonaux et plats flottent presque à l’horizontale et réfléchissent la lumière sur leurs faces. Les mêmes cristaux réfractent la lumière en halos, parhélies et arcs. Ces phénomènes sont surtout documentés par des photographes amateurs. Cette étude se demande ce qu’une grande archive photographique publique peut dire d’où et quand on les voit, et par quel temps.",
      ] },
      { h: "Données et méthodes", p: [
        "J’ai listé tous les fichiers des catégories de Wikimedia Commons consacrées aux piliers solaires (y compris les sous-catégories par pays), aux piliers lumineux, aux parhélies, aux halos de 22° et aux arcs circumzénithaux : 1 239 fichiers. J’ai gardé les 931 qui ont une date de prise de vue entre 2000 et 2026, en écartant 298 fichiers sans date et 10 hors période. Chaque photo garde ses phénomènes, son auteur, sa licence et son lien. Le niveau de preuve A signifie position de l’appareil et heure de prise de vue, B un lieu seulement, C une date seulement ; les valeurs manquantes restent vides, jamais à zéro.",
        "Pour les 197 photos localisées, j’ai ajouté le pays et l’hémisphère (Natural Earth), la météo ERA5 d’Open-Meteo à l’heure de la prise de vue, ou en moyenne journalière sans heure, et la hauteur du Soleil d’après les équations de position solaire de la NOAA. Les parts de piliers portent des intervalles de Wilson à 95 %, et la météo est résumée par des médianes et des quartiles, les effectifs étant faibles.",
      ] },
      { h: "Résultats", p: [
        "Le catalogue compte 505 photos de halos de 22°, 361 de parhélies, 100 d’arcs circumzénithaux, 84 de piliers solaires, 19 de piliers lumineux et 2 de piliers lunaires ; une photo peut en montrer plusieurs. Les piliers de tout type totalisent 103 photos, soit 11,1 %. Les preuves sont surtout faibles : 136 photos atteignent le niveau A, 61 le niveau B et 734 le niveau C. Parmi les photos localisées, 181 sont dans l’hémisphère nord et 16 dans l’hémisphère sud ; les États-Unis (41), l’Allemagne (17), le Canada (16) et le Royaume-Uni (13) en fournissent le plus.",
        "La météo sépare les mécanismes. Les piliers lumineux localisés ont été photographiés par une médiane de −19,4 °C et 87 % d’humidité, avec un vent faible (12 km/h), presque sans nuages élevés et le Soleil 40° sous l’horizon : ce sont des scènes nocturnes au-dessus des villes. Les piliers solaires se situent près du lever ou du coucher du Soleil (hauteur solaire médiane de −9,7°) dans un air d’environ 4,5 °C. Halos et parhélies apparaissent dans un air plus doux (médianes de 10,0 et 11,7 °C), sous beaucoup de nuages élevés (46 % et 60 %), le Soleil bien au-dessus de l’horizon (34° et 8°).",
      ] },
      { h: "Discussion", p: [
        "Le contraste correspond à la physique des deux familles. Les piliers exigent des cristaux plats descendant près du sol dans un air froid et immobile, où ils se comportent comme un champ de petits miroirs ; halos et arcs se forment dans des cirrus bien au-dessus de l’observateur, quel que soit le froid en surface. Le biais nordique et de haute latitude du catalogue reflète à la fois le climat et qui photographie et publie.",
      ] },
      { h: "Limites", p: [
        "Les effectifs deviennent faibles une fois les photos localisées, et la plupart sont datées sans être situées. On suppose que l’horloge de l’appareil indique l’heure locale : la hauteur du Soleil ne vaut que ce que vaut cette horloge. ERA5 est une réanalyse sur une grille grossière qui ne voit pas la fine couche de cristaux à l’origine d’un pilier lumineux.",
      ] },
      { h: "Conclusion", p: [
        "Une archive photographique publique, soigneusement filtrée et croisée avec la météo de réanalyse, retrouve le contraste physique attendu : les piliers lumineux appartiennent aux nuits très froides et calmes, les halos et parhélies aux nuages élevés en plein jour.",
      ] },
    ],
    figure: "Carte du monde des photographies localisées de piliers lumineux et de halos de glace, à côté d’une vue simulée de piliers lumineux.",
  },
  it: {
    title: "Dove e quando compaiono i pilastri di luce? Un catalogo fotografico dell’ottica dei cristalli di ghiaccio con il meteo di rianalisi",
    abstract: "Da 1.239 file di Wikimedia Commons ho costruito un catalogo di 931 fotografie datate di pilastri di luce, solari e lunari, pareli, aloni di 22° e archi circumzenitali, ciascuna con autore, licenza e livello di evidenza. 197 foto si possono localizzare; per queste aggiungo il meteo ERA5 e calcolo l’elevazione del Sole. I pilastri sono l’11,1% del catalogo. I pilastri di luce, che riflettono luci artificiali, sono stati fotografati in aria molto fredda, umida e calma (mediana −19,4 °C e 87% di umidità relativa) con il Sole molto sotto l’orizzonte, mentre aloni e pareli compaiono in aria più mite e sotto nubi alte. Il catalogo mostra dove le persone fotografano il cielo, non dove questi fenomeni sono più frequenti.",
    keywords: ["pilastri di luce", "aloni di ghiaccio", "ottica atmosferica", "Wikimedia Commons", "ERA5", "fotografia amatoriale"],
    sections: [
      { h: "Introduzione", p: [
        "I pilastri di luce sono colonne verticali di luce sopra le lampade o il Sole, che si formano quando cristalli di ghiaccio esagonali e piatti fluttuano quasi orizzontali e riflettono la luce sulle loro facce. Gli stessi cristalli rifrangono la luce in aloni, pareli e archi. Questi fenomeni sono documentati soprattutto da fotografi amatoriali. Lo studio si chiede che cosa possa dire un grande archivio fotografico pubblico su dove e quando si vedono, e con quale meteo.",
      ] },
      { h: "Dati e metodi", p: [
        "Ho elencato tutti i file delle categorie di Wikimedia Commons dedicate ai pilastri solari (incluse le sottocategorie per paese), ai pilastri di luce, ai pareli, agli aloni di 22° e agli archi circumzenitali: 1.239 file. Ho tenuto i 931 con data di scatto tra il 2000 e il 2026, scartando 298 file senza data e 10 fuori periodo. Ogni foto conserva fenomeni, autore, licenza e link. Il livello di evidenza A indica posizione della fotocamera e ora di scatto, B solo un luogo, C solo una data; i valori mancanti restano vuoti, mai a zero.",
        "Per le 197 foto localizzate ho aggiunto paese ed emisfero (Natural Earth), il meteo ERA5 di Open-Meteo all’ora dello scatto, o la media giornaliera se l’ora manca, e l’elevazione del Sole con le equazioni di posizione solare della NOAA. Le quote di pilastri hanno intervalli di Wilson al 95%, e il meteo è riassunto con mediane e quartili perché i conteggi sono piccoli.",
      ] },
      { h: "Risultati", p: [
        "Il catalogo contiene 505 foto di aloni di 22°, 361 di pareli, 100 di archi circumzenitali, 84 di pilastri solari, 19 di pilastri di luce e 2 di pilastri lunari; una foto può mostrarne più di uno. I pilastri di ogni tipo sono 103 foto, l’11,1% del totale. L’evidenza è per lo più debole: 136 foto raggiungono il livello A, 61 il B e 734 il C. Tra le foto localizzate, 181 sono nell’emisfero nord e 16 in quello sud; Stati Uniti (41), Germania (17), Canada (16) e Regno Unito (13) contribuiscono di più.",
        "Il meteo separa i meccanismi. I pilastri di luce localizzati sono stati fotografati con una mediana di −19,4 °C e 87% di umidità, vento debole (12 km/h), quasi senza nubi alte e il Sole 40° sotto l’orizzonte: sono scene notturne sopra le città. I pilastri solari si collocano vicino all’alba o al tramonto (elevazione solare mediana −9,7°) con aria intorno ai 4,5 °C. Aloni e pareli compaiono in aria più mite (mediane di 10,0 e 11,7 °C), con molte nubi alte (46% e 60%) e il Sole ben sopra l’orizzonte (34° e 8°).",
      ] },
      { h: "Discussione", p: [
        "Il contrasto corrisponde alla fisica delle due famiglie. I pilastri richiedono cristalli piatti che scendono vicino al suolo in aria fredda e ferma, dove si comportano come un campo di piccoli specchi; aloni e archi si formano nei cirri molto sopra l’osservatore, indipendentemente dal freddo al suolo. La tendenza del catalogo verso nord e verso le alte latitudini riflette sia il clima sia chi fotografa e pubblica.",
      ] },
      { h: "Limiti", p: [
        "I conteggi diventano piccoli una volta localizzate le foto, e la maggior parte è datata ma non localizzata. Si assume che l’orologio della fotocamera segni l’ora locale, quindi l’elevazione del Sole è affidabile quanto quell’orologio. ERA5 è una rianalisi su una griglia grossolana e non vede il sottile strato di cristalli che produce un pilastro di luce.",
      ] },
      { h: "Conclusione", p: [
        "Un archivio fotografico pubblico, filtrato con cura e unito al meteo di rianalisi, ritrova il contrasto fisico atteso: i pilastri di luce appartengono a notti molto fredde e calme, aloni e pareli alle nubi alte di giorno.",
      ] },
    ],
    figure: "Mappa del mondo delle fotografie localizzate di pilastri di luce e aloni di ghiaccio, accanto a una vista simulata di pilastri di luce.",
  },
  ja: {
    title: "光柱はどこで、いつ現れるか：再解析気象データを付けた氷晶光学現象の写真カタログ",
    abstract: "ウィキメディア・コモンズの1,239ファイルから、光柱・太陽柱・月柱、幻日、22°ハロ、環天頂アークを写した撮影日付きの写真931枚のカタログを作成し、各写真に作者、ライセンス、証拠レベルを付けた。位置を特定できる197枚にはERA5の気象を結び付け、太陽高度を計算した。柱状の現象はカタログの11.1%を占める。人工の光を反射する光柱は、非常に寒く湿った無風に近い空気（中央値−19.4 °C、相対湿度87%）の中で、太陽が地平線のはるか下にあるときに撮影されていた。一方、ハロや幻日はより穏やかな気温で上層雲の下に現れる。このカタログは人が空を撮影する場所を示すもので、現象が最も多い場所を示すものではない。",
    keywords: ["光柱", "氷晶ハロ", "大気光学", "ウィキメディア・コモンズ", "ERA5", "市民による写真"],
    sections: [
      { h: "はじめに", p: [
        "光柱は街灯や太陽の上に立つ垂直の光の柱で、平たい六角板状の氷晶がほぼ水平に浮かび、その面で光を反射することで生じる。同じ氷晶は光を屈折させてハロ、幻日、アークも作る。こうした現象を記録しているのは主にアマチュア写真家である。本研究は、大規模な公開写真アーカイブから、これらがどこで、いつ、どんな気象のもとで見られるかを問う。",
      ] },
      { h: "データと方法", p: [
        "ウィキメディア・コモンズの太陽柱（国別サブカテゴリーを含む）、光柱、幻日、22°ハロ、環天頂アークのカテゴリーにある全ファイル1,239件を列挙した。2000年から2026年の撮影日を持つ931件を残し、日付のない298件と期間外の10件を除いた。各写真には現象、作者、ライセンス、リンクを保持する。証拠レベルAはカメラ位置と撮影時刻、Bは場所のみ、Cは日付のみを意味する。欠損値は空欄のままで、0にはしない。",
        "位置を特定できた197枚には、国と半球（Natural Earth）、撮影時刻におけるOpen-MeteoのERA5気象（時刻がない場合は日平均）、NOAAの太陽位置式による太陽高度を付けた。柱状現象の割合には95% Wilson区間を付け、件数が少ないため気象は中央値と四分位で要約した。",
      ] },
      { h: "結果", p: [
        "カタログには22°ハロ505枚、幻日361枚、環天頂アーク100枚、太陽柱84枚、光柱19枚、月柱2枚が含まれる（1枚に複数写る場合がある）。柱状の現象は合計103枚で全体の11.1%。証拠は概して弱く、レベルAが136枚、Bが61枚、Cが734枚である。位置のわかる写真のうち181枚が北半球、16枚が南半球で、米国（41）、ドイツ（17）、カナダ（16）、英国（13）が多い。",
        "気象は2つの仕組みを分ける。位置のわかる光柱は、中央値−19.4 °C、湿度87%、弱い風（12 km/h）、上層雲がほとんどなく、太陽が地平線下40°の条件で撮影されていた。つまり町の上空の夜景である。太陽柱は日の出・日の入りの前後（太陽高度の中央値−9.7°）、気温約4.5 °Cで現れる。ハロと幻日はより穏やかな気温（中央値10.0 °Cと11.7 °C）で、上層雲が多く（46%と60%）、太陽が地平線より十分高い（34°と8°）ときに現れる。",
      ] },
      { h: "考察", p: [
        "この対比は2つの現象群の物理と一致する。柱状の現象には、冷たく静かな空気の中を地表近くまで降りてくる板状氷晶が必要で、それが小さな鏡の群れとして働く。ハロやアークは観察者のはるか上空の巻雲で生じ、地表の寒さには左右されない。カタログが北半球・高緯度に偏るのは、気候と、誰が撮影しアップロードするかの両方を反映している。",
      ] },
      { h: "限界", p: [
        "写真の位置を特定すると件数は少なくなり、大半は日付があっても場所がない。カメラの時計は現地時刻を示すと仮定しているため、太陽高度の精度は時計しだいである。ERA5は粗い格子の再解析で、光柱を作る薄い氷晶の層は捉えられない。",
      ] },
      { h: "結論", p: [
        "丁寧に絞り込んで再解析気象と結び付けた公開写真アーカイブは、予想どおりの物理的な対比を再現する。光柱は非常に寒く静かな夜の現象であり、ハロと幻日は昼間の上層雲の現象である。",
      ] },
    ],
    figure: "位置を特定できた光柱と氷晶ハロの写真の世界地図と、光柱のシミュレーション画像。",
  },
  zh: {
    title: "光柱在何时何地出现？附再分析气象数据的冰晶光学现象照片目录",
    abstract: "我从维基共享资源的 1,239 个文件中建立了一个目录，收录 931 张有拍摄日期的照片，内容包括光柱、日柱、月柱、幻日、22° 晕和环天顶弧，每张照片都附有作者、许可证和证据等级。其中 197 张可以定位；我为它们附上 ERA5 气象数据并计算太阳高度。柱类现象占目录的 11.1%。反射人工光源的光柱是在非常寒冷、潮湿且平静的空气中拍到的（中位数 −19.4 °C、相对湿度 87%），太阳远在地平线以下；而晕和幻日出现在较温和的空气中、高云之下。这个目录反映的是人们在哪里拍摄天空，而不是这些现象最常出现的地方。",
    keywords: ["光柱", "冰晕", "大气光学", "维基共享资源", "ERA5", "公众摄影"],
    sections: [
      { h: "引言", p: [
        "光柱是灯光或太阳上方的垂直光束，当扁平的六角形冰晶几乎水平地漂浮并用表面反射光线时就会形成。同样的冰晶还会折射光线，形成晕、幻日和弧。这些现象主要由业余摄影者记录。本研究要问：一个大型公开照片档案能告诉我们它们在何时何地、在什么天气下被看到？",
      ] },
      { h: "数据与方法", p: [
        "我列出了维基共享资源中日柱（包括按国家划分的子分类）、光柱、幻日、22° 晕和环天顶弧分类下的全部文件，共 1,239 个。保留拍摄日期在 2000 年至 2026 年之间的 931 个，剔除 298 个没有日期和 10 个超出时间范围的文件。每张照片保留其现象、作者、许可证和链接。证据等级 A 表示有相机位置和拍摄时间，B 只有地点，C 只有日期；缺失值保持为空，绝不填成 0。",
        "对 197 张可定位的照片，我加上了国家和半球（Natural Earth）、拍摄时刻的 Open-Meteo ERA5 气象（没有时间时用日平均），以及用 NOAA 太阳位置公式计算的太阳高度。柱类现象的占比附有 95% Wilson 区间；由于样本量小，气象用中位数和四分位数概括。",
      ] },
      { h: "结果", p: [
        "目录包含 22° 晕照片 505 张、幻日 361 张、环天顶弧 100 张、日柱 84 张、光柱 19 张和月柱 2 张；一张照片可以包含多种现象。各类柱共 103 张，占总数的 11.1%。证据大多较弱：136 张达到 A 级，61 张 B 级，734 张 C 级。可定位的照片中 181 张在北半球、16 张在南半球；美国（41）、德国（17）、加拿大（16）和英国（13）贡献最多。",
        "气象把两种机制区分开来。可定位的光柱拍摄时的中位条件为 −19.4 °C、湿度 87%、微风（12 公里/小时）、几乎没有高云、太阳位于地平线下 40°：这些是城镇上空的夜景。日柱出现在日出或日落前后（太阳高度中位数 −9.7°），气温约 4.5 °C。晕和幻日出现在较温和的空气中（中位数 10.0 °C 和 11.7 °C），高云较多（46% 和 60%），太阳远高于地平线（34° 和 8°）。",
      ] },
      { h: "讨论", p: [
        "这种对比与两类现象的物理机制一致。柱类现象需要扁平冰晶在寒冷静止的空气中降到接近地面，像一片小镜子阵列；晕和弧则形成于观察者上方很高的卷云中，与地面的寒冷无关。目录偏向北半球和高纬度，既反映了气候，也反映了谁在拍摄和上传。",
      ] },
      { h: "局限", p: [
        "照片定位后样本量变小，而且大多数照片有日期但没有地点。我们假设相机时钟显示的是当地时间，因此太阳高度的准确性取决于时钟。ERA5 是粗网格再分析，看不到形成光柱的那层薄冰晶。",
      ] },
      { h: "结论", p: [
        "一个经过仔细筛选并结合再分析气象的公开照片档案，可以重现预期的物理对比：光柱属于极冷而平静的夜晚，晕和幻日属于白天的高云。",
      ] },
    ],
    figure: "可定位的光柱和冰晕照片的世界地图，旁边是光柱的模拟视图。",
  },
};
