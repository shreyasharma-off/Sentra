import './AttackDetailPanel.css';

const SECTIONS = [
  { key: 'attackPrompt', label: 'Attack Prompt', mono: true },
  { key: 'why', label: 'Why This Attack Exists' },
  { key: 'owaspExplanation', label: 'OWASP Explanation' },
  { key: 'risk', label: 'Risk' },
  { key: 'successCriteria', label: 'Success Criteria' },
  { key: 'detectionLogic', label: 'Detection Logic' },
  { key: 'mitigation', label: 'Mitigation Guidance' },
];

/**
 * AttackDetailPanel
 * Inline expanded content for a single AttackRow. Purely presentational —
 * reads straight from the attack record, no local state.
 */
export default function AttackDetailPanel({ attack }) {
  const owaspExplanation = `${attack.owasp.code} \u2014 ${attack.owasp.title}: part of the OWASP Top 10 for LLM Applications, covering risks specific to this attack category.`;

  const values = { ...attack, owaspExplanation };

  return (
    <div className="attack-detail-panel">
      {SECTIONS.map((section) => (
        <div key={section.key} className="attack-detail-panel__section">
          <span className="text-h3-label">{section.label}</span>
          <p className={section.mono ? 'text-mono attack-detail-panel__mono-value' : 'text-body-sm attack-detail-panel__value'}>
            {values[section.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
