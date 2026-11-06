"""Build ``src/data/tpiData.json``, the data behind the Showcase tab.

How the published file was made (reconstructed 6 Nov 2026 from git history):

1. OG-UK ``scripts/run_tpi_and_export.py`` solved the 8-sector transition path
   (``start_year=2026``, ``multi_sector=True``) for the baseline and for the
   basic rate at 21% from 1 Jan 2027, and wrote ``scripts/tpi_results.xlsx``.
2. OG-UK ``scripts/tpi_charts_plotly.py`` loaded the OBR November 2025 EFO
   baseline (fiscal years), took the model's reform-vs-baseline % change per
   series, and drew Plotly figures: baseline = OBR, reform = OBR x (1 + %chg).
3. The figures' traces were copied into ``tpiData.json`` (28 Apr 2026,
   dashboard commit ``d57e012``; first added as ``assets/tpi_data.json`` in
   ``a4d250f``). That copy step was never committed. This script replaces it.

Running step 2 against the OBR November 2025 EFO files reproduces the
published GDP, consumption, investment and "government" baselines exactly.
That check showed the "Gov. Consumption (% GDP)" panel was total managed
expenditure (OBR table 4.3), not government consumption, so this script
corrects two things in the macro panels:

* The government panel uses OBR government final consumption (table 1.2),
  the concept OG-Core's G stands for, so C + I + G is coherent with GDP.
* Reform-path shares divide by reform GDP, not baseline GDP.
* The debt baseline is public sector net debt excluding the Bank of England
  (PSND ex BoE), as a % of GDP at the end of each fiscal year (end-March):
  ONS CPOA outturn to 2023-24 (snapshot in ``python/data``), then OBR
  November 2025 EFO table 6.13 ("Public sector net debt ex BoE") from
  2024-25. OG-UK's ``_fy_debt`` used ONS HF6X, which *includes* the BoE, and
  blended calendar-year values 0.25/0.75 the wrong way round, so 2019-20
  showed 94.3% against 76.1% (CPOA) or 84.1% (HF6X) at end-March 2020; its
  2024-25 to 2030-31 path matched no OBR table.

Usage
-----
Rebuild the macro panels from the 28 Apr 2026 file, with no model run (the
model's % changes are recovered from its baseline/reform pairs)::

    git show 1545a73:src/data/tpiData.json > tpiData-2026-04-28.json
    python scripts/07_export_dashboard_json.py --from-published \
        --published tpiData-2026-04-28.json \
        --obr-data /path/to/obr_efo_nov_2025 --oguk-repo /path/to/OG-UK

Full rebuild after a fresh OG-UK run (see GitHub issue for the rerun plan)::

    python scripts/07_export_dashboard_json.py --tpi-results tpi_results.xlsx \
        --obr-data /path/to/obr_efo_nov_2025 --oguk-repo /path/to/OG-UK

``--obr-data`` must hold ``obr_efo_november_2025_economy.xlsx`` (and, for a
full rebuild, the expenditure and receipts workbooks) from
https://obr.uk/efo/economic-and-fiscal-outlook-november-2025/. A full rebuild
also fetches ONS series (pre-2008 history) over the network; the ONS debt
outturn is read from the committed snapshot, so ``--from-published`` needs
no network.
"""

from __future__ import annotations

import argparse
import contextlib
import importlib.util
import json
import os
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = REPO_ROOT / "src" / "data" / "tpiData.json"

ONS_DEBT_CSV = REPO_ROOT / "python" / "data" / "ons_psnd_ex_boe_end_march.csv"
OBR_DEBT_FIRST = 2024  # first fiscal year taken from OBR table 6.13 (2024-25)
DEBT_FIRST = 2008  # first fiscal year shown (2008-09), as for the other fiscal panels

REFORM_START = 2027  # first fiscal year of the reform (2027-28)
OUTTURN_LAST = 2023  # last full-outturn fiscal year (2023-24)

# (title, internal key, colour). The government title is the corrected one.
MACRO_PANELS = [
    ("Consumption (% GDP)", "consumption", "#e67e22"),
    ("Investment (% GDP)", "investment", "#27ae60"),
    ("Government consumption (% GDP)", "gov_cons", "#8e44ad"),
    ("Tax revenue (% GDP)", "tax_revenue", "#c0392b"),
    ("Debt (% GDP)", "debt", "#95a5a6"),
    ("GDP (£bn)", "gdp", "#1a3a6e"),
]
# Titles in the 28 Apr 2026 file, for --from-published.
PUBLISHED_TITLES = {
    "consumption": "Consumption (% GDP)",
    "investment": "Investment (% GDP)",
    "gov_cons": "Gov. Consumption (% GDP)",
    "tax_revenue": "Tax revenue (% GDP)",
    "debt": "Debt (% GDP)",
    "gdp": "GDP (£bn)",
}
# tpi_results.xlsx column -> key. OG-Core's G is government consumption.
TPI_COLUMNS = {
    "GDP (£bn)": "gdp",
    "Consumption (£bn)": "consumption",
    "Investment (£bn)": "investment",
    "Government (£bn)": "gov_cons",
    "Tax revenue (£bn)": "tax_revenue",
    "Debt (£bn)": "debt",
}
SHAPES = [
    {"x0": OUTTURN_LAST, "x1": OUTTURN_LAST, "color": "#95a5a6", "width": 1, "dash": "dot"},
    {"x0": REFORM_START, "x1": REFORM_START, "color": "#b8860b", "width": 1.2, "dash": "dash"},
]


def load_oguk_charts(oguk_repo: Path):
    """Import OG-UK's scripts/tpi_charts_plotly.py (not part of the oguk package)."""
    path = oguk_repo / "scripts" / "tpi_charts_plotly.py"
    spec = importlib.util.spec_from_file_location("oguk_tpi_charts", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def fy_int(fy: str) -> int:
    return int(str(fy)[:4])


def reform_share(base_share: float, pct: float, pct_gdp: float) -> float:
    """Share of reform GDP, from the baseline share and the model % changes."""
    return base_share * (1 + pct / 100) / (1 + pct_gdp / 100)


def build_macro6(baseline: dict[str, dict[int, float]], pct: dict[str, dict[int, float]]) -> list[dict]:
    """baseline[key][year]: £bn levels (OBR). pct[key][year]: model % change, reform vs baseline."""
    gdp = baseline["gdp"]
    panels = []
    for i, (title, key, colour) in enumerate(MACRO_PANELS):
        level = baseline[key]
        years = sorted(y for y in level if y in gdp)
        if key == "gdp":
            base_y = [level[y] for y in years]
        else:
            base_y = [level[y] / gdp[y] * 100 for y in years]
        base_map = dict(zip(years, base_y))

        anchor = REFORM_START - 1
        ref_years = [anchor] + [y for y in years if y >= REFORM_START and y in pct[key]]
        ref_y = [base_map[anchor]]
        for y in ref_years[1:]:
            if key == "gdp":
                ref_y.append(level[y] * (1 + pct[key][y] / 100))
            else:
                ref_y.append(reform_share(base_map[y], pct[key][y], pct["gdp"][y]))

        fmt = "£%{y:,.0f}bn" if key == "gdp" else "%{y:.1f}%"
        panels.append(
            {
                "title": title,
                "traces": [
                    {
                        "name": "OBR outturn / forecast" if i == 0 else "",
                        "color": colour,
                        "width": 2.5,
                        "dash": "solid",
                        "hovertemplate": f"%{{x}}: {fmt}<extra>Baseline</extra>",
                        "legendgroup": "base",
                        "showlegend": i == 0,
                        "x": years,
                        "y": base_y,
                    },
                    {
                        "name": "Reform +1pp basic rate" if i == 0 else "",
                        "color": colour,
                        "width": 2.5,
                        "dash": "dash",
                        "hovertemplate": f"%{{x}}: {fmt}<extra>Reform</extra>",
                        "legendgroup": "ref",
                        "showlegend": i == 0,
                        "x": ref_years,
                        "y": ref_y,
                    },
                ],
                "shapes": SHAPES,
            }
        )
        panels[-1]["traces"] = [ordered(t) for t in panels[-1]["traces"]]
    return panels


def pct_from_published(published: dict) -> tuple[dict, dict]:
    """Recover the model % changes and the published £bn-share baselines.

    Published reform lines were OBR share x (1 + %chg) on *baseline* GDP, so
    reform/baseline - 1 is exactly the model % change for every series.
    """
    by_title = {p["title"]: p for p in published["macro6"]}
    if PUBLISHED_TITLES["gov_cons"] not in by_title:
        raise SystemExit(
            "--from-published needs the 28 Apr 2026 file (reform lines on baseline GDP). Extract it with\n"
            "  git show 1545a73:src/data/tpiData.json > tpiData-2026-04-28.json\n"
            "and pass --published tpiData-2026-04-28.json"
        )
    pct, shares = {}, {}
    for key, title in PUBLISHED_TITLES.items():
        base, ref = by_title[title]["traces"][:2]
        b = dict(zip(base["x"], base["y"]))
        shares[key] = b
        pct[key] = {x: (y / b[x] - 1) * 100 for x, y in zip(ref["x"], ref["y"]) if x >= REFORM_START}
    return pct, shares


def obr_gov_cons(tc) -> dict[int, float]:
    macro = tc._fy_macro_from_1_2()
    return {fy_int(fy): float(v) for fy, v in macro["gov_cons"].dropna().items()}


def ons_debt_pct(path: Path = ONS_DEBT_CSV) -> dict[int, float]:
    """ONS CPOA, PSND ex BoE % GDP at end-March, keyed by fiscal start year."""
    out = {}
    for line in path.read_text().splitlines():
        if line.startswith("#") or line.startswith("fiscal_year"):
            continue
        fy, _, pct = line.split(",")
        out[int(fy)] = float(pct)
    return out


def obr_debt_pct(obr_data: Path) -> dict[int, float]:
    """OBR Nov 2025 EFO table 6.13, "Public sector net debt ex BoE" (% GDP centred end-March)."""
    import openpyxl

    wb = openpyxl.load_workbook(obr_data / "obr_efo_november_2025_aggregates.xlsx", read_only=True, data_only=True)
    rows = [[c for c in r if c is not None] for r in wb["6.13"].iter_rows(values_only=True)]
    years = next(r for r in rows if r and str(r[0]).strip() == "2024-25")
    row = next(r for r in rows if r and str(r[0]).strip().startswith("Public sector net debt ex BoE"))
    return {fy_int(fy): float(v) for fy, v in zip(years, row[1:])}


def debt_pct(obr_data: Path) -> dict[int, float]:
    """PSND ex BoE % GDP, end of fiscal year: ONS outturn, then OBR from 2024-25."""
    ons = {y: v for y, v in ons_debt_pct().items() if DEBT_FIRST <= y < OBR_DEBT_FIRST}
    obr = {y: v for y, v in obr_debt_pct(obr_data).items() if y >= OBR_DEBT_FIRST}
    return {**ons, **obr}


def debt_bn(obr_data: Path, gdp: dict[int, float]) -> dict[int, float]:
    return {y: p / 100 * gdp[y] for y, p in debt_pct(obr_data).items() if y in gdp}


def baseline_from_published(tc, shares: dict, obr_data: Path) -> dict[str, dict[int, float]]:
    """£bn baselines: published series (reproduced exactly from OBR), plus OBR G and PSND ex BoE."""
    gdp = shares["gdp"]
    out = {"gdp": dict(gdp)}
    for key in ("consumption", "investment", "tax_revenue"):
        out[key] = {y: s / 100 * gdp[y] for y, s in shares[key].items() if y in gdp}
    out["gov_cons"] = {y: v for y, v in obr_gov_cons(tc).items() if y in gdp}
    out["debt"] = debt_bn(obr_data, gdp)
    return out


def baseline_from_obr(tc, obr_data: Path) -> dict[str, dict[int, float]]:
    bl = tc.fetch_obr_baseline()
    out = {}
    for key in ("gdp", "consumption", "investment", "tax_revenue"):
        out[key] = {fy_int(fy): float(v) for fy, v in bl[key].dropna().items()}
    out["gov_cons"] = {y: v for y, v in obr_gov_cons(tc).items() if y in out["gdp"]}
    # Not OG-UK's _fy_debt: see the module docstring.
    out["debt"] = debt_bn(obr_data, out["gdp"])
    return out


def pct_from_tpi_results(path: Path) -> dict[str, dict[int, float]]:
    import pandas as pd

    xl = pd.ExcelFile(path)
    base = xl.parse("Baseline levels", header=2)
    ref = xl.parse("Reform levels", header=2)
    col = "Fiscal year" if "Fiscal year" in base.columns else "Year"
    base, ref = base.set_index(col), ref.set_index(col)
    common = base.index.intersection(ref.index)
    return {
        key: {fy_int(fy): float((ref.at[fy, c] - base.at[fy, c]) / base.at[fy, c] * 100) for fy in common}
        for c, key in TPI_COLUMNS.items()
    }


TRACE_ORDER = ["name", "x", "y", "color", "width", "dash", "hovertemplate", "legendgroup", "showlegend"]


def ordered(trace: dict) -> dict:
    return {k: trace[k] for k in TRACE_ORDER}


def figure_to_panels(fig) -> list[dict]:
    """Slim a Plotly subplot figure into the dashboard's panel schema."""
    d = fig.to_dict()
    titles = [a["text"] for a in d["layout"].get("annotations", []) if a.get("xref", "").endswith("domain")]
    panels = [{"title": t, "traces": [], "shapes": []} for t in titles]

    def idx(axis_ref: str) -> int:
        n = axis_ref.lstrip("xy").replace(" domain", "")
        return int(n) - 1 if n else 0

    for t in d["data"]:
        line = t.get("line", {})
        panels[idx(t.get("xaxis", "x"))]["traces"].append(
            {
                "name": t.get("name") or "",
                "color": line.get("color"),
                "width": line.get("width", 2),
                "dash": line.get("dash", "solid"),
                "hovertemplate": t.get("hovertemplate", ""),
                "legendgroup": t.get("legendgroup", ""),
                "showlegend": bool(t.get("showlegend", False)),
                "x": [int(x) for x in t["x"]],
                "y": [float(y) for y in t["y"]],
            }
        )
    for s in d["layout"].get("shapes", []):
        line = s.get("line", {})
        panels[idx(s.get("xref", "x"))]["shapes"].append(
            {"x0": s["x0"], "x1": s["x1"], "color": line.get("color"), "width": line.get("width", 1), "dash": line.get("dash", "dot")}
        )
    for p in panels:
        p["traces"] = [ordered(t) for t in p["traces"]]
    return panels


@contextlib.contextmanager
def tpi_results_cwd(path: Path):
    """OG-UK's sector loaders read scripts/tpi_results.xlsx relative to cwd."""
    old = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        (Path(tmp) / "scripts").mkdir()
        os.symlink(path.resolve(), Path(tmp) / "scripts" / "tpi_results.xlsx")
        os.chdir(tmp)
        try:
            yield
        finally:
            os.chdir(old)


def build_sectors(tc, tpi_results: Path, gdp: dict[int, float]):
    import pandas as pd

    with tpi_results_cwd(tpi_results):
        sector_pct = tc.load_sector_pct_changes()
    sector3 = figure_to_panels(tc.fig_sector_pct(sector_pct))
    sector24 = figure_to_panels(tc.fig_sector_real(sector_pct, gdp=pd.Series(gdp)))
    return sector3, sector24


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--from-published", action="store_true", help="recover model %% changes from the 28 Apr 2026 file given by --published")
    src.add_argument("--tpi-results", type=Path, help="tpi_results.xlsx from OG-UK scripts/run_tpi_and_export.py")
    ap.add_argument("--obr-data", type=Path, required=True, help="folder with the OBR Nov 2025 EFO workbooks")
    ap.add_argument("--oguk-repo", type=Path, required=True, help="OG-UK checkout (for scripts/tpi_charts_plotly.py)")
    ap.add_argument("--published", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args()

    tc = load_oguk_charts(args.oguk_repo)
    tc.OBR_DATA = args.obr_data
    published = json.loads(args.published.read_text())

    if args.from_published:
        pct, shares = pct_from_published(published)
        baseline = baseline_from_published(tc, shares, args.obr_data)
        out = {"macro6": build_macro6(baseline, pct), "sector3": published["sector3"], "sector24": published["sector24"]}
    else:
        baseline = baseline_from_obr(tc, args.obr_data)
        pct = pct_from_tpi_results(args.tpi_results)
        sector3, sector24 = build_sectors(tc, args.tpi_results, baseline["gdp"])
        out = {"macro6": build_macro6(baseline, pct), "sector3": sector3, "sector24": sector24}

    args.out.write_text(json.dumps(out))
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
