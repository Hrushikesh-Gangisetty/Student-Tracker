// One cell of the summary strip at the top of the dashboard.
export default function StatCard({ label, value, note, valueClass = 'text-stone-900' }) {
  return (
    <div className="bg-surface p-4 sm:p-5">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-stone-500">{note}</p>
    </div>
  );
}
