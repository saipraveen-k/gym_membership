import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-7xl font-black text-accent-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
