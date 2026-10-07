import { SlidersHorizontal } from 'lucide-react';

/**
 * Membership filter panel: category, price range, duration, sorting.
 */
export default function FilterPanel({ filters, onChange, categories = [], durations = [] }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const selectClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30';

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <SlidersHorizontal className="h-4 w-4 text-accent-500" aria-hidden="true" />
          Filters
        </h2>
        <button
          type="button"
          onClick={() =>
            onChange({
              search: filters.search,
              category: 'all',
              minPrice: '',
              maxPrice: '',
              duration: 'all',
              sort: 'newest',
            })
          }
          className="text-xs font-medium text-accent-400 transition hover:text-accent-300"
        >
          Reset all
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="filter-category" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => set('category')(e.target.value)}
            className={selectClass}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-min-price" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Min price (₹)
          </label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => set('minPrice')(e.target.value)}
            placeholder="e.g. 500"
            className={selectClass}
          />
        </div>

        <div>
          <label htmlFor="filter-max-price" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Max price (₹)
          </label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => set('maxPrice')(e.target.value)}
            placeholder="e.g. 10000"
            className={selectClass}
          />
        </div>

        <div>
          <label htmlFor="filter-duration" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Duration
          </label>
          <select
            id="filter-duration"
            value={filters.duration}
            onChange={(e) => set('duration')(e.target.value)}
            className={selectClass}
          >
            <option value="all">Any duration</option>
            {durations.map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? 'month' : 'months'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="filter-sort" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Sort by
        </label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => set('sort')(e.target.value)}
          className={selectClass}
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}
