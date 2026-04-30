# Python examples

Runnable Python that mirrors the **Code** tab of the OG-UK dashboard. Each Code-tab step that has actual logic ships as its own script here, and the shared reform (Step 2) lives in an importable `og_dashboard` package so every script can reuse it.

## Layout

```
python/
├── pyproject.toml
├── og_dashboard/
│   ├── __init__.py
│   └── reform.py                # Step 2 — REFORM = Policy(...)
└── scripts/
    ├── 01_install.sh            # Step 1
    ├── 03_steady_state.py       # Step 3
    ├── 04_transition.py         # Step 4
    └── 06_multi_sector.py       # Step 6
```

Steps 5 (the `map_transition_to_real_world` field reference) and 7 (links and follow-up) are documentation-only and live in the dashboard's Code tab.

## Setup

Prerequisites: Python 3.11+ and [`uv`](https://docs.astral.sh/uv/). You also need a HuggingFace token with read access to `policyengine/policyengine-uk-data` — create one at <https://huggingface.co/settings/tokens>.

```bash
cd python
./scripts/01_install.sh
export HUGGING_FACE_TOKEN=hf_your_token_here
```

## Run any step on its own

```bash
# Steady state — fastest, prints a one-line £bn impact summary.
uv run python scripts/03_steady_state.py

# Year-by-year transition — heavier, parallelised via Dask.
uv run python scripts/04_transition.py

# 8-sector industry breakdown.
uv run python scripts/06_multi_sector.py
```

## Customise the reform

Edit `og_dashboard/reform.py`:

- swap `gov.hmrc.income_tax.rates.uk[0].rate` for any PolicyEngine UK parameter,
- change `value=0.21` to the new value,
- change `start_date` if you want the reform to bite later.

The rest of the pipeline doesn't change — every script imports `REFORM` from this one place.
