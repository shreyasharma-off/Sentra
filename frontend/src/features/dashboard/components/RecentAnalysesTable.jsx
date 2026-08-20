import { useEffect, useState } from "react";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import { getHistory } from "../api";
import "./RecentAnalysesTable.css";

const RISK_VARIANT = {
  Low: "safe",
  Medium: "warning",
  High: "warning",
  Critical: "critical",
};

export default function RecentAnalysesTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
  async function load() {
    try {
      const history = await getHistory();
      setAnalyses(history);
    } catch (err) {
      console.error(err);
    }
  }

  load();

  const interval = setInterval(load, 10000);

  window.addEventListener("dashboard-refresh", load);

  return () => {
    clearInterval(interval);
    window.removeEventListener("dashboard-refresh", load);
  };
}, []);

  const columns = [
    {
      key: "prompt",
      header: "Prompt",
      render: (row) => (
        <span className="text-mono recent-analyses__prompt">{row.prompt}</span>
      ),
    },
    {
      key: "riskScore",
      header: "Risk Score",
      align: "center",
      render: (row) => (
        <Badge variant={RISK_VARIANT[row.riskLevel]}>{row.riskScore}</Badge>
      ),
    },
    {
      key: "detections",
      header: "Detections",
      render: (row) =>
        row.detections.length === 0 ? (
          <span className="text-body-sm recent-analyses__none">None</span>
        ) : (
          <div className="recent-analyses__chips">
            {row.detections.map((d) => (
              <span key={d} className="recent-analyses__chip">
                {d}
              </span>
            ))}
          </div>
        ),
    },
    {
      key: "time",
      header: "Time",
      align: "right",
    },
  ];

  return <Table columns={columns} rows={rows} getRowKey={(row) => row.id} />;
}
