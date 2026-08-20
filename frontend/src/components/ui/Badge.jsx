import './Badge.css';

const VARIANT_CLASS = {
  safe: 'badge--safe',
  warning: 'badge--warning',
  critical: 'badge--critical',
  info: 'badge--info',
  neutral: 'badge--neutral',
  high: 'badge--high',
  low: 'badge--low',
};

/**
 * Badge
 * Small status pill. `variant` maps to the signal color system — use
 * "neutral" for non-severity labels (e.g. category tags) where no signal
 * color applies.
 */
export default function Badge({ variant = 'neutral', dot = true, children }) {
  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.neutral;

  return (
    <span className={`badge ${variantClass}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}
