import { useCallback, useState } from "react";
import Card from "../../components/ui/Card";
import ErrorBanner from "../../components/ui/ErrorBanner";
import ResultSummaryBar from "../../components/ui/ResultSummaryBar";
import PromptEditor from "./components/PromptEditor";
import ThreatEnginePanel from "./components/ThreatEnginePanel";
import AISecurityAnalyst from "./components/AISecurityAnalyst";
import AttackSimulationLab from "./components/AttackSimulationLab";
import { analyzePrompt, CONTEXT_OPTIONS, DETECTION_CATEGORIES } from "./api";
import "./AnalysisPage.css";

const API_URL = "http://localhost:8000";

const IDLE_STATUSES = Object.fromEntries(
  DETECTION_CATEGORIES.map((c) => [c.id, "idle"]),
);

export default function AnalysisPage() {
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState(CONTEXT_OPTIONS[1].value);
  const [phase, setPhase] = useState("idle");
  const [statuses, setStatuses] = useState(IDLE_STATUSES);
  const [details, setDetails] = useState({});
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const runScan = useCallback(
    async (customPrompt) => {
      const promptToScan =
        typeof customPrompt === "string" ? customPrompt : prompt;

      setPhase("scanning");
      setStatuses(IDLE_STATUSES);
      setDetails({});
      setResult(null);
      setErrorMessage(null);

      try {
        const res = await analyzePrompt(
          {
            prompt: promptToScan,
            context,
          },
          {
            onEngineUpdate: (categoryId, status, detail) => {
              setStatuses((prev) => ({ ...prev, [categoryId]: status }));

              if (detail) {
                setDetails((prev) => ({
                  ...prev,
                  [categoryId]: detail,
                }));
              }
            },
          },
        );

        setResult(res);
        setPhase("success");

        window.dispatchEvent(new Event("dashboard-refresh"));
      } catch (err) {
        setErrorMessage(err.message || "Analysis failed.");
        setPhase("error");
      }
    },
    [prompt, context],
  );

  function handleClear() {
    setPrompt("");
    setPhase("idle");
    setStatuses(IDLE_STATUSES);
    setDetails({});
    setResult(null);
    setErrorMessage(null);
  }

  async function handleExport() {
    if (!result?.id) return;

    try {
      const response = await fetch(`${API_URL}/report/${result.id}`);

      if (!response.ok) {
        throw new Error("Failed to generate report.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Sentra_Report_${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleAddToReport() {
    console.info("Add to report", result?.id);
  }

  const isScanning = phase === "scanning";

  return (
    <div className="analysis">
      <div className="analysis__grid">
        <PromptEditor
          prompt={prompt}
          onPromptChange={setPrompt}
          context={context}
          onContextChange={setContext}
          onRun={runScan}
          onClear={handleClear}
          isScanning={isScanning}
        />

        <ThreatEnginePanel statuses={statuses} details={details} />
      </div>

      {phase === "error" && (
        <ErrorBanner message={errorMessage} onRetry={runScan} />
      )}

      {phase === "success" && result && (
        <>
          <ResultSummaryBar
            riskScore={result.riskScore}
            riskLevel={result.riskLevel}
            onExport={handleExport}
            onAddToReport={handleAddToReport}
            onRerun={runScan}
          />

          <AISecurityAnalyst
            summary={result.summary}
            businessImpact={result.businessImpact}
            attackScenario={result.attackScenario}
            owasp={result.owasp}
            securePrompt={result.securePrompt}
            recommendations={result.recommendations}
          />

          <AttackSimulationLab
            onSelect={setPrompt}
            onRun={(selectedPrompt) => {
              setPrompt(selectedPrompt);
              runScan(selectedPrompt);
            }}
          />
        </>
      )}

      {phase === "idle" && (
        <Card className="analysis__hint">
          <p className="text-body-sm">
            Paste a prompt above and run an analysis to see risk score,
            detection breakdown and engine reasoning.
          </p>
        </Card>
      )}
    </div>
  );
}
