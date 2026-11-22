// Interface labels shared by the archive and study pages.
const messages = {
  en: {
    archive: "Study archive", search: "Search studies", placeholder: "Try ice, climate or 005", topic: "Topic",
    allTopics: "All topics", year: "Year", allYears: "All years", order: "Order", recent: "Newest first",
    oldest: "Oldest first", clear: "Clear filters", count: "{shown} of {total} studies", empty: "No studies match these filters.",
    more: "Show more studies", previous: "Previous", next: "Next",
    share: "Share", copy: "Copy link", copied: "Link copied.", manual: "Select and copy the study link",
  },
  es: {
    archive: "Archivo de estudios", search: "Buscar estudios", placeholder: "Prueba hielo, clima o 005", topic: "Tema",
    allTopics: "Todos los temas", year: "Año", allYears: "Todos los años", order: "Orden", recent: "Más recientes primero",
    oldest: "Más antiguos primero", clear: "Limpiar filtros", count: "{shown} de {total} estudios", empty: "Ningún estudio coincide con estos filtros.",
    more: "Mostrar más estudios", previous: "Anterior", next: "Siguiente",
    share: "Compartir", copy: "Copiar enlace", copied: "Enlace copiado.", manual: "Selecciona y copia el enlace del estudio",
  },
  pt: {
    archive: "Arquivo de estudos", search: "Buscar estudos", placeholder: "Tente gelo, clima ou 005", topic: "Tema",
    allTopics: "Todos os temas", year: "Ano", allYears: "Todos os anos", order: "Ordem", recent: "Mais recentes primeiro",
    oldest: "Mais antigos primeiro", clear: "Limpar filtros", count: "{shown} de {total} estudos", empty: "Nenhum estudo corresponde a esses filtros.",
    more: "Mostrar mais estudos", previous: "Anterior", next: "Próximo",
    share: "Compartilhar", copy: "Copiar link", copied: "Link copiado.", manual: "Selecione e copie o link do estudo",
  },
  zh: {
    archive: "研究档案", search: "搜索研究", placeholder: "试试冰、气候或 005", topic: "主题",
    allTopics: "所有主题", year: "年份", allYears: "所有年份", order: "排序", recent: "最新优先",
    oldest: "最早优先", clear: "清除筛选", count: "显示 {shown} 篇，共 {total} 篇研究", empty: "没有符合筛选条件的研究。",
    more: "显示更多研究", previous: "上一篇研究", next: "下一篇研究",
    share: "分享", copy: "复制链接", copied: "链接已复制。", manual: "选择并复制研究链接",
  },
  ja: {
    archive: "研究アーカイブ", search: "研究を検索", placeholder: "氷、気候、005 など", topic: "テーマ",
    allTopics: "すべてのテーマ", year: "年", allYears: "すべての年", order: "並び順", recent: "新しい順",
    oldest: "古い順", clear: "絞り込みを解除", count: "{total} 件中 {shown} 件を表示", empty: "条件に一致する研究はありません。",
    more: "さらに表示", previous: "前の研究", next: "次の研究",
    share: "共有", copy: "リンクをコピー", copied: "リンクをコピーしました。", manual: "研究のリンクを選択してコピー",
  },
  it: {
    archive: "Archivio degli studi", search: "Cerca studi", placeholder: "Prova ghiaccio, clima o 005", topic: "Tema",
    allTopics: "Tutti i temi", year: "Anno", allYears: "Tutti gli anni", order: "Ordine", recent: "Più recenti prima",
    oldest: "Meno recenti prima", clear: "Azzera filtri", count: "{shown} studi su {total}", empty: "Nessuno studio corrisponde a questi filtri.",
    more: "Mostra altri studi", previous: "Precedente", next: "Successivo",
    share: "Condividi", copy: "Copia link", copied: "Link copiato.", manual: "Seleziona e copia il link dello studio",
  },
  fr: {
    archive: "Archives des études", search: "Rechercher des études", placeholder: "Essayez glace, climat ou 005", topic: "Thème",
    allTopics: "Tous les thèmes", year: "Année", allYears: "Toutes les années", order: "Tri", recent: "Plus récentes d’abord",
    oldest: "Plus anciennes d’abord", clear: "Effacer les filtres", count: "{shown} études sur {total}", empty: "Aucune étude ne correspond à ces filtres.",
    more: "Afficher plus d’études", previous: "Précédente", next: "Suivante",
    share: "Partager", copy: "Copier le lien", copied: "Lien copié.", manual: "Sélectionnez et copiez le lien de l’étude",
  },
};

export function archiveCopy(language) {
  return messages[language] ?? messages.en;
}
