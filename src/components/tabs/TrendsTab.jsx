import React from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { KPICard, SectionHeader, DataTable } from '../common';
import { Card, Grid } from '../layout';
import { formatCurrency, formatNum, formatPct, getMonthName } from '../../utils/formatters';

/**
 * Trends Tab Component
 * Time-series analysis and trend visualization
 */
export function TrendsTab({ data, stats, trends }) {
  const soaeData = data?.soae || [];
  const dailyTrends = trends?.daily || [];
  const monthlyTrends = trends?.monthly || [];

  // Calculate daily stats if not provided
  const dailyStats = dailyTrends.length > 0 ? dailyTrends : calculateDailyStats(soaeData);

  // Calculate monthly stats if not provided
  const monthlyStats = monthlyTrends.length > 0 ? monthlyTrends : calculateMonthlyStats(soaeData);

  // Trend calculations
  const currentMonth = monthlyStats[monthlyStats.length - 1] || {};
  const prevMonth = monthlyStats[monthlyStats.length - 2] || {};

  const volumeTrend = prevMonth.total > 0
    ? ((currentMonth.total - prevMonth.total) / prevMonth.total * 100)
    : 0;

  const complianceTrend = prevMonth.onTimePct
    ? (currentMonth.onTimePct - prevMonth.onTimePct)
    : 0;

  // Monthly columns
  const monthlyColumns = [
    { key: 'month', label: 'Month', render: (v) => getMonthName(v) },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'onTime', label: 'On Time', align: 'right' },
    { key: 'late', label: 'Late', align: 'right', className: 'text-danger-700' },
    { key: 'onTimePct', label: 'On Time %', align: 'right', render: (v) => formatPct(v || 0) },
    { key: 'ld', label: 'LD', align: 'right', render: (v) => formatCurrency(v || 0) }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Trend Summary */}
      <Grid cols="4" gap="3">
        <KPICard
          label="Volume Trend"
          value={`${volumeTrend > 0 ? '+' : ''}${volumeTrend.toFixed(1)}%`}
          subValue="vs. previous month"
          icon={volumeTrend >= 0 ? TrendingUp : TrendingDown}
          color={volumeTrend > 10 ? 'red' : volumeTrend < -10 ? 'green' : 'blue'}
        />
        <KPICard
          label="Compliance Trend"
          value={`${complianceTrend > 0 ? '+' : ''}${complianceTrend.toFixed(1)}%`}
          subValue="on-time rate change"
          icon={complianceTrend >= 0 ? TrendingUp : TrendingDown}
          color={complianceTrend >= 0 ? 'green' : 'red'}
        />
        <KPICard
          label="This Month"
          value={formatNum(currentMonth.total || 0)}
          subValue={`${formatPct(currentMonth.onTimePct || 0)} on time`}
          icon={Calendar}
          color="blue"
        />
        <KPICard
          label="Monthly LD"
          value={formatCurrency(currentMonth.ld || 0)}
          icon={DollarSign}
          color={currentMonth.ld > 0 ? 'red' : 'green'}
        />
      </Grid>

      {/* Daily Trend Chart */}
      {dailyStats.length > 0 && (
        <Card>
          <SectionHeader
            title="Daily Volume"
            subtitle="SOAE submissions per day"
            icon={TrendingUp}
          />
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="onTime"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  name="On Time"
                />
                <Area
                  type="monotone"
                  dataKey="late"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  name="Late"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Monthly Compliance Trend */}
      {monthlyStats.length > 0 && (
        <Card>
          <SectionHeader
            title="Monthly Compliance"
            subtitle="On-time rate over time"
            icon={TrendingUp}
          />
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => getMonthName(v).split(' ')[0]}
                />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => formatPct(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="onTimePct"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="On Time %"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Cumulative LD */}
      {monthlyStats.length > 0 && (
        <Card>
          <SectionHeader
            title="Cumulative LD Exposure"
            subtitle="Total liquidated damages over time"
            icon={DollarSign}
          />
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats.map((m, i, arr) => ({
                ...m,
                cumulative: arr.slice(0, i + 1).reduce((s, x) => s + (x.ld || 0), 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => getMonthName(v).split(' ')[0]}
                />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#ef4444"
                  fill="#fee2e2"
                  name="Cumulative LD"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Monthly Summary Table */}
      {monthlyStats.length > 0 && (
        <Card>
          <SectionHeader
            title="Monthly Summary"
            subtitle="Detailed breakdown by month"
            icon={Calendar}
          />
          <DataTable
            columns={monthlyColumns}
            data={[...monthlyStats].reverse()}
            maxRows={12}
            ariaLabel="Monthly SOAE summary"
          />
        </Card>
      )}
    </div>
  );
}

// Helper: Calculate daily stats from raw SOAE data
function calculateDailyStats(soaeData) {
  const byDate = soaeData.reduce((acc, item) => {
    const date = item.date;
    if (!date) return acc;
    if (!acc[date]) acc[date] = { date, total: 0, onTime: 0, late: 0, ld: 0 };
    acc[date].total++;
    if (item.timeliness === 'Late') {
      acc[date].late++;
      acc[date].ld += item.ld || 0;
    } else {
      acc[date].onTime++;
    }
    return acc;
  }, {});

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

// Helper: Calculate monthly stats from raw SOAE data
function calculateMonthlyStats(soaeData) {
  const byMonth = soaeData.reduce((acc, item) => {
    const month = item.yearMonth;
    if (!month) return acc;
    if (!acc[month]) acc[month] = { month, total: 0, onTime: 0, late: 0, ld: 0 };
    acc[month].total++;
    if (item.timeliness === 'Late') {
      acc[month].late++;
      acc[month].ld += item.ld || 0;
    } else {
      acc[month].onTime++;
    }
    return acc;
  }, {});

  return Object.values(byMonth)
    .map(m => ({
      ...m,
      onTimePct: m.total > 0 ? (m.onTime / m.total * 100) : 100
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export default TrendsTab;
