import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanSearch,
  Crosshair,
  History,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analysis', label: 'Analysis', icon: ScanSearch },
  { to: '/attack-simulation', label: 'Attack Simulation', icon: Crosshair },
  { to: '/history', label: 'History', icon: History },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: Settings };

/**
 * Sidebar
 * Fixed-width primary navigation. Collapses to an icon-only rail.
 * Collapse state is controlled by the parent (AppShell) so the layout
 * grid can react to width changes.
 */
export default function Sidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__wordmark">{collapsed ? 'S' : 'Sentra'}</span>
        {!collapsed && <span className="sidebar__status-dot" aria-label="All systems operational" />}
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        <ul className="sidebar__nav-list">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <Icon size={18} strokeWidth={1.75} className="sidebar__nav-icon" />
                {!collapsed && <span className="sidebar__nav-label">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <NavLink
          to={SETTINGS_ITEM.to}
          className={({ isActive }) =>
            `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
          }
          title={collapsed ? SETTINGS_ITEM.label : undefined}
        >
          <SETTINGS_ITEM.icon size={18} strokeWidth={1.75} className="sidebar__nav-icon" />
          {!collapsed && <span className="sidebar__nav-label">{SETTINGS_ITEM.label}</span>}
        </NavLink>

        <button
          type="button"
          className="sidebar__collapse-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight size={16} strokeWidth={1.75} />
          ) : (
            <ChevronsLeft size={16} strokeWidth={1.75} />
          )}
        </button>
      </div>
    </aside>
  );
}
