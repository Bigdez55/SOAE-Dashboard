import React, { useState, useId } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Data Table Component
 * Responsive table that transforms to cards on mobile
 *
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {string} props.columns[].key - Data key
 * @param {string} props.columns[].label - Column header
 * @param {string} [props.columns[].align] - Text alignment: 'left', 'right', 'center'
 * @param {Function} [props.columns[].render] - Custom render function
 * @param {string} [props.columns[].className] - Additional cell classes
 * @param {boolean} [props.columns[].hideOnMobile] - Hide column on mobile
 * @param {Array} props.data - Data rows
 * @param {number} [props.maxRows=20] - Maximum rows before "Show all"
 * @param {string} [props.emptyMessage='No data to display'] - Empty state message
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.ariaLabel] - Table aria-label
 */
export function DataTable({
  columns,
  data = [],
  maxRows = 20,
  emptyMessage = 'No data to display',
  className = '',
  ariaLabel = 'Data table'
}) {
  const [showAll, setShowAll] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const tableId = useId();

  const safeData = data || [];

  // Sorting
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return safeData;

    return [...safeData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [safeData, sortColumn, sortDirection]);

  const displayData = showAll ? sortedData : sortedData.slice(0, maxRows);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  if (safeData.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-4 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table
          id={tableId}
          aria-label={ariaLabel}
          className="w-full text-sm"
        >
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`
                    px-3 py-3 text-left font-medium text-gray-600
                    ${col.align === 'right' ? 'text-right' : ''}
                    ${col.align === 'center' ? 'text-center' : ''}
                    ${col.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                  `}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  aria-sort={
                    sortColumn === col.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortColumn === col.key && (
                      sortDirection === 'asc'
                        ? <ChevronUp size={14} aria-hidden="true" />
                        : <ChevronDown size={14} aria-hidden="true" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      px-3 py-2.5
                      ${col.align === 'right' ? 'text-right' : ''}
                      ${col.align === 'center' ? 'text-center' : ''}
                      ${col.className || ''}
                    `}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '-')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {displayData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white border rounded-lg p-3 shadow-sm"
          >
            {columns
              .filter(col => !col.hideOnMobile)
              .map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={`
                    flex justify-between py-1.5
                    ${colIndex > 0 ? 'border-t border-gray-100' : ''}
                  `}
                >
                  <span className="text-gray-500 text-xs font-medium">
                    {col.label}
                  </span>
                  <span className={`text-sm font-medium text-right ${col.className || ''}`}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '-')
                    }
                  </span>
                </div>
              ))
            }
          </div>
        ))}
      </div>

      {/* Show more/less button */}
      {safeData.length > maxRows && (
        <button
          onClick={() => setShowAll(prev => !prev)}
          className="
            mt-3 text-primary-600 text-sm
            hover:underline focus-ring rounded
            px-2 py-1
          "
          aria-expanded={showAll}
        >
          {showAll
            ? 'Show less'
            : `Show all ${safeData.length} items`
          }
        </button>
      )}
    </div>
  );
}

export default DataTable;
