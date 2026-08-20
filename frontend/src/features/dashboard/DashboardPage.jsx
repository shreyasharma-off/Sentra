import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import SegmentedControl from '../../components/ui/SegmentedControl';
import KpiRow from './components/KpiRow';
import DetectionTimelineChart from './components/DetectionTimelineChart';
import ThreatDistributionChart from './components/ThreatDistributionChart';
import RecentAnalysesTable from './components/RecentAnalysesTable';
import SecurityInsightsList from './components/SecurityInsightsList';
import QuickActions from './components/QuickActions';
import './DashboardPage.css';

const TIME_RANGE_OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'custom', label: 'Custom' },
];

/**
 * DashboardPage
 * Layout order follows the design spec exactly:
 * time-range header -> 4 KPI cards -> timeline + distribution charts ->
 * recent analyses + insights -> quick actions.
 */
export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="dashboard">
      <div className="dashboard__toolbar">
        <SegmentedControl options={TIME_RANGE_OPTIONS} value={timeRange} onChange={setTimeRange} />
      </div>

      <KpiRow key={Date.now()} />

      <div className="dashboard__charts-row">
        <Card title="Detection Timeline" className="dashboard__timeline-card">
          <DetectionTimelineChart />
        </Card>

        <Card title="Threat Distribution" className="dashboard__distribution-card">
          <ThreatDistributionChart />
        </Card>
      </div>

      <div className="dashboard__lower-row">
        <Card
          title="Recent Analyses"
          className="dashboard__recent-card"
          padded={false}
          action={
            <Link to="/history" className="text-body-sm dashboard__view-all">
              View all &rarr;
            </Link>
          }
        >
          <RecentAnalysesTable />
        </Card>

        <Card title="Security Insights" className="dashboard__insights-card">
          <SecurityInsightsList />
        </Card>
      </div>

      <QuickActions />
    </div>
  );
}
