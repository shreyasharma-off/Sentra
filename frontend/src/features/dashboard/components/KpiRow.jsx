import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ScanLine, Percent } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import Sparkline from "./Sparkline";
import { getDashboard } from "../api";
import "./KpiRow.css";

function formatDelta(delta, unit = "%") {
  const sign = delta > 0 ? "▲" : delta < 0 ? "▼" : "–";
  return `${sign} ${Math.abs(delta)}${unit}`;
}

export default function KpiRow() {
  const [stats, setStats] = useState({
    security_score: 0,
    critical_threats: 0,
    total_analyses: 0,
    detection_rate: 0,
  });

  useEffect(() => {
  async function load() {
    try {
      const data = await getDashboard();
      setStats(data);
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

  return (
    <div className="kpi-row">
      <StatCard
        label="Security Score"
        icon={ShieldCheck}
        value={stats.security_score}
        suffix="/100"
        tone="safe"
      />

      <StatCard
        label="Critical Threats"
        icon={ShieldAlert}
        value={stats.critical_threats}
        tone={stats.critical_threats > 0 ? "critical" : "safe"}
      />

      <StatCard
        label="Total Analyses"
        icon={ScanLine}
        value={stats.total_analyses.toLocaleString()}
        tone="neutral"
        chart={
          <Sparkline
            data={[
              stats.total_analyses,
              stats.total_analyses,
              stats.total_analyses,
              stats.total_analyses,
            ]}
            tone="neutral"
          />
        }
      />

      <StatCard
        label="Detection Rate"
        icon={Percent}
        value={stats.detection_rate}
        suffix="%"
        tone="neutral"
        chart={
          <Sparkline
            data={[
              stats.detection_rate,
              stats.detection_rate,
              stats.detection_rate,
              stats.detection_rate,
            ]}
            tone="warning"
          />
        }
      />
    </div>
  );
}
