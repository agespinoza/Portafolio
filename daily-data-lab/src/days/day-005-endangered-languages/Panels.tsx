import { useState } from "react";
import { type CountryStat, type Language, type Totals, FAMILIES, MACROAREAS, aesColor, glottologUrl, isPriority, medColor, wilson } from "./data";
import { aesName, medName } from "./Charts";
import { tr, num, pct, countryName } from "./text";

/* ---------- KPI card ---------- */
export function KpiCard({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className={`stat${accent ? " stat--accent" : ""}`}>
      <span className="mono">{label}</span>
      <strong>{value}</strong>
      <span className="stat__note">{note}</span>
    </div>
  );
}

/* ---------- country ranking ---------- */
type SortKey = "endangered" | "priority" | "share";
export const MIN_COUNTRY = 10;
export function RankingTable({ countries, active, onSelect, language }: {
  countries: CountryStat[]; active: string | null; onSelect: (code: string | null) => void; language: string;
}) {
  const [sort, setSort] = useState<SortKey>("endangered");
  const rows = countries
    .filter((c) => sort !== "share" || c.living >= MIN_COUNTRY)
    .map((c) => ({ ...c, share: c.living ? c.endangered / c.living : 0 }))
    .sort((a, b) => b[sort] - a[sort] || b.languages - a.languages)
    .slice(0, 15);
  const SORTS: [SortKey, string, string][] = [["endangered", "sortEndangered", "Endangered"], ["priority", "sortPriority", "Priority"], ["share", "sortShare", "Share"]];
  return (
    <div>
      <div className="seg seg--small el-sort">
        <span className="mono">{tr(language, "sortBy", "Rank by")}</span>
        <div className="seg__opts" role="radiogroup" aria-label={tr(language, "sortBy", "Rank by")}>
          {SORTS.map(([k, key, en]) => (
            <button key={k} type="button" role="radio" aria-checked={sort === k} className={sort === k ? "on" : ""} onClick={() => setSort(k)}>{tr(language, key, en)}</button>
          ))}
        </div>
      </div>
      <div className="lp-table-wrap">
        <table className="lp-table el-table">
          <thead><tr>
            <th scope="col">#</th><th scope="col">{tr(language, "country", "Country")}</th>
            <th scope="col" className="num">{tr(language, "colLanguages", "Languages")}</th>
            <th scope="col" className="num">{tr(language, "colEndangered", "Endangered")}</th>
            <th scope="col" className="num">{tr(language, "colShare", "Share of living (95% CI)")}</th>
            <th scope="col" className="num">{tr(language, "colPriority", "Priority")}</th>
          </tr></thead>
          <tbody>
            {rows.map((c, i) => {
              const [lo, hi] = wilson(c.endangered, c.living);
              const on = active === c.code;
              return (
                <tr key={c.code} className={on ? "on" : ""}>
                  <td>{i + 1}</td>
                  <td><button type="button" className="el-link" aria-pressed={on} onClick={() => onSelect(on ? null : c.code)}>{countryName(c.code, language)}</button></td>
                  <td className="num">{num(c.languages, language)}</td>
                  <td className="num">{num(c.endangered, language)}</td>
                  <td className="num">{pct(c.share, language)} <span className="el-n">({pct(lo, language)}–{pct(hi, language)})</span></td>
                  <td className="num">{num(c.priority, language)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="lp-small">{tr(language, "rankNote", "A language spoken in several countries counts in each. The share ranking only includes countries with at least {n} living languages. Click a country to filter the page.", { n: MIN_COUNTRY })}</p>
    </div>
  );
}

/* ---------- language profile ---------- */
export function LanguageProfile({ lang, language }: { lang: Language | null; language: string }) {
  if (!lang) return <p className="muted pad">{tr(language, "profileEmpty", "Pick a language on the map, in the list, or with the search box.")}</p>;
  const yearsAgo = lang.medYear ? new Date().getFullYear() - lang.medYear : null;
  return (
    <div className="el-profile">
      <h3>{lang.name}{isPriority(lang) && <span className="el-badge">{tr(language, "priorityBadge", "priority")}</span>}</h3>
      <dl className="lp-kv">
        <div><dt>Glottocode</dt><dd>{lang.code}</dd></div>
        {lang.iso && <div><dt>ISO 639-3</dt><dd>{lang.iso}</dd></div>}
        <div><dt>{tr(language, "family", "Family")}</dt><dd>{lang.family >= 0 ? FAMILIES[lang.family].name : tr(language, "isolateCap", "Isolate")}</dd></div>
        <div><dt>{tr(language, "macroarea", "Macroarea")}</dt><dd>{lang.macro >= 0 ? tr(language, `macro${lang.macro}`, MACROAREAS[lang.macro]) : "—"}</dd></div>
        <div><dt>{tr(language, "countries", "Countries")}</dt><dd>{lang.countries.map((c) => countryName(c, language)).join(", ") || "—"}</dd></div>
        <div><dt>{tr(language, "status", "Endangerment (AES)")}</dt><dd><i className="el-sw" style={{ background: aesColor(lang.aes) }} />{aesName(lang.aes, language)}</dd></div>
        <div><dt>{tr(language, "description", "Best description (MED)")}</dt><dd><i className="el-sw" style={{ background: medColor(lang.med) }} />{medName(lang.med, language)}{lang.medYear ? ` · ${lang.medYear}` : ""}</dd></div>
        {lang.firstYear && <div><dt>{tr(language, "firstDoc", "Oldest description linked")}</dt><dd>{lang.firstYear}</dd></div>}
        <div><dt>{tr(language, "typology", "In typology databases")}</dt><dd>{[lang.grambank ? "Grambank" : null, lang.wals ? "WALS" : null].filter(Boolean).join(" · ") || tr(language, "none", "none")}</dd></div>
        {lang.lat != null && <div><dt>{tr(language, "coords", "Coordinates")}</dt><dd>{lang.lat.toFixed(2)}°, {lang.lon!.toFixed(2)}°</dd></div>}
      </dl>
      {yearsAgo != null && lang.aes >= 2 && lang.aes <= 5 && (
        <p className="lp-flag">{tr(language, "profileAge", "Its best description is {years} years old.", { years: yearsAgo })}</p>
      )}
      <p className="lp-foot"><a href={glottologUrl(lang.code)} target="_blank" rel="noopener">{tr(language, "openGlottolog", "Open in Glottolog")} ↗</a></p>
    </div>
  );
}

/* ---------- languages in the current filter ---------- */
export function LanguageList({ list, selected, onSelect, language }: {
  list: Language[]; selected: string | null; onSelect: (code: string) => void; language: string;
}) {
  const [limit, setLimit] = useState(12);
  // Most at risk and least described first.
  const rows = [...list].sort((a, b) => (b.aes % 6) - (a.aes % 6) || (b.med < 0 ? 9 : b.med) - (a.med < 0 ? 9 : a.med) || a.name.localeCompare(b.name));
  return (
    <div className="el-list">
      <ul>
        {rows.slice(0, limit).map((l) => (
          <li key={l.code}>
            <button type="button" className={l.code === selected ? "on" : ""} onClick={() => onSelect(l.code)}>
              <i className="el-sw" style={{ background: aesColor(l.aes) }} />
              <strong>{l.name}</strong>
              <span>{aesName(l.aes, language)} · {medName(l.med, language)}</span>
            </button>
          </li>
        ))}
      </ul>
      {rows.length > limit && (
        <button type="button" className="gw-reset el-more" onClick={() => setLimit((n) => n + 24)}>
          {tr(language, "showMore", "Show more ({n} left)", { n: num(rows.length - limit, language) })}
        </button>
      )}
    </div>
  );
}

/* ---------- family mode: three plain-language facts, computed from the current filter ---------- */
export function FamilyMode({ list, t, countries, language }: { list: Language[]; t: Totals; countries: CountryStat[]; language: string }) {
  const top = [...countries].sort((a, b) => b.languages - a.languages)[0];
  const oldest = list.filter((l) => l.aes >= 2 && l.aes <= 5 && l.firstYear).sort((a, b) => a.firstYear! - b.firstYear!)[0];
  const facts = [
    { title: tr(language, "f1Head", "{oneIn} in 10 are in danger", { oneIn: Math.round((t.endangered / Math.max(1, t.living)) * 10) }), text: tr(language, "f1", "Of {living} languages still spoken here, {endangered} are endangered: about {oneIn} in every 10. In many of them, fewer and fewer children are learning the language at home.", {
      living: num(t.living, language), endangered: num(t.endangered, language), oneIn: Math.round((t.endangered / Math.max(1, t.living)) * 10),
    }) },
    top ? { title: tr(language, "f2Head", "One country, many voices"), text: tr(language, "f2", "{country} has {n} languages in this view, more than any other country.", { country: countryName(top.code, language), n: num(top.languages, language) }) } : null,
    { title: tr(language, "f3Head", "No grammar yet"), text: tr(language, "f3", "{priority} endangered languages here have no grammar, not even a short sketch. If their last speakers stop using them, a wordlist may be all that is left.", { priority: num(t.priority, language) }) },
    oldest ? { title: tr(language, "f4Head", "Written down long ago"), text: tr(language, "f4", "{name} was first described in {year} and is still spoken today, but it is now {status}.", { name: oldest.name, year: oldest.firstYear!, status: aesName(oldest.aes, language).toLowerCase() }) } : null,
  ].filter((f): f is { title: string; text: string } => !!f).slice(0, 3);
  return (
    <section className="al-family" aria-label={tr(language, "familyAria", "Three fun facts")}>
      {facts.map((f, i) => (
        <article key={i} className="al-fact"><span className="al-fact__n">{i + 1}</span><h3>{f.title}</h3><p>{f.text}</p></article>
      ))}
    </section>
  );
}
