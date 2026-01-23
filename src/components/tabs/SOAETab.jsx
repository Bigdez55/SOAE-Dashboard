import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { KPICard, SectionHeader, DataTable, StatusBadge } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatPct, formatNum, getIdentifier } from '../../utils/formatters';

/**
 * SOAE Tab Component
 * Detailed SOAE analysis and timeliness breakdown
 */
export function SOAETab({ data, stats }) {
  const soaeData = data?.soae || [];

  // Group by timeliness for distribution
  const timelinessGroups = soaeData.reduce((acc, item) => {
    const hours = item.hoursToCreate || 0;
    let bucket;
    if (hours <= 4) bucket = '0-4h';
    else if (hours <= 8) bucket = '4-8h';
    else if (hours <= 12) bucket = '8-12h';
    else if (hours <= 24) bucket = '12-24h';
    else if (hours <= 48) bucket = '24-48h';
    else bucket = '48h+';

    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});

  const distributionData = [
    { range: '0-4h', count: timelinessGroups['0-4h'] || 0, fill: '#22c55e' },
    { range: '4-8h', count: timelinessGroups['4-8h'] || 0, fill: '#22c55e' },
    { range: '8-12h', count: timelinessGroups['8-12h'] || 0, fill: '#22c55e' },
    { range: '12-24h', count: timelinessGroups['12-24h'] || 0, fill: '#f59e0b' },
    { range: '24-48h', count: timelinessGroups['24-48h'] || 0, fill: '#ef4444' },
    { range: '48h+', count: timelinessGroups['48h+'] || 0, fill: '#b91c1c' }
  ];

  // Group by event type
  const byEventType = soaeData.reduce((acc, item) => {
    const type = item.eventType || 'Unknown';
    if (!acc[type]) acc[type] = { total: 0, late: 0, ld: 0 };
    acc[type].total++;
    if (item.timeliness === 'Late') {
      acc[type].late++;
      acc[type].ld += item.ld || 0;
    }
    return acc;
  }, {});

  const eventTypeData = Object.entries(byEventType)
    .map(([type, data]) => ({
      type,
      ...data,
      onTimePct: data.total > 0 ? ((data.total - data.late) / data.total * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  // Table columns
  const soaeColumns = [
    { key: 'id', label: 'ID', hideOnMobile: true },
    { key: 'date', label: 'Date' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    {
      key: 'timeliness',
      label: 'Status',
      render: (v) => (
        <StatusBadge
          status={v === 'Late' ? 'late' : 'ontime'}
          text={v}
        />
      )
    },
    {
      key: 'hoursToCreate',
      label: 'Hours',
      align: 'right',
      render: (v) => v?.toFixed(1) || '-'
    },
    {
      key: 'ld',
      label: 'LD',
      align: 'right',
      render: (v) => v > 0 ? formatCurrency(v) : '-',
      className: 'text-danger-700 font-medium'
    }
  ];

  const eventTypeColumns = [
    { key: 'type', label: 'Event Type' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'late', label: 'Late', align: 'right', className: 'text-danger-700' },
    {
      key: 'onTimePct',
      label: 'On Time %',
      align: 'right',
      render: (v) => formatPct(v)
    },
    {
      key: 'ld',
      label: 'LD',
      align: 'right',
      render: (v) => formatCurrency(v),
      className: 'text-danger-700 font-medium'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Metrics */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Total SOAE"
          value={formatNum(stats?.soaeTotal || 0)}
          icon={FileText}
          color="blue"
        />
        <KPICard
          label="On Time"
          value={formatNum(stats?.soaeOnTime || 0)}
          subValue={formatPct(stats?.soaeOnTimePct || 0)}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          label="Late"
          value={formatNum(stats?.soaeLateCount || 0)}
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          label="LD from Late"
          value={formatCurrency(stats?.ldFromLate || 0)}
          icon={Clock}
          color="red"
        />
      </Grid>

      {/* Hours Distribution Chart */}
      <Card>
        <SectionHeader
          title="Time to Create Distribution"
          subtitle="Hours from event to SOAE creation"
          icon={Clock}
        />
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatNum(value)} />
              <Bar dataKey="count" name="Count">
                {distributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-success-500" /> On Time (≤24h)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-warning-500" /> At Risk (12-24h)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-danger-500" /> Late (&gt;24h)
          </span>
        </div>
      </Card>

      {/* By Event Type */}
      <Card>
        <SectionHeader
          title="By Event Type"
          subtitle="SOAE timeliness breakdown by event category"
          icon={FileText}
        />
        <DataTable
          columns={eventTypeColumns}
          data={eventTypeData}
          maxRows={15}
          ariaLabel="SOAE by event type"
        />
      </Card>

      {/* All SOAE Table */}
      <Card>
        <SectionHeader
          title="All SOAE Records"
          subtitle={`${soaeData.length} total records`}
          icon={FileText}
        />
        <DataTable
          columns={soaeColumns}
          data={soaeData}
          maxRows={20}
          ariaLabel="All SOAE records"
        />
      </Card>
    </div>
  );
}

export default SOAETab;
