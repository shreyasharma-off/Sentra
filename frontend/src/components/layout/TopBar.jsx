import { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';
import CommandPalette from '../ui/CommandPalette';
import './TopBar.css';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Real-time prompt security overview' },
  '/analysis': { title: 'Analysis', subtitle: 'Run a new prompt security scan' },
  '/attack-simulation': { title: 'Attack Simulation Lab', subtitle: 'AI red-teaming attack catalogue' },
  '/history': { title: 'History', subtitle: 'Full event log of analyzed prompts' },
  '/reports': { title: 'Reports', subtitle: 'Executive security summaries' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and platform' },
};

/**
 * TopBar
 * Displays the current page title/subtitle, global search (with a
 * command-palette overlay bound to Cmd/Ctrl+K), notifications, and profile.
 */
export default function TopBar({ pathname }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const page = PAGE_TITLES[pathname] ?? PAGE_TITLES['/'];

  useEffect(() => {
    function handleKeyDown(e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar__titles">
          <h1 className="topbar__title">{page.title}</h1>
          <p className="topbar__subtitle">{page.subtitle}</p>
        </div>

        <div className="topbar__actions">
          <button
            type="button"
            className="topbar__search"
            onClick={() => setPaletteOpen(true)}
          >
            <Search size={15} strokeWidth={1.75} />
            <span className="topbar__search-placeholder">Search prompts, reports, settings…</span>
            <span className="topbar__search-shortcut">⌘K</span>
          </button>

          <button type="button" className="topbar__icon-btn" aria-label="Notifications">
            <Bell size={17} strokeWidth={1.75} />
            <span className="topbar__notification-dot" />
          </button>

          <div className="topbar__divider" />

          <button type="button" className="topbar__profile">
            <span className="topbar__avatar">AK</span>
            <span className="topbar__profile-name">Aditya Kumar</span>
          </button>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
