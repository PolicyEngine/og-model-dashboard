import CodeBlock from '../components/CodeBlock.jsx';
import TerminalBlock from '../components/TerminalBlock.jsx';

const REFORM_PY = `from datetime import datetime
from policyengine.core import ParameterValue, Policy
from policyengine.tax_benefit_models.uk import uk_latest

# Reform: raise the basic rate of income tax from 20% to 21%
basic_rate = uk_latest.get_parameter("gov.hmrc.income_tax.rates.uk[0].rate")

REFORM = Policy(
    name="Basic rate 21%",
    parameter_values=[
        ParameterValue(
            parameter=basic_rate,
            value=0.21,
            start_date=datetime(2026, 1, 1),
        )
    ],
)`;

const SS_PY = `from oguk import solve_steady_state, map_to_real_world

baseline = solve_steady_state(start_year=2026)
reform   = solve_steady_state(start_year=2026, policy=REFORM)

impact = map_to_real_world(baseline, reform)

print(f"GDP:         £{impact.gdp:,.1f}bn  ({impact.gdp_pct:+.3f}%)")
print(f"Tax revenue: £{impact.tax_revenue:,.1f}bn  ({impact.tax_revenue_pct:+.3f}%)")
print(f"Investment:  £{impact.investment:,.1f}bn  ({impact.investment_pct:+.3f}%)")
print(f"Interest:    {impact.r_baseline:.2%} -> {impact.r_reform:.2%}")`;

const TPI_PY = `from dask.distributed import Client
from oguk import run_transition_path, map_transition_to_real_world

client = Client(n_workers=2, threads_per_worker=1, memory_limit="2GB")

base_tp, reform_tp = run_transition_path(
    start_year=2026,
    policy=REFORM,
    client=client,
)

client.close()

impact = map_transition_to_real_world(base_tp, reform_tp)

# First ten years of GDP and tax-revenue impacts
for i in range(10):
    print(
        f"{impact.years[i]}  "
        f"ΔGDP {impact.gdp_change[i]:+6.2f}  "
        f"ΔRevenue {impact.tax_revenue_change[i]:+6.2f}"
    )`;

const FIELDS_PY = `impact = map_transition_to_real_world(base_tp, reform_tp)

impact.years              # fiscal-year strings: ["2026-27", ..., "2085-86"]
impact.gdp                # reform GDP path (£bn, per year)
impact.gdp_change         # £bn change vs baseline, per year
impact.tax_revenue_change
impact.consumption_change
impact.investment_change
impact.government_change
impact.debt_change

# Interest-rate paths live on the TPI results themselves
base_tp.r, reform_tp.r    # baseline / reform r(t)`;

const MULTI_PY = `base_tp, reform_tp = run_transition_path(
    start_year=2026,
    policy=REFORM,
    client=client,
    multi_sector=True,    # 8-sector CES production
)`;

const TERMINAL = [
  [['Solving baseline steady state (age_specific=\'pooled\', 1-sector)...', 'term-dim']],
  [['  Done in 71.4s', 'term-dim']],
  [['Solving reform steady state (age_specific=\'pooled\', 1-sector)...', 'term-dim']],
  [['  Done in 38.2s', 'term-dim']],
  '',
  [['Steady state impact (£bn, current prices)', 'term-em']],
  [['============================================================', 'term-dim']],
  'Variable          Baseline       Reform     Change        %',
  [['------------------------------------------------------------', 'term-dim']],
  [['GDP                2853.8       2852.6     '], ['  -1.2   -0.043%', 'term-neg']],
  [['Consumption        1819.4       1817.2     '], ['  -2.2   -0.121%', 'term-neg']],
  [['Investment          469.1        466.2     '], ['  -2.9   -0.612%', 'term-neg']],
  [['Government          564.4        565.5     '], ['  +1.1   +0.198%', 'term-pos']],
  [['Tax revenue        1036.4       1051.7     '], [' +15.3   +1.473%', 'term-pos']],
  [['Debt               2691.4       2691.0     '], ['  -0.4   -0.014%', 'term-neg']],
  '',
  'Interest rate:  3.84% -> 3.87%',
];

export default function CodeTab() {
  return (
    <>
      <div className="code-intro">
        <h2>From a few lines of Python to a full UK transition path</h2>
        <p>
          OG-UK is open source. The simulation that produced the charts in the <strong>Example</strong> tab —
          and any other reform you might want to try — is fewer than fifty lines of Python. This tab walks
          through the actual code from the{' '}
          <a href="https://github.com/PSLmodels/OG-UK" target="_blank" rel="noreferrer">OG-UK repository</a>:
          install, define a reform with PolicyEngine, solve, and translate the model’s abstract output into
          pounds. Copy a block, paste, run.
        </p>
      </div>

      <div className="section-card">
        {/* 1. Install */}
        <div className="code-step" id="code-1">
          <h3>
            <span className="step-tag">1</span> Install
          </h3>
          <p>
            OG-UK uses <a href="https://docs.astral.sh/uv/" target="_blank" rel="noreferrer">uv</a>, a fast
            Python package manager. With Python 3.11+ and uv on your machine, three commands are enough:
          </p>
          <CodeBlock filename="terminal" lang="bash">
{`git clone https://github.com/PSLmodels/OG-UK.git
cd OG-UK
uv sync`}
          </CodeBlock>
          <p>
            One bit of admin: OG-UK pulls the PolicyEngine UK microdata from HuggingFace, so set a token once
            with read access to <code>policyengine/policyengine-uk-data</code>:
          </p>
          <CodeBlock filename="terminal" lang="bash">
{`export HUGGING_FACE_TOKEN=hf_your_token_here`}
          </CodeBlock>
          <p>
            Now <code>uv run python examples/run_oguk.py</code> will solve a baseline and a reform steady state
            and print the impact in £bn.
          </p>
        </div>

        {/* 2. Define a reform */}
        <div className="code-step" id="code-2">
          <h3>
            <span className="step-tag">2</span> Define a reform
          </h3>
          <p>
            Reforms use the <strong>PolicyEngine</strong> API: pick a parameter from the UK tax-and-benefit
            rule book, give it a new value and a start date. Anything PolicyEngine can represent — rates,
            thresholds, allowance tapers, brand-new benefits — flows straight through.
          </p>
          <CodeBlock filename="examples/run_oguk.py" lang="py">{REFORM_PY}</CodeBlock>
          <p>
            To simulate a different reform, swap the parameter path and value — the rest of the pipeline
            doesn’t change.
          </p>
        </div>

        {/* 3. Steady state */}
        <div className="code-step" id="code-3">
          <h3>
            <span className="step-tag">3</span> Solve the long-run steady state
          </h3>
          <p>
            The fastest way to see what a reform does. <code>solve_steady_state</code> finds the long-run
            equilibrium of the UK economy under a given policy: the prices, quantities and tax revenues that
            emerge once the economy has fully adjusted. Run it once for the baseline, once for the reform; the
            difference is the answer.
          </p>
          <CodeBlock filename="examples/run_oguk.py" lang="py">{SS_PY}</CodeBlock>
          <p>
            A typical run takes a couple of minutes on a laptop. The output below is <em>illustrative</em> —
            the format matches <code>run_oguk.py</code>, but actual numbers depend on the calibration date and
            your data release.
          </p>
          <TerminalBlock lines={TERMINAL} />
        </div>

        {/* 4. Transition */}
        <div className="code-step" id="code-4">
          <h3>
            <span className="step-tag">4</span> Run the year-by-year transition path
          </h3>
          <p>
            The steady state tells you where the economy ends up. The <strong>transition path</strong> tells
            you how it gets there — year by year, 60&nbsp;periods by default (configurable). This is what
            powers the dashed lines in the <strong>Example</strong> tab.
          </p>
          <p>
            Solving the transition is heavier (every cohort’s lifetime is solved under rational expectations),
            so OG-UK uses <a href="https://www.dask.org/" target="_blank" rel="noreferrer">Dask</a> to
            parallelise across CPU cores.
          </p>
          <CodeBlock filename="examples/run_oguk.py" lang="py">{TPI_PY}</CodeBlock>
        </div>

        {/* 5. Real-world units */}
        <div className="code-step" id="code-5">
          <h3>
            <span className="step-tag">5</span> From abstract units to pounds
          </h3>
          <p>
            OG-UK solves in dimensionless model units. To translate them into figures a policymaker can read —
            billions of pounds, percentages of GDP — the model’s steady-state GDP is anchored to the ONS
            figure and every other variable is scaled in proportion. <code>map_to_real_world</code> and{' '}
            <code>map_transition_to_real_world</code> handle the translation:
          </p>
          <CodeBlock filename="oguk/api.py" lang="py">{FIELDS_PY}</CodeBlock>
          <p>
            Each attribute is a NumPy array indexed by year — ready for a Plotly chart, a pandas DataFrame, or
            whatever else you like.
          </p>
        </div>

        {/* 6. Multi-sector */}
        <div className="code-step" id="code-6">
          <h3>
            <span className="step-tag">6</span> Bring in the eight industry sectors
          </h3>
          <p>
            Pass <code>multi_sector=True</code> and the same call returns the breakdown across the eight UK
            industry sectors (energy, manufacturing, construction, trade &amp; transport, info &amp; finance,
            real estate, business services, public &amp; other) — the basis for the <em>industry by
            industry</em> view in the Example tab.
          </p>
          <CodeBlock filename="examples/run_oguk.py" lang="py">{MULTI_PY}</CodeBlock>
          <p>Sector-level output, capital and labour are returned alongside the macro aggregates.</p>
        </div>

        {/* 7. Where to go next */}
        <div className="code-step" id="code-7">
          <h3>
            <span className="step-tag">7</span> Where to go next
          </h3>
          <p>
            The{' '}
            <a href="https://github.com/PSLmodels/OG-UK/tree/main/examples" target="_blank" rel="noreferrer">
              examples directory
            </a>{' '}
            in the OG-UK repo has more variations to copy:
          </p>
          <ul className="intro-list">
            <li><code>run_oguk.py</code> — the canonical full pipeline (steady state and TPI).</li>
            <li><code>run_oguk_fast_tpi.py</code> — a faster transition with reduced periods (T = 80) for quick iteration.</li>
            <li><code>run_oguk_fast_sector.py</code> — the 8-sector calibration that produces the Example-tab charts.</li>
            <li><code>plot.py</code> — visualises the estimated tax functions in 3D.</li>
          </ul>
          <p>
            Full API reference and theory documentation:{' '}
            <a href="https://pslmodels.github.io/OG-UK" target="_blank" rel="noreferrer">
              pslmodels.github.io/OG-UK
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
