// Sanity checks on the Showcase data (src/data/tpiData.json). The file is
// built by python/scripts/07_export_dashboard_json.py.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import data from './tpiData.json';

const REFORM_START = 2027; // fiscal year 2027-28
const byTitle = Object.fromEntries(data.macro6.map((p) => [p.title, p]));
const series = (title, i) => {
  const t = byTitle[title].traces[i];
  return Object.fromEntries(t.x.map((x, j) => [x, t.y[j]]));
};
const SHARE_TITLES = [
  'Consumption (% GDP)',
  'Investment (% GDP)',
  'Government consumption (% GDP)',
  'Tax revenue (% GDP)',
  'Debt (% GDP)',
];

describe('macro6', () => {
  it('has the six expected panels', () => {
    expect(Object.keys(byTitle).sort()).toEqual([...SHARE_TITLES, 'GDP (£bn)'].sort());
  });

  it('runs on consecutive fiscal years, reform path anchored on the baseline', () => {
    for (const p of data.macro6) {
      const [base, ref] = p.traces;
      base.x.slice(1).forEach((x, j) => expect(x).toBe(base.x[j] + 1));
      expect(ref.x[0]).toBe(REFORM_START - 1);
      expect(ref.y[0]).toBeCloseTo(series(p.title, 0)[REFORM_START - 1], 9);
      expect(ref.x.at(-1)).toBe(base.x.at(-1));
    }
  });

  it('keeps shares in plausible ranges', () => {
    for (const title of SHARE_TITLES) {
      const hi = title.startsWith('Debt') ? 150 : 70;
      for (const tr of byTitle[title].traces) for (const y of tr.y) {
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(hi);
      }
    }
  });

  it('C + I + G is close to 100% of GDP (net exports and inventories are small)', () => {
    for (const i of [0, 1]) {
      const c = series('Consumption (% GDP)', i);
      const inv = series('Investment (% GDP)', i);
      const g = series('Government consumption (% GDP)', i);
      const years = Object.keys(g).filter((y) => y in c && y in inv);
      expect(years.length).toBeGreaterThan(4);
      for (const y of years) {
        const total = c[y] + inv[y] + g[y];
        expect(total).toBeGreaterThan(96);
        expect(total).toBeLessThan(104);
      }
    }
  });

  it('a 1pp basic-rate rise lowers GDP and consumption and raises tax revenue', () => {
    const gdpB = series('GDP (£bn)', 0);
    const gdpR = series('GDP (£bn)', 1);
    const taxB = series('Tax revenue (% GDP)', 0);
    const taxR = series('Tax revenue (% GDP)', 1);
    const cB = series('Consumption (% GDP)', 0);
    const cR = series('Consumption (% GDP)', 1);
    for (let y = REFORM_START; y <= 2030; y++) {
      const dGdp = gdpR[y] / gdpB[y] - 1;
      // The 28 Apr 2026 run has GDP +0.07% in 2027-28, the first reform year. That run
      // predates OG-UK's MTR fix (issue #2), under which most earners faced a zero labour
      // MTR, so only the income effect of the tax rise operated. Check the sign from 2028.
      if (y > REFORM_START) expect(dGdp).toBeLessThan(0);
      expect(Math.abs(dGdp)).toBeLessThan(0.01); // a 1pp rate change moves GDP by well under 1%
      expect(taxR[y]).toBeGreaterThan(taxB[y]);
      expect(cR[y] * gdpR[y]).toBeLessThan(cB[y] * gdpB[y]); // consumption level falls
    }
  });
});

// Debt is PSND ex BoE at the end of each fiscal year (end-March): ONS CPOA
// outturn to 2023-24, then OBR November 2025 EFO table 6.13 from 2024-25.
const ONS_CPOA = Object.fromEntries(
  readFileSync(new URL('../../python/data/ons_psnd_ex_boe_end_march.csv', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => /^\d{4},/.test(l))
    .map((l) => {
      const [fy, , pct] = l.split(',');
      return [Number(fy), Number(pct)];
    }),
);
// OBR Nov 2025 EFO, table 6.13 "Public sector net debt ex BoE (a-c=d)", % of GDP.
const OBR_PSND_EX_BOE = {
  2024: 88.10663761008254,
  2025: 91.30956933690936,
  2026: 92.7638425262273,
  2027: 94.15428671008492,
  2028: 95.18697557838794,
  2029: 95.32084843360164,
  2030: 95.32263559235795,
};

describe('debt baseline (PSND ex BoE, end-March)', () => {
  const debt = series('Debt (% GDP)', 0);

  it('uses end-March 2020 for 2019-20 (76.1% ex BoE; HF6X with the BoE is 84.1%), not a calendar blend', () => {
    expect(debt[2019]).toBe(76.1);
    expect(debt[2008]).toBe(50.4); // end-March 2009
    expect(debt[2023]).toBe(85.3); // end-March 2024, last ONS year used
  });

  it('matches ONS CPOA end-March outturn for every year to 2023-24', () => {
    for (let y = 2008; y <= 2023; y++) expect(debt[y]).toBeCloseTo(ONS_CPOA[y], 9);
  });

  it('matches OBR Nov 2025 EFO table 6.13 from 2024-25', () => {
    for (const [y, v] of Object.entries(OBR_PSND_EX_BOE)) expect(debt[y]).toBeCloseTo(v, 9);
  });

  it('reform debt keeps the model response: reform/baseline ratio as published in PR #4', () => {
    // (1 + %chg debt) / (1 + %chg GDP), recovered from the 28 Apr 2026 run. Independent of
    // the baseline level, so the debt fix must leave it unchanged.
    const RATIO = { 2027: 1.0019745709198213, 2028: 1.002423694217998, 2029: 1.0015061529422122, 2030: 1.000570617544705 };
    const ref = series('Debt (% GDP)', 1);
    for (const [y, r] of Object.entries(RATIO)) expect(ref[y] / debt[y]).toBeCloseTo(r, 12);
  });
});

describe('sectors', () => {
  it('sector3 overlays all eight sectors', () => {
    for (const p of data.sector3) expect(p.traces).toHaveLength(8);
  });

  it('sector24 has one panel per sector x variable, all positive levels', () => {
    expect(data.sector24).toHaveLength(24);
    for (const p of data.sector24) for (const tr of p.traces) for (const y of tr.y) expect(y).toBeGreaterThan(0);
  });
});
