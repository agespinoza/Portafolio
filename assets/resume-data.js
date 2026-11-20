// Résumé content. Language-neutral facts (dates, organisations, technologies) live in ROLES, EARLIER,
// EDUCATION and SKILLS; every sentence a reader sees is in TEXT, in the five site languages.
// The current employer is never named (see the portfolio's privacy rule); that role is described by industry.

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/achocoza",
  github: "https://github.com/agespinoza",
  portfolio: "https://agespinoza.github.io/Portafolio/",
};

const TUCSON = "tucson";
const MEXICALI = "mexicali";

export const ROLES = [
  { id: "current", from: "2026-03", to: null, place: TUCSON },
  { id: "space", org: "University of Arizona", from: "2024-02", to: "2026-01", place: TUCSON },
  { id: "freelance", from: "2023-11", to: "2024-02", place: "us" },
  { id: "opus", org: "Opus", from: "2019-05", to: "2023-10", place: TUCSON },
  { id: "nova", org: "NOVA® Home Loans", from: "2017-05", to: "2019-05", place: TUCSON },
  { id: "mining2017", from: "2017-01", to: "2017-04", place: TUCSON },
];

export const EARLIER = [
  { id: "contractor", from: "2008", to: "2016" },
  { id: "cefppbc", org: "Comité Estatal de Protección Pecuaria de Baja California", from: "2015", to: "2016" },
  { id: "upbc", org: "Universidad Politécnica de Baja California", from: "2008", to: "2015" },
  { id: "uvm", org: "Universidad del Valle de México", from: "2014", to: "2015" },
  { id: "cut", org: "Universidad de Tijuana CUT", from: "2013", to: "2015" },
  { id: "itm", org: "Instituto Tecnológico de Mexicali", from: "2014", to: "2014" },
  { id: "uad", org: "Universidad Autónoma de Durango", from: "2013", to: "2014" },
  { id: "teleplan", org: "Teleplan International", from: "2012", to: "2012" },
  { id: "dif", org: "Sistema para el Desarrollo Integral de la Familia (DIF)", from: "2008", to: "2012" },
  { id: "police", org: "Academia de Seguridad Pública de Baja California", from: "2008", to: "2008" },
  { id: "juebc", org: "Junta de Urbanización del Estado", from: "2004", to: "2008" },
  { id: "sidue", org: "Secretaría de Infraestructura, Desarrollo Urbano y Reordenación Territorial", from: "2002", to: "2004" },
];

export const EDUCATION = [
  { id: "phd", school: "IEU Universidad", from: "2014", to: "2016" },
  { id: "msc", school: "Universidad Autónoma de Baja California", from: "2005", to: "2007" },
  { id: "bsc", school: "Instituto Tecnológico de Mexicali", from: "1999", to: "2003" },
];

export const CERTIFICATIONS = [
  "AI Challenges and Opportunities for Leadership",
  "Disruptive Technologies Case Studies for Business Leaders",
  "MLOps Essentials: Model Development and Integration",
  "Stay Lean with Kanban",
  "Taking Charge of Your Career",
];

export const PUBLICATIONS = ["Corrosion analysis in computer systems electronics industry Northwest Mexico"];

export const SKILLS = [
  { id: "software", items: ["Python", "Java · Jakarta EE", "C# · .NET", "JavaScript", "PHP", "R", "VB"] },
  { id: "data", items: ["SQL Server", "Oracle", "Snowflake", "Power BI", "ETL", "MDX", "Crystal Reports"] },
  { id: "cloud", items: ["Azure", "Azure DevOps", "CI/CD", "Big data deployments"] },
  { id: "ai", items: ["MLOps", "Model evaluation", "Generative AI", "Agentic AI"] },
  { id: "delivery", items: ["Requirements", "Scrum · Kanban", "IT management", "University teaching"] },
];

export const SELECTED_PROJECTS = ["17-copper-mine-operations", "02-trajectory-visualization", "09-employee-erp-integration", "16-inspection-model-mlops"];

export const TEXT = {
  en: {
    title: "Résumé | Alicia Espinoza",
    description: "Résumé of Alicia Espinoza, software engineer in data and AI platforms: experience, education, skills and selected projects.",
    back: "← Portfolio",
    kicker: "Résumé",
    headline: "Software Engineer · Data & AI Platforms · Knowledge Systems · Digital Transformation & Technical Leadership",
    location: "Arizona, United States",
    pdf: "Save as PDF",
    pdfHint: "Opens the print dialog; choose “Save as PDF”.",
    summaryTitle: "Summary",
    summary: "Software engineer who turns data and technology into practical solutions people actually use. Over two decades I have worked across mining, finance, government, space operations, automotive inspection and education: building applications, improving data processes and helping teams adopt digital tools for better decisions. My years as a university professor strengthened my passion for sharing knowledge and making complex topics clear for different audiences. Today I focus on AI and knowledge-based platforms that turn trusted information into real value.",
    experienceTitle: "Experience",
    earlierTitle: "Earlier experience, 2002–2016",
    educationTitle: "Education",
    skillsTitle: "Skills",
    certificationsTitle: "Certifications",
    certificationsIssuer: "LinkedIn Learning",
    publicationsTitle: "Publications",
    languagesTitle: "Languages",
    projectsTitle: "Selected projects",
    learning: "{n} LinkedIn Learning courses completed since 2019.",
    learningLink: "See the learning record",
    present: "Present",
    places: { tucson: "Tucson, Arizona, US", us: "United States", mexicali: "Mexicali, Baja California, Mexico" },
    languages: [["English", "Full professional proficiency"], ["Spanish", "Native"]],
    skills: { software: "Software engineering", data: "Data & BI", cloud: "Cloud & DevOps", ai: "AI & MLOps", delivery: "Leadership & delivery" },
    skillItems: { "Big data deployments": "Big data deployments", "Model evaluation": "Model evaluation", "Generative AI": "Generative AI", "Agentic AI": "Agentic AI", Requirements: "Requirements", "IT management": "IT management", "University teaching": "University teaching" },
    roles: {
      current: { role: "Software Engineer II", org: "Current role · mining technology", bullets: [
        "Partner with data scientists to turn data pipelines into production applications.",
        "Design secure, scalable and highly available cloud solutions for analytics platforms.",
        "Lead the operation and maintenance of big data software deployments."] },
      space: { role: "R&D Software Engineer II, Space Institute", bullets: [
        "Developed Java and Python software that automates flight-rule checking for mission operations.",
        "Coordinated programs and projects in the Lunar and Planetary Laboratory, aligned with mission goals.",
        "Built Jakarta EE 10 back-end services and JavaScript front-end features."] },
      freelance: { role: "Software Engineer", org: "Freelance", bullets: [
        "Gathered requirements with stakeholders for system improvements and new projects.",
        "Contributed to project management, system design, testing and implementation."] },
      opus: { role: "Software Engineer", bullets: [
        "Tuned ETL processes and SQL queries and delivered Power BI reporting.",
        "Helped migrate legacy data warehouses between Azure and SQL Server.",
        "Developed vehicle inspection software with VB, C#, R, Python and ASP.NET Core MVC.",
        "Implemented continuous integration in Azure DevOps with Scrum and Kanban."] },
      nova: { role: "Automation Engineer", bullets: [
        "Designed and troubleshot applications that streamline mortgage workflows.",
        "Developed with C#, SQL Server, MDX and JavaScript on ASP.NET MVC.",
        "Worked with application support and BI teams to improve the company ERP."] },
      mining2017: { role: "Software Programmer", org: "Mining operations software", bullets: [
        "Supported operations and business intelligence systems for mining operations.",
        "Enhanced existing applications with T-SQL, MDX and JavaScript."] },
    },
    earlier: {
      contractor: ["Software Engineer", "Contractor / freelance", "Web and back-end development (Java, C++, C#, PHP), SQL Server and Oracle administration, IT consulting and online training."],
      cefppbc: ["IT Manager", null, "IT operations, network and server infrastructure, databases and administrative web systems."],
      upbc: ["Associate Professor", null, "Courses in information technology, mechatronics, energy and manufacturing technologies."],
      uvm: ["Associate Professor", null, "Programming fundamentals, algorithms and web application development."],
      cut: ["Associate Professor", null, "Color theory for educators, IT support and student mentoring."],
      itm: ["Associate Professor", null, "Computer architecture, networking, programming and business intelligence."],
      uad: ["Associate Professor", null, "IT fundamentals with Excel, VBA and Access labs."],
      teleplan: ["Quality Engineer", null, "Inspection criteria, test cases and defect documentation."],
      dif: ["Software Engineer", null, "Designed an Oracle and C# ERP integrated with human resources; Citrix and VMware support."],
      police: ["IT Manager, Police Academy", null, "Network plans, IT budgets and staff management."],
      juebc: ["Software Engineer", null, "Web and desktop systems with PowerBuilder, Sybase, Oracle, C#, ASP and Crystal Reports."],
      sidue: ["Software Engineer", null, "Helpdesk systems, incident management and web and desktop applications."],
    },
    education: {
      phd: "Ph.D. in Education, Educational and Instructional Technology",
      msc: "M.Sc. in Information and Communication Technologies, E-Business",
      bsc: "B.Sc. in Computer Systems Engineering, Distributed Systems",
    },
  },

  es: {
    title: "Currículum | Alicia Espinoza",
    description: "Currículum de Alicia Espinoza, ingeniera de software en plataformas de datos e IA: experiencia, formación, habilidades y proyectos destacados.",
    back: "← Portafolio",
    kicker: "Currículum",
    headline: "Ingeniera de software · Plataformas de datos e IA · Sistemas de conocimiento · Transformación digital y liderazgo técnico",
    location: "Arizona, Estados Unidos",
    pdf: "Guardar como PDF",
    pdfHint: "Abre el cuadro de impresión; elige «Guardar como PDF».",
    summaryTitle: "Resumen",
    summary: "Ingeniera de software que convierte los datos y la tecnología en soluciones prácticas que la gente realmente usa. En dos décadas he trabajado en minería, finanzas, gobierno, operaciones espaciales, inspección vehicular y educación: desarrollando aplicaciones, mejorando procesos de datos y ayudando a los equipos a adoptar herramientas digitales para decidir mejor. Mis años como profesora universitaria fortalecieron mi pasión por compartir conocimiento y explicar temas complejos con claridad a públicos distintos. Hoy me enfoco en plataformas de IA y de conocimiento que convierten información confiable en valor real.",
    experienceTitle: "Experiencia",
    earlierTitle: "Experiencia previa, 2002–2016",
    educationTitle: "Formación",
    skillsTitle: "Habilidades",
    certificationsTitle: "Certificaciones",
    certificationsIssuer: "LinkedIn Learning",
    publicationsTitle: "Publicaciones",
    languagesTitle: "Idiomas",
    projectsTitle: "Proyectos destacados",
    learning: "{n} cursos completados en LinkedIn Learning desde 2019.",
    learningLink: "Ver el registro de aprendizaje",
    present: "Actualidad",
    places: { tucson: "Tucson, Arizona, EE. UU.", us: "Estados Unidos", mexicali: "Mexicali, Baja California, México" },
    languages: [["Inglés", "Dominio profesional completo"], ["Español", "Nativo"]],
    skills: { software: "Ingeniería de software", data: "Datos y BI", cloud: "Nube y DevOps", ai: "IA y MLOps", delivery: "Liderazgo y entrega" },
    skillItems: { "Big data deployments": "Despliegues de big data", "Model evaluation": "Evaluación de modelos", "Generative AI": "IA generativa", "Agentic AI": "IA agéntica", Requirements: "Requisitos", "IT management": "Gestión de TI", "University teaching": "Docencia universitaria" },
    roles: {
      current: { role: "Ingeniera de software II", org: "Puesto actual · tecnología minera", bullets: [
        "Colaboro con científicos de datos para convertir pipelines de datos en aplicaciones de producción.",
        "Diseño soluciones en la nube seguras, escalables y de alta disponibilidad para plataformas analíticas.",
        "Dirijo la operación y el mantenimiento de despliegues de software de big data."] },
      space: { role: "Ingeniera de software de I+D II, Space Institute", bullets: [
        "Desarrollé software en Java y Python que automatiza la verificación de reglas de vuelo en operaciones de misión.",
        "Coordiné programas y proyectos del Lunar and Planetary Laboratory, alineados con los objetivos de la misión.",
        "Construí servicios back-end con Jakarta EE 10 y funciones front-end en JavaScript."] },
      freelance: { role: "Ingeniera de software", org: "Independiente", bullets: [
        "Levanté requisitos con los interesados para mejoras de sistemas y proyectos nuevos.",
        "Participé en la gestión de proyectos, el diseño, las pruebas y la implementación de sistemas."] },
      opus: { role: "Ingeniera de software", bullets: [
        "Optimicé procesos ETL y consultas SQL y entregué reportes en Power BI.",
        "Apoyé la migración de almacenes de datos heredados entre Azure y SQL Server.",
        "Desarrollé software de inspección vehicular con VB, C#, R, Python y ASP.NET Core MVC.",
        "Implementé integración continua en Azure DevOps con Scrum y Kanban."] },
      nova: { role: "Ingeniera de automatización", bullets: [
        "Diseñé y depuré aplicaciones que agilizan los flujos hipotecarios.",
        "Desarrollé con C#, SQL Server, MDX y JavaScript sobre ASP.NET MVC.",
        "Trabajé con los equipos de soporte y de BI para mejorar el ERP de la empresa."] },
      mining2017: { role: "Programadora de software", org: "Software para operaciones mineras", bullets: [
        "Apoyé sistemas de operación e inteligencia de negocios para operaciones mineras.",
        "Mejoré aplicaciones existentes con T-SQL, MDX y JavaScript."] },
    },
    earlier: {
      contractor: ["Ingeniera de software", "Contratista / independiente", "Desarrollo web y back-end (Java, C++, C#, PHP), administración de SQL Server y Oracle, consultoría de TI y capacitación en línea."],
      cefppbc: ["Gerente de TI", null, "Operación de TI, infraestructura de redes y servidores, bases de datos y sistemas administrativos web."],
      upbc: ["Profesora por contrato", null, "Cursos de tecnologías de la información, mecatrónica, energía y tecnologías de manufactura."],
      uvm: ["Profesora por contrato", null, "Fundamentos de programación, algoritmos y desarrollo de aplicaciones web."],
      cut: ["Profesora por contrato", null, "Teoría del color para docentes, soporte de TI y tutoría de estudiantes."],
      itm: ["Profesora interina", null, "Arquitectura de computadoras, redes, programación e inteligencia de negocios."],
      uad: ["Profesora por contrato", null, "Fundamentos de informática con prácticas en Excel, VBA y Access."],
      teleplan: ["Ingeniera de calidad", null, "Criterios de inspección, casos de prueba y documentación de defectos."],
      dif: ["Ingeniera de software", null, "Diseñé un ERP en Oracle y C# integrado con recursos humanos; soporte de Citrix y VMware."],
      police: ["Gerente de TI de la Academia de Policía", null, "Planes de red, presupuestos de TI y gestión del personal."],
      juebc: ["Ingeniera de software", null, "Sistemas web y de escritorio con PowerBuilder, Sybase, Oracle, C#, ASP y Crystal Reports."],
      sidue: ["Ingeniera de software", null, "Sistemas de mesa de ayuda, gestión de incidentes y aplicaciones web y de escritorio."],
    },
    education: {
      phd: "Doctorado en Educación, Tecnología Educativa e Instruccional",
      msc: "Maestría en Tecnologías de la Información y la Comunicación, Negocios Electrónicos",
      bsc: "Ingeniería en Sistemas Computacionales, Sistemas Distribuidos",
    },
  },

  ja: {
    title: "履歴書 | Alicia Espinoza",
    description: "データ・AIプラットフォームのソフトウェアエンジニア、Alicia Espinozaの履歴書：職歴、学歴、スキル、主なプロジェクト。",
    back: "← ポートフォリオ",
    kicker: "履歴書",
    headline: "ソフトウェアエンジニア · データ・AIプラットフォーム · ナレッジシステム · デジタルトランスフォーメーションと技術リーダーシップ",
    location: "米国アリゾナ州",
    pdf: "PDFとして保存",
    pdfHint: "印刷ダイアログが開きます。「PDFとして保存」を選んでください。",
    summaryTitle: "概要",
    summary: "データとテクノロジーを、人が実際に使える実用的なソリューションに変えるソフトウェアエンジニアです。20年以上にわたり、鉱業、金融、行政、宇宙運用、車両検査、教育の分野で、アプリケーション開発、データプロセスの改善、そしてより良い意思決定のためのデジタルツール導入の支援に携わってきました。大学教員としての経験から、知識を共有し、複雑なテーマをさまざまな人にわかりやすく伝えることへの情熱が深まりました。現在は、信頼できる情報を実際の価値に変えるAIとナレッジ基盤のプラットフォームに注力しています。",
    experienceTitle: "職歴",
    earlierTitle: "それ以前の職歴（2002〜2016年）",
    educationTitle: "学歴",
    skillsTitle: "スキル",
    certificationsTitle: "認定資格",
    certificationsIssuer: "LinkedIn Learning",
    publicationsTitle: "論文・出版物",
    languagesTitle: "言語",
    projectsTitle: "主なプロジェクト",
    learning: "2019年以降、LinkedIn Learningで{n}件のコースを修了。",
    learningLink: "学習記録を見る",
    present: "現在",
    places: { tucson: "米国アリゾナ州ツーソン", us: "米国", mexicali: "メキシコ、バハ・カリフォルニア州メヒカリ" },
    languages: [["英語", "ビジネス上級"], ["スペイン語", "ネイティブ"]],
    skills: { software: "ソフトウェア開発", data: "データとBI", cloud: "クラウドとDevOps", ai: "AIとMLOps", delivery: "リーダーシップと推進" },
    skillItems: { "Big data deployments": "ビッグデータ基盤の運用", "Model evaluation": "モデル評価", "Generative AI": "生成AI", "Agentic AI": "エージェント型AI", Requirements: "要件定義", "IT management": "IT管理", "University teaching": "大学での教育" },
    roles: {
      current: { role: "ソフトウェアエンジニア II", org: "現職 · 鉱業テクノロジー", bullets: [
        "データサイエンティストと協力し、データパイプラインを本番アプリケーションに展開しています。",
        "分析プラットフォーム向けに、安全で拡張性と高可用性を備えたクラウドソリューションを設計しています。",
        "ビッグデータソフトウェアの運用と保守を主導しています。"] },
      space: { role: "R&Dソフトウェアエンジニア II（Space Institute）", bullets: [
        "ミッション運用のフライトルール確認を自動化するソフトウェアをJavaとPythonで開発しました。",
        "Lunar and Planetary Laboratoryのプログラムとプロジェクトを、ミッション目標に沿って調整しました。",
        "Jakarta EE 10のバックエンドとJavaScriptのフロントエンド機能を開発しました。"] },
      freelance: { role: "ソフトウェアエンジニア", org: "フリーランス", bullets: [
        "システム改善と新規プロジェクトのために、関係者から要件を収集しました。",
        "プロジェクト管理、システム設計、テスト、導入に携わりました。"] },
      opus: { role: "ソフトウェアエンジニア", bullets: [
        "ETL処理とSQLクエリを最適化し、Power BIのレポートを提供しました。",
        "AzureとSQL Server間でのレガシーデータウェアハウスの移行を支援しました。",
        "VB、C#、R、Python、ASP.NET Core MVCで車両検査ソフトウェアを開発しました。",
        "ScrumとKanbanのもと、Azure DevOpsで継続的インテグレーションを導入しました。"] },
      nova: { role: "オートメーションエンジニア", bullets: [
        "住宅ローン業務を効率化するアプリケーションを設計し、問題を解決しました。",
        "ASP.NET MVC上でC#、SQL Server、MDX、JavaScriptを使って開発しました。",
        "アプリケーションサポートとBIのチームと協力し、社内ERPを改善しました。"] },
      mining2017: { role: "ソフトウェアプログラマー", org: "鉱山操業ソフトウェア", bullets: [
        "鉱山操業向けの業務システムとBIシステムを支援しました。",
        "T-SQL、MDX、JavaScriptで既存アプリケーションを改善しました。"] },
    },
    earlier: {
      contractor: ["ソフトウェアエンジニア", "契約・フリーランス", "Web・バックエンド開発（Java、C++、C#、PHP）、SQL ServerとOracleの管理、ITコンサルティング、オンライン研修。"],
      cefppbc: ["IT部門長", null, "IT運用、ネットワークとサーバー基盤、データベース、Web業務システム。"],
      upbc: ["契約教員", null, "情報技術、メカトロニクス、エネルギー、製造技術の授業。"],
      uvm: ["契約教員", null, "プログラミングの基礎、アルゴリズム、Webアプリケーション開発。"],
      cut: ["契約教員", null, "教育者向けの色彩理論、ITサポート、学生の指導。"],
      itm: ["臨時教員", null, "コンピューターアーキテクチャ、ネットワーク、プログラミング、BI。"],
      uad: ["契約教員", null, "Excel、VBA、Accessの演習を含む情報処理の基礎。"],
      teleplan: ["品質エンジニア", null, "検査基準、テストケース、不具合の記録。"],
      dif: ["ソフトウェアエンジニア", null, "人事と連携するERPをOracleとC#で設計。CitrixとVMwareのサポート。"],
      police: ["警察学校 IT部門長", null, "ネットワーク計画、IT予算、スタッフ管理。"],
      juebc: ["ソフトウェアエンジニア", null, "PowerBuilder、Sybase、Oracle、C#、ASP、Crystal ReportsによるWeb・デスクトップシステム。"],
      sidue: ["ソフトウェアエンジニア", null, "ヘルプデスクシステム、インシデント管理、Web・デスクトップアプリケーション。"],
    },
    education: {
      phd: "教育学博士（教育工学・インストラクショナルテクノロジー）",
      msc: "情報通信技術修士（eビジネス）",
      bsc: "コンピューターシステム工学学士（分散システム）",
    },
  },

  it: {
    title: "Curriculum | Alicia Espinoza",
    description: "Curriculum di Alicia Espinoza, ingegnera del software per piattaforme di dati e IA: esperienza, formazione, competenze e progetti selezionati.",
    back: "← Portfolio",
    kicker: "Curriculum",
    headline: "Ingegnera del software · Piattaforme di dati e IA · Sistemi di conoscenza · Trasformazione digitale e leadership tecnica",
    location: "Arizona, Stati Uniti",
    pdf: "Salva come PDF",
    pdfHint: "Apre la finestra di stampa; scegli «Salva come PDF».",
    summaryTitle: "Profilo",
    summary: "Ingegnera del software che trasforma dati e tecnologia in soluzioni pratiche che le persone usano davvero. In vent'anni ho lavorato nei settori minerario, finanziario, pubblico, delle operazioni spaziali, dell'ispezione dei veicoli e dell'istruzione: sviluppando applicazioni, migliorando i processi dei dati e aiutando i team ad adottare strumenti digitali per decidere meglio. Gli anni come docente universitaria hanno rafforzato la mia passione per la condivisione della conoscenza e per rendere chiari temi complessi a pubblici diversi. Oggi mi concentro su piattaforme di IA e di conoscenza che trasformano informazioni affidabili in valore reale.",
    experienceTitle: "Esperienza",
    earlierTitle: "Esperienza precedente, 2002–2016",
    educationTitle: "Formazione",
    skillsTitle: "Competenze",
    certificationsTitle: "Certificazioni",
    certificationsIssuer: "LinkedIn Learning",
    publicationsTitle: "Pubblicazioni",
    languagesTitle: "Lingue",
    projectsTitle: "Progetti selezionati",
    learning: "{n} corsi completati su LinkedIn Learning dal 2019.",
    learningLink: "Consulta il registro della formazione",
    present: "Oggi",
    places: { tucson: "Tucson, Arizona, USA", us: "Stati Uniti", mexicali: "Mexicali, Bassa California, Messico" },
    languages: [["Inglese", "Competenza professionale completa"], ["Spagnolo", "Madrelingua"]],
    skills: { software: "Ingegneria del software", data: "Dati e BI", cloud: "Cloud e DevOps", ai: "IA e MLOps", delivery: "Leadership e delivery" },
    skillItems: { "Big data deployments": "Distribuzioni big data", "Model evaluation": "Valutazione dei modelli", "Generative AI": "IA generativa", "Agentic AI": "IA agentica", Requirements: "Analisi dei requisiti", "IT management": "Gestione IT", "University teaching": "Docenza universitaria" },
    roles: {
      current: { role: "Ingegnera del software II", org: "Ruolo attuale · tecnologia mineraria", bullets: [
        "Collaboro con data scientist per trasformare pipeline di dati in applicazioni di produzione.",
        "Progetto soluzioni cloud sicure, scalabili e ad alta disponibilità per piattaforme analitiche.",
        "Guido l'esercizio e la manutenzione di distribuzioni software big data."] },
      space: { role: "Ingegnera del software R&S II, Space Institute", bullets: [
        "Ho sviluppato software in Java e Python che automatizza la verifica delle regole di volo nelle operazioni di missione.",
        "Ho coordinato programmi e progetti del Lunar and Planetary Laboratory, in linea con gli obiettivi di missione.",
        "Ho realizzato servizi back-end con Jakarta EE 10 e funzionalità front-end in JavaScript."] },
      freelance: { role: "Ingegnera del software", org: "Libera professionista", bullets: [
        "Ho raccolto i requisiti con gli stakeholder per miglioramenti dei sistemi e nuovi progetti.",
        "Ho contribuito a gestione dei progetti, progettazione, test e implementazione dei sistemi."] },
      opus: { role: "Ingegnera del software", bullets: [
        "Ho ottimizzato processi ETL e query SQL e realizzato report in Power BI.",
        "Ho supportato la migrazione di data warehouse legacy tra Azure e SQL Server.",
        "Ho sviluppato software di ispezione dei veicoli con VB, C#, R, Python e ASP.NET Core MVC.",
        "Ho introdotto l'integrazione continua in Azure DevOps con Scrum e Kanban."] },
      nova: { role: "Ingegnera dell'automazione", bullets: [
        "Ho progettato e corretto applicazioni che snelliscono i flussi dei mutui.",
        "Ho sviluppato con C#, SQL Server, MDX e JavaScript su ASP.NET MVC.",
        "Ho collaborato con i team di supporto applicativo e BI per migliorare l'ERP aziendale."] },
      mining2017: { role: "Programmatrice software", org: "Software per operazioni minerarie", bullets: [
        "Ho supportato sistemi operativi e di business intelligence per operazioni minerarie.",
        "Ho migliorato applicazioni esistenti con T-SQL, MDX e JavaScript."] },
    },
    earlier: {
      contractor: ["Ingegnera del software", "Consulente / libera professionista", "Sviluppo web e back-end (Java, C++, C#, PHP), amministrazione di SQL Server e Oracle, consulenza IT e formazione online."],
      cefppbc: ["Responsabile IT", null, "Gestione IT, infrastruttura di rete e server, database e sistemi amministrativi web."],
      upbc: ["Docente a contratto", null, "Corsi di tecnologie dell'informazione, meccatronica, energia e tecnologie di produzione."],
      uvm: ["Docente a contratto", null, "Fondamenti di programmazione, algoritmi e sviluppo di applicazioni web."],
      cut: ["Docente a contratto", null, "Teoria del colore per insegnanti, supporto IT e tutoraggio degli studenti."],
      itm: ["Docente con incarico temporaneo", null, "Architettura dei calcolatori, reti, programmazione e business intelligence."],
      uad: ["Docente a contratto", null, "Fondamenti di informatica con laboratori di Excel, VBA e Access."],
      teleplan: ["Ingegnera della qualità", null, "Criteri di ispezione, casi di test e documentazione dei difetti."],
      dif: ["Ingegnera del software", null, "Ho progettato un ERP in Oracle e C# integrato con le risorse umane; supporto Citrix e VMware."],
      police: ["Responsabile IT dell'Accademia di polizia", null, "Piani di rete, budget IT e gestione del personale."],
      juebc: ["Ingegnera del software", null, "Sistemi web e desktop con PowerBuilder, Sybase, Oracle, C#, ASP e Crystal Reports."],
      sidue: ["Ingegnera del software", null, "Sistemi di help desk, gestione degli incidenti e applicazioni web e desktop."],
    },
    education: {
      phd: "Dottorato in Scienze dell'educazione, Tecnologie educative e didattiche",
      msc: "Laurea magistrale in Tecnologie dell'informazione e della comunicazione, E-business",
      bsc: "Laurea in Ingegneria dei sistemi informatici, Sistemi distribuiti",
    },
  },

  fr: {
    title: "CV | Alicia Espinoza",
    description: "CV d'Alicia Espinoza, ingénieure logiciel en plateformes de données et d'IA : expérience, formation, compétences et projets choisis.",
    back: "← Portfolio",
    kicker: "CV",
    headline: "Ingénieure logiciel · Plateformes de données et d'IA · Systèmes de connaissances · Transformation numérique et leadership technique",
    location: "Arizona, États-Unis",
    pdf: "Enregistrer en PDF",
    pdfHint: "Ouvre la fenêtre d'impression ; choisissez « Enregistrer au format PDF ».",
    summaryTitle: "Profil",
    summary: "Ingénieure logiciel qui transforme les données et la technologie en solutions concrètes que les gens utilisent vraiment. En vingt ans, j'ai travaillé dans les mines, la finance, l'administration publique, les opérations spatiales, l'inspection automobile et l'éducation : développement d'applications, amélioration des processus de données et accompagnement des équipes dans l'adoption d'outils numériques pour mieux décider. Mes années de professeure d'université ont renforcé ma passion pour le partage des connaissances et l'explication claire de sujets complexes à des publics variés. Aujourd'hui, je me consacre aux plateformes d'IA et de connaissances qui transforment une information fiable en valeur réelle.",
    experienceTitle: "Expérience",
    earlierTitle: "Expérience antérieure, 2002–2016",
    educationTitle: "Formation",
    skillsTitle: "Compétences",
    certificationsTitle: "Certifications",
    certificationsIssuer: "LinkedIn Learning",
    publicationsTitle: "Publications",
    languagesTitle: "Langues",
    projectsTitle: "Projets choisis",
    learning: "{n} cours suivis sur LinkedIn Learning depuis 2019.",
    learningLink: "Voir le registre de formation",
    present: "Aujourd'hui",
    places: { tucson: "Tucson, Arizona, États-Unis", us: "États-Unis", mexicali: "Mexicali, Basse-Californie, Mexique" },
    languages: [["Anglais", "Maîtrise professionnelle complète"], ["Espagnol", "Langue maternelle"]],
    skills: { software: "Génie logiciel", data: "Données et BI", cloud: "Cloud et DevOps", ai: "IA et MLOps", delivery: "Leadership et pilotage" },
    skillItems: { "Big data deployments": "Déploiements big data", "Model evaluation": "Évaluation de modèles", "Generative AI": "IA générative", "Agentic AI": "IA agentique", Requirements: "Analyse des besoins", "IT management": "Direction informatique", "University teaching": "Enseignement universitaire" },
    roles: {
      current: { role: "Ingénieure logiciel II", org: "Poste actuel · technologie minière", bullets: [
        "Je collabore avec des scientifiques des données pour transformer des pipelines en applications de production.",
        "Je conçois des solutions cloud sécurisées, évolutives et hautement disponibles pour des plateformes analytiques.",
        "Je dirige l'exploitation et la maintenance de déploiements logiciels big data."] },
      space: { role: "Ingénieure logiciel R&D II, Space Institute", bullets: [
        "Développement en Java et Python d'un logiciel qui automatise la vérification des règles de vol pour les opérations de mission.",
        "Coordination de programmes et de projets du Lunar and Planetary Laboratory, alignés sur les objectifs de mission.",
        "Services back-end en Jakarta EE 10 et fonctionnalités front-end en JavaScript."] },
      freelance: { role: "Ingénieure logiciel", org: "Indépendante", bullets: [
        "Recueil des besoins auprès des parties prenantes pour l'amélioration de systèmes et de nouveaux projets.",
        "Participation à la gestion de projet, à la conception, aux tests et à la mise en œuvre."] },
      opus: { role: "Ingénieure logiciel", bullets: [
        "Optimisation de processus ETL et de requêtes SQL, et rapports Power BI.",
        "Appui à la migration d'entrepôts de données historiques entre Azure et SQL Server.",
        "Développement d'un logiciel d'inspection de véhicules en VB, C#, R, Python et ASP.NET Core MVC.",
        "Mise en place de l'intégration continue dans Azure DevOps avec Scrum et Kanban."] },
      nova: { role: "Ingénieure en automatisation", bullets: [
        "Conception et dépannage d'applications qui fluidifient les processus de prêt immobilier.",
        "Développement en C#, SQL Server, MDX et JavaScript sur ASP.NET MVC.",
        "Collaboration avec les équipes de support applicatif et de BI pour améliorer l'ERP de l'entreprise."] },
      mining2017: { role: "Programmeuse", org: "Logiciels d'exploitation minière", bullets: [
        "Appui aux systèmes d'exploitation et de business intelligence pour des opérations minières.",
        "Amélioration d'applications existantes en T-SQL, MDX et JavaScript."] },
    },
    earlier: {
      contractor: ["Ingénieure logiciel", "Prestataire / indépendante", "Développement web et back-end (Java, C++, C#, PHP), administration de SQL Server et Oracle, conseil informatique et formation en ligne."],
      cefppbc: ["Responsable informatique", null, "Exploitation informatique, infrastructure réseau et serveurs, bases de données et systèmes administratifs web."],
      upbc: ["Professeure vacataire", null, "Cours de technologies de l'information, mécatronique, énergie et technologies de fabrication."],
      uvm: ["Professeure vacataire", null, "Bases de la programmation, algorithmique et développement d'applications web."],
      cut: ["Professeure vacataire", null, "Théorie des couleurs pour enseignants, support informatique et tutorat d'étudiants."],
      itm: ["Professeure intérimaire", null, "Architecture des ordinateurs, réseaux, programmation et business intelligence."],
      uad: ["Professeure vacataire", null, "Bases de l'informatique avec travaux pratiques sur Excel, VBA et Access."],
      teleplan: ["Ingénieure qualité", null, "Critères d'inspection, cas de test et documentation des défauts."],
      dif: ["Ingénieure logiciel", null, "Conception d'un ERP en Oracle et C# intégré aux ressources humaines ; support Citrix et VMware."],
      police: ["Responsable informatique de l'Académie de police", null, "Plans réseau, budgets informatiques et gestion du personnel."],
      juebc: ["Ingénieure logiciel", null, "Systèmes web et bureautiques en PowerBuilder, Sybase, Oracle, C#, ASP et Crystal Reports."],
      sidue: ["Ingénieure logiciel", null, "Systèmes d'assistance, gestion des incidents et applications web et bureautiques."],
    },
    education: {
      phd: "Doctorat en sciences de l'éducation, technologies éducatives",
      msc: "Master en technologies de l'information et de la communication, commerce électronique",
      bsc: "Diplôme d'ingénieur en systèmes informatiques, systèmes distribués",
    },
  },
};

export const MEXICO_ROLES = new Set(EARLIER.map(e => e.id).filter(id => id !== "contractor"));
export { MEXICALI };
