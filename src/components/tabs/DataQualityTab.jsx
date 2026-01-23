import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Database, FileText } from 'lucide-react';
import { KPICard, SectionHeader, MetricRow, MetricGroup, DataTable, StatusBadge } from '../common';
import { Card, Grid } from '../layout';
import { formatPct, formatNum } from '../../utils/formatters';

/**
 * Data Quality Tab Component
 * Data completeness and quality analysis
 */
export function DataQualityTab({ data, stats }) {
  const soaeData = data?.soae || [];
  const dispatchData = data?.dispatch || [];
  const incidentsData = data?.incidents || [];
  const accidentsData = data?.accidents || [];
  const downedData = data?.downed || [];

  // Field completeness analysis for SOAE
  const soaeFields = ['id', 'date', 'eventType', 'vehicle', 'run', 'route', 'timeliness', 'hoursToCreate'];
  const fieldCompleteness = soaeFields.map(field => {
    const filled = soaeData.filter(r => r[field] !== null && r[field] !== undefined && r[field] !== '').length;
    return {
      field,
      filled,
      total: soaeData.length,
      pct: soaeData.length > 0 ? (filled / soaeData.length * 100) : 100
    };
  });

  // Data quality issues
  const issues = [];

  // Check for missing vehicle identifiers
  const missingVehicle = soaeData.filter(r => !r.vehicle && !r.run && !r.route);
  if (missingVehicle.length > 0) {
    issues.push({
      type: 'warning',
      category: 'Missing Identifier',
      count: missingVehicle.length,
      description: 'SOAE records without vehicle, run, or route'
    });
  }

  // Check for duplicate dates/events
  const duplicates = findDuplicates(soaeData);
  if (duplicates.length > 0) {
    issues.push({
      type: 'info',
      category: 'Potential Duplicates',
      count: duplicates.length,
      description: 'Records with same date, vehicle, and event type'
    });
  }

  // Check for future dates
  const today = new Date().toISOString().split('T')[0];
  const futureDates = soaeData.filter(r => r.date && r.date > today);
  if (futureDates.length > 0) {
    issues.push({
      type: 'danger',
      category: 'Future Dates',
      count: futureDates.length,
      description: 'Records with dates in the future'
    });
  }

  // Source coverage metrics
  const sourceCoverage = [
    {
      source: 'Dispatch',
      total: dispatchData.length,
      matched: dispatchData.filter(r => !r.missing).length,
      pct: dispatchData.length > 0 ? (dispatchData.filter(r => !r.missing).length / dispatchData.length * 100) : 100
    },
    {
      source: 'Safety Incidents',
      total: incidentsData.length,
      matched: incidentsData.filter(r => !r.missing).length,
      pct: incidentsData.length > 0 ? (incidentsData.filter(r => !r.missing).length / incidentsData.length * 100) : 100
    },
    {
      source: 'Safety Accidents',
      total: accidentsData.length,
      matched: accidentsData.filter(r => !r.missing).length,
      pct: accidentsData.length > 0 ? (accidentsData.filter(r => !r.missing).length / accidentsData.length * 100) : 100
    },
    {
      source: 'Downed Vehicles',
      total: downedData.length,
      matched: downedData.filter(r => !r.missing).length,
      pct: downedData.length > 0 ? (downedData.filter(r => !r.missing).length / downedData.length * 100) : 100
    }
  ];

  const overallCoverage = sourceCoverage.reduce((sum, s) => sum + s.matched, 0) /
    Math.max(1, sourceCoverage.reduce((sum, s) => sum + s.total, 0)) * 100;

  // Table columns
  const fieldColumns = [
    { key: 'field', label: 'Field' },
    { key: 'filled', label: 'Filled', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    {
      key: 'pct',
      label: 'Complete %',
      align: 'right',
      render: (v) => (
        <span className={v < 90 ? 'text-danger-700 font-medium' : v < 100 ? 'text-warning-700' : 'text-success-700'}>
          {formatPct(v)}
        </span>
      )
    }
  ];

  const coverageColumns = [
    { key: 'source', label: 'Source' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'matched', label: 'Has SOAE', align: 'right' },
    {
      key: 'pct',
      label: 'Coverage',
      align: 'right',
      render: (v) => (
        <StatusBadge
          status={v >= 95 ? 'success' : v >= 80 ? 'warning' : 'danger'}
          text={formatPct(v)}
        />
      )
    }
  ];

  const issueColumns = [
    {
      key: 'type',
      label: 'Severity',
      render: (v) => (
        <StatusBadge
          status={v}
          text={v.charAt(0).toUpperCase() + v.slice(1)}
        />
      )
    },
    { key: 'category', label: 'Category' },
    { key: 'count', label: 'Count', align: 'right' },
    { key: 'description', label: 'Description' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Overall Coverage"
          value={formatPct(overallCoverage)}
          icon={Shield}
          color={overallCoverage >= 95 ? 'green' : overallCoverage >= 80 ? 'yellow' : 'red'}
        />
        <KPICard
          label="SOAE Records"
          value={formatNum(soaeData.length)}
          icon={FileText}
          color="blue"
        />
        <KPICard
          label="Quality Issues"
          value={formatNum(issues.length)}
          icon={issues.length > 0 ? AlertTriangle : CheckCircle}
          color={issues.length > 0 ? 'orange' : 'green'}
        />
        <KPICard
          label="Source Records"
          value={formatNum(sourceCoverage.reduce((s, x) => s + x.total, 0))}
          icon={Database}
          color="cyan"
        />
      </Grid>

      {/* Source Coverage */}
      <Card>
        <SectionHeader
          title="Source Coverage"
          subtitle="SOAE match rate by data source"
          icon={Database}
        />
        <DataTable
          columns={coverageColumns}
          data={sourceCoverage}
          ariaLabel="Source coverage table"
        />
      </Card>

      {/* Field Completeness */}
      <Card>
        <SectionHeader
          title="SOAE Field Completeness"
          subtitle="Data quality by field"
          icon={FileText}
        />
        <DataTable
          columns={fieldColumns}
          data={fieldCompleteness}
          ariaLabel="Field completeness table"
        />
      </Card>

      {/* Quality Issues */}
      <Card>
        <SectionHeader
          title="Data Quality Issues"
          subtitle={issues.length > 0 ? `${issues.length} issues detected` : 'No issues detected'}
          icon={issues.length > 0 ? AlertTriangle : CheckCircle}
          iconBg={issues.length > 0 ? 'bg-warning-100' : 'bg-success-100'}
          iconColor={issues.length > 0 ? 'text-warning-700' : 'text-success-700'}
        />
        {issues.length > 0 ? (
          <DataTable
            columns={issueColumns}
            data={issues}
            ariaLabel="Data quality issues"
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle size={40} className="mx-auto text-success-500 mb-3" />
            <p>No data quality issues detected</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Helper: Find potential duplicate records
function findDuplicates(data) {
  const seen = new Map();
  const duplicates = [];

  data.forEach(record => {
    const key = `${record.date}-${record.vehicle}-${record.eventType}`;
    if (seen.has(key)) {
      duplicates.push(record);
    } else {
      seen.set(key, record);
    }
  });

  return duplicates;
}

export default DataQualityTab;
