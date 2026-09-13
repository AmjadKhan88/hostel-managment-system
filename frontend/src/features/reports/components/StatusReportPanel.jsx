import { useState } from 'react';
import { Download } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter.jsx';
import StatusBreakdownChart from './StatusBreakdownChart.jsx';
import { downloadReportCsv } from '@/lib/downloadCsv';

/**
 * Generic panel for any report shaped as { byStatus: {...} } — Admissions,
 * Complaints, and Maintenance all share this shape. `useReportQuery` is the
 * specific hook (useAdmissionsReport, etc.); `extra` renders any
 * report-specific extras (e.g. Maintenance's total cost).
 */
export default function StatusReportPanel({ hostelId, title, useReportQuery, exportPath, extra }) {
  const [range, setRange] = useState({});
  const { data, isLoading } = useReportQuery(hostelId, range);
  const report = data?.data;

  return (
    <div className="surface-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <button
          onClick={() => downloadReportCsv(exportPath, { hostelId, ...range })}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      <DateRangeFilter range={range} onChange={setRange} />

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
      {!isLoading && report && <StatusBreakdownChart data={report.byStatus} />}
      {!isLoading && report && extra?.(report)}
    </div>
  );
}