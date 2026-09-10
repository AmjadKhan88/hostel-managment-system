const STATUS_STYLES = {
  available: 'bg-success-bg text-success',
  occupied: 'bg-brand-50 text-brand-700',
  maintenance: 'bg-warning-bg text-warning',
  inactive: 'bg-canvas text-ink-subtle',
  active: 'bg-success-bg text-success',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-canvas text-ink-muted';
  return (
    <span className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}