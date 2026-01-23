import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { KPICard, SectionHeader, MetricRow, MetricGroup, DataTable } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatNum, getIdentifier } from '../../utils/formatters';

/**
 * LD Breakdown Tab Component
 * Detailed liquidated damages analysis
 */
export function LDBreakdownTab({ data, stats, config }) {
  const ldBase = config?.ldBase || 5000;
  const ldPerDay = config?.ldPerDay || 100;

  const totalLd = (stats?.ldFromLate || 0) + (stats?.ldFromMissing || 0);
  const dailyBurn = (stats?.missingTotal || 0) * ldPerDay;

  // LD by source
  const ldBySource = [
    {
      name: 'Late SOAE',
      value: stats?.ldFromLate || 0,
      color: '#ef4444'
    },
    {
      name: 'Missing Dispatch',
      value: stats?.missingDispatch?.reduce((s, r) => s + (r.ld || 0), 0) || 0,
      color: '#f97316'
    },
    {
      name: 'Missing Incidents',
      value: stats?.missingIncidents?.reduce((s, r) => s + (r.ld || 0), 0) || 0,
      color: '#eab308'
    },
    {
      name: 'Missing Accidents',
      value: stats?.missingAccidents?.reduce((s, r) => s + (r.ld || 0), 0) || 0,
      color: '#22c55e'
    },
    {
      name: 'Missing Downed',
      value: stats?.missingDowned?.reduce((s, r) => s + (r.ld || 0), 0) || 0,
      color: '#06b6d4'
    }
  ].filter(d => d.value > 0);

  // Items with highest LD
  const allMissing = [
    ...(stats?.soaeLateItems || []).map(r => ({ ...r, source: 'Late SOAE' })),
    ...(stats?.missingDispatch || []).map(r => ({ ...r, source: 'Dispatch' })),
    ...(stats?.missingIncidents || []).map(r => ({ ...r, source: 'Incidents' })),
    ...(stats?.missingAccidents || []).map(r => ({ ...r, source: 'Accidents' })),
    ...(stats?.missingDowned || []).map(r => ({ ...r, source: 'Downed' }))
  ].sort((a, b) => (b.ld || 0) - (a.ld || 0));

  const highestLdColumns = [
    { key: 'source', label: 'Source' },
    { key: 'date', label: 'Date' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    { key: 'daysOverdue', label: 'Days Over', align: 'right', render: (v) => v || '-' },
    { key: 'ld', label: 'LD', align: 'right', render: (v) => formatCurrency(v || 0), className: 'text-danger-700 font-bold' }
  ];

  // Projection data (7 day forecast if no action)
  const projectionData = Array.from({ length: 8 }, (_, i) => ({
    day: i === 0 ? 'Today' : `Day ${i}`,
    ld: totalLd + (dailyBurn * i)
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Metrics */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Total LD Exposure"
          value={formatCurrency(totalLd)}
          icon={DollarSign}
          color="red"
        />
        <KPICard
          label="Daily Burn Rate"
          value={formatCurrency(dailyBurn)}
          subValue={`${stats?.missingTotal || 0} items × ${formatCurrency(ldPerDay)}`}
          icon={TrendingUp}
          color="orange"
        />
        <KPICard
          label="From Late SOAE"
          value={formatCurrency(stats?.ldFromLate || 0)}
          subValue={`${stats?.soaeLateCount || 0} late items`}
          icon={Clock}
          color="red"
        />
        <KPICard
          label="From Missing"
          value={formatCurrency(stats?.ldFromMissing || 0)}
          subValue={`${stats?.missingTotal || 0} missing items`}
          icon={AlertTriangle}
          color="orange"
        />
      </Grid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LD by Source Pie */}
        <Card>
          <SectionHeader
            title="LD by Source"
            subtitle="Breakdown of liquidated damages"
            icon={DollarSign}
          />
          <div className="h-48 sm:h-64">
            {ldBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ldBySource}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${formatCurrency(value)}`}
                  >
                    {ldBySource.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No LD exposure
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
            {ldBySource.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </Card>

        {/* 7-Day Projection */}
        <Card>
          <SectionHeader
            title="7-Day Projection"
            subtitle="LD exposure if no action taken"
            icon={TrendingUp}
          />
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="ld" fill="#ef4444" name="Total LD" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* LD Calculation Reference */}
      <Card>
        <SectionHeader
          title="LD Calculation Rules"
          subtitle="24-hour reporting requirement"
          icon={DollarSign}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricGroup title="Base Penalties">
            <MetricRow label="Base LD (first offense)" value={formatCurrency(ldBase)} />
            <MetricRow label="Per day thereafter" value={formatCurrency(ldPerDay)} />
            <MetricRow label="Reporting window" value="24 hours" />
          </MetricGroup>
          <MetricGroup title="Current Exposure">
            <MetricRow label="Late SOAE count" value={formatNum(stats?.soaeLateCount || 0)} />
            <MetricRow label="Missing items" value={formatNum(stats?.missingTotal || 0)} />
            <MetricRow label="Days overdue (avg)" value={allMissing.length > 0 ? (allMissing.reduce((s, r) => s + (r.daysOverdue || 0), 0) / allMissing.length).toFixed(1) : '0'} />
          </MetricGroup>
        </div>
      </Card>

      {/* Highest LD Items */}
      <Card>
        <SectionHeader
          title="Highest LD Items"
          subtitle="Items with largest financial exposure"
          icon={AlertTriangle}
        />
        <DataTable
          columns={highestLdColumns}
          data={allMissing.slice(0, 20)}
          maxRows={20}
          ariaLabel="Items with highest LD exposure"
        />
      </Card>
    </div>
  );
}

export default LDBreakdownTab;
