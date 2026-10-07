import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function TaskChart({ pending, completed }) {
  if (pending + completed === 0) {
    return (
      <p className="py-10 text-center text-sm text-stone-500">
        No tasks yet. Add an assignment to get started.
      </p>
    );
  }

  const data = [
    { name: `Completed: ${completed}`, value: completed, color: '#2f7d4f' },
    { name: `Pending: ${pending}`, value: pending, color: '#d08a1e' },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={88}
          stroke="var(--color-surface)"
          strokeWidth={3}
          isAnimationActive={false}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name.split(':')[0]]}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-stone-200)',
            borderRadius: 6,
            fontSize: 12,
          }}
          itemStyle={{ color: 'var(--color-stone-600)' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
