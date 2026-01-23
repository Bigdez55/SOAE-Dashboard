import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardData, refreshData, loadCsvFiles } from '../services/dataService';

/**
 * Custom hook for loading and managing dashboard data
 * @returns {Object} Data state and utilities
 */
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [dataSource, setDataSource] = useState('No data loaded');
  const lastFilesRef = useRef(null);

  /**
   * Load data from service
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDashboardData();
      setData(result);
      setLastRefresh(new Date());
      setDataSource('No data loaded');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (lastFilesRef.current) {
        const { data: csvData } = await loadCsvFiles(lastFilesRef.current);
        setData(csvData);
        setLastRefresh(new Date());
        setDataSource(`CSV (${lastFilesRef.current.length} file${lastFilesRef.current.length === 1 ? '' : 's'})`);
      } else {
        const result = await refreshData();
        setData(result);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load data from CSV files
   * @param {File[]|FileList} files
   * @returns {Promise<{warnings: string[]}>}
   */
  const loadFromFiles = useCallback(async (files) => {
    setLoading(true);
    setError(null);

    try {
      const fileList = Array.from(files || []);
      lastFilesRef.current = fileList;
      const { data: csvData, warnings } = await loadCsvFiles(fileList);
      setData(csvData);
      setLastRefresh(new Date());
      setDataSource(`CSV (${fileList.length} file${fileList.length === 1 ? '' : 's'})`);
      return { warnings };
    } catch (err) {
      console.error('Failed to load CSV data:', err);
      setError(err.message || 'Failed to load CSV data');
      return { warnings: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    dataSource,
    refresh,
    reload: loadData,
    loadFromFiles
  };
}

export default useDashboardData;
