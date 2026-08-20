import { useEffect, useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
} from "lucide-react";
import { getDashboard } from "../api";
import "./SecurityInsightsList.css";

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertOctagon,
    className: "security-insight--critical",
  },
  warning: {
    icon: AlertTriangle,
    className: "security-insight--warning",
  },
  info: {
    icon: Info,
    className: "security-insight--info",
  },
  safe: {
    icon: ShieldCheck,
    className: "security-insight--safe",
  },
};

export default function SecurityInsightsList() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
  async function load() {
    try {
      const data = await getDashboard();

      const generated = [];

      generated.push({
        id: "security-score",
        severity:
          data.security_score >= 80
            ? "safe"
            : data.security_score >= 60
            ? "warning"
            : "critical",
        text: `Overall security score is ${data.security_score}/100.`,
        time: "Now",
      });

      generated.push({
        id: "critical-threats",
        severity: data.critical_threats > 0 ? "critical" : "safe",
        text:
          data.critical_threats > 0
            ? `${data.critical_threats} critical threat(s) detected.`
            : "No critical threats detected.",
        time: "Now",
      });

      generated.push({
        id: "analyses",
        severity: "info",
        text: `${data.total_analyses} prompt analyses have been completed.`,
        time: "Now",
      });

      generated.push({
        id: "detection-rate",
        severity: data.detection_rate > 50 ? "warning" : "safe",
        text: `Detection rate is ${data.detection_rate}%.`,
        time: "Now",
      });

      setInsights(generated);
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
    <ul className="security-insights">
      {insights.map((insight) => {
        const config =
          SEVERITY_CONFIG[insight.severity] ??
          SEVERITY_CONFIG.info;

        const Icon = config.icon;

        return (
          <li
            key={insight.id}
            className={`security-insight ${config.className}`}
          >
            <Icon
              size={15}
              strokeWidth={1.75}
              className="security-insight__icon"
            />

            <div className="security-insight__body">
              <p className="text-body-sm security-insight__text">
                {insight.text}
              </p>

              <span className="text-caption">
                {insight.time}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}