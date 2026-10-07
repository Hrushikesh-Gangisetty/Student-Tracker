export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
