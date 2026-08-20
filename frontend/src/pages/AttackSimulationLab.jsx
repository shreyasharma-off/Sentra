import AttackSimulationLabPage from '../features/attack-simulation-lab/AttackSimulationLabPage';

/**
 * Route-level entry for "/attack-simulation". Kept thin — all logic and
 * composition lives in the feature module.
 */
export default function AttackSimulationLab() {
  return <AttackSimulationLabPage />;
}
