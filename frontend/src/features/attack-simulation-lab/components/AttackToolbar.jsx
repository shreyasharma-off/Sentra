import { Search, ChevronDown } from 'lucide-react';
import Input from '../../../components/ui/Input';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import { SEVERITY_OPTIONS, OWASP_OPTIONS, TYPE_OPTIONS, SORT_OPTIONS } from '../api';
import './AttackToolbar.css';

/**
 * AttackToolbar
 * Dense filter/search/sort bar for the attack catalogue. Follows the same
 * filter-trigger + DropdownMenu pattern already used by History's toolbar,
 * so the interaction language stays consistent across the app.
 */
export default function AttackToolbar({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  owasp,
  onOwaspChange,
  attackType,
  onAttackTypeChange,
  sortBy,
  onSortByChange,
  resultCount,
}) {
  function toggleMulti(current, onChange, value) {
    onChange(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Severity';

  return (
    <div className="attack-toolbar">
      <div className="attack-toolbar__row">
        <Input
          icon={Search}
          placeholder="Search attacks\u2026"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="attack-toolbar__search"
        />

        <DropdownMenu
          trigger={(toggle, open) => (
            <button type="button" className={`attack-filter-trigger ${severity.length > 0 ? 'attack-filter-trigger--active' : ''}`} onClick={toggle}>
              Severity{severity.length > 0 ? `: ${severity.length}` : ''}
              <ChevronDown size={13} strokeWidth={1.75} className={open ? 'attack-filter-trigger__chevron--open' : ''} />
            </button>
          )}
        >
          {SEVERITY_OPTIONS.map((opt) => (
            <label key={opt.value} className="dropdown-menu__checkbox-row">
              <input type="checkbox" checked={severity.includes(opt.value)} onChange={() => toggleMulti(severity, onSeverityChange, opt.value)} />
              {opt.label}
            </label>
          ))}
        </DropdownMenu>

        <DropdownMenu
          trigger={(toggle, open) => (
            <button type="button" className={`attack-filter-trigger ${owasp.length > 0 ? 'attack-filter-trigger--active' : ''}`} onClick={toggle}>
              OWASP{owasp.length > 0 ? `: ${owasp.length}` : ''}
              <ChevronDown size={13} strokeWidth={1.75} className={open ? 'attack-filter-trigger__chevron--open' : ''} />
            </button>
          )}
        >
          {OWASP_OPTIONS.map((opt) => (
            <label key={opt.value} className="dropdown-menu__checkbox-row">
              <input type="checkbox" checked={owasp.includes(opt.value)} onChange={() => toggleMulti(owasp, onOwaspChange, opt.value)} />
              {opt.label}
            </label>
          ))}
        </DropdownMenu>

        <DropdownMenu
          trigger={(toggle, open) => (
            <button type="button" className={`attack-filter-trigger ${attackType.length > 0 ? 'attack-filter-trigger--active' : ''}`} onClick={toggle}>
              Attack Type{attackType.length > 0 ? `: ${attackType.length}` : ''}
              <ChevronDown size={13} strokeWidth={1.75} className={open ? 'attack-filter-trigger__chevron--open' : ''} />
            </button>
          )}
        >
          {TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="dropdown-menu__checkbox-row">
              <input type="checkbox" checked={attackType.includes(opt.value)} onChange={() => toggleMulti(attackType, onAttackTypeChange, opt.value)} />
              {opt.label}
            </label>
          ))}
        </DropdownMenu>

        <div className="attack-toolbar__spacer" />

        <DropdownMenu
          align="right"
          trigger={(toggle, open) => (
            <button type="button" className="attack-filter-trigger" onClick={toggle}>
              Sort: {sortLabel}
              <ChevronDown size={13} strokeWidth={1.75} className={open ? 'attack-filter-trigger__chevron--open' : ''} />
            </button>
          )}
        >
          {(close) =>
            SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="dropdown-menu__item"
                onClick={() => {
                  onSortByChange(opt.value);
                  close();
                }}
              >
                {opt.label}
              </button>
            ))
          }
        </DropdownMenu>
      </div>

      <span className="text-body-sm attack-toolbar__count">
        {resultCount} attack{resultCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}
