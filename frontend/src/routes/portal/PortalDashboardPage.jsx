import { Link } from 'react-router-dom';
import { FileText, Megaphone, AlertCircle } from 'lucide-react';
import { useResidentAuthStore } from '@/store/residentAuthStore';
import { usePortalInvoices, usePortalNotices } from '@/features/portal/hooks/usePortalData';
import { formatMoney } from '@/lib/money';

export default function PortalDashboardPage() {
  const resident = useResidentAuthStore((s) => s.resident);
  const { data: invoicesData, isLoading: invoicesLoading } = usePortalInvoices({ limit: 50 });
  const { data: noticesData, isLoading: noticesLoading } = usePortalNotices({ limit: 3 });

  const invoices = invoicesData?.data?.items ?? [];
  const notices = noticesData?.data?.items ?? [];

  const outstanding = invoices
    .filter((i) => i.status === 'issued' || i.status === 'partially_paid')
    .reduce((sum, i) => sum + (i.totalMinorUnits - i.paidMinorUnits), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Welcome, {resident?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-ink-muted">Here's a quick look at your account.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 text-ink-muted">
            <AlertCircle size={16} />
            <p className="text-sm font-medium">Outstanding balance</p>
          </div>
          {invoicesLoading ? (
            <p className="mt-2 text-sm text-ink-muted">Loading…</p>
          ) : (
            <p className={`mt-2 text-2xl font-semibold ${outstanding > 0 ? 'text-danger' : 'text-success'}`}>
              {formatMoney(outstanding)}
            </p>
          )}
          <Link to="/portal/invoices" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
            View invoices →
          </Link>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-2 text-ink-muted">
            <FileText size={16} />
            <p className="text-sm font-medium">Total invoices</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{invoices.length}</p>
          <Link to="/portal/payments" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
            View payment history →
          </Link>
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Megaphone size={15} /> Recent notices
          </h2>
          <Link to="/portal/notices" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        {noticesLoading && <p className="text-sm text-ink-muted">Loading…</p>}
        {!noticesLoading && notices.length === 0 && <p className="text-sm text-ink-muted">No notices right now.</p>}
        <ul className="space-y-3">
          {notices.map((n) => (
            <li key={n._id} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="mt-0.5 text-xs text-ink-subtle">{new Date(n.publishAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}