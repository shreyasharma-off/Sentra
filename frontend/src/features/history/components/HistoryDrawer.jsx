import Drawer from "../../../components/ui/Drawer";
import ResultSummaryBar from "../../../components/ui/ResultSummaryBar";
import { CONTEXT_OPTIONS } from "../../../constants/detection";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";
import "./HistoryDrawer.css";

export default function HistoryDrawer({
  record,
  onClose,
  onExport,
  onAddToReport,
}) {
  if (!record) return null;

  const contextLabel =
    CONTEXT_OPTIONS.find((o) => o.value === record.context)?.label ??
    record.context;

  return (
    <Drawer open={Boolean(record)} onClose={onClose} title="Analysis Details">
      <section className="history-drawer__section">
        <span className="text-h3-label">Prompt</span>
        <p className="text-mono history-drawer__prompt">{record.prompt}</p>
      </section>

      <section className="history-drawer__meta">
        <div className="history-drawer__meta-item">
          <span className="text-h3-label">Context</span>
          <span className="text-body-sm">{contextLabel}</span>
        </div>

        <div className="history-drawer__meta-item">
          <span className="text-h3-label">Source</span>
          <span className="text-body-sm">{record.source}</span>
        </div>

        <div className="history-drawer__meta-item">
          <span className="text-h3-label">Model</span>
          <span className="text-mono">{record.model}</span>
        </div>

        <div className="history-drawer__meta-item">
          <span className="text-h3-label">Confidence</span>
          <span className="text-body-sm">
            {record.confidence != null ? `${record.confidence}%` : "N/A"}
          </span>
        </div>

        <div className="history-drawer__meta-item">
          <span className="text-h3-label">Analyzed</span>
          <span
            className="text-body-sm"
            title={new Date(record.analyzedAt).toLocaleString()}
          >
            {formatRelativeTime(record.analyzedAt)}
          </span>
        </div>
      </section>

      {record.summary && (
        <section className="history-drawer__section">
          <span className="text-h3-label">Executive Summary</span>
          <p className="text-body-sm">{record.summary}</p>
        </section>
      )}

      {record.businessImpact && (
        <section className="history-drawer__section">
          <span className="text-h3-label">Business Impact</span>
          <p className="text-body-sm">{record.businessImpact}</p>
        </section>
      )}

      {record.attackScenario && (
        <section className="history-drawer__section">
          <span className="text-h3-label">Attack Scenario</span>
          <p className="text-body-sm">{record.attackScenario}</p>
        </section>
      )}

      {record.owasp && (
        <section className="history-drawer__section">
          <span className="text-h3-label">OWASP Mapping</span>
          <p className="text-body-sm">{record.owasp}</p>
        </section>
      )}

      <section className="history-drawer__section">
        <span className="text-h3-label">Detections</span>

        {Array.isArray(record.detections) && record.detections.length > 0 ? (
          <ul className="history-drawer__detections">
            {record.detections.map((d, index) => (
              <li key={index}>
                <strong>{d.name || d.type || "Detection"}</strong>

                {d.confidence != null && (
                  <> ({Math.round(d.confidence)}%)</>
                )}

                {d.description && <> — {d.description}</>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm">No detections found.</p>
        )}
      </section>

      {Array.isArray(record.recommendations) &&
        record.recommendations.length > 0 && (
          <section className="history-drawer__section">
            <span className="text-h3-label">Recommendations</span>

            <ul className="history-drawer__detections">
              {record.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}

      {record.securePrompt && (
        <section className="history-drawer__section">
          <span className="text-h3-label">Secure Prompt</span>

          <p className="text-mono history-drawer__prompt">
            {record.securePrompt}
          </p>
        </section>
      )}

      <ResultSummaryBar
        riskScore={record.riskScore}
        riskLevel={record.riskLevel}
        onExport={() => onExport(record)}
        onAddToReport={() => onAddToReport(record)}
      />
    </Drawer>
  );
} 