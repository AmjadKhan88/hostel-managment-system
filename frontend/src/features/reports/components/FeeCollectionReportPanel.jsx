import { useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DateRangeFilter from './DateRangeFilter.jsx';
import { formatMoney } from '@/lib/money';
import { downloadReportCsv } from '@/lib/downloadCsv';
import { useFeeCollectionReport } from '../hooks/useReports';

export default function FeeCollectionReportPanel({ hostelId }) {
  const [range, setRange] = useState({});
  const { data, isLoading } = useFeeCollectionReport(hostelId, range);
  const report = data?.data;

  const chartData =
    report?.byMethod.map((m) => ({ method: m.method.replace('_', ' '), total: m.totalMinorUnits / 100 })) ?? [];

  return (
    <div className="space-y-4">
      <div className="surface-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Fee collection</h2>
          <button
            onClick={() => downloadReportCsv('/reports/fee-collection', { hostelId, ...range })}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
        <DateRangeFilter range={range} onChange={setRange} />

        {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}
        {!isLoading && report && (
          <>
            <p className="mb-3 text-sm text-ink-muted">
              Total collected: <span className="font-semibold text-ink">{formatMoney(report.totalMinorUnits)}</span>{' '}
              across {report.paymentCount} payment{report.paymentCount === 1 ? '' : 's'}
            </p>
            {chartData.length > 0 && (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" vertical={false} />
                    <XAxis
                      dataKey="method"
                      tick={{ fontSize: 11, fill: '#9AA1B1' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9AA1B1' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EBEDF3', fontSize: 12 }} />
                    <Bar dataKey="total" fill="#2F6FED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      {report && report.rows.length > 0 && (
        <div className="surface-card overflow-x-auto p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Payments</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-ink-muted">
                <th className="py-2">Receipt</th>
                <th className="py-2">Resident</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Method</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2 text-ink">{r.receiptNumber}</td>
                  <td className="py-2 text-ink">{r.resident}</td>
                  <td className="py-2 text-ink">{formatMoney(r.amountMinorUnits)}</td>
                  <td className="py-2 capitalize text-ink">{r.method.replace('_', ' ')}</td>
                  <td className="py-2 text-ink">{new Date(r.paidAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}