# OG-UK Dashboard

A Next.js dashboard explaining **OG-UK** — the UK calibration of [OG-Core](https://github.com/PSLmodels/OG-Core), the open-source overlapping-generations dynamic general equilibrium framework maintained by the [Policy Simulation Library](https://pslmodels.org) (PSL).

The dashboard has four tabs:

- **Showcase** — a worked +1 pp basic-rate-of-income-tax simulation with three views: macro aggregates, industry-by-industry impact, and any single sector × variable cell. Charts are generated from `src/data/tpiData.json` via Plotly.
- **Methodology** — a scrollytelling walk-through of the eight core elements of OG-UK with a sticky right-hand panel that shows the formal structure (equations, tax instruments, solution algorithm) for each step as you scroll.
- **Code** — a seven-step walkthrough of the Python you would actually run: install, define a reform with PolicyEngine, solve a steady state, run a transition path, map outputs to £bn, and the multi-sector option. Each runnable step ships as its own file under [`python/`](python/) so you can pick a step and run it on its own.
- **OBR comparison** — a side-by-side comparison with the OBR's UK OLG model ([Working Paper No. 22](/papers/obr-working-paper-22.pdf), Brzezinski, Hantzsche & Watson, April 2025). Covers production, households, bequests, taxes, government, open economy, and solution method & calibration.

## Stack

- **Next.js 16 (App Router) + React 19**, Tailwind 4 and `@policyengine/ui-kit`
- **Plotly 2.35** for the chart panels and **KaTeX 0.16** for equations, both loaded from a CDN in `src/app/layout.tsx` and kept out of the bundle
- **Vitest** for the data tests
- **Bun** as the package manager

## Running locally

```bash
bun install
bun run dev      # http://localhost:3000/
```

Production build, lint and tests:

```bash
bun run build
bun run start    # serves the build on http://localhost:3000/
bun run lint
bun run test     # vitest: identities and signs in src/data/tpiData.json
```

## Project structure

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx        # metadata + CDN scripts (Plotly, KaTeX)
│   │   ├── page.jsx          # shell + tab state + intro
│   │   └── globals.css
│   ├── tabs/                 # one component per tab
│   │   ├── ExampleTab.jsx    # Showcase
│   │   ├── MethodologyTab.jsx
│   │   ├── CodeTab.jsx
│   │   └── ObrTab.jsx
│   ├── components/           # PlotPanel, Select, CodeBlock, TerminalBlock, StickyPanel, DiagramModal
│   ├── data/
│   │   ├── tpiData.json      # chart data (macro6, sector3, sector24)
│   │   ├── tpiData.test.js   # vitest checks on the committed data
│   │   ├── methodologyContent.js
│   │   ├── methodologyDiagrams.js
│   │   └── methodologyPanels.js
│   └── lib/                  # highlight.js, katex.js
├── public/papers/obr-working-paper-22.pdf
├── python/                   # runnable Python that mirrors the Code tab (see python/README.md)
│   ├── og_dashboard/reform.py
│   └── scripts/              # 01_install.sh, 03_steady_state.py, 04_transition.py,
│                             # 06_multi_sector.py, 07_export_dashboard_json.py
├── next.config.ts
├── vercel.json               # framework nextjs, bun build
└── .github/workflows/pr.yaml
```

## Where the Showcase numbers come from

`src/data/tpiData.json` is built by `python/scripts/07_export_dashboard_json.py`.
The published file came from OG-UK `scripts/run_tpi_and_export.py` (reform from
1 January 2027) and then `scripts/tpi_charts_plotly.py` on the OBR November 2025
EFO. `07_export_dashboard_json.py --from-published` rebuilds the committed file
byte for byte from that 28 Apr 2026 file, with no network and no model run.

Debt is public sector net debt excluding the Bank of England (PSND ex BoE) as a
% of GDP at end-March: ONS series CPOA to 2023-24 (snapshot
`python/data/ons_psnd_ex_boe_end_march.csv`, release 21 Oct 2026), then OBR
November 2025 EFO table 6.13 from 2024-25. The reform line applies the model's
% changes to this baseline.

Known problems with the published numbers:

- They predate OG-UK's July 2026 marginal-tax-rate fix, and the 8-sector
  transition path does not converge over its full horizon on current OG-UK
  (issue #2). A rerun is planned in issue #5.
- The ONS and OBR debt vintages differ at the seam: ONS now has 87.5% at
  end-March 2025, against 88.1% in the OBR table used for 2024-25. ONS also
  has a provisional 89.0% for end-March 2026, against the OBR forecast of
  91.3% shown for 2025-26.
- Before Nov 2026 the debt panel used OG-UK's `_fy_debt` (ONS HF6X, which
  includes the BoE, with calendar years blended the wrong way round): 2019-20
  showed 94.3% against 76.1% ex BoE (84.1% with the BoE) at end-March 2020.
- Before Nov 2026 the pre-2008-09 GDP, consumption and investment came from
  OG-UK's `_ons_backfill`: the same reversed calendar-year blend, and
  consumption as GDP - I - G (net exports included). They are now ONS
  quarterly national accounts summed April to March (snapshot
  `python/data/ons_national_accounts_quarterly.csv`, release 30 Sep 2026):
  GDP BKTL, consumption ABJQ + HAYE, investment NPQS. 2000-01 GDP moved from
  £1,139.1bn to £1,113.2bn. This ONS vintage is newer than the OBR's at the
  2008-09 join: ONS now has £1,589.4bn for 2008-09 GDP, against £1,593.3bn in
  OBR table 1.4.
- OG-UK's `_fy_from_calendar`, `_ons_backfill` and `_fy_debt` are unchanged
  upstream; this repo no longer uses their output.

## Deployment

Vercel (`vercel.json`: framework `nextjs`) runs `bun install --frozen-lockfile` then `bun run build`. Pushing to `main` triggers a production redeploy.

## CI

`.github/workflows/pr.yaml` runs three jobs on every pull request to `main` and every push to `main`: build (`bun run build`), lint (`bun run lint`) and test (`bun run test`).

## Data provenance

The figures in `src/data/tpiData.json` were generated on 28 April 2026 against OG-UK commit
`3a16cff`. They predate OG-UK's July 2026 marginal-tax-rate fix, and the 8-sector transition path
does not converge over its full horizon on current OG-UK. See
[`src/data/PROVENANCE.md`](src/data/PROVENANCE.md) before citing the numbers.

## References

- OG-Core: <https://github.com/PSLmodels/OG-Core>
- OG-UK: <https://github.com/PSLmodels/OG-UK>
- Policy Simulation Library: <https://pslmodels.org>
- OBR Working Paper No. 22 — "A new UK overlapping generations model" (April 2025)
