import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import MembershipGrid from '../components/MembershipGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ApplyMembershipModal from '../components/ApplyMembershipModal.jsx';
import { getMemberships } from '../services/membershipService.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';

const WHY_US = [
  {
    icon: Dumbbell,
    title: 'Modern Equipment',
    text: 'Train with well-maintained cardio and strength equipment across dedicated zones.',
  },
  {
    icon: Users,
    title: 'Expert Trainers',
    text: 'Get guidance from certified trainers who help you train safely and stay consistent.',
  },
  {
    icon: CalendarDays,
    title: 'Flexible Plans',
    text: 'Choose from weekly, monthly and yearly packages that fit your schedule and budget.',
  },
  {
    icon: HeartPulse,
    title: 'Holistic Fitness',
    text: 'Group classes, nutrition guidance and recovery facilities under one roof.',
  },
];

const FEATURES = [
  { icon: Search, title: 'Search & Compare', text: 'Search membership packages by name, category, price and duration.' },
  { icon: ShieldCheck, title: 'Secure Login', text: 'Your account is protected with JWT authentication and hashed passwords.' },
  { icon: BadgeCheck, title: 'Simple Application', text: 'Apply for a membership online and track its approval status.' },
  { icon: Sparkles, title: 'Transparent Pricing', text: 'Every package lists its price, duration and inclusions clearly.' },
];

export default function Home() {
  useDocumentTitle('Home');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMemberships({ sort: 'newest' });
      setPlans(res.data.slice(0, 3));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleApply = (membership) => {
    if (!user) {
      showToast('Please login to apply for a membership', 'info');
      navigate('/login', { state: { from: `/memberships/${membership._id}` } });
      return;
    }
    setApplying(membership);
  };

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-zinc-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.18),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.55))] opacity-60"
        />

        <div className="container-page relative grid gap-10 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-fadeUp">
            <span className="badge bg-accent-500/15 text-accent-400 ring-1 ring-inset ring-accent-500/30">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Membership Application Portal
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              PUSH YOUR
              <br />
              <span className="text-accent-500">LIMITS.</span> EVERY DAY.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Browse gym membership packages, compare plans and apply online in minutes.
              Track your application status from your personal dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/memberships" className="btn-primary !px-7 !py-3.5 !text-base">
                Browse Memberships
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {!user && (
                <Link to="/register" className="btn-secondary !px-7 !py-3.5 !text-base">
                  Join Now
                </Link>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                Secure JWT authentication
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                Transparent package pricing
              </span>
            </div>
          </div>

          {/* Hero visual card stack */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="card rotate-[-3deg] p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Train. Recover. Repeat.</p>
                  <p className="text-xs text-zinc-500">Iron Peak training floor</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-2 w-full rounded-full bg-zinc-800" />
                <div className="h-2 w-4/5 rounded-full bg-zinc-800" />
                <div className="h-2 w-3/5 rounded-full bg-accent-500/60" />
              </div>
            </div>
            <div className="card absolute -bottom-8 -right-4 rotate-[4deg] p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Membership</p>
              <p className="mt-1 text-2xl font-extrabold text-white">Apply Online</p>
              <p className="mt-1 text-xs text-accent-400">Pending → Approved → Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ POPULAR MEMBERSHIPS ============ */}
      <section className="container-page py-16 lg:py-20" aria-labelledby="popular-heading">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
              Memberships
            </p>
            <h2 id="popular-heading" className="section-title mt-2">
              Popular packages
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Live packages fetched from the gym database. Search and filter all plans on
              the memberships page.
            </p>
          </div>
          <Link to="/memberships" className="btn-secondary">
            View all plans
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner label="Loading memberships..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load memberships"
            message={error}
            onRetry={fetchPlans}
          />
        ) : plans.length === 0 ? (
          <EmptyState
            title="No memberships found"
            message="Membership packages will appear here once the administrator adds them."
            icon={Dumbbell}
          />
        ) : (
          <MembershipGrid memberships={plans} onApply={handleApply} />
        )}
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="border-y border-zinc-900 bg-zinc-900/40" aria-labelledby="why-heading">
        <div className="container-page py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
              Why choose us
            </p>
            <h2 id="why-heading" className="section-title mt-2">
              Everything you need to stay consistent
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6 transition hover:border-zinc-700">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="container-page py-16 lg:py-20" aria-labelledby="features-heading">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
            Features
          </p>
          <h2 id="features-heading" className="section-title mt-2">
            Built for members and staff
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5">
              <Icon className="h-6 w-6 text-accent-500" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="container-page pb-20">
        <div className="card relative overflow-hidden p-8 text-center sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.16),transparent_65%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to start training?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
              Create your account, pick a membership package and submit your application.
              The admin team reviews every application.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/memberships" className="btn-primary !px-7 !py-3.5 !text-base">
                Find your plan
              </Link>
              {!user ? (
                <Link to="/register" className="btn-secondary !px-7 !py-3.5 !text-base">
                  Create free account
                </Link>
              ) : (
                <Link to="/dashboard" className="btn-secondary !px-7 !py-3.5 !text-base">
                  Go to dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <ApplyMembershipModal
        membership={applying}
        open={Boolean(applying)}
        onClose={() => setApplying(null)}
      />
    </>
  );
}
