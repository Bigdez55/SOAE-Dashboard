import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  AlertTriangle, CheckCircle, DollarSign, FileText,
  Clock, TrendingUp, AlertOctagon
} from 'lucide-react';
import { KPICard, SectionHeader, CollapsibleSection, DataTable } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatPct, formatNum, getIdentifier } from '../../utils/formatters';

/**
 * Executive Tab Component
 * High-level summary with key metrics and action items
 */
export function ExecutiveTab({ data, stats, config }) {
  const totalLd = (stats?.ldFromLate || 0) + (stats?.ldFromMissing || 0);
  const dailyBurn = (stats?.missingTotal || 0) * (config?.ldPerDay || 100);

  // Compliance pie chart data
  const complianceData = [
    { name: 'On Time', value: stats?.soaeOnTime || 0, color: '#22c55e' },
    { name: 'Late', value: stats?.soaeLateCount || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Source completeness data
  const sourceData = [
    { name: 'Dispatch', complete: data?.dispatch?.filter(r => !r.missing).length || 0, missing: data?.dispatch?.filter(r => r.missing).length || 0 },
    { name: 'Incidents', complete: data?.incidents?.filter(r => !r.missing).length || 0, missing: data?.incidents?.filter(r => r.missing).length || 0 },
    { name: 'Accidents', complete: data?.accidents?.filter(r => !r.missing).length || 0, missing: data?.accidents?.filter(r => r.missing).length || 0 },
    { name: 'Downed', complete: data?.downed?.filter(r => !r.missing).length || 0, missing: data?.downed?.filter(r => r.missing).length || 0 }
  ];

  // Late SOAE columns
  const lateColumns = [
    { key: 'id', label: 'ID', hideOnMobile: true },
    { key: 'date', label: 'Date' },
    { key: 'eventType', label: 'Type', render: (v) => v || '-' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    { key: 'hoursToCreate', label: 'Hours', align: 'right', render: (v) => v?.toFixed(1) || '-' },
    { key: 'ld', label: 'LD', align: 'right', render: (v) => v > 0 ? formatCurrency(v) : '-', className: 'text-danger-700 font-medium' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Critical Alert Banner */}
      {totalLd > 0 && (
        <Card className="bg-gradient-to-r from-danger-600 to-danger-500 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertOctagon size={24} className="flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">LD Exposure Alert</p>
                <p className="text-danger-100 text-sm">
                  {stats?.missingTotal || 0} missing items accruing {formatCurrency(dailyBurn)}/day
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(totalLd)}</p>
              <p className="text-danger-100 text-sm">Total LD Exposure</p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <Grid cols="6" gap="3">
        <KPICard
          label="Total SOAE"
          value={formatNum(stats?.soaeTotal || 0)}
          icon={FileText}
          color="blue"
        />
        <KPICard
          label="On Time"
          value={formatPct(stats?.soaeOnTimePct || 0)}
          subValue={`${stats?.soaeOnTime || 0} of ${stats?.soaeTotal || 0}`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          label="Late"
          value={formatNum(stats?.soaeLateCount || 0)}
          subValue={formatCurrency(stats?.ldFromLate || 0)}
          icon={Clock}
          color="red"
        />
        <KPICard
          label="Missing"
          value={formatNum(stats?.missingTotal || 0)}
          subValue={formatCurrency(stats?.ldFromMissing || 0)}
          icon={AlertTriangle}
          color="orange"
        />
        <KPICard
          label="Total LD"
          value={formatCurrency(totalLd)}
          subValue={`${formatCurrency(dailyBurn)}/day`}
          icon={DollarSign}
          color="red"
        />
        <KPICard
          label="Needs Review"
          value={formatNum(stats?.needsReviewTotal || 0)}
          icon={TrendingUp}
          color="yellow"
        />
      </Grid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance Pie Chart */}
        <Card>
          <SectionHeader
            title="SOAE Compliance"
            subtitle="On-time vs late submissions"
            icon={CheckCircle}
          />
          <div className="h-48 sm:h-64">
            {complianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNum(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Source Completeness */}
        <Card>
          <SectionHeader
            title="Source Completeness"
            subtitle="SOAE coverage by data source"
            icon={TrendingUp}
          />
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="complete" stackId="a" fill="#22c55e" name="Has SOAE" />
                <Bar dataKey="missing" stackId="a" fill="#ef4444" name="Missing" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <SectionHeader
          title="Priority Action Items"
          subtitle="Items requiring immediate attention"
          icon={AlertOctagon}
        />

        <div className="space-y-3">
          {/* Late SOAE */}
          <CollapsibleSection
            title="Late SOAE Submissions"
            count={stats?.soaeLateItems?.length || 0}
            ld={stats?.ldFromLate || 0}
            defaultOpen={stats?.soaeLateItems?.length > 0}
          >
            <DataTable
              columns={lateColumns}
              data={stats?.soaeLateItems || []}
              maxRows={10}
              ariaLabel="Late SOAE submissions"
            />
          </CollapsibleSection>

          {/* Missing from Dispatch */}
          <CollapsibleSection
            title="Missing from Dispatch"
            count={stats?.missingDispatch?.length || 0}
            ld={stats?.missingDispatch?.reduce((s, r) => s + (r.ld || 0), 0) || 0}
          >
            <DataTable
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'category', label: 'Category' },
                { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
                { key: 'daysOverdue', label: 'Days', align: 'right' },
                { key: 'ld', label: 'LD', align: 'right', render: (v) => formatCurrency(v || 0), className: 'text-danger-700 font-medium' }
              ]}
              data={stats?.missingDispatch || []}
              maxRows={10}
              ariaLabel="Missing SOAE from dispatch"
            />
          </CollapsibleSection>

          {/* Missing from Incidents */}
          <CollapsibleSection
            title="Missing from Safety Incidents"
            count={stats?.missingIncidents?.length || 0}
            ld={stats?.missingIncidents?.reduce((s, r) => s + (r.ld || 0), 0) || 0}
          >
            <DataTable
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'incidentType', label: 'Type' },
                { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
                { key: 'daysOverdue', label: 'Days', align: 'right' },
                { key: 'ld', label: 'LD', align: 'right', render: (v) => formatCurrency(v || 0), className: 'text-danger-700 font-medium' }
              ]}
              data={stats?.missingIncidents || []}
              maxRows={10}
              ariaLabel="Missing SOAE from safety incidents"
            />
          </CollapsibleSection>
        </div>
      </Card>
    </div>
  );
}

export default ExecutiveTab;
