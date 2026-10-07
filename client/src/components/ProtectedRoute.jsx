import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Route guard.
 * - Unauthenticated -> /login (remembers where the user was going)
 * - Non-admin on admin routes -> /unauthorized
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
