const CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹4,999 */
export const formatCurrency = (value) => CURRENCY.format(Number(value) || 0);

/** 2026-10-07 -> 7 Oct 2026 */
export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** 2026-10-07 14:32 */
export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Human duration: 3 months / 14 days */
export const formatDuration = (duration, unit) => {
  if (!duration) return '—';
  const singular = { days: 'day', weeks: 'week', months: 'month', years: 'year' };
  const base = singular[unit] || unit || 'month';
  return `${duration} ${Number(duration) === 1 ? base : `${base}s`}`;
};

/** Price per month approximation for cards */
export const perMonthPrice = (price, duration, unit) => {
  if (!price || !duration) return null;
  const monthFactor = { days: 30, weeks: 4.33, months: 1, years: 12 };
  const months = (duration * (monthFactor[unit] || 1)) || 1;
  return Math.round(price / months);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';
