import { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import { getCssVar } from "../../../utils/getCssVar";
import { getDashboard } from "../api";
import "./DetectionTimelineChart.css";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

export default function DetectionTimelineChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [timeline, setTimeline] = useState({
    labels: [],
    safe: [],
    warning: [],
    critical: [],
  });

  useEffect(() => {
  async function load() {
    try {
      const data = await getDashboard();

      setTimeline(
        data.timeline || {
          labels: [],
          safe: [],
          warning: [],
          critical: [],
        }
      );
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
    if (!canvasRef.current || timeline.labels.length === 0) return;

    chartRef.current?.destroy();

    const gridColor = getCssVar("--border-subtle");
    const tickColor = getCssVar("--text-tertiary");
    const tooltipBg = getCssVar("--bg-surface-raised");
    const tooltipBorder = getCssVar("--border-default");
    const textPrimary = getCssVar("--text-primary");

    const safeColor = getCssVar("--signal-safe");
    const warningColor = getCssVar("--signal-warning");
    const criticalColor = getCssVar("--signal-critical");

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: timeline.labels,
        datasets: [
          {
            label: "Safe",
            data: timeline.safe,
            borderColor: safeColor,
            backgroundColor: `${safeColor}1a`,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 1.5,
            tension: 0.3,
            fill: true,
          },
          {
            label: "Warning",
            data: timeline.warning,
            borderColor: warningColor,
            backgroundColor: `${warningColor}1a`,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 1.5,
            tension: 0.3,
            fill: true,
          },
          {
            label: "Critical",
            data: timeline.critical,
            borderColor: criticalColor,
            backgroundColor: `${criticalColor}1a`,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 1.5,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: tickColor,
              font: { size: 11 },
            },
            border: {
              color: gridColor,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              precision: 0,
            },
            border: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            borderWidth: 1,
            titleColor: textPrimary,
            bodyColor: tickColor,
            padding: 10,
            boxPadding: 4,
            cornerRadius: 6,
            displayColors: true,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [timeline]);

  return (
    <div className="detection-timeline-chart">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Detection timeline by severity"
      />

      <div className="detection-timeline-chart__legend">
        <span className="detection-timeline-chart__legend-item">
          <span className="detection-timeline-chart__dot detection-timeline-chart__dot--safe" />
          Safe
        </span>

        <span className="detection-timeline-chart__legend-item">
          <span className="detection-timeline-chart__dot detection-timeline-chart__dot--warning" />
          Warning
        </span>

        <span className="detection-timeline-chart__legend-item">
          <span className="detection-timeline-chart__dot detection-timeline-chart__dot--critical" />
          Critical
        </span>
      </div>
    </div>
  );
}