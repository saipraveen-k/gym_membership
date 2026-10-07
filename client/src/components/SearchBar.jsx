import { Search, X } from 'lucide-react';

/**
 * Search input with icon and clear button.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
}) {
  return (
    <div className="relative w-full">
      <label htmlFor="search-input" className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
