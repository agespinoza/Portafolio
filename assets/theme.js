// Light/dark theme switch shared by the portfolio and the Daily Data Lab (same origin, so one choice
// applies to both). Until the visitor picks, the page follows the operating system. The inline snippet in
// each page's <head> applies a saved choice before the first paint, so there is no flash.
export const THEME_KEY = "ae-theme";

/** The theme on screen. A page that is night-themed by default (lab Day 003) passes nightDefault. */
export function effectiveTheme(nightDefault = false) {
  const saved = document.documentElement.dataset.theme;
  if (saved === "light" || saved === "dark") return saved;
  if (nightDefault) return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { window.localStorage.setItem(THEME_KEY, theme); } catch (error) { /* storage blocked: the choice lasts for this page only */ }
}

export function toggleTheme(nightDefault = false) {
  const next = effectiveTheme(nightDefault) === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
