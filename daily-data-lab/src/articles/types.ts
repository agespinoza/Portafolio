// Research articles: one per Daily Data Lab day, in every site language, at #/day/N/article.
export interface ArticleSection { h: string; p: string[] }
export interface ArticleText {
  title: string;
  abstract: string;
  keywords: string[];
  sections: ArticleSection[];
  /** Caption of Figure 1 (the day's preview image, drawn from the day's real data). */
  figure: string;
}
export type ArticleSet = Record<"en" | "es" | "pt" | "fr" | "it" | "ja" | "zh", ArticleText>;
