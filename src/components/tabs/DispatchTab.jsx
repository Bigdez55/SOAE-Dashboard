import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Zap, AlertTriangle, CheckCircle, Flag, Eye } from 'lucide-react';
import { KPICard, SectionHeader, CollapsibleSection, DataTable, StatusBadge } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatPct, formatNum, getIdentifier } from '../../utils/formatters';

/**
 * Dispatch Tab Component
 * Dispatch event analysis and category breakdown
 */
export function DispatchTab({ data, stats, config }) {
  const dispatchData = data?.dispatch || [];
  const redFlagCategories = config?.redFlagCategories || [];
  const reviewCategories = config?.reviewCategories || [];

  // Calculate metrics
  const total = dispatchData.length;
  const matched = dispatchData.filter(r => !r.missing).length;
  const missing = dispatchData.filter(r => r.missing).length;
  const needsReview = dispatchData.filter(r => r.needsReview).length;
  const redFlags = dispatchData.filter(r => redFlagCategories.includes(r.category)).length;

  // Group by category
  const byCategory = dispatchData.reduce((acc, item) => {
    const cat = item.category || 'Unknown';
    if (!acc[cat]) {
      acc[cat] = {
        total: 0,
        missing: 0,
        ld: 0,
        isRedFlag: redFlagCategories.includes(cat),
        needsReview: reviewCategories.includes(cat)
      };
    }
    acc[cat].total++;
    if (item.missing) {
      acc[cat].missing++;
      acc[cat].ld += item.ld || 0;
    }
    return acc;
  }, {});

  const categoryData = Object.entries(byCategory)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);

  // Chart data
  const chartData = categoryData.slice(0, 10).map(c => ({
    name: c.category.length > 15 ? c.category.substring(0, 15) + '...' : c.category,
    matched: c.total - c.missing,
    missing: c.missing
  }));

  // Table columns
  const categoryColumns = [
    {
      key: 'category',
      label: 'Category',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span>{v}</span>
          {row.isRedFlag && (
            <Flag size={14} className="text-danger-500" title="Red Flag" />
          )}
          {row.needsReview && (
            <Eye size={14} className="text-warning-500" title="Needs Review" />
          )}
        </div>
      )
    },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'missing', label: 'Missing', align: 'right', className: 'text-danger-700' },
    {
      key: 'pct',
      label: 'Complete %',
      align: 'right',
      render: (_, row) => formatPct(row.total > 0 ? ((row.total - row.missing) / row.total * 100) : 100)
    },
    {
      key: 'ld',
      label: 'LD',
      align: 'right',
      render: (v) => formatCurrency(v || 0),
      className: 'text-danger-700 font-medium'
    }
  ];

  const dispatchColumns = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'vehicle', label: 'Vehicle', render: (_, row) => getIdentifier(row) },
    {
      key: 'missing',
      label: 'Status',
      render: (v, row) => (
        <StatusBadge
          status={v ? 'missing' : row.needsReview ? 'review' : 'matched'}
          text={v ? 'Missing' : row.needsReview ? 'Review' : 'OK'}
        />
      )
    },
    { key: 'daysOverdue', label: 'Days', align: 'right', render: (v) => v || '-' },
    {
      key: 'ld',
      label: 'LD',
      align: 'right',
      render: (v) => v > 0 ? formatCurrency(v) : '-',
      className: 'text-danger-700 font-medium'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Metrics */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Total Dispatch"
          value={formatNum(total)}
          icon={Zap}
          color="blue"
        />
        <KPICard
          label="Has SOAE"
          value={formatPct(total > 0 ? (matched / total * 100) : 100)}
          subValue={`${matched} of ${total}`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          label="Missing SOAE"
          value={formatNum(missing)}
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          label="Needs Review"
          value={formatNum(needsReview)}
          icon={Eye}
          color="yellow"
        />
      </Grid>

      {/* Category Chart */}
      <Card>
        <SectionHeader
          title="By Category"
          subtitle="Top 10 dispatch categories"
          icon={Zap}
        />
        <div className="h-48 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="matched" stackId="a" fill="#22c55e" name="Has SOAE" />
              <Bar dataKey="missing" stackId="a" fill="#ef4444" name="Missing" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Breakdown Table */}
      <Card>
        <SectionHeader
          title="Category Breakdown"
          subtitle="All dispatch categories with SOAE status"
          icon={Zap}
        />
        <DataTable
          columns={categoryColumns}
          data={categoryData}
          maxRows={20}
          ariaLabel="Dispatch categories"
        />
      </Card>

      {/* Red Flag Events */}
      {redFlags > 0 && (
        <Card>
          <SectionHeader
            title="Red Flag Events"
            subtitle="Critical events requiring SOAE"
            icon={Flag}
            iconBg="bg-danger-100"
            iconColor="text-danger-700"
          />
          <DataTable
            columns={dispatchColumns}
            data={dispatchData.filter(r => redFlagCategories.includes(r.category))}
            maxRows={20}
            ariaLabel="Red flag dispatch events"
          />
        </Card>
      )}

      {/* Needs Review */}
      {needsReview > 0 && (
        <Card>
          <SectionHeader
            title="Needs Review"
            subtitle="Events requiring manual review"
            icon={Eye}
            iconBg="bg-warning-100"
            iconColor="text-warning-700"
          />
          <DataTable
            columns={dispatchColumns}
            data={dispatchData.filter(r => r.needsReview)}
            maxRows={20}
            ariaLabel="Events needing review"
          />
        </Card>
      )}
    </div>
  );
}

export default DispatchTab;
