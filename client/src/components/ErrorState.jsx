import { RefreshCw, TriangleAlert } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="max-w-md text-sm text-zinc-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
