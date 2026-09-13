export default function DateRangeFilter({ range, onChange }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-subtle">From</label>
        <input
          type="date"
          value={range.from ?? ''}
          onChange={(e) => onChange({ ...range, from: e.target.value || undefined })}
          className="rounded-control border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-subtle">To</label>
        <input
          type="date"
          value={range.to ?? ''}
          onChange={(e) => onChange({ ...range, to: e.target.value || undefined })}
          className="rounded-control border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      {(range.from || range.to) && (
        <button onClick={() => onChange({})} className="text-xs font-medium text-brand-600 hover:text-brand-700">
          Clear
        </button>
      )}
    </div>
  );
}