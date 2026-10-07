/**
 * Responsive data table.
 * columns: [{ key, label, render?, className? }]
 * rows: array of objects (each row must have a stable _id or id)
 * On small screens the table scrolls horizontally.
 */
export default function DataTable({ columns, rows, keyField = '_id', emptyMessage = 'No records found.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="card px-6 py-10 text-center text-sm text-zinc-400">{emptyMessage}</div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField] ?? row.id}
                className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-900/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-zinc-300 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
