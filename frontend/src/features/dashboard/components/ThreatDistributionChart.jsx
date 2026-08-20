import { useEffect, useRef, useState } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
import { getCssVar } from "../../../utils/getCssVar";
import { getDashboard } from "../api";
import "./ThreatDistributionChart.css";

Chart.register(DoughnutController, ArcElement, Tooltip);

const COLOR_VARS = [
  "--category-1",
  "--category-2",
  "--category-3",
  "--category-4",
  "--category-5",
];

export default function ThreatDistributionChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
  async function load() {
    try {
      const data = await getDashboard();

      setDistribution(data.distribution || []);
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

  useEffect(() => {
    if (!canvasRef.current || distribution.length === 0) return;

    chartRef.current?.destroy();

    const colors = distribution.map((_, index) =>
      getCssVar(COLOR_VARS[index] || "--category-5")
    );

    const tooltipBg = getCssVar("--bg-surface-raised");
    const tooltipBorder = getCssVar("--border-default");
    const textPrimary = getCssVar("--text-primary");
    const textTertiary = getCssVar("--text-tertiary");

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: distribution.map((d) => d.label),
        datasets: [
          {
            data: distribution.map((d) => d.value),
            backgroundColor: colors,
            borderColor: getCssVar("--bg-surface"),
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            borderWidth: 1,
            titleColor: textPrimary,
            bodyColor: textTertiary,
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [distribution]);

  return (
    <div className="threat-distribution">
      <div className="threat-distribution__chart">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Threat distribution by category"
        />
      </div>

      <ul className="threat-distribution__legend">
        {distribution.map((item, index) => (
          <li key={item.label} className="threat-distribution__legend-item">
            <span
              className="threat-distribution__dot"
              style={{
                backgroundColor: `var(${COLOR_VARS[index] || "--category-5"})`,
              }}
            />

            <span className="threat-distribution__legend-label">
              {item.label}
            </span>

            <span className="text-mono threat-distribution__legend-value">
              {item.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}