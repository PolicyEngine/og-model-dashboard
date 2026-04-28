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
          Most tax-and-benefit tools tell you what a reform does to <em>households today</em>. This one asks
          the next question:{' '}
          <strong>what happens to the economy as a whole, year after year</strong>? If the basic rate of
          income tax goes up by a penny, do people work less? Save less? Does GDP grow more slowly? When does
          tax revenue actually settle? Who across the generations bears the cost?{' '}
          <strong>PolicyEngine Macro</strong> is built to answer those questions — the macroeconomic arm of{' '}
          <a href="https://policyengine.org" target="_blank" rel="noreferrer">PolicyEngine</a>, powered by{' '}
          <strong>OG-UK</strong>, the UK calibration of{' '}
          <a href="https://github.com/PSLmodels/OG-Core" target="_blank" rel="noreferrer">OG-Core</a>, an
          open-source framework maintained by the{' '}
          <a href="https://pslmodels.org" target="_blank" rel="noreferrer">Policy Simulation Library</a>, and
          grounded in real UK data: demographics from the UN, national accounts from the ONS, fiscal
          aggregates from the OBR, and tax rules from PolicyEngine.
        </p>
        <p className="intro-text">
          The four tabs below are designed to be read in order, but each one stands on its own. Start with{' '}
          <strong>Example</strong> if you want to see the model in action on a real UK reform — it tells the
          story in pictures. Read <strong>Methodology</strong> for an illustrated walkthrough of how the model
          works. Open <strong>Code</strong> to see the few lines of Python that drive a full simulation. And
          jump to <strong>OBR comparison</strong> if you want a side-by-side with the OBR’s new UK OLG model
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
