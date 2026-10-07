import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Hourglass,
  IndianRupee,
  Package,
  UserPlus,
  Users,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import DashboardCard from '../../components/DashboardCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getDashboardStats } from '../../services/adminService.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const STATUS_COLORS = {
  pending: 'bg-amber-500',
  approved: 'bg-sky-500',
  active: 'bg-emerald-500',
  rejected: 'bg-red-500',
  expired: 'bg-zinc-500',
};

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner label="Loading dashboard statistics..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Unable to load dashboard" message={error} onRetry={fetchStats} />;
  }

  if (!stats) return null;

  const maxStatusCount = Math.max(...(stats.byStatus || []).map((s) => s.count), 1);
  const maxTopCount = Math.max(...(stats.topMemberships || []).map((t) => t.applications), 1);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Live statistics aggregated from MongoDB.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/applications" className="btn-secondary">
            Review applications
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/admin/memberships" className="btn-primary">
            Manage memberships
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          accent="text-sky-400"
          hint={`${stats.newUsersThisMonth} new this month`}
        />
        <DashboardCard
          title="Total Memberships"
          value={stats.totalMemberships}
          icon={Package}
          accent="text-accent-400"
          hint={`${stats.totalMembershipsAll} total (incl. inactive)`}
        />
        <DashboardCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={Activity}
          accent="text-emerald-400"
        />
        <DashboardCard
          title="Pending Applications"
          value={stats.pendingApplications}
          icon={Hourglass}
          accent="text-amber-400"
        />
        <DashboardCard
          title="Active Memberships"
          value={stats.activeMemberships}
          icon={Activity}
          accent="text-emerald-400"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Approved (awaiting activation)" value={stats.approvedApplications} icon={Activity} accent="text-sky-400" />
        <DashboardCard title="Rejected applications" value={stats.rejectedApplications} icon={Activity} accent="text-red-400" />
        <DashboardCard title="Expired memberships" value={stats.expiredApplications} icon={Activity} accent="text-zinc-400" />
        <DashboardCard title="Collected revenue" value={formatCurrency(stats.revenue)} icon={IndianRupee} accent="text-emerald-400" hint="Sum of paid applications" />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Status breakdown */}
        <section className="card p-6" aria-labelledby="status-chart-heading">
          <h2 id="status-chart-heading" className="text-base font-bold text-white">
            Applications by status
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">Current distribution in MongoDB</p>

          {stats.byStatus.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No applications yet.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {stats.byStatus.map((s) => (
                <li key={s.status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize text-zinc-300">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[s.status] || 'bg-zinc-500'}`}
                        aria-hidden="true"
                      />
                      {s.status}
                    </span>
                    <span className="font-semibold text-white">{s.count}</span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
                    role="img"
                    aria-label={`${s.status}: ${s.count} applications`}
                  >
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[s.status] || 'bg-zinc-500'}`}
                      style={{ width: `${(s.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top memberships */}
        <section className="card p-6" aria-labelledby="top-chart-heading">
          <h2 id="top-chart-heading" className="text-base font-bold text-white">
            Most applied memberships
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">Top plans by application count</p>

          {stats.topMemberships.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No data yet.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {stats.topMemberships.map((t) => (
                <li key={String(t._id)}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-zinc-300">{t.name || 'Deleted plan'}</span>
                    <span className="shrink-0 font-semibold text-white">
                      {t.applications} application{t.applications === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{ width: `${(t.applications / maxTopCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent applications */}
      <section className="mt-8" aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="text-base font-bold text-white">
            Recent applications
          </h2>
          <Link
            to="/admin/applications"
            className="text-sm font-semibold text-accent-400 transition hover:text-accent-300"
          >
            View all →
          </Link>
        </div>

        {stats.recentApplications.length === 0 ? (
          <div className="card px-6 py-8 text-center text-sm text-zinc-500">
            No applications submitted yet.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400">
                    <th scope="col" className="px-4 py-3 font-semibold">User</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Membership</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Applied</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{app.user?.name || 'Deleted user'}</p>
                        <p className="text-xs text-zinc-500">{app.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {app.membership?.name || 'Deleted plan'}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {formatCurrency(app.membership?.price)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(app.appliedAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-zinc-600">
        <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
        Statistics update automatically whenever this page loads - no hardcoded numbers.
      </p>
    </div>
  );
}
