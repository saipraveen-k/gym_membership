import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-white">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        You do not have permission to view this page. This area is restricted to
        administrators.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
        <Link to="/" className="btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
