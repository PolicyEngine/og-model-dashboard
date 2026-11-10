"""Code-tab Step 2 — define the reform.

Importable so every later script reuses the same Policy object::

    from og_dashboard.reform import REFORM

The reform raises the basic rate of UK income tax from 20% to 21% from
1 January 2027, as in the published Showcase run (OG-UK
``scripts/run_tpi_and_export.py``). OG-UK labels model year ``y`` as fiscal
year ``y``–``y+1``, so the reform first applies in 2027–28, the first year the
dashed reform path leaves the baseline.
"""

from datetime import datetime

from policyengine.core import ParameterValue, Policy
from policyengine.tax_benefit_models.uk import uk_latest

basic_rate = uk_latest.get_parameter("gov.hmrc.income_tax.rates.uk[0].rate")

REFORM = Policy(
    name="Basic rate 21%",
    parameter_values=[
        ParameterValue(
            parameter=basic_rate,
            value=0.21,
            start_date=datetime(2027, 1, 1),
        ),
    ],
)
