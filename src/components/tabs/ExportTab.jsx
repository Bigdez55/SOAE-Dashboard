import React, { useState } from 'react';
import { Download, FileText, Table, Code, CheckCircle, Loader } from 'lucide-react';
import { SectionHeader, StatusBadge } from '../common';
import { Card, Grid } from '../layout';
import { formatNum } from '../../utils/formatters';

/**
 * Export Tab Component
 * Data export functionality
 */
export function ExportTab({ data, stats, filters }) {
  const [exporting, setExporting] = useState(null);
  const [exported, setExported] = useState([]);

  const soaeData = data?.soae || [];
  const dispatchData = data?.dispatch || [];
  const incidentsData = data?.incidents || [];
  const accidentsData = data?.accidents || [];
  const downedData = data?.downed || [];

  const exportOptions = [
    {
      id: 'soae-csv',
      name: 'SOAE Records',
      format: 'CSV',
      icon: Table,
      description: 'All SOAE submissions with timeliness data',
      count: soaeData.length,
      getData: () => soaeData
    },
    {
      id: 'missing-csv',
      name: 'Missing SOAE',
      format: 'CSV',
      icon: Table,
      description: 'Events missing SOAE across all sources',
      count: (stats?.missingTotal || 0),
      getData: () => [
        ...dispatchData.filter(r => r.missing).map(r => ({ ...r, source: 'Dispatch' })),
        ...incidentsData.filter(r => r.missing).map(r => ({ ...r, source: 'Incidents' })),
        ...accidentsData.filter(r => r.missing).map(r => ({ ...r, source: 'Accidents' })),
        ...downedData.filter(r => r.missing).map(r => ({ ...r, source: 'Downed' }))
      ]
    },
    {
      id: 'late-csv',
      name: 'Late Submissions',
      format: 'CSV',
      icon: Table,
      description: 'SOAE submitted after 24-hour deadline',
      count: stats?.soaeLateCount || 0,
      getData: () => soaeData.filter(r => r.timeliness === 'Late')
    },
    {
      id: 'summary-json',
      name: 'Summary Report',
      format: 'JSON',
      icon: Code,
      description: 'Complete dashboard metrics and stats',
      count: null,
      getData: () => ({
        generated: new Date().toISOString(),
        filters,
        stats,
        metrics: {
          soae: {
            total: soaeData.length,
            onTime: stats?.soaeOnTime || 0,
            late: stats?.soaeLateCount || 0,
            onTimePct: stats?.soaeOnTimePct || 0
          },
          ld: {
            total: (stats?.ldFromLate || 0) + (stats?.ldFromMissing || 0),
            fromLate: stats?.ldFromLate || 0,
            fromMissing: stats?.ldFromMissing || 0
          },
          missing: {
            total: stats?.missingTotal || 0,
            dispatch: dispatchData.filter(r => r.missing).length,
            incidents: incidentsData.filter(r => r.missing).length,
            accidents: accidentsData.filter(r => r.missing).length,
            downed: downedData.filter(r => r.missing).length
          }
        }
      })
    },
    {
      id: 'all-json',
      name: 'Full Dataset',
      format: 'JSON',
      icon: Code,
      description: 'All data for external analysis',
      count: soaeData.length + dispatchData.length + incidentsData.length + accidentsData.length + downedData.length,
      getData: () => ({
        generated: new Date().toISOString(),
        soae: soaeData,
        dispatch: dispatchData,
        incidents: incidentsData,
        accidents: accidentsData,
        downed: downedData
      })
    }
  ];

  const handleExport = async (option) => {
    setExporting(option.id);

    try {
      const data = option.getData();
      let content, filename, mimeType;

      if (option.format === 'CSV') {
        content = convertToCSV(data);
        filename = `${option.id.replace('-csv', '')}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(data, null, 2);
        filename = `${option.id.replace('-json', '')}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExported(prev => [...prev, option.id]);

      // Clear exported state after 3 seconds
      setTimeout(() => {
        setExported(prev => prev.filter(id => id !== option.id));
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <SectionHeader
          title="Export Data"
          subtitle="Download dashboard data for external analysis"
          icon={Download}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isExporting = exporting === option.id;
            const isExported = exported.includes(option.id);

            return (
              <div
                key={option.id}
                className="border rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={20} className="text-gray-500" />
                    <span className="font-medium">{option.name}</span>
                  </div>
                  <StatusBadge
                    status={option.format === 'CSV' ? 'info' : 'neutral'}
                    text={option.format}
                    size="xs"
                  />
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  {option.description}
                </p>

                {option.count !== null && (
                  <p className="text-xs text-gray-400 mb-3">
                    {formatNum(option.count)} records
                  </p>
                )}

                <button
                  onClick={() => handleExport(option)}
                  disabled={isExporting || (option.count !== null && option.count === 0)}
                  className={`
                    w-full flex items-center justify-center gap-2
                    px-4 py-2 rounded-lg
                    text-sm font-medium
                    transition-colors
                    focus-ring
                    ${isExported
                      ? 'bg-success-100 text-success-700'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isExporting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Exporting...
                    </>
                  ) : isExported ? (
                    <>
                      <CheckCircle size={16} />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download {option.format}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Export Notes */}
      <Card>
        <SectionHeader
          title="Export Notes"
          icon={FileText}
        />
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>CSV files</strong> can be opened in Excel, Google Sheets, or any spreadsheet application.
          </p>
          <p>
            <strong>JSON files</strong> are suitable for programmatic analysis, Power BI, or database import.
          </p>
          <p>
            All exports reflect the current filter selections. Clear filters to export all data.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Helper: Convert array of objects to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        let cell = row[header];
        if (cell === null || cell === undefined) cell = '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        cell = String(cell);
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

export default ExportTab;
