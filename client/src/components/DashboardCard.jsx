/**
 * Stat card for admin dashboard.
 */
export default function DashboardCard({ title, value, icon: Icon, accent = 'text-accent-400', hint }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 ${accent}`}>
        {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-zinc-400">{title}</p>
        <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-white">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-zinc-500">{hint}</p>}
      </div>
    </div>
  );
}
