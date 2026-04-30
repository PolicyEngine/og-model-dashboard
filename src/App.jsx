import { useState } from 'react';
import ExampleTab from './tabs/ExampleTab.jsx';
import MethodologyTab from './tabs/MethodologyTab.jsx';
import CodeTab from './tabs/CodeTab.jsx';
import ObrTab from './tabs/ObrTab.jsx';
import DiagramModal from './components/DiagramModal.jsx';

const TABS = [
  { id: 'results', label: 'Showcase', Component: ExampleTab },
  { id: 'code', label: 'Code', Component: CodeTab },
  { id: 'methodology', label: 'Methodology', Component: MethodologyTab },
  { id: 'obr', label: 'OBR comparison', Component: ObrTab },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('results');
  const [modal, setModal] = useState(null); // { title, svgHtml } | null

  return (
    <div className="app-shell">
      <header className="title-row">
        <div className="title-row-inner">
          <h1>PolicyEngine Macro: Overlapping-generations model</h1>
        </div>
      </header>

      <main className="main-content">
        <p className="intro-text">
          <strong>PolicyEngine Macro</strong> simulates the UK economy as it adjusts to a tax or benefit
          reform. It builds on an open-source <strong>overlapping-generations</strong> (OG) model maintained
          by the{' '}
          <a href="https://pslmodels.org" target="_blank" rel="noreferrer">Policy Simulation Library</a>{' '}
          (PSL), calibrated to the UK and wired into PolicyEngine&rsquo;s tax-and-benefit microsimulation.
          In an OG model age cohorts coexist; each chooses consumption, hours and savings over its lifetime,
          firms hire labour and capital, and markets clear period by period. The output is a year-by-year
          path for GDP, investment, interest rates and the public finances — not a single long-run number.
          UK calibration draws on UN demographics, ONS national accounts, OBR fiscal aggregates, and tax
          rules from{' '}
          <a href="https://policyengine.org" target="_blank" rel="noreferrer">PolicyEngine</a>.
        </p>
        <p className="intro-text">
          Four tabs, each standing on its own: <strong>Showcase</strong> for the model in action on a worked
          UK reform, <strong>Code</strong> for the Python that drives it, <strong>Methodology</strong> for
          how it works, and <strong>OBR comparison</strong> for a side-by-side with the OBR’s UK OLG model
          (OBR Working Paper No.&nbsp;22, April&nbsp;2025).
        </p>

        <nav className="tab-bar" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab-button${t.id === activeTab ? ' active' : ''}`}
              role="tab"
              aria-selected={t.id === activeTab}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {TABS.map(({ id, Component }) => (
          <section
            key={id}
            id={`tab-${id}`}
            className={`tab-panel${id === activeTab ? ' active' : ''}`}
            role="tabpanel"
            hidden={id !== activeTab}
          >
            <Component openModal={setModal} />
          </section>
        ))}

        <footer className="dashboard-footer">
          <a href="https://policyengine.org" target="_blank" rel="noreferrer">PolicyEngine</a> Macro · built
          on <strong>OG-UK</strong>, the UK calibration of{' '}
          <a href="https://github.com/PSLmodels/OG-Core" target="_blank" rel="noreferrer">OG-Core</a>,
          maintained by the{' '}
          <a href="https://pslmodels.org" target="_blank" rel="noreferrer">Policy Simulation Library</a>
        </footer>
      </main>

      {modal && (
        <DiagramModal
          title={modal.title}
          svgHtml={modal.svgHtml}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
