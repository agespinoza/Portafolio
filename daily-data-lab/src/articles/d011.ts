import type { ArticleSet } from "./types";

// Figures from data/day-011-spices/day-011.json (FAOSTAT QCL, TCL and Detailed trade matrix bulk files, World Bank WDI,
// UN M49; downloaded 2026-11-28), recomputed by scripts/day-011/snapshot.mjs. Literature claims follow the abstracts (or,
// where noted, the open working-paper text) of the references in src/days/day-011-spices/Research.tsx; historical
// numbers appear only where a reference gives them.
export const D011: ArticleSet = {
  en: {
    title: "Who grows and buys the world's spices, how concentrated is supply, and how does today's map compare with the old Spice Route? Eight FAOSTAT spice groups, 1961–2024",
    abstract: "Using FAOSTAT production, trade and bilateral trade-matrix data for eight spice groups in 210 countries and areas from 1961 to 2024, we describe where spices are grown and traded, how concentrated supply is, and what a kilogram is worth, and set the present map beside eight cited moments of the historic Spice Route. In 2024 the eight groups totalled 14.6 million tonnes and US$12.3 billion of exports. By the 2010 US merger-guideline bands, seven of the eight are highly concentrated (HHI above 2,500); black pepper is the exception (1,378). Pepper's core has moved from India, Malaysia and Indonesia (79.4% of world output in 1961) to Viet Nam, India and Brazil (55.0%). World vanilla exports were 146% of world production, a sign of re-exports, and Mexico, vanilla's homeland, grew 7.2% of the world's vanilla but reported only 11.8 t of exports.",
    keywords: ["spice trade", "FAOSTAT", "black pepper", "vanilla", "market concentration", "HHI", "Spice Route", "economic history", "Mexico"],
    sections: [
      { h: "Introduction", p: [
        "Spices were the high-value goods of early long-distance trade. O'Rourke and Williamson (2009), comparing pepper and fine-spice prices relative to inflation before and after 1503, found that the Voyages of Discovery had a major impact on European spice markets; Bulbeck et al. (1998) compiled the long export series that make cloves and pepper the backbone of Southeast Asia's precolonial trade; Miske (2025) describes the Dutch East India Company's 1621 conquest of the Banda Islands to control nutmeg and mace.",
        "This study asks who grows and buys spices today, how concentrated supply is, and how the present map compares with that history, with black pepper and Mexico's vanilla as close-ups.",
      ] },
      { h: "Data and methods", p: [
        "FAOSTAT bulk files (Crops and livestock products, Trade, and the Detailed trade matrix; CC BY 4.0) were filtered with DuckDB to eight items: pepper (Piper spp.), dry chillies and peppers, ginger, seed spices (anise, badian, coriander, cumin, caraway, fennel, juniper), nutmeg, mace and cardamoms, cinnamon, cloves and vanilla. Countries were joined through UN M49 codes to ISO3 and to World Bank regions, capitals and population; FAOSTAT's 'China' aggregate was dropped because it repeats mainland China, Hong Kong, Macao and Taiwan. For every spice, the 2024 sum of countries equals FAOSTAT's World row within 0.5%.",
        "Concentration is the Herfindahl–Hirschman index of production shares (0–10,000), read with the 2010 US merger-guideline bands. Unit values are world export value divided by export tonnes, in current dollars. Bilateral flows are importer reports for 2000, 2010 and 2024; they cover 64.7–98.4% of world import value by spice in 2024. Historical events were kept only when a verified reference states them.",
      ] },
      { h: "Results", p: [
        "In 2024 India grew 53.3% of dry chillies, 78.9% of seed spices and 47.7% of ginger; Indonesia 74.4% of cloves; Madagascar 43.4% of vanilla; Viet Nam 28.1% of black pepper. Seven groups have an HHI above 2,500, led by seed spices (6,267) and cloves (5,734). Concentration rose since 1961 for seed spices (3,224), cloves (3,375), chillies (1,780), ginger (2,480) and nutmeg and cardamom (1,887), and fell for pepper (2,422), cinnamon (3,470) and vanilla (3,158).",
        "Pepper output grew 9.4-fold against its 1961–63 mean; Viet Nam went from 450 t in 1961 to 262,230 t and exported US$1.01 billion. Cloves came 73.8% from Madagascar and Tanzania in 1961 and are now concentrated in Indonesia, which also imports them; India is the largest clove buyer (34.1% of world import value).",
        "World vanilla exports were 10,362 t against 7,115 t of production. Its export unit value rose from 12.0 US$/kg in 1961 to 216.9 in 2018 and stood at 44.6 in 2024, about 16 times that of dry chillies. Mexico grew 510 t (7.2%, third), against 16.8% in 1961, and reported 11.8 t of exports, down from 137.3 t in 2000. World exports and imports of the same spice differ by −6.3% to +8.7% in tonnes.",
      ] },
      { h: "Discussion", p: [
        "The centre of the spice economy has shifted rather than vanished: Asia still dominates, but new growers (Viet Nam for pepper, Guatemala in the cardamom group, Madagascar for vanilla) hold the largest shares, and in several spices one country grows half or more. Trade statistics also count re-exporters: countries that clean, grade or pack spices sell more vanilla than the world grows, which is why reconciled datasets such as BACI (Gaulier and Zignago 2010) adjust mirror flows.",
        "Mexico's position is a hypothesis to explore, not a finding: its late-nineteenth-century vanilla boom transformed Papantla (Kourí 2004), while today it grows a small share and exports little; domestic use and prices may matter, but FAOSTAT cannot separate them.",
      ] },
      { h: "Limitations", p: [
        "FAOSTAT covers raw spices only; ground and processed products are separate items. In 2024, 34.2% of spice tonnes were FAO estimates or imputations (vanilla 71%, cinnamon 69%), including Burkina Faso's pepper and Guatemala's cardamom. Some groups mix different plants (nutmeg with cardamom; cassia with cinnamon). Unit values mix grades and are not deflated. Flows rely on importer reports. Historical routes are schematic, and the Poivre transplant to Mauritius was omitted for lack of an accessible source.",
      ] },
      { h: "Conclusion", p: [
        "Spice supply today is highly concentrated in a few countries, mostly in Asia, but not in the places that defined the historic Spice Route: pepper has moved to Viet Nam and Brazil, cloves to Indonesia, vanilla to Madagascar. Black pepper is the one group whose supply has become less concentrated since 1961, and Mexico, where vanilla comes from, now plays a minor part in its trade.",
      ] },
    ],
    figure: "World production of black pepper since 1961 and the four largest growers in 2024 (FAOSTAT), next to the concentration of supply (HHI of production shares) for the eight spice groups in 2024.",
  },
  es: {
    title: "¿Quién cultiva y compra las especias del mundo, qué tan concentrada está la oferta y cómo se compara el mapa actual con la antigua ruta de las especias? Ocho grupos de especias de FAOSTAT, 1961–2024",
    abstract: "Con datos de producción, comercio y matriz bilateral de comercio de FAOSTAT para ocho grupos de especias en 210 países y áreas de 1961 a 2024, describimos dónde se cultivan y comercian las especias, qué tan concentrada está la oferta y cuánto vale un kilogramo, y ponemos el mapa actual junto a ocho momentos citados de la ruta histórica de las especias. En 2024 los ocho grupos sumaron 14.6 millones de toneladas y 12,300 millones de dólares de exportaciones. Según los umbrales de las guías de fusiones de EE. UU. de 2010, siete de los ocho están muy concentrados (IHH arriba de 2,500); la excepción es la pimienta negra (1,378). El núcleo de la pimienta pasó de India, Malasia e Indonesia (79.4% de la producción mundial en 1961) a Vietnam, India y Brasil (55.0%). Las exportaciones mundiales de vainilla fueron el 146% de la producción mundial, señal de reexportaciones, y México, tierra de la vainilla, cultivó el 7.2% de la vainilla del mundo pero reportó solo 11.8 t de exportaciones.",
    keywords: ["comercio de especias", "FAOSTAT", "pimienta negra", "vainilla", "concentración de mercado", "IHH", "ruta de las especias", "historia económica", "México"],
    sections: [
      { h: "Introducción", p: [
        "Las especias fueron las mercancías de alto valor del comercio de larga distancia temprano. O'Rourke y Williamson (2009), al comparar los precios de la pimienta y las especias finas en relación con la inflación antes y después de 1503, concluyeron que los viajes de descubrimiento tuvieron un gran impacto en los mercados europeos de especias; Bulbeck et al. (1998) reunieron las largas series de exportación que hacen del clavo y la pimienta la columna del comercio precolonial del Sudeste Asiático; Miske (2025) describe la conquista de las islas Banda por la Compañía Neerlandesa de las Indias Orientales en 1621 para controlar la nuez moscada y el macis.",
        "Este estudio pregunta quién cultiva y compra especias hoy, qué tan concentrada está la oferta y cómo se compara el mapa actual con esa historia, con acercamientos a la pimienta negra y a la vainilla de México.",
      ] },
      { h: "Datos y métodos", p: [
        "Los archivos masivos de FAOSTAT (cultivos y productos de ganadería, comercio y matriz detallada de comercio; CC BY 4.0) se filtraron con DuckDB a ocho productos: pimienta (Piper spp.), chiles y pimientos secos, jengibre, especias de semilla (anís, badiana, cilantro, comino, alcaravea, hinojo, enebro), nuez moscada, macis y cardamomo, canela, clavo y vainilla. Los países se unieron mediante los códigos M49 de la ONU a ISO3 y a las regiones, capitales y población del Banco Mundial; se excluyó el agregado «China» de FAOSTAT porque repite China continental, Hong Kong, Macao y Taiwán. Para cada especia, la suma de los países en 2024 coincide con la fila Mundo de FAOSTAT con un margen de 0.5%.",
        "La concentración es el índice de Herfindahl–Hirschman de las participaciones en la producción (0–10,000), leído con los umbrales de las guías de fusiones de EE. UU. de 2010. Los valores unitarios son el valor mundial exportado entre las toneladas exportadas, en dólares corrientes. Los flujos bilaterales son reportes de los importadores para 2000, 2010 y 2024; en 2024 cubren entre 64.7 y 98.4% del valor mundial importado según la especia. Los hechos históricos se conservaron solo cuando una referencia verificada los afirma.",
      ] },
      { h: "Resultados", p: [
        "En 2024 India cultivó el 53.3% del chile seco, el 78.9% de las especias de semilla y el 47.7% del jengibre; Indonesia el 74.4% del clavo; Madagascar el 43.4% de la vainilla; Vietnam el 28.1% de la pimienta negra. Siete grupos tienen un IHH arriba de 2,500, encabezados por las especias de semilla (6,267) y el clavo (5,734). La concentración aumentó desde 1961 en las especias de semilla (3,224), el clavo (3,375), el chile (1,780), el jengibre (2,480) y la nuez moscada con cardamomo (1,887), y bajó en la pimienta (2,422), la canela (3,470) y la vainilla (3,158).",
        "La producción de pimienta se multiplicó por 9.4 frente a su promedio de 1961–63; Vietnam pasó de 450 t en 1961 a 262,230 t y exportó 1,010 millones de dólares. El clavo venía en un 73.8% de Madagascar y Tanzania en 1961 y hoy se concentra en Indonesia, que además lo importa; India es el mayor comprador de clavo (34.1% del valor mundial importado).",
        "Las exportaciones mundiales de vainilla fueron 10,362 t frente a 7,115 t de producción. Su valor unitario de exportación subió de 12.0 US$/kg en 1961 a 216.9 en 2018 y fue de 44.6 en 2024, unas 16 veces el del chile seco. México cultivó 510 t (7.2%, tercero), frente al 16.8% en 1961, y reportó 11.8 t de exportaciones, frente a 137.3 t en 2000. Las exportaciones y las importaciones mundiales de una misma especia difieren entre −6.3% y +8.7% en toneladas.",
      ] },
      { h: "Discusión", p: [
        "El centro de la economía de las especias se movió, no desapareció: Asia sigue dominando, pero nuevos productores (Vietnam en la pimienta, Guatemala en el grupo del cardamomo, Madagascar en la vainilla) tienen las mayores participaciones, y en varias especias un solo país cultiva la mitad o más. Las estadísticas de comercio también cuentan a los reexportadores: los países que limpian, clasifican o empacan especias venden más vainilla de la que el mundo cultiva, por eso bases conciliadas como BACI (Gaulier y Zignago 2010) ajustan los flujos espejo.",
        "La posición de México es una hipótesis para explorar, no un hallazgo: su auge vainillero de fines del siglo XIX transformó Papantla (Kourí 2004), mientras que hoy cultiva una parte pequeña y exporta poco; el consumo interno y los precios pueden influir, pero FAOSTAT no permite separarlos.",
      ] },
      { h: "Limitaciones", p: [
        "FAOSTAT cubre solo especias en bruto; los productos molidos y procesados son productos aparte. En 2024, el 34.2% de las toneladas de especias fueron estimaciones o imputaciones de la FAO (vainilla 71%, canela 69%), incluidas la pimienta de Burkina Faso y el cardamomo de Guatemala. Algunos grupos mezclan plantas distintas (nuez moscada con cardamomo; casia con canela). Los valores unitarios mezclan calidades y no se deflactan. Los flujos dependen de los reportes de los importadores. Las rutas históricas son esquemáticas y se omitió el trasplante de Poivre a Mauricio por falta de una fuente accesible.",
      ] },
      { h: "Conclusión", p: [
        "La oferta de especias está hoy muy concentrada en pocos países, sobre todo de Asia, pero no en los lugares que definieron la ruta histórica: la pimienta se mudó a Vietnam y Brasil, el clavo a Indonesia y la vainilla a Madagascar. La pimienta negra es el único grupo cuya oferta se volvió menos concentrada desde 1961, y México, de donde viene la vainilla, tiene hoy un papel menor en su comercio.",
      ] },
    ],
    figure: "Producción mundial de pimienta negra desde 1961 y los cuatro mayores productores en 2024 (FAOSTAT), junto a la concentración de la oferta (IHH de las participaciones en la producción) de los ocho grupos de especias en 2024.",
  },
  pt: {
    title: "Quem cultiva e compra as especiarias do mundo, quão concentrada é a oferta e como o mapa atual se compara à antiga rota das especiarias? Oito grupos de especiarias da FAOSTAT, 1961–2024",
    abstract: "Com dados de produção, comércio e matriz bilateral de comércio da FAOSTAT para oito grupos de especiarias em 210 países e áreas de 1961 a 2024, descrevemos onde as especiarias são cultivadas e comercializadas, quão concentrada é a oferta e quanto vale um quilo, e colocamos o mapa atual ao lado de oito momentos citados da rota histórica das especiarias. Em 2024 os oito grupos somaram 14,6 milhões de toneladas e US$ 12,3 bilhões em exportações. Pelos limites das diretrizes de fusões dos EUA de 2010, sete dos oito são altamente concentrados (IHH acima de 2.500); a exceção é a pimenta-do-reino (1.378). O núcleo da pimenta passou de Índia, Malásia e Indonésia (79,4% da produção mundial em 1961) para Vietnã, Índia e Brasil (55,0%). As exportações mundiais de baunilha foram 146% da produção mundial, sinal de reexportações, e o México, terra da baunilha, cultivou 7,2% da baunilha do mundo mas declarou apenas 11,8 t de exportações.",
    keywords: ["comércio de especiarias", "FAOSTAT", "pimenta-do-reino", "baunilha", "concentração de mercado", "IHH", "rota das especiarias", "história econômica", "México"],
    sections: [
      { h: "Introdução", p: [
        "As especiarias foram as mercadorias de alto valor do comércio de longa distância. O'Rourke e Williamson (2009), comparando os preços da pimenta e das especiarias finas em relação à inflação antes e depois de 1503, concluíram que as viagens de descobrimento tiveram grande impacto nos mercados europeus de especiarias; Bulbeck et al. (1998) reuniram as longas séries de exportação que fazem do cravo e da pimenta a espinha dorsal do comércio pré-colonial do Sudeste Asiático; Miske (2025) descreve a conquista das ilhas Banda pela Companhia Holandesa das Índias Orientais em 1621 para controlar a noz-moscada e o macis.",
        "Este estudo pergunta quem cultiva e compra especiarias hoje, quão concentrada é a oferta e como o mapa atual se compara a essa história, com destaque para a pimenta-do-reino e a baunilha do México.",
      ] },
      { h: "Dados e métodos", p: [
        "Os arquivos completos da FAOSTAT (lavouras e pecuária, comércio e matriz detalhada de comércio; CC BY 4.0) foram filtrados com DuckDB para oito produtos: pimenta (Piper spp.), pimentas secas, gengibre, especiarias em sementes (anis, anis-estrelado, coentro, cominho, alcaravia, funcho, zimbro), noz-moscada, macis e cardamomo, canela, cravo e baunilha. Os países foram ligados pelos códigos M49 da ONU ao ISO3 e às regiões, capitais e população do Banco Mundial; o agregado «China» da FAOSTAT foi excluído porque repete China continental, Hong Kong, Macau e Taiwan. Para cada especiaria, a soma dos países em 2024 coincide com a linha Mundo da FAOSTAT com margem de 0,5%.",
        "A concentração é o índice de Herfindahl–Hirschman das participações na produção (0–10.000), lido com os limites das diretrizes de fusões dos EUA de 2010. Valores unitários são o valor mundial exportado dividido pelas toneladas exportadas, em dólares correntes. Os fluxos bilaterais são declarações dos importadores para 2000, 2010 e 2024; em 2024 cobrem de 64,7 a 98,4% do valor mundial importado conforme a especiaria. Eventos históricos foram mantidos apenas quando uma referência verificada os afirma.",
      ] },
      { h: "Resultados", p: [
        "Em 2024 a Índia cultivou 53,3% da pimenta seca, 78,9% das especiarias em sementes e 47,7% do gengibre; a Indonésia, 74,4% do cravo; Madagascar, 43,4% da baunilha; o Vietnã, 28,1% da pimenta-do-reino. Sete grupos têm IHH acima de 2.500, à frente as especiarias em sementes (6.267) e o cravo (5.734). A concentração subiu desde 1961 nas especiarias em sementes (3.224), no cravo (3.375), na pimenta seca (1.780), no gengibre (2.480) e na noz-moscada com cardamomo (1.887), e caiu na pimenta-do-reino (2.422), na canela (3.470) e na baunilha (3.158).",
        "A produção de pimenta-do-reino cresceu 9,4 vezes em relação à média de 1961–63; o Vietnã passou de 450 t em 1961 para 262.230 t e exportou US$ 1,01 bilhão. O cravo vinha 73,8% de Madagascar e da Tanzânia em 1961 e hoje se concentra na Indonésia, que também o importa; a Índia é a maior compradora de cravo (34,1% do valor mundial importado).",
        "As exportações mundiais de baunilha foram 10.362 t contra 7.115 t de produção. Seu valor unitário de exportação subiu de 12,0 US$/kg em 1961 para 216,9 em 2018 e foi de 44,6 em 2024, cerca de 16 vezes o da pimenta seca. O México cultivou 510 t (7,2%, terceiro), contra 16,8% em 1961, e declarou 11,8 t de exportações, ante 137,3 t em 2000. Exportações e importações mundiais da mesma especiaria diferem de −6,3% a +8,7% em toneladas.",
      ] },
      { h: "Discussão", p: [
        "O centro da economia das especiarias mudou de lugar, não desapareceu: a Ásia continua dominante, mas novos produtores (Vietnã na pimenta, Guatemala no grupo do cardamomo, Madagascar na baunilha) detêm as maiores participações, e em várias especiarias um único país cultiva metade ou mais. As estatísticas de comércio também contam os reexportadores: países que limpam, classificam ou embalam especiarias vendem mais baunilha do que o mundo cultiva, e por isso bases conciliadas como o BACI (Gaulier e Zignago 2010) ajustam os fluxos espelho.",
        "A posição do México é uma hipótese a explorar, não uma conclusão: seu boom da baunilha no fim do século XIX transformou Papantla (Kourí 2004), enquanto hoje cultiva uma parcela pequena e exporta pouco; consumo interno e preços podem pesar, mas a FAOSTAT não permite separá-los.",
      ] },
      { h: "Limitações", p: [
        "A FAOSTAT cobre apenas especiarias brutas; produtos moídos e processados são itens separados. Em 2024, 34,2% das toneladas de especiarias foram estimativas ou imputações da FAO (baunilha 71%, canela 69%), incluindo a pimenta de Burkina Faso e o cardamomo da Guatemala. Alguns grupos misturam plantas diferentes (noz-moscada com cardamomo; cássia com canela). Os valores unitários misturam qualidades e não são deflacionados. Os fluxos dependem das declarações dos importadores. As rotas históricas são esquemáticas, e o transplante de Poivre para Maurício foi omitido por falta de fonte acessível.",
      ] },
      { h: "Conclusão", p: [
        "A oferta de especiarias está hoje muito concentrada em poucos países, sobretudo na Ásia, mas não nos lugares que definiram a rota histórica: a pimenta foi para o Vietnã e o Brasil, o cravo para a Indonésia, a baunilha para Madagascar. A pimenta-do-reino é o único grupo cuja oferta ficou menos concentrada desde 1961, e o México, de onde vem a baunilha, tem hoje um papel menor no seu comércio.",
      ] },
    ],
    figure: "Produção mundial de pimenta-do-reino desde 1961 e os quatro maiores produtores em 2024 (FAOSTAT), ao lado da concentração da oferta (IHH das participações na produção) dos oito grupos de especiarias em 2024.",
  },
  fr: {
    title: "Qui cultive et achète les épices du monde, l'offre est-elle concentrée, et comment la carte actuelle se compare-t-elle à l'ancienne route des épices ? Huit groupes d'épices FAOSTAT, 1961–2024",
    abstract: "À partir des données FAOSTAT de production, de commerce et de matrice bilatérale du commerce pour huit groupes d'épices dans 210 pays et territoires de 1961 à 2024, nous décrivons où les épices sont cultivées et échangées, le degré de concentration de l'offre et la valeur d'un kilogramme, et plaçons la carte actuelle à côté de huit moments cités de la route historique des épices. En 2024, les huit groupes totalisent 14,6 millions de tonnes et 12,3 milliards de dollars d'exportations. Selon les seuils des lignes directrices américaines de 2010, sept des huit sont très concentrés (IHH supérieur à 2 500) ; le poivre noir fait exception (1 378). Le cœur du poivre est passé de l'Inde, la Malaisie et l'Indonésie (79,4 % de la production mondiale en 1961) au Viêt Nam, à l'Inde et au Brésil (55,0 %). Les exportations mondiales de vanille représentent 146 % de la production mondiale, signe de réexportations, et le Mexique, berceau de la vanille, en a cultivé 7,2 % mais n'a déclaré que 11,8 t d'exportations.",
    keywords: ["commerce des épices", "FAOSTAT", "poivre noir", "vanille", "concentration du marché", "IHH", "route des épices", "histoire économique", "Mexique"],
    sections: [
      { h: "Introduction", p: [
        "Les épices furent les marchandises de grande valeur du commerce lointain. O'Rourke et Williamson (2009), comparant les prix du poivre et des épices fines rapportés à l'inflation avant et après 1503, montrent que les voyages de découverte ont eu un fort impact sur les marchés européens des épices ; Bulbeck et al. (1998) ont compilé les longues séries d'exportation qui font du girofle et du poivre l'épine dorsale du commerce précolonial de l'Asie du Sud-Est ; Miske (2025) décrit la conquête des îles Banda par la Compagnie néerlandaise des Indes orientales en 1621 pour contrôler la muscade et le macis.",
        "Cette étude demande qui cultive et achète les épices aujourd'hui, à quel point l'offre est concentrée et comment la carte actuelle se compare à cette histoire, avec des gros plans sur le poivre noir et la vanille du Mexique.",
      ] },
      { h: "Données et méthodes", p: [
        "Les fichiers complets de FAOSTAT (cultures et élevage, commerce et matrice détaillée du commerce ; CC BY 4.0) ont été filtrés avec DuckDB sur huit produits : poivre (Piper spp.), piments secs, gingembre, épices en graines (anis, badiane, coriandre, cumin, carvi, fenouil, genièvre), noix de muscade, macis et cardamome, cannelle, clou de girofle et vanille. Les pays ont été reliés par les codes M49 de l'ONU à l'ISO3 et aux régions, capitales et populations de la Banque mondiale ; l'agrégat « Chine » de FAOSTAT a été exclu car il répète la Chine continentale, Hong Kong, Macao et Taïwan. Pour chaque épice, la somme des pays en 2024 correspond à la ligne Monde de FAOSTAT à 0,5 % près.",
        "La concentration est l'indice de Herfindahl–Hirschman des parts de production (0–10 000), lu avec les seuils des lignes directrices américaines de 2010. Les valeurs unitaires sont la valeur mondiale exportée divisée par les tonnes exportées, en dollars courants. Les flux bilatéraux sont les déclarations des importateurs pour 2000, 2010 et 2024 ; en 2024 ils couvrent 64,7 à 98,4 % de la valeur mondiale importée selon l'épice. Les événements historiques n'ont été retenus que lorsqu'une référence vérifiée les énonce.",
      ] },
      { h: "Résultats", p: [
        "En 2024, l'Inde a cultivé 53,3 % du piment sec, 78,9 % des épices en graines et 47,7 % du gingembre ; l'Indonésie 74,4 % du girofle ; Madagascar 43,4 % de la vanille ; le Viêt Nam 28,1 % du poivre noir. Sept groupes ont un IHH supérieur à 2 500, en tête les épices en graines (6 267) et le girofle (5 734). La concentration a augmenté depuis 1961 pour les épices en graines (3 224), le girofle (3 375), le piment (1 780), le gingembre (2 480) et la muscade avec la cardamome (1 887), et diminué pour le poivre (2 422), la cannelle (3 470) et la vanille (3 158).",
        "La production de poivre a été multipliée par 9,4 par rapport à sa moyenne de 1961–63 ; le Viêt Nam est passé de 450 t en 1961 à 262 230 t et a exporté pour 1,01 milliard de dollars. Le girofle venait à 73,8 % de Madagascar et de Tanzanie en 1961 et se concentre aujourd'hui en Indonésie, qui en importe aussi ; l'Inde est le premier acheteur de girofle (34,1 % de la valeur mondiale importée).",
        "Les exportations mondiales de vanille ont atteint 10 362 t pour 7 115 t de production. Sa valeur unitaire à l'export est passée de 12,0 US$/kg en 1961 à 216,9 en 2018 et s'établit à 44,6 en 2024, environ 16 fois celle du piment sec. Le Mexique a cultivé 510 t (7,2 %, troisième), contre 16,8 % en 1961, et déclaré 11,8 t d'exportations, contre 137,3 t en 2000. Exportations et importations mondiales d'une même épice diffèrent de −6,3 % à +8,7 % en tonnes.",
      ] },
      { h: "Discussion", p: [
        "Le centre de l'économie des épices s'est déplacé plutôt que de disparaître : l'Asie domine toujours, mais de nouveaux producteurs (le Viêt Nam pour le poivre, le Guatemala dans le groupe de la cardamome, Madagascar pour la vanille) détiennent les plus grandes parts, et pour plusieurs épices un seul pays en cultive la moitié ou plus. Les statistiques commerciales comptent aussi les réexportateurs : les pays qui nettoient, trient ou conditionnent les épices vendent plus de vanille que le monde n'en cultive, d'où l'ajustement des flux miroirs par des bases réconciliées comme BACI (Gaulier et Zignago 2010).",
        "La position du Mexique est une hypothèse à explorer, pas un résultat : son essor de la vanille à la fin du XIXe siècle a transformé Papantla (Kourí 2004), alors qu'il en cultive aujourd'hui une petite part et en exporte peu ; la consommation intérieure et les prix peuvent jouer, mais FAOSTAT ne permet pas de les séparer.",
      ] },
      { h: "Limites", p: [
        "FAOSTAT ne couvre que les épices brutes ; les produits moulus et transformés sont des produits distincts. En 2024, 34,2 % des tonnes d'épices étaient des estimations ou imputations de la FAO (vanille 71 %, cannelle 69 %), dont le poivre du Burkina Faso et la cardamome du Guatemala. Certains groupes mêlent des plantes différentes (muscade et cardamome ; casse et cannelle). Les valeurs unitaires mélangent les qualités et ne sont pas déflatées. Les flux reposent sur les déclarations des importateurs. Les routes historiques sont schématiques, et le transfert de Poivre vers Maurice a été omis faute de source accessible.",
      ] },
      { h: "Conclusion", p: [
        "L'offre d'épices est aujourd'hui très concentrée dans quelques pays, surtout en Asie, mais pas dans les lieux qui ont défini la route historique : le poivre est passé au Viêt Nam et au Brésil, le girofle en Indonésie, la vanille à Madagascar. Le poivre noir est le seul groupe dont l'offre est devenue moins concentrée depuis 1961, et le Mexique, d'où vient la vanille, joue aujourd'hui un rôle mineur dans son commerce.",
      ] },
    ],
    figure: "Production mondiale de poivre noir depuis 1961 et les quatre premiers producteurs en 2024 (FAOSTAT), à côté de la concentration de l'offre (IHH des parts de production) des huit groupes d'épices en 2024.",
  },
  it: {
    title: "Chi coltiva e compra le spezie del mondo, quanto è concentrata l'offerta e come si confronta la mappa di oggi con l'antica rotta delle spezie? Otto gruppi di spezie FAOSTAT, 1961–2024",
    abstract: "Con i dati FAOSTAT di produzione, commercio e matrice bilaterale del commercio per otto gruppi di spezie in 210 paesi e aree dal 1961 al 2024, descriviamo dove le spezie sono coltivate e scambiate, quanto è concentrata l'offerta e quanto vale un chilogrammo, e accostiamo la mappa attuale a otto momenti citati della rotta storica delle spezie. Nel 2024 gli otto gruppi hanno totalizzato 14,6 milioni di tonnellate e 12,3 miliardi di dollari di esportazioni. Secondo le soglie delle linee guida statunitensi del 2010, sette degli otto sono molto concentrati (HHI sopra 2.500); l'eccezione è il pepe nero (1.378). Il cuore del pepe si è spostato da India, Malesia e Indonesia (79,4% della produzione mondiale nel 1961) a Vietnam, India e Brasile (55,0%). Le esportazioni mondiali di vaniglia sono state il 146% della produzione mondiale, segno di riesportazioni, e il Messico, patria della vaniglia, ne ha coltivato il 7,2% ma ha dichiarato solo 11,8 t di esportazioni.",
    keywords: ["commercio delle spezie", "FAOSTAT", "pepe nero", "vaniglia", "concentrazione del mercato", "HHI", "rotta delle spezie", "storia economica", "Messico"],
    sections: [
      { h: "Introduzione", p: [
        "Le spezie furono le merci di alto valore del commercio a lunga distanza. O'Rourke e Williamson (2009), confrontando i prezzi del pepe e delle spezie fini rispetto all'inflazione prima e dopo il 1503, hanno trovato che i viaggi di scoperta ebbero un forte impatto sui mercati europei delle spezie; Bulbeck et al. (1998) hanno raccolto le lunghe serie di esportazione che fanno di chiodi di garofano e pepe la spina dorsale del commercio precoloniale del Sud-est asiatico; Miske (2025) descrive la conquista delle isole Banda da parte della Compagnia olandese delle Indie orientali nel 1621 per controllare noce moscata e macis.",
        "Questo studio chiede chi coltiva e compra spezie oggi, quanto è concentrata l'offerta e come la mappa attuale si confronta con quella storia, con primi piani sul pepe nero e sulla vaniglia del Messico.",
      ] },
      { h: "Dati e metodi", p: [
        "I file completi di FAOSTAT (colture e allevamento, commercio e matrice dettagliata del commercio; CC BY 4.0) sono stati filtrati con DuckDB su otto prodotti: pepe (Piper spp.), peperoncini secchi, zenzero, spezie in semi (anice, anice stellato, coriandolo, cumino, carvi, finocchio, ginepro), noce moscata, macis e cardamomo, cannella, chiodi di garofano e vaniglia. I paesi sono stati collegati tramite i codici M49 dell'ONU all'ISO3 e a regioni, capitali e popolazione della Banca Mondiale; l'aggregato «Cina» di FAOSTAT è stato escluso perché ripete Cina continentale, Hong Kong, Macao e Taiwan. Per ogni spezia, la somma dei paesi nel 2024 coincide con la riga Mondo di FAOSTAT entro lo 0,5%.",
        "La concentrazione è l'indice di Herfindahl–Hirschman delle quote di produzione (0–10.000), letto con le soglie delle linee guida statunitensi del 2010. I valori unitari sono il valore mondiale esportato diviso per le tonnellate esportate, in dollari correnti. I flussi bilaterali sono dichiarazioni degli importatori per il 2000, il 2010 e il 2024; nel 2024 coprono dal 64,7 al 98,4% del valore mondiale importato a seconda della spezia. Gli eventi storici sono stati mantenuti solo quando un riferimento verificato li afferma.",
      ] },
      { h: "Risultati", p: [
        "Nel 2024 l'India ha coltivato il 53,3% del peperoncino secco, il 78,9% delle spezie in semi e il 47,7% dello zenzero; l'Indonesia il 74,4% dei chiodi di garofano; il Madagascar il 43,4% della vaniglia; il Vietnam il 28,1% del pepe nero. Sette gruppi hanno un HHI sopra 2.500, in testa le spezie in semi (6.267) e i chiodi di garofano (5.734). La concentrazione è aumentata dal 1961 per le spezie in semi (3.224), i chiodi di garofano (3.375), il peperoncino (1.780), lo zenzero (2.480) e noce moscata con cardamomo (1.887), ed è diminuita per il pepe (2.422), la cannella (3.470) e la vaniglia (3.158).",
        "La produzione di pepe è cresciuta di 9,4 volte rispetto alla media 1961–63; il Vietnam è passato da 450 t nel 1961 a 262.230 t e ha esportato per 1,01 miliardi di dollari. I chiodi di garofano venivano per il 73,8% da Madagascar e Tanzania nel 1961 e oggi si concentrano in Indonesia, che li importa anche; l'India è il maggiore acquirente (34,1% del valore mondiale importato).",
        "Le esportazioni mondiali di vaniglia sono state 10.362 t a fronte di 7.115 t di produzione. Il suo valore unitario all'esportazione è salito da 12,0 US$/kg nel 1961 a 216,9 nel 2018 ed era 44,6 nel 2024, circa 16 volte quello del peperoncino secco. Il Messico ha coltivato 510 t (7,2%, terzo), contro il 16,8% nel 1961, e ha dichiarato 11,8 t di esportazioni, contro 137,3 t nel 2000. Esportazioni e importazioni mondiali della stessa spezia differiscono da −6,3% a +8,7% in tonnellate.",
      ] },
      { h: "Discussione", p: [
        "Il centro dell'economia delle spezie si è spostato, non è scomparso: l'Asia domina ancora, ma nuovi produttori (il Vietnam per il pepe, il Guatemala nel gruppo del cardamomo, il Madagascar per la vaniglia) detengono le quote maggiori, e per diverse spezie un solo paese ne coltiva la metà o più. Le statistiche commerciali contano anche i riesportatori: i paesi che puliscono, selezionano o confezionano spezie vendono più vaniglia di quanta il mondo ne coltivi, ed è per questo che basi riconciliate come BACI (Gaulier e Zignago 2010) correggono i flussi speculari.",
        "La posizione del Messico è un'ipotesi da esplorare, non un risultato: il suo boom della vaniglia a fine Ottocento trasformò Papantla (Kourí 2004), mentre oggi ne coltiva una piccola quota e ne esporta poca; consumo interno e prezzi possono contare, ma FAOSTAT non permette di separarli.",
      ] },
      { h: "Limiti", p: [
        "FAOSTAT copre solo spezie grezze; i prodotti macinati e trasformati sono voci separate. Nel 2024 il 34,2% delle tonnellate di spezie erano stime o imputazioni della FAO (vaniglia 71%, cannella 69%), compresi il pepe del Burkina Faso e il cardamomo del Guatemala. Alcuni gruppi mescolano piante diverse (noce moscata con cardamomo; cassia con cannella). I valori unitari mescolano qualità e non sono deflazionati. I flussi si basano sulle dichiarazioni degli importatori. Le rotte storiche sono schematiche e il trapianto di Poivre a Mauritius è stato omesso per mancanza di una fonte accessibile.",
      ] },
      { h: "Conclusione", p: [
        "L'offerta di spezie è oggi molto concentrata in pochi paesi, soprattutto in Asia, ma non nei luoghi che definirono la rotta storica: il pepe si è spostato in Vietnam e Brasile, i chiodi di garofano in Indonesia, la vaniglia in Madagascar. Il pepe nero è l'unico gruppo la cui offerta è diventata meno concentrata dal 1961, e il Messico, da cui viene la vaniglia, ha oggi un ruolo minore nel suo commercio.",
      ] },
    ],
    figure: "Produzione mondiale di pepe nero dal 1961 e i quattro maggiori produttori nel 2024 (FAOSTAT), accanto alla concentrazione dell'offerta (HHI delle quote di produzione) degli otto gruppi di spezie nel 2024.",
  },
  ja: {
    title: "世界のスパイスを育て、買っているのは誰か、供給はどれほど集中しているか、そして現在の地図はかつての香辛料ルートとどう違うか：FAOSTATの8つのスパイス群、1961–2024年",
    abstract: "1961年から2024年までの210の国・地域、8つのスパイス群について、FAOSTATの生産・貿易・二国間貿易マトリックスのデータを用い、スパイスがどこで栽培・取引されているか、供給の集中度、1キログラムの価値を記述し、現在の地図を歴史的な香辛料ルートの引用付きの8つの出来事と並べた。2024年、8群の合計は1,460万トン、輸出額は123億ドルだった。2010年の米国合併ガイドラインの区分では8群中7群が高集中（HHI 2,500超）で、例外は黒コショウ（1,378）である。コショウの中心はインド・マレーシア・インドネシア（1961年に世界生産の79.4%）からベトナム・インド・ブラジル（55.0%）へ移った。世界のバニラ輸出は世界生産の146%で再輸出を示しており、バニラの故郷メキシコは世界の7.2%を生産したが、輸出報告は11.8 tにとどまった。",
    keywords: ["香辛料貿易", "FAOSTAT", "黒コショウ", "バニラ", "市場集中度", "HHI", "香辛料ルート", "経済史", "メキシコ"],
    sections: [
      { h: "はじめに", p: [
        "スパイスは初期の遠距離交易における高価値商品だった。O'RourkeとWilliamson（2009）は、1503年前後のコショウと高級香辛料の価格をインフレを考慮して比較し、大航海が欧州の香辛料市場に大きな影響を与えたと結論づけた。Bulbeckら（1998）は、クローブとコショウが東南アジアの植民地化以前の交易の柱であったことを示す長期の輸出系列を編纂し、Miske（2025）は、ナツメグとメースを支配するためのオランダ東インド会社による1621年のバンダ諸島征服を記述している。",
        "本研究は、現在スパイスを育て買っているのは誰か、供給はどれほど集中しているか、現在の地図がその歴史とどう比較できるかを問い、黒コショウとメキシコのバニラを詳しく見る。",
      ] },
      { h: "データと方法", p: [
        "FAOSTATの一括ファイル（作物と畜産物、貿易、詳細貿易マトリックス；CC BY 4.0）をDuckDBで8品目に絞り込んだ：コショウ（Piper属）、乾燥唐辛子、ショウガ、種子系スパイス（アニス、八角、コリアンダー、クミン、キャラウェイ、フェンネル、ジュニパー）、ナツメグ・メース・カルダモン、シナモン、クローブ、バニラ。国は国連M49コードでISO3に結び付け、世界銀行の地域・首都・人口と結合した。FAOSTATの「中国」集計は中国本土・香港・マカオ・台湾の重複のため除外した。各スパイスについて、2024年の国別合計はFAOSTATの「世界」行と0.5%以内で一致する。",
        "集中度は生産シェアのハーフィンダール・ハーシュマン指数（0〜10,000）で、2010年の米国合併ガイドラインの区分で読んだ。単価は世界の輸出額を輸出トン数で割った名目ドル値である。二国間フローは2000年、2010年、2024年の輸入国報告で、2024年にはスパイス別に世界の輸入額の64.7〜98.4%をカバーする。歴史的な出来事は、検証済みの参考文献が述べている場合のみ採用した。",
      ] },
      { h: "結果", p: [
        "2024年、インドは乾燥唐辛子の53.3%、種子系スパイスの78.9%、ショウガの47.7%を生産し、インドネシアはクローブの74.4%、マダガスカルはバニラの43.4%、ベトナムは黒コショウの28.1%を生産した。7群のHHIが2,500を超え、種子系スパイス（6,267）とクローブ（5,734）が上位である。1961年以降、集中度は種子系スパイス（3,224）、クローブ（3,375）、唐辛子（1,780）、ショウガ（2,480）、ナツメグとカルダモン（1,887）で上昇し、コショウ（2,422）、シナモン（3,470）、バニラ（3,158）で低下した。",
        "コショウの生産は1961–63年平均の9.4倍になった。ベトナムは1961年の450 tから262,230 tに増え、10.1億ドルを輸出した。クローブは1961年には73.8%がマダガスカルとタンザニア産だったが、現在はインドネシアに集中し、同国は輸入もしている。最大のクローブ購入国はインドである（世界の輸入額の34.1%）。",
        "世界のバニラ輸出は10,362 tで、生産は7,115 tだった。輸出単価は1961年の12.0 US$/kgから2018年に216.9へ上昇し、2024年は44.6で、乾燥唐辛子の約16倍である。メキシコの生産は510 t（7.2%、3位）で、1961年の16.8%から低下し、輸出報告は2000年の137.3 tに対し11.8 tだった。同じスパイスの世界輸出と輸入は重量で−6.3%〜+8.7%ずれる。",
      ] },
      { h: "考察", p: [
        "スパイス経済の中心は消えたのではなく移動した。アジアは今も支配的だが、新しい生産国（コショウのベトナム、カルダモン群のグアテマラ、バニラのマダガスカル）が最大のシェアを持ち、いくつかのスパイスでは1か国が半分以上を生産している。貿易統計には再輸出国も含まれる。スパイスを洗浄・選別・包装する国々は世界の生産量を上回るバニラを販売しており、BACI（Gaulier and Zignago 2010）のような調整済みデータセットがミラーフローを補正するのはこのためである。",
        "メキシコの位置づけは検証すべき仮説であり、結論ではない。19世紀末のバニラブームはパパントラを変えたが（Kourí 2004）、現在の生産シェアは小さく輸出も少ない。国内消費や価格が影響している可能性はあるが、FAOSTATでは切り分けられない。",
      ] },
      { h: "限界", p: [
        "FAOSTATは未加工のスパイスのみを対象とし、粉砕品や加工品は別品目である。2024年、スパイスのトン数の34.2%はFAOの推計または補完値で（バニラ71%、シナモン69%）、ブルキナファソのコショウやグアテマラのカルダモンも含まれる。一部の群は異なる植物を含む（ナツメグとカルダモン、カシアとシナモン）。単価は品質が混在し、デフレートしていない。フローは輸入国の報告に依存する。歴史的ルートは模式的で、ポワーヴルのモーリシャスへの移植は閲覧可能な出典がないため除外した。",
      ] },
      { h: "結論", p: [
        "現在のスパイス供給は少数の国、主にアジアに高度に集中しているが、歴史的な香辛料ルートを形づくった場所ではない。コショウはベトナムとブラジルへ、クローブはインドネシアへ、バニラはマダガスカルへ移った。1961年以降に供給の集中度が下がったのは黒コショウだけであり、バニラの原産地メキシコは現在その貿易で小さな役割しか果たしていない。",
      ] },
    ],
    figure: "1961年以降の黒コショウの世界生産と2024年の上位4生産国（FAOSTAT）、および2024年の8つのスパイス群の供給集中度（生産シェアのHHI）。",
  },
  zh: {
    title: "谁在种植和购买世界的香料？供应有多集中？如今的地图与古老的香料之路相比如何？FAOSTAT八类香料，1961–2024年",
    abstract: "利用FAOSTAT 1961至2024年210个国家和地区八类香料的生产、贸易和双边贸易矩阵数据，我们描述了香料在哪里种植和交易、供应的集中程度以及一公斤的价值，并将当今地图与历史上香料之路的八个有引用来源的时刻并列。2024年，八类香料合计1,460万吨，出口额123亿美元。按2010年美国并购指南的区间，八类中有七类高度集中（HHI高于2,500），唯一例外是黑胡椒（1,378）。胡椒的核心已从印度、马来西亚和印度尼西亚（1961年占世界产量79.4%）转向越南、印度和巴西（55.0%）。世界香草出口相当于世界产量的146%，表明存在再出口；香草的故乡墨西哥种植了世界7.2%的香草，但只报告了11.8吨出口。",
    keywords: ["香料贸易", "FAOSTAT", "黑胡椒", "香草", "市场集中度", "HHI", "香料之路", "经济史", "墨西哥"],
    sections: [
      { h: "引言", p: [
        "香料是早期远程贸易中的高价值商品。O'Rourke和Williamson（2009）比较了1503年前后相对于通胀的胡椒和精细香料价格，发现大航海对欧洲香料市场产生了重大影响；Bulbeck等（1998）编制的长期出口序列表明，丁香和胡椒是东南亚前殖民时代贸易的支柱；Miske（2025）描述了荷兰东印度公司在1621年为控制肉豆蔻和肉豆蔻衣而征服班达群岛。",
        "本研究探讨如今谁在种植和购买香料、供应有多集中，以及当今地图与这段历史相比如何，并对黑胡椒和墨西哥香草作特写。",
      ] },
      { h: "数据与方法", p: [
        "FAOSTAT批量文件（作物与畜产品、贸易、详细贸易矩阵；CC BY 4.0）经DuckDB筛选为八个品目：胡椒（Piper属）、干辣椒、姜、籽类香料（茴芹、八角、芫荽、孜然、葛缕子、茴香、杜松）、肉豆蔻、肉豆蔻衣和小豆蔻、肉桂、丁香和香草。各国通过联合国M49代码对应ISO3，并与世界银行的地区、首都和人口相连接；FAOSTAT的“中国”汇总因与中国大陆、香港、澳门和台湾重复而剔除。每种香料2024年的各国合计与FAOSTAT“世界”行相差在0.5%以内。",
        "集中度采用按产量份额计算的赫芬达尔–赫希曼指数（0–10,000），按2010年美国并购指南的区间解读。单价为世界出口额除以出口吨数，以现价美元计。双边贸易流为2000年、2010年和2024年的进口国报告，2024年按香料覆盖世界进口额的64.7%至98.4%。历史事件仅在经核实的参考文献有所陈述时才予保留。",
      ] },
      { h: "结果", p: [
        "2024年，印度种植了53.3%的干辣椒、78.9%的籽类香料和47.7%的姜；印度尼西亚种植了74.4%的丁香；马达加斯加43.4%的香草；越南28.1%的黑胡椒。七类的HHI高于2,500，以籽类香料（6,267）和丁香（5,734）为首。自1961年以来，籽类香料（3,224）、丁香（3,375）、辣椒（1,780）、姜（2,480）和肉豆蔻与小豆蔻（1,887）的集中度上升，胡椒（2,422）、肉桂（3,470）和香草（3,158）的集中度下降。",
        "胡椒产量增至1961–63年均值的9.4倍；越南从1961年的450吨增至262,230吨，出口额10.1亿美元。1961年丁香有73.8%来自马达加斯加和坦桑尼亚，如今集中在印度尼西亚，而它同时也进口丁香；印度是最大的丁香买家（占世界进口额34.1%）。",
        "世界香草出口为10,362吨，产量为7,115吨。其出口单价从1961年的12.0美元/公斤升至2018年的216.9，2024年为44.6，约为干辣椒的16倍。墨西哥产香草510吨（7.2%，第三），1961年为16.8%；其出口报告为11.8吨，2000年为137.3吨。同一种香料的世界出口与进口按吨计相差−6.3%至+8.7%。",
      ] },
      { h: "讨论", p: [
        "香料经济的中心转移了，而非消失：亚洲仍占主导，但新的生产国（胡椒的越南、小豆蔻类的危地马拉、香草的马达加斯加）拥有最大份额，在若干香料中一个国家就种植了一半或更多。贸易统计还包括再出口国：清洗、分级或包装香料的国家售出的香草多于世界的种植量，这也是BACI（Gaulier和Zignago 2010）等调和数据库要校正镜像贸易流的原因。",
        "墨西哥的地位是有待探讨的假设，而非结论：19世纪末的香草热潮改变了帕潘特拉（Kourí 2004），而如今其产量份额很小、出口也少；国内消费和价格可能有影响，但FAOSTAT无法将其区分。",
      ] },
      { h: "局限", p: [
        "FAOSTAT只涵盖未加工香料；磨碎和加工产品是单独品目。2024年，34.2%的香料吨数为粮农组织估计或插补值（香草71%、肉桂69%），包括布基纳法索的胡椒和危地马拉的小豆蔻。部分类别混合了不同植物（肉豆蔻与小豆蔻；桂皮与肉桂）。单价混合了不同等级且未作平减。贸易流依赖进口国报告。历史路线为示意，普瓦夫尔向毛里求斯的移植因缺乏可访问来源而未收录。",
      ] },
      { h: "结论", p: [
        "如今香料供应高度集中于少数国家，主要在亚洲，但并不在塑造了历史香料之路的那些地方：胡椒转向越南和巴西，丁香转向印度尼西亚，香草转向马达加斯加。黑胡椒是1961年以来供应集中度下降的唯一一类，而香草的原产地墨西哥如今在其贸易中只扮演次要角色。",
      ] },
    ],
    figure: "1961年以来黑胡椒的世界产量及2024年四大生产国（FAOSTAT），以及2024年八类香料的供应集中度（产量份额的HHI）。",
  },
};
