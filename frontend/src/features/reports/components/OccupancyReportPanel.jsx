import { Download } from 'lucide-react';
import { useOccupancyReport } from '../hooks/useReports';
import { downloadReportCsv } from '@/lib/downloadCsv';

const BED_STATUS_LABELS = { available: 'Available', occupied: 'Occupied', maintenance: 'Maintenance' };

export default function OccupancyReportPanel({ hostelId }) {
  const { data, isLoading } = useOccupancyReport(hostelId);
  const report = data?.data;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (!report) return null;

  const totalBeds = Object.values(report.beds).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="surface-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Bed occupancy</h2>
          <button
            onClick={() => downloadReportCsv('/reports/occupancy', { hostelId })}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(BED_STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="rounded-control border border-border p-3 text-center">
              <p className="text-xl font-semibold text-ink">{report.beds[key] ?? 0}</p>
              <p className="text-xs text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-subtle">{totalBeds} total beds</p>
      </div>

      <div className="surface-card p-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">By building</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-ink-muted">
              <th className="py-2">Building</th>
              <th className="py-2">Total</th>
              <th className="py-2">Available</th>
              <th className="py-2">Occupied</th>
              <th className="py-2">Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {report.buildings.map((b) => (
              <tr key={b.buildingId} className="border-b border-border last:border-0">
                <td className="py-2 text-ink">{b.buildingName}</td>
                <td className="py-2 text-ink">{b.total}</td>
                <td className="py-2 text-ink">{b.byStatus.available ?? 0}</td>
                <td className="py-2 text-ink">{b.byStatus.occupied ?? 0}</td>
                <td className="py-2 text-ink">{b.byStatus.maintenance ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}