import { useState } from 'react';
import ExampleTab from './tabs/ExampleTab.jsx';
import MethodologyTab from './tabs/MethodologyTab.jsx';
import CodeTab from './tabs/CodeTab.jsx';
import ObrTab from './tabs/ObrTab.jsx';
import DiagramModal from './components/DiagramModal.jsx';

const TABS = [
  { id: 'results', label: 'Example', Component: ExampleTab },
  { id: 'methodology', label: 'Methodology', Component: MethodologyTab },
  { id: 'code', label: 'Code', Component: CodeTab },
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
          reform. It is built on <strong>OG-UK</strong>, the UK calibration of{' '}
          <a href="https://github.com/PSLmodels/OG-Core" target="_blank" rel="noreferrer">OG-Core</a> — an{' '}
          <em>overlapping-generations</em> (OG) model. In an OG model the population is split into age
          cohorts that exist simultaneously; each cohort chooses how much to consume, work and save over its
          lifetime, while firms hire labour and capital and the government collects taxes and pays transfers.
          The model solves for the prices, wages and tax revenues that clear every market, year by year, both
          under current policy and under any reform — so the output is a full transition path for GDP,
          investment, interest rates and the public finances rather than a single long-run number. The UK
          calibration uses demographics from the UN, national accounts from the ONS, fiscal aggregates from
          the OBR, and tax rules from{' '}
          <a href="https://policyengine.org" target="_blank" rel="noreferrer">PolicyEngine</a>; OG-Core is
          maintained by the{' '}
          <a href="https://pslmodels.org" target="_blank" rel="noreferrer">Policy Simulation Library</a>.
        </p>
        <p className="intro-text">
          Four tabs, each standing on its own: <strong>Example</strong> for the model in action on a worked
          UK reform, <strong>Methodology</strong> for how it works, <strong>Code</strong> for the Python that
          drives it, and <strong>OBR comparison</strong> for a side-by-side with the OBR’s UK OLG model
          (Brzezinski, Hantzsche &amp; Watson, OBR Working Paper No.&nbsp;22, April&nbsp;2025).
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

        {TABS.map(({ id, Component }) => {
          const isActive = id === activeTab;
          return (
            <section
              key={id}
              id={`tab-${id}`}
              className={`tab-panel${isActive ? ' active' : ''}`}
              role="tabpanel"
              hidden={!isActive}
              style={{ display: isActive ? 'block' : 'none' }}
            >
              <Component openModal={setModal} />
            </section>
          );
        })}

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
