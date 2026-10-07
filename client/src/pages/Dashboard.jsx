import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Hourglass,
  Package,
  XCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import { getMyApplications } from '../services/applicationService.js';
import { useAuth } from '../context/AuthContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export default function Dashboard() {
  useDocumentTitle('Dashboard');

  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyApplications();
      setApplications(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    active: applications.filter((a) => a.status === 'active').length,
    expired: applications.filter((a) => a.status === 'expired').length,
  };

  const activeMembership = applications.find((a) => a.status === 'active');
  const recent = applications.slice(0, 5);

  return (
    <div className="container-page py-10 lg:py-14">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
            Member Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage your membership applications and track their status.
          </p>
        </div>
        <Link to="/memberships" className="btn-primary">
          Browse memberships
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Profile summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5 sm:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Profile information
          </h2>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-zinc-500">Name</p>
              <p className="mt-0.5 font-semibold text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-zinc-500">Email</p>
              <p className="mt-0.5 font-semibold text-white break-all">{user?.email}</p>
            </div>
            <div>
              <p className="text-zinc-500">Phone</p>
              <p className="mt-0.5 font-semibold text-white">{user?.phone}</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-400 transition hover:text-accent-300"
          >
            Edit profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total applications"
          value={loading ? '—' : stats.total}
          icon={Package}
          accent="text-accent-400"
        />
        <DashboardCard
          title="Pending applications"
          value={loading ? '—' : stats.pending}
          icon={Hourglass}
          accent="text-amber-400"
        />
        <DashboardCard
          title="Active membership"
          value={loading ? '—' : stats.active}
          icon={CheckCircle2}
          accent="text-emerald-400"
        />
        <DashboardCard
          title="Expired memberships"
          value={loading ? '—' : stats.expired}
          icon={XCircle}
          accent="text-zinc-400"
        />
      </div>

      {/* Active membership banner */}
      {activeMembership && (
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Your active membership
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-white">
                {activeMembership.membership?.name}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {formatDate(activeMembership.startDate)} → {formatDate(activeMembership.endDate)}{' '}
                · {formatCurrency(activeMembership.membership?.price)}
              </p>
            </div>
            <StatusBadge status={activeMembership.paymentStatus} />
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">My Memberships</h2>
          <Link
            to="/my-memberships"
            className="text-sm font-semibold text-accent-400 transition hover:text-accent-300"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <LoadingSpinner label="Loading your applications..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchApplications} />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No applications yet"
            message="You haven't applied for any membership yet. Browse our packages and apply today."
            icon={Clock}
            action={
              <Link to="/memberships" className="btn-primary mt-2">
                Browse memberships
              </Link>
            }
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400">
                    <th scope="col" className="px-4 py-3 font-semibold">Membership</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Applied</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Period</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/50"
                    >
                      <td className="px-4 py-3 font-semibold text-white">
                        {app.membership?.name || 'Deleted plan'}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {formatCurrency(app.membership?.price)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(app.appliedAt)}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {app.startDate ? (
                          <>
                            {formatDate(app.startDate)} → {formatDate(app.endDate)}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
