export default function LoadingSpinner({ label = 'Loading...', size = 'md' }) {
  const sizeClass = {
    sm: 'h-5 w-5 border-2',
    md: 'h-9 w-9 border-[3px]',
    lg: 'h-14 w-14 border-4',
  }[size];

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClass} animate-spin rounded-full border-zinc-700 border-t-accent-500`}
        aria-hidden="true"
      />
      <p className="text-sm text-zinc-400">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
