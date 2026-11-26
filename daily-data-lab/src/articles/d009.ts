import type { ArticleSet } from "./types";

// Figures from data/day-009-longevity/day-009.json (UN WPP 2024, WHO GHO and World Bank WDI downloaded 2026-11-26),
// recomputed by scripts/day-009/snapshot.mjs and the page's own fits. Literature claims follow the abstracts (or, for the
// two Vienna Yearbook papers, the full text) of the references in src/days/day-009-longevity/Research.tsx.
export const D009: ArticleSet = {
  en: {
    title: "Where do people live longest and healthiest, and do blue zones survive age validation? Life expectancy, healthy life expectancy and the limits of national data",
    abstract: "Using the UN World Population Prospects 2024, the WHO Global Health Observatory and World Bank indicators for all 237 countries and areas, we describe life expectancy and healthy life expectancy (HALE) in 2023. World life expectancy was 73.2 years (46.4 in 1950); WHO puts HALE at 62.8 years (95% uncertainty interval 57.9–67.4), leaving 10.5 years lived in less than full health. Singapore has the highest HALE (72.9), but all nine following countries overlap its interval, so the top of the ranking is a tie. Years in less than full health rise with life expectancy (r = 0.87), from 7.0 in Somalia to 13.9 in the United States. On a log scale, GDP per person explains 69% of the variation in HALE across 179 countries; health spending as a share of GDP explains 5%. The record female life expectancy rose 2.5 months a year from 1950 to 2023. Blue zones are small areas measured in old cohorts; whether their ages are real is disputed (Newman 2024; Austad & Pes 2025) and cannot be tested with national averages.",
    keywords: ["life expectancy", "healthy life expectancy", "HALE", "centenarians", "blue zones", "age validation", "Preston curve", "UN WPP 2024"],
    sections: [
      { h: "Introduction", p: [
        "Life expectancy at birth summarises the death rates of one year; healthy life expectancy (HALE) discounts the years lived with illness or disability. Both have risen for most of the past two centuries: Oeppen and Vaupel (2002) showed that record female life expectancy rose almost linearly for 160 years and broke every proposed ceiling. Preston (1975) described how life expectancy climbs steeply with income in poor countries and flattens in rich ones.",
        "Blue zones are a popular answer to the question of where people live longest: small areas in Sardinia, Okinawa, Nicoya and Ikaria where demographers reported unusually many very old people (Poulain et al. 2004; Poulain, Herm & Pes 2013). Their ages have recently been challenged (Newman 2024) and defended (Austad & Pes 2025). This study asks where people live longest and healthiest at country level, and what national data can and cannot say about blue zones.",
      ] },
      { h: "Data and methods", p: [
        "Life expectancy (both sexes and by sex), population and the population aged 100+ are UN WPP 2024 medium-variant estimates for 1950–2023, for all 237 countries and areas. HALE and WHO's own life expectancy for 2023, with 95% uncertainty intervals, come from the WHO GHO OData API (185 countries); years in less than full health are WHO life expectancy minus HALE, so both terms come from one model. World Bank regions, GDP per person (PPP, constant 2021 dollars) and current health spending (% of GDP) are taken for 2023 or the latest earlier year. The DuckDB build stops unless world life expectancy matches the published WPP figures (73.2 in 2023, 73.3 in 2024) and global HALE and life expectancy match WHO (62.8 and 73.3).",
        "Regions are population-weighted. The Preston line is an ordinary least-squares fit of HALE on log10 GDP per person. The record female life expectancy is the highest value among countries with at least one million people each year; its trend excludes 2020–2022. Centenarian rates are faded for places with fewer than one million people. Blue-zone measures are transcribed from the cited papers only.",
      ] },
      { h: "Results", p: [
        "World life expectancy rose from 46.4 years in 1950 to 73.2 in 2023, after falling from 72.6 in 2019 to 70.9 in 2021. Women live longer than men in every country, by 5.3 years worldwide, from 0.4 years in Togo to 13.3 in Ukraine. The record female life expectancy rose 2.5 months a year (R² 0.989), from 73.3 in Norway in 1950 to 88.1 in Hong Kong in 2023.",
        "Singapore (72.9), Japan (72.2) and South Korea (72.0) have the highest HALE, but the WHO intervals of all nine countries after Singapore overlap its own (69.3–76.1). Worldwide 10.5 of 73.3 years are lived in less than full health; across countries this ranges from 7.0 years in Somalia to 13.9 in the United States and grows with life expectancy (r = 0.87). Ten times the income goes with 9.4 more healthy years (R² 0.69); the United States is 5.1 years below the line, Mexico 1.5 below, Japan 4.4 above and Costa Rica 1.7 above. Health spending as a share of GDP explains only 5% of the variation.",
        "The UN estimates 549,771 people aged 100 or more in 2023, 3.4 times the 161,709 of 2000; Japan alone has about 120,000, 96.5 per 100,000 people.",
      ] },
      { h: "Discussion", p: [
        "Longer lives bring both healthy and unhealthy years, and the very top of the HALE ranking is statistically indistinguishable. Income explains most of the variation between countries, but large residuals, such as that of the United States, point to factors that national income does not capture.",
        "The blue-zone evidence is regional and concerns cohorts born around 1880–1919. In the original comparisons, survival from the 60s to the 90s was clearly higher in the Sardinian and Okinawan zones than in their reference populations, weaker in Ikaria, and not demonstrable for Nicoya by census data, although a follow-up of elderly Costa Ricans found death rates 20% lower for Nicoyan men (Poulain, Herm & Pes 2013; Rosero-Bixby, Dow & Rehkopf 2013). Newman (2024) argues that remarkable ages track poor vital registration and relative poverty; Austad and Pes (2025) reply that blue-zone ages were validated against several independent documents. The country figures here neither confirm nor refute either side.",
      ] },
      { h: "Limitations", p: [
        "All values are modelled estimates. UN and WHO life expectancies differ by 1.4 years on average, so HALE is compared only with WHO's own figure. Centenarian counts are estimates for an open age group, not registered people. GDP and health spending are missing for some territories, and associations between countries say nothing about causes or individuals.",
      ] },
      { h: "Conclusion", p: [
        "People live longest in good health in a group of high-income East Asian and European countries whose order cannot be separated. About one year in seven is lived in less than full health. Blue zones remain a debated regional claim that national averages cannot settle; sub-national life tables and validated age records are the next step.",
      ] },
    ],
    figure: "World life expectancy at birth, 1950–2023, with the record female life expectancy, next to the ten countries with the highest healthy life expectancy in 2023 and their WHO 95% uncertainty intervals.",
  },
  es: {
    title: "¿Dónde se vive más tiempo y con mejor salud, y sobreviven las zonas azules a la validación de edades? Esperanza de vida, esperanza de vida saludable y los límites de los datos nacionales",
    abstract: "Con World Population Prospects 2024 de la ONU, el Observatorio Mundial de la Salud de la OMS e indicadores del Banco Mundial para los 237 países y territorios, describimos la esperanza de vida y la esperanza de vida saludable (AVS) en 2023. La esperanza de vida mundial fue de 73.2 años (46.4 en 1950); la OMS estima la AVS en 62.8 años (intervalo de incertidumbre al 95% 57.9–67.4), lo que deja 10.5 años vividos con salud no plena. Singapur tiene la mayor AVS (72.9), pero los nueve países siguientes se traslapan con su intervalo, así que la cima del ranking es un empate. Los años con salud no plena aumentan con la esperanza de vida (r = 0.87), de 7.0 en Somalia a 13.9 en Estados Unidos. En escala logarítmica, el PIB por persona explica el 69% de la variación de la AVS en 179 países; el gasto en salud como proporción del PIB explica el 5%. La esperanza de vida femenina récord subió 2.5 meses por año de 1950 a 2023. Las zonas azules son áreas pequeñas medidas en cohortes antiguas; si sus edades son reales está en disputa (Newman 2024; Austad y Pes 2025) y no se puede probar con promedios nacionales.",
    keywords: ["esperanza de vida", "esperanza de vida saludable", "AVS", "centenarios", "zonas azules", "validación de edades", "curva de Preston", "ONU WPP 2024"],
    sections: [
      { h: "Introducción", p: [
        "La esperanza de vida al nacer resume las tasas de mortalidad de un año; la esperanza de vida saludable (AVS) descuenta los años vividos con enfermedad o discapacidad. Ambas han subido durante casi dos siglos: Oeppen y Vaupel (2002) mostraron que la esperanza de vida femenina récord aumentó de forma casi lineal durante 160 años y rompió todos los techos propuestos. Preston (1975) describió cómo la esperanza de vida sube rápido con el ingreso en los países pobres y se aplana en los ricos.",
        "Las zonas azules son una respuesta popular a dónde se vive más: áreas pequeñas de Cerdeña, Okinawa, Nicoya e Icaria donde demógrafos reportaron muchas personas muy mayores (Poulain et al. 2004; Poulain, Herm y Pes 2013). Sus edades se han cuestionado recientemente (Newman 2024) y defendido (Austad y Pes 2025). Este estudio pregunta dónde se vive más y con mejor salud a nivel país, y qué pueden y qué no pueden decir los datos nacionales sobre las zonas azules.",
      ] },
      { h: "Datos y métodos", p: [
        "La esperanza de vida (total y por sexo), la población y la población de 100 años o más son estimaciones de la variante media de ONU WPP 2024 para 1950–2023, para los 237 países y territorios. La AVS y la esperanza de vida de la propia OMS para 2023, con intervalos de incertidumbre al 95%, vienen de la API OData del GHO de la OMS (185 países); los años con salud no plena son la esperanza de vida de la OMS menos la AVS, así que ambos términos salen del mismo modelo. Las regiones del Banco Mundial, el PIB por persona (PPA, dólares constantes de 2021) y el gasto corriente en salud (% del PIB) se toman para 2023 o el último año anterior. La compilación en DuckDB se detiene si la esperanza de vida mundial no coincide con las cifras publicadas de WPP (73.2 en 2023, 73.3 en 2024) y si la AVS y la esperanza de vida mundiales no coinciden con la OMS (62.8 y 73.3).",
        "Las regiones se ponderan por población. La línea de Preston es un ajuste por mínimos cuadrados ordinarios de la AVS sobre el log10 del PIB por persona. La esperanza de vida femenina récord es el valor más alto entre los países con al menos un millón de habitantes cada año; su tendencia excluye 2020–2022. Las tasas de centenarios se atenúan en lugares con menos de un millón de habitantes. Las medidas de las zonas azules se transcriben solo de los artículos citados.",
      ] },
      { h: "Resultados", p: [
        "La esperanza de vida mundial pasó de 46.4 años en 1950 a 73.2 en 2023, después de caer de 72.6 en 2019 a 70.9 en 2021. Las mujeres viven más que los hombres en todos los países, 5.3 años en el mundo, desde 0.4 años en Togo hasta 13.3 en Ucrania. La esperanza de vida femenina récord subió 2.5 meses por año (R² 0.989), de 73.3 en Noruega en 1950 a 88.1 en Hong Kong en 2023.",
        "Singapur (72.9), Japón (72.2) y Corea del Sur (72.0) tienen la mayor AVS, pero los intervalos de la OMS de los nueve países que siguen a Singapur se traslapan con el suyo (69.3–76.1). En el mundo, 10.5 de 73.3 años se viven con salud no plena; entre países va de 7.0 años en Somalia a 13.9 en Estados Unidos y crece con la esperanza de vida (r = 0.87). Diez veces más ingreso va con 9.4 años sanos más (R² 0.69); Estados Unidos está 5.1 años debajo de la línea, México 1.5 debajo, Japón 4.4 arriba y Costa Rica 1.7 arriba. El gasto en salud como proporción del PIB explica solo el 5% de la variación.",
        "La ONU estima 549,771 personas de 100 años o más en 2023, 3.4 veces las 161,709 de 2000; solo Japón tiene unas 120,000, 96.5 por cada 100,000 habitantes.",
      ] },
      { h: "Discusión", p: [
        "Vivir más trae años sanos y también años con enfermedad, y la cima del ranking de AVS no se puede distinguir estadísticamente. El ingreso explica la mayor parte de la variación entre países, pero residuos grandes, como el de Estados Unidos, apuntan a factores que el ingreso nacional no capta.",
        "La evidencia de las zonas azules es regional y se refiere a cohortes nacidas entre 1880 y 1919. En las comparaciones originales, la supervivencia de los 60 a los 90 años fue claramente mayor en las zonas de Cerdeña y Okinawa que en sus poblaciones de referencia, más débil en Icaria y no demostrable para Nicoya con datos censales, aunque un seguimiento de costarricenses mayores encontró tasas de mortalidad 20% menores en los hombres de Nicoya (Poulain, Herm y Pes 2013; Rosero-Bixby, Dow y Rehkopf 2013). Newman (2024) argumenta que las edades extraordinarias siguen al registro civil deficiente y a la pobreza relativa; Austad y Pes (2025) responden que las edades de las zonas azules se validaron con varios documentos independientes. Las cifras nacionales de este estudio no confirman ni refutan a ninguna de las dos partes.",
      ] },
      { h: "Limitaciones", p: [
        "Todos los valores son estimaciones modeladas. Las esperanzas de vida de la ONU y de la OMS difieren en 1.4 años en promedio, por eso la AVS se compara solo con la cifra de la propia OMS. Los centenarios son estimaciones de un grupo de edad abierto, no personas registradas. Faltan PIB y gasto en salud para algunos territorios, y las asociaciones entre países no dicen nada de causas ni de personas.",
      ] },
      { h: "Conclusión", p: [
        "Donde más se vive con buena salud es en un grupo de países de ingreso alto de Asia Oriental y Europa cuyo orden no se puede separar. Cerca de un año de cada siete se vive con salud no plena. Las zonas azules siguen siendo una afirmación regional en debate que los promedios nacionales no pueden resolver; las tablas de vida subnacionales y los registros de edad validados son el siguiente paso.",
      ] },
    ],
    figure: "Esperanza de vida mundial al nacer, 1950–2023, con la esperanza de vida femenina récord, junto a los diez países con mayor esperanza de vida saludable en 2023 y sus intervalos de incertidumbre al 95% de la OMS.",
  },
  pt: {
    title: "Onde se vive mais e com mais saúde, e as zonas azuis resistem à validação das idades? Expectativa de vida, expectativa de vida saudável e os limites dos dados nacionais",
    abstract: "Com o World Population Prospects 2024 da ONU, o Observatório Global de Saúde da OMS e indicadores do Banco Mundial para todos os 237 países e territórios, descrevemos a expectativa de vida e a expectativa de vida saudável (EVS) em 2023. A expectativa de vida mundial foi de 73,2 anos (46,4 em 1950); a OMS estima a EVS em 62,8 anos (intervalo de incerteza de 95% 57,9–67,4), restando 10,5 anos vividos com saúde não plena. Singapura tem a maior EVS (72,9), mas os nove países seguintes se sobrepõem ao seu intervalo, então o topo do ranking é um empate. Os anos com saúde não plena aumentam com a expectativa de vida (r = 0,87), de 7,0 na Somália a 13,9 nos Estados Unidos. Em escala logarítmica, o PIB por pessoa explica 69% da variação da EVS em 179 países; o gasto em saúde como parcela do PIB explica 5%. A expectativa de vida feminina recorde subiu 2,5 meses por ano de 1950 a 2023. As zonas azuis são áreas pequenas medidas em coortes antigas; se suas idades são reais está em disputa (Newman 2024; Austad e Pes 2025) e não pode ser testado com médias nacionais.",
    keywords: ["expectativa de vida", "expectativa de vida saudável", "EVS", "centenários", "zonas azuis", "validação de idade", "curva de Preston", "ONU WPP 2024"],
    sections: [
      { h: "Introdução", p: [
        "A expectativa de vida ao nascer resume as taxas de mortalidade de um ano; a expectativa de vida saudável (EVS) desconta os anos vividos com doença ou deficiência. Ambas subiram durante quase dois séculos: Oeppen e Vaupel (2002) mostraram que a expectativa de vida feminina recorde subiu de forma quase linear por 160 anos e quebrou todos os tetos propostos. Preston (1975) descreveu como a expectativa de vida sobe rápido com a renda nos países pobres e se achata nos ricos.",
        "As zonas azuis são uma resposta popular sobre onde se vive mais: áreas pequenas da Sardenha, de Okinawa, de Nicoya e de Icária onde demógrafos relataram muitas pessoas muito idosas (Poulain et al. 2004; Poulain, Herm e Pes 2013). Suas idades foram recentemente contestadas (Newman 2024) e defendidas (Austad e Pes 2025). Este estudo pergunta onde se vive mais e com mais saúde no nível dos países, e o que os dados nacionais podem e não podem dizer sobre as zonas azuis.",
      ] },
      { h: "Dados e métodos", p: [
        "Expectativa de vida (total e por sexo), população e população com 100 anos ou mais são estimativas da variante média da ONU WPP 2024 para 1950–2023, para os 237 países e territórios. A EVS e a expectativa de vida da própria OMS para 2023, com intervalos de incerteza de 95%, vêm da API OData do GHO da OMS (185 países); os anos com saúde não plena são a expectativa de vida da OMS menos a EVS, de modo que os dois termos vêm de um só modelo. Regiões do Banco Mundial, PIB por pessoa (PPC, dólares constantes de 2021) e gasto corrente em saúde (% do PIB) são de 2023 ou do último ano anterior. A compilação no DuckDB para se a expectativa de vida mundial não coincidir com os números publicados do WPP (73,2 em 2023, 73,3 em 2024) e se a EVS e a expectativa de vida mundiais não coincidirem com a OMS (62,8 e 73,3).",
        "As regiões são ponderadas pela população. A linha de Preston é um ajuste por mínimos quadrados ordinários da EVS sobre o log10 do PIB por pessoa. A expectativa de vida feminina recorde é o maior valor entre os países com pelo menos um milhão de habitantes a cada ano; sua tendência exclui 2020–2022. As taxas de centenários aparecem esmaecidas em lugares com menos de um milhão de habitantes. As medidas das zonas azuis foram transcritas só dos artigos citados.",
      ] },
      { h: "Resultados", p: [
        "A expectativa de vida mundial passou de 46,4 anos em 1950 para 73,2 em 2023, depois de cair de 72,6 em 2019 para 70,9 em 2021. As mulheres vivem mais que os homens em todos os países, 5,3 anos no mundo, de 0,4 ano no Togo a 13,3 na Ucrânia. A expectativa de vida feminina recorde subiu 2,5 meses por ano (R² 0,989), de 73,3 na Noruega em 1950 para 88,1 em Hong Kong em 2023.",
        "Singapura (72,9), Japão (72,2) e Coreia do Sul (72,0) têm a maior EVS, mas os intervalos da OMS dos nove países depois de Singapura se sobrepõem ao dela (69,3–76,1). No mundo, 10,5 de 73,3 anos são vividos com saúde não plena; entre países isso vai de 7,0 anos na Somália a 13,9 nos Estados Unidos e cresce com a expectativa de vida (r = 0,87). Dez vezes mais renda vem com 9,4 anos saudáveis a mais (R² 0,69); os Estados Unidos estão 5,1 anos abaixo da linha, o México 1,5 abaixo, o Japão 4,4 acima e a Costa Rica 1,7 acima. O gasto em saúde como parcela do PIB explica só 5% da variação.",
        "A ONU estima 549.771 pessoas com 100 anos ou mais em 2023, 3,4 vezes as 161.709 de 2000; só o Japão tem cerca de 120.000, 96,5 por 100 mil habitantes.",
      ] },
      { h: "Discussão", p: [
        "Viver mais traz anos saudáveis e também anos com doença, e o topo do ranking de EVS é estatisticamente indistinguível. A renda explica a maior parte da variação entre países, mas resíduos grandes, como o dos Estados Unidos, apontam para fatores que a renda nacional não capta.",
        "A evidência das zonas azuis é regional e se refere a coortes nascidas por volta de 1880–1919. Nas comparações originais, a sobrevivência dos 60 aos 90 anos foi claramente maior nas zonas da Sardenha e de Okinawa do que em suas populações de referência, mais fraca em Icária e não demonstrável para Nicoya com dados censitários, embora um acompanhamento de costarriquenhos idosos tenha encontrado mortalidade 20% menor nos homens de Nicoya (Poulain, Herm e Pes 2013; Rosero-Bixby, Dow e Rehkopf 2013). Newman (2024) argumenta que idades extraordinárias acompanham registro civil precário e pobreza relativa; Austad e Pes (2025) respondem que as idades das zonas azuis foram validadas com vários documentos independentes. Os números nacionais aqui não confirmam nem refutam nenhum dos lados.",
      ] },
      { h: "Limitações", p: [
        "Todos os valores são estimativas modeladas. As expectativas de vida da ONU e da OMS diferem 1,4 ano em média, por isso a EVS só é comparada com o número da própria OMS. Os centenários são estimativas de um grupo etário aberto, não pessoas registradas. Faltam PIB e gasto em saúde para alguns territórios, e associações entre países não dizem nada sobre causas ou indivíduos.",
      ] },
      { h: "Conclusão", p: [
        "Vive-se mais tempo com boa saúde num grupo de países de alta renda do Leste Asiático e da Europa cuja ordem não pode ser separada. Cerca de um ano em cada sete é vivido com saúde não plena. As zonas azuis continuam uma afirmação regional em debate que as médias nacionais não resolvem; tábuas de vida subnacionais e registros de idade validados são o próximo passo.",
      ] },
    ],
    figure: "Expectativa de vida mundial ao nascer, 1950–2023, com a expectativa de vida feminina recorde, ao lado dos dez países com maior expectativa de vida saudável em 2023 e seus intervalos de incerteza de 95% da OMS.",
  },
  fr: {
    title: "Où vit-on le plus longtemps et en meilleure santé, et les zones bleues résistent-elles à la validation des âges ? Espérance de vie, espérance de vie en bonne santé et limites des données nationales",
    abstract: "À partir des World Population Prospects 2024 de l'ONU, de l'Observatoire mondial de la santé de l'OMS et d'indicateurs de la Banque mondiale pour les 237 pays et territoires, nous décrivons l'espérance de vie et l'espérance de vie en bonne santé (EVBS) en 2023. L'espérance de vie mondiale était de 73,2 ans (46,4 en 1950) ; l'OMS estime l'EVBS à 62,8 ans (intervalle d'incertitude à 95 % 57,9–67,4), soit 10,5 années vécues en santé non optimale. Singapour a la plus haute EVBS (72,9), mais les neuf pays suivants chevauchent son intervalle : le haut du classement est une égalité. Les années en santé non optimale augmentent avec l'espérance de vie (r = 0,87), de 7,0 en Somalie à 13,9 aux États-Unis. En échelle logarithmique, le PIB par habitant explique 69 % de la variation de l'EVBS sur 179 pays ; les dépenses de santé en part du PIB en expliquent 5 %. L'espérance de vie féminine record a progressé de 2,5 mois par an de 1950 à 2023. Les zones bleues sont de petites zones mesurées sur des cohortes anciennes ; la réalité de leurs âges est débattue (Newman 2024 ; Austad et Pes 2025) et ne peut pas être testée avec des moyennes nationales.",
    keywords: ["espérance de vie", "espérance de vie en bonne santé", "EVBS", "centenaires", "zones bleues", "validation des âges", "courbe de Preston", "ONU WPP 2024"],
    sections: [
      { h: "Introduction", p: [
        "L'espérance de vie à la naissance résume les taux de mortalité d'une année ; l'espérance de vie en bonne santé (EVBS) retire les années vécues avec une maladie ou un handicap. Toutes deux progressent depuis près de deux siècles : Oeppen et Vaupel (2002) ont montré que l'espérance de vie féminine record a augmenté de façon presque linéaire pendant 160 ans et a dépassé tous les plafonds proposés. Preston (1975) a décrit une espérance de vie qui grimpe vite avec le revenu dans les pays pauvres et plafonne dans les pays riches.",
        "Les zones bleues sont une réponse populaire à la question de savoir où l'on vit le plus longtemps : de petites zones de Sardaigne, d'Okinawa, de Nicoya et d'Icarie où des démographes ont signalé beaucoup de personnes très âgées (Poulain et al. 2004 ; Poulain, Herm et Pes 2013). Leurs âges ont récemment été contestés (Newman 2024) et défendus (Austad et Pes 2025). Cette étude demande où l'on vit le plus longtemps et en meilleure santé à l'échelle des pays, et ce que les données nationales peuvent ou non dire des zones bleues.",
      ] },
      { h: "Données et méthodes", p: [
        "L'espérance de vie (ensemble et par sexe), la population et la population de 100 ans ou plus sont des estimations de la variante moyenne de l'ONU WPP 2024 pour 1950–2023, pour les 237 pays et territoires. L'EVBS et l'espérance de vie propre à l'OMS pour 2023, avec intervalles d'incertitude à 95 %, viennent de l'API OData du GHO de l'OMS (185 pays) ; les années en santé non optimale sont l'espérance de vie OMS moins l'EVBS, les deux termes venant d'un même modèle. Les régions de la Banque mondiale, le PIB par habitant (PPA, dollars constants de 2021) et les dépenses courantes de santé (% du PIB) sont pris pour 2023 ou la dernière année antérieure. La compilation DuckDB s'arrête si l'espérance de vie mondiale ne correspond pas aux chiffres publiés du WPP (73,2 en 2023, 73,3 en 2024) et si l'EVBS et l'espérance de vie mondiales ne correspondent pas à l'OMS (62,8 et 73,3).",
        "Les régions sont pondérées par la population. La droite de Preston est un ajustement par moindres carrés ordinaires de l'EVBS sur le log10 du PIB par habitant. L'espérance de vie féminine record est la valeur la plus élevée parmi les pays d'au moins un million d'habitants chaque année ; sa tendance exclut 2020–2022. Les taux de centenaires sont atténués pour les lieux de moins d'un million d'habitants. Les mesures des zones bleues sont reprises uniquement des articles cités.",
      ] },
      { h: "Résultats", p: [
        "L'espérance de vie mondiale est passée de 46,4 ans en 1950 à 73,2 en 2023, après une baisse de 72,6 en 2019 à 70,9 en 2021. Les femmes vivent plus longtemps que les hommes dans tous les pays, de 5,3 ans dans le monde, de 0,4 an au Togo à 13,3 en Ukraine. L'espérance de vie féminine record a progressé de 2,5 mois par an (R² 0,989), de 73,3 en Norvège en 1950 à 88,1 à Hong Kong en 2023.",
        "Singapour (72,9), le Japon (72,2) et la Corée du Sud (72,0) ont la plus haute EVBS, mais les intervalles OMS des neuf pays suivant Singapour chevauchent le sien (69,3–76,1). Dans le monde, 10,5 des 73,3 années sont vécues en santé non optimale ; selon les pays, de 7,0 ans en Somalie à 13,9 aux États-Unis, une valeur qui augmente avec l'espérance de vie (r = 0,87). Un revenu dix fois plus élevé va de pair avec 9,4 années de bonne santé en plus (R² 0,69) ; les États-Unis sont 5,1 ans sous la droite, le Mexique 1,5 en dessous, le Japon 4,4 au-dessus et le Costa Rica 1,7 au-dessus. Les dépenses de santé en part du PIB n'expliquent que 5 % de la variation.",
        "L'ONU estime à 549 771 les personnes de 100 ans ou plus en 2023, 3,4 fois les 161 709 de 2000 ; le Japon à lui seul en compte environ 120 000, soit 96,5 pour 100 000 habitants.",
      ] },
      { h: "Discussion", p: [
        "Vivre plus longtemps apporte des années en bonne et en moins bonne santé, et le haut du classement de l'EVBS est statistiquement indiscernable. Le revenu explique l'essentiel de la variation entre pays, mais de grands résidus, comme celui des États-Unis, signalent des facteurs que le revenu national ne capte pas.",
        "Les preuves des zones bleues sont régionales et portent sur des cohortes nées vers 1880–1919. Dans les comparaisons d'origine, la survie des 60 aux 90 ans était nettement plus élevée dans les zones de Sardaigne et d'Okinawa que dans leurs populations de référence, plus faible à Icarie et non démontrable pour Nicoya avec les recensements, bien qu'un suivi de Costariciens âgés ait trouvé une mortalité inférieure de 20 % chez les hommes de Nicoya (Poulain, Herm et Pes 2013 ; Rosero-Bixby, Dow et Rehkopf 2013). Newman (2024) soutient que les âges remarquables suivent un état civil défaillant et la pauvreté relative ; Austad et Pes (2025) répondent que les âges des zones bleues ont été validés par plusieurs documents indépendants. Les chiffres nationaux ici ne confirment ni ne réfutent aucun des deux camps.",
      ] },
      { h: "Limites", p: [
        "Toutes les valeurs sont des estimations modélisées. Les espérances de vie de l'ONU et de l'OMS diffèrent en moyenne de 1,4 an : l'EVBS n'est donc comparée qu'au chiffre de l'OMS. Les centenaires sont des estimations d'un groupe d'âge ouvert, pas des personnes enregistrées. PIB et dépenses de santé manquent pour certains territoires, et les associations entre pays ne disent rien des causes ni des individus.",
      ] },
      { h: "Conclusion", p: [
        "On vit le plus longtemps en bonne santé dans un groupe de pays à revenu élevé d'Asie de l'Est et d'Europe dont l'ordre ne peut être départagé. Environ une année sur sept est vécue en santé non optimale. Les zones bleues restent une affirmation régionale débattue que les moyennes nationales ne peuvent trancher ; les tables de mortalité infranationales et les âges validés sont la prochaine étape.",
      ] },
    ],
    figure: "Espérance de vie mondiale à la naissance, 1950–2023, avec l'espérance de vie féminine record, à côté des dix pays ayant la plus haute espérance de vie en bonne santé en 2023 et de leurs intervalles d'incertitude OMS à 95 %.",
  },
  it: {
    title: "Dove si vive più a lungo e più in salute, e le zone blu reggono alla validazione delle età? Speranza di vita, speranza di vita in buona salute e limiti dei dati nazionali",
    abstract: "Con i World Population Prospects 2024 dell'ONU, il Global Health Observatory dell'OMS e gli indicatori della Banca mondiale per tutti i 237 paesi e territori, descriviamo la speranza di vita e la speranza di vita in buona salute (HALE) nel 2023. La speranza di vita mondiale era di 73,2 anni (46,4 nel 1950); l'OMS stima la HALE in 62,8 anni (intervallo di incertezza al 95% 57,9–67,4), lasciando 10,5 anni vissuti in salute non piena. Singapore ha la HALE più alta (72,9), ma i nove paesi successivi si sovrappongono al suo intervallo: la cima della classifica è un pareggio. Gli anni in salute non piena crescono con la speranza di vita (r = 0,87), da 7,0 in Somalia a 13,9 negli Stati Uniti. In scala logaritmica il PIL pro capite spiega il 69% della variazione della HALE in 179 paesi; la spesa sanitaria in quota di PIL ne spiega il 5%. La speranza di vita femminile record è salita di 2,5 mesi l'anno dal 1950 al 2023. Le zone blu sono aree piccole misurate su coorti antiche; se le loro età siano reali è controverso (Newman 2024; Austad e Pes 2025) e non si può verificare con medie nazionali.",
    keywords: ["speranza di vita", "speranza di vita in buona salute", "HALE", "centenari", "zone blu", "validazione delle età", "curva di Preston", "ONU WPP 2024"],
    sections: [
      { h: "Introduzione", p: [
        "La speranza di vita alla nascita riassume i tassi di mortalità di un anno; la speranza di vita in buona salute (HALE) sottrae gli anni vissuti con malattia o disabilità. Entrambe crescono da quasi due secoli: Oeppen e Vaupel (2002) mostrarono che la speranza di vita femminile record è aumentata in modo quasi lineare per 160 anni, superando ogni tetto proposto. Preston (1975) descrisse una speranza di vita che sale rapidamente con il reddito nei paesi poveri e si appiattisce in quelli ricchi.",
        "Le zone blu sono una risposta popolare alla domanda su dove si viva più a lungo: piccole aree di Sardegna, Okinawa, Nicoya e Icaria dove i demografi hanno segnalato molte persone molto anziane (Poulain et al. 2004; Poulain, Herm e Pes 2013). Le loro età sono state di recente contestate (Newman 2024) e difese (Austad e Pes 2025). Questo studio chiede dove si viva più a lungo e più in salute a livello di paese, e che cosa i dati nazionali possano o non possano dire sulle zone blu.",
      ] },
      { h: "Dati e metodi", p: [
        "Speranza di vita (totale e per sesso), popolazione e popolazione di 100 anni o più sono stime della variante media ONU WPP 2024 per il 1950–2023, per tutti i 237 paesi e territori. La HALE e la speranza di vita dell'OMS per il 2023, con intervalli di incertezza al 95%, provengono dall'API OData del GHO dell'OMS (185 paesi); gli anni in salute non piena sono la speranza di vita OMS meno la HALE, quindi entrambi i termini vengono da un unico modello. Regioni della Banca mondiale, PIL pro capite (PPA, dollari costanti 2021) e spesa sanitaria corrente (% del PIL) sono del 2023 o dell'ultimo anno precedente. La compilazione in DuckDB si ferma se la speranza di vita mondiale non coincide con i dati pubblicati del WPP (73,2 nel 2023, 73,3 nel 2024) e se HALE e speranza di vita mondiali non coincidono con l'OMS (62,8 e 73,3).",
        "Le regioni sono ponderate per popolazione. La retta di Preston è una regressione ai minimi quadrati ordinari della HALE sul log10 del PIL pro capite. La speranza di vita femminile record è il valore più alto tra i paesi con almeno un milione di abitanti ogni anno; la sua tendenza esclude il 2020–2022. I tassi di centenari sono attenuati per i luoghi con meno di un milione di abitanti. Le misure delle zone blu sono trascritte solo dagli articoli citati.",
      ] },
      { h: "Risultati", p: [
        "La speranza di vita mondiale è passata da 46,4 anni nel 1950 a 73,2 nel 2023, dopo essere scesa da 72,6 nel 2019 a 70,9 nel 2021. Le donne vivono più degli uomini in tutti i paesi, di 5,3 anni nel mondo, da 0,4 anni in Togo a 13,3 in Ucraina. La speranza di vita femminile record è salita di 2,5 mesi l'anno (R² 0,989), da 73,3 in Norvegia nel 1950 a 88,1 a Hong Kong nel 2023.",
        "Singapore (72,9), Giappone (72,2) e Corea del Sud (72,0) hanno la HALE più alta, ma gli intervalli OMS dei nove paesi dopo Singapore si sovrappongono al suo (69,3–76,1). Nel mondo 10,5 anni su 73,3 si vivono in salute non piena; tra i paesi si va da 7,0 anni in Somalia a 13,9 negli Stati Uniti, e il valore cresce con la speranza di vita (r = 0,87). Un reddito dieci volte più alto va con 9,4 anni in salute in più (R² 0,69); gli Stati Uniti sono 5,1 anni sotto la retta, il Messico 1,5 sotto, il Giappone 4,4 sopra e il Costa Rica 1,7 sopra. La spesa sanitaria in quota di PIL spiega solo il 5% della variazione.",
        "L'ONU stima 549.771 persone di 100 anni o più nel 2023, 3,4 volte le 161.709 del 2000; il solo Giappone ne conta circa 120.000, 96,5 ogni 100.000 abitanti.",
      ] },
      { h: "Discussione", p: [
        "Vivere più a lungo porta anni sani e anche anni di malattia, e la cima della classifica HALE è statisticamente indistinguibile. Il reddito spiega gran parte della variazione tra paesi, ma residui grandi, come quello degli Stati Uniti, indicano fattori che il reddito nazionale non coglie.",
        "Le prove sulle zone blu sono regionali e riguardano coorti nate tra il 1880 e il 1919. Nei confronti originali la sopravvivenza dai 60 ai 90 anni era chiaramente più alta nelle zone di Sardegna e Okinawa che nelle popolazioni di riferimento, più debole a Icaria e non dimostrabile per Nicoya con i censimenti, anche se un follow-up di anziani costaricani ha trovato una mortalità più bassa del 20% negli uomini di Nicoya (Poulain, Herm e Pes 2013; Rosero-Bixby, Dow e Rehkopf 2013). Newman (2024) sostiene che le età eccezionali seguono registri anagrafici carenti e povertà relativa; Austad e Pes (2025) rispondono che le età delle zone blu sono state validate con più documenti indipendenti. I dati nazionali qui non confermano né smentiscono nessuna delle due parti.",
      ] },
      { h: "Limiti", p: [
        "Tutti i valori sono stime modellate. Le speranze di vita di ONU e OMS differiscono in media di 1,4 anni, quindi la HALE si confronta solo con il dato OMS. I centenari sono stime di una classe d'età aperta, non persone registrate. PIL e spesa sanitaria mancano per alcuni territori, e le associazioni tra paesi non dicono nulla di cause o individui.",
      ] },
      { h: "Conclusione", p: [
        "Si vive più a lungo in buona salute in un gruppo di paesi ad alto reddito dell'Asia orientale e dell'Europa il cui ordine non si può separare. Circa un anno su sette si vive in salute non piena. Le zone blu restano un'affermazione regionale dibattuta che le medie nazionali non possono risolvere; tavole di mortalità subnazionali e registri di età validati sono il passo successivo.",
      ] },
    ],
    figure: "Speranza di vita mondiale alla nascita, 1950–2023, con la speranza di vita femminile record, accanto ai dieci paesi con la speranza di vita in buona salute più alta nel 2023 e ai loro intervalli di incertezza OMS al 95%.",
  },
  ja: {
    title: "最も長く健康に生きられるのはどこか、そしてブルーゾーンは年齢の検証に耐えるか：平均寿命、健康寿命、国別データの限界",
    abstract: "国連の世界人口推計2024、WHOのGlobal Health Observatory、世界銀行の指標を用いて、237のすべての国・地域について2023年の平均寿命と健康寿命（HALE）を記述した。世界の平均寿命は73.2年（1950年は46.4年）、WHOの健康寿命は62.8年（95%不確実性区間57.9–67.4）で、10.5年は健康でない状態で過ごす。健康寿命が最も長いのはシンガポール（72.9年）だが、続く9か国すべてがその区間と重なり、上位は横並びである。健康でない期間は平均寿命とともに長くなり（r = 0.87）、ソマリアの7.0年から米国の13.9年まで幅がある。対数目盛では1人あたりGDPが179か国の健康寿命の変動の69%を説明し、GDPに占める保健支出は5%しか説明しない。女性の平均寿命の最高記録は1950–2023年に年2.5か月伸びた。ブルーゾーンは古いコホートで測られた小さな地域であり、年齢が本物かどうかは議論が分かれ（Newman 2024、Austad & Pes 2025）、国の平均では検証できない。",
    keywords: ["平均寿命", "健康寿命", "HALE", "100歳以上", "ブルーゾーン", "年齢の検証", "プレストン曲線", "国連WPP 2024"],
    sections: [
      { h: "はじめに", p: [
        "出生時の平均寿命はある1年の死亡率を要約したもので、健康寿命（HALE）は病気や障害とともに過ごす年数を差し引いたものである。どちらも約2世紀にわたって伸びてきた。Oeppen & Vaupel（2002）は、女性の平均寿命の最高記録が160年間ほぼ直線的に伸び、提案されたすべての上限を超えたことを示した。Preston（1975）は、貧しい国では所得とともに平均寿命が急速に伸び、豊かな国では頭打ちになると述べた。",
        "最も長生きする場所としてよく挙げられるのがブルーゾーンである。サルデーニャ、沖縄、ニコヤ、イカリアの小さな地域で、人口学者が非常に高齢の人が多いと報告した（Poulain et al. 2004、Poulain, Herm & Pes 2013）。その年齢は近年、疑問視され（Newman 2024）、また擁護されている（Austad & Pes 2025）。本研究は、国の単位で最も長く健康に生きられるのはどこか、そして国のデータでブルーゾーンについて何が言え、何が言えないかを問う。",
      ] },
      { h: "データと方法", p: [
        "平均寿命（男女計・男女別）、人口、100歳以上の人口は、237の国・地域についての国連WPP 2024中位推計（1950–2023年）である。2023年の健康寿命とWHO自身の平均寿命（95%不確実性区間付き）はWHO GHOのOData API（185か国）から取得した。健康でない期間はWHOの平均寿命から健康寿命を引いたもので、両方の項が一つのモデルから得られる。世界銀行の地域区分、1人あたりGDP（購買力平価、2021年固定ドル）、経常保健支出（GDP比）は2023年またはそれ以前の最新年の値を用いた。DuckDBのビルドは、世界の平均寿命がWPPの公表値（2023年73.2、2024年73.3）と、世界の健康寿命と平均寿命がWHOの値（62.8と73.3）と一致しない場合に停止する。",
        "地域は人口で加重した。プレストン線は健康寿命を1人あたりGDPの常用対数に回帰した最小二乗法の直線である。女性の平均寿命の最高記録は、各年に人口100万人以上の国の中で最も高い値で、その傾向は2020–2022年を除いて推定した。人口100万人未満の地域の100歳以上の率は薄く表示した。ブルーゾーンの指標は引用論文からのみ転記した。",
      ] },
      { h: "結果", p: [
        "世界の平均寿命は1950年の46.4年から2023年の73.2年に伸びた。その間、2019年の72.6年から2021年には70.9年に下がった。すべての国で女性のほうが男性より長生きで、差は世界全体で5.3年、トーゴの0.4年からウクライナの13.3年まである。女性の平均寿命の最高記録は年2.5か月伸び（R² 0.989）、1950年のノルウェーの73.3年から2023年の香港の88.1年になった。",
        "健康寿命が最も長いのはシンガポール（72.9）、日本（72.2）、韓国（72.0）だが、シンガポールに続く9か国のWHO区間はすべてシンガポールの区間（69.3–76.1）と重なる。世界全体では73.3年のうち10.5年が健康でない状態で、国別ではソマリアの7.0年から米国の13.9年まであり、平均寿命とともに長くなる（r = 0.87）。所得が10倍になると健康寿命は9.4年長い（R² 0.69）。米国は回帰線より5.1年下、メキシコは1.5年下、日本は4.4年上、コスタリカは1.7年上にある。GDPに占める保健支出は変動の5%しか説明しない。",
        "国連は2023年の100歳以上の人を549,771人と推計しており、2000年の161,709人の3.4倍である。日本だけで約12万人、10万人あたり96.5人である。",
      ] },
      { h: "考察", p: [
        "長生きは健康な年と健康でない年の両方をもたらし、健康寿命の最上位は統計的に区別できない。国による違いの大部分は所得で説明されるが、米国のような大きな残差は、国民所得では捉えられない要因を示している。",
        "ブルーゾーンの証拠は地域単位で、1880–1919年ごろに生まれたコホートに関するものである。元の比較では、60代から90代への生存率はサルデーニャと沖縄のゾーンで比較対象より明らかに高く、イカリアでは弱く、ニコヤでは国勢調査データで示せなかった。ただし高齢のコスタリカ人の追跡では、ニコヤの男性の死亡率が20%低かった（Poulain, Herm & Pes 2013、Rosero-Bixby, Dow & Rehkopf 2013）。Newman（2024）は並外れた高齢が不十分な住民登録と相対的な貧困に伴うと主張し、Austad & Pes（2025）はブルーゾーンの年齢が複数の独立した文書で検証されたと反論する。ここでの国の数値は、どちらの主張も裏付けも否定もしない。",
      ] },
      { h: "限界", p: [
        "すべての値はモデル推計である。国連とWHOの平均寿命は平均1.4年異なるため、健康寿命はWHO自身の数値とのみ比較した。100歳以上の人数は開いた年齢階級の推計で、登録された人数ではない。一部の地域ではGDPと保健支出が欠けており、国どうしの関連は原因や個人について何も示さない。",
      ] },
      { h: "結論", p: [
        "健康なまま最も長く生きられるのは東アジアと欧州の高所得国のグループで、その順位は区別できない。およそ7年に1年は健康でない状態で過ごす。ブルーゾーンは国の平均では決着のつかない、議論の続く地域的な主張である。次の段階は地方別の生命表と検証済みの年齢記録である。",
      ] },
    ],
    figure: "1950–2023年の世界の出生時平均寿命と女性の平均寿命の最高記録、および2023年に健康寿命が最も長い10か国とそのWHO 95%不確実性区間。",
  },
  zh: {
    title: "哪里的人活得最久、最健康？蓝区经得起年龄验证吗？预期寿命、健康预期寿命与国家数据的局限",
    abstract: "我们利用联合国《世界人口展望2024》、世卫组织全球卫生观察站和世界银行指标，描述了全部237个国家和地区2023年的预期寿命和健康预期寿命（HALE）。世界预期寿命为73.2岁（1950年为46.4岁）；世卫组织估计HALE为62.8岁（95%不确定区间57.9–67.4），即有10.5年处于非完全健康状态。新加坡的HALE最高（72.9岁），但其后九个国家都与其区间重叠，因此榜首是并列。非完全健康的年数随预期寿命增加（r = 0.87），从索马里的7.0年到美国的13.9年。在对数刻度上，人均GDP解释了179个国家HALE差异的69%；卫生支出占GDP比重只解释5%。1950–2023年，女性预期寿命最高纪录每年上升2.5个月。蓝区是以较早出生队列测量的小区域；其年龄是否真实存在争议（Newman 2024；Austad和Pes 2025），无法用国家平均值检验。",
    keywords: ["预期寿命", "健康预期寿命", "HALE", "百岁老人", "蓝区", "年龄验证", "普雷斯顿曲线", "联合国WPP 2024"],
    sections: [
      { h: "引言", p: [
        "出生时预期寿命概括了某一年的死亡率；健康预期寿命（HALE）则扣除了伴随疾病或残疾的年数。两者在近两个世纪里都在上升：Oeppen和Vaupel（2002）表明，女性预期寿命最高纪录在160年间几乎直线上升，突破了所有被提出的上限。Preston（1975）描述了预期寿命在贫穷国家随收入迅速上升、在富裕国家趋于平缓的规律。",
        "关于哪里的人最长寿，蓝区是一个流行的答案：撒丁岛、冲绳、尼科亚和伊卡利亚的一些小区域，人口学家报告那里有很多高龄老人（Poulain等 2004；Poulain、Herm和Pes 2013）。这些年龄最近受到质疑（Newman 2024）并得到辩护（Austad和Pes 2025）。本研究探讨在国家层面上哪里的人活得最久、最健康，以及国家数据关于蓝区能说明什么、不能说明什么。",
      ] },
      { h: "数据与方法", p: [
        "预期寿命（总体和分性别）、人口和百岁及以上人口来自联合国WPP 2024中方案1950–2023年估计，覆盖全部237个国家和地区。2023年HALE和世卫组织自身的预期寿命（附95%不确定区间）来自世卫组织GHO OData API（185个国家）；非完全健康年数为世卫组织预期寿命减HALE，两项来自同一模型。世界银行地区、人均GDP（购买力平价，2021年不变美元）和经常性卫生支出（占GDP %）取2023年或此前最近一年。若世界预期寿命与WPP公布值（2023年73.2、2024年73.3）不符，或全球HALE和预期寿命与世卫组织数值（62.8和73.3）不符，DuckDB构建即停止。",
        "地区数值按人口加权。普雷斯顿线是HALE对人均GDP常用对数的普通最小二乘拟合。女性预期寿命最高纪录为每年人口至少一百万的国家中的最高值，其趋势不含2020–2022年。人口不足一百万的地方的百岁老人比率淡化显示。蓝区指标仅转录自所引论文。",
      ] },
      { h: "结果", p: [
        "世界预期寿命从1950年的46.4岁升至2023年的73.2岁，期间从2019年的72.6岁降到2021年的70.9岁。所有国家的女性都比男性长寿，全球相差5.3年，从多哥的0.4年到乌克兰的13.3年。女性预期寿命最高纪录每年上升2.5个月（R² 0.989），从1950年挪威的73.3岁升至2023年香港的88.1岁。",
        "新加坡（72.9）、日本（72.2）和韩国（72.0）的HALE最高，但新加坡之后九个国家的世卫组织区间都与新加坡的区间（69.3–76.1）重叠。全球73.3年中有10.5年处于非完全健康状态；各国从索马里的7.0年到美国的13.9年，并随预期寿命增加（r = 0.87）。收入增加十倍，健康年数多9.4年（R² 0.69）；美国低于回归线5.1年，墨西哥低1.5年，日本高4.4年，哥斯达黎加高1.7年。卫生支出占GDP比重只解释了5%的差异。",
        "联合国估计2023年全球有549,771名百岁及以上老人，是2000年161,709人的3.4倍；仅日本就有约12万人，每10万人96.5人。",
      ] },
      { h: "讨论", p: [
        "寿命更长既带来健康的年份，也带来不健康的年份，而HALE排名的最前列在统计上无法区分。收入解释了国家间的大部分差异，但像美国这样的大残差表明存在国民收入无法反映的因素。",
        "蓝区的证据是区域性的，涉及1880–1919年前后出生的队列。在原始比较中，从60多岁到90多岁的存活率在撒丁岛和冲绳蓝区明显高于其对照人群，在伊卡利亚较弱，在尼科亚无法用普查数据证明，不过对哥斯达黎加老人的随访发现尼科亚男性死亡率低20%（Poulain、Herm和Pes 2013；Rosero-Bixby、Dow和Rehkopf 2013）。Newman（2024）认为非凡的高龄与薄弱的人口登记和相对贫困相伴；Austad和Pes（2025）回应称蓝区的年龄经过多份独立文件验证。这里的国家数据既不能证实也不能否定任何一方。",
      ] },
      { h: "局限", p: [
        "所有数值都是模型估计。联合国和世卫组织的预期寿命平均相差1.4年，因此HALE只与世卫组织自己的数值比较。百岁老人是开放年龄组的估计，不是登记人数。部分地区缺少GDP和卫生支出数据，国家之间的关联不能说明原因或个人情况。",
      ] },
      { h: "结论", p: [
        "健康地活得最久的是东亚和欧洲一组高收入国家，其先后无法区分。大约每七年中有一年处于非完全健康状态。蓝区仍是一个有争议的区域性论断，国家平均值无法定论；下一步需要次国家级生命表和经过验证的年龄记录。",
      ] },
    ],
    figure: "1950–2023年世界出生时预期寿命及女性预期寿命最高纪录，旁边是2023年健康预期寿命最高的十个国家及其世卫组织95%不确定区间。",
  },
};
