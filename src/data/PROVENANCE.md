# Provenance of `tpiData.json`

| field | value |
|---|---|
| Generated | 28 April 2026 (dashboard commit `d57e012`) |
| OG-UK commit at that date | `3a16cff` (21 April 2026) |
| `policyengine-uk` pinned then | 2.88.0 |
| Series | `macro6` (6 macro charts), `sector3` (3 sector charts), `sector24` (24 per-sector charts) |
| Horizon shown | 2026–2030 |
| Script | `python/scripts/06_multi_sector.py` (`multi_sector=True`, `start_year=2026`, `policy=REFORM`) |

## Known caveats

**1. The figures predate OG-UK's July 2026 MTR fix.**

OG-UK commit `3c3ce10` (22 July 2026), *"Support policyengine-uk >= 2.89; fix the silent MTR bugs the
pin was masking"*, corrected the marginal-tax-rate estimation. From `oguk/api.py`:

> the previous code did not divide at all, so `1 - delta` went negative for every multi-adult
> household and `np.clip` floored it to ZERO (measured: 80% of GBP 25-35k earners at a 0.000
> labour MTR)

On current OG-UK the weighted-mean labour MTR is 0.26. The published series were produced against
tax functions in which most middle earners faced a zero labour MTR, which OG-UK now treats as a bug.

**2. The 8-sector transition path does not converge over the full horizon on current OG-UK.**

Reproducing it raises `RuntimeError: Transition path equlibrium not found (RC_error)`. The
resource-constraint error grows from t≈4 and the path is non-finite from t=20. The published window
(2026–2030) sits in the region where the error is still ~1e-3, but those years were solved as part
of a global path whose terminal condition is not satisfied, and households in the model are
forward-looking.

Ruled out as causes by experiment: TPI outer method (Picard and Anderson fail identically),
`alpha_G` level, fiscal-closure timing (`tG1`, `tG2`, `rho_G`), `start_year`, and the MTR change
itself. The 8-sector steady state converges cleanly, and the 1-sector transition path converges.

See PolicyEngine/og-model-dashboard#2 for the full diagnostic trace.

## Regenerating

    cd python && uv sync
    uv run python scripts/06_multi_sector.py

Record the OG-UK commit, the resolved `policyengine` and `policyengine-uk` versions, and the
generation date in the table above whenever the data is refreshed.
