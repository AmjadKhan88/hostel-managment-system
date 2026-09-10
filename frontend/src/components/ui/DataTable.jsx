import EmptyState from './EmptyState.jsx';
import Pagination from './Pagination.jsx';

/**
 * Generic server-driven data table. `columns` is
 * [{ key, header, render?(row) }]. Data, loading, and pagination are all
 * owned by the caller (via TanStack Query) — this component only renders.
 */
export default function DataTable({
  columns,
  rows,
  isLoading,
  isError,
  error,
  emptyTitle = 'No results',
  emptyDescription,
  pagination,
  onPageChange,
  rowKey = (row) => row._id,
}) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-canvas/60">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-ink-muted">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-canvas" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-ink">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && isError && (
        <EmptyState
          title="Couldn't load data"
          description={error?.message ?? 'Something went wrong. Please try again.'}
        />
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {!isLoading && !isError && rows.length > 0 && pagination && (
        <Pagination {...pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}