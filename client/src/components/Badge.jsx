const colors = {
  green: 'bg-green-50 text-green-700 ring-green-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  gray: 'bg-stone-100 text-stone-600 ring-stone-200',
};

export default function Badge({ color = 'gray', children }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[color]}`}
    >
      {children}
    </span>
  );
}

// Badge shown for a task, based on the value returned by deadlineState().
const taskBadges = {
  completed: ['green', 'Completed'],
  overdue: ['red', 'Overdue'],
  soon: ['amber', 'Due soon'],
  upcoming: ['gray', 'Pending'],
};

export function TaskBadge({ state }) {
  const [color, label] = taskBadges[state];
  return <Badge color={color}>{label}</Badge>;
}
