'use client';

import { useEffect, useRef } from 'react';

// PolicyEngine chart tokens (ui-kit theme.css), by hex because Plotly cannot read CSS vars.
export const BASELINE_COLOR = '#319795'; // --chart-1
export const REFORM_COLOR = '#285E61'; // --chart-3
// Eight distinguishable sector colours: the five chart tokens, then three
// AA-legible extras (amber-600, violet-600, pink-600) for the remaining sectors.
export const SECTOR_PALETTE = ['#319795', '#0EA5E9', '#285E61', '#026AA2', '#64748B', '#D97706', '#7C3AED', '#DB2777'];

function baseLayout(title, narrow) {
  return {
    margin: { l: narrow ? 52 : 72, r: narrow ? 20 : 18, t: 12, b: 40 },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    font: { family: 'Inter, sans-serif', size: 12, color: '#475569' },
    xaxis: {
      showgrid: true,
      gridcolor: '#ececec',
      zeroline: false,
      color: '#6B7280',
      ticks: 'outside',
      tickfont: { size: 12 },
      linecolor: '#E2E8F0',
    },
    yaxis: {
      title: {
        text: title,
        font: { size: 12, color: '#344054', family: 'Inter, sans-serif' },
        standoff: 10,
      },
      showgrid: true,
      gridcolor: '#ececec',
      zeroline: false,
      color: '#64748B',
      tickfont: { size: 12 },
      linecolor: '#E2E8F0',
      automargin: true,
    },
    showlegend: false,
    hovermode: 'x unified',
    shapes: [],
  };
}

function buildShapes(rawShapes) {
  return (rawShapes || []).map((s) => ({
    type: 'line',
    xref: 'x',
    yref: 'paper',
    x0: s.x0,
    x1: s.x1,
    y0: 0,
    y1: 1,
    line: {
      // Outturn/forecast boundary: data says #95a5a6; draw it in slate (--chart-5) so it reads on white.
      color: s.color === '#95a5a6' ? '#64748B' : s.color || '#64748B',
      width: s.width || 1,
      dash: s.dash || 'dot',
    },
  }));
}

// `firstNames` is the trace-name list from panel index 0 of this group; later
// panels inherit any empty names by position (Plotly subplot pattern).
// `yTitle` overrides the axis title (the data titles double as chart names);
// `colors` overrides trace colours by index; `nameFor` maps a trace name to a
// display label. None of these touch the plotted values.
export default function PlotPanel({ panel, firstNames = [], visible = true, yTitle, colors, nameFor = (n) => n }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Plotly) return;
    const el = ref.current;
    if (!el) return;

    const traces = panel.traces.map((t, i) => {
      const name = nameFor(t.name || firstNames[i] || '');
      return {
        x: t.x,
        y: t.y,
        mode: 'lines',
        type: 'scatter',
        name,
        line: {
          color: (colors && colors[i % colors.length]) || t.color || SECTOR_PALETTE[i % SECTOR_PALETTE.length],
          width: t.width || 2,
          dash: t.dash || 'solid',
        },
        hovertemplate: `%{x}: %{y:.2f}<extra>${name}</extra>`,
      };
    });

    const narrow = window.innerWidth < 640;
    const layout = baseLayout(yTitle || panel.title, narrow);
    layout.shapes = buildShapes(panel.shapes);
    layout.showlegend = false;

    window.Plotly.newPlot(el, traces, layout, { displayModeBar: false, responsive: true });

    return () => {
      try {
        window.Plotly.purge(el);
      } catch {
        /* ignore */
      }
    };
  }, [panel, firstNames, yTitle, colors, nameFor]);

  // Resize when becoming visible (e.g. tab switch or filter changes).
  useEffect(() => {
    if (!visible || !ref.current || !window.Plotly) return;
    const id = requestAnimationFrame(() => {
      try {
        window.Plotly.Plots.resize(ref.current);
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [visible]);

  return (
    <div className="panel-cell" style={{ display: visible ? '' : 'none' }}>
      <div className="plot" ref={ref} />
    </div>
  );
}
