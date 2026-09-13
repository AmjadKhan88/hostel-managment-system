import { useState } from 'react';
import { Download } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter.jsx';
import { downloadReportCsv } from '@/lib/downloadCsv';
import { useVisitorsReport } from '../hooks/useReports';

export default function VisitorsReportPanel({ hostelId }) {
  const [range, setRange] = useState({});
  const { data, isLoading } = useVisitorsReport(hostelId, range);
  const report = data?.data;

  return (
    <div className="surface-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Visitor log</h2>
        <button
          onClick={() => downloadReportCsv('/reports/visitors', { hostelId, ...range })}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>
      <DateRangeFilter range={range} onChange={setRange} />

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!isLoading && report && (
        <>
          <p className="mb-3 text-sm text-ink-muted">{report.count} visits</p>
          {report.rows.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-ink-muted">
                  <th className="py-2">Visitor</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Visiting</th>
                  <th className="py-2">Check in</th>
                  <th className="py-2">Check out</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 text-ink">{r.visitorName}</td>
                    <td className="py-2 text-ink">{r.phone}</td>
                    <td className="py-2 text-ink">{r.resident}</td>
                    <td className="py-2 text-ink">{new Date(r.checkInAt).toLocaleString()}</td>
                    <td className="py-2 text-ink">{r.checkOutAt ? new Date(r.checkOutAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}