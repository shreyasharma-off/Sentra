import { useCallback, useEffect, useMemo, useState } from 'react';
import { Crosshair } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorBanner from '../../components/ui/ErrorBanner';
import ResultSummaryBar from '../../components/ui/ResultSummaryBar';
import AttackToolbar from './components/AttackToolbar';
import AttackRow from './components/AttackRow';
import PreviewPromptModal from './components/PreviewPromptModal';
import { fetchAttackCatalog, runSimulation, sortAttacks } from './api';
import './AttackSimulationLabPage.css';

/**
 * AttackSimulationLabPage
 * A dense, filterable attack catalogue for AI red-teaming. Running a
 * simulation animates that row through queued -> running -> completed,
 * then populates the result summary at the bottom of the page using the
 * same ResultSummaryBar component the Analysis page uses, so a completed
 * simulation reads exactly like a completed prompt analysis elsewhere in
 * the app.
 */
export default function AttackSimulationLabPage() {
  const [phase, setPhase] = useState('loading'); // loading | success | error
  const [attacks, setAttacks] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState([]);
  const [owasp, setOwasp] = useState([]);
  const [attackType, setAttackType] = useState([]);
  const [sortBy, setSortBy] = useState('severity');

  const [expandedId, setExpandedId] = useState(null);
  const [runStatuses, setRunStatuses] = useState({});
  const [previewAttack, setPreviewAttack] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const load = useCallback(() => {
    setPhase('loading');
    setErrorMessage(null);
    fetchAttackCatalog()
      .then((data) => {
        setAttacks(data);
        setPhase('success');
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Failed to load the attack catalogue.');
        setPhase('error');
      });
  }, []);

  useEffect(load, [load]);

  const filteredAttacks = useMemo(() => {
    let list = attacks;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    if (severity.length > 0) list = list.filter((a) => severity.includes(a.severity));
    if (owasp.length > 0) list = list.filter((a) => owasp.includes(a.owasp.code));
    if (attackType.length > 0) list = list.filter((a) => attackType.includes(a.type));

    return sortAttacks(list, sortBy);
  }, [attacks, search, severity, owasp, attackType, sortBy]);

  async function handleRun(attack) {
    try {
      const result = await runSimulation(attack, {
        onProgress: (status) => setRunStatuses((prev) => ({ ...prev, [attack.id]: status })),
      });
      setLatestResult(result);
    } catch {
      setRunStatuses((prev) => {
        const next = { ...prev };
        delete next[attack.id];
        return next;
      });
    }
  }

  return (
    <div className="attack-lab">
      <AttackToolbar
        search={search}
        onSearchChange={setSearch}
        severity={severity}
        onSeverityChange={setSeverity}
        owasp={owasp}
        onOwaspChange={setOwasp}
        attackType={attackType}
        onAttackTypeChange={setAttackType}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        resultCount={filteredAttacks.length}
      />

      {phase === 'error' && <ErrorBanner message={errorMessage} onRetry={load} />}

      <Card padded={false} className="attack-lab__catalogue-card">
        {phase === 'loading' && (
          <div className="attack-lab__loading-rows">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="attack-lab__skeleton-row" />
            ))}
          </div>
        )}

        {phase === 'success' && filteredAttacks.length === 0 && (
          <EmptyState
            icon={Crosshair}
            title="No matching attacks"
            description="Try adjusting your search or filters."
          />
        )}

        {phase === 'success' &&
          filteredAttacks.map((attack) => (
            <AttackRow
              key={attack.id}
              attack={attack}
              expanded={expandedId === attack.id}
              onToggleExpand={() => setExpandedId((cur) => (cur === attack.id ? null : attack.id))}
              runStatus={runStatuses[attack.id]}
              onPreview={setPreviewAttack}
              onRun={handleRun}
            />
          ))}
      </Card>

      {latestResult && (
  <Card eyebrow="Simulation Result" title={latestResult.attackName}>
    <ResultSummaryBar
      riskScore={latestResult.risk_score}
      riskLevel={
        latestResult.severity === "Critical"
          ? "critical"
          : latestResult.severity === "High" ||
            latestResult.severity === "Medium"
          ? "warning"
          : "safe"
      }
    />

    <div className="attack-result-tabs">
  <button
    className={activeTab === "summary" ? "active" : ""}
    onClick={() => setActiveTab("summary")}
  >
    Summary
  </button>

  <button
    className={activeTab === "detections" ? "active" : ""}
    onClick={() => setActiveTab("detections")}
  >
    Detections
  </button>

  <button
    className={activeTab === "recommendations" ? "active" : ""}
    onClick={() => setActiveTab("recommendations")}
  >
    Recommendations
  </button>

  <button
    className={activeTab === "secure" ? "active" : ""}
    onClick={() => setActiveTab("secure")}
  >
    Secure Prompt
  </button>
</div>

    <div className="attack-lab__result">

      <h4>Executive Summary</h4>
      <p>{latestResult.summary}</p>

      <h4>Business Impact</h4>
      <p>{latestResult.business_impact}</p>

      <h4>Attack Scenario</h4>
      <p>{latestResult.attack_scenario}</p>

      <h4>OWASP Category</h4>
      <p>{latestResult.owasp}</p>

      <h4>Secure Prompt</h4>
      <pre>{latestResult.secure_prompt}</pre>

      <h4>AI Confidence</h4>
      <p>{Math.round((latestResult.ai_confidence || 0) * 100)}%</p>

      <h4>Recommendations</h4>
      <ul>
        {(latestResult.recommendations || []).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h4>Detections</h4>
      <ul>
        {(latestResult.detections || []).map((d, i) => (
          <li key={i}>
            <strong>{d.name}</strong> ({d.severity}) — {d.description}
          </li>
        ))}
      </ul>

    </div>
  </Card>
)}

      <PreviewPromptModal attack={previewAttack} onClose={() => setPreviewAttack(null)} onRun={handleRun} />
    </div>
  );
}
