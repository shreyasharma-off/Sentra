import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanSearch,
  Crosshair,
  History,
  FileText,
  Settings,
  CornerDownLeft,
} from 'lucide-react';
import './CommandPalette.css';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', to: '/', icon: LayoutDashboard, group: 'Navigate' },
  { id: 'analysis', label: 'Run New Analysis', to: '/analysis', icon: ScanSearch, group: 'Navigate' },
  { id: 'attack-simulation', label: 'Go to Attack Simulation Lab', to: '/attack-simulation', icon: Crosshair, group: 'Navigate' },
  { id: 'history', label: 'Go to History', to: '/history', icon: History, group: 'Navigate' },
  { id: 'reports', label: 'Go to Reports', to: '/reports', icon: FileText, group: 'Navigate' },
  { id: 'settings', label: 'Go to Settings', to: '/settings', icon: Settings, group: 'Navigate' },
];

/**
 * CommandPalette
 * A lightweight ⌘K overlay for jumping between pages. Built to be extended
 * later with real search results (prompts, reports) once those pages exist.
 */
export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function runCommand(cmd) {
    if (!cmd) return;
    navigate(cmd.to);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(results[activeIndex]);
    }
  }

  if (!open) return null;

  return (
    <div className="command-palette__overlay" onMouseDown={onClose}>
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette__input-row">
          <input
            ref={inputRef}
            type="text"
            className="command-palette__input"
            placeholder="Search prompts, reports, settings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="command-palette__esc">ESC</span>
        </div>

        <div className="command-palette__results">
          {results.length === 0 && (
            <div className="command-palette__empty">No results for "{query}"</div>
          )}

          {results.length > 0 && (
            <div className="command-palette__group">
              <div className="command-palette__group-label">Navigate</div>
              {results.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    className={`command-palette__item ${
                      index === activeIndex ? 'command-palette__item--active' : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => runCommand(cmd)}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    <span>{cmd.label}</span>
                    {index === activeIndex && (
                      <CornerDownLeft size={13} strokeWidth={1.75} className="command-palette__enter-icon" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
