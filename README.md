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
EFO; `07_export_dashboard_json.py --from-published` rebuilds it byte for byte.

Known problems with the published numbers:

- They predate OG-UK's July 2026 marginal-tax-rate fix, and the 8-sector
  transition path does not converge over its full horizon on current OG-UK
  (issue #2). A rerun is planned in issue #5.
- **The debt baseline is not a published series.** It is built from ONS HF6X
  (net debt excluding public sector banks, which includes the Bank of
  England), and calendar years are mapped to fiscal years with weights the
  wrong way round for a stock, so 2019-20 shows about 94% of GDP against
  HF6X's 84.1% at end-March 2020. The 2026-30 path matches no OBR series.
  See the verification comment on PR #4.

## Deployment

Vercel (`vercel.json`: framework `nextjs`) runs `bun install --frozen-lockfile` then `bun run build`. Pushing to `main` triggers a production redeploy.

## CI

`.github/workflows/pr.yaml` runs three jobs on every pull request to `main` and every push to `main`: build (`bun run build`), lint (`bun run lint`) and test (`bun run test`).

## References

- OG-Core: <https://github.com/PSLmodels/OG-Core>
- OG-UK: <https://github.com/PSLmodels/OG-UK>
- Policy Simulation Library: <https://pslmodels.org>
- OBR Working Paper No. 22 — "A new UK overlapping generations model" (April 2025)
