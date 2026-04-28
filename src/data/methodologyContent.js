// Methodology-tab narrative content.
// Each step has a title and an HTML body (sub-headings + paragraphs).

export const STEPS = [
  {
    title: 'The overlapping-generations idea',
    body: `<div class="sub-heading">Many generations coexist</div>
              <p>The central insight of an overlapping-generations model is that the economy is not populated by a single &ldquo;representative agent.&rdquo; At any moment in time, many generations coexist: young people just entering the labour force, middle-aged workers at peak earnings, and retirees living off savings and pensions. Each generation has a different remaining lifespan, a different stock of accumulated wealth, and therefore a different response to any given policy change.</p>
              <div class="sub-heading">Age cohorts</div>
              <p>OG-Core models S economically active age cohorts (typically 80, representing ages 21 to 100). Each period, a new cohort is born and the oldest cohort dies with some probability. The population distribution by age evolves over time with fertility, mortality, and immigration, and eventually reaches a stationary distribution in the long run.</p>
              <div class="sub-heading">Ability types</div>
              <p>Within each age cohort, households are further divided into J ability types, each with a distinct permanent labour productivity. High-ability types earn more per hour of work and typically save more. This heterogeneity is essential for capturing how a tax reform affects the income distribution, not just average outcomes.</p>`,
  },
  {
    title: 'Household decisions',
    body: `<div class="sub-heading">Three decisions each period</div>
              <p>Every period, each household makes three decisions: how much to <strong>consume</strong>, how many hours to <strong>work</strong>, and how much to <strong>save</strong> for the future. These choices are made to maximise expected lifetime utility, subject to a budget constraint.</p>
              <div class="sub-heading">Consumption utility</div>
              <p>Consumption utility follows a CRRA (constant relative risk aversion) function, where the risk aversion parameter governs how strongly households prefer smooth consumption over time. Before entering this function, individual consumption goods are aggregated using a Stone-Geary Cobb-Douglas form that accounts for minimum subsistence levels.</p>
              <div class="sub-heading">Labour disutility</div>
              <p>Labour disutility uses an elliptical function rather than a standard power function. This ensures that the marginal cost of working goes to zero when hours are zero (so households always choose to work at least a little) and goes to infinity at the upper bound (so they never hit the ceiling). This avoids computationally expensive occasionally-binding constraint methods.</p>
              <div class="sub-heading">Bequest utility</div>
              <p>Bequest utility captures the &ldquo;warm glow&rdquo; from leaving wealth behind upon death. It is weighted by the age-specific mortality probability, so it matters most for older households. The strength of the bequest motive varies by ability type and is calibrated to match the observed wealth distribution.</p>
              <div class="sub-heading">Budget constraint and Euler equations</div>
              <p>The household's budget constraint says that each period, income from savings returns, labour earnings, bequests received, government transfers, and pensions must cover consumption (including consumption taxes), income and wealth taxes, and savings carried into the next period.</p>
              <p>The optimal decisions are characterised by two Euler equations. The labour first-order condition says: work until the after-tax wage equals the marginal disutility. The savings Euler equation says: give up one unit of consumption today only if the discounted, after-tax return makes tomorrow's consumption sufficiently valuable.</p>`,
  },
  {
    title: 'Firms and production',
    body: `<div class="sub-heading">CES technology</div>
              <p>The production side of the economy consists of M industries, each populated by perfectly competitive firms. Each firm combines three inputs: <strong>private capital</strong>, <strong>public capital</strong> (government-provided infrastructure), and <strong>labour</strong>. These are combined using a constant elasticity of substitution (CES) technology.</p>
              <div class="sub-heading">Substitution and productivity</div>
              <p>The elasticity parameter governs how easily firms can substitute between capital and labour. When it equals one, the function reduces to the familiar Cobb-Douglas form. Total factor productivity can vary across industries and over time, allowing the model to capture sector-specific technological change.</p>
              <div class="sub-heading">First-order conditions</div>
              <p>Profit maximisation yields the standard first-order conditions: the <strong>wage equals the marginal product of labour</strong>, and the <strong>rental rate of capital</strong> equals the after-tax marginal product of capital, accounting for depreciation, tax deductions, and investment tax credits.</p>
              <div class="sub-heading">Public capital rents</div>
              <p>A distinctive feature of OG-Core is that <strong>public capital generates economic rents</strong>: since firms cannot deduct the cost of using government infrastructure, the returns from public capital flow to private capital owners through an augmented rate of return.</p>`,
  },
  {
    title: 'Government',
    body: `<div class="sub-heading">Revenue and spending</div>
              <p>The government in OG-Core collects revenue from <strong>five tax instruments</strong>: individual income taxes, consumption taxes, wealth taxes, corporate income taxes, and bequest taxes. It spends on public goods, infrastructure, pensions, lump-sum transfers, and universal basic income. The difference is financed by issuing debt.</p>
              <div class="sub-heading">Income tax: Gouveia-Strauss functions</div>
              <p>The income tax is the most complex instrument. OG-Core supports several functional forms for effective and marginal tax rates, estimated from detailed tax-benefit calculations. For OG-UK, we use the <strong>Gouveia-Strauss</strong> specification, which estimates the effective tax rate as a smooth, monotonically increasing function of income and derives the marginal tax rate analytically. The estimation uses PolicyEngine-UK output on the <strong>Enhanced FRS</strong> &mdash; the Family Resources Survey enhanced with HMRC&rsquo;s Survey of Personal Incomes, the Living Costs and Food Survey, and the Wealth and Assets Survey.</p>
              <div class="sub-heading">Other tax instruments</div>
              <p>The <strong>wealth tax</strong> uses a progressive three-parameter function that can produce anything from zero taxation to smoothly increasing marginal rates. <strong>Consumption taxes</strong> are linear rates that can vary by good, capturing VAT and excise taxes. <strong>Corporate income taxes</strong> are flat rates by industry.</p>
              <div class="sub-heading">Fiscal closure rule</div>
              <p>Since debt cannot grow without bound, a <strong>fiscal closure rule</strong> activates after a specified period to gradually bring the debt-to-GDP ratio toward a target. The modeller chooses whether the adjustment falls on government spending, transfers, or some combination of both.</p>`,
  },
  {
    title: 'Market clearing and equilibrium',
    body: `<div class="sub-heading">Supply equals demand</div>
              <p>All the pieces above (household decisions, firm production, and government policy) are connected through <strong>market clearing conditions</strong>. For the economy to be in equilibrium, supply must equal demand in every market simultaneously.</p>
              <div class="sub-heading">Labour and capital markets</div>
              <p>In the <strong>labour market</strong>, the total efficiency-weighted labour supply from all households across all ages and ability types must equal total firm demand across all industries. In the <strong>capital market</strong>, the total stock of savings (both domestic and foreign) must equal the capital demanded by firms plus government debt. The model is an <strong>open economy</strong>: foreign capital and foreign debt holdings are governed by parameters that control the degree of international capital mobility.</p>
              <div class="sub-heading">Goods and debt markets</div>
              <p>For each <strong>goods market</strong>, industry output must equal consumption demand. The final industry clears residually, absorbing investment, government purchases, and any remaining demand. The <strong>debt market</strong> splits government debt between domestic and foreign holders.</p>
              <div class="sub-heading">What defines an equilibrium</div>
              <p>An equilibrium is a set of prices (the interest rate, wage, and goods prices) such that all households optimise, all firms optimise, the government budget constraint holds, and all four markets clear. Finding such an equilibrium is a large-scale nonlinear fixed-point problem.</p>`,
  },
  {
    title: 'How the model is solved',
    body: `<div class="sub-heading">Two-stage approach</div>
              <p>Finding equilibrium is a two-stage computational problem. The model first solves for the long-run steady state, then computes the transition path from today's economy to that steady state.</p>
              <div class="sub-heading">Stage 1: Steady state</div>
              <p>The model first finds the long-run equilibrium where all variables are constant (after removing trend growth). This uses a nested fixed-point algorithm. The <em>outer loop</em> guesses a vector of aggregate prices and quantities. The <em>inner loop</em> takes these as given and solves the Euler equations for every combination of ability type and age. Because each type is independent, they can be solved <strong>in parallel</strong>. After solving all households, the algorithm aggregates their decisions, computes firm demands, checks the government budget, and derives new guesses. It iterates until convergence.</p>
              <div class="sub-heading">Stage 2: Transition path (TPI)</div>
              <p>Starting from today's economy, the model then solves for how the economy evolves toward the steady state over T periods. The <em>Time Path Iteration</em> (TPI) method guesses entire time paths for all prices and quantities, solves every cohort's lifetime decisions given those paths (with <strong>rational expectations</strong> about future prices), checks whether the implied paths match the guesses, and iterates. This is what produces year-by-year projections.</p>`,
  },
  {
    title: 'Calibrating for the United Kingdom',
    body: `<div class="sub-heading">From theory to UK data</div>
              <p>OG-Core provides the theoretical framework. To make it a model of the <em>UK</em> economy, every parameter must be calibrated to UK data. This is what the OG-UK calibration layer does.</p>
              <div class="sub-heading">Macroeconomic parameters</div>
              <p>Macroeconomic parameters are drawn from the ONS national accounts and the OBR's Economic and Fiscal Outlook: the debt-to-GDP ratio, the revenue-to-GDP ratio, government spending shares, and growth rates. The state pension age is set to match current UK rules. Demographics use the UN World Population Prospects data for the United Kingdom.</p>
              <div class="sub-heading">Tax function estimation</div>
              <p>Tax functions are estimated from PolicyEngine UK. Rather than hard-coding the UK income tax schedule, the model estimates smooth <strong>Gouveia-Strauss</strong> functions that capture the effective relationship between income and taxes across the entire population. This approach naturally incorporates the interaction of income tax, National Insurance, and the personal allowance taper.</p>
              <div class="sub-heading">Real-world mapping</div>
              <p>Model outputs are expressed in abstract units. To translate them into pound-sterling figures, OG-UK anchors the model's steady-state GDP to the ONS figure and scales all other variables proportionally. This allows results to be presented as changes in billions of pounds, a format that is directly interpretable by policymakers and the public.</p>`,
  },
  {
    title: 'What this enables',
    body: `<div class="sub-heading">Two complementary views</div>
              <p>Together with a static microsimulation engine, OG-UK supports two complementary views of any UK tax or benefit reform. Static analysis provides the detailed distributional picture: which households gain, which lose, and by how much. OG-UK provides the macroeconomic picture: what happens to GDP, investment, government revenue, interest rates, and wages as the economy adjusts over time.</p>
              <div class="sub-heading">Why both views matter</div>
              <p>The two perspectives can tell very different stories. A reform that raises significant revenue in a static analysis may raise less in practice, because higher tax rates reduce labour supply and investment, shrinking the tax base. Conversely, a reform that costs revenue upfront might partly pay for itself over time through increased economic activity. OG-UK captures these dynamics.</p>
              <div class="sub-heading">Year-by-year transition paths</div>
              <p>The transition path is particularly valuable. Rather than just comparing two long-run steady states, it shows the <strong>year-by-year adjustment</strong>: how GDP dips in the first few years, how interest rates respond, when revenue stabilises. These time paths can be mapped onto OBR forecast horizons.</p>

              <div class="sub-heading">What the model does not capture</div>
              <p>OG-UK is a structural macro model and inherits the simplifications of that class. The most important caveats for reading its outputs:</p>
              <ul class="intro-list">
                <li><strong>Smoothed tax functions, not statutory bands.</strong> Income tax and National Insurance are folded into a single Gouveia&ndash;Strauss function fitted to PolicyEngine-UK output. Reforms that change <em>average</em> liability across the income distribution flow through cleanly; reforms whose mechanism is the kink itself (a new threshold, an allowance taper change) are captured only to the extent the smoothed function shifts.</li>
                <li><strong>Permanent ability types, no earnings risk.</strong> OG-UK uses J&nbsp;=&nbsp;7 deterministic ability types. There is no idiosyncratic earnings shock within a type, so precautionary savings and earnings-risk-driven inequality are not a channel here. This is a deliberate trade-off &mdash; see the OBR-comparison tab for the alternative.</li>
                <li><strong>UK as a single entity.</strong> The model calibrates to UK-wide aggregates; there is no England / Scotland / Wales / Northern&nbsp;Ireland breakdown. Devolved tax differentials and reforms with explicit regional incidence cannot be analysed at sub-UK granularity.</li>
                <li><strong>Reforms are step changes.</strong> A PolicyEngine reform sets parameter values from a start date and they hold thereafter. Phased introductions, sunset clauses or year-on-year indexation changes can be modelled but require explicit scripting; they are not the default.</li>
                <li><strong>Truncated horizon.</strong> The default 60-period transition assumes the steady state is reached by year 60. Effects that play out over longer horizons collapse into the steady-state anchor.</li>
              </ul>
              <p>None of these are model bugs &mdash; they are choices that make the macro accounting tractable. They are worth knowing when reading the Example tab&rsquo;s charts.</p>
            </div>
          </div>

        </div><!-- end scrolly-narrative -->

        <!-- RIGHT: Sticky freeze-box -->
        <aside class="scrolly-sticky">
          <div class="example-panel" id="sticky-panel">
            <div class="example-header">
              <span class="example-title" id="panel-title">Overlapping generations</span>
              <span class="example-badge" id="panel-badge">Step 1</span>
            </div>
            <div class="example-body" id="panel-body"></div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ============ OBR COMPARISON TAB ============ -->
    <section class="tab-panel" id="tab-obr" role="tabpanel">
      <div class="obr-layout">

        <div class="obr-body">

          <!-- Overview / hero -->
          <div class="section-card" id="obr-overview">
            <div class="obr-head"><h3>Overview</h3></div>
            <p class="obr-lede">
              This tab is a <strong>side-by-side comparison</strong> of the two UK overlapping-generations macro models: <strong>OG-UK</strong> &mdash; the UK calibration of
              <a href="https://github.com/PSLmodels/OG-Core" target="_blank" rel="noreferrer">OG-Core</a>, maintained by the
              <a href="https://pslmodels.org" target="_blank" rel="noreferrer">Policy Simulation Library</a> &mdash; and the <strong>OBR UK OLG</strong> model described in
              <a href="assets/obr-working-paper-22.pdf" target="_blank" rel="noreferrer">Working Paper No.&nbsp;22</a>
              (Brzezinski, Hantzsche &amp; Watson, April&nbsp;2025).
            </p>
            <p class="obr-lede">
              The sections below walk through how each model treats production, households, bequests, the tax system, government, the open economy, and the solution method &amp; calibration &mdash; so you can see where the two approaches agree, where they differ, and when to reach for one over the other. The two models occupy complementary niches: OG-UK is structurally rich and traces full year-by-year transition paths, while OBR UK OLG is tightly calibrated to UK fiscal institutions and steady-state outcomes.
            </p>
            <table class="comparison-table">
              <thead><tr><th>Dimension</th><th>OG-UK strength</th><th>OBR UK OLG strength</th></tr></thead>
              <tbody>
                <tr><td>Transition dynamics</td><td>Full year-by-year paths</td><td>Steady-state only</td></tr>
                <tr><td>UK institutional detail</td><td>Smooth approximations</td><td>Explicit bands and rates</td></tr>
                <tr><td>Within-cohort inequality</td><td>Permanent types</td><td>Stochastic earnings</td></tr>
                <tr><td>Production structure</td><td>Multi-sector CES</td><td>Single-sector Cobb-Douglas</td></tr>
                <tr><td>Tax instruments</td><td>5 instruments</td><td>3 instruments (more detailed)</td></tr>
                <tr><td>Fiscal policy levers</td><td>G, TR, UBI, I<sub>g</sub></td><td>RBI, age-dependent transfers</td></tr>
                <tr><td>Openness</td><td>Open-source, Python</td><td>MATLAB, closed toolkit</td></tr>
              </tbody>
            </table>
          </div>

          <!-- 1. Production -->
          <div class="section-card" id="obr-1">
            <div class="obr-head"><h3>Production technology</h3></div>
            <p class="obr-lede">How each model represents firms — the technology for combining capital and labour, and whether production is a single aggregate or split across multiple industries.</p>
          <table class="comparison-table">
            <thead><tr><th></th><th>OG-UK</th><th>OBR UK OLG</th></tr></thead>
            <tbody>
              <tr><td>Production function</td><td>CES (nests Cobb-Douglas as special case)</td><td>Cobb-Douglas only</td></tr>
              <tr><td>Industries</td><td>M industries (multi-sector)</td><td>Single sector</td></tr>
              <tr><td>Public capital</td><td>Yes — generates rents to private capital</td><td>No</td></tr>
              <tr><td>Capital share</td><td>Configurable per industry</td><td>α = 0.33</td></tr>
              <tr><td>Labour input</td><td>Efficiency-weighted across permanent types</td><td>Efficiency-weighted by age + stochastic shocks</td></tr>
              <tr><td>TFP</td><td>Varies by industry and over time</td><td>Normalised to 1, with labour-augmenting growth g = 1.2%</td></tr>
              <tr><td>Depreciation</td><td>Configurable per industry</td><td>δ = 5%</td></tr>
            </tbody>
          </table>
        </div>

          <!-- 2. Household heterogeneity -->
          <div class="section-card" id="obr-2">
            <div class="obr-head"><h3>Household heterogeneity</h3></div>
            <p class="obr-lede">How households differ within each age cohort, and the utility function they maximise. The core structural difference: OG-UK uses <strong>permanent ability types</strong> assigned at birth, while the OBR model uses <strong>stochastic earnings shocks</strong> each period — the latter naturally generates precautionary savings and within-cohort inequality that evolves over the lifecycle.</p>
            <table class="comparison-table">
            <thead><tr><th></th><th>OG-UK</th><th>OBR UK OLG</th></tr></thead>
            <tbody>
              <tr><td>Within-cohort variation</td><td>J <strong>permanent ability types</strong> (deterministic)</td><td><strong>Stochastic earnings shocks</strong> (AR(1) persistent + i.i.d. transitory)</td></tr>
              <tr><td>Income inequality driver</td><td>Fixed type assignment at birth</td><td>Random shocks each period (ρ<sup>z</sup> = 0.9, σ<sub>z</sub> = 0.05, σ<sub>e</sub> = 0.7)</td></tr>
              <tr><td>Precautionary savings</td><td>Not a primary channel</td><td>Yes — driven by earnings uncertainty</td></tr>
              <tr><td>Utility function</td><td>CRRA on consumption; elliptical labour disutility</td><td>Cobb-Douglas over consumption and leisure (non-separable)</td></tr>
              <tr><td>Labour disutility</td><td><strong>Elliptical function</strong> — always interior solutions</td><td>Implicit in Cobb-Douglas composite — corner solutions possible</td></tr>
              <tr><td>Risk aversion parameter</td><td>σ on consumption only</td><td>σ₂ = 2 on consumption-leisure composite</td></tr>
              <tr><td>Consumption aggregation</td><td>Stone-Geary Cobb-Douglas (subsistence levels, I goods)</td><td>Single consumption good</td></tr>
              <tr><td>Discount factor</td><td>β<sub>j</sub> varies by ability type</td><td>β = 0.99 (uniform)</td></tr>
            </tbody>
          </table>
        </div>

          <!-- 3. Bequest motive -->
          <div class="section-card" id="obr-3">
            <div class="obr-head"><h3>Bequest motive</h3></div>
            <p class="obr-lede">How wealth is transferred across generations at death — whether bequests are a deliberate utility-generating choice, an accident of mortality, or some combination.</p>
            <table class="comparison-table">
            <thead><tr><th></th><th>OG-UK</th><th>OBR UK OLG</th></tr></thead>
            <tbody>
              <tr><td>Motive</td><td>"Warm glow" weighted by mortality probability ρ<sub>s</sub></td><td>"Warm glow" with target level, kicks in at age j* = 91</td></tr>
              <tr><td>Varies by type</td><td>Yes — χ<sup>b</sup><sub>j</sub> calibrated per ability type</td><td>Uniform (φ₁ = 10, φ₂ = 4.55)</td></tr>
              <tr><td>Distribution</td><td>To surviving households</td><td>Equal distribution to ages 55–75</td></tr>
            </tbody>
          </table>
        </div>

          <!-- 4. Tax system -->
          <div class="section-card" id="obr-4">
            <div class="obr-head"><h3>Tax system</h3></div>
            <p class="obr-lede">
              <strong>OG-UK</strong> estimates smooth parametric tax functions (Gouveia&ndash;Strauss, DEP or linear) from microdata generated by <strong>PolicyEngine UK</strong>, an open-source microsimulation of the UK income-tax and NICs rulebook. Income tax and NICs are folded into these estimated functions; consumption, wealth, corporate and bequest taxes are modelled separately on top. Any reform PolicyEngine can represent &mdash; rate, threshold or allowance changes &mdash; flows straight through by re-estimating on post-reform microdata.
            </p>
            <p class="obr-lede">
              The <strong>OBR UK OLG</strong> model instead hard-codes the statutory UK schedule directly: income tax as explicit bands (PA &pound;12,570, HRT &pound;50,270, ART &pound;125,140 at 20&nbsp;/&nbsp;40&nbsp;/&nbsp;45%); NICs as a separate instrument (&pound;12,570 / &pound;50,270 at 8&nbsp;/&nbsp;2%); VAT as an effective 9.3%; pension relief and drawdown taxation modelled explicitly. A lever like "+1&nbsp;pp basic rate from 2027&ndash;28" is then one-parameter simulable &mdash; at the cost of less flexibility for reforms that reshape the schedule.
            </p>
          </div>

          <!-- 5. Government and fiscal policy -->
          <div class="section-card" id="obr-5">
            <div class="obr-head"><h3>Government &amp; fiscal policy</h3></div>
            <p class="obr-lede">How the government collects revenue, spends, and closes its budget. The fiscal closure rule — which item adjusts to keep debt sustainable — is an important modelling choice that determines who bears the long-run burden of any reform.</p>
            <table class="comparison-table">
            <thead><tr><th></th><th>OG-UK</th><th>OBR UK OLG</th></tr></thead>
            <tbody>
              <tr><td>Budget constraint</td><td>Revenue + new debt = debt service + G + I<sub>g</sub> + pensions + TR + UBI</td><td>Revenue = welfare transfers + RBI + debt service (growth-adjusted)</td></tr>
              <tr><td>Fiscal closure rule</td><td><strong>Configurable</strong>: adjust G, TR, or combination after period T<sub>G1</sub></td><td><strong>Residual Budgetary Item (RBI)</strong> adjusts to stabilise debt/GDP at 100%</td></tr>
              <tr><td>Debt target</td><td>Configurable</td><td>Fixed at 100% of GDP</td></tr>
              <tr><td>Public investment</td><td>Explicit (I<sub>g</sub> contributes to public capital stock)</td><td>Not modelled as productive</td></tr>
              <tr><td>Welfare transfers</td><td>Lump-sum TR</td><td><strong>Age-dependent</strong> transfers (γ<sup>j</sup> scaling) calibrated to OBR welfare spending projections</td></tr>
              <tr><td>State pension</td><td>Part of transfers</td><td><strong>Explicitly modelled</strong> as age-dependent welfare transfer from state pension age onwards</td></tr>
              <tr><td>Spending categories</td><td>G (public goods) + I<sub>g</sub> (infrastructure) + pensions + TR + UBI</td><td>Welfare transfers + residual non-interest spending (G⁰)</td></tr>
            </tbody>
          </table>
        </div>

          <!-- 6. Open economy -->
          <div class="section-card" id="obr-6">
            <div class="obr-head"><h3>Open economy</h3></div>
            <p class="obr-lede">How foreign capital and foreign holdings of government debt enter each model, and how this determines whether interest rates are set globally or domestically.</p>
            <table class="comparison-table">
            <thead><tr><th></th><th>OG-UK</th><th>OBR UK OLG</th></tr></thead>
            <tbody>
              <tr><td>Approach</td><td><strong>Parameterised capital mobility</strong> (ζ<sub>K</sub> for capital, ζ<sub>D</sub> for debt)</td><td><strong>Binary switch</strong>: fully open (r = 5% exogenous) or fully closed (r endogenous)</td></tr>
              <tr><td>Foreign capital</td><td>Continuous degree of openness</td><td>Either all or nothing</td></tr>
              <tr><td>Net foreign assets</td><td>Derived from capital mobility parameters</td><td>NFA residually determined in open economy</td></tr>
              <tr><td>Interest rate</td><td>Endogenous (influenced by openness parameters)</td><td>Either fixed at 5% (open) or MPK − δ (closed)</td></tr>
            </tbody>
          </table>
        </div>

          <!-- 7. Solution method & calibration -->
          <div class="section-card" id="obr-7">
            <div class="obr-head"><h3>Solution method &amp; calibration</h3></div>
            <p class="obr-lede">
              Both models are rational-expectations dynamic general equilibrium, but they solve different problems. <strong>OG-UK</strong> solves households' first-order conditions directly via Euler equations and iterates to a full <strong>year-by-year transition path</strong> (Time Path Iteration), so a reform shows up as a complete trajectory rather than a long-run snapshot. <strong>OBR UK OLG</strong> uses <strong>Value Function Iteration</strong> (Kirkby's VFI toolkit) and compares long-run steady states only; it does not model the adjustment path between them. As a consequence OG-UK's state space is continuous and its expectations run over the whole path, while the OBR model discretises assets and stochastic earnings on a grid and forms expectations within each steady state.
            </p>
            <p class="obr-lede">
              Calibration differs mainly in data sources and anchors. <strong>OG-UK</strong> draws demographics from the UN World Population Prospects (country 826), age-earning profiles from microdata via its permanent ability types, and tax functions from PolicyEngine-UK&rsquo;s Enhanced FRS (FRS enhanced with HMRC SPI, LCFS and WAS); macro aggregates are anchored to ONS GDP levels, and fiscal targets and growth assumptions are configurable. <strong>OBR UK OLG</strong> uses ONS mortality statistics for demographics, ONS ASHE plus the HMRC earnings distribution for age-earnings profiles, and HMRC / GOV.UK parameters directly for taxes; it is pinned to the OBR March 2024 EFO &mdash; GDP per person of &pound;35,100 (scaling parameter S&nbsp;=&nbsp;19.81), population growth n&nbsp;=&nbsp;0.75%, productivity growth g&nbsp;=&nbsp;1.2%, and debt / GDP stabilised at 100%.
            </p>
          </div>

          <p class="obr-source">Source: OBR Working Paper No. 22, "A new UK overlapping generations model" (April 2025). OG-Core documentation and OG-UK calibration code.</p>

        </div><!-- /obr-body -->
      </div><!-- /obr-layout -->
    </section>

    <!-- ============ RESULTS TAB ============ -->
    <section class="tab-panel active" id="tab-results" role="tabpanel">

      <!-- Headline reform (no card) -->
      <div class="results-headline">
        <h2 class="section-heading">A worked example: what if the basic rate of income tax went up by 1&nbsp;p?</h2>
        <p class="section-description">
          A <strong>stylised illustration</strong>, not a forecast of any announced policy: from tax year
          <strong>2027&ndash;28</strong>, the basic rate of UK income tax rises by one percentage point and stays
          there. Every chart below tells the same story in a different way &mdash; <strong>solid lines</strong>
          are the UK economy without the reform (history plus the OBR&rsquo;s November&nbsp;2025 forecast),
          and <strong>dashed lines</strong> are OG-UK&rsquo;s reform path. The gap between them, from 2027
          onwards, is the model&rsquo;s answer.
        </p>
        <p class="section-description">
          Three views, from broadest to narrowest:
        </p>
        <ul class="intro-list">
          <li><strong>The whole economy</strong> &mdash; the six headline numbers everyone knows: consumption,
            investment, government spending, tax revenue, debt and GDP.</li>
          <li><strong>Industry by industry</strong> &mdash; how output, capital and labour move across the
            eight sectors of the economy.</li>
          <li><strong>One sector at a time</strong> &mdash; the finest-grained view, for when you want to look
            at, say, manufacturing investment in isolation.</li>
        </ul>
        <p class="section-description">
          Use the dropdowns inside each box to switch between series. The full transition path runs for
          60&nbsp;periods, so you can see not just the long-run answer but how the economy moves from here to
          there.
        </p>
      </div>

      <!-- Macro: 6 panels (consumption + 5 others) -->
      <div class="section-card">
        <h2 class="section-heading">Macro aggregates &mdash; the whole economy</h2>
        <p class="section-description">
          Six headline series for the UK economy: <strong>consumption, investment, government consumption, tax revenue, debt and GDP</strong>. Flows are shown as a share of GDP (the natural scale for fiscal aggregates); GDP itself is in &pound;bn at current prices. Pick one from the dropdown &mdash; the vertical gap between the solid baseline and the dashed reform path from 2027 onwards is the reform effect on that series.
        </p>
        <div class="results-toolbar" data-kind="macro6" data-target="panels-macro6"></div>
        <div id="panels-macro6" class="panel-grid cols-3" aria-label="Macro panels"></div>
        <div class="plot-legend">
          <div class="legend-group">
            <span class="legend-item"><span class="legend-line"></span>OBR outturn / forecast</span>
            <span class="legend-item"><span class="legend-line dashed"></span>Reform&nbsp;+1&nbsp;pp basic rate</span>
          </div>
          <div class="legend-group">
            <span class="legend-item"><span class="legend-line dotted grey"></span>Outturn&nbsp;/ forecast boundary (2023)</span>
            <span class="legend-item"><span class="legend-line dashed gold"></span>Reform start (2027)</span>`,
  },
];
