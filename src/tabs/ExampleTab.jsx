'use client';

import { useState } from 'react';
import data from '../data/tpiData.json';
import PlotPanel, { BASELINE_COLOR, REFORM_COLOR, SECTOR_PALETTE } from '../components/PlotPanel.jsx';
import Select from '../components/Select.jsx';

const MACRO_VAR_MAP = {
  'consumption': 'consumption',
  'investment': 'investment',
  'government consumption': 'government',
  'tax revenue': 'tax_revenue',
  'debt': 'debt',
  'gdp': 'gdp',
};
const MACRO_OPTS = [
  { value: 'consumption', label: 'Consumption' },
  { value: 'investment', label: 'Investment' },
  { value: 'government', label: 'Government consumption' },
  { value: 'tax_revenue', label: 'Tax revenue' },
  { value: 'debt', label: 'Debt' },
  { value: 'gdp', label: 'GDP' },
];
const SECTOR_VAR_OPTS = [
  { value: 'output', label: 'Output' },
  { value: 'capital', label: 'Capital' },
  { value: 'labour', label: 'Labour' },
];
const SECTOR_OPTS = [
  { value: 'energy', label: 'Energy' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'trade_transport', label: 'Trade and transport' },
  { value: 'info_finance', label: 'Information and finance' },
  { value: 'real_estate', label: 'Real estate' },
  { value: 'business_services', label: 'Business services' },
  { value: 'public_other', label: 'Public and other' },
];

const slug = (s) =>
  String(s).toLowerCase().replace(/&/g, '').replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');

function macroTag(panel) {
  const key = panel.title.toLowerCase().split('(')[0].trim();
  return MACRO_VAR_MAP[key] || slug(key);
}
function sector3Tag(panel) {
  const m = panel.title.match(/Sector\s+([A-Za-z]+)/);
  return m ? m[1].toLowerCase() : '';
}
function sector24Tags(panel) {
  const parts = panel.title.split(/\s+[—–-]\s+/);
  return { sector: slug(parts[0] || ''), variable: (parts[1] || '').toLowerCase().trim() };
}

const MACRO_TWO = [BASELINE_COLOR, REFORM_COLOR];

// Display names for the sector traces (the data keeps its own names).
const SECTOR_NAME = {
  'Trade & Transport': 'Trade and transport',
  'Info & Finance': 'Information and finance',
  'Real Estate': 'Real estate',
  'Business Services': 'Business services',
  'Public & Other': 'Public and other',
};
const sectorName = (n) => SECTOR_NAME[n] || n;
const twoNames = (n) => (/reform/i.test(n) ? 'Reform: +1 pp basic rate' : n ? 'Baseline' : n);

const MACRO_META = {
  consumption: { name: 'Consumption', unit: 'pct', yTitle: '% of GDP' },
  investment: { name: 'Investment', unit: 'pct', yTitle: '% of GDP' },
  government: { name: 'Government consumption', unit: 'pct', yTitle: '% of GDP' },
  tax_revenue: { name: 'Tax revenue', unit: 'pct', yTitle: '% of GDP' },
  debt: { name: 'Public sector net debt ex BoE', unit: 'pct', yTitle: '% of GDP, end-March' },
  gdp: { name: 'GDP', unit: 'gbp', yTitle: '£bn, current prices' },
};
const SECTOR_VAR_META = {
  output: { unit: 'gbp', yTitle: '£bn, current prices', units: '£bn at current prices' },
  capital: { unit: 'gbp', yTitle: '£bn, current prices', units: '£bn at current prices' },
  labour: { unit: 'k', yTitle: 'Thousands of workers', units: 'thousands of workers' },
};

const fmt = (v, dp = 1) => v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const signed = (v, dp) => `${v > 0 ? '+' : v < 0 ? '\u2212' : ''}${fmt(Math.abs(v), dp)}`;

// Last year on the reform trace, with the baseline value in the same year.
function lastPair(panel) {
  const [base, reform] = panel.traces;
  const i = reform.x.length - 1;
  const year = reform.x[i];
  const j = base.x.indexOf(year);
  return { year, b: base.y[j], r: reform.y[i] };
}
const fy = (y) => `${y}\u2013${String((y + 1) % 100).padStart(2, '0')}`;

function macroTakeaway(panel, key) {
  const meta = MACRO_META[key];
  const { year, b, r } = lastPair(panel);
  if (meta.unit === 'gbp') {
    return `${meta.name} in ${fy(year)}: £${fmt(r, 0)}bn on the reform path against £${fmt(b, 0)}bn on the baseline (${signed((r / b - 1) * 100, 2)}%).`;
  }
  return `${meta.name} in ${fy(year)}: ${fmt(r)}% of GDP on the reform path against ${fmt(b)}% on the baseline (${signed(r - b, 2)} pp).`;
}

function sector3Takeaway(panel, variable, names) {
  const end = panel.traces.map((t, i) => ({
    name: sectorName(t.name || names[i] || ''),
    year: t.x[t.x.length - 1],
    v: t.y[t.y.length - 1],
  }));
  const year = end[0].year;
  const neg = end.filter((e) => e.v < 0);
  const pos = end.filter((e) => e.v >= 0);
  const lo = Math.min(...neg.map((e) => e.v));
  const hi = Math.max(...neg.map((e) => e.v));
  let text = `By ${year}, ${variable} is below baseline in ${neg.length} of ${end.length} sectors`;
  if (neg.length) text += ` (${signed(hi, 2)}% to ${signed(lo, 2)}%)`;
  if (pos.length) text += `; ${pos.map((e) => `${e.name.toLowerCase()} is ${signed(e.v, 2)}%`).join(', ')}`;
  return `${text}.`;
}

function sector24Takeaway(panel, sectorLabel, variable) {
  const meta = SECTOR_VAR_META[variable];
  const { year, b, r } = lastPair(panel);
  const lvl = (v) => (meta.unit === 'gbp' ? `£${fmt(v)}bn` : `${fmt(v, 0)} thousand workers`);
  return `${sectorLabel} ${variable} in ${year}: ${lvl(r)} on the reform path against ${lvl(b)} on the baseline (${signed((r / b - 1) * 100, 2)}%).`;
}

const RUN_SOURCE =
  'one OG-UK transition-path run, 28 April 2026 (OG-UK 3a16cff), before the July 2026 marginal-tax-rate fix';

function ChartFrame({ title, subtitle, takeaway, source, children }) {
  return (
    <figure className="chart-frame">
      <figcaption className="chart-head">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-subtitle">{subtitle}</p>
        <p className="chart-takeaway">{takeaway}</p>
      </figcaption>
      {children}
      <p className="chart-source">Source: {source}</p>
    </figure>
  );
}

function PreFixNotice() {
  return (
    <aside className="results-notice" aria-label="About these results">
      <h2 className="results-notice-title">These results predate a model fix and will be rerun</h2>
      <p>
        Every reform path on this tab comes from {RUN_SOURCE}. Some results from that run do not look
        right: GDP rises slightly in the first reform year, and debt as a share of GDP ends higher under
        the tax rise in every year. A rerun on the fixed model is planned in{' '}
        <a href="https://github.com/PolicyEngine/og-model-dashboard/issues/5" target="_blank" rel="noreferrer">
          issue #5
        </a>
        . Until then, read the charts as a demonstration of what the model produces, not as an estimate
        of the reform&rsquo;s effect.
      </p>
      <h3 className="results-notice-subtitle">What the model can and cannot tell you</h3>
      <ul>
        <li>
          The solid baselines are published ONS and OBR figures. The dashed reform paths apply OG-UK&rsquo;s
          modelled change to that baseline.
        </li>
        <li>
          OG-UK is calibrated to UK targets (UN demographics, ONS national accounts, OBR fiscal aggregates),
          so matching the baseline is by construction and does not validate the model.
        </li>
        <li>
          No observed outturn exists for a reform that has not happened. The reform paths show what the
          model implies under its assumptions about how households and firms respond, not a forecast.
        </li>
      </ul>
    </aside>
  );
}

function MacroLegend() {
  return (
    <div className="plot-legend">
      <div className="legend-group">
        <span className="legend-item"><span className="legend-line" />Baseline: ONS and OBR outturn, OBR forecast</span>
        <span className="legend-item"><span className="legend-line dashed reform" />Reform: +1&nbsp;pp basic rate</span>
      </div>
      <div className="legend-group">
        <span className="legend-item"><span className="legend-line dotted grey" />Outturn&nbsp;/ forecast boundary (2023)</span>
        <span className="legend-item"><span className="legend-line dashed gold" />Reform start (2027)</span>
      </div>
    </div>
  );
}

function SectorAggregateLegend() {
  const items = SECTOR_OPTS.map((o, i) => [o.label, SECTOR_PALETTE[i]]);
  return (
    <div className="plot-legend">
      <div className="legend-group">
        {items.map(([name, color]) => (
          <span key={name} className="legend-item">
            <span className="legend-line" style={{ borderTopColor: color }} />
            {name}
          </span>
        ))}
      </div>
      <div className="legend-group">
        <span className="legend-item"><span className="legend-line dashed gold" />Reform start (2027)</span>
      </div>
    </div>
  );
}

export default function ExampleTab() {
  const [macroVar, setMacroVar] = useState('consumption');
  const [sectorVar, setSectorVar] = useState('output');
  const [detailVar, setDetailVar] = useState('output');
  const [detailSector, setDetailSector] = useState('energy');

  const macroFirstNames = data.macro6[0].traces.map((t) => t.name);
  const sector3FirstNames = data.sector3[0].traces.map((t) => t.name);
  const sector24FirstNames = data.sector24[0].traces.map((t) => t.name);

  return (
    <>
      <PreFixNotice />
      <div className="results-headline">
        <h2 className="section-heading">What an OG model adds to a static analysis</h2>
        <p className="section-description">
          A static tax model holds the economy fixed and totals up who pays more or less under a reform. It
          answers part of the question, but ignores how people and firms respond. When after-tax wages fall,
          households work less and save less. When the cost of capital rises, firms invest less. Tax
          revenues, GDP and the public finances move over years as those adjustments work through.
        </p>
        <p className="section-description">
          An <strong>overlapping-generations</strong>{' '}(OG) model captures those responses. Many age cohorts
          coexist; each chooses consumption, hours and savings over its lifetime; firms hire labour and rent
          capital; the government collects taxes and pays transfers; markets clear period by period. The
          model returns a year-by-year path for GDP, wages, interest rates, investment, debt and tax revenue
          under the reform, alongside the same path without it. The difference between the two paths gives
          the reform&rsquo;s macroeconomic effect.
        </p>

        <h2 className="section-heading" style={{ marginTop: '28px' }}>
          The reform: 1&nbsp;pp on the basic rate, from 2027–28
        </h2>
        <p className="section-description">
          The reform raises the basic rate of UK income tax by one percentage point, from 20% to 21%,
          starting in tax year <strong>2027–28</strong>{' '}and holding thereafter. It serves as a stylised
          illustration, not a forecast of any announced policy. In every chart,{' '}
          <strong>solid lines</strong>{' '}show the UK economy under the OBR&rsquo;s November&nbsp;2025 baseline
          (history plus forecast); <strong>dashed lines</strong>{' '}show the OG-UK reform path. The vertical
          gap between them, from 2027 onwards, gives the reform&rsquo;s modelled effect.
        </p>
        <p className="section-description">
          Three views are available: <strong>the whole economy</strong>{' '}— six
          national-accounts series (consumption, investment, government consumption, tax revenue, debt, GDP);{' '}
          <strong>by industry</strong>{' '}— output, capital and labour across the eight UK industry sectors;
          and <strong>one sector at a time</strong>{' '}— a single
          sector&nbsp;&times;&nbsp;variable cell. Use the dropdowns to switch series. The transition path
          runs for 60&nbsp;periods.
        </p>
      </div>

      {/* Macro: 6 panels filtered to one */}
      <div className="section-card macro-section">
        <h2 className="section-heading">Macro aggregates: the whole economy</h2>
        <p className="section-description">
          Six headline series for the UK economy: <strong>consumption, investment, government consumption, tax
          revenue, debt and GDP</strong>. Pick one from the dropdown. The vertical gap between the solid
          baseline and the dashed reform path from 2027 onwards gives the modelled reform effect on that
          series.
        </p>
        <div className="results-toolbar">
          <Select label="Show" options={MACRO_OPTS} value={macroVar} onChange={setMacroVar} />
        </div>
        {(() => {
          const panel = data.macro6.find((p) => macroTag(p) === macroVar) || data.macro6[0];
          const meta = MACRO_META[macroVar];
          return (
            <ChartFrame
              title={`${meta.name}, baseline and reform, 2000–01 to 2030–31`}
              subtitle={`${meta.yTitle}; fiscal years by start year (2027 = 2027–28)`}
              takeaway={macroTakeaway(panel, macroVar)}
              source={`baseline from ONS national accounts and the OBR November 2025 Economic and fiscal outlook; reform path from ${RUN_SOURCE}.`}
            >
              <div className="panel-grid cols-3">
                {data.macro6.map((panel, i) => (
                  <PlotPanel
                    key={i}
                    panel={panel}
                    firstNames={macroFirstNames}
                    visible={macroTag(panel) === macroVar}
                    yTitle={MACRO_META[macroTag(panel)]?.yTitle}
                    colors={MACRO_TWO}
                    nameFor={twoNames}
                  />
                ))}
              </div>
              <MacroLegend />
            </ChartFrame>
          );
        })()}
        <details className="data-notes">
          <summary>How these series are built</summary>
          <p className="section-description">
            Flows appear as a share of GDP (the natural scale for fiscal aggregates), with the reform path
            divided by reform-scenario GDP; GDP itself sits in £bn at current prices. Government consumption
            is government spending on goods and services (OBR table&nbsp;1.2), the national-accounts concept
            behind the model&rsquo;s G; it excludes transfers and debt interest, so it is about half of total
            public spending. Years on the horizontal axis are fiscal years by their start year (2027 =
            2027&ndash;28). Debt is public sector net debt excluding the Bank of England (PSND ex BoE) at the
            end of each fiscal year: ONS outturn to 2023&ndash;24 (series CPOA, end-March), then the OBR
            November&nbsp;2025 EFO (table&nbsp;6.13) from 2024&ndash;25; ONS&rsquo;s provisional end-March
            2026 figure is 89.0%, against the 91.3% OBR forecast shown for 2025&ndash;26. GDP, consumption
            and investment before 2008&ndash;09, where the OBR tables start, are ONS quarterly national
            accounts summed April to March (consumption is households plus non-profit institutions, as in
            the OBR series).
          </p>
        </details>
      </div>

      <div className="sector-side-by-side">
      {/* Sector aggregate: 3 panels filtered to one */}
      <div className="section-card">
        <h2 className="section-heading">Impact across sectors</h2>
        <p className="section-description">
          The reform&apos;s effect on the whole industry mix at once. Pick <strong>output, capital or
          labour</strong>{' '}from the dropdown; the chart overlays all eight sectors as{' '}
          <strong>percentage change from baseline</strong>. Positive values: the sector grows under the
          reform. Negative values: it shrinks.
        </p>
        <div className="results-toolbar">
          <Select label="Show" options={SECTOR_VAR_OPTS} value={sectorVar} onChange={setSectorVar} />
        </div>
        {(() => {
          const panel = data.sector3.find((p) => sector3Tag(p) === sectorVar) || data.sector3[0];
          const label = SECTOR_VAR_OPTS.find((o) => o.value === sectorVar).label;
          return (
            <ChartFrame
              title={`${label} by sector, change from baseline`}
              subtitle="% change from baseline, by year"
              takeaway={sector3Takeaway(panel, sectorVar, sector3FirstNames)}
              source={`${RUN_SOURCE}, multi-sector solution.`}
            >
              <div className="panel-grid cols-3">
                {data.sector3.map((panel, i) => (
                  <PlotPanel
                    key={i}
                    panel={panel}
                    firstNames={sector3FirstNames}
                    visible={sector3Tag(panel) === sectorVar}
                    yTitle="% change from baseline"
                    colors={SECTOR_PALETTE}
                    nameFor={sectorName}
                  />
                ))}
              </div>
              <SectorAggregateLegend />
            </ChartFrame>
          );
        })()}
      </div>

      {/* Sector detail: 24 panels filtered to one */}
      <div className="section-card">
        <h2 className="section-heading">One sector at a time</h2>
        <p className="section-description">
          The finest-grained view: any single <strong>sector × variable</strong>{' '}cell of the economy. Pick a
          variable (output, capital or labour) and a sector; the plot shows that cell&apos;s full path in
          levels. History gives context for how far off-baseline the reform pushes that sector.
        </p>
        <div className="results-toolbar">
          <Select label="Variable" options={SECTOR_VAR_OPTS} value={detailVar} onChange={setDetailVar} />
          <Select label="Sector" options={SECTOR_OPTS} value={detailSector} onChange={setDetailSector} />
        </div>
        {(() => {
          const panel =
            data.sector24.find((p) => {
              const t = sector24Tags(p);
              return t.variable === detailVar && t.sector === detailSector;
            }) || data.sector24[0];
          const sectorLabel = SECTOR_OPTS.find((o) => o.value === detailSector).label;
          const varLabel = SECTOR_VAR_OPTS.find((o) => o.value === detailVar).label.toLowerCase();
          return (
            <ChartFrame
              title={`${sectorLabel}: ${varLabel}, baseline and reform`}
              subtitle={`Levels, ${SECTOR_VAR_META[detailVar].units}`}
              takeaway={sector24Takeaway(panel, sectorLabel, detailVar)}
              source={`baseline from ONS outturn stitched to the OBR November 2025 EFO; reform path from ${RUN_SOURCE}.`}
            >
              <div className="panel-grid cols-4 sector24">
                {data.sector24.map((panel, i) => {
                  const tags = sector24Tags(panel);
                  return (
                    <PlotPanel
                      key={i}
                      panel={panel}
                      firstNames={sector24FirstNames}
                      visible={tags.variable === detailVar && tags.sector === detailSector}
                      yTitle={SECTOR_VAR_META[tags.variable]?.yTitle}
                      colors={MACRO_TWO}
                      nameFor={twoNames}
                    />
                  );
                })}
              </div>
              <div className="plot-legend">
                <div className="legend-group">
                  <span className="legend-item"><span className="legend-line" />Baseline: ONS outturn, OBR forecast</span>
                  <span className="legend-item"><span className="legend-line dashed reform" />Reform: +1&nbsp;pp basic rate</span>
                </div>
                <div className="legend-group">
                  <span className="legend-item"><span className="legend-line dotted grey" />Outturn&nbsp;/ forecast boundary (2023)</span>
                  <span className="legend-item"><span className="legend-line dashed gold" />Reform start (2027)</span>
                </div>
              </div>
            </ChartFrame>
          );
        })()}
      </div>
      </div>
    </>
  );
}
