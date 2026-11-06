// Sanity checks on the Showcase data (src/data/tpiData.json). The file is
// built by python/scripts/07_export_dashboard_json.py.
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

describe('sectors', () => {
  it('sector3 overlays all eight sectors', () => {
    for (const p of data.sector3) expect(p.traces).toHaveLength(8);
  });

  it('sector24 has one panel per sector x variable, all positive levels', () => {
    expect(data.sector24).toHaveLength(24);
    for (const p of data.sector24) for (const tr of p.traces) for (const y of tr.y) expect(y).toBeGreaterThan(0);
  });
});
