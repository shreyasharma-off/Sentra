import { ChevronRight, Eye, Play, Loader2, CheckCircle2, Clock } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import AttackDetailPanel from './AttackDetailPanel';
import './AttackRow.css';

const SEVERITY_VARIANT = { critical: 'critical', high: 'high', medium: 'warning', low: 'low' };

const RUN_STATUS_CONFIG = {
  queued: { icon: Clock, label: 'Queued', className: 'attack-row__run-status--queued' },
  running: { icon: Loader2, label: 'Running', className: 'attack-row__run-status--running' },
  completed: { icon: CheckCircle2, label: 'Completed', className: 'attack-row__run-status--completed' },
};

/**
 * AttackRow
 * One row of the attack catalogue. Collapsed by default; clicking the row
 * body (not the action buttons) expands AttackDetailPanel inline below it.
 * Run status is passed down from the page so multiple rows can run/queue
 * independently.
 */
export default function AttackRow({ attack, expanded, onToggleExpand, runStatus, onPreview, onRun }) {
  const statusConfig = runStatus ? RUN_STATUS_CONFIG[runStatus] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <div className={`attack-row ${expanded ? 'attack-row--expanded' : ''}`}>
      <div
        className="attack-row__header"
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        <ChevronRight size={14} strokeWidth={1.75} className={`attack-row__chevron ${expanded ? 'attack-row__chevron--open' : ''}`} />

        <span className="text-body attack-row__name">{attack.name}</span>

        <Badge variant={SEVERITY_VARIANT[attack.severity]}>{attack.severity}</Badge>

        <span className="attack-row__owasp">{attack.owasp.code}</span>

        <span className="text-body-sm attack-row__description">{attack.description}</span>

        <div className="attack-row__status-slot">
          {statusConfig && (
            <span className={`attack-row__run-status ${statusConfig.className}`}>
              <StatusIcon size={12} strokeWidth={2} className={runStatus === 'running' ? 'attack-row__spin' : ''} />
              {statusConfig.label}
            </span>
          )}
        </div>

        <div className="attack-row__actions" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" icon={Eye} onClick={() => onPreview(attack)}>
            Preview Prompt
          </Button>
          <Button
            variant="primary"
            icon={Play}
            onClick={() => onRun(attack)}
            disabled={runStatus === 'queued' || runStatus === 'running'}
          >
            Run Simulation
          </Button>
        </div>
      </div>

      {expanded && <AttackDetailPanel attack={attack} />}
    </div>
  );
}
