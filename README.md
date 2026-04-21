# OG-UK Dashboard

A static dashboard explaining **OG-UK** — the UK calibration of [OG-Core](https://github.com/PSLmodels/OG-Core), the open-source overlapping-generations dynamic general equilibrium framework maintained by the [Policy Simulation Library](https://pslmodels.org) (PSL).

The dashboard has three tabs:

- **Methodology** — a scrollytelling walk-through of the eight core elements of OG-UK, with a sticky right-hand "freeze-box" panel that shows the formal structure (equations, tax instruments, solution algorithm) for each step as you scroll.
- **OBR model comparison** — a side-by-side comparison between OG-UK and the OBR's new UK OLG model ([Working Paper No. 22](https://obr.uk), Brzezinski, Hantzsche & Watson, April 2025). Covers production, households, bequests, taxes, government, open economy, solution method, and calibration.
- **Results** — placeholder for forthcoming simulation results (transition paths, distributional analyses).

## Stack

Single static `index.html` with Google Fonts (Roboto) and [KaTeX](https://katex.org/) for equation rendering. No build step, no framework — everything renders from the one file.

## Running locally

Any static server works. The simplest option:

```bash
python3 -m http.server 5180
```

Then open http://localhost:5180/.

## Structure

```
.
├── index.html               # the entire dashboard (HTML + inline CSS + JS)
├── assets/
│   └── obr-working-paper-22.pdf   # linked from the OBR tab
├── vercel.json              # Vercel config (clean URLs)
└── README.md
```

## Deployment

Deployed on Vercel. Every push to `main` triggers a production re-deploy automatically via the Vercel ↔ GitHub integration.

## References

- OG-Core: https://github.com/PSLmodels/OG-Core
- OG-UK: https://github.com/PSLmodels/OG-UK
- Policy Simulation Library: https://pslmodels.org
- OBR Working Paper No. 22 — "A new UK overlapping generations model" (April 2025)
