import React from 'react';
import { Database, CheckCircle, AlertTriangle, Zap, Shield, Truck, AlertOctagon } from 'lucide-react';
import { KPICard, SectionHeader, CollapsibleSection, DataTable, StatusBadge } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatPct, formatNum, getIdentifier } from '../../utils/formatters';

/**
 * Sources Tab Component
 * SOAE completeness by data source
 */
export function SourcesTab({ data, stats }) {
  // Calculate source metrics
  const dispatchTotal = data?.dispatch?.length || 0;
  const dispatchMatched = data?.dispatch?.filter(r => !r.missing).length || 0;
  const dispatchMissing = data?.dispatch?.filter(r => r.missing).length || 0;

  const incidentsTotal = data?.incidents?.length || 0;
  const incidentsMatched = data?.incidents?.filter(r => !r.missing).length || 0;
  const incidentsMissing = data?.incidents?.filter(r => r.missing).length || 0;

  const accidentsTotal = data?.accidents?.length || 0;
  const accidentsMatched = data?.accidents?.filter(r => !r.missing).length || 0;
  const accidentsMissing = data?.accidents?.filter(r => r.missing).length || 0;

  const downedTotal = data?.downed?.length || 0;
  const downedMatched = data?.downed?.filter(r => !r.missing).length || 0;
  const downedMissing = data?.downed?.filter(r => r.missing).length || 0;

  const sourceMetrics = [
    {
      name: 'Dispatch',
      icon: Zap,
      total: dispatchTotal,
      matched: dispatchMatched,
      missing: dispatchMissing,
      pct: dispatchTotal > 0 ? (dispatchMatched / dispatchTotal * 100) : 100,
      color: dispatchMissing > 0 ? 'orange' : 'green',
      data: data?.dispatch || []
    },
    {
      name: 'Safety Incidents',
      icon: Shield,
      total: incidentsTotal,
      matched: incidentsMatched,
      missing: incidentsMissing,
      pct: incidentsTotal > 0 ? (incidentsMatched / incidentsTotal * 100) : 100,
      color: incidentsMissing > 0 ? 'orange' : 'green',
      data: data?.incidents || []
    },
    {
      name: 'Safety Accidents',
      icon: AlertOctagon,
      total: accidentsTotal,
      matched: accidentsMatched,
      missing: accidentsMissing,
      pct: accidentsTotal > 0 ? (accidentsMatched / accidentsTotal * 100) : 100,
      color: accidentsMissing > 0 ? 'orange' : 'green',
      data: data?.accidents || []
    },
    {
      name: 'Downed Vehicles',
      icon: Truck,
      total: downedTotal,
      matched: downedMatched,
      missing: downedMissing,
      pct: downedTotal > 0 ? (downedMatched / downedTotal * 100) : 100,
      color: downedMissing > 0 ? 'orange' : 'green',
      data: data?.downed || []
    }
  ];

  // Common columns for missing items
  const missingColumns = [
    { key: 'date', label: 'Date' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    {
      key: 'category',
      label: 'Category',
      render: (v, row) => {
        const base = v || row.incidentType || row.comment || '-';
        const accidentInfo = row.accidentClass ? ` · ${row.accidentClass}` : '';
        const riskInfo = row.riskPerspective ? ` · ${row.riskPerspective}` : '';
        return `${base}${accidentInfo}${riskInfo}`;
      }
    },
    { key: 'daysOverdue', label: 'Days', align: 'right' },
    {
      key: 'ld',
      label: 'LD',
      align: 'right',
      render: (v) => formatCurrency(v || 0),
      className: 'text-danger-700 font-medium'
    }
  ];

  // Matched columns
  const matchedColumns = [
    { key: 'date', label: 'Date' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    {
      key: 'category',
      label: 'Category',
      render: (v, row) => {
        const base = v || row.incidentType || row.comment || '-';
        const accidentInfo = row.accidentClass ? ` · ${row.accidentClass}` : '';
        const riskInfo = row.riskPerspective ? ` · ${row.riskPerspective}` : '';
        return `${base}${accidentInfo}${riskInfo}`;
      }
    },
    {
      key: 'missing',
      label: 'Status',
      render: (v) => (
        <StatusBadge
          status={v ? 'missing' : 'matched'}
          text={v ? 'Missing' : 'Has SOAE'}
        />
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Source Overview Cards */}
      <Grid cols="4" gap="3">
        {sourceMetrics.map((source) => (
          <KPICard
            key={source.name}
            label={source.name}
            value={formatPct(source.pct)}
            subValue={`${source.matched}/${source.total} matched`}
            icon={source.icon}
            color={source.color}
          />
        ))}
      </Grid>

      {/* Detailed Source Sections */}
      {sourceMetrics.map((source) => (
        <Card key={source.name}>
          <SectionHeader
            title={source.name}
            subtitle={`${source.total} total events, ${source.missing} missing SOAE`}
            icon={source.icon}
            iconBg={source.missing > 0 ? 'bg-warning-100' : 'bg-success-100'}
            iconColor={source.missing > 0 ? 'text-warning-700' : 'text-success-700'}
          />

          <div className="space-y-3">
            {/* Missing Items */}
            {source.missing > 0 && (
              <CollapsibleSection
                title="Missing SOAE"
                count={source.missing}
                ld={source.data.filter(r => r.missing).reduce((s, r) => s + (r.ld || 0), 0)}
                defaultOpen={source.missing > 0 && source.missing <= 10}
              >
                <DataTable
                  columns={missingColumns}
                  data={source.data.filter(r => r.missing)}
                  maxRows={15}
                  ariaLabel={`Missing SOAE from ${source.name}`}
                />
              </CollapsibleSection>
            )}

            {/* Matched Items */}
            <CollapsibleSection
              title="Has SOAE"
              count={source.matched}
            >
              <DataTable
                columns={matchedColumns}
                data={source.data.filter(r => !r.missing)}
                maxRows={15}
                ariaLabel={`Matched SOAE from ${source.name}`}
              />
            </CollapsibleSection>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default SourcesTab;
