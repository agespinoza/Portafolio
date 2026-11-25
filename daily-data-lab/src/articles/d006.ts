import type { ArticleSet } from "./types";

// Figures from data/day-006-food-waste/day-006.json, recomputed in the Day 006 Excel workbook (Analysis A–F).
export const D006: ArticleSet = {
  en: {
    title: "Where is the world's food wasted, and by whom? Household, food-service and retail waste in 228 countries",
    abstract: "UNEP's Food Waste Index Report 2024 estimates that 1,052 million tonnes of food were wasted in 2022, 19% of the food available to consumers. Households wasted 631 Mt (79 kg per person, 60% of the total), food service 290 Mt and retail 131 Mt. Joining UNEP's estimates for all 228 countries with FAOSTAT undernourishment, World Bank income groups and CRU temperature, I find that household waste per person barely changes with income (72 kg in high-income countries, 81 kg in lower-middle-income ones). It correlates weakly with temperature (r = 0.25 across 226 countries), and the correlation shrinks to r = 0.20, with an interval that includes zero, among the 66 countries whose estimates are measured rather than extrapolated. Mexico wastes 105 kg per person at home, against 73 kg in the United States.",
    keywords: ["food waste", "SDG 12.3", "UNEP Food Waste Index", "households", "food loss", "Mexico", "United States"],
    sections: [
      { h: "Introduction", p: [
        "Sustainable Development Goal 12.3 asks countries to halve food waste per person at the retail and consumer levels by 2030. UNEP's Food Waste Index Report 2024 gives the second global estimate of that waste. This study asks where food is wasted, which sector wastes it, and whether waste follows income, climate or hunger, while keeping track of how much of each estimate is measured.",
      ] },
      { h: "Data and methods", p: [
        "Household waste per person comes from Annex 3 of the UNEP report for all 228 countries and territories, with UNEP's confidence rating; food-service and retail waste come from the UN SDG Global Database (series AG_FOOD_WST and AG_FOOD_WST_PC), with Eurostat 2020 values for 27 European countries, as UNEP used. I add FAOSTAT's 2021–2023 prevalence of undernourishment, the World Bank's region, income group and 2022 population, and the CRU TS 4.08 mean annual temperature for 1991–2020. The pipeline runs in DuckDB and stops if the world totals differ from UNEP's published figures; the 228 countries sum to 1,051.5 Mt, 0.04% below the world total.",
        "“Measured” means UNEP rated the household estimate high or medium confidence: 66 of 228 countries. Low and very-low estimates are extrapolated from countries in the same region and income group. Correlations are Pearson's r with Fisher-z 95% intervals, for all countries and for measured ones only.",
      ] },
      { h: "Results", p: [
        "Households account for 60% of the world total, 631 Mt or 79 kg per person a year; food service wastes 290 Mt and retail 131 Mt. Taking UNEP's conservative assumptions (a quarter of household waste is edible and a meal weighs 420 g), the edible part of household waste alone is about 1.03 billion meals a day, while 687 million people are undernourished. Before food reaches shops, FAO estimates that a further 13.3% is lost (2023), a share that has barely moved since 2015 (13.0%).",
        "Household waste per person is similar across income groups: 72 kg in high-income countries, 78 kg in upper-middle, 81 kg in lower-middle and 92 kg in low-income countries, the last resting on very few measured countries. By region it ranges from 59 kg in South Asia to 127 kg in the Middle East, North Africa, Afghanistan and Pakistan. Temperature correlates weakly with household waste across 226 countries (r = 0.25; 95% interval 0.12–0.37) and less among the 66 measured countries (r = 0.20; −0.04 to 0.42). Undernourishment shows r = 0.16 (0.00–0.30) and r = 0.10 among measured countries. Mexico wastes 105 kg per person at home (25th of 228), the United States 73 kg (183rd); Mexican retail wastes 3.9 times as much per person as American retail (45.5 vs 11.8 kg), while American food service wastes more (73.7 vs 64.5 kg).",
      ] },
      { h: "Discussion", p: [
        "Food waste is not mainly a rich-country problem: homes in lower-middle-income countries waste as much per person as homes in rich ones. The apparent link with heat weakens when only measured estimates are used, because extrapolated values copy their neighbours and so reinforce regional patterns. Hotter climates may still raise waste, for example through faster spoilage or more inedible parts in home cooking, but these remain hypotheses that the cross-country data cannot test.",
      ] },
      { h: "Limitations", p: [
        "Only 29% of countries have a measured household estimate; most figures are model-based. Food waste includes inedible parts such as bones and peels. Country studies date from different years and are scaled to 2022. World Bank and UN population figures differ slightly, and correlations across countries say nothing about causes.",
      ] },
      { h: "Conclusion", p: [
        "Most food waste happens at home, in countries of every income level. Better measurement, more than any single pattern in today's data, is what would let countries track their progress towards SDG 12.3.",
      ] },
    ],
    figure: "Household food waste per person in the countries that waste the most at home, with Mexico and the United States highlighted, next to food waste by sector.",
  },
  es: {
    title: "¿Dónde se desperdicia la comida del mundo y quién la desperdicia? Desperdicio en hogares, servicios de comida y comercio en 228 países",
    abstract: "El Informe del Índice de Desperdicio de Alimentos 2024 de UNEP estima que en 2022 se desperdiciaron 1,052 millones de toneladas de comida, el 19% de los alimentos disponibles para el consumo. Los hogares desperdiciaron 631 Mt (79 kg por persona, el 60% del total), los servicios de comida 290 Mt y el comercio 131 Mt. Al unir las estimaciones de UNEP para los 228 países con la subalimentación de FAOSTAT, los grupos de ingreso del Banco Mundial y la temperatura de CRU, encuentro que el desperdicio en casa por persona casi no cambia con el ingreso (72 kg en países de ingreso alto, 81 kg en los de ingreso medio bajo). Se correlaciona débilmente con la temperatura (r = 0.25 en 226 países), y la correlación baja a r = 0.20, con un intervalo que incluye el cero, en los 66 países cuyas estimaciones son medidas y no extrapoladas. México desperdicia 105 kg por persona en casa, frente a 73 kg en Estados Unidos.",
    keywords: ["desperdicio de alimentos", "ODS 12.3", "Índice de Desperdicio de Alimentos de UNEP", "hogares", "pérdida de alimentos", "México", "Estados Unidos"],
    sections: [
      { h: "Introducción", p: [
        "El Objetivo de Desarrollo Sostenible 12.3 pide a los países reducir a la mitad el desperdicio de alimentos por persona en el comercio y el consumo para 2030. El Informe del Índice de Desperdicio de Alimentos 2024 de UNEP da la segunda estimación mundial de ese desperdicio. Este estudio pregunta dónde se desperdicia la comida, qué sector la desperdicia y si el desperdicio sigue al ingreso, al clima o al hambre, sin perder de vista qué parte de cada estimación es medida.",
      ] },
      { h: "Datos y métodos", p: [
        "El desperdicio en hogares por persona viene del Anexo 3 del informe de UNEP para los 228 países y territorios, con la calificación de confianza de UNEP; el de servicios de comida y comercio viene de la Base de Datos Mundial de los ODS de la ONU (series AG_FOOD_WST y AG_FOOD_WST_PC), con los valores de Eurostat 2020 para 27 países europeos, como hizo UNEP. Agrego la prevalencia de subalimentación 2021–2023 de FAOSTAT, la región, el grupo de ingreso y la población 2022 del Banco Mundial, y la temperatura media anual 1991–2020 de CRU TS 4.08. El pipeline corre en DuckDB y se detiene si los totales mundiales difieren de las cifras publicadas por UNEP; los 228 países suman 1,051.5 Mt, 0.04% menos que el total mundial.",
        "“Medido” significa que UNEP calificó la estimación de hogares con confianza alta o media: 66 de 228 países. Las estimaciones de confianza baja o muy baja se extrapolan de países de la misma región y grupo de ingreso. Las correlaciones son r de Pearson con intervalos de 95% por la transformación z de Fisher, para todos los países y solo para los medidos.",
      ] },
      { h: "Resultados", p: [
        "Los hogares representan el 60% del total mundial, 631 Mt o 79 kg por persona al año; los servicios de comida desperdician 290 Mt y el comercio 131 Mt. Con los supuestos conservadores de UNEP (una cuarta parte del desperdicio en casa es comestible y una comida pesa 420 g), solo la parte comestible del desperdicio en hogares equivale a unos 1,030 millones de comidas al día, mientras 687 millones de personas están subalimentadas. Antes de llegar a las tiendas, la FAO estima que se pierde otro 13.3% (2023), una proporción que casi no ha cambiado desde 2015 (13.0%).",
        "El desperdicio en casa por persona es parecido entre grupos de ingreso: 72 kg en países de ingreso alto, 78 kg en ingreso medio alto, 81 kg en ingreso medio bajo y 92 kg en ingreso bajo, este último apoyado en muy pocos países medidos. Por región va de 59 kg en Asia meridional a 127 kg en Medio Oriente, Norte de África, Afganistán y Pakistán. La temperatura se correlaciona débilmente con el desperdicio en casa en 226 países (r = 0.25; intervalo de 95%: 0.12–0.37) y menos en los 66 países medidos (r = 0.20; −0.04 a 0.42). La subalimentación muestra r = 0.16 (0.00–0.30) y r = 0.10 en los países medidos. México desperdicia 105 kg por persona en casa (lugar 25 de 228) y Estados Unidos 73 kg (lugar 183); el comercio mexicano desperdicia 3.9 veces más por persona que el estadounidense (45.5 contra 11.8 kg), mientras que los servicios de comida de Estados Unidos desperdician más (73.7 contra 64.5 kg).",
      ] },
      { h: "Discusión", p: [
        "El desperdicio de comida no es sobre todo un problema de países ricos: los hogares de países de ingreso medio bajo desperdician por persona tanto como los de países ricos. La aparente relación con el calor se debilita al usar solo estimaciones medidas, porque los valores extrapolados copian a sus vecinos y así refuerzan los patrones regionales. Un clima más cálido podría aumentar el desperdicio, por ejemplo porque la comida se echa a perder más rápido o porque cocinar en casa deja más partes no comestibles, pero son hipótesis que los datos entre países no pueden probar.",
      ] },
      { h: "Limitaciones", p: [
        "Solo el 29% de los países tiene una estimación de hogares medida; la mayoría de las cifras viene de modelos. El desperdicio incluye partes no comestibles como huesos y cáscaras. Los estudios nacionales son de años distintos y se escalan a 2022. Las poblaciones del Banco Mundial y de la ONU difieren un poco, y las correlaciones entre países no dicen nada de las causas.",
      ] },
      { h: "Conclusión", p: [
        "La mayor parte del desperdicio de comida ocurre en casa, en países de todos los niveles de ingreso. Medir mejor, más que cualquier patrón de los datos actuales, es lo que permitiría a los países seguir su avance hacia el ODS 12.3.",
      ] },
    ],
    figure: "Desperdicio de alimentos en casa por persona en los países que más desperdician, con México y Estados Unidos resaltados, junto al desperdicio por sector.",
  },
  pt: {
    title: "Onde se desperdiça a comida do mundo, e quem desperdiça? Desperdício em domicílios, serviços de alimentação e varejo em 228 países",
    abstract: "O Relatório do Índice de Desperdício de Alimentos 2024 do PNUMA estima que 1.052 milhões de toneladas de comida foram desperdiçadas em 2022, 19% dos alimentos disponíveis para consumo. Os domicílios desperdiçaram 631 Mt (79 kg por pessoa, 60% do total), os serviços de alimentação 290 Mt e o varejo 131 Mt. Juntando as estimativas do PNUMA para os 228 países com a subalimentação da FAOSTAT, os grupos de renda do Banco Mundial e a temperatura do CRU, encontro que o desperdício doméstico por pessoa quase não muda com a renda (72 kg nos países de renda alta, 81 kg nos de renda média baixa). Ele tem correlação fraca com a temperatura (r = 0,25 em 226 países), e a correlação cai para r = 0,20, com um intervalo que inclui o zero, nos 66 países cujas estimativas são medidas e não extrapoladas. O México desperdiça 105 kg por pessoa em casa, contra 73 kg nos Estados Unidos.",
    keywords: ["desperdício de alimentos", "ODS 12.3", "Índice de Desperdício de Alimentos do PNUMA", "domicílios", "perda de alimentos", "México", "Estados Unidos"],
    sections: [
      { h: "Introdução", p: [
        "O Objetivo de Desenvolvimento Sustentável 12.3 pede que os países reduzam pela metade o desperdício de alimentos por pessoa no varejo e no consumo até 2030. O Relatório do Índice de Desperdício de Alimentos 2024 do PNUMA traz a segunda estimativa mundial desse desperdício. Este estudo pergunta onde a comida é desperdiçada, qual setor a desperdiça e se o desperdício acompanha a renda, o clima ou a fome, sem perder de vista quanto de cada estimativa é medido.",
      ] },
      { h: "Dados e métodos", p: [
        "O desperdício doméstico por pessoa vem do Anexo 3 do relatório do PNUMA para os 228 países e territórios, com a classificação de confiança do PNUMA; o de serviços de alimentação e varejo vem da Base de Dados Global dos ODS da ONU (séries AG_FOOD_WST e AG_FOOD_WST_PC), com os valores do Eurostat 2020 para 27 países europeus, como fez o PNUMA. Acrescento a prevalência de subalimentação 2021–2023 da FAOSTAT, a região, o grupo de renda e a população de 2022 do Banco Mundial e a temperatura média anual 1991–2020 do CRU TS 4.08. O pipeline roda no DuckDB e para se os totais mundiais diferirem dos números publicados pelo PNUMA; os 228 países somam 1.051,5 Mt, 0,04% abaixo do total mundial.",
        "“Medido” significa que o PNUMA classificou a estimativa doméstica com confiança alta ou média: 66 de 228 países. As estimativas de confiança baixa ou muito baixa são extrapoladas de países da mesma região e grupo de renda. As correlações são r de Pearson com intervalos de 95% pela transformação z de Fisher, para todos os países e só para os medidos.",
      ] },
      { h: "Resultados", p: [
        "Os domicílios respondem por 60% do total mundial, 631 Mt ou 79 kg por pessoa por ano; os serviços de alimentação desperdiçam 290 Mt e o varejo 131 Mt. Com as premissas conservadoras do PNUMA (um quarto do desperdício doméstico é comestível e uma refeição pesa 420 g), só a parte comestível do desperdício doméstico equivale a cerca de 1,03 bilhão de refeições por dia, enquanto 687 milhões de pessoas estão subalimentadas. Antes de chegar às lojas, a FAO estima que mais 13,3% se perde (2023), uma fração que quase não mudou desde 2015 (13,0%).",
        "O desperdício doméstico por pessoa é parecido entre grupos de renda: 72 kg nos países de renda alta, 78 kg na renda média alta, 81 kg na renda média baixa e 92 kg na renda baixa, este apoiado em muito poucos países medidos. Por região vai de 59 kg no Sul da Ásia a 127 kg no Oriente Médio, Norte da África, Afeganistão e Paquistão. A temperatura tem correlação fraca com o desperdício doméstico em 226 países (r = 0,25; intervalo de 95%: 0,12–0,37) e menor nos 66 países medidos (r = 0,20; −0,04 a 0,42). A subalimentação mostra r = 0,16 (0,00–0,30) e r = 0,10 nos países medidos. O México desperdiça 105 kg por pessoa em casa (25º de 228) e os Estados Unidos 73 kg (183º); o varejo mexicano desperdiça 3,9 vezes mais por pessoa que o americano (45,5 contra 11,8 kg), enquanto os serviços de alimentação dos Estados Unidos desperdiçam mais (73,7 contra 64,5 kg).",
      ] },
      { h: "Discussão", p: [
        "O desperdício de comida não é sobretudo um problema de países ricos: os domicílios de países de renda média baixa desperdiçam por pessoa tanto quanto os de países ricos. A aparente relação com o calor enfraquece quando se usam só estimativas medidas, porque os valores extrapolados copiam os vizinhos e assim reforçam padrões regionais. Um clima mais quente ainda pode aumentar o desperdício, por exemplo porque a comida estraga mais rápido ou porque cozinhar em casa deixa mais partes não comestíveis, mas são hipóteses que os dados entre países não conseguem testar.",
      ] },
      { h: "Limitações", p: [
        "Só 29% dos países têm uma estimativa doméstica medida; a maioria dos números vem de modelos. O desperdício inclui partes não comestíveis como ossos e cascas. Os estudos nacionais são de anos diferentes e escalados para 2022. As populações do Banco Mundial e da ONU diferem um pouco, e correlações entre países nada dizem sobre causas.",
      ] },
      { h: "Conclusão", p: [
        "A maior parte do desperdício de comida acontece em casa, em países de todos os níveis de renda. Medir melhor, mais do que qualquer padrão dos dados atuais, é o que permitiria aos países acompanhar seu avanço rumo ao ODS 12.3.",
      ] },
    ],
    figure: "Desperdício doméstico de alimentos por pessoa nos países que mais desperdiçam, com México e Estados Unidos destacados, ao lado do desperdício por setor.",
  },
  fr: {
    title: "Où gaspille-t-on la nourriture dans le monde, et qui la gaspille ? Gaspillage des ménages, de la restauration et du commerce dans 228 pays",
    abstract: "Le rapport 2024 du PNUE sur l’indice du gaspillage alimentaire estime que 1 052 millions de tonnes de nourriture ont été gaspillées en 2022, soit 19 % des aliments disponibles pour les consommateurs. Les ménages ont gaspillé 631 Mt (79 kg par personne, 60 % du total), la restauration 290 Mt et le commerce 131 Mt. En croisant les estimations du PNUE pour les 228 pays avec la sous-alimentation de FAOSTAT, les groupes de revenu de la Banque mondiale et la température du CRU, je constate que le gaspillage des ménages par personne varie à peine avec le revenu (72 kg dans les pays à revenu élevé, 81 kg dans ceux à revenu intermédiaire inférieur). Il est faiblement corrélé à la température (r = 0,25 sur 226 pays), et la corrélation tombe à r = 0,20, avec un intervalle qui inclut zéro, parmi les 66 pays dont les estimations sont mesurées plutôt qu’extrapolées. Le Mexique gaspille 105 kg par personne à la maison, contre 73 kg aux États-Unis.",
    keywords: ["gaspillage alimentaire", "ODD 12.3", "indice du gaspillage alimentaire du PNUE", "ménages", "pertes alimentaires", "Mexique", "États-Unis"],
    sections: [
      { h: "Introduction", p: [
        "L’objectif de développement durable 12.3 demande aux pays de réduire de moitié le gaspillage alimentaire par personne dans le commerce et chez les consommateurs d’ici 2030. Le rapport 2024 du PNUE sur l’indice du gaspillage alimentaire en donne la deuxième estimation mondiale. Cette étude cherche où l’on gaspille, quel secteur gaspille, et si le gaspillage suit le revenu, le climat ou la faim, en gardant à l’esprit la part mesurée de chaque estimation.",
      ] },
      { h: "Données et méthodes", p: [
        "Le gaspillage des ménages par personne provient de l’annexe 3 du rapport du PNUE pour les 228 pays et territoires, avec l’indice de confiance du PNUE ; celui de la restauration et du commerce provient de la base de données mondiale des ODD de l’ONU (séries AG_FOOD_WST et AG_FOOD_WST_PC), avec les valeurs Eurostat 2020 pour 27 pays européens, comme l’a fait le PNUE. J’ajoute la prévalence de la sous-alimentation 2021–2023 de FAOSTAT, la région, le groupe de revenu et la population 2022 de la Banque mondiale, ainsi que la température annuelle moyenne 1991–2020 du CRU TS 4.08. Le pipeline tourne dans DuckDB et s’arrête si les totaux mondiaux s’écartent des chiffres publiés par le PNUE ; les 228 pays totalisent 1 051,5 Mt, 0,04 % sous le total mondial.",
        "« Mesuré » signifie que le PNUE a attribué à l’estimation des ménages une confiance élevée ou moyenne : 66 pays sur 228. Les estimations de confiance faible ou très faible sont extrapolées à partir de pays de même région et de même groupe de revenu. Les corrélations sont des r de Pearson avec des intervalles à 95 % par la transformation z de Fisher, pour tous les pays et pour les seuls pays mesurés.",
      ] },
      { h: "Résultats", p: [
        "Les ménages représentent 60 % du total mondial, soit 631 Mt ou 79 kg par personne et par an ; la restauration gaspille 290 Mt et le commerce 131 Mt. Avec les hypothèses prudentes du PNUE (un quart du gaspillage des ménages est comestible et un repas pèse 420 g), la seule part comestible du gaspillage des ménages représente environ 1,03 milliard de repas par jour, alors que 687 millions de personnes sont sous-alimentées. Avant même d’atteindre les magasins, la FAO estime que 13,3 % supplémentaires sont perdus (2023), une part presque inchangée depuis 2015 (13,0 %).",
        "Le gaspillage des ménages par personne est proche d’un groupe de revenu à l’autre : 72 kg dans les pays à revenu élevé, 78 kg à revenu intermédiaire supérieur, 81 kg à revenu intermédiaire inférieur et 92 kg à faible revenu, ce dernier chiffre reposant sur très peu de pays mesurés. Par région, il va de 59 kg en Asie du Sud à 127 kg au Moyen-Orient, en Afrique du Nord, en Afghanistan et au Pakistan. La température est faiblement corrélée au gaspillage des ménages sur 226 pays (r = 0,25 ; intervalle à 95 % : 0,12–0,37) et moins encore parmi les 66 pays mesurés (r = 0,20 ; −0,04 à 0,42). La sous-alimentation donne r = 0,16 (0,00–0,30) et r = 0,10 parmi les pays mesurés. Le Mexique gaspille 105 kg par personne à la maison (25e sur 228), les États-Unis 73 kg (183e) ; le commerce mexicain gaspille 3,9 fois plus par personne que le commerce américain (45,5 contre 11,8 kg), tandis que la restauration américaine gaspille davantage (73,7 contre 64,5 kg).",
      ] },
      { h: "Discussion", p: [
        "Le gaspillage alimentaire n’est pas d’abord un problème de pays riches : les ménages des pays à revenu intermédiaire inférieur gaspillent autant par personne que ceux des pays riches. Le lien apparent avec la chaleur s’affaiblit quand on ne garde que les estimations mesurées, car les valeurs extrapolées copient leurs voisins et renforcent ainsi les motifs régionaux. Un climat plus chaud pourrait accroître le gaspillage, par exemple parce que les aliments s’abîment plus vite ou parce que la cuisine maison produit plus de parties non comestibles, mais ces hypothèses ne peuvent pas être testées avec des données entre pays.",
      ] },
      { h: "Limites", p: [
        "Seuls 29 % des pays disposent d’une estimation mesurée pour les ménages ; la plupart des chiffres sont modélisés. Le gaspillage inclut des parties non comestibles comme les os et les épluchures. Les études nationales datent d’années différentes et sont ramenées à 2022. Les populations de la Banque mondiale et de l’ONU diffèrent légèrement, et des corrélations entre pays ne disent rien des causes.",
      ] },
      { h: "Conclusion", p: [
        "L’essentiel du gaspillage alimentaire a lieu à la maison, dans des pays de tous niveaux de revenu. Une meilleure mesure, plus que tout motif visible dans les données actuelles, permettrait aux pays de suivre leurs progrès vers l’ODD 12.3.",
      ] },
    ],
    figure: "Gaspillage alimentaire des ménages par personne dans les pays qui gaspillent le plus à la maison, Mexique et États-Unis surlignés, à côté du gaspillage par secteur.",
  },
  it: {
    title: "Dove si spreca il cibo nel mondo, e chi lo spreca? Spreco domestico, della ristorazione e del commercio in 228 paesi",
    abstract: "Il Food Waste Index Report 2024 dell’UNEP stima che nel 2022 siano andati sprecati 1.052 milioni di tonnellate di cibo, il 19% degli alimenti disponibili per il consumo. Le famiglie ne hanno sprecati 631 Mt (79 kg a persona, il 60% del totale), la ristorazione 290 Mt e il commercio 131 Mt. Unendo le stime UNEP per tutti i 228 paesi con la denutrizione di FAOSTAT, le fasce di reddito della Banca Mondiale e la temperatura del CRU, trovo che lo spreco domestico a persona cambia appena con il reddito (72 kg nei paesi ad alto reddito, 81 kg in quelli a reddito medio-basso). È debolmente correlato con la temperatura (r = 0,25 su 226 paesi), e la correlazione scende a r = 0,20, con un intervallo che include lo zero, nei 66 paesi le cui stime sono misurate e non estrapolate. Il Messico spreca 105 kg a persona in casa, contro 73 kg negli Stati Uniti.",
    keywords: ["spreco alimentare", "SDG 12.3", "Food Waste Index dell’UNEP", "famiglie", "perdite alimentari", "Messico", "Stati Uniti"],
    sections: [
      { h: "Introduzione", p: [
        "L’Obiettivo di sviluppo sostenibile 12.3 chiede ai paesi di dimezzare entro il 2030 lo spreco alimentare pro capite nel commercio e nel consumo. Il Food Waste Index Report 2024 dell’UNEP ne fornisce la seconda stima mondiale. Questo studio si chiede dove si spreca il cibo, quale settore lo spreca e se lo spreco segue il reddito, il clima o la fame, tenendo conto di quanta parte di ogni stima sia misurata.",
      ] },
      { h: "Dati e metodi", p: [
        "Lo spreco domestico pro capite viene dall’Allegato 3 del rapporto UNEP per tutti i 228 paesi e territori, con il livello di affidabilità dell’UNEP; quello della ristorazione e del commercio dal database globale degli SDG dell’ONU (serie AG_FOOD_WST e AG_FOOD_WST_PC), con i valori Eurostat 2020 per 27 paesi europei, come ha fatto l’UNEP. Aggiungo la prevalenza della denutrizione 2021–2023 di FAOSTAT, regione, fascia di reddito e popolazione 2022 della Banca Mondiale e la temperatura media annua 1991–2020 del CRU TS 4.08. La pipeline gira in DuckDB e si ferma se i totali mondiali differiscono dai dati pubblicati dall’UNEP; i 228 paesi sommano 1.051,5 Mt, lo 0,04% sotto il totale mondiale.",
        "“Misurato” significa che l’UNEP ha assegnato alla stima domestica un’affidabilità alta o media: 66 paesi su 228. Le stime ad affidabilità bassa o molto bassa sono estrapolate da paesi della stessa regione e fascia di reddito. Le correlazioni sono r di Pearson con intervalli al 95% tramite la trasformazione z di Fisher, per tutti i paesi e solo per quelli misurati.",
      ] },
      { h: "Risultati", p: [
        "Le famiglie rappresentano il 60% del totale mondiale, 631 Mt o 79 kg a persona l’anno; la ristorazione spreca 290 Mt e il commercio 131 Mt. Con le ipotesi prudenti dell’UNEP (un quarto dello spreco domestico è commestibile e un pasto pesa 420 g), la sola parte commestibile dello spreco domestico equivale a circa 1,03 miliardi di pasti al giorno, mentre 687 milioni di persone sono denutrite. Prima di arrivare nei negozi, la FAO stima che si perda un ulteriore 13,3% (2023), una quota quasi invariata dal 2015 (13,0%).",
        "Lo spreco domestico pro capite è simile tra fasce di reddito: 72 kg nei paesi ad alto reddito, 78 kg a reddito medio-alto, 81 kg a reddito medio-basso e 92 kg a basso reddito, quest’ultimo basato su pochissimi paesi misurati. Per regione va da 59 kg in Asia meridionale a 127 kg in Medio Oriente, Nord Africa, Afghanistan e Pakistan. La temperatura è debolmente correlata con lo spreco domestico su 226 paesi (r = 0,25; intervallo al 95%: 0,12–0,37) e meno nei 66 paesi misurati (r = 0,20; da −0,04 a 0,42). La denutrizione mostra r = 0,16 (0,00–0,30) e r = 0,10 nei paesi misurati. Il Messico spreca 105 kg a persona in casa (25° su 228), gli Stati Uniti 73 kg (183°); il commercio messicano spreca 3,9 volte più di quello statunitense a persona (45,5 contro 11,8 kg), mentre la ristorazione statunitense spreca di più (73,7 contro 64,5 kg).",
      ] },
      { h: "Discussione", p: [
        "Lo spreco alimentare non è soprattutto un problema dei paesi ricchi: le famiglie dei paesi a reddito medio-basso sprecano a persona quanto quelle dei paesi ricchi. Il legame apparente con il caldo si indebolisce usando solo stime misurate, perché i valori estrapolati copiano i vicini e rafforzano così gli schemi regionali. Un clima più caldo potrebbe comunque aumentare lo spreco, per esempio perché il cibo si deteriora prima o perché cucinare in casa lascia più parti non commestibili, ma sono ipotesi che i dati tra paesi non possono verificare.",
      ] },
      { h: "Limiti", p: [
        "Solo il 29% dei paesi ha una stima domestica misurata; la maggior parte dei dati deriva da modelli. Lo spreco comprende parti non commestibili come ossa e bucce. Gli studi nazionali risalgono ad anni diversi e sono riportati al 2022. Le popolazioni della Banca Mondiale e dell’ONU differiscono leggermente, e le correlazioni tra paesi non dicono nulla sulle cause.",
      ] },
      { h: "Conclusione", p: [
        "La maggior parte dello spreco alimentare avviene in casa, in paesi di ogni livello di reddito. Misurare meglio, più di qualsiasi schema nei dati attuali, è ciò che permetterebbe ai paesi di seguire i propri progressi verso l’SDG 12.3.",
      ] },
    ],
    figure: "Spreco alimentare domestico a persona nei paesi che sprecano di più in casa, con Messico e Stati Uniti evidenziati, accanto allo spreco per settore.",
  },
  ja: {
    title: "世界の食品はどこで、誰によって捨てられているか：228か国の家庭・外食・小売における食品廃棄",
    abstract: "UNEPの「食品廃棄指数報告書2024」は、2022年に10億5,200万トン、消費者が利用できる食品の19%が廃棄されたと推計している。家庭が6億3,100万トン（1人79 kg、全体の60%）、外食が2億9,000万トン、小売が1億3,100万トンである。UNEPの228か国の推計にFAOSTATの栄養不足、世界銀行の所得区分、CRUの気温を結び付けると、家庭の1人あたり廃棄量は所得によってほとんど変わらない（高所得国72 kg、低中所得国81 kg）。気温とは弱く相関する（226か国でr = 0.25）が、推計が外挿ではなく実測に基づく66か国に限ると相関はr = 0.20に下がり、区間はゼロを含む。メキシコは家庭で1人105 kg、米国は73 kgを捨てている。",
    keywords: ["食品廃棄", "SDG 12.3", "UNEP食品廃棄指数", "家庭", "食品ロス", "メキシコ", "米国"],
    sections: [
      { h: "はじめに", p: [
        "持続可能な開発目標12.3は、2030年までに小売と消費段階の1人あたり食品廃棄を半減することを求めている。UNEPの食品廃棄指数報告書2024は、その2回目の世界推計である。本研究は、各推計のうちどれだけが実測に基づくかに注意しながら、食品がどこで、どの部門で捨てられ、廃棄が所得・気候・飢餓と関係するかを問う。",
      ] },
      { h: "データと方法", p: [
        "家庭の1人あたり廃棄量は、UNEP報告書の付属書3から228の国と地域すべてについて、UNEPの信頼度とともに取得した。外食と小売の廃棄は国連SDGグローバル・データベース（AG_FOOD_WSTとAG_FOOD_WST_PC）から取り、欧州27か国はUNEPと同様にEurostat 2020年値を使った。これにFAOSTATの2021〜2023年栄養不足人口割合、世界銀行の地域・所得区分・2022年人口、CRU TS 4.08の1991〜2020年年平均気温を加えた。パイプラインはDuckDBで動き、世界合計がUNEPの公表値と異なれば停止する。228か国の合計は10億5,150万トンで、世界合計より0.04%少ない。",
        "「実測」とは、UNEPが家庭の推計に高または中の信頼度を付けたことを指し、228か国中66か国である。信頼度が低・非常に低い推計は、同じ地域・所得区分の国から外挿されている。相関はピアソンのrで、フィッシャーのz変換による95%区間を付け、全か国と実測国のみの両方で求めた。",
      ] },
      { h: "結果", p: [
        "家庭は世界合計の60%、6億3,100万トン、1人あたり年79 kgを占め、外食は2億9,000万トン、小売は1億3,100万トンを捨てている。UNEPの控えめな仮定（家庭廃棄の4分の1が可食、1食420 g）では、家庭廃棄の可食部だけで1日約10億3,000万食に相当する一方、栄養不足の人は6億8,700万人いる。店に届く前にも、FAOの推計で食品のさらに13.3%（2023年）が失われており、この割合は2015年（13.0%）からほとんど変わっていない。",
        "家庭の1人あたり廃棄量は所得区分間で近く、高所得国72 kg、高中所得国78 kg、低中所得国81 kg、低所得国92 kgである（最後の値は実測国がごく少ない）。地域別では南アジアの59 kgから、中東・北アフリカ・アフガニスタン・パキスタンの127 kgまで幅がある。気温は226か国で家庭廃棄と弱く相関し（r = 0.25、95%区間0.12〜0.37）、実測の66か国ではさらに弱い（r = 0.20、−0.04〜0.42）。栄養不足はr = 0.16（0.00〜0.30）、実測国ではr = 0.10。メキシコは家庭で1人105 kg（228か国中25位）、米国は73 kg（183位）を捨てる。メキシコの小売は1人あたり米国の3.9倍（45.5 kg対11.8 kg）を捨てる一方、外食は米国のほうが多い（73.7 kg対64.5 kg）。",
      ] },
      { h: "考察", p: [
        "食品廃棄は主に豊かな国の問題ではない。低中所得国の家庭は、1人あたりで豊かな国の家庭と同程度を捨てている。暑さとの見かけの関係は実測の推計だけを使うと弱まる。外挿値は近隣国の値を写すため、地域的なパターンを強めてしまうからだ。暑い気候では食品が傷みやすい、家庭料理で不可食部が多く出るといった理由で廃棄が増える可能性はあるが、それは国別データでは検証できない仮説である。",
      ] },
      { h: "限界", p: [
        "家庭の実測推計がある国は29%にすぎず、大半の値はモデルによる。廃棄には骨や皮などの不可食部が含まれる。各国の調査年は異なり、2022年に換算されている。世界銀行と国連の人口はわずかに異なり、国間の相関は原因について何も語らない。",
      ] },
      { h: "結論", p: [
        "食品廃棄の大部分は、あらゆる所得水準の国の家庭で起きている。現在のデータに見えるどのパターンよりも、より良い計測こそが、各国がSDG 12.3への進捗を追うために必要である。",
      ] },
    ],
    figure: "家庭で最も多く捨てている国々の1人あたり家庭食品廃棄量（メキシコと米国を強調）と、部門別の食品廃棄。",
  },
  zh: {
    title: "世界的食物在哪里被浪费、由谁浪费？228 个国家的家庭、餐饮服务和零售食物浪费",
    abstract: "联合国环境规划署（UNEP）《2024 年食物浪费指数报告》估计，2022 年全球浪费了 10.52 亿吨食物，占可供消费者食用食物的 19%。家庭浪费 6.31 亿吨（人均 79 公斤，占总量 60%），餐饮服务 2.9 亿吨，零售 1.31 亿吨。把 UNEP 对 228 个国家的估计与 FAOSTAT 营养不足数据、世界银行收入组别和 CRU 气温结合后，我发现家庭人均浪费几乎不随收入变化（高收入国家 72 公斤，中低收入国家 81 公斤）。它与气温呈弱相关（226 个国家 r = 0.25）；在估计值为实测而非外推的 66 个国家中，相关降至 r = 0.20，且区间包含零。墨西哥家庭人均浪费 105 公斤，美国为 73 公斤。",
    keywords: ["食物浪费", "可持续发展目标 12.3", "UNEP 食物浪费指数", "家庭", "粮食损失", "墨西哥", "美国"],
    sections: [
      { h: "引言", p: [
        "可持续发展目标 12.3 要求各国到 2030 年将零售和消费环节的人均食物浪费减半。UNEP《2024 年食物浪费指数报告》给出了对这一浪费的第二次全球估计。本研究要问：食物在哪里被浪费、由哪个环节浪费，浪费是否与收入、气候或饥饿有关，同时关注每个估计中有多少是实测的。",
      ] },
      { h: "数据与方法", p: [
        "家庭人均浪费来自 UNEP 报告附件 3，覆盖全部 228 个国家和地区，并附有 UNEP 的置信度评级；餐饮服务和零售浪费来自联合国 SDG 全球数据库（AG_FOOD_WST 和 AG_FOOD_WST_PC 系列），其中 27 个欧洲国家与 UNEP 一样使用 Eurostat 2020 年数值。我加入了 FAOSTAT 2021–2023 年营养不足发生率、世界银行的地区、收入组别和 2022 年人口，以及 CRU TS 4.08 的 1991–2020 年年平均气温。数据管道在 DuckDB 中运行，如果全球总量与 UNEP 公布的数字不符就会停止；228 个国家合计 10.515 亿吨，比全球总量低 0.04%。",
        "“实测”指 UNEP 将家庭估计评为高或中置信度：228 个国家中有 66 个。低和很低置信度的估计是根据同一地区和收入组别的国家外推的。相关采用 Pearson r，并用 Fisher z 变换给出 95% 区间，分别计算全部国家和仅实测国家。",
      ] },
      { h: "结果", p: [
        "家庭占全球总量的 60%，即 6.31 亿吨或每人每年 79 公斤；餐饮服务浪费 2.9 亿吨，零售 1.31 亿吨。按 UNEP 的保守假设（家庭浪费的四分之一可食用，每餐 420 克），仅家庭浪费中的可食用部分就相当于每天约 10.3 亿餐，而全球有 6.87 亿人营养不足。在食物进入商店之前，FAO 估计还有 13.3%（2023 年）被损失，这一比例自 2015 年（13.0%）以来几乎没有变化。",
        "各收入组别的家庭人均浪费相近：高收入国家 72 公斤，中高收入 78 公斤，中低收入 81 公斤，低收入 92 公斤（最后一个数字依据的实测国家很少）。按地区，从南亚的 59 公斤到中东、北非、阿富汗和巴基斯坦的 127 公斤不等。在 226 个国家中，气温与家庭浪费呈弱相关（r = 0.25；95% 区间 0.12–0.37），在 66 个实测国家中更弱（r = 0.20；−0.04 至 0.42）。营养不足的相关为 r = 0.16（0.00–0.30），实测国家中为 r = 0.10。墨西哥家庭人均浪费 105 公斤（228 个国家中第 25），美国 73 公斤（第 183）；墨西哥零售人均浪费是美国的 3.9 倍（45.5 对 11.8 公斤），而美国餐饮服务浪费更多（73.7 对 64.5 公斤）。",
      ] },
      { h: "讨论", p: [
        "食物浪费并不主要是富裕国家的问题：中低收入国家的家庭人均浪费与富裕国家相当。只使用实测估计时，与炎热的表面联系就会减弱，因为外推值复制了邻国的数值，从而强化了区域模式。更炎热的气候仍可能增加浪费，例如食物更快变质，或家庭烹饪产生更多不可食用部分，但这些都是跨国数据无法检验的假设。",
      ] },
      { h: "局限", p: [
        "只有 29% 的国家有实测的家庭估计，大多数数字来自模型。浪费包括骨头、果皮等不可食用部分。各国研究的年份不同，并被换算到 2022 年。世界银行与联合国的人口数据略有差异，跨国相关也不能说明因果。",
      ] },
      { h: "结论", p: [
        "大部分食物浪费发生在家庭中，存在于各种收入水平的国家。比起当前数据中的任何规律，更好的测量才是各国追踪实现可持续发展目标 12.3 进展的关键。",
      ] },
    ],
    figure: "家庭食物浪费最多的国家的人均家庭食物浪费（突出显示墨西哥和美国），旁边是按环节划分的食物浪费。",
  },
};
