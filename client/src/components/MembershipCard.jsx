import { Link, useNavigate } from 'react-router-dom';
import { Check, Clock, Sparkles, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDuration, perMonthPrice } from '../utils/format.js';

/**
 * Membership package card.
 * "Apply Now" opens the confirmation modal (logged in) or redirects to login.
 */
export default function MembershipCard({ membership, onApply, highlighted = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    _id,
    name,
    description,
    price,
    duration,
    durationUnit,
    category,
    features = [],
  } = membership;

  const handleApply = () => {
    if (!user) {
      showToast('Please login to apply for a membership', 'info');
      navigate('/login', { state: { from: `/memberships/${_id}` } });
      return;
    }
    onApply?.(membership);
  };

  const monthly = perMonthPrice(price, duration, durationUnit);

  return (
    <article
      className={`card relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-zinc-700 ${
        highlighted ? 'border-accent-500/50 shadow-glow' : ''
      }`}
    >
      {highlighted && (
        <span className="absolute right-4 top-4 badge bg-accent-500/15 text-accent-400 ring-accent-500/30">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Popular
        </span>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="badge bg-zinc-800 text-zinc-300 ring-1 ring-inset ring-zinc-700">
            <Tag className="h-3 w-3" aria-hidden="true" />
            {category}
          </span>
          <span className="badge bg-zinc-800 text-zinc-400 ring-1 ring-inset ring-zinc-700">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatDuration(duration, durationUnit)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white">{name}</h3>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {formatCurrency(price)}
          </span>
          <span className="pb-1 text-sm text-zinc-500">
            / {formatDuration(duration, durationUnit)}
          </span>
        </div>
        {monthly && (
          <p className="mt-1 text-xs text-zinc-500">Approx. {formatCurrency(monthly)} per month</p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">{description}</p>

        <ul className="mt-5 flex-1 space-y-2">
          {features.slice(0, 5).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              {feature}
            </li>
          ))}
          {features.length === 0 && (
            <li className="text-sm text-zinc-500">No additional features listed.</li>
          )}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/memberships/${_id}`}
            className="btn-secondary flex-1"
            aria-label={`View details of ${name}`}
          >
            View Details
          </Link>
          <button type="button" onClick={handleApply} className="btn-primary flex-1">
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
}
