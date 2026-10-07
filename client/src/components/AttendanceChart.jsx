import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { attendancePercent } from '../services/helpers.js';

// Colours come from the CSS variables so the chart follows light / dark mode.
const tick = { fontSize: 12, fill: 'var(--color-stone-500)' };
const tooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-stone-200)',
  borderRadius: 6,
  fontSize: 12,
};

export default function AttendanceChart({ subjects }) {
  // Subjects with no classes yet have no percentage, so they are left out of the chart.
  const data = subjects
    .map((s) => ({ name: s.name, percent: attendancePercent(s) }))
    .filter((s) => s.percent !== null);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-stone-500">
        No attendance data yet. Add a subject to see the chart.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-stone-200)" />
        <XAxis type="number" domain={[0, 100]} unit="%" tick={tick} stroke="var(--color-stone-300)" />
        <YAxis type="category" dataKey="name" width={110} tick={tick} stroke="var(--color-stone-300)" />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Attendance']}
          cursor={{ fill: 'var(--color-stone-50)' }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: 'var(--color-stone-900)' }}
          itemStyle={{ color: 'var(--color-stone-600)' }}
        />
        <ReferenceLine x={75} stroke="var(--color-stone-400)" strokeDasharray="4 4" />
        <Bar dataKey="percent" isAnimationActive={false} radius={[0, 3, 3, 0]} barSize={16}>
          {data.map((s) => (
            <Cell key={s.name} fill={s.percent >= 75 ? '#2f7d4f' : '#c0392b'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
