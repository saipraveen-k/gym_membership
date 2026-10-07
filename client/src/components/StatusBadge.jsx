const STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  approved: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
  rejected: 'bg-red-500/15 text-red-400 ring-red-500/30',
  active: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  expired: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
  paid: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  unpaid: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  admin: 'bg-accent-500/15 text-accent-400 ring-accent-500/30',
  user: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
  inactive: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
};

const LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  active: 'Active',
  expired: 'Expired',
  paid: 'Paid',
  unpaid: 'Unpaid',
  admin: 'Admin',
  user: 'User',
  inactive: 'Inactive',
};

export default function StatusBadge({ status, className = '' }) {
  const key = String(status || '').toLowerCase();
  const style = STYLES[key] || STYLES.expired;
  const label = LABELS[key] || status;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style} ${className}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
