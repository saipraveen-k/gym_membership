import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, SearchX } from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import MembershipGrid from '../components/MembershipGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ApplyMembershipModal from '../components/ApplyMembershipModal.jsx';
import { getMemberships } from '../services/membershipService.js';
import useDebounce from '../hooks/useDebounce.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const DEFAULT_FILTERS = {
  search: '',
  category: 'all',
  minPrice: '',
  maxPrice: '',
  duration: 'all',
  sort: 'newest',
};

export default function Memberships() {
  useDocumentTitle('Memberships');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [memberships, setMemberships] = useState([]);
  const [meta, setMeta] = useState({ total: 0, categories: [], durations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMemberships({
        search: debouncedSearch,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        duration: filters.duration,
        sort: filters.sort,
      });
      setMemberships(res.data);
      setMeta(res.meta || { total: 0, categories: [], durations: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.category, filters.minPrice, filters.maxPrice, filters.duration, filters.sort]);

  const handleApply = (membership) => {
    if (!user) {
      showToast('Please login to apply for a membership', 'info');
      navigate('/login', { state: { from: `/memberships/${membership._id}` } });
      return;
    }
    setApplying(membership);
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.duration !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="container-page py-10 lg:py-14">
      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-500">
          Our Plans
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Gym Memberships
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Search and filter every membership package offered by the gym. Choose a plan and
          apply online - your application status will appear in your dashboard.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              value={filters.search}
              onChange={(value) => setFilters((f) => ({ ...f, search: value }))}
              placeholder="Search by name, feature or category..."
              label="Search memberships"
            />
          </div>
          <p className="text-sm text-zinc-500" aria-live="polite">
            {loading ? 'Searching...' : `${meta.total} plan${meta.total === 1 ? '' : 's'} found`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`}
          </p>
        </div>

        <FilterPanel
          filters={filters}
          onChange={setFilters}
          categories={meta.categories}
          durations={meta.durations}
        />
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner label="Loading memberships..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load memberships"
            message={`${error} Please try again.`}
            onRetry={fetchMemberships}
          />
        ) : memberships.length === 0 ? (
          <EmptyState
            title="No memberships found"
            message="Try adjusting your search or clearing the filters."
            icon={SearchX}
            action={
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="btn-secondary mt-2"
              >
                Clear search & filters
              </button>
            }
          />
        ) : (
          <MembershipGrid memberships={memberships} onApply={handleApply} />
        )}
      </div>

      {/* Empty database state helper */}
      {!loading && !error && memberships.length === 0 && meta.total === 0 && (
        <p className="mt-4 text-center text-xs text-zinc-600">
          If this is a fresh install, run <code className="text-zinc-400">npm run seed</code> in
          the server folder to add sample membership packages.
        </p>
      )}

      <ApplyMembershipModal
        membership={applying}
        open={Boolean(applying)}
        onClose={() => setApplying(null)}
      />
    </div>
  );
}
