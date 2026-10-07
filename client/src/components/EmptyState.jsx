import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
  icon: Icon = Inbox,
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {message && <p className="max-w-md text-sm text-zinc-400">{message}</p>}
      {action}
    </div>
  );
}
