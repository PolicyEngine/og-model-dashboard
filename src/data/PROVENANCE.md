# Provenance of `tpiData.json`

| field | value |
|---|---|
| Model results | OG-UK `scripts/tpi_results.xlsx`, "Generated 19 March 2026", committed in OG-UK `a314659` (19 March 2026) and removed from tracking in `f5b1eab` the same day. All 240 model % changes in this file match it to within 2e-14 (issue #11) |
| Copied into the dashboard | 28 April 2026 (dashboard commit `d57e012`), when OG-UK was at `3a16cff` (21 April 2026) |
| `policyengine-uk` | Not recorded. OG-UK at `a314659` required `policyengine-uk>=2.0`; the 2.88.0 pin came later |
| Series | `macro6` (6 macro charts), `sector3` (3 sector charts), `sector24` (24 per-sector charts) |
| Horizon shown | 2026–2030 |
| Model run | OG-UK `scripts/run_tpi_and_export.py` (`multi_sector=True`, `start_year=2026`, basic rate 21% from 1 Jan 2027), then `scripts/tpi_charts_plotly.py` on the OBR November 2025 EFO |
| Macro panels rebuilt | November 2026 by `python/scripts/07_export_dashboard_json.py --from-published` (same model % changes; government consumption, PSND ex BoE debt and pre-2008-09 ONS baselines corrected; see the script docstring) |

## Known caveats

**0. The run used OG-UK's older sector order.**

In the 19 March 2026 run, Public & Other was the last industry: OG-Core's industry M, which produces
the government consumption and capital goods and whose price is the numeraire. From OG-UK `7452eef`
(19 March 2026, after the results were committed in `a314659`), Manufacturing is last. In this run the reform raises the government consumption
share of GDP from the first model year, 2026-27, so Public & Other moves in 2026-27, before the tax
rise (issue #11).

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

`python/scripts/07_export_dashboard_json.py` builds this file. Its docstring gives both modes:
`--from-published` (rebuild the macro panels from the published 19 March 2026 run, copied into the dashboard on 28 April 2026; no model run) and
`--tpi-results` (full rebuild after a fresh OG-UK run; the rerun plan is
PolicyEngine/og-model-dashboard#5).

Record the OG-UK commit, the resolved `policyengine` and `policyengine-uk` versions, and the
generation date in the table above whenever the data is refreshed.
