import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, FileStack } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getMyApplications } from '../services/applicationService.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { formatCurrency, formatDate, formatDuration } from '../utils/format.js';

const STATUS_EXPLANATION = {
  pending: 'Waiting for admin approval.',
  approved: 'Approved - waiting to be activated.',
  active: 'Your membership is active.',
  rejected: 'This application was rejected by the admin.',
  expired: 'This membership period has ended.',
};

export default function MyMemberships() {
  useDocumentTitle('My Memberships');

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

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
            My Applications
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Memberships
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Every membership application you have submitted, with its current status.
          </p>
        </div>
        <Link to="/memberships" className="btn-primary">
          Apply for a new membership
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner label="Loading your applications..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load your applications"
            message={error}
            onRetry={fetchApplications}
          />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            message="You haven't applied for any membership. Choose a package and submit your first application."
            icon={FileStack}
            action={
              <Link to="/memberships" className="btn-primary mt-2">
                Browse memberships
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {applications.map((app) => (
              <article key={app._id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {app.membership?.name || 'Membership no longer available'}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      Applied on {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={app.status} />
                    <StatusBadge status={app.paymentStatus} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500">Price</p>
                    <p className="mt-0.5 font-bold text-white">
                      {formatCurrency(app.membership?.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Duration</p>
                    <p className="mt-0.5 font-bold text-white">
                      {formatDuration(app.membership?.duration, app.membership?.durationUnit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Start date</p>
                    <p className="mt-0.5 font-semibold text-zinc-200">
                      {formatDate(app.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">End date</p>
                    <p className="mt-0.5 font-semibold text-zinc-200">
                      {formatDate(app.endDate)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex items-start gap-2 text-xs text-zinc-400">
                  <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
                  {STATUS_EXPLANATION[app.status] || 'Application submitted.'}
                </p>

                {app.status === 'pending' && app.membership?.features?.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-accent-400">
                      View plan features
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                      {app.membership.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
