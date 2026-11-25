import type { ArticleSet } from "./types";

// Figures computed from src/days/day-001-border/snapshot.json (CBP historical averages, 12 months × weekday × hour).
export const D001: ArticleSet = {
  en: {
    title: "When is the best time to cross from Mexicali? Weekly and seasonal patterns of northbound wait times at the Calexico ports of entry",
    abstract: "Using U.S. Customs and Border Protection's historical averages for every weekday, hour and month at Calexico West and Calexico East (3,360 observations), I describe when northbound waits are shortest by lane. Between 6 am and 10 pm, the standard car lane averages 61.1 minutes at Calexico West and 44.9 at Calexico East, while trusted-traveller SENTRI lanes average about 10 minutes at both, saving 50.8 and 34.9 minutes. Early weekday mornings are the quietest slots and Sunday afternoons the busiest. Waits rise in spring and December. The averages support planning, not guarantees: they hide day-to-day variation.",
    keywords: ["border crossing", "wait times", "Mexicali", "Calexico", "SENTRI", "time series"],
    sections: [
      { h: "Introduction", p: [
        "Tens of thousands of people cross from Mexicali into Calexico every day for work, school and shopping. The wait at the port of entry is the largest and least predictable part of that trip. CBP publishes current delays and, less visibly, historical averages by hour. This study turns those averages into a practical question: on which day and at what hour is the wait shortest, for each lane and each month?",
      ] },
      { h: "Data and methods", p: [
        "The data are CBP's historical average northbound waits (historicalwaittimes endpoint) for Calexico West, open 24 hours, and Calexico East, open from 6 am to 10 pm, for each of the 12 months, 7 weekdays and every open hour: 168 hourly cells a month at West and 112 at East, 3,360 rows in total. Each row holds the average wait in minutes for standard car lanes, SENTRI, Ready Lane and pedestrians.",
        "I compare the crossings over the hours both are open (6 am to 10 pm), find the minimum and maximum hour for each weekday, average each month's daytime waits, and compute the time SENTRI saves as the standard wait minus the SENTRI wait. The interactive page also adds the live delay from CBP's feed; the analysis here uses only the historical averages.",
      ] },
      { h: "Results", p: [
        "Over the daytime window, standard car lanes average 61.1 minutes at Calexico West and 44.9 minutes at Calexico East. SENTRI lanes average 10.3 and 10.0 minutes, so the program saves 50.8 minutes at West and 34.9 at East on an average daytime hour. Ready Lane averages 28.2 minutes at West and 42.6 at East, and pedestrians 23.4 and 5.1 minutes.",
        "The quietest daytime slots are early mornings: Sunday at 6 am at West (16 minutes for standard cars) and Friday at 6 am at East (5 minutes). The busiest are Sunday afternoons, at 3 pm at West (88 minutes) and 4 pm at East (75 minutes), when weekend visitors return. By month, West peaks in April (73.1 minutes) and December (71.3) and is lowest in October (52.0); East peaks in November (57.2) and March (56.3) and is lowest in August (32.4).",
      ] },
      { h: "Discussion", p: [
        "The pattern is consistent with commuting and leisure travel: weekday mornings carry steady commuter traffic that the ports have staffed for, while Sunday afternoons concentrate returning visitors. The size of the SENTRI saving, five-sixths of the standard wait at West, quantifies the value of the trusted-traveller program for frequent crossers. Calexico East is faster for standard cars on average, so a driver free to choose has a reason to use it during its opening hours.",
      ] },
      { h: "Limitations", p: [
        "Averages hide variation: a holiday or an inspection surge can double a typical wait. CBP's figures are estimates reported by each port, and a zero can mean a closed lane rather than no wait. The months mix holidays and normal days, and the data say nothing about southbound traffic.",
      ] },
      { h: "Conclusion", p: [
        "For a standard car, the best plan is an early weekday morning and, when possible, Calexico East; the worst is a Sunday afternoon at Calexico West. Enrolling in SENTRI removes most of the wait at either port.",
      ] },
    ],
    figure: "Average northbound wait by weekday and hour at the Calexico ports of entry (CBP historical averages).",
  },
  es: {
    title: "¿Cuándo es mejor cruzar desde Mexicali? Patrones semanales y estacionales de las esperas hacia el norte en los puertos de entrada de Calexico",
    abstract: "Con los promedios históricos de la Oficina de Aduanas y Protección Fronteriza de EE. UU. (CBP) para cada día, hora y mes en Calexico West y Calexico East (3,360 observaciones), describo cuándo son más cortas las esperas hacia el norte en cada carril. Entre las 6 am y las 10 pm, el carril estándar de autos promedia 61.1 minutos en Calexico West y 44.9 en Calexico East, mientras que los carriles SENTRI promedian unos 10 minutos en ambos y ahorran 50.8 y 34.9 minutos. Las madrugadas entre semana son las horas más tranquilas y las tardes de domingo las más cargadas. Las esperas suben en primavera y en diciembre. Los promedios sirven para planear, no garantizan: esconden la variación de cada día.",
    keywords: ["cruce fronterizo", "tiempos de espera", "Mexicali", "Calexico", "SENTRI", "series de tiempo"],
    sections: [
      { h: "Introducción", p: [
        "Decenas de miles de personas cruzan de Mexicali a Calexico cada día para trabajar, estudiar y comprar. La espera en el puerto de entrada es la parte más larga y menos predecible del viaje. CBP publica las demoras actuales y, de forma menos visible, promedios históricos por hora. Este estudio convierte esos promedios en una pregunta práctica: ¿qué día y a qué hora es más corta la espera, para cada carril y cada mes?",
      ] },
      { h: "Datos y métodos", p: [
        "Los datos son los promedios históricos de espera hacia el norte de CBP (endpoint historicalwaittimes) para Calexico West, abierto 24 horas, y Calexico East, abierto de 6 am a 10 pm, para los 12 meses, los 7 días de la semana y cada hora abierta: 168 celdas por mes en West y 112 en East, 3,360 filas en total. Cada fila tiene la espera promedio en minutos para autos en carril estándar, SENTRI, Ready Lane y peatones.",
        "Comparo los cruces en las horas en que ambos abren (6 am a 10 pm), encuentro la hora mínima y máxima de cada día, promedio las esperas diurnas de cada mes y calculo el tiempo que ahorra SENTRI como la espera estándar menos la de SENTRI. La página interactiva agrega además la demora en vivo de CBP; este análisis usa solo los promedios históricos.",
      ] },
      { h: "Resultados", p: [
        "En el horario diurno, el carril estándar de autos promedia 61.1 minutos en Calexico West y 44.9 en Calexico East. SENTRI promedia 10.3 y 10.0 minutos, así que ahorra 50.8 minutos en West y 34.9 en East en una hora diurna promedio. Ready Lane promedia 28.2 minutos en West y 42.6 en East, y los peatones 23.4 y 5.1 minutos.",
        "Las horas diurnas más tranquilas son de madrugada: domingo a las 6 am en West (16 minutos en carril estándar) y viernes a las 6 am en East (5 minutos). Las más cargadas son las tardes de domingo, a las 3 pm en West (88 minutos) y a las 4 pm en East (75 minutos), cuando regresan los visitantes de fin de semana. Por mes, West llega a su máximo en abril (73.1 minutos) y diciembre (71.3) y a su mínimo en octubre (52.0); East en noviembre (57.2) y marzo (56.3), con su mínimo en agosto (32.4).",
      ] },
      { h: "Discusión", p: [
        "El patrón coincide con los viajes de trabajo y de paseo: las mañanas entre semana llevan un flujo constante de trabajadores para el que los puertos ya asignan personal, mientras que las tardes de domingo concentran a quienes regresan. El ahorro de SENTRI, cinco sextas partes de la espera estándar en West, mide el valor del programa para quienes cruzan seguido. Calexico East es más rápido en promedio para autos en carril estándar, así que quien puede elegir tiene una razón para usarlo en su horario.",
      ] },
      { h: "Limitaciones", p: [
        "Los promedios esconden la variación: un día festivo o una revisión más intensa pueden duplicar la espera típica. Las cifras de CBP son estimaciones de cada puerto, y un cero puede significar un carril cerrado y no una espera nula. Los meses mezclan días festivos y normales, y los datos no dicen nada del tráfico hacia el sur.",
      ] },
      { h: "Conclusión", p: [
        "Para un auto en carril estándar, lo mejor es una madrugada entre semana y, si se puede, Calexico East; lo peor, una tarde de domingo en Calexico West. Inscribirse en SENTRI elimina la mayor parte de la espera en cualquiera de los dos puertos.",
      ] },
    ],
    figure: "Espera promedio hacia el norte por día de la semana y hora en los puertos de entrada de Calexico (promedios históricos de CBP).",
  },
  pt: {
    title: "Quando é melhor atravessar a partir de Mexicali? Padrões semanais e sazonais da espera rumo ao norte nos postos de fronteira de Calexico",
    abstract: "Com as médias históricas da Alfândega e Proteção de Fronteiras dos EUA (CBP) para cada dia, hora e mês em Calexico West e Calexico East (3.360 observações), descrevo quando a espera rumo ao norte é menor em cada faixa. Entre 6h e 22h, a faixa padrão de carros tem média de 61,1 minutos em Calexico West e 44,9 em Calexico East, enquanto as faixas SENTRI ficam em cerca de 10 minutos nas duas e economizam 50,8 e 34,9 minutos. As manhãs cedo dos dias úteis são os horários mais tranquilos e as tardes de domingo os mais cheios. A espera sobe na primavera e em dezembro. As médias servem para planejar, não garantem: escondem a variação de cada dia.",
    keywords: ["travessia de fronteira", "tempo de espera", "Mexicali", "Calexico", "SENTRI", "séries temporais"],
    sections: [
      { h: "Introdução", p: [
        "Dezenas de milhares de pessoas atravessam de Mexicali para Calexico todos os dias para trabalhar, estudar e fazer compras. A espera no posto de fronteira é a parte mais longa e menos previsível da viagem. O CBP publica os atrasos atuais e, de forma menos visível, médias históricas por hora. Este estudo transforma essas médias numa pergunta prática: em que dia e a que hora a espera é menor, para cada faixa e cada mês?",
      ] },
      { h: "Dados e métodos", p: [
        "Os dados são as médias históricas de espera rumo ao norte do CBP (endpoint historicalwaittimes) para Calexico West, aberto 24 horas, e Calexico East, aberto das 6h às 22h, para os 12 meses, os 7 dias da semana e cada hora de funcionamento: 168 células por mês em West e 112 em East, 3.360 linhas no total. Cada linha traz a espera média em minutos para carros na faixa padrão, SENTRI, Ready Lane e pedestres.",
        "Comparo os postos nas horas em que os dois funcionam (6h às 22h), encontro a hora mínima e máxima de cada dia, calculo a média diurna de cada mês e o tempo que o SENTRI economiza como a espera padrão menos a do SENTRI. A página interativa também mostra o atraso ao vivo do CBP; esta análise usa só as médias históricas.",
      ] },
      { h: "Resultados", p: [
        "No horário diurno, a faixa padrão de carros tem média de 61,1 minutos em Calexico West e 44,9 em Calexico East. O SENTRI fica em 10,3 e 10,0 minutos, economizando 50,8 minutos em West e 34,9 em East numa hora diurna média. A Ready Lane tem média de 28,2 minutos em West e 42,6 em East, e os pedestres 23,4 e 5,1 minutos.",
        "Os horários diurnos mais tranquilos são de manhã cedo: domingo às 6h em West (16 minutos na faixa padrão) e sexta às 6h em East (5 minutos). Os mais cheios são as tardes de domingo, às 15h em West (88 minutos) e às 16h em East (75 minutos), quando os visitantes do fim de semana voltam. Por mês, West atinge o máximo em abril (73,1 minutos) e dezembro (71,3) e o mínimo em outubro (52,0); East em novembro (57,2) e março (56,3), com mínimo em agosto (32,4).",
      ] },
      { h: "Discussão", p: [
        "O padrão combina com as viagens de trabalho e de lazer: as manhãs dos dias úteis têm um fluxo constante de trabalhadores para o qual os postos já escalam pessoal, enquanto as tardes de domingo concentram quem volta. A economia do SENTRI, cinco sextos da espera padrão em West, mede o valor do programa para quem atravessa com frequência. Calexico East é mais rápido em média para carros na faixa padrão, então quem pode escolher tem um motivo para usá-lo no seu horário.",
      ] },
      { h: "Limitações", p: [
        "As médias escondem a variação: um feriado ou uma fiscalização mais intensa podem dobrar a espera típica. Os números do CBP são estimativas de cada posto, e um zero pode significar uma faixa fechada e não espera nula. Os meses misturam feriados e dias normais, e os dados nada dizem sobre o tráfego rumo ao sul.",
      ] },
      { h: "Conclusão", p: [
        "Para um carro na faixa padrão, o melhor é uma manhã cedo de dia útil e, se possível, Calexico East; o pior, uma tarde de domingo em Calexico West. Inscrever-se no SENTRI elimina a maior parte da espera em qualquer dos dois postos.",
      ] },
    ],
    figure: "Espera média rumo ao norte por dia da semana e hora nos postos de fronteira de Calexico (médias históricas do CBP).",
  },
  fr: {
    title: "Quand traverser depuis Mexicali ? Rythmes hebdomadaires et saisonniers de l’attente vers le nord aux postes frontaliers de Calexico",
    abstract: "À partir des moyennes historiques des douanes et de la protection des frontières des États-Unis (CBP) pour chaque jour, heure et mois à Calexico West et Calexico East (3 360 observations), je décris quand l’attente vers le nord est la plus courte selon la voie. Entre 6 h et 22 h, la voie standard pour voitures affiche en moyenne 61,1 minutes à Calexico West et 44,9 à Calexico East, tandis que les voies SENTRI tournent autour de 10 minutes aux deux postes et font gagner 50,8 et 34,9 minutes. Les débuts de matinée en semaine sont les créneaux les plus calmes et les dimanches après-midi les plus chargés. L’attente augmente au printemps et en décembre. Ces moyennes aident à planifier mais ne garantissent rien : elles masquent la variation d’un jour à l’autre.",
    keywords: ["passage de frontière", "temps d’attente", "Mexicali", "Calexico", "SENTRI", "séries temporelles"],
    sections: [
      { h: "Introduction", p: [
        "Des dizaines de milliers de personnes passent chaque jour de Mexicali à Calexico pour travailler, étudier ou faire des achats. L’attente au poste frontalier est la partie la plus longue et la moins prévisible du trajet. Le CBP publie les délais en cours et, de façon moins visible, des moyennes historiques par heure. Cette étude en tire une question pratique : quel jour et à quelle heure l’attente est-elle la plus courte, pour chaque voie et chaque mois ?",
      ] },
      { h: "Données et méthodes", p: [
        "Les données sont les moyennes historiques d’attente vers le nord du CBP (point d’accès historicalwaittimes) pour Calexico West, ouvert 24 h sur 24, et Calexico East, ouvert de 6 h à 22 h, pour les 12 mois, les 7 jours de la semaine et chaque heure d’ouverture : 168 cellules par mois à West et 112 à East, soit 3 360 lignes. Chaque ligne donne l’attente moyenne en minutes pour les voitures en voie standard, SENTRI, Ready Lane et les piétons.",
        "Je compare les postes sur les heures où les deux sont ouverts (6 h à 22 h), je repère l’heure la plus courte et la plus longue de chaque jour, je calcule la moyenne diurne de chaque mois et le gain SENTRI comme l’attente standard moins l’attente SENTRI. La page interactive ajoute le délai en direct du CBP ; l’analyse ici n’utilise que les moyennes historiques.",
      ] },
      { h: "Résultats", p: [
        "En journée, la voie standard pour voitures affiche en moyenne 61,1 minutes à Calexico West et 44,9 minutes à Calexico East. SENTRI affiche 10,3 et 10,0 minutes : le programme fait gagner 50,8 minutes à West et 34,9 à East sur une heure diurne moyenne. La Ready Lane affiche 28,2 minutes à West et 42,6 à East, et les piétons 23,4 et 5,1 minutes.",
        "Les créneaux diurnes les plus calmes sont tôt le matin : le dimanche à 6 h à West (16 minutes en voie standard) et le vendredi à 6 h à East (5 minutes). Les plus chargés sont les dimanches après-midi, à 15 h à West (88 minutes) et à 16 h à East (75 minutes), au retour des visiteurs du week-end. Par mois, West culmine en avril (73,1 minutes) et en décembre (71,3) et descend au plus bas en octobre (52,0) ; East culmine en novembre (57,2) et en mars (56,3), avec un minimum en août (32,4).",
      ] },
      { h: "Discussion", p: [
        "Ce rythme correspond aux déplacements de travail et de loisirs : les matinées de semaine portent un flux régulier de travailleurs pour lequel les postes sont dotés en personnel, tandis que les dimanches après-midi concentrent les retours. Le gain SENTRI, cinq sixièmes de l’attente standard à West, chiffre la valeur du programme pour les voyageurs fréquents. Calexico East est en moyenne plus rapide en voie standard : un conducteur qui peut choisir a une raison de l’utiliser pendant ses heures d’ouverture.",
      ] },
      { h: "Limites", p: [
        "Les moyennes masquent la variation : un jour férié ou un renforcement des contrôles peut doubler l’attente habituelle. Les chiffres du CBP sont des estimations déclarées par chaque poste, et un zéro peut signifier une voie fermée plutôt qu’une absence d’attente. Les mois mêlent jours fériés et jours ordinaires, et les données ne disent rien du trafic vers le sud.",
      ] },
      { h: "Conclusion", p: [
        "Pour une voiture en voie standard, le meilleur choix est un début de matinée en semaine et, si possible, Calexico East ; le pire, un dimanche après-midi à Calexico West. S’inscrire à SENTRI supprime l’essentiel de l’attente aux deux postes.",
      ] },
    ],
    figure: "Attente moyenne vers le nord par jour de la semaine et par heure aux postes frontaliers de Calexico (moyennes historiques du CBP).",
  },
  it: {
    title: "Quando conviene attraversare da Mexicali? Andamenti settimanali e stagionali dell’attesa verso nord ai valichi di Calexico",
    abstract: "Con le medie storiche della Dogana e Protezione delle Frontiere degli Stati Uniti (CBP) per ogni giorno, ora e mese a Calexico West e Calexico East (3.360 osservazioni), descrivo quando l’attesa verso nord è più breve per ciascuna corsia. Tra le 6 e le 22 la corsia standard per auto ha una media di 61,1 minuti a Calexico West e 44,9 a Calexico East, mentre le corsie SENTRI si attestano sui 10 minuti in entrambi i valichi e fanno risparmiare 50,8 e 34,9 minuti. Le prime ore del mattino nei giorni feriali sono le più tranquille e i pomeriggi di domenica i più affollati. L’attesa cresce in primavera e a dicembre. Le medie aiutano a pianificare ma non garantiscono nulla: nascondono la variabilità giornaliera.",
    keywords: ["attraversamento di frontiera", "tempi di attesa", "Mexicali", "Calexico", "SENTRI", "serie storiche"],
    sections: [
      { h: "Introduzione", p: [
        "Decine di migliaia di persone passano ogni giorno da Mexicali a Calexico per lavoro, studio e acquisti. L’attesa al valico è la parte più lunga e meno prevedibile del viaggio. Il CBP pubblica i ritardi attuali e, in modo meno visibile, le medie storiche per ora. Questo studio trasforma quelle medie in una domanda pratica: in quale giorno e a che ora l’attesa è più breve, per ogni corsia e ogni mese?",
      ] },
      { h: "Dati e metodi", p: [
        "I dati sono le medie storiche dell’attesa verso nord del CBP (endpoint historicalwaittimes) per Calexico West, aperto 24 ore su 24, e Calexico East, aperto dalle 6 alle 22, per i 12 mesi, i 7 giorni della settimana e ogni ora di apertura: 168 celle al mese a West e 112 a East, 3.360 righe in tutto. Ogni riga riporta l’attesa media in minuti per auto in corsia standard, SENTRI, Ready Lane e pedoni.",
        "Confronto i valichi nelle ore in cui sono entrambi aperti (dalle 6 alle 22), individuo l’ora più breve e più lunga di ogni giorno, calcolo la media diurna di ogni mese e il risparmio SENTRI come attesa standard meno attesa SENTRI. La pagina interattiva mostra anche il ritardo in tempo reale del CBP; questa analisi usa solo le medie storiche.",
      ] },
      { h: "Risultati", p: [
        "Di giorno la corsia standard per auto ha una media di 61,1 minuti a Calexico West e 44,9 a Calexico East. SENTRI registra 10,3 e 10,0 minuti, quindi il programma fa risparmiare 50,8 minuti a West e 34,9 a East in un’ora diurna media. La Ready Lane registra 28,2 minuti a West e 42,6 a East, i pedoni 23,4 e 5,1 minuti.",
        "Le fasce diurne più tranquille sono al primo mattino: domenica alle 6 a West (16 minuti in corsia standard) e venerdì alle 6 a East (5 minuti). Le più affollate sono i pomeriggi di domenica, alle 15 a West (88 minuti) e alle 16 a East (75 minuti), quando rientrano i visitatori del fine settimana. Per mese, West tocca il massimo ad aprile (73,1 minuti) e a dicembre (71,3) e il minimo a ottobre (52,0); East a novembre (57,2) e marzo (56,3), con il minimo ad agosto (32,4).",
      ] },
      { h: "Discussione", p: [
        "L’andamento è coerente con gli spostamenti per lavoro e per svago: le mattine feriali portano un flusso costante di pendolari per cui i valichi sono già organizzati, mentre i pomeriggi di domenica concentrano i rientri. Il risparmio SENTRI, cinque sesti dell’attesa standard a West, misura il valore del programma per chi attraversa spesso. Calexico East è in media più rapido in corsia standard, quindi chi può scegliere ha un motivo per usarlo nei suoi orari.",
      ] },
      { h: "Limiti", p: [
        "Le medie nascondono la variabilità: un giorno festivo o controlli più intensi possono raddoppiare l’attesa tipica. I dati del CBP sono stime dichiarate da ogni valico, e uno zero può indicare una corsia chiusa e non un’attesa nulla. I mesi mescolano festivi e giorni normali, e i dati non dicono nulla del traffico verso sud.",
      ] },
      { h: "Conclusione", p: [
        "Per un’auto in corsia standard la scelta migliore è il primo mattino di un giorno feriale e, se possibile, Calexico East; la peggiore, un pomeriggio di domenica a Calexico West. L’iscrizione a SENTRI elimina gran parte dell’attesa in entrambi i valichi.",
      ] },
    ],
    figure: "Attesa media verso nord per giorno della settimana e ora ai valichi di Calexico (medie storiche del CBP).",
  },
  ja: {
    title: "メヒカリから渡るなら何時がよいか：カレキシコ入国港における北行き待ち時間の週・季節パターン",
    abstract: "米国税関・国境警備局（CBP）が公開するカレキシコ・ウェストとカレキシコ・イーストの曜日・時間・月ごとの過去平均（3,360件）を用い、北行きの待ち時間がいつ最も短いかをレーン別に示す。午前6時から午後10時までの平均は、乗用車の通常レーンがウェストで61.1分、イーストで44.9分。信頼済み旅行者向けのSENTRIはどちらも約10分で、50.8分と34.9分の短縮になる。平日の早朝が最も空き、日曜の午後が最も混む。待ち時間は春と12月に長くなる。平均値は計画の目安であり保証ではない。日ごとのばらつきは隠れている。",
    keywords: ["国境通過", "待ち時間", "メヒカリ", "カレキシコ", "SENTRI", "時系列"],
    sections: [
      { h: "はじめに", p: [
        "毎日数万人が仕事や通学、買い物のためにメヒカリからカレキシコへ渡る。入国港での待ち時間は移動の中で最も長く、最も読みにくい。CBPは現在の待ち時間に加え、目立たない形で時間帯別の過去平均も公開している。本研究はその平均を実用的な問いに置き換える。レーン別・月別に、何曜日の何時が最も待たずに済むのか。",
      ] },
      { h: "データと方法", p: [
        "データはCBPの北行き待ち時間の過去平均（historicalwaittimesエンドポイント）である。24時間開いているカレキシコ・ウェストと、午前6時から午後10時まで開くカレキシコ・イーストについて、12か月・7曜日・開港時間ごとに、ウェストは月168セル、イーストは月112セル、計3,360行。各行に乗用車の通常レーン、SENTRI、Ready Lane、歩行者の平均待ち時間（分）が入っている。",
        "両港が開いている時間帯（午前6時〜午後10時）で比較し、曜日ごとに最短と最長の時間帯を求め、月ごとの日中平均を計算し、SENTRIによる短縮を「通常レーンの待ち時間−SENTRIの待ち時間」として算出した。インタラクティブなページはCBPのリアルタイム情報も表示するが、本分析は過去平均のみを使う。",
      ] },
      { h: "結果", p: [
        "日中の乗用車通常レーンの平均はウェストで61.1分、イーストで44.9分。SENTRIは10.3分と10.0分で、平均的な日中の1時間あたりウェストで50.8分、イーストで34.9分短い。Ready Laneはウェスト28.2分、イースト42.6分、歩行者は23.4分と5.1分である。",
        "日中で最も空くのは早朝で、ウェストは日曜午前6時（通常レーン16分）、イーストは金曜午前6時（5分）。最も混むのは日曜の午後で、ウェストは午後3時（88分）、イーストは午後4時（75分）と、週末の訪問者が戻る時間帯に重なる。月別ではウェストが4月（73.1分）と12月（71.3分）に最長、10月（52.0分）に最短。イーストは11月（57.2分）と3月（56.3分）に長く、8月（32.4分）に最短となる。",
      ] },
      { h: "考察", p: [
        "このパターンは通勤とレジャーの流れと一致する。平日の朝は通勤者の安定した流れがあり、港側も人員を配置している。一方、日曜の午後は帰りの訪問者が集中する。ウェストで通常の待ち時間の6分の5に当たるSENTRIの短縮幅は、頻繁に渡る人にとってのプログラムの価値を示している。通常レーンではイーストのほうが平均して速く、選べるなら開港時間内はイーストを使う理由がある。",
      ] },
      { h: "限界", p: [
        "平均値はばらつきを隠す。祝日や検査の強化で待ち時間が倍になることもある。CBPの数値は各港が報告する推定値で、0はレーン閉鎖を意味する場合がある。月の値には祝日と平日が混在し、南行きの交通については何もわからない。",
      ] },
      { h: "結論", p: [
        "乗用車の通常レーンなら、平日の早朝に、できればカレキシコ・イーストを使うのが最善で、日曜午後のカレキシコ・ウェストが最悪である。SENTRIに登録すれば、どちらの港でも待ち時間の大半がなくなる。",
      ] },
    ],
    figure: "カレキシコ入国港における曜日・時間帯別の北行き平均待ち時間（CBPの過去平均）。",
  },
  zh: {
    title: "从墨西卡利何时过境最好？卡莱克西科口岸北向等候时间的每周与季节规律",
    abstract: "本文使用美国海关与边境保护局（CBP）公布的卡莱克西科西口岸和东口岸按星期、小时和月份统计的历史平均值（3,360 条记录），分车道描述北向等候时间何时最短。上午 6 点至晚上 10 点之间，标准小汽车车道在西口岸平均 61.1 分钟，在东口岸平均 44.9 分钟；可信旅客 SENTRI 车道在两地都约为 10 分钟，分别节省 50.8 和 34.9 分钟。工作日清晨最空闲，星期日下午最拥挤。等候时间在春季和 12 月上升。这些平均值可用于规划，但不能作为保证：它们掩盖了每天的波动。",
    keywords: ["过境", "等候时间", "墨西卡利", "卡莱克西科", "SENTRI", "时间序列"],
    sections: [
      { h: "引言", p: [
        "每天有数万人为工作、上学和购物从墨西卡利进入卡莱克西科。口岸的等候是这段行程中最长、最难预测的部分。CBP 公布实时延误，也以不太显眼的方式公布按小时统计的历史平均值。本研究把这些平均值变成一个实际问题：对每条车道和每个月来说，哪一天的哪个小时等候最短？",
      ] },
      { h: "数据与方法", p: [
        "数据是 CBP 的北向历史平均等候时间（historicalwaittimes 接口），涵盖全天开放的卡莱克西科西口岸和上午 6 点至晚上 10 点开放的东口岸，覆盖 12 个月、一周 7 天和每个开放小时：西口岸每月 168 个单元，东口岸每月 112 个，共 3,360 行。每行给出标准车道小汽车、SENTRI、Ready Lane 和行人的平均等候分钟数。",
        "我在两个口岸都开放的时段（上午 6 点至晚上 10 点）进行比较，找出每天最短和最长的小时，计算每月的白天平均值，并以标准车道等候减去 SENTRI 等候来计算 SENTRI 节省的时间。交互页面还显示 CBP 的实时延误；本分析只使用历史平均值。",
      ] },
      { h: "结果", p: [
        "白天时段，标准小汽车车道在西口岸平均 61.1 分钟，在东口岸平均 44.9 分钟。SENTRI 分别为 10.3 和 10.0 分钟，在一个平均白天小时里，西口岸节省 50.8 分钟，东口岸节省 34.9 分钟。Ready Lane 在西口岸平均 28.2 分钟、东口岸 42.6 分钟，行人分别为 23.4 和 5.1 分钟。",
        "白天最空闲的时段在清晨：西口岸是星期日上午 6 点（标准车道 16 分钟），东口岸是星期五上午 6 点（5 分钟）。最拥挤的是星期日下午，西口岸下午 3 点（88 分钟），东口岸下午 4 点（75 分钟），正是周末访客返回的时候。按月份看，西口岸在 4 月（73.1 分钟）和 12 月（71.3）最长，10 月（52.0）最短；东口岸在 11 月（57.2）和 3 月（56.3）最长，8 月（32.4）最短。",
      ] },
      { h: "讨论", p: [
        "这一规律与通勤和休闲出行相符：工作日早晨有稳定的通勤车流，口岸已据此安排人手；星期日下午则集中了返程的访客。SENTRI 节省的时间在西口岸相当于标准等候的六分之五，量化了这一项目对经常过境者的价值。东口岸的标准车道平均更快，因此可以选择的司机有理由在其开放时间使用东口岸。",
      ] },
      { h: "局限", p: [
        "平均值掩盖了波动：节假日或加强检查可能使等候时间翻倍。CBP 的数字是各口岸报告的估计值，0 可能表示车道关闭而不是无需等候。月度数据混合了节假日和普通日子，也不包含南向交通的信息。",
      ] },
      { h: "结论", p: [
        "对标准车道的小汽车来说，最好选择工作日清晨，并尽量走东口岸；最差的是星期日下午走西口岸。加入 SENTRI 可以在任一口岸省去大部分等候。",
      ] },
    ],
    figure: "卡莱克西科口岸按星期和小时的北向平均等候时间（CBP 历史平均值）。",
  },
};
