import React, { useState, useCallback } from 'react';
import {
  Activity, FileText, DollarSign, Database, Zap,
  AlertOctagon, BarChart2, TrendingUp, Shield, Download
} from 'lucide-react';

// Hooks
import { useDashboardData } from './hooks/useDashboardData';
import { useFilters } from './hooks/useFilters';

// Layout components
import { Header, Navigation, MobileNav, Container, FilterPanel } from './components/layout';

// Tab components
import {
  ExecutiveTab,
  SOAETab,
  LDBreakdownTab,
  SourcesTab,
  DispatchTab,
  ActionQueuesTab,
  IntelligenceTab,
  TrendsTab,
  DataQualityTab,
  ExportTab
} from './components/tabs';

/**
 * Tab definitions with icons and labels
 */
const TABS = [
  { id: 'executive', label: 'Executive', shortLabel: 'Exec', icon: Activity },
  { id: 'soae', label: 'SOAE', shortLabel: 'SOAE', icon: FileText },
  { id: 'ld', label: 'LD Breakdown', shortLabel: 'LD', icon: DollarSign },
  { id: 'sources', label: 'Sources', shortLabel: 'Sources', icon: Database },
  { id: 'dispatch', label: 'Dispatch', shortLabel: 'Dispatch', icon: Zap },
  { id: 'queues', label: 'Action Queues', shortLabel: 'Queues', icon: AlertOctagon },
  { id: 'intel', label: 'Intelligence', shortLabel: 'Intel', icon: BarChart2 },
  { id: 'trends', label: 'Trends', shortLabel: 'Trends', icon: TrendingUp },
  { id: 'quality', label: 'Data Quality', shortLabel: 'Quality', icon: Shield },
  { id: 'export', label: 'Export', shortLabel: 'Export', icon: Download }
];

/**
 * Main App Component
 */
function App() {
  // Data loading
  const { data, loading, error, lastRefresh, refresh, dataSource, loadFromFiles } = useDashboardData();

  // Filter management
  const {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filteredData
  } = useFilters(data);

  // Active tab state
  const [activeTab, setActiveTab] = useState('executive');
  const [loadWarnings, setLoadWarnings] = useState([]);

  // Handle tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    // Scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCsvLoad = useCallback(async (files) => {
    const result = await loadFromFiles(files);
    setLoadWarnings(result?.warnings || []);
  }, [loadFromFiles]);

  // Get filter options from data
  const filterOptions = {
    months: data?.filters?.months || [],
    dates: data?.filters?.dates || [],
    eventTypes: data?.filters?.eventTypes || [],
    sources: data?.filters?.sources || []
  };

  // Render tab content
  const renderTabContent = () => {
    const props = {
      data: filteredData,
      stats: filteredData.stats,
      config: data?.config,
      filters,
      trends: data?.trends
    };

    switch (activeTab) {
      case 'executive':
        return <ExecutiveTab {...props} />;
      case 'soae':
        return <SOAETab {...props} />;
      case 'ld':
        return <LDBreakdownTab {...props} />;
      case 'sources':
        return <SourcesTab {...props} />;
      case 'dispatch':
        return <DispatchTab {...props} />;
      case 'queues':
        return <ActionQueuesTab {...props} />;
      case 'intel':
        return <IntelligenceTab {...props} />;
      case 'trends':
        return <TrendsTab {...props} />;
      case 'quality':
        return <DataQualityTab {...props} />;
      case 'export':
        return <ExportTab {...props} />;
      default:
        return <ExecutiveTab {...props} />;
    }
  };

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertOctagon size={24} className="text-danger-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus-ring"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header
        lastRefresh={lastRefresh}
        onRefresh={refresh}
        loading={loading}
        onLoadCsv={handleCsvLoad}
        dataSourceLabel={dataSource}
      />

      {/* Desktop Navigation */}
      <Navigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <main id="main-content" className="pb-20 md:pb-8">
        <Container className="py-4">
          {loadWarnings.length > 0 && (
            <div className="mb-4 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-700">
              {loadWarnings.join(' | ')}
            </div>
          )}
          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            filterOptions={filterOptions}
          />

          {/* Tab Content */}
          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {renderTabContent()}
          </div>
        </Container>
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        maxVisible={4}
      />
    </div>
  );
}

export default App;
