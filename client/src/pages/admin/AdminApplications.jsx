import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, FileStack, XCircle } from 'lucide-react';
import SearchBar from '../../components/SearchBar.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import Button from '../../components/Button.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  getAllApplications,
  updateApplicationStatus,
  updatePaymentStatus,
} from '../../services/applicationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { formatCurrency, formatDate, formatDateTime, formatDuration } from '../../utils/format.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export default function AdminApplications() {
  useDocumentTitle('Manage Applications');
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [viewing, setViewing] = useState(null);
  const [actionId, setActionId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllApplications({
        search: debouncedSearch,
        status: statusFilter,
        paymentStatus: paymentFilter,
      });
      setApplications(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, paymentFilter]);

  const applyLocalUpdate = (updated) => {
    setApplications((list) =>
      list.map((app) => (app._id === updated._id ? updated : app))
    );
    setViewing((cur) => (cur && cur._id === updated._id ? updated : cur));
  };

  const changeStatus = async (app, status) => {
    setActionId(app._id);
    try {
      const res = await updateApplicationStatus(app._id, status);
      applyLocalUpdate(res.data);
      showToast(res.message, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionId(null);
    }
  };

  const changePayment = async (app, paymentStatus) => {
    setActionId(app._id);
    try {
      const res = await updatePaymentStatus(app._id, paymentStatus);
      applyLocalUpdate(res.data);
      showToast(res.message, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionId(null);
    }
  };

  /** Action buttons for a row, based on lifecycle rules. */
  const renderActions = (app) => {
    const busy = actionId === app._id;
    const buttons = [];

    if (app.status === 'pending') {
      buttons.push(
        <button
          key="approve"
          type="button"
          disabled={busy}
          onClick={() => changeStatus(app, 'approved')}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
          title="Approve application"
        >
          Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          type="button"
          disabled={busy}
          onClick={() => changeStatus(app, 'rejected')}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          title="Reject application"
        >
          Reject
        </button>
      );
    }

    if (app.status === 'approved') {
      buttons.push(
        <button
          key="activate"
          type="button"
          disabled={busy}
          onClick={() => changeStatus(app, 'active')}
          className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-400 transition hover:bg-sky-500/20 disabled:opacity-50"
          title="Activate membership (sets start and end dates)"
        >
          Activate
        </button>
      );
      buttons.push(
        <button
          key="reject"
          type="button"
          disabled={busy}
          onClick={() => changeStatus(app, 'rejected')}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          title="Reject application"
        >
          Reject
        </button>
      );
    }

    // Payment toggle (simulated payment)
    buttons.push(
      <button
        key="payment"
        type="button"
        disabled={busy}
        onClick={() => changePayment(app, app.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
          app.paymentStatus === 'paid'
            ? 'border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
        }`}
        title={app.paymentStatus === 'paid' ? 'Mark as unpaid' : 'Mark payment as paid'}
      >
        {app.paymentStatus === 'paid' ? 'Undo payment' : 'Mark paid'}
      </button>
    );

    return <div className="flex flex-wrap justify-end gap-2">{buttons}</div>;
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (app) => (
        <div>
          <p className="font-semibold text-white">{app.user?.name || 'Deleted user'}</p>
          <p className="text-xs text-zinc-500">{app.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'membership',
      label: 'Membership',
      render: (app) => (
        <div>
          <p className="font-medium text-zinc-200">
            {app.membership?.name || 'Deleted plan'}
          </p>
          <p className="text-xs text-zinc-500">
            {formatDuration(app.membership?.duration, app.membership?.durationUnit)}
          </p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (app) => (
        <span className="font-semibold text-white">
          {formatCurrency(app.membership?.price)}
        </span>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied',
      render: (app) => formatDate(app.appliedAt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (app) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={app.status} />
          <StatusBadge status={app.paymentStatus} />
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (app) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setViewing(app)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 transition hover:border-accent-500 hover:text-accent-400"
            aria-label="View application details"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {renderActions(app)}
        </div>
      ),
    },
  ];

  const counts = useMemo(
    () => ({
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      active: applications.filter((a) => a.status === 'active').length,
      paid: applications.filter((a) => a.paymentStatus === 'paid').length,
    }),
    [applications]
  );

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">Review</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
          Application Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Approve, reject, activate membership applications and track payments.
        </p>
      </div>

      {/* Quick counts */}
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="badge bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/30">
          {counts.pending} pending
        </span>
        <span className="badge bg-sky-500/15 text-sky-400 ring-1 ring-inset ring-sky-500/30">
          {counts.approved} approved
        </span>
        <span className="badge bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
          {counts.active} active
        </span>
        <span className="badge bg-zinc-500/15 text-zinc-300 ring-1 ring-inset ring-zinc-500/30">
          {counts.paid} paid
        </span>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by user, email or membership..."
            label="Search applications"
          />
        </div>
        <div className="flex gap-3">
          <div>
            <label htmlFor="app-status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="app-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="app-payment-filter" className="sr-only">
              Filter by payment status
            </label>
            <select
              id="app-payment-filter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            >
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner label="Loading applications..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchApplications} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications found"
            message="Applications submitted by members will appear here."
            icon={FileStack}
          />
        ) : (
          <DataTable columns={columns} rows={applications} />
        )}
      </div>

      {/* Details modal */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Application details"
        maxWidth="max-w-xl"
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div>
                <p className="text-xs text-zinc-500">Membership</p>
                <p className="mt-0.5 text-lg font-bold text-white">
                  {viewing.membership?.name || 'Deleted plan'}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatDuration(viewing.membership?.duration, viewing.membership?.durationUnit)}{' '}
                  · {formatCurrency(viewing.membership?.price)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={viewing.status} />
                <StatusBadge status={viewing.paymentStatus} />
              </div>
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Applicant</p>
                <p className="mt-0.5 font-semibold text-white">{viewing.user?.name}</p>
                <p className="break-all text-xs text-zinc-500">{viewing.user?.email}</p>
                <p className="text-xs text-zinc-500">{viewing.user?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Dates</p>
                <p className="mt-0.5 text-zinc-300">
                  Applied: {formatDateTime(viewing.appliedAt)}
                </p>
                <p className="text-zinc-300">Start: {formatDate(viewing.startDate)}</p>
                <p className="text-zinc-300">End: {formatDate(viewing.endDate)}</p>
              </div>
            </div>

            {viewing.membership?.features?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Plan features
                </p>
                <ul className="mt-2 grid gap-1.5 text-sm text-zinc-300 sm:grid-cols-2">
                  {viewing.membership.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-800 pt-4">
              {viewing.status === 'pending' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => changeStatus(viewing, 'rejected')}
                    loading={actionId === viewing._id}
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => changeStatus(viewing, 'approved')}
                    loading={actionId === viewing._id}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Approve
                  </Button>
                </>
              )}
              {viewing.status === 'approved' && (
                <Button
                  onClick={() => changeStatus(viewing, 'active')}
                  loading={actionId === viewing._id}
                >
                  Activate membership
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() =>
                  changePayment(
                    viewing,
                    viewing.paymentStatus === 'paid' ? 'unpaid' : 'paid'
                  )
                }
                loading={actionId === viewing._id}
              >
                {viewing.paymentStatus === 'paid' ? 'Mark as unpaid' : 'Mark payment as paid'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
