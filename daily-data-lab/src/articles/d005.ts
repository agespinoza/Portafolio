import type { ArticleSet } from "./types";

// Figures from src/days/day-005-endangered-languages/snapshot.json and data/day-005-endangered-languages/summary.json,
// recomputed in the Day 005 Excel workbook (Analysis A–F).
export const D005: ArticleSet = {
  en: {
    title: "Which languages are endangered and barely documented? Endangerment and description of 7,685 languages in Glottolog",
    abstract: "Combining Glottolog's Agglomerated Endangerment Status and Most Extensive Description for all 7,685 spoken first languages, I find that 4,082 of the 6,702 living languages (61%) are endangered and 972 are extinct. A priority group of 881 languages are shifting or worse and have no grammar sketch or better. More than half of them (481) are in Papunesia, led by Papua New Guinea (220) and Indonesia (181). Only 1.2% of priority languages are coded in Grambank, against about a third of other languages. No feature value in Grambank is carried only by endangered languages, but 385 of 398 are carried mostly by endangered or extinct ones, close to their 64% base rate.",
    keywords: ["language endangerment", "language documentation", "Glottolog", "Grambank", "linguistic diversity"],
    sections: [
      { h: "Introduction", p: [
        "Linguists have warned for decades that a large share of the world's languages may stop being spoken this century. Endangerment matters most where a language is also poorly described: when the last speakers are gone, a grammar, texts and recordings are what remain. This study asks which languages are both endangered and barely documented, and where they are.",
      ] },
      { h: "Data and methods", p: [
        "I use the Glottolog 5.4 CLDF release: 7,685 spoken first languages with their family, macroarea, location and countries, the Agglomerated Endangerment Status (AES; not endangered, threatened, shifting, moribund, nearly extinct, extinct) and the Most Extensive Description (MED; long grammar, grammar, grammar sketch, phonology or texts, wordlist or less). Grambank 1.0.3 and WALS 2020.6 provide coverage by grammar databases. AES counts are checked against Glottolog's GlottoScope page and match exactly; MED counts differ from that page, so the citable CLDF values are used.",
        "Endangered means AES 2–5, living AES 1–5. The priority group is AES 3–5 (shifting or worse) with MED 3 or 4, or no description linked. Shares carry 95% Wilson intervals, and a language spoken in several countries counts once in each.",
      ] },
      { h: "Results", p: [
        "Of 6,702 living languages, 4,082 are endangered (61%), and 972 languages are extinct. The share of living languages that are endangered rises from 39% in Africa to 65–66% in Eurasia and Papunesia, 87% in North America, 93% in South America and 99% in Australia. The priority group holds 881 languages; 481 of them are in Papunesia, where Papua New Guinea (220) and Indonesia (181) lead, followed by Africa (203).",
        "Documentation does not follow need. The best description of endangered languages dates from a median year of 1999, similar to languages that are not endangered (1994). Grambank covers 33% of endangered languages and 33% of safe ones, but only 1.2% of the priority group. Of 398 Grambank feature values with at least 30 carrier languages, none is carried only by endangered languages, and 385 are carried mostly by endangered or extinct ones, close to the 64% base rate in Grambank.",
      ] },
      { h: "Discussion", p: [
        "Endangerment is highest where colonisation and language shift came earliest, in the Americas and Australia, but the largest number of languages that are endangered and undescribed is in New Guinea and nearby islands, where diversity is greatest. Because comparative databases cover almost none of the priority languages, global studies of grammar risk missing the languages most likely to be lost. That no feature value is unique to endangered languages does not mean nothing is lost: the features are coarse, and a language is more than its typology.",
      ] },
      { h: "Limitations", p: [
        "AES and MED summarise many sources at different dates; a description may exist without being linked in Glottolog. Countries are attributed by Glottolog, and a language spoken in several countries is counted in each. Sign languages are excluded.",
      ] },
      { h: "Conclusion", p: [
        "Six in ten living languages are endangered, and 881 combine endangerment with little description, most of them in Papunesia; these are the languages for which documentation is most urgent.",
      ] },
    ],
    figure: "World map of 7,685 languages coloured by endangerment, next to the grid of endangerment status against documentation level.",
  },
  es: {
    title: "¿Qué lenguas están en peligro y casi sin documentar? Peligro y descripción de 7,685 lenguas en Glottolog",
    abstract: "Al combinar el Estado de Peligro Agregado (AES) y la Descripción Más Extensa (MED) de Glottolog para las 7,685 lenguas maternas habladas, encuentro que 4,082 de las 6,702 lenguas vivas (61%) están en peligro y que 972 están extintas. Un grupo prioritario de 881 lenguas está en desplazamiento o peor y no tiene un esbozo gramatical ni algo mejor. Más de la mitad (481) está en Papunesia, encabezada por Papúa Nueva Guinea (220) e Indonesia (181). Solo el 1.2% de las lenguas prioritarias está codificado en Grambank, frente a cerca de un tercio de las demás. Ningún valor de rasgo de Grambank lo tienen solo lenguas en peligro, pero 385 de 398 los tienen sobre todo lenguas en peligro o extintas, cerca de su tasa base de 64%.",
    keywords: ["lenguas en peligro", "documentación lingüística", "Glottolog", "Grambank", "diversidad lingüística"],
    sections: [
      { h: "Introducción", p: [
        "Desde hace décadas los lingüistas advierten que una gran parte de las lenguas del mundo podría dejar de hablarse este siglo. El peligro importa más cuando una lengua además está mal descrita: cuando se van los últimos hablantes, lo que queda es una gramática, textos y grabaciones. Este estudio pregunta qué lenguas están en peligro y casi sin documentar, y dónde están.",
      ] },
      { h: "Datos y métodos", p: [
        "Uso la versión CLDF de Glottolog 5.4: 7,685 lenguas maternas habladas con su familia, macroárea, ubicación y países, el Estado de Peligro Agregado (AES: no en peligro, amenazada, en desplazamiento, moribunda, casi extinta, extinta) y la Descripción Más Extensa (MED: gramática larga, gramática, esbozo gramatical, fonología o textos, lista de palabras o menos). Grambank 1.0.3 y WALS 2020.6 aportan la cobertura en bases de datos gramaticales. Los conteos de AES se comparan con la página GlottoScope de Glottolog y coinciden exactamente; los de MED difieren de esa página, así que se usan los valores citables de la versión CLDF.",
        "En peligro significa AES 2–5, y viva AES 1–5. El grupo prioritario son las lenguas con AES 3–5 (en desplazamiento o peor) y MED 3 o 4, o sin descripción enlazada. Las proporciones llevan intervalos de Wilson de 95%, y una lengua hablada en varios países cuenta una vez en cada uno.",
      ] },
      { h: "Resultados", p: [
        "De 6,702 lenguas vivas, 4,082 están en peligro (61%), y 972 lenguas están extintas. La proporción de lenguas vivas en peligro sube de 39% en África a 65–66% en Eurasia y Papunesia, 87% en Norteamérica, 93% en Sudamérica y 99% en Australia. El grupo prioritario reúne 881 lenguas; 481 están en Papunesia, donde destacan Papúa Nueva Guinea (220) e Indonesia (181), seguida de África (203).",
        "La documentación no sigue a la necesidad. La mejor descripción de las lenguas en peligro tiene un año mediano de 1999, parecido al de las lenguas que no están en peligro (1994). Grambank cubre el 33% de las lenguas en peligro y el 33% de las seguras, pero solo el 1.2% del grupo prioritario. De 398 valores de rasgos de Grambank con al menos 30 lenguas portadoras, ninguno lo tienen solo lenguas en peligro, y 385 los tienen sobre todo lenguas en peligro o extintas, cerca de la tasa base de 64% en Grambank.",
      ] },
      { h: "Discusión", p: [
        "El peligro es mayor donde la colonización y el desplazamiento lingüístico llegaron antes, en América y Australia, pero el mayor número de lenguas en peligro y sin describir está en Nueva Guinea y sus islas cercanas, donde la diversidad es mayor. Como las bases comparativas casi no cubren las lenguas prioritarias, los estudios globales de gramática corren el riesgo de dejar fuera justo las lenguas con más probabilidad de perderse. Que ningún valor de rasgo sea exclusivo de las lenguas en peligro no significa que no se pierda nada: los rasgos son gruesos, y una lengua es más que su tipología.",
      ] },
      { h: "Limitaciones", p: [
        "AES y MED resumen muchas fuentes de fechas distintas; puede existir una descripción que no esté enlazada en Glottolog. Los países los asigna Glottolog, y una lengua hablada en varios países se cuenta en cada uno. Las lenguas de señas están excluidas.",
      ] },
      { h: "Conclusión", p: [
        "Seis de cada diez lenguas vivas están en peligro, y 881 combinan el peligro con poca descripción, la mayoría en Papunesia; son las lenguas cuya documentación es más urgente.",
      ] },
    ],
    figure: "Mapa mundial de 7,685 lenguas coloreadas por nivel de peligro, junto a la cuadrícula de estado de peligro contra nivel de documentación.",
  },
  pt: {
    title: "Quais línguas estão ameaçadas e quase sem documentação? Ameaça e descrição de 7.685 línguas no Glottolog",
    abstract: "Combinando o Status de Ameaça Agregado (AES) e a Descrição Mais Extensa (MED) do Glottolog para as 7.685 línguas maternas faladas, encontro que 4.082 das 6.702 línguas vivas (61%) estão ameaçadas e que 972 estão extintas. Um grupo prioritário de 881 línguas está em deslocamento ou pior e não tem um esboço gramatical ou algo melhor. Mais da metade (481) está na Papuásia, liderada por Papua-Nova Guiné (220) e Indonésia (181). Só 1,2% das línguas prioritárias está codificado no Grambank, contra cerca de um terço das demais. Nenhum valor de traço do Grambank é exclusivo de línguas ameaçadas, mas 385 de 398 aparecem sobretudo em línguas ameaçadas ou extintas, perto da taxa base de 64%.",
    keywords: ["línguas ameaçadas", "documentação linguística", "Glottolog", "Grambank", "diversidade linguística"],
    sections: [
      { h: "Introdução", p: [
        "Há décadas os linguistas alertam que uma grande parte das línguas do mundo pode deixar de ser falada neste século. A ameaça pesa mais quando a língua também é mal descrita: quando os últimos falantes se vão, o que fica é uma gramática, textos e gravações. Este estudo pergunta quais línguas estão ameaçadas e quase sem documentação, e onde estão.",
      ] },
      { h: "Dados e métodos", p: [
        "Uso a versão CLDF do Glottolog 5.4: 7.685 línguas maternas faladas com família, macroárea, localização e países, o Status de Ameaça Agregado (AES: não ameaçada, ameaçada, em deslocamento, moribunda, quase extinta, extinta) e a Descrição Mais Extensa (MED: gramática longa, gramática, esboço gramatical, fonologia ou textos, lista de palavras ou menos). Grambank 1.0.3 e WALS 2020.6 dão a cobertura em bases gramaticais. As contagens de AES são conferidas com a página GlottoScope do Glottolog e coincidem exatamente; as de MED diferem dessa página, então uso os valores citáveis da versão CLDF.",
        "Ameaçada significa AES 2–5, e viva AES 1–5. O grupo prioritário são as línguas com AES 3–5 (em deslocamento ou pior) e MED 3 ou 4, ou sem descrição vinculada. As proporções têm intervalos de Wilson de 95%, e uma língua falada em vários países conta uma vez em cada um.",
      ] },
      { h: "Resultados", p: [
        "Das 6.702 línguas vivas, 4.082 estão ameaçadas (61%), e 972 línguas estão extintas. A proporção de línguas vivas ameaçadas sobe de 39% na África para 65–66% na Eurásia e na Papuásia, 87% na América do Norte, 93% na América do Sul e 99% na Austrália. O grupo prioritário reúne 881 línguas; 481 estão na Papuásia, com destaque para Papua-Nova Guiné (220) e Indonésia (181), seguida da África (203).",
        "A documentação não acompanha a necessidade. A melhor descrição das línguas ameaçadas tem ano mediano de 1999, parecido com o das línguas não ameaçadas (1994). O Grambank cobre 33% das línguas ameaçadas e 33% das seguras, mas só 1,2% do grupo prioritário. Dos 398 valores de traços do Grambank com pelo menos 30 línguas portadoras, nenhum é exclusivo de línguas ameaçadas, e 385 aparecem sobretudo em línguas ameaçadas ou extintas, perto da taxa base de 64% no Grambank.",
      ] },
      { h: "Discussão", p: [
        "A ameaça é maior onde a colonização e o deslocamento linguístico chegaram antes, nas Américas e na Austrália, mas o maior número de línguas ameaçadas e sem descrição está na Nova Guiné e ilhas próximas, onde a diversidade é maior. Como as bases comparativas quase não cobrem as línguas prioritárias, estudos globais de gramática correm o risco de deixar de fora justamente as línguas mais propensas a desaparecer. Que nenhum valor de traço seja exclusivo das línguas ameaçadas não quer dizer que nada se perca: os traços são grosseiros, e uma língua é mais do que sua tipologia.",
      ] },
      { h: "Limitações", p: [
        "AES e MED resumem muitas fontes de datas diferentes; pode haver uma descrição não vinculada no Glottolog. Os países são atribuídos pelo Glottolog, e uma língua falada em vários países é contada em cada um. Línguas de sinais estão excluídas.",
      ] },
      { h: "Conclusão", p: [
        "Seis em cada dez línguas vivas estão ameaçadas, e 881 combinam ameaça e pouca descrição, a maioria na Papuásia; são as línguas cuja documentação é mais urgente.",
      ] },
    ],
    figure: "Mapa-múndi de 7.685 línguas coloridas pelo nível de ameaça, ao lado da grade de status de ameaça contra nível de documentação.",
  },
  fr: {
    title: "Quelles langues sont menacées et à peine documentées ? Menace et description de 7 685 langues dans Glottolog",
    abstract: "En croisant le statut de menace agrégé (AES) et la description la plus complète (MED) de Glottolog pour les 7 685 langues maternelles parlées, je constate que 4 082 des 6 702 langues vivantes (61 %) sont menacées et que 972 sont éteintes. Un groupe prioritaire de 881 langues est en recul ou pire et ne dispose d’aucune esquisse grammaticale ni mieux. Plus de la moitié (481) se trouve en Papounésie, en tête la Papouasie-Nouvelle-Guinée (220) et l’Indonésie (181). Seules 1,2 % des langues prioritaires sont codées dans Grambank, contre environ un tiers des autres. Aucune valeur de trait de Grambank n’est portée uniquement par des langues menacées, mais 385 sur 398 le sont surtout par des langues menacées ou éteintes, proche de leur taux de base de 64 %.",
    keywords: ["langues menacées", "documentation linguistique", "Glottolog", "Grambank", "diversité linguistique"],
    sections: [
      { h: "Introduction", p: [
        "Depuis des décennies, les linguistes avertissent qu’une grande partie des langues du monde pourrait cesser d’être parlée au cours de ce siècle. La menace pèse davantage quand une langue est aussi mal décrite : une fois les derniers locuteurs disparus, il reste une grammaire, des textes et des enregistrements. Cette étude se demande quelles langues sont à la fois menacées et à peine documentées, et où elles se trouvent.",
      ] },
      { h: "Données et méthodes", p: [
        "J’utilise la version CLDF de Glottolog 5.4 : 7 685 langues maternelles parlées, avec leur famille, leur macro-aire, leur localisation et leurs pays, le statut de menace agrégé (AES : non menacée, menacée, en recul, moribonde, presque éteinte, éteinte) et la description la plus complète (MED : grammaire longue, grammaire, esquisse grammaticale, phonologie ou textes, liste de mots ou moins). Grambank 1.0.3 et WALS 2020.6 fournissent la couverture des bases grammaticales. Les effectifs AES sont vérifiés sur la page GlottoScope de Glottolog et concordent exactement ; ceux de MED en diffèrent, d’où l’usage des valeurs citables de la version CLDF.",
        "Menacée signifie AES 2 à 5, vivante AES 1 à 5. Le groupe prioritaire réunit les langues AES 3 à 5 (en recul ou pire) avec MED 3 ou 4, ou sans description liée. Les parts portent des intervalles de Wilson à 95 %, et une langue parlée dans plusieurs pays compte une fois dans chacun.",
      ] },
      { h: "Résultats", p: [
        "Sur 6 702 langues vivantes, 4 082 sont menacées (61 %), et 972 langues sont éteintes. La part des langues vivantes menacées passe de 39 % en Afrique à 65–66 % en Eurasie et en Papounésie, 87 % en Amérique du Nord, 93 % en Amérique du Sud et 99 % en Australie. Le groupe prioritaire compte 881 langues ; 481 se trouvent en Papounésie, où dominent la Papouasie-Nouvelle-Guinée (220) et l’Indonésie (181), suivie de l’Afrique (203).",
        "La documentation ne suit pas le besoin. La meilleure description des langues menacées date d’une année médiane de 1999, proche de celle des langues non menacées (1994). Grambank couvre 33 % des langues menacées et 33 % des langues sûres, mais seulement 1,2 % du groupe prioritaire. Sur 398 valeurs de traits de Grambank portées par au moins 30 langues, aucune n’est portée uniquement par des langues menacées, et 385 le sont surtout par des langues menacées ou éteintes, proche du taux de base de 64 % dans Grambank.",
      ] },
      { h: "Discussion", p: [
        "La menace est la plus forte là où la colonisation et le changement de langue sont arrivés le plus tôt, aux Amériques et en Australie, mais le plus grand nombre de langues menacées et non décrites se trouve en Nouvelle-Guinée et dans les îles voisines, là où la diversité est la plus grande. Comme les bases comparatives ne couvrent presque aucune langue prioritaire, les études mondiales de grammaire risquent de manquer précisément les langues les plus susceptibles de disparaître. Qu’aucune valeur de trait ne soit propre aux langues menacées ne signifie pas que rien ne se perd : les traits sont grossiers, et une langue est plus que sa typologie.",
      ] },
      { h: "Limites", p: [
        "AES et MED résument de nombreuses sources de dates différentes ; une description peut exister sans être liée dans Glottolog. Les pays sont attribués par Glottolog, et une langue parlée dans plusieurs pays est comptée dans chacun. Les langues des signes sont exclues.",
      ] },
      { h: "Conclusion", p: [
        "Six langues vivantes sur dix sont menacées, et 881 cumulent menace et faible description, surtout en Papounésie : ce sont les langues dont la documentation est la plus urgente.",
      ] },
    ],
    figure: "Carte du monde de 7 685 langues colorées selon leur niveau de menace, à côté de la grille statut de menace × niveau de documentation.",
  },
  it: {
    title: "Quali lingue sono in pericolo e quasi senza documentazione? Pericolo e descrizione di 7.685 lingue in Glottolog",
    abstract: "Combinando lo Stato di Pericolo Aggregato (AES) e la Descrizione Più Estesa (MED) di Glottolog per tutte le 7.685 lingue madri parlate, trovo che 4.082 delle 6.702 lingue vive (61%) sono in pericolo e 972 sono estinte. Un gruppo prioritario di 881 lingue è in regressione o peggio e non ha un abbozzo grammaticale o di meglio. Più della metà (481) si trova in Papunesia, guidata da Papua Nuova Guinea (220) e Indonesia (181). Solo l’1,2% delle lingue prioritarie è codificato in Grambank, contro circa un terzo delle altre. Nessun valore di tratto di Grambank è portato solo da lingue in pericolo, ma 385 su 398 sono portati soprattutto da lingue in pericolo o estinte, vicino al loro tasso di base del 64%.",
    keywords: ["lingue in pericolo", "documentazione linguistica", "Glottolog", "Grambank", "diversità linguistica"],
    sections: [
      { h: "Introduzione", p: [
        "Da decenni i linguisti avvertono che gran parte delle lingue del mondo potrebbe smettere di essere parlata in questo secolo. Il pericolo pesa di più quando una lingua è anche poco descritta: quando gli ultimi parlanti scompaiono, restano una grammatica, testi e registrazioni. Lo studio si chiede quali lingue siano in pericolo e quasi senza documentazione, e dove si trovino.",
      ] },
      { h: "Dati e metodi", p: [
        "Uso la versione CLDF di Glottolog 5.4: 7.685 lingue madri parlate con famiglia, macroarea, posizione e paesi, lo Stato di Pericolo Aggregato (AES: non in pericolo, minacciata, in regressione, moribonda, quasi estinta, estinta) e la Descrizione Più Estesa (MED: grammatica estesa, grammatica, abbozzo grammaticale, fonologia o testi, lista di parole o meno). Grambank 1.0.3 e WALS 2020.6 forniscono la copertura nelle banche dati grammaticali. I conteggi AES sono verificati sulla pagina GlottoScope di Glottolog e coincidono esattamente; quelli MED differiscono da quella pagina, quindi uso i valori citabili della versione CLDF.",
        "In pericolo significa AES 2–5, viva AES 1–5. Il gruppo prioritario comprende le lingue AES 3–5 (in regressione o peggio) con MED 3 o 4, o senza descrizione collegata. Le quote hanno intervalli di Wilson al 95%, e una lingua parlata in più paesi conta una volta in ciascuno.",
      ] },
      { h: "Risultati", p: [
        "Delle 6.702 lingue vive, 4.082 sono in pericolo (61%), e 972 lingue sono estinte. La quota di lingue vive in pericolo sale dal 39% in Africa al 65–66% in Eurasia e Papunesia, all’87% in Nord America, al 93% in Sud America e al 99% in Australia. Il gruppo prioritario conta 881 lingue; 481 sono in Papunesia, con in testa Papua Nuova Guinea (220) e Indonesia (181), seguita dall’Africa (203).",
        "La documentazione non segue il bisogno. La migliore descrizione delle lingue in pericolo ha un anno mediano di 1999, simile a quello delle lingue non in pericolo (1994). Grambank copre il 33% delle lingue in pericolo e il 33% di quelle sicure, ma solo l’1,2% del gruppo prioritario. Dei 398 valori di tratti di Grambank con almeno 30 lingue portatrici, nessuno è portato solo da lingue in pericolo, e 385 lo sono soprattutto da lingue in pericolo o estinte, vicino al tasso di base del 64% in Grambank.",
      ] },
      { h: "Discussione", p: [
        "Il pericolo è massimo dove la colonizzazione e la sostituzione linguistica sono arrivate prima, nelle Americhe e in Australia, ma il numero più alto di lingue in pericolo e non descritte si trova in Nuova Guinea e nelle isole vicine, dove la diversità è maggiore. Poiché le banche dati comparative non coprono quasi nessuna lingua prioritaria, gli studi globali sulla grammatica rischiano di perdere proprio le lingue che più probabilmente scompariranno. Che nessun valore di tratto sia esclusivo delle lingue in pericolo non significa che non si perda nulla: i tratti sono grossolani, e una lingua è più della sua tipologia.",
      ] },
      { h: "Limiti", p: [
        "AES e MED riassumono molte fonti di date diverse; può esistere una descrizione non collegata in Glottolog. I paesi sono attribuiti da Glottolog, e una lingua parlata in più paesi è contata in ciascuno. Le lingue dei segni sono escluse.",
      ] },
      { h: "Conclusione", p: [
        "Sei lingue vive su dieci sono in pericolo, e 881 uniscono il pericolo a una scarsa descrizione, per lo più in Papunesia: sono le lingue la cui documentazione è più urgente.",
      ] },
    ],
    figure: "Mappa del mondo di 7.685 lingue colorate per livello di pericolo, accanto alla griglia stato di pericolo × livello di documentazione.",
  },
  ja: {
    title: "危機にあり、ほとんど記録されていない言語はどれか：Glottologの7,685言語における危機度と記述",
    abstract: "Glottologの「統合危機度（AES）」と「最も詳しい記述（MED）」を、話されている第一言語7,685すべてについて組み合わせた。存命言語6,702のうち4,082（61%）が危機にあり、972言語は消滅している。「移行中」以上の危機にあり、文法概説かそれ以上の記述を持たない優先言語は881ある。その半数以上（481）がパプネシアにあり、パプアニューギニア（220）とインドネシア（181）が多い。Grambankでコード化されている優先言語はわずか1.2%で、その他の言語の約3分の1と対照的である。危機言語だけが持つGrambankの特徴値は1つもないが、398のうち385は主に危機言語か消滅言語が持っており、その基準率64%に近い。",
    keywords: ["危機言語", "言語記録", "Glottolog", "Grambank", "言語の多様性"],
    sections: [
      { h: "はじめに", p: [
        "言語学者は数十年前から、世界の言語の大きな割合が今世紀中に話されなくなる可能性を警告してきた。危機が最も深刻なのは、その言語の記述も乏しい場合である。最後の話者がいなくなったとき、残るのは文法書、テキスト、録音だけだからだ。本研究は、危機にありかつほとんど記録されていない言語はどれで、どこにあるのかを問う。",
      ] },
      { h: "データと方法", p: [
        "Glottolog 5.4のCLDF版を用いた。話されている第一言語7,685について、語族、マクロエリア、位置、国、統合危機度（AES：危機なし、脅かされている、移行中、瀕死、ほぼ消滅、消滅）、最も詳しい記述（MED：詳しい文法書、文法書、文法概説、音韻論またはテキスト、語彙リスト以下）が入っている。文法データベースでのカバー率はGrambank 1.0.3とWALS 2020.6から得た。AESの件数はGlottologのGlottoScopeページと完全に一致した。MEDの件数はそのページと異なるため、引用可能なCLDF版の値を使う。",
        "危機はAES 2〜5、存命はAES 1〜5を指す。優先言語は、AES 3〜5（移行中以上）でMEDが3か4、または記述が紐づいていない言語である。割合には95% Wilson区間を付け、複数の国で話される言語はそれぞれの国で1回数える。",
      ] },
      { h: "結果", p: [
        "存命言語6,702のうち4,082（61%）が危機にあり、972言語が消滅している。存命言語に占める危機言語の割合は、アフリカの39%から、ユーラシアとパプネシアの65〜66%、北米の87%、南米の93%、オーストラリアの99%へと上がる。優先言語は881あり、うち481がパプネシアで、パプアニューギニア（220）とインドネシア（181）が多く、次いでアフリカ（203）が続く。",
        "記録は必要性に沿っていない。危機言語の最も詳しい記述の年の中央値は1999年で、危機にない言語（1994年）とほぼ同じである。Grambankは危機言語の33%、安全な言語の33%をカバーするが、優先言語は1.2%にとどまる。30言語以上が持つGrambankの特徴値398のうち、危機言語だけが持つものはなく、385は主に危機言語か消滅言語が持っている。これはGrambankにおける基準率64%に近い。",
      ] },
      { h: "考察", p: [
        "危機度は植民地化と言語の切り替えが早く進んだアメリカ大陸とオーストラリアで最も高い。しかし、危機にあり未記述の言語の数が最も多いのは、多様性が最も大きいニューギニアと周辺の島々である。比較データベースが優先言語をほとんどカバーしていないため、世界規模の文法研究は失われる可能性が最も高い言語を見落とすおそれがある。危機言語に固有の特徴値がないことは、何も失われないという意味ではない。特徴は粗く、言語は類型論以上のものだからだ。",
      ] },
      { h: "限界", p: [
        "AESとMEDは時期の異なる多くの資料を要約したもので、記述が存在してもGlottologに紐づいていない場合がある。国はGlottologによる割り当てで、複数の国で話される言語はそれぞれで数えている。手話言語は除外した。",
      ] },
      { h: "結論", p: [
        "存命言語の10に6が危機にあり、そのうち881は危機と記述の乏しさが重なっている。多くはパプネシアにあり、記録が最も急がれる言語である。",
      ] },
    ],
    figure: "危機度で色分けした7,685言語の世界地図と、危機度と記述レベルの対応表。",
  },
  zh: {
    title: "哪些语言濒危且几乎没有记录？Glottolog 中 7,685 种语言的濒危程度与描述",
    abstract: "我把 Glottolog 的综合濒危状态（AES）和最详尽描述（MED）结合起来，覆盖全部 7,685 种口语母语，发现 6,702 种现存语言中有 4,082 种（61%）濒危，另有 972 种已经消亡。一个优先组包含 881 种语言：它们处于转移阶段或更糟，且连语法概要都没有。其中一半以上（481 种）位于巴布亚区，以巴布亚新几内亚（220）和印度尼西亚（181）为首。优先语言中只有 1.2% 被 Grambank 编码，而其他语言约为三分之一。Grambank 中没有任何特征值只出现在濒危语言中，但 398 个中有 385 个主要出现在濒危或已消亡的语言中，接近其 64% 的基准比例。",
    keywords: ["濒危语言", "语言记录", "Glottolog", "Grambank", "语言多样性"],
    sections: [
      { h: "引言", p: [
        "几十年来，语言学家一直警告，世界上很大一部分语言可能会在本世纪停止使用。当一种语言同时缺乏描述时，濒危的后果最严重：最后的使用者离去后，留下的只有语法、文本和录音。本研究要问：哪些语言既濒危又几乎没有记录，它们在哪里？",
      ] },
      { h: "数据与方法", p: [
        "我使用 Glottolog 5.4 的 CLDF 版本：7,685 种口语母语，包含语系、宏观区域、位置和国家、综合濒危状态（AES：未濒危、受威胁、转移中、垂危、几近消亡、已消亡）以及最详尽描述（MED：详尽语法、语法、语法概要、音系或文本、词表或更少）。Grambank 1.0.3 和 WALS 2020.6 提供语法数据库的覆盖情况。AES 计数与 Glottolog 的 GlottoScope 页面完全一致；MED 计数与该页面不同，因此采用可引用的 CLDF 数值。",
        "濒危指 AES 2–5，现存指 AES 1–5。优先组为 AES 3–5（转移中或更糟）且 MED 为 3 或 4、或没有关联描述的语言。比例附 95% Wilson 区间，在多个国家使用的语言在每个国家各计一次。",
      ] },
      { h: "结果", p: [
        "6,702 种现存语言中有 4,082 种濒危（61%），另有 972 种语言已消亡。现存语言中的濒危比例从非洲的 39% 上升到欧亚和巴布亚区的 65–66%、北美的 87%、南美的 93% 和澳大利亚的 99%。优先组共 881 种语言，其中 481 种在巴布亚区，以巴布亚新几内亚（220）和印度尼西亚（181）为主，其次是非洲（203）。",
        "记录工作并没有跟随需求。濒危语言最详尽描述的年份中位数为 1999 年，与未濒危语言（1994 年）相近。Grambank 覆盖了 33% 的濒危语言和 33% 的安全语言，但只覆盖了优先组的 1.2%。在至少有 30 种语言具有的 398 个 Grambank 特征值中，没有一个只出现在濒危语言中，385 个主要出现在濒危或已消亡的语言中，接近 Grambank 中 64% 的基准比例。",
      ] },
      { h: "讨论", p: [
        "在殖民和语言转移最早发生的美洲和澳大利亚，濒危程度最高；但濒危且未被描述的语言数量最多的地方是新几内亚及其附近岛屿，那里的语言多样性最高。由于比较数据库几乎不覆盖优先语言，全球语法研究可能恰恰遗漏了最可能消失的语言。没有特征值是濒危语言独有的，并不意味着没有损失：这些特征很粗略，而一种语言远不止其类型学特征。",
      ] },
      { h: "局限", p: [
        "AES 和 MED 汇总了许多不同年代的来源；某种描述可能存在但未在 Glottolog 中关联。国家由 Glottolog 指定，在多个国家使用的语言在每个国家都计入。手语不在统计范围内。",
      ] },
      { h: "结论", p: [
        "每十种现存语言中有六种濒危，其中 881 种既濒危又缺乏描述，大多位于巴布亚区；这些是最急需记录的语言。",
      ] },
    ],
    figure: "按濒危程度着色的 7,685 种语言的世界地图，旁边是濒危状态与记录程度的交叉网格。",
  },
};
