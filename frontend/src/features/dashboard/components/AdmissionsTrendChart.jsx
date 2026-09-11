import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdmissionsTrendChart({ data }) {
  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) })); // MM-DD

  return (
    <div className="surface-card p-6">
      <h2 className="text-sm font-semibold text-ink">New residents — last 30 days</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9AA1B1' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9AA1B1' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #EBEDF3', fontSize: 12 }}
              labelStyle={{ color: '#111827' }}
            />
            <Line type="monotone" dataKey="count" stroke="#2F6FED" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}