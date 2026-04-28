import { useState } from 'react';
import data from '../data/tpiData.json';
import PlotPanel from '../components/PlotPanel.jsx';
import Select from '../components/Select.jsx';

const MACRO_VAR_MAP = {
  'consumption': 'consumption',
  'investment': 'investment',
  'gov. consumption': 'government',
  'tax revenue': 'tax_revenue',
  'debt': 'debt',
  'gdp': 'gdp',
};
const MACRO_OPTS = [
  { value: 'consumption', label: 'Consumption' },
  { value: 'investment', label: 'Investment' },
  { value: 'government', label: 'Government' },
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
  { value: 'trade_transport', label: 'Trade & Transport' },
  { value: 'info_finance', label: 'Info & Finance' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'business_services', label: 'Business Services' },
  { value: 'public_other', label: 'Public & Other' },
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

function MacroLegend() {
  return (
    <div className="plot-legend">
      <div className="legend-group">
        <span className="legend-item"><span className="legend-line" />OBR outturn / forecast</span>
        <span className="legend-item"><span className="legend-line dashed" />Reform&nbsp;+1&nbsp;pp basic rate</span>
      </div>
      <div className="legend-group">
        <span className="legend-item"><span className="legend-line dotted grey" />Outturn&nbsp;/ forecast boundary (2023)</span>
        <span className="legend-item"><span className="legend-line dashed gold" />Reform start (2027)</span>
      </div>
    </div>
  );
}

function SectorAggregateLegend() {
  const items = [
    ['Energy', '#e6194b'],
    ['Manufacturing', '#3cb44b'],
    ['Construction', '#ffe119'],
    ['Trade & Transport', '#4363d8'],
    ['Info & Finance', '#f58231'],
    ['Real Estate', '#911eb4'],
    ['Business Services', '#42d4f4'],
    ['Public & Other', '#f032e6'],
  ];
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
      <div className="results-headline">
        <h2 className="section-heading">A worked example: what if the basic rate of income tax went up by 1&nbsp;p?</h2>
        <p className="section-description">
          A <strong>stylised illustration</strong>, not a forecast of any announced policy: from tax year{' '}
          <strong>2027–28</strong>, the basic rate of UK income tax rises by one percentage point and stays
          there. Every chart below tells the same story in a different way — <strong>solid lines</strong>{' '}
          are the UK economy without the reform (history plus the OBR’s November&nbsp;2025 forecast), and{' '}
          <strong>dashed lines</strong> are OG-UK’s reform path. The gap between them, from 2027 onwards, is
          the model’s answer.
        </p>
        <p className="section-description">Three views, from broadest to narrowest:</p>
        <ul className="intro-list">
          <li>
            <strong>The whole economy</strong> — the six headline numbers everyone knows: consumption,
            investment, government spending, tax revenue, debt and GDP.
          </li>
          <li>
            <strong>Industry by industry</strong> — how output, capital and labour move across the eight
            sectors of the economy.
          </li>
          <li>
            <strong>One sector at a time</strong> — the finest-grained view, for when you want to look at, say,
            manufacturing investment in isolation.
          </li>
        </ul>
        <p className="section-description">
          Use the dropdowns inside each box to switch between series. The full transition path runs for
          60&nbsp;periods, so you can see not just the long-run answer but how the economy moves from here to
          there.
        </p>
      </div>

      {/* Macro: 6 panels filtered to one */}
      <div className="section-card">
        <h2 className="section-heading">Macro aggregates — the whole economy</h2>
        <p className="section-description">
          Six headline series for the UK economy: <strong>consumption, investment, government consumption, tax
          revenue, debt and GDP</strong>. Flows are shown as a share of GDP (the natural scale for fiscal
          aggregates); GDP itself is in £bn at current prices. Pick one from the dropdown — the vertical gap
          between the solid baseline and the dashed reform path from 2027 onwards is the reform effect on that
          series.
        </p>
        <div className="results-toolbar">
          <Select label="Show" options={MACRO_OPTS} value={macroVar} onChange={setMacroVar} />
        </div>
        <div className="panel-grid cols-3">
          {data.macro6.map((panel, i) => (
            <PlotPanel
              key={i}
              panel={panel}
              firstNames={macroFirstNames}
              visible={macroTag(panel) === macroVar}
            />
          ))}
        </div>
        <MacroLegend />
      </div>

      {/* Sector aggregate: 3 panels filtered to one */}
      <div className="section-card">
        <h2 className="section-heading">Impact across sectors</h2>
        <p className="section-description">
          The reform&apos;s effect on the whole industry mix at once. Pick <strong>output, capital or
          labour</strong> from the dropdown and the chart overlays all eight sectors, plotted as{' '}
          <strong>percentage change from baseline</strong>. Positive values: the sector is larger under reform
          than in the baseline. Negative values: smaller. A one-look answer to “which sectors move most?”
        </p>
        <div className="results-toolbar">
          <Select label="Show" options={SECTOR_VAR_OPTS} value={sectorVar} onChange={setSectorVar} />
        </div>
        <div className="panel-grid cols-3">
          {data.sector3.map((panel, i) => (
            <PlotPanel
              key={i}
              panel={panel}
              firstNames={sector3FirstNames}
              visible={sector3Tag(panel) === sectorVar}
            />
          ))}
        </div>
        <SectorAggregateLegend />
      </div>

      {/* Sector detail: 24 panels filtered to one */}
      <div className="section-card">
        <h2 className="section-heading">One sector at a time</h2>
        <p className="section-description">
          The finest-grained view: any single <strong>sector × variable</strong> cell of the economy. Pick a
          variable (output, capital or labour) and a sector, and the plot shows that cell&apos;s full path
          indexed to 2000&nbsp;=&nbsp;100. Solid = ONS outturn stitched to the OBR Nov&nbsp;2025 EFO baseline;
          dashed = OG-UK&apos;s +1&nbsp;pp basic-rate reform. History gives context for how far off-baseline
          the reform pushes that sector.
        </p>
        <div className="results-toolbar">
          <Select label="Variable" options={SECTOR_VAR_OPTS} value={detailVar} onChange={setDetailVar} />
          <Select label="Sector" options={SECTOR_OPTS} value={detailSector} onChange={setDetailSector} />
        </div>
        <div className="panel-grid cols-4 sector24">
          {data.sector24.map((panel, i) => {
            const tags = sector24Tags(panel);
            return (
              <PlotPanel
                key={i}
                panel={panel}
                firstNames={sector24FirstNames}
                visible={tags.variable === detailVar && tags.sector === detailSector}
              />
            );
          })}
        </div>
        <div className="plot-legend">
          <div className="legend-group">
            <span className="legend-item"><span className="legend-line" />ONS outturn / forecast</span>
            <span className="legend-item"><span className="legend-line dashed" />Reform&nbsp;+1&nbsp;pp basic rate</span>
          </div>
          <div className="legend-group">
            <span className="legend-item"><span className="legend-line dotted grey" />Outturn&nbsp;/ forecast boundary (2023)</span>
            <span className="legend-item"><span className="legend-line dashed gold" />Reform start (2027)</span>
          </div>
        </div>
      </div>
    </>
  );
}
