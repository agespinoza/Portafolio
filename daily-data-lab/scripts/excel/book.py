"""Shared builder for the Daily Data Lab analysis workbooks (.xlsx and .xlsm).

Every workbook has the same frame, so analysts find things in the same place each day:
  README      what the study asks, sources and licenses, contents with links, how to use, macros
  Analysis    formula-driven results (live: change a selector or a data cell and everything recomputes)
  Charts      native Excel charts fed by the Analysis ranges (when the day has more than fit beside them)
  Data_*      every row the page uses, as Excel tables with typed columns
  Pipeline    the extract → transform → load steps with scripts and row counts, and the quality checks
              (tblChecks: expected vs actual, recomputed by formulas, PASS/FAIL)
  Dictionary  every column of every table: type, unit, meaning
  Config      named settings the VBA macros read (main table, pivot fields, selector default)
The .xlsm adds the DataLab VBA module (DataLab.bas) and buttons on the README.
"""
from __future__ import annotations

import datetime as dt
import os
import re
import tempfile
from dataclasses import dataclass, field

import xlsxwriter
from xlsxwriter.utility import xl_col_to_name, xl_rowcol_to_cell

import vba

# XlsxWriter caches a chart range's values when the file is written and calls a column "text" if any cell is
# blank, so a scatter over a numeric column with gaps would plot against 1, 2, 3 … Treat blank cells as gaps.
_orig_range_data = xlsxwriter.worksheet.Worksheet._get_range_data


def _range_data(self, *args):
    data = _orig_range_data(self, *args)
    return None if data is None else [None if d == "" else d for d in data]


xlsxwriter.worksheet.Worksheet._get_range_data = _range_data

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = "https://github.com/agespinoza/Portafolio/blob/main/daily-data-lab/"
LAB = "https://agespinoza.github.io/Portafolio/lab/index.html#/day/"

INK, INK2, INK3 = "#0B1424", "#3D4A5F", "#626E81"
ACCENT, ACCENT_SOFT, COPPER, PAPER, LINE = "#0D6B7F", "#E2EFF1", "#95551E", "#FAF8F4", "#D9D2C4"
SERIES = ["#0D6B7F", "#95551E", "#8FCFC6", "#DD8F4F", "#3D4A5F", "#C4553A", "#12899F", "#E8C27D"]
PASS_FILL, FAIL_FILL = "#DDEFE3", "#F6D6D2"

FMT = {"text": None, "int": "#,##0", "num": "#,##0.00", "num1": "#,##0.0", "num3": "#,##0.000", "pct": "0.0%",
       "date": "yyyy-mm-dd", "coord": "0.00000", "year": "0", "bool": "0", "url": None, "r": "0.00"}


@dataclass
class Col:
    name: str
    kind: str = "text"            # key of FMT
    desc: str = ""
    unit: str = ""
    formula: str | None = None    # calculated column, e.g. "=[@A]/[@B]"
    width: float | None = None


@dataclass
class Table:
    name: str
    sheet: str
    cols: list[Col]
    first: int                    # 0-based row of the first data row
    n: int

    def ref(self, col: str) -> str:
        return f"{self.name}[{col}]"

    def col_range(self, col: str, absolute=True) -> str:
        """A1 range of one column's data, for chart series (charts cannot use structured references)."""
        c = [x.name for x in self.cols].index(col)
        letter = xl_col_to_name(c)
        return f"='{self.sheet}'!${letter}${self.first + 1}:${letter}${self.first + self.n}"


@dataclass
class Meta:
    day: int
    slug: str
    title: str
    question: str
    summary: str
    captured: str
    sources: list[tuple[str, str, str, str, str]]   # (dataset, publisher, url, license, how it is used)
    caveats: list[str]
    findings: list[str] = field(default_factory=list)


def clean(v):
    if isinstance(v, float) and v != v:
        return None
    return v


class Book:
    def __init__(self, out_dir: str, meta: Meta, macros: bool):
        self.meta, self.macros = meta, macros
        ext = "xlsm" if macros else "xlsx"
        self.path = os.path.join(out_dir, f"day-{meta.day:03d}-{meta.slug}-analysis.{ext}")
        self.wb = xlsxwriter.Workbook(self.path, {"use_future_functions": True, "strings_to_urls": False, "strings_to_formulas": False, "nan_inf_to_errors": True})
        self.wb.set_size(1600, 1000)
        self.tables: dict[str, Table] = {}
        self.dictionary: list[tuple[str, str, str, str, str, str]] = []
        self.checks: list[tuple[str, object, str, float, str]] = []
        self.steps: list[tuple[str, str, str, str, str, object, str, str]] = []
        self.config: dict[str, object] = {}
        self.sheet_notes: list[tuple[str, str]] = []
        self._fmt_cache: dict = {}
        self.base = {"font_name": "Calibri", "font_size": 11, "font_color": INK}
        # Fixed frame: README first, Pipeline / Dictionary / Config last (added in close()).
        self.readme = self.wb.add_worksheet("README")

    # ------------------------------------------------------------ formats
    def f(self, **kw):
        key = tuple(sorted(kw.items()))
        if key not in self._fmt_cache:
            self._fmt_cache[key] = self.wb.add_format({**self.base, **kw})
        return self._fmt_cache[key]

    def numfmt(self, kind, **kw):
        nf = FMT.get(kind)
        return self.f(**({"num_format": nf} if nf else {}), **kw)

    @property
    def h1(self): return self.f(font_name="Georgia", font_size=20, font_color=INK)
    @property
    def h2(self): return self.f(font_name="Georgia", font_size=14, font_color=ACCENT, bottom=1, bottom_color=LINE)
    @property
    def muted(self): return self.f(font_color=INK3, italic=True, text_wrap=True, valign="top")
    @property
    def label(self): return self.f(bold=True, font_color=INK2, valign="top")
    @property
    def wrap(self): return self.f(text_wrap=True, valign="top")
    @property
    def head(self): return self.f(bold=True, font_color="#FFFFFF", bg_color=ACCENT, border=1, border_color=ACCENT, text_wrap=True, valign="vcenter")
    @property
    def input(self): return self.f(bold=True, bg_color="#FFF4D6", border=1, border_color=COPPER, font_color=COPPER)

    def print_setup(self, ws, landscape=True):
        """Prints one page wide, with a footer naming the study and the page."""
        if landscape:
            ws.set_landscape()
        ws.fit_to_pages(1, 0)
        ws.set_margins(left=0.4, right=0.4, top=0.5, bottom=0.6)
        ws.set_footer(f"&L&8Daily Data Lab · Day {self.meta.day:03d} · &A&R&8Page &P of &N")

    def sheet(self, name: str, note: str, tab=None):
        ws = self.wb.add_worksheet(name)
        ws.hide_gridlines(2)
        self.print_setup(ws)
        ws.set_column("A:A", 2)
        if tab:
            ws.set_tab_color(tab)
        self.sheet_notes.append((name, note))
        return ws

    def title(self, ws, title: str, sub: str = "", row: int = 0):
        ws.set_row(row, 30)
        ws.write(row, 1, title, self.h1)
        if sub:
            ws.write(row + 1, 1, sub, self.f(font_color=INK3, italic=True))
        home = "internal:'README'!A1"
        ws.write_url(row, 12, home, self.f(font_color=ACCENT, underline=1), "← README")

    # ------------------------------------------------------------ data tables
    def data_table(self, sheet: str, name: str, title: str, desc: str, cols: list[Col], rows: list[list], note: str | None = None,
                   tab=None, freeze_cols: int = 1) -> Table:
        ws = self.sheet(sheet, note or desc, tab or INK3)
        self.title(ws, title, desc)
        first = 4  # header on row 4 (0-based 3)
        n = len(rows)
        columns = []
        for c in cols:
            spec = {"header": c.name, "header_format": self.head}
            fm = self.numfmt(c.kind)
            spec["format"] = fm
            if c.formula:
                spec["formula"] = c.formula
            columns.append(spec)
        data_cols = [i for i, c in enumerate(cols) if not c.formula]
        data = []
        for r in rows:
            full = [None] * len(cols)
            for j, i in enumerate(data_cols):
                full[i] = clean(r[j]) if j < len(r) else None
            data.append(full)
        last_row = first + max(n, 1) - 1
        ws.add_table(first - 1, 1, last_row, len(cols), {
            "name": name, "columns": columns, "data": data if n else None, "style": "Table Style Light 9",
            "autofilter": True, "first_column": False, "banded_rows": True,
        })
        # Table columns start at column B (index 1); shift Col bookkeeping accordingly.
        for i, c in enumerate(cols):
            width = c.width or self._width(c, [r[data_cols.index(i)] for r in rows[:400]] if i in data_cols else [])
            ws.set_column(i + 1, i + 1, width)
        ws.freeze_panes(first, 1 + freeze_cols)
        ws.repeat_rows(first - 1)
        t = Table(name, sheet, [Col("_pad")] + cols, first, n)  # _pad keeps col_range letters aligned with column B start
        self.tables[name] = t
        for c in cols:
            self.dictionary.append((sheet, name, c.name, "calculated" if c.formula else c.kind, c.unit, c.desc))
        return t

    @staticmethod
    def _width(c: Col, sample) -> float:
        lens = [len(str(v)) for v in sample if v is not None]
        m = max(lens) if lens else 6
        if c.kind in ("int", "num", "num1", "num3", "pct", "r", "coord"):
            m = min(m, 12) + 2
        return float(max(min(max(m, len(c.name) * 0.9), 48), 9))

    # ------------------------------------------------------------ pipeline, checks, config
    def step(self, stage, step, tool, inp, out, rows, script="", notes=""):
        self.steps.append((stage, step, tool, inp, out, rows, script, notes))

    def check(self, name: str, expected, actual_formula: str, tol: float = 0, note: str = ""):
        self.checks.append((name, expected, actual_formula, tol, note))

    def set_config(self, **kw):
        self.config.update(kw)

    # ------------------------------------------------------------ analysis helpers
    def kv(self, ws, row, col, label, formula, kind="num", note="", value=None):
        ws.write(row, col, label, self.label)
        fm = self.numfmt(kind, bold=True, font_size=12)
        if isinstance(formula, str) and formula.startswith("="):
            ws.write_formula(row, col + 1, formula, fm, value)
        else:
            ws.write(row, col + 1, formula, fm)
        if note:
            ws.write(row, col + 2, note, self.muted)
        return xl_rowcol_to_cell(row, col + 1, row_abs=True, col_abs=True)

    def header_row(self, ws, row, col, names, widths=None):
        for i, n in enumerate(names):
            ws.write(row, col + i, n, self.head)

    def selector(self, ws, row, col, label, source: str, default, note=""):
        """A drop-down cell (data validation) that drives the Analysis formulas; named cfgSelector."""
        ws.write(row, col, label, self.label)
        ws.write(row, col + 1, default, self.input)
        ws.data_validation(row, col + 1, row, col + 1, {"validate": "list", "source": source,
                                                        "input_title": label, "input_message": "Pick a value from the list."})
        if note:
            ws.write(row, col + 2, note, self.muted)
        cell = f"'{ws.get_name()}'!{xl_rowcol_to_cell(row, col + 1, row_abs=True, col_abs=True)}"
        self.wb.define_name("cfgSelector", "=" + cell)
        self.config["cfgSelectorDefault"] = default
        return xl_rowcol_to_cell(row, col + 1, row_abs=True, col_abs=True)

    def list_sheet_range(self, name: str, values: list[str]) -> str:
        """Writes a list on Config (for drop-downs) and returns a defined name that points to it."""
        self._lists = getattr(self, "_lists", [])
        self._lists.append((name, values))
        return "=" + name

    def chart(self, kind, subtype=None, **kw):
        c = self.wb.add_chart({"type": kind, **({"subtype": subtype} if subtype else {})})
        c.set_chartarea({"border": {"none": True}})
        c.set_plotarea({"border": {"none": True}})
        c.set_legend(kw.pop("legend", {"position": "bottom"}))
        c.set_title({"name": kw.pop("title", ""), "name_font": {"name": "Georgia", "size": 13, "color": INK, "bold": False}})
        for axis in ("x_axis", "y_axis"):
            a = kw.pop(axis, {})
            a.setdefault("num_font", {"color": INK3, "size": 9})
            a.setdefault("name_font", {"color": INK2, "size": 10, "bold": False})
            a.setdefault("line", {"color": LINE})
            a.setdefault("major_gridlines", {"visible": axis == "y_axis", "line": {"color": "#ECE8E0"}})
            getattr(c, "set_" + axis)(a)
        c.set_size({"width": kw.pop("width", 720), "height": kw.pop("height", 340)})
        return c

    # ------------------------------------------------------------ close: README, Pipeline, Dictionary, Config, VBA
    def close(self):
        self._pipeline()
        self._dictionary()
        self._config()
        self._readme()
        m = self.meta
        self.wb.set_properties({
            "title": f"Daily Data Lab · Day {m.day:03d} · {m.title}", "subject": m.question, "author": "Daily Data Lab",
            "company": "Daily Data Lab", "keywords": "Daily Data Lab, data analysis, " + m.slug,
            "comments": f"Built {dt.date.today().isoformat()} from the page snapshot of {m.captured}. Sources and licenses on the README sheet.",
        })
        self.readme.activate()
        if self.macros:
            n = len(self.wb.worksheets())
            code = open(os.path.join(HERE, "DataLab.bas"), encoding="utf-8").read()
            fd, binpath = tempfile.mkstemp(suffix=".bin")
            with os.fdopen(fd, "wb") as fh:
                fh.write(vba.build_vba_project(n, {"DataLab": code}, seed_id=f"day-{m.day:03d}"))
            self.wb.add_vba_project(binpath)
            self.wb.close()
            os.remove(binpath)
        else:
            self.wb.close()
        return self.path

    def _pipeline(self):
        ws = self.sheet("Pipeline", "How the data got here, step by step, and the quality checks that guard it.", ACCENT)
        self.title(ws, "Pipeline and quality checks", "From the public sources to this workbook. Every check recomputes from the data sheets.")
        r = 3
        ws.write(r, 1, "Pipeline", self.h2)
        cols = ["Stage", "Step", "Tool", "Input", "Output", "Rows", "Script", "Notes"]
        data = []
        for i, s in enumerate(self.steps, 1):
            data.append([i, *s[:7], s[7]])
        ws.add_table(r + 1, 1, r + 1 + max(len(data), 1), len(cols) + 1, {
            "name": "tblPipeline", "style": "Table Style Light 9",
            "columns": [{"header": "Order", "header_format": self.head}] + [{"header": c, "header_format": self.head, "format": self.wrap if c not in ("Rows",) else self.numfmt("int")} for c in cols],
            "data": data or None})
        for i, s in enumerate(self.steps):
            if s[6]:
                ws.write_url(r + 2 + i, 8, REPO + s[6], self.f(font_color=ACCENT, underline=1, text_wrap=True, valign="top"), s[6])
        ws.set_column("B:B", 7); ws.set_column("C:C", 12); ws.set_column("D:D", 34); ws.set_column("E:E", 16)
        ws.set_column("F:G", 30); ws.set_column("H:H", 11); ws.set_column("I:I", 30); ws.set_column("J:J", 46)
        r = r + 3 + max(len(data), 1) + 1
        ws.write(r, 1, "Quality checks", self.h2)
        ws.write(r + 1, 1, "Actual values are live formulas over the data sheets. Run the DL_RefreshAndCheck macro (.xlsm) or press F9 to recompute.", self.muted)
        top = r + 3
        ccols = ["ID", "Check", "Expected", "Actual", "Tolerance", "Result", "Notes"]
        cdata = [[i, name, exp, None, tol, None, note] for i, (name, exp, _f, tol, note) in enumerate(self.checks, 1)]
        ws.add_table(top - 1, 1, top - 1 + max(len(cdata), 1), len(ccols), {
            "name": "tblChecks", "style": "Table Style Light 9",
            "columns": [
                {"header": "ID", "header_format": self.head},
                {"header": "Check", "header_format": self.head, "format": self.wrap},
                {"header": "Expected", "header_format": self.head, "format": self.numfmt("num")},
                {"header": "Actual", "header_format": self.head, "format": self.numfmt("num")},
                {"header": "Tolerance", "header_format": self.head, "format": self.numfmt("num3")},
                {"header": "Result", "header_format": self.head, "formula": '=IF(ABS([@Actual]-[@Expected])<=[@Tolerance],"PASS","FAIL")', "format": self.f(bold=True, align="center")},
                {"header": "Notes", "header_format": self.head, "format": self.wrap},
            ], "data": cdata or None})
        for i, (_n, _e, formula, _t, _note) in enumerate(self.checks):
            ws.write_formula(top + i, 4, formula, self.numfmt("num"))
        last = top + max(len(cdata), 1) - 1
        ws.conditional_format(top, 6, last, 6, {"type": "cell", "criteria": "==", "value": '"PASS"', "format": self.f(bg_color=PASS_FILL, font_color="#1D5B33", bold=True)})
        ws.conditional_format(top, 6, last, 6, {"type": "cell", "criteria": "==", "value": '"FAIL"', "format": self.f(bg_color=FAIL_FILL, font_color="#8E2A2A", bold=True)})
        ws.write(last + 2, 1, "Checks passed", self.label)
        ws.write_formula(last + 2, 2, '=COUNTIF(tblChecks[Result],"PASS")&" of "&ROWS(tblChecks[Result])', self.f(bold=True, font_color=ACCENT))
        self.wb.define_name("ChecksSummary", f"='Pipeline'!$C${last + 3}")

    def _dictionary(self):
        ws = self.sheet("Dictionary", "Every column of every table: type, unit and meaning.", INK3)
        self.title(ws, "Data dictionary", "Types: int, num (decimal), pct (0–1 shown as %), date, text, calculated (formula column).")
        rows = [list(d) for d in self.dictionary]
        ws.add_table(3, 1, 3 + max(len(rows), 1), 6, {
            "name": "tblDictionary", "style": "Table Style Light 9",
            "columns": [{"header": h, "header_format": self.head, "format": self.wrap} for h in ["Sheet", "Table", "Column", "Type", "Unit", "Description"]],
            "data": rows or None})
        ws.set_column("B:C", 18); ws.set_column("D:D", 28); ws.set_column("E:E", 12); ws.set_column("F:F", 16); ws.set_column("G:G", 90)
        ws.freeze_panes(4, 0)

    def _config(self):
        ws = self.sheet("Config", "Settings the macros read. Change the pivot fields to pivot by something else.", "#B7B0A2")
        self.title(ws, "Config", "Named cells used by the VBA macros (.xlsm). Lists used by the drop-downs are below.")
        defaults = {"cfgMainTable": "", "cfgPivotRows": "", "cfgPivotCols": "", "cfgPivotValue": "", "cfgPivotFunc": "sum", "cfgLastRun": "", "cfgSelectorDefault": ""}
        defaults.update(self.config)
        notes = {"cfgMainTable": "Excel table profiled and pivoted by the macros", "cfgPivotRows": "Column for pivot rows",
                 "cfgPivotCols": "Column for pivot columns (optional)", "cfgPivotValue": "Column summarised in the pivot", "cfgPivotFunc": "sum, count or average",
                 "cfgLastRun": "Set by DL_RefreshAndCheck", "cfgSelectorDefault": "Value DL_ResetView puts back in the Analysis selector"}
        self.header_row(ws, 3, 1, ["Name", "Value", "Meaning"])
        for i, (k, v) in enumerate(defaults.items()):
            ws.write(4 + i, 1, k, self.label)
            ws.write(4 + i, 2, v, self.numfmt("date") if k == "cfgLastRun" else self.f())
            ws.write(4 + i, 3, notes.get(k, ""), self.muted)
            self.wb.define_name(k, f"='Config'!$C${5 + i}")
        ws.set_column("B:B", 22); ws.set_column("C:C", 30); ws.set_column("D:D", 60)
        col = 5
        for name, values in getattr(self, "_lists", []):
            ws.write(3, col, name, self.head)
            for i, v in enumerate(values):
                ws.write(4 + i, col, v)
            letter = xl_col_to_name(col)
            self.wb.define_name(name, f"='Config'!${letter}$5:${letter}${4 + len(values)}")
            ws.set_column(col, col, max(14, min(40, max((len(str(v)) for v in values), default=10))))
            col += 1

    def _readme(self):
        m, ws = self.meta, self.readme
        ws.hide_gridlines(2)
        self.print_setup(ws, landscape=False)
        ws.set_column("A:A", 2); ws.set_column("B:B", 24); ws.set_column("C:C", 62); ws.set_column("D:D", 22); ws.set_column("E:F", 26)
        ws.set_tab_color(ACCENT)
        ws.set_row(1, 18)
        ws.write(1, 1, f"DAILY DATA LAB · DAY {m.day:03d}", self.f(font_color=COPPER, bold=True, font_size=10))
        ws.set_row(2, 34)
        ws.write(2, 1, m.title, self.f(font_name="Georgia", font_size=22, font_color=INK))
        ws.merge_range(3, 1, 3, 5, m.summary, self.f(text_wrap=True, font_color=INK2, valign="top"))
        ws.set_row(3, 48)
        r = 5
        meta_rows = [("Question", m.question), ("Data snapshot", m.captured), ("Workbook built", dt.date.today().isoformat()),
                     ("Interactive page", LAB + str(m.day)), ("Format", ".xlsm · formulas, tables, charts and VBA macros" if self.macros else ".xlsx · formulas, tables and charts (no macros; the .xlsm version adds them)")]
        for k, v in meta_rows:
            ws.write(r, 1, k, self.label)
            if v.startswith("http"):
                ws.write_url(r, 2, v, self.f(font_color=ACCENT, underline=1), v)
            else:
                ws.write(r, 2, v, self.wrap)
            r += 1
        ws.write(r, 1, "Checks", self.label)
        ws.write_formula(r, 2, "=ChecksSummary&\" passed (Pipeline sheet)\"", self.f(bold=True, font_color=ACCENT))
        r += 2
        if m.findings:
            ws.write(r, 1, "Key findings", self.h2); r += 1
            for t in m.findings:
                ws.merge_range(r, 1, r, 5, "• " + t, self.wrap); ws.set_row(r, 32); r += 1
            r += 1
        ws.write(r, 1, "Contents", self.h2); r += 1
        for name, note in [(n, t) for n, t in self.sheet_notes]:
            ws.write_url(r, 1, f"internal:'{name}'!A1", self.f(font_color=ACCENT, underline=1, bold=True), name)
            ws.write(r, 2, note, self.wrap)
            r += 1
        r += 1
        ws.write(r, 1, "How to use", self.h2); r += 1
        tips = [
            "Yellow cells with a copper border are inputs: pick a value from the drop-down and the Analysis sheet recomputes.",
            "Data sheets are Excel tables: filter, sort, or build a PivotTable (Insert → PivotTable) straight from them.",
            "Formulas use structured references (e.g. tblName[Column]), so they keep working when you add rows to a table.",
            "The Pipeline sheet lists every step from the public source to this file and checks the totals against the published figures.",
        ]
        for t in tips:
            ws.merge_range(r, 1, r, 5, "• " + t, self.wrap); ws.set_row(r, 30); r += 1
        r += 1
        ws.write(r, 1, "Macros (VBA)", self.h2); r += 1
        macro_rows = [("DL_RefreshAndCheck", "Recalculate everything, run the quality checks and report PASS / FAIL."),
                      ("DL_ProfileTable", "Profile every column of the main table (type, blanks, distinct, min, max, mean, median, std dev)."),
                      ("DL_BuildPivot", "Build a PivotTable from the main table with the fields and function set on the Config sheet."),
                      ("DL_ExportTablesToCSV", "Save every Excel table as a UTF-8 CSV next to the workbook."),
                      ("DL_ResetView", "Clear all table filters and reset the Analysis selector."),
                      ("DL_WILSON(k, n, side)", "Worksheet function: 95% Wilson interval bound for k of n (side −1 lower, +1 upper).")]
        if self.macros:
            ws.merge_range(r, 1, r, 5, "Excel may ask you to enable macros. Files downloaded from the internet can have macros blocked: on Windows, right-click the file → Properties → Unblock.", self.muted)
            ws.set_row(r, 30); r += 1
            for i, (name, desc) in enumerate(macro_rows):
                if "(" not in name:
                    ws.insert_button(r, 1, {"macro": name, "caption": name.replace("DL_", ""), "width": 170, "height": 26})
                    ws.set_row(r, 22)
                else:
                    ws.write(r, 1, name, self.f(bold=True, font_name="Menlo", font_size=10))
                ws.write(r, 2, desc, self.wrap)
                r += 1
        else:
            ws.merge_range(r, 1, r, 5, "This .xlsx has no macros. Download the .xlsm version from the page for these tools:", self.muted); r += 1
            for name, desc in macro_rows:
                ws.write(r, 1, name, self.f(bold=True, font_name="Menlo", font_size=10)); ws.write(r, 2, desc, self.wrap); r += 1
        r += 1
        ws.write(r, 1, "Sources and licenses", self.h2); r += 1
        self.header_row(ws, r, 1, ["Dataset", "Publisher", "Link", "License", "How it is used"]); r += 1
        for ds, pub, url, lic, use in m.sources:
            ws.write(r, 1, ds, self.wrap); ws.write(r, 2, pub, self.wrap)
            ws.write_url(r, 3, url, self.f(font_color=ACCENT, underline=1, text_wrap=True, valign="top"), "link")
            ws.write(r, 4, lic, self.wrap); ws.write(r, 5, use, self.wrap)
            ws.set_row(r, 32); r += 1
        r += 1
        ws.write(r, 1, "Caveats", self.h2); r += 1
        for t in m.caveats:
            ws.merge_range(r, 1, r, 5, "• " + t, self.wrap); ws.set_row(r, 32); r += 1
        r += 1
        ws.merge_range(r, 1, r, 5, "Cite the original sources above when you reuse the data. Built by the Daily Data Lab build script "
                       "(scripts/excel/) from the same snapshot the interactive page uses.", self.muted)
        ws.set_row(r, 30)


def safe_sheet(name: str) -> str:
    return re.sub(r"[\[\]\*\?/\\:]", "", name)[:31]
