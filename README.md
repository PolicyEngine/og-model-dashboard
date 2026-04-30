# OG-UK Dashboard

A React + Vite dashboard explaining **OG-UK** — the UK calibration of [OG-Core](https://github.com/PSLmodels/OG-Core), the open-source overlapping-generations dynamic general equilibrium framework maintained by the [Policy Simulation Library](https://pslmodels.org) (PSL).

The dashboard has four tabs:

- **Showcase** — a worked +1 pp basic-rate-of-income-tax simulation with three views: macro aggregates, industry-by-industry impact, and any single sector × variable cell. Charts are generated from `src/data/tpiData.json` via Plotly.
- **Methodology** — a scrollytelling walk-through of the eight core elements of OG-UK with a sticky right-hand panel that shows the formal structure (equations, tax instruments, solution algorithm) for each step as you scroll.
- **Code** — a seven-step walkthrough of the Python you would actually run: install, define a reform with PolicyEngine, solve a steady state, run a transition path, map outputs to £bn, and the multi-sector option.
- **OBR comparison** — a side-by-side comparison with the OBR's UK OLG model ([Working Paper No. 22](/papers/obr-working-paper-22.pdf), Brzezinski, Hantzsche & Watson, April 2025). Covers production, households, bequests, taxes, government, open economy, and solution method & calibration.

## Stack

- **React 18 + Vite 5** (JSX, plain CSS)
- **Plotly 2.35** for the chart panels (loaded from CDN, kept out of the bundle)
- **KaTeX 0.16** for equations (loaded from CDN)
- **Bun** as the package manager

## Running locally

```bash
bun install
bun run dev
```

Opens at <http://localhost:5173/>.

To preview a production build:

```bash
bun run build
bun run preview   # http://localhost:4173/
```

## Project structure

```
.
├── index.html                # Vite entry: loads CDN scripts and /src/main.jsx
├── src/
│   ├── main.jsx              # React root mount
│   ├── App.jsx               # shell + tab state + intro
│   ├── styles.css            # all styles
│   ├── tabs/                 # one component per tab
│   │   ├── ExampleTab.jsx
│   │   ├── MethodologyTab.jsx
│   │   ├── CodeTab.jsx
│   │   └── ObrTab.jsx
│   ├── components/           # shared UI primitives
│   │   ├── PlotPanel.jsx     # Plotly wrapper using a ref + useEffect
│   │   ├── Select.jsx        # custom single-select dropdown
│   │   ├── CodeBlock.jsx     # syntax-highlighted code block
│   │   ├── TerminalBlock.jsx # terminal-style output block
│   │   ├── StickyPanel.jsx   # Methodology tab freeze-box
│   │   └── DiagramModal.jsx  # SVG zoom modal
│   ├── data/
│   │   ├── tpiData.json      # chart data (macro6, sector3, sector24)
│   │   ├── methodologyContent.js   # narrative text per step
│   │   ├── methodologyDiagrams.js  # eight inline SVGs + titles
│   │   └── methodologyPanels.js    # right-hand panel content per step
│   └── lib/
│       ├── highlight.js      # tiny dependency-free Python/bash highlighter
│       └── katex.js          # CDN-KaTeX wrapper
├── public/
│   └── papers/
│       └── obr-working-paper-22.pdf
├── vercel.json               # Vercel: vite framework, dist/ output
├── vite.config.js
├── package.json
└── .github/workflows/checks.yml
```

## Deployment

Vercel auto-detects Vite and runs `bun install --frozen-lockfile` then `bun run build`, serving from `dist/`. Pushing to `main` triggers a production redeploy.

## CI

`.github/workflows/checks.yml` runs `bun run build` on every PR and push, verifies the built `dist/` references its bundle, checks that any `public/`-relative URL referenced from `src/` actually exists, and pings upstream `oguk/__init__.py` to make sure the API symbols cited in the Code tab are still exported.

## References

- OG-Core: <https://github.com/PSLmodels/OG-Core>
- OG-UK: <https://github.com/PSLmodels/OG-UK>
- Policy Simulation Library: <https://pslmodels.org>
- OBR Working Paper No. 22 — "A new UK overlapping generations model" (April 2025)
