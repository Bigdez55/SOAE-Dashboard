import React, { useState } from 'react';
import { Filter, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getMonthName } from '../../utils/formatters';

/**
 * Filter Panel Component
 * Responsive filter controls for dashboard
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.updateFilter - Filter update callback
 * @param {Function} props.resetFilters - Reset filters callback
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {Object} props.filterOptions - Available filter options
 */
export function FilterPanel({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  filterOptions = {}
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    months = [],
    dates = [],
    eventTypes = [],
    sources = []
  } = filterOptions;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-4">
      {/* Header - Always visible */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" aria-hidden="true" />
            <span className="font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 focus-ring rounded px-2 py-1"
              >
                Clear all
              </button>
            )}

            {/* Mobile expand toggle */}
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg focus-ring"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              {isExpanded ? (
                <ChevronUp size={18} aria-hidden="true" />
              ) : (
                <ChevronDown size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Search - Always visible */}
        <div className="mt-3">
          <label htmlFor="search-filter" className="sr-only">
            Search
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="search-filter"
              type="text"
              placeholder="Search ID, vehicle, run, route, driver..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="
                w-full pl-9 pr-9 py-2
                border rounded-lg
                text-sm
                focus-ring
                placeholder:text-gray-400
              "
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                aria-label="Clear search"
              >
                <X size={14} className="text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Grid - Collapsible on mobile */}
      <div
        className={`
          border-t px-3 sm:px-4 pb-3 sm:pb-4
          ${isExpanded ? 'block' : 'hidden md:block'}
        `}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 sm:pt-4">
          {/* Date Range */}
          <div>
            <label
              htmlFor="date-range"
              className="block text-xs text-gray-500 mb-1"
            >
              Date Range
            </label>
            <select
              id="date-range"
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All Time</option>
              <option value="month">By Month</option>
              <option value="day">By Day</option>
            </select>
          </div>

          {/* Month Selector */}
          {filters.dateRange === 'month' && months.length > 0 && (
            <div>
              <label
                htmlFor="month-select"
                className="block text-xs text-gray-500 mb-1"
              >
                Month
              </label>
              <select
                id="month-select"
                value={filters.selectedMonth}
                onChange={(e) => updateFilter('selectedMonth', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus-ring"
              >
                <option value="">Select...</option>
                {months.map(m => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Selector */}
          {filters.dateRange === 'day' && dates.length > 0 && (
            <div>
              <label
                htmlFor="date-select"
                className="block text-xs text-gray-500 mb-1"
              >
                Date
              </label>
              <select
                id="date-select"
                value={filters.selectedDate}
                onChange={(e) => updateFilter('selectedDate', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus-ring"
              >
                <option value="">Select...</option>
                {dates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Event Type */}
          {eventTypes.length > 0 && (
            <div>
              <label
                htmlFor="event-type"
                className="block text-xs text-gray-500 mb-1"
              >
                Event Type
              </label>
              <select
                id="event-type"
                value={filters.eventType}
                onChange={(e) => updateFilter('eventType', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus-ring"
              >
                <option value="all">All Types</option>
                {eventTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Source */}
          <div>
            <label
              htmlFor="source"
              className="block text-xs text-gray-500 mb-1"
            >
              Source
            </label>
            <select
              id="source"
              value={filters.source}
              onChange={(e) => updateFilter('source', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All Sources</option>
              <option value="soae">SOAE</option>
              <option value="dispatch">Dispatch</option>
              <option value="downed">Downed List</option>
              <option value="incidents">Safety Incidents</option>
              <option value="accidents">Safety Accidents</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-xs text-gray-500 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All Status</option>
              <option value="ontime">On Time</option>
              <option value="late">Late</option>
              <option value="missing">Missing</option>
              <option value="missingLate">Missing Late</option>
              <option value="needsReview">Needs Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
