const STATUS_STYLES = {
  available: 'bg-success-bg text-success',
  occupied: 'bg-brand-50 text-brand-700',
  maintenance: 'bg-warning-bg text-warning',
  inactive: 'bg-canvas text-ink-subtle',
  active: 'bg-success-bg text-success',
  open: 'bg-warning-bg text-warning',
  in_progress: 'bg-brand-50 text-brand-700',
  resolved: 'bg-success-bg text-success',
  closed: 'bg-canvas text-ink-subtle',
  applied: 'bg-canvas text-ink-muted',
  waitlisted: 'bg-warning-bg text-warning',
  approved: 'bg-success-bg text-success',
  rejected: 'bg-danger-bg text-danger',
  checked_in: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-canvas text-ink-subtle',
  issued: 'bg-canvas text-ink-muted',
  partially_paid: 'bg-warning-bg text-warning',
  paid: 'bg-success-bg text-success',
  void: 'bg-canvas text-ink-subtle',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-canvas text-ink-muted';
  return (
    <span className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}