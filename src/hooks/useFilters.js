import { useState, useMemo, useCallback } from 'react';

/**
 * Default filter state
 */
const DEFAULT_FILTERS = {
  dateRange: 'all',      // 'all' | 'month' | 'day'
  selectedMonth: '',
  selectedDate: '',
  eventType: 'all',
  source: 'all',
  status: 'all',
  search: ''
};

/**
 * Custom hook for managing dashboard filters
 * @param {Object} data - Dashboard data object
 * @returns {Object} Filter state and utilities
 */
export function useFilters(data) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== 'all' ||
      filters.eventType !== 'all' ||
      filters.source !== 'all' ||
      filters.status !== 'all' ||
      filters.search !== ''
    );
  }, [filters]);

  /**
   * Helper: Check if record matches search query
   */
  const matchesSearch = useCallback((record, searchTerm) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();

    return (
      (record.id && record.id.toString().includes(s)) ||
      (record.vehicle && record.vehicle.toLowerCase().includes(s)) ||
      (record.run && record.run.toLowerCase().includes(s)) ||
      (record.route && record.route.toLowerCase().includes(s)) ||
      (record.eventType && record.eventType.toLowerCase().includes(s)) ||
      (record.driver && record.driver.toLowerCase().includes(s)) ||
      (record.category && record.category.toLowerCase().includes(s))
    );
  }, []);

  /**
   * Filter data based on current filter state
   */
  const filteredData = useMemo(() => {
    if (!data?.data) {
      return {
        soae: [],
        dispatch: [],
        incidents: [],
        accidents: [],
        downed: [],
        stats: {
          soaeTotal: 0,
          soaeOnTime: 0,
          soaeLateCount: 0,
          soaeOnTimePct: 0,
          ldFromLate: 0,
          missingTotal: 0,
          missingLateTotal: 0,
          needsReviewTotal: 0,
          ldFromMissing: 0
        }
      };
    }

    let soae = [...(data.data.soae || [])];
    let dispatch = [...(data.data.dispatch || [])];
    let incidents = [...(data.data.incidents || [])];
    let accidents = [...(data.data.accidents || [])];
    let downed = [...(data.data.downed || [])];

    // Date filter
    if (filters.dateRange === 'month' && filters.selectedMonth) {
      soae = soae.filter(r => r.yearMonth === filters.selectedMonth);
      dispatch = dispatch.filter(r => r.yearMonth === filters.selectedMonth);
      incidents = incidents.filter(r => r.yearMonth === filters.selectedMonth);
      accidents = accidents.filter(r => r.yearMonth === filters.selectedMonth);
      downed = downed.filter(r => r.yearMonth === filters.selectedMonth);
    } else if (filters.dateRange === 'day' && filters.selectedDate) {
      soae = soae.filter(r => r.date === filters.selectedDate);
      dispatch = dispatch.filter(r => r.date === filters.selectedDate);
      incidents = incidents.filter(r => r.date === filters.selectedDate);
      accidents = accidents.filter(r => r.date === filters.selectedDate);
      downed = downed.filter(r => r.date === filters.selectedDate);
    }

    // Event type filter
    if (filters.eventType !== 'all') {
      soae = soae.filter(r => r.eventType === filters.eventType);
    }

    // Source filter
    if (filters.source !== 'all') {
      const sourceMap = {
        soae: () => { dispatch = []; incidents = []; accidents = []; downed = []; },
        dispatch: () => { soae = []; incidents = []; accidents = []; downed = []; },
        incidents: () => { soae = []; dispatch = []; accidents = []; downed = []; },
        accidents: () => { soae = []; dispatch = []; incidents = []; downed = []; },
        downed: () => { soae = []; dispatch = []; incidents = []; accidents = []; }
      };
      sourceMap[filters.source]?.();
    }

    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'late':
          soae = soae.filter(r => r.timeliness === 'Late');
          break;
        case 'ontime':
          soae = soae.filter(r => r.timeliness === 'On time');
          break;
        case 'missing':
          dispatch = dispatch.filter(r => r.missing);
          incidents = incidents.filter(r => r.missing);
          accidents = accidents.filter(r => r.missing);
          downed = downed.filter(r => r.missing);
          break;
        case 'missingLate':
          soae = [];
          dispatch = dispatch.filter(r => r.missing && r.daysOverdue > 0);
          incidents = incidents.filter(r => r.missing && r.daysOverdue > 0);
          accidents = accidents.filter(r => r.missing && r.daysOverdue > 0);
          downed = downed.filter(r => r.missing && r.daysOverdue > 0);
          break;
        case 'needsReview':
          soae = [];
          dispatch = dispatch.filter(r => r.needsReview);
          incidents = [];
          accidents = [];
          downed = [];
          break;
        case 'resolved':
          dispatch = dispatch.filter(r => !r.missing);
          incidents = incidents.filter(r => !r.missing);
          accidents = accidents.filter(r => !r.missing);
          downed = downed.filter(r => !r.missing);
          break;
      }
    }

    // Search filter
    if (filters.search) {
      soae = soae.filter(r => matchesSearch(r, filters.search));
      dispatch = dispatch.filter(r => matchesSearch(r, filters.search));
      incidents = incidents.filter(r => matchesSearch(r, filters.search));
      accidents = accidents.filter(r => matchesSearch(r, filters.search));
      downed = downed.filter(r => matchesSearch(r, filters.search));
    }

    // Calculate stats
    const soaeOnTime = soae.filter(r => r.timeliness === 'On time').length;
    const soaeLate = soae.filter(r => r.timeliness === 'Late');
    const missingDispatch = dispatch.filter(r => r.missing);
    const missingIncidents = incidents.filter(r => r.missing);
    const missingAccidents = accidents.filter(r => r.missing);
    const missingDowned = downed.filter(r => r.missing);

    const missingLateTotal = [
      ...missingDispatch,
      ...missingIncidents,
      ...missingAccidents,
      ...missingDowned
    ].filter(r => r.daysOverdue > 0).length;

    const ldFromLate = soaeLate.reduce((sum, r) => sum + (r.ld || 0), 0);
    const ldFromMissing = [
      ...missingDispatch,
      ...missingIncidents,
      ...missingAccidents,
      ...missingDowned
    ].reduce((sum, r) => sum + (r.ld || 0), 0);

    return {
      soae,
      dispatch,
      incidents,
      accidents,
      downed,
      stats: {
        soaeTotal: soae.length,
        soaeOnTime,
        soaeLateCount: soaeLate.length,
        soaeOnTimePct: soae.length > 0 ? (soaeOnTime / soae.length * 100) : 0,
        ldFromLate,
        missingTotal: missingDispatch.length + missingIncidents.length + missingAccidents.length + missingDowned.length,
        missingLateTotal,
        needsReviewTotal: dispatch.filter(r => r.needsReview).length,
        ldFromMissing,
        soaeLateItems: soaeLate,
        missingDispatch,
        missingIncidents,
        missingAccidents,
        missingDowned
      }
    };
  }, [data, filters, matchesSearch]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filteredData
  };
}

export default useFilters;
