import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useGlobalSearch } from '@/features/search/hooks/useGlobalSearch';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useGlobalSearch(effectiveHostelId, debouncedQuery);
  const results = data?.data?.results ?? [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const grouped = results.reduce((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const handleSelect = (path) => {
    navigate(path);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative hidden max-w-sm flex-1 sm:block" ref={containerRef}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        disabled={!effectiveHostelId}
        placeholder={effectiveHostelId ? 'Search anything…' : 'Select a hostel to search'}
        className="w-full rounded-control border border-border bg-canvas py-2 pl-9 pr-8 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-brand-500 disabled:cursor-not-allowed"
      />
      {isFetching && (
        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-subtle" />
      )}

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-96 overflow-y-auto rounded-control border border-border bg-surface py-1 shadow-popover">
          {!isFetching && results.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-ink-muted">No results for "{debouncedQuery}"</p>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="border-b border-border py-1 last:border-0">
              <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-subtle">{category}</p>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  className="flex w-full flex-col items-start px-3 py-1.5 text-left hover:bg-canvas"
                >
                  <span className="text-sm text-ink">{item.title}</span>
                  <span className="text-xs text-ink-subtle">{item.subtitle}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}