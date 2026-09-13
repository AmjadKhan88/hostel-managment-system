import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function StatusBreakdownChart({ data }) {
  const formatted = Object.entries(data).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count,
  }));

  if (formatted.length === 0) return <p className="text-sm text-ink-muted">No data for this period.</p>;

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" vertical={false} />
          <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#9AA1B1' }} axisLine={false} tickLine={false} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#9AA1B1' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EBEDF3', fontSize: 12 }} />
          <Bar dataKey="count" fill="#2F6FED" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}