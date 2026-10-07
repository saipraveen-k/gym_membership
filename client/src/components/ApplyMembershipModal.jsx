import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { applyForMembership } from '../services/applicationService.js';
import { formatCurrency, formatDuration } from '../utils/format.js';

/**
 * Confirmation modal for applying to a membership.
 * Shows membership, duration, price and features, then POSTs the application.
 */
export default function ApplyMembershipModal({ membership, open, onClose, onSuccess }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!membership) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await applyForMembership(membership._id);
      showToast(res.message || 'Membership application submitted successfully.', 'success');
      onClose?.();
      onSuccess?.(res.data);
      navigate('/my-memberships');
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm your application"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{membership.name}</h3>
              <p className="mt-0.5 text-xs font-medium text-accent-400">
                {membership.category} plan
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-white">
                {formatCurrency(membership.price)}
              </p>
              <p className="text-xs text-zinc-500">
                / {formatDuration(membership.duration, membership.durationUnit)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{membership.description}</p>

          {membership.features?.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {membership.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-zinc-900/70 p-3 text-xs leading-relaxed text-zinc-400">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
          <p>
            Your application will be submitted with status <strong className="text-amber-400">Pending</strong>{' '}
            and payment <strong className="text-rose-400">Unpaid</strong>. The gym
            administrator will review and activate your membership.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={submitting}>
            Confirm Application
          </Button>
        </div>
      </div>
    </Modal>
  );
}
