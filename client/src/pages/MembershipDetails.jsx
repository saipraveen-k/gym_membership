import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Tag, Wallet } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ApplyMembershipModal from '../components/ApplyMembershipModal.jsx';
import { getMembershipById } from '../services/membershipService.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDuration, perMonthPrice } from '../utils/format.js';

export default function MembershipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApply, setShowApply] = useState(false);

  useDocumentTitle(membership?.name || 'Membership');

  const fetchMembership = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMembershipById(id);
      setMembership(res.data);
    } catch (err) {
      setError(
        err.status === 404
          ? 'This membership does not exist or is no longer available.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApplyClick = () => {
    if (!user) {
      showToast('Please login to apply for this membership', 'info');
      navigate('/login', { state: { from: `/memberships/${id}` } });
      return;
    }
    setShowApply(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] justify-center py-24">
        <LoadingSpinner label="Loading membership..." />
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Membership unavailable" message={error} onRetry={fetchMembership} />
        <div className="mt-6 text-center">
          <Link to="/memberships" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to memberships
          </Link>
        </div>
      </div>
    );
  }

  const monthly = perMonthPrice(membership.price, membership.duration, membership.durationUnit);

  return (
    <div className="container-page py-10 lg:py-14">
      <Link
        to="/memberships"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-accent-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All memberships
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-zinc-800 text-zinc-300 ring-1 ring-inset ring-zinc-700">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {membership.category}
            </span>
            <StatusBadge status="active" />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {membership.name}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            {membership.description}
          </p>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-white">What's included</h2>
            {membership.features?.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {membership.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">
                No additional features are listed for this plan.
              </p>
            )}
          </div>
        </div>

        {/* Price card */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Membership price
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white">
                {formatCurrency(membership.price)}
              </span>
              <span className="pb-1 text-sm text-zinc-500">
                / {formatDuration(membership.duration, membership.durationUnit)}
              </span>
            </div>
            {monthly && (
              <p className="mt-1 text-xs text-zinc-500">
                Approx. {formatCurrency(monthly)} per month
              </p>
            )}

            <dl className="mt-5 space-y-3 border-t border-zinc-800 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-zinc-400">
                  <Clock className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  Duration
                </dt>
                <dd className="font-semibold text-white">
                  {formatDuration(membership.duration, membership.durationUnit)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-zinc-400">
                  <Tag className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  Category
                </dt>
                <dd className="font-semibold text-white">{membership.category}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-zinc-400">
                  <Wallet className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  Payment
                </dt>
                <dd className="font-semibold text-white">Manual / at gym</dd>
              </div>
            </dl>

            {user ? (
              <button type="button" onClick={handleApplyClick} className="btn-primary mt-6 w-full !py-3">
                Apply Now
              </button>
            ) : (
              <button type="button" onClick={handleApplyClick} className="btn-primary mt-6 w-full !py-3">
                Login to apply
              </button>
            )}

            <p className="mt-3 text-center text-xs text-zinc-500">
              {user
                ? 'You can track your application in My Memberships.'
                : 'You will be redirected to the login page.'}
            </p>
          </div>
        </aside>
      </div>

      <ApplyMembershipModal
        membership={membership}
        open={showApply}
        onClose={() => setShowApply(false)}
      />
    </div>
  );
}
