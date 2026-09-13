import { Download } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { downloadReportCsv } from '@/lib/downloadCsv';
import { useOutstandingDuesReport } from '../hooks/useReports';

export default function OutstandingDuesReportPanel({ hostelId }) {
  const { data, isLoading } = useOutstandingDuesReport(hostelId);
  const balances = data?.data?.balances ?? [];

  return (
    <div className="surface-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Outstanding dues</h2>
        <button
          onClick={() => downloadReportCsv('/reports/outstanding-dues', { hostelId })}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!isLoading && balances.length === 0 && <p className="text-sm text-ink-muted">No outstanding dues.</p>}

      {!isLoading && balances.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-ink-muted">
              <th className="py-2">Resident</th>
              <th className="py-2">Reg. No.</th>
              <th className="py-2">Unpaid invoices</th>
              <th className="py-2">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b) => (
              <tr key={b.residentId} className="border-b border-border last:border-0">
                <td className="py-2 text-ink">{b.residentName}</td>
                <td className="py-2 text-ink">{b.registrationNumber}</td>
                <td className="py-2 text-ink">{b.invoiceCount}</td>
                <td className="py-2 font-medium text-danger">{formatMoney(b.outstandingMinorUnits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}